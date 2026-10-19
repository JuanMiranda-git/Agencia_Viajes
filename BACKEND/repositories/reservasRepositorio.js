'use strict';

/**
 * Repositorio de reservas (RF-RES-01..05).
 */

const { pool } = require('../config/baseDatos');

const CAMPOS_SELECT = `r.id_reserva, r.id_cliente, CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
                       r.id_usuario, r.id_paquete, p.nombre_paquete, p.precio AS precio_paquete,
                       r.fecha_reserva, r.fecha_viaje, r.num_pasajeros, r.estado_reserva, r.total,
                       r.numero_reserva, r.fecha_modificacion`;

async function listar({ estado, idCliente, fechaDesde, fechaHasta, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (estado) {
    condiciones.push('r.estado_reserva = ?');
    parametros.push(estado);
  }
  if (idCliente) {
    condiciones.push('r.id_cliente = ?');
    parametros.push(idCliente);
  }
  if (fechaDesde) {
    condiciones.push('r.fecha_viaje >= ?');
    parametros.push(fechaDesde);
  }
  if (fechaHasta) {
    condiciones.push('r.fecha_viaje <= ?');
    parametros.push(fechaHasta);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM reservas r
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
       ${donde}
       ORDER BY r.id_reserva DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM reservas r
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idReserva) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM reservas r
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
      WHERE r.id_reserva = ?`,
    [idReserva]
  );
  return filas[0] || null;
}

async function crear({ idCliente, idUsuario, idPaquete, fechaViaje, numPasajeros, total }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO reservas (id_cliente, id_usuario, id_paquete, fecha_viaje, num_pasajeros, estado_reserva, total)
     VALUES (?, ?, ?, ?, ?, 'Pendiente', ?)`,
    [idCliente, idUsuario, idPaquete, fechaViaje, numPasajeros, total]
  );
  return resultado.insertId;
}

async function cambiarEstado(idReserva, { estadoReserva, numeroReserva = null }, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('UPDATE reservas SET estado_reserva = ?, numero_reserva = COALESCE(?, numero_reserva) WHERE id_reserva = ?', [
    estadoReserva,
    numeroReserva,
    idReserva
  ]);
}

async function obtenerPorNumero(numeroReserva) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM reservas r
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
      WHERE r.numero_reserva = ?`,
    [numeroReserva]
  );
  return filas[0] || null;
}

/**
 * Suma de pasajeros ya reservados (no cancelados) para un paquete en una fecha.
 * Sirve como aproximacion de disponibilidad (el esquema no tiene tabla de cupos).
 */
async function sumarPasajerosReservados(idPaquete, fechaViaje) {
  const [filas] = await pool.query(
    `SELECT COALESCE(SUM(num_pasajeros), 0) AS pasajeros
       FROM reservas
      WHERE id_paquete = ?
        AND fecha_viaje = ?
        AND estado_reserva <> 'Cancelada'`,
    [idPaquete, fechaViaje]
  );
  return filas[0].pasajeros;
}

async function existeNumero(numeroReserva) {
  const [filas] = await pool.query('SELECT 1 AS existe FROM reservas WHERE numero_reserva = ?', [numeroReserva]);
  return filas.length > 0;
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  cambiarEstado,
  obtenerPorNumero,
  sumarPasajerosReservados,
  existeNumero
};
