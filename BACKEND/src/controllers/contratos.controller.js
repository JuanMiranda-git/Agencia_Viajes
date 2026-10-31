'use strict';

/**
 * Controlador de contratos y otrosies (RF-CON-01..04).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const contratosService = require('../services/contratos.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await contratosService.listarContratos(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const contrato = await contratosService.obtenerContrato(req.params.id);
  return responderExito(res, contrato);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await contratosService.crearContrato(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Contrato creado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await contratosService.actualizarContrato(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await contratosService.actualizarParcialContrato(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const crearOtrosi = capturarAsync(async (req, res) => {
  const resultado = await contratosService.crearOtrosi(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, resultado, 'Otrosi registrado correctamente');
});

const listarOtrosis = capturarAsync(async (req, res) => {
  const otrosies = await contratosService.listarOtrosis(req.params.id);
  return responderExito(res, otrosies);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, crearOtrosi, listarOtrosis };
