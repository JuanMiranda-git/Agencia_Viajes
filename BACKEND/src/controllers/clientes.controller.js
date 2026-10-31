'use strict';

/**
 * Controlador de clientes y derechos Ley 1581 de 2012.
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const AppError = require('../utils/AppError');
const clientesService = require('../services/clientes.service');
const { ROL_CLIENTE } = require('../middleware/autenticacion');

/**
 * Un usuario Cliente solo puede operar sobre su propio registro de cliente.
 */
async function validarAccesoAlCliente(req) {
  if (!req.usuario || req.usuario.rol !== ROL_CLIENTE) {
    return;
  }
  const propio = await clientesService.obtenerClientePorEmail(req.usuario.correo);
  if (!propio || Number(propio.idCliente) !== Number(req.params.id)) {
    throw AppError.prohibido('Solo puede acceder a sus propios datos personales');
  }
}

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await clientesService.listarClientes(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = capturarAsync(async (req, res) => {
  const cliente = await clientesService.obtenerCliente(req.params.id);
  return responderExito(res, cliente);
});

const crear = capturarAsync(async (req, res) => {
  const resultado = await clientesService.crearCliente(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Cliente creado correctamente');
});

const actualizar = capturarAsync(async (req, res) => {
  const resultado = await clientesService.actualizarCliente(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const actualizarParcial = capturarAsync(async (req, res) => {
  const resultado = await clientesService.actualizarParcialCliente(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const obtenerDatosPersonales = capturarAsync(async (req, res) => {
  await validarAccesoAlCliente(req);
  const resultado = await clientesService.obtenerDatosPersonales(req.params.id);
  return responderExito(res, resultado);
});

const actualizarDatosPersonales = capturarAsync(async (req, res) => {
  await validarAccesoAlCliente(req);
  const resultado = await clientesService.actualizarDatosPersonales(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const eliminarDatosPersonales = capturarAsync(async (req, res) => {
  await validarAccesoAlCliente(req);
  const resultado = await clientesService.eliminarDatosPersonales(req.params.id, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const historial = capturarAsync(async (req, res) => {
  await validarAccesoAlCliente(req);
  const resultado = await clientesService.obtenerHistorial(req.params.id);
  return responderExito(res, resultado);
});

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  actualizarParcial,
  obtenerDatosPersonales,
  actualizarDatosPersonales,
  eliminarDatosPersonales,
  historial
};
