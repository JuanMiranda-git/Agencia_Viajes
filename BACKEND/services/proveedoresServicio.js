'use strict';

/**
 * Servicio de proveedores y sus servicios (RF-PRO-01..03, RN-01).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Proveedor = require('../models/Proveedor');
const ServicioProveedor = require('../models/ServicioProveedor');
const bitacoraServicio = require('./bitacoraServicio');
const { pool } = require('../config/baseDatos');

function mapearProveedor(fila) {
  return new Proveedor({
    idProveedor: fila.id_proveedor,
    nombreEmpresa: fila.nombre_empresa,
    tipoServicio: fila.tipo_servicio,
    contactoNombre: fila.contacto_nombre,
    contactoEmail: fila.contacto_email,
    telefonoContacto: fila.telefono_contacto,
    direccion: fila.direccion,
    fechaRegistro: fila.fecha_registro,
    fechaModificacion: fila.fecha_modificacion
  }).aJSON();
}

function mapearServicio(fila) {
  return new ServicioProveedor({
    idServicio: fila.id_servicio,
    idProveedor: fila.id_proveedor,
    nombreServicio: fila.nombre_servicio,
    descripcion: fila.descripcion,
    precio: fila.precio,
    disponible: fila.disponible === 1 || fila.disponible === true
  }).aJSON();
}

async function listarProveedores(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    nombre: consulta.nombre,
    tipoServicio: consulta.tipoServicio,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map(mapearProveedor),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerProveedor(idProveedor) {
  const fila = await obtenerPorId(idProveedor);
  if (!fila) {
    throw ErrorApi.noEncontrado('El proveedor solicitado no existe');
  }
  const proveedor = mapearProveedor(fila);
  const servicios = await listarServicios(idProveedor);
  return { ...proveedor, servicios: servicios.map(mapearServicio) };
}

async function crearProveedor(datos, contexto) {
  const idProveedor = await crear({
    nombreEmpresa: datos.nombreEmpresa,
    tipoServicio: datos.tipoServicio,
    contactoNombre: datos.contactoNombre,
    contactoEmail: datos.contactoEmail,
    telefonoContacto: datos.telefonoContacto,
    direccion: datos.direccion
  });

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'proveedores',
    idRegistro: idProveedor,
    accion: 'Creacion',
    descripcion: `Proveedor ${datos.nombreEmpresa} creado`
  });

  return { idProveedor };
}

async function actualizarProveedor(idProveedor, datos, contexto) {
  const fila = await obtenerPorId(idProveedor);
  if (!fila) {
    throw ErrorApi.noEncontrado('El proveedor solicitado no existe');
  }

  await actualizar(idProveedor, {
    nombreEmpresa: datos.nombreEmpresa,
    tipoServicio: datos.tipoServicio,
    contactoNombre: datos.contactoNombre,
    contactoEmail: datos.contactoEmail,
    telefonoContacto: datos.telefonoContacto,
    direccion: datos.direccion
  });

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'proveedores',
    idRegistro: idProveedor,
    accion: 'Actualizacion',
    descripcion: `Proveedor ${datos.nombreEmpresa} actualizado`
  });

  return { mensaje: 'Proveedor actualizado correctamente' };
}

async function listarServiciosDeProveedor(idProveedor) {
  const fila = await obtenerPorId(idProveedor);
  if (!fila) {
    throw ErrorApi.noEncontrado('El proveedor solicitado no existe');
  }
  const servicios = await listarServicios(idProveedor);
  return servicios.map(mapearServicio);
}

async function crearServicioDeProveedor(idProveedor, datos, contexto) {
  const fila = await obtenerPorId(idProveedor);
  if (!fila) {
    throw ErrorApi.noEncontrado('El proveedor solicitado no existe');
  }

  const idServicio = await crearServicio(idProveedor, {
    nombreServicio: datos.nombreServicio,
    descripcion: datos.descripcion,
    precio: datos.precio,
    disponible: datos.disponible
  });

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'servicios_proveedor',
    idRegistro: idServicio,
    accion: 'Creacion',
    descripcion: `Servicio ${datos.nombreServicio} registrado para el proveedor ${fila.nombre_empresa}`
  });

  return { idServicio };
}

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

module.exports = {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  listarServiciosDeProveedor,
  crearServicioDeProveedor,
  datos: { obtenerPorId }
};
