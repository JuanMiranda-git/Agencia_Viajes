'use strict';

/**
 * Servicio de gestion de usuarios (RF-USR-01..06).
 */

const ErrorApi = require('../utils/ErrorApi');
const { hashearClave } = require('../utils/claves');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Usuario = require('../models/Usuario');
const usuariosRepositorio = require('../repositories/usuariosRepositorio');
const rolesRepositorio = require('../repositories/rolesRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');
const { ejecutarTransaccion } = require('../config/baseDatos');

async function listarUsuarios(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await usuariosRepositorio.listar({
    nombre: consulta.nombre,
    correo: consulta.correo,
    estado: consulta.estado,
    documento: consulta.documento,
    idRol: consulta.idRol,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => new Usuario(fila).aJSON()),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerUsuario(idUsuario) {
  const fila = await usuariosRepositorio.obtenerPorId(idUsuario);
  if (!fila) {
    throw ErrorApi.noEncontrado('El usuario solicitado no existe');
  }
  return new Usuario(fila).aJSON();
}

async function crearUsuario(datos, contexto) {
  const rol = await rolesRepositorio.obtenerPorId(datos.idRol);
  if (!rol) {
    throw ErrorApi.solicitudInvalida('El rol indicado no existe', [{ campo: 'idRol', mensaje: 'Rol inexistente' }]);
  }
  if (rol.estado_rol !== 'Activo') {
    throw ErrorApi.reglaNegocio('No se puede asignar un rol inactivo');
  }

  if (await usuariosRepositorio.existeEmail(datos.email)) {
    throw ErrorApi.conflicto('Ya existe un usuario con ese correo electronico');
  }
  if (await usuariosRepositorio.existeDocumento(datos.documento)) {
    throw ErrorApi.conflicto('Ya existe un usuario con ese documento');
  }

  const hash = await hashearClave(datos.contrasena);

  return ejecutarTransaccion(async (conexion) => {
    const idUsuario = await usuariosRepositorio.crear(
      {
        nombreUsuario: datos.nombreUsuario,
        email: datos.email,
        contrasena: hash,
        documento: datos.documento,
        telefono: datos.telefono,
        idRol: datos.idRol,
        proveedoresIdProveedor: datos.proveedoresIdProveedor
      },
      conexion
    );

    await bitacoraRepositorio.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'usuarios',
        idRegistro: idUsuario,
        accion: 'Creacion',
        descripcion: `Usuario ${datos.email} creado con rol ${rol.nombre_rol}`
      },
      conexion
    );

    return { idUsuario };
  });
}

async function actualizarUsuario(idUsuario, datos, contexto) {
  const fila = await usuariosRepositorio.obtenerPorId(idUsuario);
  if (!fila) {
    throw ErrorApi.noEncontrado('El usuario solicitado no existe');
  }

  if (datos.idRol !== fila.id_rol) {
    const rol = await rolesRepositorio.obtenerPorId(datos.idRol);
    if (!rol) {
      throw ErrorApi.solicitudInvalida('El rol indicado no existe', [{ campo: 'idRol', mensaje: 'Rol inexistente' }]);
    }
    if (rol.estado_rol !== 'Activo') {
      throw ErrorApi.reglaNegocio('No se puede asignar un rol inactivo');
    }
  }

  await usuariosRepositorio.actualizar(idUsuario, {
    nombreUsuario: datos.nombreUsuario,
    telefono: datos.telefono,
    idRol: datos.idRol
  });

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'usuarios',
    idRegistro: idUsuario,
    accion: 'Actualizacion',
    descripcion: `Usuario ${fila.email} actualizado`
  });

  return { mensaje: 'Usuario actualizado correctamente' };
}

async function cambiarEstadoUsuario(idUsuario, estadoUsuario, contexto) {
  const fila = await usuariosRepositorio.obtenerPorId(idUsuario);
  if (!fila) {
    throw ErrorApi.noEncontrado('El usuario solicitado no existe');
  }

  if (Number(idUsuario) === Number(contexto.idUsuario)) {
    throw ErrorApi.reglaNegocio('No puede cambiar el estado de su propio usuario');
  }

  if (estadoUsuario === 'Inactivo' && fila.nombre_rol === 'Administrador') {
    const administradoresActivos = await rolesRepositorio.contarUsuariosActivos(fila.id_rol);
    if (administradoresActivos <= 1) {
      throw ErrorApi.reglaNegocio('No se puede inactivar al ultimo administrador activo del sistema');
    }
  }

  await usuariosRepositorio.cambiarEstado(idUsuario, estadoUsuario);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'usuarios',
    idRegistro: idUsuario,
    accion: 'Cambio de estado',
    descripcion: `Usuario ${fila.email} marcado como ${estadoUsuario}`
  });

  return { mensaje: `Usuario marcado como ${estadoUsuario}` };
}

module.exports = { listarUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, cambiarEstadoUsuario };
