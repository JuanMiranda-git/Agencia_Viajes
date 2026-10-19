'use strict';

/**
 * Repositorio de ventas (RF-VEN-01..04).
 */

const { pool } = require('../config/baseDatos');

const CAMPOS_SELECT = `v.id_venta, v.id_reserva, r.numero_reserva, r.id_cliente,
                       CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente, r.id_paquete, p.nombre_paquete,
                       v.monto, v.fecha_venta, v.metodo_pago, v.estado_venta, v.comprobante_ruta, v.fecha_modificacion`;

async function listar({ estado, fechaDesde, fechaHasta, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (estado) {
    condiciones.push('v.estado_venta = ?');
    parametros.push(estado);
  }
  if (fechaDesde) {
    condiciones.push('DATE(v.fecha_venta) >= ?');
    parametros.push(fechaDesde);
  }
  if (fechaHasta) {
    condiciones.push('DATE(v.fecha_venta) <= ?');
    parametros.push(fechaHasta);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM ventas v
       INNER JOIN reservas r ON r.id_reserva = v.id_reserva
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
       ${donde}
       ORDER BY v.id_venta DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM ventas v
       INNER JOIN reservas r ON r.id_reserva = v.id_reserva
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idVenta) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM ventas v
       INNER JOIN reservas r ON r.id_reserva = v.id_reserva
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
      WHERE v.id_venta = ?`,
    [idVenta]
  );
  return filas[0] || null;
}

async function obtenerPorReserva(idReserva) {
  const [filas] = await pool.query('SELECT * FROM ventas WHERE id_reserva = ?', [idReserva]);
  return filas[0] || null;
}

async function crear({ idReserva, monto, metodoPago, estadoVenta, comprobanteRuta = null }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO ventas (id_reserva, monto, metodo_pago, estado_venta, comprobante_ruta)
     VALUES (?, ?, ?, ?, ?)`,
    [idReserva, monto, metodoPago, estadoVenta, comprobanteRuta]
  );
  return resultado.insertId;
}

async function actualizarEstado(idVenta, { estadoVenta, comprobanteRuta = null }, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('UPDATE ventas SET estado_venta = ?, comprobante_ruta = COALESCE(?, comprobante_ruta) WHERE id_venta = ?', [
    estadoVenta,
    comprobanteRuta,
    idVenta
  ]);
}

module.exports = { listar, obtenerPorId, obtenerPorReserva, crear, actualizarEstado };
