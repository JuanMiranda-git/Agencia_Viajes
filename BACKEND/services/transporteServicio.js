'use strict';

/**
 * Servicio de transporte (RF-TRA-01..02, RN-02).
 * Solo se registra transporte de proveedores con contrato vigente.
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Transporte = require('../models/Transporte');
const transporteRepositorio = require('../repositories/transporteRepositorio');
const proveedoresRepositorio = require('../repositories/proveedoresRepositorio');
const paquetesRepositorio = require('../repositories/paquetesRepositorio');
const contratosServicio = require('./contratosServicio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');

function mapearTransporte(fila) {
  return new Transporte({
    idTransporte: fila.id_transporte,
    tipoTransporte: fila.tipo_transporte,
    idProveedor: fila.id_proveedor,
    idPaquete: fila.id_paquete,
    descripcion: fila.descripcion,
    capacidad: fila.capacidad,
    precio: fila.precio,
    fechaSalida: fila.fecha_salida,
    fechaLlegada: fila.fecha_llegada,
    estadoTransporte: fila.estado_transporte,
    fechaCreacion: fila.fecha_creacion
  }).aJSON();
}

async function listarTransportes(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await transporteRepositorio.listar({
    tipoTransporte: consulta.tipoTransporte,
    estado: consulta.estado,
    idPaquete: consulta.idPaquete,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      ...mapearTransporte(fila),
      nombreEmpresa: fila.nombre_empresa,
      nombrePaquete: fila.nombre_paquete
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerTransporte(idTransporte) {
  const fila = await transporteRepositorio.obtenerPorId(idTransporte);
  if (!fila) {
    throw ErrorApi.noEncontrado('El transporte solicitado no existe');
  }
  return {
    ...mapearTransporte(fila),
    nombreEmpresa: fila.nombre_empresa,
    nombrePaquete: fila.nombre_paquete
  };
}

async function crearTransporte(datos, contexto) {
  const proveedor = await proveedoresRepositorio.obtenerPorId(datos.idProveedor);
  if (!proveedor) {
    throw ErrorApi.solicitudInvalida('El proveedor indicado no existe', [
      { campo: 'idProveedor', mensaje: 'Proveedor inexistente' }
    ]);
  }

  // RN-02: contrato vigente obligatorio para operar con el proveedor.
  await contratosServicio.obtenerContratoVigente(datos.idProveedor, proveedor.nombre_empresa);

  if (datos.idPaquete) {
    const paquete = await paquetesRepositorio.obtenerPorId(datos.idPaquete);
    if (!paquete) {
      throw ErrorApi.solicitudInvalida('El paquete indicado no existe', [
        { campo: 'idPaquete', mensaje: 'Paquete inexistente' }
      ]);
    }
  }

  const transporte = new Transporte({
    tipoTransporte: datos.tipoTransporte,
    idProveedor: datos.idProveedor,
    idPaquete: datos.idPaquete,
    descripcion: datos.descripcion,
    capacidad: datos.capacidad,
    precio: datos.precio,
    fechaSalida: datos.fechaSalida,
    fechaLlegada: datos.fechaLlegada,
    estadoTransporte: datos.estadoTransporte
  });

  const idTransporte = await transporteRepositorio.crear(transporte.aJSON());

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'transporte',
    idRegistro: idTransporte,
    accion: 'Creacion',
    descripcion: `Transporte ${transporte.tipoTransporte} registrado con ${proveedor.nombre_empresa}`
  });

  return { idTransporte };
}

async function actualizarTransporte(idTransporte, datos, contexto) {
  const fila = await transporteRepositorio.obtenerPorId(idTransporte);
  if (!fila) {
    throw ErrorApi.noEncontrado('El transporte solicitado no existe');
  }

  const transporte = new Transporte({
    idTransporte,
    tipoTransporte: datos.tipoTransporte,
    idProveedor: fila.id_proveedor,
    idPaquete: datos.idPaquete !== undefined ? datos.idPaquete : fila.id_paquete,
    descripcion: datos.descripcion,
    capacidad: datos.capacidad,
    precio: datos.precio,
    fechaSalida: datos.fechaSalida,
    fechaLlegada: datos.fechaLlegada,
    estadoTransporte: datos.estadoTransporte
  });

  const { idTransporte: id, ...campos } = transporte.aJSON();
  void id;

  await transporteRepositorio.actualizar(idTransporte, campos);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'transporte',
    idRegistro: idTransporte,
    accion: 'Actualizacion',
    descripcion: `Transporte ${idTransporte} actualizado`
  });

  return { mensaje: 'Transporte actualizado correctamente' };
}

async function cambiarEstadoTransporte(idTransporte, estadoTransporte, contexto) {
  const fila = await transporteRepositorio.obtenerPorId(idTransporte);
  if (!fila) {
    throw ErrorApi.noEncontrado('El transporte solicitado no existe');
  }

  await transporteRepositorio.cambiarEstado(idTransporte, estadoTransporte);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'transporte',
    idRegistro: idTransporte,
    accion: 'Cambio de estado',
    descripcion: `Transporte ${idTransporte} marcado como ${estadoTransporte}`
  });

  return { mensaje: `Transporte marcado como ${estadoTransporte}` };
}

module.exports = {
  listarTransportes,
  obtenerTransporte,
  crearTransporte,
  actualizarTransporte,
  cambiarEstadoTransporte
};
