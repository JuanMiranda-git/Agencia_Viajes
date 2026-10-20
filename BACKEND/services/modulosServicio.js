'use strict';

/**
 * Servicio de consulta de modulos del sistema (RF-ROL-05, RF-ROL-07).
 * Los modulos son datos maestros: solo se consultan.
 */

const { pool } = require('../config/baseDatos');

async function listarModulos({ soloActivos = false } = {}) {
  const filas = await listar({ soloActivos: soloActivos === true || soloActivos === 'true' });
  return filas.map((fila) => ({
    idModulo: fila.id_modulo,
    nombreModulo: fila.nombre_modulo,
    descripcion: fila.descripcion,
    estadoModulo: fila.estado_modulo
  }));
}

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

module.exports = { listarModulos, datos: { obtenerPorId } };
