'use strict';

/**
 * Controlador de transporte (RF-TRA-01..02).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const transporteService = require('../services/transporte.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await transporteService.listarTransportes(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const transporte = await transporteService.obtenerTransporte(req.params.id);
  return responderExito(res, transporte);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await transporteService.crearTransporte(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Transporte registrado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await transporteService.actualizarTransporte(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await transporteService.actualizarParcialTransporte(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = capturarAsync(async (req, res) => {
  const resultado = await transporteService.cambiarEstadoTransporte(req.params.id, req.body.estadoTransporte, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, cambiarEstado };
