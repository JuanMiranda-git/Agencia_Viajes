'use strict';

/**
 * Controlador de contratos y otrosies (RF-CON-01..04).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const contratosServicio = require('../services/contratosServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await contratosServicio.listarContratos(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const contrato = await contratosServicio.obtenerContrato(req.params.id);
  return responderExito(res, contrato);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await contratosServicio.crearContrato(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Contrato creado correctamente');
});

const actualizar = manejadorAsincrono(async (req, res) => {
  const resultado = await contratosServicio.actualizarContrato(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const crearOtrosi = manejadorAsincrono(async (req, res) => {
  const resultado = await contratosServicio.crearOtrosi(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, resultado, 'Otrosi registrado correctamente');
});

const listarOtrosis = manejadorAsincrono(async (req, res) => {
  const otrosies = await contratosServicio.listarOtrosis(req.params.id);
  return responderExito(res, otrosies);
});

module.exports = { listar, obtener, crear, actualizar, crearOtrosi, listarOtrosis };
