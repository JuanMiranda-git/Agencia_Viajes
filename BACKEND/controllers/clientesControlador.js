'use strict';

/**
 * Controlador de clientes y derechos Ley 1581 de 2012.
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito, responderCreado, responderLista, responderMensaje } = require('../utils/respuesta');
const ErrorApi = require('../utils/ErrorApi');
const clientesServicio = require('../services/clientesServicio');
const { ROL_CLIENTE } = require('../middleware/autenticacion');

/**
 * Un usuario Cliente solo puede operar sobre su propio registro de cliente.
 */
async function validarAccesoAlCliente(req) {
  if (!req.usuario || req.usuario.rol !== ROL_CLIENTE) {
    return;
  }
  const propio = await clientesServicio.obtenerClientePorEmail(req.usuario.correo);
  if (!propio || Number(propio.idCliente) !== Number(req.params.id)) {
    throw ErrorApi.prohibido('Solo puede acceder a sus propios datos personales');
  }
}

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await clientesServicio.listarClientes(req.query);
  return responderLista(res, datos, paginacion);
});

const obtener = manejadorAsincrono(async (req, res) => {
  const cliente = await clientesServicio.obtenerCliente(req.params.id);
  return responderExito(res, cliente);
});

const crear = manejadorAsincrono(async (req, res) => {
  const resultado = await clientesServicio.crearCliente(req.body, { idUsuario: req.usuario.idUsuario });
  return responderCreado(res, resultado, 'Cliente creado correctamente');
});

const actualizar = manejadorAsincrono(async (req, res) => {
  const resultado = await clientesServicio.actualizarCliente(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const obtenerDatosPersonales = manejadorAsincrono(async (req, res) => {
  await validarAccesoAlCliente(req);
  const resultado = await clientesServicio.obtenerDatosPersonales(req.params.id);
  return responderExito(res, resultado);
});

const actualizarDatosPersonales = manejadorAsincrono(async (req, res) => {
  await validarAccesoAlCliente(req);
  const resultado = await clientesServicio.actualizarDatosPersonales(req.params.id, req.body, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const eliminarDatosPersonales = manejadorAsincrono(async (req, res) => {
  await validarAccesoAlCliente(req);
  const resultado = await clientesServicio.eliminarDatosPersonales(req.params.id, {
    idUsuario: req.usuario.idUsuario
  });
  return responderMensaje(res, resultado.mensaje);
});

const historial = manejadorAsincrono(async (req, res) => {
  await validarAccesoAlCliente(req);
  const resultado = await clientesServicio.obtenerHistorial(req.params.id);
  return responderExito(res, resultado);
});

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  obtenerDatosPersonales,
  actualizarDatosPersonales,
  eliminarDatosPersonales,
  historial
};
