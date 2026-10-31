'use strict';

/**
 * Controlador de retroalimentacion (RF-DES-01..03).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const retroalimentacionService = require('../services/retroalimentacion.service');
const clientesService = require('../services/clientes.service');
const { ROL_CLIENTE } = require('../middleware/autenticacion');

const listar = capturarAsync(async (req, res) => {
  let consulta = req.query;

  if (req.usuario && req.usuario.rol === ROL_CLIENTE) {
    const cliente = await clientesService.obtenerClientePorEmail(req.usuario.correo);
    consulta = { ...req.query, idCliente: cliente ? cliente.idCliente : -1 };
  }

  const { datos, paginacion } = await retroalimentacionService.listarRetroalimentacion(consulta);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const retroalimentacion = await retroalimentacionService.obtenerRetroalimentacion(req.params.id, req.usuario);
  return responderExito(res, retroalimentacion);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await retroalimentacionService.crearRetroalimentacion(req.body, req.usuario, {
    idUsuario: req.usuario.idUsuario
  });
  return responderCreado(res, resultado, 'Gracias por su retroalimentacion');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await retroalimentacionService.actualizarRetroalimentacion(
    req.params.id,
    req.body,
    req.usuario,
    { idUsuario: req.usuario.idUsuario }
  );
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await retroalimentacionService.actualizarParcialRetroalimentacion(
    req.params.id,
    req.body,
    req.usuario,
    { idUsuario: req.usuario.idUsuario }
  );
  return responderMensaje(res, resultado.mensaje);
});

const resumen = capturarAsync(async (req, res) => {
  const datos = await retroalimentacionService.resumenPorPaquete();
  return responderExito(res, datos);
});

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, resumen };
