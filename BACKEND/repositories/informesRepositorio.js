'use strict';

/**
 * Repositorio de informes de desempeno (RF-DES-02, RF-VEN-04).
 * Consultas agregadas de solo lectura.
 */

const { pool } = require('../config/baseDatos');

/**
 * Desempeno por paquete: reservas, ventas pagadas, ingresos y calificacion promedio.
 */
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

/**
 * Ventas agrupadas por periodo con ingresos totales (RF-VEN-04).
 */
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

module.exports = { desempenoPorPaquete, ventasPorPeriodo };
