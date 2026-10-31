'use strict';

/**
 * Controlador de usuarios (RF-USR-01..06).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const usuariosService = require('../services/usuarios.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await usuariosService.listarUsuarios(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const usuario = await usuariosService.obtenerUsuario(req.params.id);
  return responderExito(res, usuario);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await usuariosService.crearUsuario(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Usuario creado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await usuariosService.actualizarUsuario(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await usuariosService.actualizarParcialUsuario(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const cambiarEstado = capturarAsync(async (req, res) => {
  const resultado = await usuariosService.cambiarEstadoUsuario(req.params.id, req.body.estadoUsuario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, cambiarEstado };
