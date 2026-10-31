'use strict';

/**
 * Controlador de ventas y pagos (RF-VEN-01..04), incluido el comprobante PDF.
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const { enviarComprobanteVenta } = require('../utils/pdfComprobante');
const ventasService = require('../services/ventas.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await ventasService.listarVentas(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const venta = await ventasService.obtenerVenta(req.params.id);
  return responderExito(res, venta);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await ventasService.crearVenta(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Venta registrada correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const venta = await ventasService.actualizarVenta(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Venta actualizada correctamente', 200, venta);
});

const registrarPago = capturarAsync(async (req, res) => {
  const resultado = await ventasService.registrarPago(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  const mensaje = resultado.pago.estado === 'Pagado' ? 'Pago registrado correctamente' : resultado.pago.motivoRechazo;
  return responderMensaje(res, mensaje, 200, resultado);
});

const cancelar = capturarAsync(async (req, res) => {
  const venta = await ventasService.cancelarVenta(req.params.id, { idUsuario: req.usuario.idUsuario });
  return responderMensaje(res, 'Venta cancelada correctamente', 200, venta);
});

const comprobante = capturarAsync(async (req, res) => {
  const datos = await ventasService.obtenerDatosComprobante(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="comprobante-venta-${datos.idVenta}.pdf"`);
  return enviarComprobanteVenta(res, datos);
});

module.exports = { listar, obtener, crear, actualizar, registrarPago, cancelar, comprobante };
