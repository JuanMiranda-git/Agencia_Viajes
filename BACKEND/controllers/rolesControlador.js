'use strict';

/**
 * Controlador de roles y permisos de modulo (RF-ROL-01..07).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const rolesServicio = require('../services/rolesServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await rolesServicio.listarRoles(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const rol = await rolesServicio.obtenerRol(req.params.id);
  return responderExito(res, rol);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await rolesServicio.crearRol(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Rol creado correctamente');
});

const actualizar = manejadorAsincrono(async (req, res) => {
  const resultado = await rolesServicio.actualizarRol(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = manejadorAsincrono(async (req, res) => {
  const resultado = await rolesServicio.cambiarEstadoRol(req.params.id, req.body.estadoRol, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const listarModulos = manejadorAsincrono(async (req, res) => {
  const modulos = await rolesServicio.listarModulosDeRol(req.params.id);
  return responderExito(res, modulos);
});

const asignarModulo = manejadorAsincrono(async (req, res) => {
  const resultado = await rolesServicio.asignarModulo(req.params.id, req.body.idModulo, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje, 201);
});

const quitarModulo = manejadorAsincrono(async (req, res) => {
  const resultado = await rolesServicio.quitarModulo(req.params.id, req.params.idModulo, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, cambiarEstado, listarModulos, asignarModulo, quitarModulo };
