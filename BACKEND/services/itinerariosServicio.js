'use strict';

/**
 * Servicio de itinerarios (RF-ITI-01..03).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Itinerario = require('../models/Itinerario');
const itinerariosRepositorio = require('../repositories/itinerariosRepositorio');
const paquetesRepositorio = require('../repositories/paquetesRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');

function mapearItinerario(fila) {
  return new Itinerario({
    idItinerario: fila.id_itinerario,
    idPaquete: fila.id_paquete,
    titulo: fila.titulo,
    dia: fila.dia,
    horaInicio: fila.hora_inicio,
    horaFin: fila.hora_fin,
    actividad: fila.actividad,
    descripcion: fila.descripcion,
    estadoItinerario: fila.estado_itinerario,
    fechaCreacion: fila.fecha_creacion,
    fechaModificacion: fila.fecha_modificacion
  }).aJSON();
}

async function listarItinerarios(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await itinerariosRepositorio.listar({
    idPaquete: consulta.idPaquete,
    estado: consulta.estado,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({ ...mapearItinerario(fila), nombrePaquete: fila.nombre_paquete })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerItinerario(idItinerario) {
  const fila = await itinerariosRepositorio.obtenerPorId(idItinerario);
  if (!fila) {
    throw ErrorApi.noEncontrado('El itinerario solicitado no existe');
  }
  return mapearItinerario(fila);
}

async function crearItinerario(datos, contexto) {
  const paquete = await paquetesRepositorio.obtenerPorId(datos.idPaquete);
  if (!paquete) {
    throw ErrorApi.solicitudInvalida('El paquete indicado no existe', [
      { campo: 'idPaquete', mensaje: 'Paquete inexistente' }
    ]);
  }

  const itinerario = new Itinerario({
    idPaquete: datos.idPaquete,
    titulo: datos.titulo,
    dia: datos.dia,
    horaInicio: datos.horaInicio,
    horaFin: datos.horaFin,
    actividad: datos.actividad,
    descripcion: datos.descripcion,
    estadoItinerario: datos.estadoItinerario
  });

  const idItinerario = await itinerariosRepositorio.crear(itinerario.aJSON());

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'itinerarios',
    idRegistro: idItinerario,
    accion: 'Creacion',
    descripcion: `Actividad ${itinerario.titulo} agregada al paquete ${paquete.nombre_paquete}`
  });

  return { idItinerario };
}

async function actualizarItinerario(idItinerario, datos, contexto) {
  const fila = await itinerariosRepositorio.obtenerPorId(idItinerario);
  if (!fila) {
    throw ErrorApi.noEncontrado('El itinerario solicitado no existe');
  }

  const itinerario = new Itinerario({
    idItinerario,
    idPaquete: fila.id_paquete,
    titulo: datos.titulo,
    dia: datos.dia,
    horaInicio: datos.horaInicio,
    horaFin: datos.horaFin,
    actividad: datos.actividad,
    descripcion: datos.descripcion,
    estadoItinerario: datos.estadoItinerario
  });

  const { idItinerario: id, idPaquete, ...campos } = itinerario.aJSON();
  void id;
  void idPaquete;

  await itinerariosRepositorio.actualizar(idItinerario, campos);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'itinerarios',
    idRegistro: idItinerario,
    accion: 'Actualizacion',
    descripcion: `Itinerario ${itinerario.titulo} actualizado`
  });

  return { mensaje: 'Itinerario actualizado correctamente' };
}

async function cambiarEstadoItinerario(idItinerario, estadoItinerario, contexto) {
  const fila = await itinerariosRepositorio.obtenerPorId(idItinerario);
  if (!fila) {
    throw ErrorApi.noEncontrado('El itinerario solicitado no existe');
  }

  await itinerariosRepositorio.cambiarEstado(idItinerario, estadoItinerario);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'itinerarios',
    idRegistro: idItinerario,
    accion: 'Cambio de estado',
    descripcion: `Itinerario ${fila.titulo} marcado como ${estadoItinerario}`
  });

  return { mensaje: `Itinerario marcado como ${estadoItinerario}` };
}

module.exports = {
  listarItinerarios,
  obtenerItinerario,
  crearItinerario,
  actualizarItinerario,
  cambiarEstadoItinerario
};
