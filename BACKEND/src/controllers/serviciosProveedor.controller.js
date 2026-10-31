'use strict';

/**
 * Controlador del catalogo de servicios de proveedor (RF-PRO-03).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const serviciosProveedorService = require('../services/serviciosProveedor.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await serviciosProveedorService.listarServiciosProveedor(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const servicio = await serviciosProveedorService.obtenerServicioProveedor(req.params.id);
  return responderExito(res, servicio);
});

const crear = capturarAsync(async (req, res) => {
  const servicio = await serviciosProveedorService.crearServicioProveedor(req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, servicio, 'Servicio de proveedor creado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const servicio = await serviciosProveedorService.actualizarServicioProveedor(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Servicio de proveedor actualizado correctamente', 200, servicio);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const servicio = await serviciosProveedorService.actualizarParcialServicioProveedor(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, 'Servicio de proveedor actualizado correctamente', 200, servicio);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial };
