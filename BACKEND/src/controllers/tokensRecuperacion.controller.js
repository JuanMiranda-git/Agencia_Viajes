'use strict';

/**
 * Controlador de tokens de recuperacion de contrasena (RF-ACC-04, RF-ACC-05).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const tokensRecuperacionService = require('../services/tokensRecuperacion.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await tokensRecuperacionService.listarTokensRecuperacion(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const token = await tokensRecuperacionService.obtenerTokenRecuperacion(req.params.id);
  return responderExito(res, token);
});

const crear = capturarAsync(async (req, res) => {
  const token = await tokensRecuperacionService.crearTokenRecuperacion(req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, token, 'Token de recuperacion generado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const token = await tokensRecuperacionService.actualizarTokenRecuperacion(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Token de recuperacion actualizado correctamente', 200, token);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const token = await tokensRecuperacionService.actualizarParcialTokenRecuperacion(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Token de recuperacion actualizado correctamente', 200, token);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial };
