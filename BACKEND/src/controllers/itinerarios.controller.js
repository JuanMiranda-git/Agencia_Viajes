'use strict';

/**
 * Controlador de itinerarios (RF-ITI-01..03).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const itinerariosService = require('../services/itinerarios.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await itinerariosService.listarItinerarios(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const itinerario = await itinerariosService.obtenerItinerario(req.params.id);
  return responderExito(res, itinerario);
});

const crear = capturarAsync(async (req, res) => {
  const datos = { ...req.body, idPaquete: req.params.id || req.body.idPaquete };
  const resultado = await itinerariosService.crearItinerario(datos, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Actividad agregada al itinerario correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await itinerariosService.actualizarItinerario(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await itinerariosService.actualizarParcialItinerario(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = capturarAsync(async (req, res) => {
  const resultado = await itinerariosService.cambiarEstadoItinerario(req.params.id, req.body.estadoItinerario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, cambiarEstado };
