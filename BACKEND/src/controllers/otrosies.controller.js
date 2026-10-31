'use strict';

/**
 * Controlador de otrosies contractuales (RF-CON-03).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const otrosiesService = require('../services/otrosies.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await otrosiesService.listarOtrosis(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const otrosi = await otrosiesService.obtenerOtrosi(req.params.id);
  return responderExito(res, otrosi);
});

const crear = capturarAsync(async (req, res) => {
  const otrosi = await otrosiesService.crearOtrosi(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, otrosi, 'Otrosi registrado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const otrosi = await otrosiesService.actualizarOtrosi(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Otrosi actualizado correctamente', 200, otrosi);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const otrosi = await otrosiesService.actualizarParcialOtrosi(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Otrosi actualizado correctamente', 200, otrosi);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial };
