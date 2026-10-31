'use strict';

/**
 * Controlador de proveedores (RF-PRO-01..03).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const proveedoresService = require('../services/proveedores.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await proveedoresService.listarProveedores(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const proveedor = await proveedoresService.obtenerProveedor(req.params.id);
  return responderExito(res, proveedor);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await proveedoresService.crearProveedor(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Proveedor creado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await proveedoresService.actualizarProveedor(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await proveedoresService.actualizarParcialProveedor(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const listarServicios = capturarAsync(async (req, res) => {
  const servicios = await proveedoresService.listarServiciosDeProveedor(req.params.id);
  return responderExito(res, servicios);
});

const crearServicio = capturarAsync(async (req, res) => {
  const resultado = await proveedoresService.crearServicioDeProveedor(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, resultado, 'Servicio registrado correctamente');
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, listarServicios, crearServicio };
