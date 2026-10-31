'use strict';

/**
 * Controlador de reservas (RF-RES-01..05), incluido el comprobante PDF.
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const { enviarComprobanteReserva } = require('../utils/pdfComprobante');
const AppError = require('../utils/AppError');
const reservasService = require('../services/reservas.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await reservasService.listarReservas(req.query, req.usuario);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const reserva = await reservasService.obtenerReserva(req.params.id, req.usuario);
  return responderExito(res, reserva);
});

const crear = capturarAsync(async (req, res) => {
  const reserva = await reservasService.crearReserva(req.body, req.usuario, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, reserva, 'Reserva registrada correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const reserva = await reservasService.actualizarReserva(req.params.id, req.body, req.usuario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Reserva actualizada correctamente', 200, reserva);
});

const confirmar = capturarAsync(async (req, res) => {
  const reserva = await reservasService.confirmarReserva(req.params.id, { idUsuario: req.usuario.idUsuario });
  return responderMensaje(res, `Reserva confirmada con numero ${reserva.numeroReserva}`, 200, reserva);
});

const cancelar = capturarAsync(async (req, res) => {
  const reserva = await reservasService.cancelarReserva(req.params.id, req.usuario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Reserva cancelada correctamente', 200, reserva);
});

const cambiarEstado = capturarAsync(async (req, res) => {
  if (req.body.estadoReserva === 'Confirmada') {
    const reserva = await reservasService.confirmarReserva(req.params.id, { idUsuario: req.usuario.idUsuario });
    return responderMensaje(res, `Reserva confirmada con numero ${reserva.numeroReserva}`, 200, reserva);
  }
  const reserva = await reservasService.cancelarReserva(req.params.id, req.usuario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Reserva cancelada correctamente', 200, reserva);
});

const comprobante = capturarAsync(async (req, res) => {
  const reserva = await reservasService.obtenerReserva(req.params.id, req.usuario);
  if (reserva.estadoReserva !== 'Confirmada') {
    throw AppError.reglaNegocio('El comprobante solo esta disponible para reservas confirmadas');
  }
  const datos = await reservasService.obtenerDatosComprobante(req.params.id, req.usuario);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="comprobante-${reserva.numeroReserva}.pdf"`);
  return enviarComprobanteReserva(res, datos);
});

module.exports = { listar, obtener, crear, actualizar, confirmar, cancelar, cambiarEstado, comprobante };
