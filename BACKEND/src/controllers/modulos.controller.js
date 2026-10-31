'use strict';

/**
 * Controlador de modulos del sistema (RF-ROL-05, RF-ROL-07).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderMensaje } = require('../utils/respuesta');
const modulosService = require('../services/modulos.service');

const listar = capturarAsync(async (req, res) => {
  const modulos = await modulosService.listarModulos({ soloActivos: req.query.soloActivos });
  return responderExito(res, modulos);
});

const obtener = capturarAsync(async (req, res) => {
  const modulo = await modulosService.obtenerModulo(req.params.id);
  return responderExito(res, modulo);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await modulosService.crearModulo(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Modulo creado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await modulosService.actualizarModulo(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await modulosService.actualizarParcialModulo(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial };
