'use strict';

/**
 * Servicio de configuraciones del sistema (RNF-REN-01).
 */

const configuracionesRepositorio = require('../repositories/configuracionesRepositorio');

async function listarConfiguraciones() {
  const filas = await configuracionesRepositorio.listar();
  return filas.map((fila) => ({
    idConfiguracion: fila.id_configuracion,
    parametro: fila.parametro,
    valor: fila.valor,
    descripcion: fila.descripcion
  }));
}

module.exports = { listarConfiguraciones };
