'use strict';

/**
 * Controlador de usuarios (RF-USR-01..06).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const usuariosServicio = require('../services/usuariosServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await usuariosServicio.listarUsuarios(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const usuario = await usuariosServicio.obtenerUsuario(req.params.id);
  return responderExito(res, usuario);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await usuariosServicio.crearUsuario(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Usuario creado correctamente');
});

const actualizar = manejadorAsincrono(async (req, res) => {
  const resultado = await usuariosServicio.actualizarUsuario(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = manejadorAsincrono(async (req, res) => {
  const resultado = await usuariosServicio.cambiarEstadoUsuario(req.params.id, req.body.estadoUsuario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, cambiarEstado };
