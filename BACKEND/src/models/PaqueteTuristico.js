'use strict';

/**
 * Entidad de dominio: Paquete turistico (RF-PAQ-01..05).
 */

const { validarTexto, validarEntero, validarDecimal, validarEnumeracion, validarFecha } = require('./comun');

const ESTADOS = ['Activo', 'Inactivo'];

class PaqueteTuristico {
  #idPaquete;
  #nombrePaquete;
  #descripcion;
  #precio;
  #fechaInicio;
  #fechaFin;
  #estadoPaquete;
  #fechaCreacion;
  #fechaModificacion;

  constructor({
    idPaquete = null,
    nombrePaquete,
    descripcion = null,
    precio = 0,
    fechaInicio = null,
    fechaFin = null,
    estadoPaquete = 'Activo',
    fechaCreacion = null,
    fechaModificacion = null
  } = {}) {
    this.#idPaquete = validarEntero(idPaquete, 'idPaquete', { obligatorio: false, minimo: 1 });
    this.#nombrePaquete = validarTexto(nombrePaquete, 'nombrePaquete', { maximo: 150 });
    this.#descripcion = validarTexto(descripcion, 'descripcion', { obligatorio: false, maximo: 2000 });
    this.#precio = validarDecimal(precio, 'precio', { minimo: 0 });
    this.#fechaInicio = validarFecha(fechaInicio, 'fechaInicio', { obligatorio: false });
    this.#fechaFin = validarFecha(fechaFin, 'fechaFin', { obligatorio: false });
    this.#estadoPaquete = validarEnumeracion(estadoPaquete, 'estadoPaquete', ESTADOS, { defecto: 'Activo' });
    this.#fechaCreacion = validarFecha(fechaCreacion, 'fechaCreacion', { obligatorio: false });
    this.#fechaModificacion = validarFecha(fechaModificacion, 'fechaModificacion', { obligatorio: false });

    if (this.#fechaInicio && this.#fechaFin && Date.parse(this.#fechaFin) < Date.parse(this.#fechaInicio)) {
      const AppError = require('../utils/AppError');
      throw AppError.solicitudInvalida('La fecha de fin del paquete no puede ser anterior a la fecha de inicio', [
        { campo: 'fechaFin', mensaje: 'Rango de fechas invalido' }
      ]);
    }
  }

  estaActivo() {
    return this.#estadoPaquete === 'Activo';
  }

  /**
   * Disponibilidad basica: el paquete debe estar activo y la fecha de viaje
   * (si se indica) debe caer dentro del rango publicado.
   */
  estaDisponiblePara(fechaViaje) {
    if (!this.estaActivo()) return false;
    if (!fechaViaje) return true;
    const fecha = new Date(fechaViaje).getTime();
    if (this.#fechaInicio && fecha < Date.parse(this.#fechaInicio)) return false;
    if (this.#fechaFin && fecha > Date.parse(this.#fechaFin)) return false;
    return true;
  }

  get idPaquete() {
    return this.#idPaquete;
  }

  get nombrePaquete() {
    return this.#nombrePaquete;
  }

  get descripcion() {
    return this.#descripcion;
  }

  get precio() {
    return this.#precio;
  }

  get fechaInicio() {
    return this.#fechaInicio;
  }

  get fechaFin() {
    return this.#fechaFin;
  }

  get estadoPaquete() {
    return this.#estadoPaquete;
  }

  get fechaCreacion() {
    return this.#fechaCreacion;
  }

  get fechaModificacion() {
    return this.#fechaModificacion;
  }

  aJSON() {
    return {
      idPaquete: this.#idPaquete,
      nombrePaquete: this.#nombrePaquete,
      descripcion: this.#descripcion,
      precio: this.#precio,
      fechaInicio: this.#fechaInicio,
      fechaFin: this.#fechaFin,
      estadoPaquete: this.#estadoPaquete,
      fechaCreacion: this.#fechaCreacion,
      fechaModificacion: this.#fechaModificacion
    };
  }
}

PaqueteTuristico.ESTADOS = ESTADOS;

module.exports = PaqueteTuristico;
