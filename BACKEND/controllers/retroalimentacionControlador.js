'use strict';

/**
 * Controlador de retroalimentacion (RF-DES-01..03).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista } = require('../utils/respuesta');
const retroalimentacionServicio = require('../services/retroalimentacionServicio');
const clientesServicio = require('../services/clientesServicio');
const { ROL_CLIENTE } = require('../middleware/autenticacion');

const listar = manejadorAsincrono(async (req, res) => {
  let consulta = req.query;

  if (req.usuario && req.usuario.rol === ROL_CLIENTE) {
    const cliente = await clientesServicio.obtenerClientePorEmail(req.usuario.correo);
    consulta = { ...req.query, idCliente: cliente ? cliente.idCliente : -1 };
  }

  const { datos, paginacion } = await retroalimentacionServicio.listarRetroalimentacion(consulta);
  return responderLista(res, datos, paginacion);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await retroalimentacionServicio.crearRetroalimentacion(req.body, req.usuario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, resultado, 'Gracias por su retroalimentacion');
});

const resumen = manejadorAsincrono(async (req, res) => {
  const datos = await retroalimentacionServicio.resumenPorPaquete();
  return responderExito(res, datos);
});

module.exports = { listar, crear, resumen };
