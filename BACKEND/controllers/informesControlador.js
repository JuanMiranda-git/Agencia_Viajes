'use strict';

/**
 * Controlador de informes de desempeno (RF-DES-02, RF-VEN-04).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito } = require('../utils/respuesta');
const informesServicio = require('../services/informesServicio');

const desempeno = manejadorAsincrono(async (req, res) => {
  const resultado = await informesServicio.obtenerDesempenoPorPaquete(req.query);
  return responderExito(res, resultado);
});

const ventasPorPeriodo = manejadorAsincrono(async (req, res) => {
  const resultado = await informesServicio.obtenerVentasPorPeriodo(req.query);
  return responderExito(res, resultado);
});

module.exports = { desempeno, ventasPorPeriodo };
