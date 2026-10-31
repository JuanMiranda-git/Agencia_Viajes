'use strict';

/**
 * Servicio de gestion de usuarios (RF-USR-01..06).
 */

const AppError = require('../utils/AppError');
const { hashearClave } = require('../utils/claves');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Usuario = require('../models/Usuario');
const rolesService = require('./roles.service');
const bitacoraService = require('./bitacora.service');
const { pool, conTransaccion } = require('../config/database');

async function listarUsuarios(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
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
  const fila = await obtenerPorId(idUsuario);
  if (!fila) {
    throw AppError.noEncontrado('El usuario solicitado no existe');
  }
  return new Usuario(fila).aJSON();
}

async function crearUsuario(datos, contexto) {
  const rol = await rolesService.datos.obtenerPorId(datos.idRol);
  if (!rol) {
    throw AppError.solicitudInvalida('El rol indicado no existe', [{ campo: 'idRol', mensaje: 'Rol inexistente' }]);
  }
  if (rol.estado_rol !== 'Activo') {
    throw AppError.reglaNegocio('No se puede asignar un rol inactivo');
  }

  if (await existeEmail(datos.email)) {
    throw AppError.conflicto('Ya existe un usuario con ese correo electronico');
  }
  if (await existeDocumento(datos.documento)) {
    throw AppError.conflicto('Ya existe un usuario con ese documento');
  }

  const hash = await hashearClave(datos.contrasena);

  return conTransaccion(async (conexion) => {
    const idUsuario = await crear(
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

    await bitacoraService.datos.registrar(
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
  const fila = await obtenerPorId(idUsuario);
  if (!fila) {
    throw AppError.noEncontrado('El usuario solicitado no existe');
  }

  if (datos.idRol !== fila.id_rol) {
    const rol = await rolesService.datos.obtenerPorId(datos.idRol);
    if (!rol) {
      throw AppError.solicitudInvalida('El rol indicado no existe', [{ campo: 'idRol', mensaje: 'Rol inexistente' }]);
    }
    if (rol.estado_rol !== 'Activo') {
      throw AppError.reglaNegocio('No se puede asignar un rol inactivo');
    }
  }

  await actualizar(idUsuario, {
    nombreUsuario: datos.nombreUsuario,
    telefono: datos.telefono,
    idRol: datos.idRol
  });

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'usuarios',
    idRegistro: idUsuario,
    accion: 'Actualizacion',
    descripcion: `Usuario ${fila.email} actualizado`
  });

  return { mensaje: 'Usuario actualizado correctamente' };
}

async function actualizarParcialUsuario(idUsuario, datos, contexto) {
  const fila = await obtenerPorId(idUsuario);
  if (!fila) {
    throw AppError.noEncontrado('El usuario solicitado no existe');
  }

  const resultado = await actualizarUsuario(
    idUsuario,
    {
      nombreUsuario: datos.nombreUsuario !== undefined ? datos.nombreUsuario : fila.nombre_usuario,
      telefono: datos.telefono !== undefined ? datos.telefono : fila.telefono,
      idRol: datos.idRol !== undefined ? datos.idRol : fila.id_rol
    },
    contexto
  );

  if (datos.estadoUsuario !== undefined && datos.estadoUsuario !== fila.estado_usuario) {
    await cambiarEstadoUsuario(idUsuario, datos.estadoUsuario, contexto);
  }

  return resultado;
}

async function cambiarEstadoUsuario(idUsuario, estadoUsuario, contexto) {
  const fila = await obtenerPorId(idUsuario);
  if (!fila) {
    throw AppError.noEncontrado('El usuario solicitado no existe');
  }

  if (Number(idUsuario) === Number(contexto.idUsuario)) {
    throw AppError.reglaNegocio('No puede cambiar el estado de su propio usuario');
  }

  if (estadoUsuario === 'Inactivo' && fila.nombre_rol === 'Administrador') {
    const administradoresActivos = await rolesService.datos.contarUsuariosActivos(fila.id_rol);
    if (administradoresActivos <= 1) {
      throw AppError.reglaNegocio('No se puede inactivar al ultimo administrador activo del sistema');
    }
  }

  await cambiarEstado(idUsuario, estadoUsuario);

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'usuarios',
    idRegistro: idUsuario,
    accion: 'Cambio de estado',
    descripcion: `Usuario ${fila.email} marcado como ${estadoUsuario}`
  });

  return { mensaje: `Usuario marcado como ${estadoUsuario}` };
}

const CAMPOS_SELECT = `u.id_usuario, u.nombre_usuario, u.email, u.documento, u.telefono,
                       u.id_rol, r.nombre_rol, u.estado_usuario, u.proveedores_id_proveedor,
                       u.fecha_registro, u.fecha_modificacion`;

async function listar({ nombre, correo, estado, documento, idRol, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (nombre) {
    condiciones.push('u.nombre_usuario LIKE ?');
    parametros.push(`%${nombre}%`);
  }
  if (correo) {
    condiciones.push('u.email LIKE ?');
    parametros.push(`%${correo}%`);
  }
  if (estado) {
    condiciones.push('u.estado_usuario = ?');
    parametros.push(estado);
  }
  if (documento) {
    condiciones.push('u.documento LIKE ?');
    parametros.push(`%${documento}%`);
  }
  if (idRol) {
    condiciones.push('u.id_rol = ?');
    parametros.push(idRol);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM usuarios u
       INNER JOIN roles r ON r.id_rol = u.id_rol
       ${donde}
       ORDER BY u.id_usuario ASC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idUsuario) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM usuarios u
       INNER JOIN roles r ON r.id_rol = u.id_rol
      WHERE u.id_usuario = ?`,
    [idUsuario]
  );
  return filas[0] || null;
}

async function obtenerPorEmail(email) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}, u.contrasena
       FROM usuarios u
       INNER JOIN roles r ON r.id_rol = u.id_rol
      WHERE u.email = ?`,
    [email]
  );
  return filas[0] || null;
}

async function existeEmail(email, exceptoId = null) {
  const parametros = [email];
  let condicionExtra = '';
  if (exceptoId) {
    condicionExtra = 'AND id_usuario <> ?';
    parametros.push(exceptoId);
  }
  const [filas] = await pool.query(`SELECT 1 AS existe FROM usuarios WHERE email = ? ${condicionExtra}`, parametros);
  return filas.length > 0;
}

async function existeDocumento(documento, exceptoId = null) {
  const parametros = [documento];
  let condicionExtra = '';
  if (exceptoId) {
    condicionExtra = 'AND id_usuario <> ?';
    parametros.push(exceptoId);
  }
  const [filas] = await pool.query(`SELECT 1 AS existe FROM usuarios WHERE documento = ? ${condicionExtra}`, parametros);
  return filas.length > 0;
}

async function crear({ nombreUsuario, email, contrasena, documento, telefono, idRol, proveedoresIdProveedor = null }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO usuarios (nombre_usuario, email, contrasena, documento, telefono, id_rol, proveedores_id_proveedor)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombreUsuario, email, contrasena, documento, telefono, idRol, proveedoresIdProveedor]
  );
  return resultado.insertId;
}

async function actualizar(idUsuario, { nombreUsuario, telefono, idRol }) {
  await pool.query('UPDATE usuarios SET nombre_usuario = ?, telefono = ?, id_rol = ? WHERE id_usuario = ?', [
    nombreUsuario,
    telefono,
    idRol,
    idUsuario
  ]);
}

async function cambiarEstado(idUsuario, estadoUsuario) {
  await pool.query('UPDATE usuarios SET estado_usuario = ? WHERE id_usuario = ?', [estadoUsuario, idUsuario]);
}

async function actualizarContrasena(idUsuario, contrasenaHash) {
  await pool.query('UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?', [contrasenaHash, idUsuario]);
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  actualizarParcialUsuario,
  cambiarEstadoUsuario,
  datos: { obtenerPorId, obtenerPorEmail, existeEmail, crear, actualizarContrasena }
};
