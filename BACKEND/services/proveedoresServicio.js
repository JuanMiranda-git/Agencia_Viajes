'use strict';

/**
 * Servicio de proveedores y sus servicios (RF-PRO-01..03, RN-01).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Proveedor = require('../models/Proveedor');
const ServicioProveedor = require('../models/ServicioProveedor');
const proveedoresRepositorio = require('../repositories/proveedoresRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');

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
  const { filas, total } = await proveedoresRepositorio.listar({
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
  const fila = await proveedoresRepositorio.obtenerPorId(idProveedor);
  if (!fila) {
    throw ErrorApi.noEncontrado('El proveedor solicitado no existe');
  }
  const proveedor = mapearProveedor(fila);
  const servicios = await proveedoresRepositorio.listarServicios(idProveedor);
  return { ...proveedor, servicios: servicios.map(mapearServicio) };
}

async function crearProveedor(datos, contexto) {
  const idProveedor = await proveedoresRepositorio.crear({
    nombreEmpresa: datos.nombreEmpresa,
    tipoServicio: datos.tipoServicio,
    contactoNombre: datos.contactoNombre,
    contactoEmail: datos.contactoEmail,
    telefonoContacto: datos.telefonoContacto,
    direccion: datos.direccion
  });

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'proveedores',
    idRegistro: idProveedor,
    accion: 'Creacion',
    descripcion: `Proveedor ${datos.nombreEmpresa} creado`
  });

  return { idProveedor };
}

async function actualizarProveedor(idProveedor, datos, contexto) {
  const fila = await proveedoresRepositorio.obtenerPorId(idProveedor);
  if (!fila) {
    throw ErrorApi.noEncontrado('El proveedor solicitado no existe');
  }

  await proveedoresRepositorio.actualizar(idProveedor, {
    nombreEmpresa: datos.nombreEmpresa,
    tipoServicio: datos.tipoServicio,
    contactoNombre: datos.contactoNombre,
    contactoEmail: datos.contactoEmail,
    telefonoContacto: datos.telefonoContacto,
    direccion: datos.direccion
  });

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'proveedores',
    idRegistro: idProveedor,
    accion: 'Actualizacion',
    descripcion: `Proveedor ${datos.nombreEmpresa} actualizado`
  });

  return { mensaje: 'Proveedor actualizado correctamente' };
}

async function listarServiciosDeProveedor(idProveedor) {
  const fila = await proveedoresRepositorio.obtenerPorId(idProveedor);
  if (!fila) {
    throw ErrorApi.noEncontrado('El proveedor solicitado no existe');
  }
  const servicios = await proveedoresRepositorio.listarServicios(idProveedor);
  return servicios.map(mapearServicio);
}

async function crearServicioDeProveedor(idProveedor, datos, contexto) {
  const fila = await proveedoresRepositorio.obtenerPorId(idProveedor);
  if (!fila) {
    throw ErrorApi.noEncontrado('El proveedor solicitado no existe');
  }

  const idServicio = await proveedoresRepositorio.crearServicio(idProveedor, {
    nombreServicio: datos.nombreServicio,
    descripcion: datos.descripcion,
    precio: datos.precio,
    disponible: datos.disponible
  });

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'servicios_proveedor',
    idRegistro: idServicio,
    accion: 'Creacion',
    descripcion: `Servicio ${datos.nombreServicio} registrado para el proveedor ${fila.nombre_empresa}`
  });

  return { idServicio };
}

module.exports = {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  listarServiciosDeProveedor,
  crearServicioDeProveedor
};
