'use strict';

/**
 * Repositorio de roles: solo acceso a datos (SQL parametrizado).
 */

const { pool } = require('../config/baseDatos');

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

async function listarModulosDeRol(idRol) {
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

async function asignarModulo(idRol, idModulo) {
  await pool.query('INSERT INTO roles_modulos (id_rol, id_modulo) VALUES (?, ?)', [idRol, idModulo]);
}

async function quitarModulo(idRol, idModulo) {
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
  listar,
  obtenerPorId,
  obtenerPorNombre,
  crear,
  actualizar,
  cambiarEstado,
  contarUsuariosActivos,
  listarModulosDeRol,
  asignarModulo,
  quitarModulo,
  tieneModulo
};
