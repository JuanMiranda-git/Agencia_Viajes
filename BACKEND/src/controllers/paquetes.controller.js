'use strict';

/**
 * Controlador de paquetes turisticos (RF-PAQ-01..05).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const paquetesService = require('../services/paquetes.service');
const { ROL_CLIENTE } = require('../middleware/autenticacion');

const listar = capturarAsync(async (req, res) => {
  const soloActivos = req.usuario && req.usuario.rol === ROL_CLIENTE;
  const { datos, paginacion } = await paquetesService.listarPaquetes(req.query, { soloActivos });
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const paquete = await paquetesService.obtenerPaquete(req.params.id);
  return responderExito(res, paquete);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await paquetesService.crearPaquete(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Paquete creado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await paquetesService.actualizarPaquete(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await paquetesService.actualizarParcialPaquete(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = capturarAsync(async (req, res) => {
  const resultado = await paquetesService.cambiarEstadoPaquete(req.params.id, req.body.estadoPaquete, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const listarServicios = capturarAsync(async (req, res) => {
  const servicios = await paquetesService.listarServiciosDePaquete(req.params.id);
  return responderExito(res, servicios);
});

const agregarServicio = capturarAsync(async (req, res) => {
  const resultado = await paquetesService.agregarServicioAPaquete(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, resultado, 'Servicio agregado al paquete correctamente');
});

const quitarServicio = capturarAsync(async (req, res) => {
  const resultado = await paquetesService.quitarServicioDePaquete(req.params.id, req.params.idServicio, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, cambiarEstado, listarServicios, agregarServicio, quitarServicio };
