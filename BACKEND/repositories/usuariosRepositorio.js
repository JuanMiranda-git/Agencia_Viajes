'use strict';

/**
 * Repositorio de usuarios: solo acceso a datos (SQL parametrizado).
 */

const { pool } = require('../config/baseDatos');

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
  listar,
  obtenerPorId,
  obtenerPorEmail,
  existeEmail,
  existeDocumento,
  crear,
  actualizar,
  cambiarEstado,
  actualizarContrasena
};
