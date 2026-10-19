'use strict';

/**
 * Repositorio de clientes (incluye soporte Ley 1581 de 2012).
 */

const { pool } = require('../config/baseDatos');

const CAMPOS_SELECT = `c.id_cliente, c.nombre, c.apellido, c.email, c.telefono, c.direccion,
                       c.categoria_cliente, c.consentimiento_datos, c.fecha_consentimiento, c.fecha_registro`;

async function listar({ nombre, email, categoria, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (nombre) {
    condiciones.push('(c.nombre LIKE ? OR c.apellido LIKE ?)');
    parametros.push(`%${nombre}%`, `%${nombre}%`);
  }
  if (email) {
    condiciones.push('c.email LIKE ?');
    parametros.push(`%${email}%`);
  }
  if (categoria) {
    condiciones.push('c.categoria_cliente = ?');
    parametros.push(categoria);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT} FROM clientes c ${donde} ORDER BY c.id_cliente ASC LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(`SELECT COUNT(*) AS total FROM clientes c ${donde}`, parametros);

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idCliente) {
  const [filas] = await pool.query(`SELECT ${CAMPOS_SELECT} FROM clientes c WHERE c.id_cliente = ?`, [idCliente]);
  return filas[0] || null;
}

async function obtenerPorEmail(email) {
  const [filas] = await pool.query(`SELECT ${CAMPOS_SELECT} FROM clientes c WHERE c.email = ?`, [email]);
  return filas[0] || null;
}

async function existeEmail(email, exceptoId = null) {
  const parametros = [email];
  let condicionExtra = '';
  if (exceptoId) {
    condicionExtra = 'AND id_cliente <> ?';
    parametros.push(exceptoId);
  }
  const [filas] = await pool.query(`SELECT 1 AS existe FROM clientes WHERE email = ? ${condicionExtra}`, parametros);
  return filas.length > 0;
}

async function crear({ nombre, apellido, email, telefono, direccion, categoriaCliente, consentimientoDatos }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO clientes (nombre, apellido, email, telefono, direccion, categoria_cliente, consentimiento_datos, fecha_consentimiento)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      categoriaCliente,
      consentimientoDatos ? 1 : 0,
      consentimientoDatos ? new Date() : null
    ]
  );
  return resultado.insertId;
}

async function actualizar(idCliente, { nombre, apellido, telefono, direccion, categoriaCliente }) {
  await pool.query(
    `UPDATE clientes SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, categoria_cliente = ? WHERE id_cliente = ?`,
    [nombre, apellido, telefono, direccion, categoriaCliente, idCliente]
  );
}

/**
 * Rectificacion de datos personales (Ley 1581): actualiza los datos de contacto.
 */
async function actualizarDatosPersonales(idCliente, { nombre, apellido, email, telefono, direccion, consentimientoDatos }) {
  await pool.query(
    `UPDATE clientes
        SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ?,
            consentimiento_datos = ?, fecha_consentimiento = COALESCE(fecha_consentimiento, ?)
      WHERE id_cliente = ?`,
    [nombre, apellido, email, telefono, direccion, consentimientoDatos ? 1 : 0, new Date(), idCliente]
  );
}

/**
 * Supresion (anonimizacion) de datos personales: conserva la fila por integridad
 * referencial (reservas) pero elimina los datos que identifican a la persona.
 */
async function anonimizar(idCliente) {
  const [resultado] = await pool.query(
    `UPDATE clientes
        SET nombre = 'Anonimo', apellido = 'Anonimo', email = CONCAT('anonimo+', id_cliente, '@eliminado.local'),
            telefono = NULL, direccion = NULL, categoria_cliente = NULL, consentimiento_datos = 0
      WHERE id_cliente = ?`,
    [idCliente]
  );
  return resultado.affectedRows;
}

module.exports = {
  listar,
  obtenerPorId,
  obtenerPorEmail,
  existeEmail,
  crear,
  actualizar,
  actualizarDatosPersonales,
  anonimizar
};
