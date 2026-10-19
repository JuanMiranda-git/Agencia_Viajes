'use strict';

/**
 * Servicio de informes de desempeno (RF-DES-02, RF-VEN-04).
 */

const ErrorApi = require('../utils/ErrorApi');
const informesRepositorio = require('../repositories/informesRepositorio');

function normalizarRango(consulta = {}) {
  const hoy = new Date();
  const haceTreintaDias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

  const formatearFecha = (fecha) => fecha.toISOString().slice(0, 10);

  const fechaDesde = consulta.fechaDesde || formatearFecha(haceTreintaDias);
  const fechaHasta = consulta.fechaHasta || formatearFecha(hoy);

  if (Date.parse(fechaDesde) > Date.parse(fechaHasta)) {
    throw ErrorApi.solicitudInvalida('La fecha inicial no puede ser posterior a la fecha final', [
      { campo: 'fechaDesde', mensaje: 'Rango de fechas invalido' }
    ]);
  }

  return { fechaDesde, fechaHasta };
}

/**
 * Desempeno por paquete: reservas, ingresos pagados y calificacion promedio.
 */
async function obtenerDesempenoPorPaquete(consulta) {
  const rango = normalizarRango(consulta);
  const filas = await informesRepositorio.desempenoPorPaquete(rango);
  return {
    rango,
    desempeno: filas.map((fila) => ({
      idPaquete: fila.id_paquete,
      nombrePaquete: fila.nombre_paquete,
      precio: fila.precio,
      totalReservas: Number(fila.total_reservas),
      ingresosPagados: fila.ingresos_pagados,
      promedioCalificacion: fila.promedio_calificacion
    }))
  };
}

/**
 * Ventas por periodo con totales de ingresos.
 */
async function obtenerVentasPorPeriodo(consulta) {
  const rango = normalizarRango(consulta);
  const filas = await informesRepositorio.ventasPorPeriodo(rango);

  const totales = filas.reduce(
    (acumulado, fila) => ({
      totalVentas: acumulado.totalVentas + Number(fila.total_ventas),
      totalIngresos: acumulado.totalIngresos + Number(fila.total_ingresos)
    }),
    { totalVentas: 0, totalIngresos: 0 }
  );

  return {
    rango,
    detalle: filas.map((fila) => ({
      fecha: fila.fecha,
      totalVentas: Number(fila.total_ventas),
      totalIngresos: fila.total_ingresos,
      ventasPagadas: Number(fila.ventas_pagadas),
      ventasPendientes: Number(fila.ventas_pendientes)
    })),
    totales
  };
}

module.exports = { obtenerDesempenoPorPaquete, obtenerVentasPorPeriodo };
