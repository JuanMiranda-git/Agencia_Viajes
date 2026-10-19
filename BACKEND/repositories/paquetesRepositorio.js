'use strict';

/**
 * Repositorio de paquetes turisticos y sus servicios asociados (RF-PAQ-01..05).
 */

const { pool } = require('../config/baseDatos');

async function listar({ nombre, estado, precioMinimo, precioMaximo, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (nombre) {
    condiciones.push('p.nombre_paquete LIKE ?');
    parametros.push(`%${nombre}%`);
  }
  if (estado) {
    condiciones.push('p.estado_paquete = ?');
    parametros.push(estado);
  }
  if (precioMinimo !== undefined && precioMinimo !== null) {
    condiciones.push('p.precio >= ?');
    parametros.push(precioMinimo);
  }
  if (precioMaximo !== undefined && precioMaximo !== null) {
    condiciones.push('p.precio <= ?');
    parametros.push(precioMaximo);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT p.id_paquete, p.nombre_paquete, p.descripcion, p.precio, p.fecha_inicio, p.fecha_fin,
            p.estado_paquete, p.fecha_creacion, p.fecha_modificacion
       FROM paquetes_turisticos p
       ${donde}
       ORDER BY p.id_paquete ASC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(`SELECT COUNT(*) AS total FROM paquetes_turisticos p ${donde}`, parametros);

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idPaquete) {
  const [filas] = await pool.query(
    `SELECT id_paquete, nombre_paquete, descripcion, precio, fecha_inicio, fecha_fin, estado_paquete,
            fecha_creacion, fecha_modificacion
       FROM paquetes_turisticos WHERE id_paquete = ?`,
    [idPaquete]
  );
  return filas[0] || null;
}

async function crear({ nombrePaquete, descripcion, precio, fechaInicio, fechaFin, estadoPaquete }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO paquetes_turisticos (nombre_paquete, descripcion, precio, fecha_inicio, fecha_fin, estado_paquete)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombrePaquete, descripcion, precio, fechaInicio, fechaFin, estadoPaquete]
  );
  return resultado.insertId;
}

async function actualizar(idPaquete, { nombrePaquete, descripcion, precio, fechaInicio, fechaFin, estadoPaquete }) {
  await pool.query(
    `UPDATE paquetes_turisticos
        SET nombre_paquete = ?, descripcion = ?, precio = ?, fecha_inicio = ?, fecha_fin = ?, estado_paquete = ?
      WHERE id_paquete = ?`,
    [nombrePaquete, descripcion, precio, fechaInicio, fechaFin, estadoPaquete, idPaquete]
  );
}

async function cambiarEstado(idPaquete, estadoPaquete) {
  await pool.query('UPDATE paquetes_turisticos SET estado_paquete = ? WHERE id_paquete = ?', [estadoPaquete, idPaquete]);
}

async function listarServicios(idPaquete) {
  const [filas] = await pool.query(
    `SELECT s.id_servicio, s.tipo_servicio, s.descripcion, s.precio
       FROM PAQUETE_SERVICIO ps
       INNER JOIN servicios_paquete s ON s.id_servicio = ps.servicios_paquete_id_servicio
      WHERE ps.paquetes_turisticos_id_paquete = ?
      ORDER BY s.id_servicio ASC`,
    [idPaquete]
  );
  return filas;
}

async function crearServicio({ tipoServicio, descripcion, precio }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    'INSERT INTO servicios_paquete (tipo_servicio, descripcion, precio) VALUES (?, ?, ?)',
    [tipoServicio, descripcion, precio]
  );
  return resultado.insertId;
}

async function asociarServicio(idPaquete, idServicio, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('INSERT INTO PAQUETE_SERVICIO (paquetes_turisticos_id_paquete, servicios_paquete_id_servicio) VALUES (?, ?)', [
    idPaquete,
    idServicio
  ]);
}

async function quitarServicio(idPaquete, idServicio) {
  const [resultado] = await pool.query(
    'DELETE FROM PAQUETE_SERVICIO WHERE paquetes_turisticos_id_paquete = ? AND servicios_paquete_id_servicio = ?',
    [idPaquete, idServicio]
  );
  return resultado.affectedRows;
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  cambiarEstado,
  listarServicios,
  crearServicio,
  asociarServicio,
  quitarServicio
};
