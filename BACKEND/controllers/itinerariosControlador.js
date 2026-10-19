'use strict';

/**
 * Controlador de itinerarios (RF-ITI-01..03).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const itinerariosServicio = require('../services/itinerariosServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await itinerariosServicio.listarItinerarios(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const itinerario = await itinerariosServicio.obtenerItinerario(req.params.id);
  return responderExito(res, itinerario);
});

const crear = manejadorAsincrono(async (req, res) => {
  const datos = { ...req.body, idPaquete: req.params.id || req.body.idPaquete };
  const resultado = await itinerariosServicio.crearItinerario(datos, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Actividad agregada al itinerario correctamente');
});

const actualizar = manejadorAsincrono(async (req, res) => {
  const resultado = await itinerariosServicio.actualizarItinerario(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = manejadorAsincrono(async (req, res) => {
  const resultado = await itinerariosServicio.cambiarEstadoItinerario(req.params.id, req.body.estadoItinerario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, cambiarEstado };
