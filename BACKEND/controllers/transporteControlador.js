'use strict';

/**
 * Controlador de transporte (RF-TRA-01..02).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const transporteServicio = require('../services/transporteServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await transporteServicio.listarTransportes(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const transporte = await transporteServicio.obtenerTransporte(req.params.id);
  return responderExito(res, transporte);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await transporteServicio.crearTransporte(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Transporte registrado correctamente');
});

const actualizar = manejadorAsincrono(async (req, res) => {
  const resultado = await transporteServicio.actualizarTransporte(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = manejadorAsincrono(async (req, res) => {
  const resultado = await transporteServicio.cambiarEstadoTransporte(req.params.id, req.body.estadoTransporte, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, cambiarEstado };
