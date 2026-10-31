'use strict';

/**
 * Conexion a MySQL mediante mysql2/promise con pool y consultas parametrizadas.
 * No se usa ORM ni constructores de consultas (solo placeholders `?`).
 */

const mysql = require('mysql2/promise');
const entorno = require('./entorno');
const registro = require('./registro');

const pool = mysql.createPool({
  host: entorno.bd.host,
  port: entorno.bd.puerto,
  user: entorno.bd.usuario,
  password: entorno.bd.clave,
  database: entorno.bd.nombre,
  waitForConnections: true,
  connectionLimit: entorno.bd.poolMax,
  maxIdle: entorno.bd.poolMax,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  dateStrings: true,
  decimalNumbers: true
});

pool.on('connection', () => {
  registro.debug('Nueva conexion establecida con MySQL');
});

pool.on('acquire', () => {
  registro.debug('Conexion tomada del pool');
});

pool.on('release', () => {
  registro.debug('Conexion liberada al pool');
});

/**
 * Verifica que la base de datos responda (usada por el health-check).
 */
async function probarConexion() {
  const conexion = await pool.getConnection();
  try {
    await conexion.ping();
    return true;
  } finally {
    conexion.release();
  }
}

/**
 * Ejecuta una funcion dentro de una transaccion.
 * Garantiza commit, rollback y liberacion de la conexion.
 * @param {(conexion: import('mysql2/promise').PoolConnection) => Promise<any>} operacion
 */
async function conTransaccion(operacion) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await operacion(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

/**
 * Cierra el pool ordenadamente (apagado controlado).
 */
async function cerrarPool() {
  await pool.end();
}

module.exports = {
  pool,
  probarConexion,
  conTransaccion,
  cerrarPool
};
