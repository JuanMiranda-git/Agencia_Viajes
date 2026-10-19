'use strict';

/**
 * Controlador de reservas (RF-RES-01..05), incluido el comprobante PDF.
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const { enviarComprobanteReserva } = require('../utils/pdfComprobante');
const ErrorApi = require('../utils/ErrorApi');
const reservasServicio = require('../services/reservasServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await reservasServicio.listarReservas(req.query, req.usuario);
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const reserva = await reservasServicio.obtenerReserva(req.params.id, req.usuario);
  return responderExito(res, reserva);
});

const crear = manejadorAsincrono(async (req, res) => {
  const reserva = await reservasServicio.crearReserva(req.body, req.usuario, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, reserva, 'Reserva registrada correctamente');
});

const confirmar = manejadorAsincrono(async (req, res) => {
  const reserva = await reservasServicio.confirmarReserva(req.params.id, { idUsuario: req.usuario.idUsuario });
  return responderMensaje(res, `Reserva confirmada con numero ${reserva.numeroReserva}`, 200, reserva);
});

const cancelar = manejadorAsincrono(async (req, res) => {
  const reserva = await reservasServicio.cancelarReserva(req.params.id, req.usuario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Reserva cancelada correctamente', 200, reserva);
});

const cambiarEstado = manejadorAsincrono(async (req, res) => {
  if (req.body.estadoReserva === 'Confirmada') {
    const reserva = await reservasServicio.confirmarReserva(req.params.id, { idUsuario: req.usuario.idUsuario });
    return responderMensaje(res, `Reserva confirmada con numero ${reserva.numeroReserva}`, 200, reserva);
  }
  const reserva = await reservasServicio.cancelarReserva(req.params.id, req.usuario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Reserva cancelada correctamente', 200, reserva);
});

const comprobante = manejadorAsincrono(async (req, res) => {
  const reserva = await reservasServicio.obtenerReserva(req.params.id, req.usuario);
  if (reserva.estadoReserva !== 'Confirmada') {
    throw ErrorApi.reglaNegocio('El comprobante solo esta disponible para reservas confirmadas');
  }
  const datos = await reservasServicio.obtenerDatosComprobante(req.params.id, req.usuario);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="comprobante-${reserva.numeroReserva}.pdf"`);
  return enviarComprobanteReserva(res, datos);
});

module.exports = { listar, obtener, crear, confirmar, cancelar, cambiarEstado, comprobante };
