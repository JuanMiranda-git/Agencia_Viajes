'use strict';

/**
 * Controlador de autenticacion (RF-ACC-01..05).
 * Solo traduce HTTP <-> servicio; sin logica de negocio.
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado } = require('../utils/respuesta');
const autenticacionService = require('../services/autenticacion.service');

const iniciarSesion = capturarAsync(async (req, res) => {
  const resultado = await autenticacionService.iniciarSesion(req.body);
  return responderExito(res, resultado);
});

const cerrarSesion = capturarAsync(async (req, res) => {
  const resultado = await autenticacionService.cerrarSesion(req.usuario.idUsuario);
  return responderExito(res, resultado);
});

const solicitarRecuperacion = capturarAsync(async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/html/restablecer.html`;
  const resultado = await autenticacionService.solicitarRecuperacion({
    ...req.body,
    baseUrlComprobante: baseUrl
  });
  return responderExito(res, resultado);
});

const restablecerClave = capturarAsync(async (req, res) => {
  const resultado = await autenticacionService.restablecerClave(req.body);
  return responderExito(res, resultado);
});

const registroCliente = capturarAsync(async (req, res) => {
  const resultado = await autenticacionService.registrarCliente(req.body);
  return responderCreado(res, resultado, 'Cliente registrado correctamente');
});

module.exports = { iniciarSesion, cerrarSesion, solicitarRecuperacion, restablecerClave, registroCliente };
