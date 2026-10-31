'use strict';

/**
 * Controlador de CRM: interacciones e historial del cliente (RF-CRM-01..03).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const crmService = require('../services/crm.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await crmService.listarInteracciones(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const interaccion = await crmService.obtenerInteraccion(req.params.id);
  return responderExito(res, interaccion);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await crmService.registrarInteraccion(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Interaccion registrada correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await crmService.actualizarInteraccion(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await crmService.actualizarParcialInteraccion(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const historial = capturarAsync(async (req, res) => {
  const resultado = await crmService.obtenerHistorialCliente(req.params.id);
  return responderExito(res, resultado);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, historial };
