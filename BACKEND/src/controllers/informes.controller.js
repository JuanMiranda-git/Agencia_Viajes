'use strict';

/**
 * Controlador de informes de desempeno (RF-DES-02, RF-VEN-04).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito } = require('../utils/respuesta');
const informesService = require('../services/informes.service');

const desempeno = capturarAsync(async (req, res) => {
  const resultado = await informesService.obtenerDesempenoPorPaquete(req.query);
  return responderExito(res, resultado);
});

const ventasPorPeriodo = capturarAsync(async (req, res) => {
  const resultado = await informesService.obtenerVentasPorPeriodo(req.query);
  return responderExito(res, resultado);
});

module.exports = { desempeno, ventasPorPeriodo };
