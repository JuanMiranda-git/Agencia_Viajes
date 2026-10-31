'use strict';

/**
 * Controlador del catalogo de servicios de paquete (RF-PAQ-02, RF-PAQ-04).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const serviciosPaqueteService = require('../services/serviciosPaquete.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await serviciosPaqueteService.listarServiciosPaquete(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const servicio = await serviciosPaqueteService.obtenerServicioPaquete(req.params.id);
  return responderExito(res, servicio);
});

const crear = capturarAsync(async (req, res) => {
  const servicio = await serviciosPaqueteService.crearServicioPaquete(req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, servicio, 'Servicio de paquete creado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const servicio = await serviciosPaqueteService.actualizarServicioPaquete(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Servicio de paquete actualizado correctamente', 200, servicio);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const servicio = await serviciosPaqueteService.actualizarParcialServicioPaquete(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Servicio de paquete actualizado correctamente', 200, servicio);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial };
