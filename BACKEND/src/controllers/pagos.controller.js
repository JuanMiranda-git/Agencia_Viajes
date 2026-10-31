'use strict';

/**
 * Controlador de pagos (RF-VEN-02, RF-VEN-04). Fachada sobre ventas.
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderLista, responderMensaje } = require('../utils/respuesta');
const pagosService = require('../services/pagos.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await pagosService.listarPagos(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const pago = await pagosService.obtenerPago(req.params.id);
  return responderExito(res, pago);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await pagosService.crearPago(req.body, { idUsuario: req.usuario.idUsuario });
  const mensaje = resultado.pago.estado === 'Pagado' ? 'Pago registrado correctamente' : resultado.pago.motivoRechazo;
  return responderMensaje(res, mensaje, 201, resultado);
});

const actualizar = capturarAsync(async (req, res) => {
  const pago = await pagosService.actualizarPago(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Pago actualizado correctamente', 200, pago);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const pago = await pagosService.actualizarParcialPago(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Pago actualizado correctamente', 200, pago);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial };
