'use strict';

/**
 * Controlador de CRM: interacciones e historial del cliente (RF-CRM-01..03).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista } = require('../utils/respuesta');
const crmServicio = require('../services/crmServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await crmServicio.listarInteracciones(req.query);
  return responderLista(res, datos, paginacion);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await crmServicio.registrarInteraccion(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Interaccion registrada correctamente');
});

const historial = manejadorAsincrono(async (req, res) => {
  const resultado = await crmServicio.obtenerHistorialCliente(req.params.id);
  return responderExito(res, resultado);
});

module.exports = { listar, crear, historial };
