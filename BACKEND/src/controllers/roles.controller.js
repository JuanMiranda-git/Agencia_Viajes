'use strict';

/**
 * Controlador de roles y permisos de modulo (RF-ROL-01..07).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const rolesService = require('../services/roles.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await rolesService.listarRoles(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const rol = await rolesService.obtenerRol(req.params.id);
  return responderExito(res, rol);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await rolesService.crearRol(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Rol creado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await rolesService.actualizarRol(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await rolesService.actualizarParcialRol(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = capturarAsync(async (req, res) => {
  const resultado = await rolesService.cambiarEstadoRol(req.params.id, req.body.estadoRol, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const listarModulos = capturarAsync(async (req, res) => {
  const modulos = await rolesService.listarModulosDeRol(req.params.id);
  return responderExito(res, modulos);
});

const asignarModulo = capturarAsync(async (req, res) => {
  const resultado = await rolesService.asignarModulo(req.params.id, req.body.idModulo, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje, 201);
});

const quitarModulo = capturarAsync(async (req, res) => {
  const resultado = await rolesService.quitarModulo(req.params.id, req.params.idModulo, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, cambiarEstado, listarModulos, asignarModulo, quitarModulo };
