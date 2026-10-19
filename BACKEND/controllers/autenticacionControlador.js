'use strict';

/**
 * Controlador de autenticacion (RF-ACC-01..05).
 * Solo traduce HTTP <-> servicio; sin logica de negocio.
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado } = require('../utils/respuesta');
const autenticacionServicio = require('../services/autenticacionServicio');

const iniciarSesion = manejadorAsincrono(async (req, res) => {
  const resultado = await autenticacionServicio.iniciarSesion(req.body);
  return responderExito(res, resultado);
});

const cerrarSesion = manejadorAsincrono(async (req, res) => {
  const resultado = await autenticacionServicio.cerrarSesion(req.usuario.idUsuario);
  return responderExito(res, resultado);
});

const solicitarRecuperacion = manejadorAsincrono(async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/html/restablecer.html`;
  const resultado = await autenticacionServicio.solicitarRecuperacion({
    ...req.body,
    baseUrlComprobante: baseUrl
  });
  return responderExito(res, resultado);
});

const restablecerClave = manejadorAsincrono(async (req, res) => {
  const resultado = await autenticacionServicio.restablecerClave(req.body);
  return responderExito(res, resultado);
});

const registroCliente = manejadorAsincrono(async (req, res) => {
  const resultado = await autenticacionServicio.registrarCliente(req.body);
  return responderCreado(res, resultado, 'Cliente registrado correctamente');
});

module.exports = { iniciarSesion, cerrarSesion, solicitarRecuperacion, restablecerClave, registroCliente };
