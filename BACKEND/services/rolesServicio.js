'use strict';

/**
 * Servicio de roles y permisos de modulo (RF-ROL-01..07).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Rol = require('../models/Rol');
const rolesRepositorio = require('../repositories/rolesRepositorio');
const modulosRepositorio = require('../repositories/modulosRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');

async function listarRoles(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await rolesRepositorio.listar({
    nombre: consulta.nombre,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) =>
      new Rol({
        idRol: fila.id_rol,
        nombreRol: fila.nombre_rol,
        descripcion: fila.descripcion,
        estadoRol: fila.estado_rol,
        fechaCreacion: fila.fecha_creacion,
        fechaModificacion: fila.fecha_modificacion
      }).aJSON()
    ),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerRol(idRol) {
  const fila = await rolesRepositorio.obtenerPorId(idRol);
  if (!fila) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }
  const rol = new Rol({
    idRol: fila.id_rol,
    nombreRol: fila.nombre_rol,
    descripcion: fila.descripcion,
    estadoRol: fila.estado_rol,
    fechaCreacion: fila.fecha_creacion,
    fechaModificacion: fila.fecha_modificacion
  });
  const modulos = await rolesRepositorio.listarModulosDeRol(idRol);
  return { ...rol.aJSON(), modulos: modulos.map((m) => ({ idModulo: m.id_modulo, nombreModulo: m.nombre_modulo })) };
}

async function crearRol(datos, contexto) {
  if (await rolesRepositorio.obtenerPorNombre(datos.nombreRol)) {
    throw ErrorApi.conflicto('Ya existe un rol con ese nombre');
  }

  const idRol = await rolesRepositorio.crear({
    nombreRol: datos.nombreRol,
    descripcion: datos.descripcion,
    estadoRol: datos.estadoRol
  });

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles',
    idRegistro: idRol,
    accion: 'Creacion',
    descripcion: `Rol ${datos.nombreRol} creado`
  });

  return { idRol };
}

async function actualizarRol(idRol, datos, contexto) {
  const fila = await rolesRepositorio.obtenerPorId(idRol);
  if (!fila) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }

  const existente = await rolesRepositorio.obtenerPorNombre(datos.nombreRol);
  if (existente && Number(existente.id_rol) !== Number(idRol)) {
    throw ErrorApi.conflicto('Ya existe otro rol con ese nombre');
  }

  await rolesRepositorio.actualizar(idRol, {
    nombreRol: datos.nombreRol,
    descripcion: datos.descripcion,
    estadoRol: datos.estadoRol
  });

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles',
    idRegistro: idRol,
    accion: 'Actualizacion',
    descripcion: `Rol ${datos.nombreRol} actualizado`
  });

  return { mensaje: 'Rol actualizado correctamente' };
}

async function cambiarEstadoRol(idRol, estadoRol, contexto) {
  const fila = await rolesRepositorio.obtenerPorId(idRol);
  if (!fila) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }

  if (estadoRol === 'Inactivo') {
    const usuariosActivos = await rolesRepositorio.contarUsuariosActivos(idRol);
    if (usuariosActivos > 0) {
      throw ErrorApi.reglaNegocio('No se puede inactivar un rol con usuarios activos asignados', [
        { campo: 'estadoRol', mensaje: `El rol tiene ${usuariosActivos} usuario(s) activo(s)` }
      ]);
    }
  }

  await rolesRepositorio.cambiarEstado(idRol, estadoRol);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles',
    idRegistro: idRol,
    accion: 'Cambio de estado',
    descripcion: `Rol ${fila.nombre_rol} marcado como ${estadoRol}`
  });

  return { mensaje: `Rol marcado como ${estadoRol}` };
}

async function listarModulosDeRol(idRol) {
  const fila = await rolesRepositorio.obtenerPorId(idRol);
  if (!fila) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }
  const modulos = await rolesRepositorio.listarModulosDeRol(idRol);
  return modulos.map((m) => ({
    idModulo: m.id_modulo,
    nombreModulo: m.nombre_modulo,
    descripcion: m.descripcion,
    estadoModulo: m.estado_modulo,
    fechaAsignacion: m.fecha_asignacion
  }));
}

async function asignarModulo(idRol, idModulo, contexto) {
  const rol = await rolesRepositorio.obtenerPorId(idRol);
  if (!rol) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }

  const modulo = await modulosRepositorio.obtenerPorId(idModulo);
  if (!modulo) {
    throw ErrorApi.noEncontrado('El modulo solicitado no existe');
  }

  if (await rolesRepositorio.tieneModulo(idRol, idModulo)) {
    throw ErrorApi.conflicto('El rol ya tiene asignado ese modulo');
  }

  await rolesRepositorio.asignarModulo(idRol, idModulo);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles_modulos',
    idRegistro: idRol,
    accion: 'Asignacion de modulo',
    descripcion: `Modulo ${modulo.nombre_modulo} asignado al rol ${rol.nombre_rol}`
  });

  return { mensaje: 'Modulo asignado al rol correctamente' };
}

async function quitarModulo(idRol, idModulo, contexto) {
  const rol = await rolesRepositorio.obtenerPorId(idRol);
  if (!rol) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }

  const filasAfectadas = await rolesRepositorio.quitarModulo(idRol, idModulo);
  if (filasAfectadas === 0) {
    throw ErrorApi.noEncontrado('El rol no tiene asignado ese modulo');
  }

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles_modulos',
    idRegistro: idRol,
    accion: 'Retiro de modulo',
    descripcion: `Modulo ${idModulo} retirado del rol ${rol.nombre_rol}`
  });

  return { mensaje: 'Modulo retirado del rol correctamente' };
}

module.exports = {
  listarRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  cambiarEstadoRol,
  listarModulosDeRol,
  asignarModulo,
  quitarModulo
};
