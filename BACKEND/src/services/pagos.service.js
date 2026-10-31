'use strict';

/**
 * Servicio de pagos (RF-VEN-02, RF-VEN-04).
 * Pago es un objeto de valor sin tabla propia: se expone como fachada sobre ventas.
 */

const ventasService = require('./ventas.service');

async function listarPagos(consulta) {
  return ventasService.listarVentas(consulta);
}

async function obtenerPago(idVenta) {
  return ventasService.obtenerVenta(idVenta);
}

async function crearPago(datos, contexto) {
  return ventasService.registrarPago(datos.idVenta, datos, contexto);
}

async function actualizarPago(idVenta, datos, contexto) {
  return ventasService.actualizarVenta(idVenta, datos, contexto);
}

async function actualizarParcialPago(idVenta, datos, contexto) {
  return ventasService.actualizarVenta(idVenta, datos, contexto);
}

module.exports = {
  listarPagos,
  obtenerPago,
  crearPago,
  actualizarPago,
  actualizarParcialPago
};
