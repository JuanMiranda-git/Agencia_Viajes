'use strict';

/**
 * Repositorio de CRM: interacciones y consultas del historial del cliente (RF-CRM-01..03).
 */

const { pool } = require('../config/baseDatos');

async function crear({ idCliente, tipoInteraccion, descripcion, resultado }, conexion = null) {
  const ejecutor = conexion || pool;
  const [res] = await ejecutor.query(
    'INSERT INTO crm (id_cliente, tipo_interaccion, descripcion, resultado) VALUES (?, ?, ?, ?)',
    [idCliente, tipoInteraccion, descripcion, resultado]
  );
  return res.insertId;
}

async function listar({ idCliente, tipoInteraccion, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idCliente) {
    condiciones.push('crm.id_cliente = ?');
    parametros.push(idCliente);
  }
  if (tipoInteraccion) {
    condiciones.push('crm.tipo_interaccion = ?');
    parametros.push(tipoInteraccion);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT crm.id_interaccion, crm.id_cliente, CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
            crm.tipo_interaccion, crm.fecha_interaccion, crm.descripcion, crm.resultado
       FROM crm
       INNER JOIN clientes c ON c.id_cliente = crm.id_cliente
       ${donde}
       ORDER BY crm.fecha_interaccion DESC, crm.id_interaccion DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM crm INNER JOIN clientes c ON c.id_cliente = crm.id_cliente ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idInteraccion) {
  const [filas] = await pool.query('SELECT * FROM crm WHERE id_interaccion = ?', [idInteraccion]);
  return filas[0] || null;
}

async function reservasDeCliente(idCliente) {
  const [filas] = await pool.query(
    `SELECT r.id_reserva, r.numero_reserva, r.fecha_reserva, r.fecha_viaje, r.num_pasajeros,
            r.estado_reserva, r.total, p.nombre_paquete
       FROM reservas r
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
      WHERE r.id_cliente = ?
      ORDER BY r.fecha_reserva DESC`,
    [idCliente]
  );
  return filas;
}

module.exports = { crear, listar, obtenerPorId, reservasDeCliente };
