'use strict';

/**
 * Repositorio de proveedores y sus servicios (RF-PRO-01..03).
 */

const { pool } = require('../config/baseDatos');

const CAMPOS_SELECT = `p.id_proveedor, p.nombre_empresa, p.tipo_servicio, p.contacto_nombre,
                       p.contacto_email, p.telefono_contacto, p.direccion,
                       p.fecha_registro, p.fecha_modificacion`;

async function listar({ nombre, tipoServicio, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (nombre) {
    condiciones.push('p.nombre_empresa LIKE ?');
    parametros.push(`%${nombre}%`);
  }
  if (tipoServicio) {
    condiciones.push('p.tipo_servicio = ?');
    parametros.push(tipoServicio);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT} FROM proveedores p ${donde} ORDER BY p.id_proveedor ASC LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(`SELECT COUNT(*) AS total FROM proveedores p ${donde}`, parametros);

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idProveedor) {
  const [filas] = await pool.query(`SELECT ${CAMPOS_SELECT} FROM proveedores p WHERE p.id_proveedor = ?`, [idProveedor]);
  return filas[0] || null;
}

async function crear({ nombreEmpresa, tipoServicio, contactoNombre, contactoEmail, telefonoContacto, direccion }) {
  const [resultado] = await pool.query(
    `INSERT INTO proveedores (nombre_empresa, tipo_servicio, contacto_nombre, contacto_email, telefono_contacto, direccion)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombreEmpresa, tipoServicio, contactoNombre, contactoEmail, telefonoContacto, direccion]
  );
  return resultado.insertId;
}

async function actualizar(idProveedor, { nombreEmpresa, tipoServicio, contactoNombre, contactoEmail, telefonoContacto, direccion }) {
  await pool.query(
    `UPDATE proveedores
        SET nombre_empresa = ?, tipo_servicio = ?, contacto_nombre = ?, contacto_email = ?, telefono_contacto = ?, direccion = ?
      WHERE id_proveedor = ?`,
    [nombreEmpresa, tipoServicio, contactoNombre, contactoEmail, telefonoContacto, direccion, idProveedor]
  );
}

async function listarServicios(idProveedor) {
  const [filas] = await pool.query(
    `SELECT id_servicio, id_proveedor, nombre_servicio, descripcion, precio, disponible
       FROM servicios_proveedor
      WHERE id_proveedor = ?
      ORDER BY id_servicio ASC`,
    [idProveedor]
  );
  return filas;
}

async function crearServicio(idProveedor, { nombreServicio, descripcion, precio, disponible }) {
  const [resultado] = await pool.query(
    `INSERT INTO servicios_proveedor (id_proveedor, nombre_servicio, descripcion, precio, disponible)
     VALUES (?, ?, ?, ?, ?)`,
    [idProveedor, nombreServicio, descripcion, precio, disponible ? 1 : 0]
  );
  return resultado.insertId;
}

module.exports = { listar, obtenerPorId, crear, actualizar, listarServicios, crearServicio };
