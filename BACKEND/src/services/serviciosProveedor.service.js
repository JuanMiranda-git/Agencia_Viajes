'use strict';

/**
 * Servicio del catalogo de servicios de proveedor (RF-PRO-03).
 */

const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const ServicioProveedor = require('../models/ServicioProveedor');
const proveedoresService = require('./proveedores.service');
const bitacoraService = require('./bitacora.service');
const { pool } = require('../config/database');

function mapearServicio(fila) {
  return new ServicioProveedor({
    idServicio: fila.id_servicio,
    idProveedor: fila.id_proveedor,
    nombreServicio: fila.nombre_servicio,
    descripcion: fila.descripcion,
    precio: fila.precio,
    disponible: fila.disponible
  }).aJSON();
}

async function listarServiciosProveedor(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    idProveedor: consulta.idProveedor,
    nombre: consulta.nombre,
    disponible: consulta.disponible,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      ...mapearServicio(fila),
      nombreEmpresa: fila.nombre_empresa
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerServicioProveedor(idServicio) {
  const fila = await obtenerPorId(idServicio);
  if (!fila) {
    throw AppError.noEncontrado('El servicio de proveedor solicitado no existe');
  }
  return {
    ...mapearServicio(fila),
    nombreEmpresa: fila.nombre_empresa
  };
}

async function crearServicioProveedor(datos, contexto) {
  const proveedor = await proveedoresService.datos.obtenerPorId(datos.idProveedor);
  if (!proveedor) {
    throw AppError.solicitudInvalida('El proveedor indicado no existe', [
      { campo: 'idProveedor', mensaje: 'Proveedor inexistente' }
    ]);
  }

  const servicio = new ServicioProveedor({
    idProveedor: datos.idProveedor,
    nombreServicio: datos.nombreServicio,
    descripcion: datos.descripcion,
    precio: datos.precio,
    disponible: datos.disponible
  });

  const idServicio = await crear(servicio.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'servicios_proveedor',
    idRegistro: idServicio,
    accion: 'Creacion',
    descripcion: `Servicio ${servicio.nombreServicio} creado para ${proveedor.nombre_empresa}`
  });

  return obtenerServicioProveedor(idServicio);
}

async function actualizarServicioProveedor(idServicio, datos, contexto) {
  const fila = await obtenerPorId(idServicio);
  if (!fila) {
    throw AppError.noEncontrado('El servicio de proveedor solicitado no existe');
  }

  const idProveedor = datos.idProveedor !== undefined ? datos.idProveedor : fila.id_proveedor;
  if (datos.idProveedor !== undefined && Number(datos.idProveedor) !== Number(fila.id_proveedor)) {
    const proveedor = await proveedoresService.datos.obtenerPorId(idProveedor);
    if (!proveedor) {
      throw AppError.solicitudInvalida('El proveedor indicado no existe', [
        { campo: 'idProveedor', mensaje: 'Proveedor inexistente' }
      ]);
    }
  }

  const servicio = new ServicioProveedor({
    idServicio,
    idProveedor,
    nombreServicio: datos.nombreServicio !== undefined ? datos.nombreServicio : fila.nombre_servicio,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : fila.descripcion,
    precio: datos.precio !== undefined ? datos.precio : fila.precio,
    disponible: datos.disponible !== undefined ? datos.disponible : fila.disponible
  });

  await actualizar(idServicio, servicio.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'servicios_proveedor',
    idRegistro: idServicio,
    accion: 'Actualizacion',
    descripcion: `Servicio ${servicio.nombreServicio} actualizado`
  });

  return obtenerServicioProveedor(idServicio);
}

async function actualizarParcialServicioProveedor(idServicio, datos, contexto) {
  return actualizarServicioProveedor(idServicio, datos, contexto);
}

async function listar({ idProveedor, nombre, disponible, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idProveedor) {
    condiciones.push('s.id_proveedor = ?');
    parametros.push(idProveedor);
  }
  if (nombre) {
    condiciones.push('s.nombre_servicio LIKE ?');
    parametros.push(`%${nombre}%`);
  }
  if (disponible !== undefined && disponible !== null && disponible !== '') {
    condiciones.push('s.disponible = ?');
    parametros.push(disponible === true || disponible === 'true' || disponible === '1' ? 1 : 0);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT s.id_servicio, s.id_proveedor, pr.nombre_empresa, s.nombre_servicio, s.descripcion,
            s.precio, s.disponible
       FROM servicios_proveedor s
       INNER JOIN proveedores pr ON pr.id_proveedor = s.id_proveedor
       ${donde}
       ORDER BY s.id_servicio ASC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM servicios_proveedor s
       INNER JOIN proveedores pr ON pr.id_proveedor = s.id_proveedor
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idServicio) {
  const [filas] = await pool.query(
    `SELECT s.id_servicio, s.id_proveedor, pr.nombre_empresa, s.nombre_servicio, s.descripcion,
            s.precio, s.disponible
       FROM servicios_proveedor s
       INNER JOIN proveedores pr ON pr.id_proveedor = s.id_proveedor
      WHERE s.id_servicio = ?`,
    [idServicio]
  );
  return filas[0] || null;
}

async function crear({ idProveedor, nombreServicio, descripcion, precio, disponible }) {
  const [resultado] = await pool.query(
    `INSERT INTO servicios_proveedor (id_proveedor, nombre_servicio, descripcion, precio, disponible)
     VALUES (?, ?, ?, ?, ?)`,
    [idProveedor, nombreServicio, descripcion, precio, disponible ? 1 : 0]
  );
  return resultado.insertId;
}

async function actualizar(idServicio, { idProveedor, nombreServicio, descripcion, precio, disponible }) {
  await pool.query(
    `UPDATE servicios_proveedor
        SET id_proveedor = ?, nombre_servicio = ?, descripcion = ?, precio = ?, disponible = ?
      WHERE id_servicio = ?`,
    [idProveedor, nombreServicio, descripcion, precio, disponible ? 1 : 0, idServicio]
  );
}

module.exports = {
  listarServiciosProveedor,
  obtenerServicioProveedor,
  crearServicioProveedor,
  actualizarServicioProveedor,
  actualizarParcialServicioProveedor
};
