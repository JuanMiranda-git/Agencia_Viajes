'use strict';

/**
 * Repositorio de modulos del sistema (permisos asignables).
 */

const { pool } = require('../config/baseDatos');

async function listar({ soloActivos = false } = {}) {
  const donde = soloActivos ? "WHERE estado_modulo = 'Activo'" : '';
  const [filas] = await pool.query(
    `SELECT id_modulo, nombre_modulo, descripcion, estado_modulo FROM modulos ${donde} ORDER BY id_modulo ASC`
  );
  return filas;
}

async function obtenerPorId(idModulo) {
  const [filas] = await pool.query(
    'SELECT id_modulo, nombre_modulo, descripcion, estado_modulo FROM modulos WHERE id_modulo = ?',
    [idModulo]
  );
  return filas[0] || null;
}

module.exports = { listar, obtenerPorId };
