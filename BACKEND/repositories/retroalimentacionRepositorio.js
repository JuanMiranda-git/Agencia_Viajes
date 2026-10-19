'use strict';

/**
 * Repositorio de retroalimentacion de clientes (RF-DES-01..03).
 */

const { pool } = require('../config/baseDatos');

const CAMPOS_SELECT = `rt.id_retroalimentacion, rt.id_paquete, p.nombre_paquete, rt.id_cliente,
                       CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente, rt.calificacion,
                       rt.comentario, rt.fecha_creacion`;

async function crear({ idPaquete, idCliente, calificacion, comentario }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    'INSERT INTO retroalimentacion (id_paquete, id_cliente, calificacion, comentario) VALUES (?, ?, ?, ?)',
    [idPaquete, idCliente, calificacion, comentario]
  );
  return resultado.insertId;
}

async function listar({ idPaquete, idCliente, calificacion, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idPaquete) {
    condiciones.push('rt.id_paquete = ?');
    parametros.push(idPaquete);
  }
  if (idCliente) {
    condiciones.push('rt.id_cliente = ?');
    parametros.push(idCliente);
  }
  if (calificacion) {
    condiciones.push('rt.calificacion = ?');
    parametros.push(calificacion);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM retroalimentacion rt
       INNER JOIN paquetes_turisticos p ON p.id_paquete = rt.id_paquete
       INNER JOIN clientes c ON c.id_cliente = rt.id_cliente
       ${donde}
       ORDER BY rt.fecha_creacion DESC, rt.id_retroalimentacion DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM retroalimentacion rt
       INNER JOIN paquetes_turisticos p ON p.id_paquete = rt.id_paquete
       INNER JOIN clientes c ON c.id_cliente = rt.id_cliente
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idRetroalimentacion) {
  const [filas] = await pool.query(`SELECT ${CAMPOS_SELECT} FROM retroalimentacion rt
       INNER JOIN paquetes_turisticos p ON p.id_paquete = rt.id_paquete
       INNER JOIN clientes c ON c.id_cliente = rt.id_cliente
      WHERE rt.id_retroalimentacion = ?`, [idRetroalimentacion]);
  return filas[0] || null;
}

/**
 * Promedio y conteo por paquete (RF-DES-02).
 */
async function resumenPorPaquete() {
  const [filas] = await pool.query(
    `SELECT p.id_paquete, p.nombre_paquete,
            COUNT(rt.id_retroalimentacion) AS total_resenas,
            ROUND(AVG(rt.calificacion), 2) AS promedio_calificacion
       FROM paquetes_turisticos p
       LEFT JOIN retroalimentacion rt ON rt.id_paquete = p.id_paquete
      GROUP BY p.id_paquete, p.nombre_paquete
      ORDER BY promedio_calificacion DESC`
  );
  return filas;
}

module.exports = { crear, listar, obtenerPorId, resumenPorPaquete };
