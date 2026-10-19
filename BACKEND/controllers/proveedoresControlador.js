'use strict';

/**
 * Controlador de proveedores (RF-PRO-01..03).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const proveedoresServicio = require('../services/proveedoresServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await proveedoresServicio.listarProveedores(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const proveedor = await proveedoresServicio.obtenerProveedor(req.params.id);
  return responderExito(res, proveedor);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await proveedoresServicio.crearProveedor(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Proveedor creado correctamente');
});

const actualizar = manejadorAsincrono(async (req, res) => {
  const resultado = await proveedoresServicio.actualizarProveedor(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const listarServicios = manejadorAsincrono(async (req, res) => {
  const servicios = await proveedoresServicio.listarServiciosDeProveedor(req.params.id);
  return responderExito(res, servicios);
});

const crearServicio = manejadorAsincrono(async (req, res) => {
  const resultado = await proveedoresServicio.crearServicioDeProveedor(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, resultado, 'Servicio registrado correctamente');
});

module.exports = { listar, obtener, crear, actualizar, listarServicios, crearServicio };
