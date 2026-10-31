'use strict';

/**
 * Servicio de informes de desempeno (RF-DES-02, RF-VEN-04).
 */

const AppError = require('../utils/AppError');
const { pool } = require('../config/database');

function normalizarRango(consulta = {}) {
  const hoy = new Date();
  const haceTreintaDias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

  const formatearFecha = (fecha) => fecha.toISOString().slice(0, 10);

  const fechaDesde = consulta.fechaDesde || formatearFecha(haceTreintaDias);
  const fechaHasta = consulta.fechaHasta || formatearFecha(hoy);

  if (Date.parse(fechaDesde) > Date.parse(fechaHasta)) {
    throw AppError.solicitudInvalida('La fecha inicial no puede ser posterior a la fecha final', [
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
  const filas = await desempenoPorPaquete(rango);
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
  const filas = await ventasPorPeriodo(rango);

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

async function desempenoPorPaquete({ fechaDesde, fechaHasta }) {
  const [filas] = await pool.query(
    `SELECT p.id_paquete, p.nombre_paquete, p.precio,
            COUNT(DISTINCT r.id_reserva) AS total_reservas,
            COALESCE(SUM(v.monto), 0) AS ingresos_pagados,
            ROUND(AVG(rt.calificacion), 2) AS promedio_calificacion
       FROM paquetes_turisticos p
       LEFT JOIN reservas r ON r.id_paquete = p.id_paquete AND DATE(r.fecha_reserva) BETWEEN ? AND ?
       LEFT JOIN ventas v ON v.id_reserva = r.id_reserva AND v.estado_venta = 'Pagada'
       LEFT JOIN retroalimentacion rt ON rt.id_paquete = p.id_paquete
      GROUP BY p.id_paquete, p.nombre_paquete, p.precio
      ORDER BY ingresos_pagados DESC`,
    [fechaDesde, fechaHasta]
  );
  return filas;
}

async function ventasPorPeriodo({ fechaDesde, fechaHasta }) {
  const [filas] = await pool.query(
    `SELECT DATE(v.fecha_venta) AS fecha,
            COUNT(v.id_venta) AS total_ventas,
            COALESCE(SUM(v.monto), 0) AS total_ingresos,
            SUM(CASE WHEN v.estado_venta = 'Pagada' THEN 1 ELSE 0 END) AS ventas_pagadas,
            SUM(CASE WHEN v.estado_venta <> 'Pagada' THEN 1 ELSE 0 END) AS ventas_pendientes
       FROM ventas v
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      GROUP BY DATE(v.fecha_venta)
      ORDER BY fecha ASC`,
    [fechaDesde, fechaHasta]
  );
  return filas;
}

module.exports = { obtenerDesempenoPorPaquete, obtenerVentasPorPeriodo };
