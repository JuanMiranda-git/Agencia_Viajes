'use strict';

/**
 * Controlador de ventas y pagos (RF-VEN-01..04), incluido el comprobante PDF.
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const { enviarComprobanteVenta } = require('../utils/pdfComprobante');
const ventasServicio = require('../services/ventasServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await ventasServicio.listarVentas(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const venta = await ventasServicio.obtenerVenta(req.params.id);
  return responderExito(res, venta);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await ventasServicio.crearVenta(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Venta registrada correctamente');
});

const registrarPago = manejadorAsincrono(async (req, res) => {
  const resultado = await ventasServicio.registrarPago(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  const mensaje = resultado.pago.estado === 'Pagado' ? 'Pago registrado correctamente' : resultado.pago.motivoRechazo;
  return responderMensaje(res, mensaje, 200, resultado);
});

const cancelar = manejadorAsincrono(async (req, res) => {
  const venta = await ventasServicio.cancelarVenta(req.params.id, { idUsuario: req.usuario.idUsuario });
  return responderMensaje(res, 'Venta cancelada correctamente', 200, venta);
});

const comprobante = manejadorAsincrono(async (req, res) => {
  const datos = await ventasServicio.obtenerDatosComprobante(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="comprobante-venta-${datos.idVenta}.pdf"`);
  return enviarComprobanteVenta(res, datos);
});

module.exports = { listar, obtener, crear, registrarPago, cancelar, comprobante };
