'use strict';

/**
 * Servicio de roles y permisos de modulo (RF-ROL-01..07).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Rol = require('../models/Rol');
const modulosServicio = require('./modulosServicio');
const bitacoraServicio = require('./bitacoraServicio');
const { pool } = require('../config/baseDatos');

async function listarRoles(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
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
  const fila = await obtenerPorId(idRol);
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
  const modulos = await listarModulosDeRolSql(idRol);
  return { ...rol.aJSON(), modulos: modulos.map((m) => ({ idModulo: m.id_modulo, nombreModulo: m.nombre_modulo })) };
}

async function crearRol(datos, contexto) {
  if (await obtenerPorNombre(datos.nombreRol)) {
    throw ErrorApi.conflicto('Ya existe un rol con ese nombre');
  }

  const idRol = await crear({
    nombreRol: datos.nombreRol,
    descripcion: datos.descripcion,
    estadoRol: datos.estadoRol
  });

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles',
    idRegistro: idRol,
    accion: 'Creacion',
    descripcion: `Rol ${datos.nombreRol} creado`
  });

  return { idRol };
}

async function actualizarRol(idRol, datos, contexto) {
  const fila = await obtenerPorId(idRol);
  if (!fila) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }

  const existente = await obtenerPorNombre(datos.nombreRol);
  if (existente && Number(existente.id_rol) !== Number(idRol)) {
    throw ErrorApi.conflicto('Ya existe otro rol con ese nombre');
  }

  await actualizar(idRol, {
    nombreRol: datos.nombreRol,
    descripcion: datos.descripcion,
    estadoRol: datos.estadoRol
  });

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles',
    idRegistro: idRol,
    accion: 'Actualizacion',
    descripcion: `Rol ${datos.nombreRol} actualizado`
  });

  return { mensaje: 'Rol actualizado correctamente' };
}

async function cambiarEstadoRol(idRol, estadoRol, contexto) {
  const fila = await obtenerPorId(idRol);
  if (!fila) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }

  if (estadoRol === 'Inactivo') {
    const usuariosActivos = await contarUsuariosActivos(idRol);
    if (usuariosActivos > 0) {
      throw ErrorApi.reglaNegocio('No se puede inactivar un rol con usuarios activos asignados', [
        { campo: 'estadoRol', mensaje: `El rol tiene ${usuariosActivos} usuario(s) activo(s)` }
      ]);
    }
  }

  await cambiarEstado(idRol, estadoRol);

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles',
    idRegistro: idRol,
    accion: 'Cambio de estado',
    descripcion: `Rol ${fila.nombre_rol} marcado como ${estadoRol}`
  });

  return { mensaje: `Rol marcado como ${estadoRol}` };
}

async function listarModulosDeRol(idRol) {
  const fila = await obtenerPorId(idRol);
  if (!fila) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }
  const modulos = await listarModulosDeRolSql(idRol);
  return modulos.map((m) => ({
    idModulo: m.id_modulo,
    nombreModulo: m.nombre_modulo,
    descripcion: m.descripcion,
    estadoModulo: m.estado_modulo,
    fechaAsignacion: m.fecha_asignacion
  }));
}

async function asignarModulo(idRol, idModulo, contexto) {
  const rol = await obtenerPorId(idRol);
  if (!rol) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }

  const modulo = await modulosServicio.datos.obtenerPorId(idModulo);
  if (!modulo) {
    throw ErrorApi.noEncontrado('El modulo solicitado no existe');
  }

  if (await tieneModulo(idRol, idModulo)) {
    throw ErrorApi.conflicto('El rol ya tiene asignado ese modulo');
  }

  await asignarModuloSql(idRol, idModulo);

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles_modulos',
    idRegistro: idRol,
    accion: 'Asignacion de modulo',
    descripcion: `Modulo ${modulo.nombre_modulo} asignado al rol ${rol.nombre_rol}`
  });

  return { mensaje: 'Modulo asignado al rol correctamente' };
}

async function quitarModulo(idRol, idModulo, contexto) {
  const rol = await obtenerPorId(idRol);
  if (!rol) {
    throw ErrorApi.noEncontrado('El rol solicitado no existe');
  }

  const filasAfectadas = await quitarModuloSql(idRol, idModulo);
  if (filasAfectadas === 0) {
    throw ErrorApi.noEncontrado('El rol no tiene asignado ese modulo');
  }

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'roles_modulos',
    idRegistro: idRol,
    accion: 'Retiro de modulo',
    descripcion: `Modulo ${idModulo} retirado del rol ${rol.nombre_rol}`
  });

  return { mensaje: 'Modulo retirado del rol correctamente' };
}

async function listar({ nombre, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (nombre) {
    condiciones.push('r.nombre_rol LIKE ?');
    parametros.push(`%${nombre}%`);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT r.id_rol, r.nombre_rol, r.descripcion, r.estado_rol, r.fecha_creacion, r.fecha_modificacion,
            (SELECT COUNT(*) FROM usuarios u WHERE u.id_rol = r.id_rol AND u.estado_usuario = 'Activo') AS usuarios_activos
       FROM roles r
       ${donde}
       ORDER BY r.id_rol ASC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(`SELECT COUNT(*) AS total FROM roles r ${donde}`, parametros);

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idRol) {
  const [filas] = await pool.query(
    `SELECT r.id_rol, r.nombre_rol, r.descripcion, r.estado_rol, r.fecha_creacion, r.fecha_modificacion
       FROM roles r WHERE r.id_rol = ?`,
    [idRol]
  );
  return filas[0] || null;
}

async function obtenerPorNombre(nombreRol) {
  const [filas] = await pool.query('SELECT * FROM roles WHERE nombre_rol = ?', [nombreRol]);
  return filas[0] || null;
}

async function crear({ nombreRol, descripcion, estadoRol }) {
  const [resultado] = await pool.query(
    'INSERT INTO roles (nombre_rol, descripcion, estado_rol) VALUES (?, ?, ?)',
    [nombreRol, descripcion, estadoRol]
  );
  return resultado.insertId;
}

async function actualizar(idRol, { nombreRol, descripcion, estadoRol }) {
  await pool.query('UPDATE roles SET nombre_rol = ?, descripcion = ?, estado_rol = ? WHERE id_rol = ?', [
    nombreRol,
    descripcion,
    estadoRol,
    idRol
  ]);
}

async function cambiarEstado(idRol, estadoRol) {
  await pool.query('UPDATE roles SET estado_rol = ? WHERE id_rol = ?', [estadoRol, idRol]);
}

async function contarUsuariosActivos(idRol) {
  const [filas] = await pool.query(
    "SELECT COUNT(*) AS total FROM usuarios WHERE id_rol = ? AND estado_usuario = 'Activo'",
    [idRol]
  );
  return filas[0].total;
}

async function listarModulosDeRolSql(idRol) {
  const [filas] = await pool.query(
    `SELECT m.id_modulo, m.nombre_modulo, m.descripcion, m.estado_modulo, rm.fecha_asignacion
       FROM roles_modulos rm
       INNER JOIN modulos m ON m.id_modulo = rm.id_modulo
      WHERE rm.id_rol = ?
      ORDER BY m.id_modulo ASC`,
    [idRol]
  );
  return filas;
}

async function asignarModuloSql(idRol, idModulo) {
  await pool.query('INSERT INTO roles_modulos (id_rol, id_modulo) VALUES (?, ?)', [idRol, idModulo]);
}

async function quitarModuloSql(idRol, idModulo) {
  const [resultado] = await pool.query('DELETE FROM roles_modulos WHERE id_rol = ? AND id_modulo = ?', [idRol, idModulo]);
  return resultado.affectedRows;
}

async function tieneModulo(idRol, idModulo) {
  const [filas] = await pool.query('SELECT 1 AS existe FROM roles_modulos WHERE id_rol = ? AND id_modulo = ?', [
    idRol,
    idModulo
  ]);
  return filas.length > 0;
}

module.exports = {
  listarRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  cambiarEstadoRol,
  listarModulosDeRol,
  asignarModulo,
  quitarModulo,
  datos: { obtenerPorId, obtenerPorNombre, contarUsuariosActivos }
};
