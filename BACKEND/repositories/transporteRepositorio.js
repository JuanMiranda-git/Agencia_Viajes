'use strict';

/**
 * Repositorio de transporte (RF-TRA-01..02).
 */

const { pool } = require('../config/baseDatos');

const CAMPOS_SELECT = `t.id_transporte, t.tipo_transporte, t.id_proveedor, pr.nombre_empresa, t.id_paquete,
                       p.nombre_paquete, t.descripcion, t.capacidad, t.precio, t.fecha_salida, t.fecha_llegada,
                       t.estado_transporte, t.fecha_creacion`;

async function listar({ tipoTransporte, estado, idPaquete, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (tipoTransporte) {
    condiciones.push('t.tipo_transporte = ?');
    parametros.push(tipoTransporte);
  }
  if (estado) {
    condiciones.push('t.estado_transporte = ?');
    parametros.push(estado);
  }
  if (idPaquete) {
    condiciones.push('t.id_paquete = ?');
    parametros.push(idPaquete);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM transporte t
       INNER JOIN proveedores pr ON pr.id_proveedor = t.id_proveedor
       LEFT JOIN paquetes_turisticos p ON p.id_paquete = t.id_paquete
       ${donde}
       ORDER BY t.id_transporte ASC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM transporte t
       INNER JOIN proveedores pr ON pr.id_proveedor = t.id_proveedor
       LEFT JOIN paquetes_turisticos p ON p.id_paquete = t.id_paquete
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idTransporte) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM transporte t
       INNER JOIN proveedores pr ON pr.id_proveedor = t.id_proveedor
       LEFT JOIN paquetes_turisticos p ON p.id_paquete = t.id_paquete
      WHERE t.id_transporte = ?`,
    [idTransporte]
  );
  return filas[0] || null;
}

async function crear({ tipoTransporte, idProveedor, idPaquete, descripcion, capacidad, precio, fechaSalida, fechaLlegada, estadoTransporte }) {
  const [resultado] = await pool.query(
    `INSERT INTO transporte (tipo_transporte, id_proveedor, id_paquete, descripcion, capacidad, precio, fecha_salida, fecha_llegada, estado_transporte)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tipoTransporte, idProveedor, idPaquete, descripcion, capacidad, precio, fechaSalida, fechaLlegada, estadoTransporte]
  );
  return resultado.insertId;
}

async function actualizar(idTransporte, { tipoTransporte, idProveedor, idPaquete, descripcion, capacidad, precio, fechaSalida, fechaLlegada, estadoTransporte }) {
  await pool.query(
    `UPDATE transporte
        SET tipo_transporte = ?, id_proveedor = ?, id_paquete = ?, descripcion = ?, capacidad = ?, precio = ?,
            fecha_salida = ?, fecha_llegada = ?, estado_transporte = ?
      WHERE id_transporte = ?`,
    [tipoTransporte, idProveedor, idPaquete, descripcion, capacidad, precio, fechaSalida, fechaLlegada, estadoTransporte, idTransporte]
  );
}

async function cambiarEstado(idTransporte, estadoTransporte) {
  await pool.query('UPDATE transporte SET estado_transporte = ? WHERE id_transporte = ?', [estadoTransporte, idTransporte]);
}

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarEstado };
