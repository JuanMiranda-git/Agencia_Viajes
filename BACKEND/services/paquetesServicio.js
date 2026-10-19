'use strict';

/**
 * Servicio de paquetes turisticos y servicios del paquete (RF-PAQ-01..05).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const PaqueteTuristico = require('../models/PaqueteTuristico');
const ServicioPaquete = require('../models/ServicioPaquete');
const paquetesRepositorio = require('../repositories/paquetesRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');
const { ejecutarTransaccion } = require('../config/baseDatos');

function mapearPaquete(fila) {
  return new PaqueteTuristico({
    idPaquete: fila.id_paquete,
    nombrePaquete: fila.nombre_paquete,
    descripcion: fila.descripcion,
    precio: fila.precio,
    fechaInicio: fila.fecha_inicio,
    fechaFin: fila.fecha_fin,
    estadoPaquete: fila.estado_paquete,
    fechaCreacion: fila.fecha_creacion,
    fechaModificacion: fila.fecha_modificacion
  }).aJSON();
}

function mapearServicioPaquete(fila) {
  return new ServicioPaquete({
    idServicio: fila.id_servicio,
    tipoServicio: fila.tipo_servicio,
    descripcion: fila.descripcion,
    precio: fila.precio
  }).aJSON();
}

async function listarPaquetes(consulta, opciones = {}) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const estado = opciones.soloActivos ? 'Activo' : consulta.estado;

  const { filas, total } = await paquetesRepositorio.listar({
    nombre: consulta.nombre,
    estado,
    precioMinimo: consulta.precioMinimo,
    precioMaximo: consulta.precioMaximo,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map(mapearPaquete),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerPaquete(idPaquete) {
  const fila = await paquetesRepositorio.obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }
  const paquete = mapearPaquete(fila);
  const servicios = await paquetesRepositorio.listarServicios(idPaquete);
  return { ...paquete, servicios: servicios.map(mapearServicioPaquete) };
}

async function crearPaquete(datos, contexto) {
  const paquete = new PaqueteTuristico({
    nombrePaquete: datos.nombrePaquete,
    descripcion: datos.descripcion,
    precio: datos.precio,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    estadoPaquete: datos.estadoPaquete
  });

  const idPaquete = await paquetesRepositorio.crear(paquete.aJSON());

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'paquetes_turisticos',
    idRegistro: idPaquete,
    accion: 'Creacion',
    descripcion: `Paquete ${paquete.nombrePaquete} creado`
  });

  return { idPaquete };
}

async function actualizarPaquete(idPaquete, datos, contexto) {
  const fila = await paquetesRepositorio.obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }

  const paquete = new PaqueteTuristico({
    idPaquete,
    nombrePaquete: datos.nombrePaquete,
    descripcion: datos.descripcion,
    precio: datos.precio,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    estadoPaquete: datos.estadoPaquete
  });

  const { idPaquete: id, ...campos } = paquete.aJSON();
  void id;

  await paquetesRepositorio.actualizar(idPaquete, campos);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'paquetes_turisticos',
    idRegistro: idPaquete,
    accion: 'Actualizacion',
    descripcion: `Paquete ${paquete.nombrePaquete} actualizado`
  });

  return { mensaje: 'Paquete actualizado correctamente' };
}

async function cambiarEstadoPaquete(idPaquete, estadoPaquete, contexto) {
  const fila = await paquetesRepositorio.obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }

  await paquetesRepositorio.cambiarEstado(idPaquete, estadoPaquete);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'paquetes_turisticos',
    idRegistro: idPaquete,
    accion: 'Cambio de estado',
    descripcion: `Paquete ${fila.nombre_paquete} marcado como ${estadoPaquete}`
  });

  return { mensaje: `Paquete marcado como ${estadoPaquete}` };
}

async function listarServiciosDePaquete(idPaquete) {
  const fila = await paquetesRepositorio.obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }
  const servicios = await paquetesRepositorio.listarServicios(idPaquete);
  return servicios.map(mapearServicioPaquete);
}

/**
 * RF-PAQ-04: agrega un servicio al paquete creando el servicio y la asociacion
 * dentro de una transaccion.
 */
async function agregarServicioAPaquete(idPaquete, datos, contexto) {
  const fila = await paquetesRepositorio.obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }

  const servicio = new ServicioPaquete({
    tipoServicio: datos.tipoServicio,
    descripcion: datos.descripcion,
    precio: datos.precio
  });

  const idServicio = await ejecutarTransaccion(async (conexion) => {
    const id = await paquetesRepositorio.crearServicio(servicio.aJSON(), conexion);
    await paquetesRepositorio.asociarServicio(idPaquete, id, conexion);
    await bitacoraRepositorio.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'servicios_paquete',
        idRegistro: id,
        accion: 'Creacion',
        descripcion: `Servicio ${servicio.tipoServicio} agregado al paquete ${fila.nombre_paquete}`
      },
      conexion
    );
    return id;
  });

  return { idServicio };
}

async function quitarServicioDePaquete(idPaquete, idServicio, contexto) {
  const fila = await paquetesRepositorio.obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }

  const filasAfectadas = await paquetesRepositorio.quitarServicio(idPaquete, idServicio);
  if (filasAfectadas === 0) {
    throw ErrorApi.noEncontrado('El paquete no tiene asociado ese servicio');
  }

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'PAQUETE_SERVICIO',
    idRegistro: idPaquete,
    accion: 'Retiro de servicio',
    descripcion: `Servicio ${idServicio} retirado del paquete ${fila.nombre_paquete}`
  });

  return { mensaje: 'Servicio retirado del paquete correctamente' };
}

module.exports = {
  listarPaquetes,
  obtenerPaquete,
  crearPaquete,
  actualizarPaquete,
  cambiarEstadoPaquete,
  listarServiciosDePaquete,
  agregarServicioAPaquete,
  quitarServicioDePaquete
};
