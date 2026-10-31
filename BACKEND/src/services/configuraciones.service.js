'use strict';

/**
 * Servicio de configuraciones del sistema (RNF-REN-01).
 */

const { pool } = require('../config/database');

async function listarConfiguraciones() {
  const filas = await listar();
  return filas.map((fila) => ({
    idConfiguracion: fila.id_configuracion,
    parametro: fila.parametro,
    valor: fila.valor,
    descripcion: fila.descripcion
  }));
}

async function listar() {
  const [filas] = await pool.query(
    'SELECT id_configuracion, parametro, valor, descripcion FROM configuraciones ORDER BY id_configuracion ASC'
  );
  return filas;
}

async function obtenerPorParametro(parametro) {
  const [filas] = await pool.query(
    'SELECT id_configuracion, parametro, valor, descripcion FROM configuraciones WHERE parametro = ?',
    [parametro]
  );
  return filas[0] || null;
}

module.exports = { listarConfiguraciones, datos: { obtenerPorParametro } };
