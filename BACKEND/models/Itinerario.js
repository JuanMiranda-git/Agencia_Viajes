'use strict';

/**
 * Entidad de dominio: Itinerario (RF-ITI-01..03).
 * Cada registro representa una actividad programada de un paquete en un dia.
 */

const { validarTexto, validarEntero, validarEnumeracion, validarFecha } = require('./comun');

const ESTADOS = ['Activo', 'Inactivo'];

class Itinerario {
  constructor({
    idItinerario = null,
    idPaquete,
    titulo,
    dia,
    horaInicio = null,
    horaFin = null,
    actividad,
    descripcion = null,
    estadoItinerario = 'Activo',
    fechaCreacion = null,
    fechaModificacion = null
  } = {}) {
    this.idItinerario = validarEntero(idItinerario, 'idItinerario', { obligatorio: false, minimo: 1 });
    this.idPaquete = validarEntero(idPaquete, 'idPaquete', { minimo: 1 });
    this.titulo = validarTexto(titulo, 'titulo', { maximo: 150 });
    this.dia = validarEntero(dia, 'dia', { minimo: 1, maximo: 365 });
    this.horaInicio = validarTexto(horaInicio, 'horaInicio', { obligatorio: false, maximo: 8 });
    this.horaFin = validarTexto(horaFin, 'horaFin', { obligatorio: false, maximo: 8 });
    this.actividad = validarTexto(actividad, 'actividad', { maximo: 300 });
    this.descripcion = validarTexto(descripcion, 'descripcion', { obligatorio: false, maximo: 2000 });
    this.estadoItinerario = validarEnumeracion(estadoItinerario, 'estadoItinerario', ESTADOS, { defecto: 'Activo' });
    this.fechaCreacion = validarFecha(fechaCreacion, 'fechaCreacion', { obligatorio: false });
    this.fechaModificacion = validarFecha(fechaModificacion, 'fechaModificacion', { obligatorio: false });
  }

  estaActivo() {
    return this.estadoItinerario === 'Activo';
  }

  aJSON() {
    return {
      idItinerario: this.idItinerario,
      idPaquete: this.idPaquete,
      titulo: this.titulo,
      dia: this.dia,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      actividad: this.actividad,
      descripcion: this.descripcion,
      estadoItinerario: this.estadoItinerario,
      fechaCreacion: this.fechaCreacion,
      fechaModificacion: this.fechaModificacion
    };
  }
}

Itinerario.ESTADOS = ESTADOS;

module.exports = Itinerario;
