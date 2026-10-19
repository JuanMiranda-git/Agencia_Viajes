'use strict';

/**
 * Servicio de consulta de modulos del sistema (RF-ROL-05, RF-ROL-07).
 * Los modulos son datos maestros: solo se consultan.
 */

const modulosRepositorio = require('../repositories/modulosRepositorio');

async function listarModulos({ soloActivos = false } = {}) {
  const filas = await modulosRepositorio.listar({ soloActivos: soloActivos === true || soloActivos === 'true' });
  return filas.map((fila) => ({
    idModulo: fila.id_modulo,
    nombreModulo: fila.nombre_modulo,
    descripcion: fila.descripcion,
    estadoModulo: fila.estado_modulo
  }));
}

module.exports = { listarModulos };
