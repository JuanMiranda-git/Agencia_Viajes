'use strict';

/**
 * Controlador de paquetes turisticos (RF-PAQ-01..05).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const paquetesServicio = require('../services/paquetesServicio');
const { ROL_CLIENTE } = require('../middleware/autenticacion');

const listar = manejadorAsincrono(async (req, res) => {
  const soloActivos = req.usuario && req.usuario.rol === ROL_CLIENTE;
  const { datos, paginacion } = await paquetesServicio.listarPaquetes(req.query, { soloActivos });
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const paquete = await paquetesServicio.obtenerPaquete(req.params.id);
  return responderExito(res, paquete);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await paquetesServicio.crearPaquete(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Paquete creado correctamente');
});

const actualizar = manejadorAsincrono(async (req, res) => {
  const resultado = await paquetesServicio.actualizarPaquete(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = manejadorAsincrono(async (req, res) => {
  const resultado = await paquetesServicio.cambiarEstadoPaquete(req.params.id, req.body.estadoPaquete, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const listarServicios = manejadorAsincrono(async (req, res) => {
  const servicios = await paquetesServicio.listarServiciosDePaquete(req.params.id);
  return responderExito(res, servicios);
});

const agregarServicio = manejadorAsincrono(async (req, res) => {
  const resultado = await paquetesServicio.agregarServicioAPaquete(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, resultado, 'Servicio agregado al paquete correctamente');
});

const quitarServicio = manejadorAsincrono(async (req, res) => {
  const resultado = await paquetesServicio.quitarServicioDePaquete(req.params.id, req.params.idServicio, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, cambiarEstado, listarServicios, agregarServicio, quitarServicio };
