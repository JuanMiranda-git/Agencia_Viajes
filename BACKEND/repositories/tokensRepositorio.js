'use strict';

/**
 * Repositorio de tokens de recuperacion de contrasena (RF-ACC-01).
 */

const { pool } = require('../config/baseDatos');

async function invalidarPendientes(idUsuario, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('UPDATE tokens_recuperacion_clave SET usado = 1 WHERE id_usuario = ? AND usado = 0', [idUsuario]);
}

async function crear({ idUsuario, token, fechaExpiracion }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    'INSERT INTO tokens_recuperacion_clave (id_usuario, token, fecha_expiracion) VALUES (?, ?, ?)',
    [idUsuario, token, fechaExpiracion]
  );
  return resultado.insertId;
}

async function obtenerValidoPorToken(token) {
  const [filas] = await pool.query(
    `SELECT t.id_token, t.id_usuario, t.token, t.fecha_expiracion, t.usado, t.fecha_creacion,
            u.email AS usuario_email, u.estado_usuario
       FROM tokens_recuperacion_clave t
       INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
      WHERE t.token = ?
        AND t.usado = 0
        AND t.fecha_expiracion > NOW()`,
    [token]
  );
  return filas[0] || null;
}

async function marcarUsado(idToken, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('UPDATE tokens_recuperacion_clave SET usado = 1 WHERE id_token = ?', [idToken]);
}

module.exports = { invalidarPendientes, crear, obtenerValidoPorToken, marcarUsado };
