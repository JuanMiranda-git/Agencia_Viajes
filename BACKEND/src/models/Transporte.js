'use strict';

/**
 * Entidad de dominio: Transporte (RF-TRA-01..02, RN-02).
 */

const { validarTexto, validarEntero, validarDecimal, validarEnumeracion, validarFecha } = require('./comun');

const TIPOS = ['Avion', 'Autobus', 'Tren', 'Ferry', 'Coche'];
const ESTADOS = ['Disponible', 'No Disponible', 'Mantenimiento'];

class Transporte {
  #idTransporte;
  #tipoTransporte;
  #idProveedor;
  #idPaquete;
  #descripcion;
  #capacidad;
  #precio;
  #fechaSalida;
  #fechaLlegada;
  #estadoTransporte;
  #fechaCreacion;

  constructor({
    idTransporte = null,
    tipoTransporte,
    idProveedor,
    idPaquete = null,
    descripcion = null,
    capacidad = 0,
    precio = 0,
    fechaSalida = null,
    fechaLlegada = null,
    estadoTransporte = 'Disponible',
    fechaCreacion = null
  } = {}) {
    this.#idTransporte = validarEntero(idTransporte, 'idTransporte', { obligatorio: false, minimo: 1 });
    this.#tipoTransporte = validarEnumeracion(tipoTransporte, 'tipoTransporte', TIPOS);
    this.#idProveedor = validarEntero(idProveedor, 'idProveedor', { minimo: 1 });
    this.#idPaquete = validarEntero(idPaquete, 'idPaquete', { obligatorio: false, minimo: 1 });
    this.#descripcion = validarTexto(descripcion, 'descripcion', { obligatorio: false, maximo: 300 });
    this.#capacidad = validarEntero(capacidad, 'capacidad', { minimo: 0, maximo: 1000 });
    this.#precio = validarDecimal(precio, 'precio', { minimo: 0 });
    this.#fechaSalida = validarFecha(fechaSalida, 'fechaSalida', { obligatorio: false });
    this.#fechaLlegada = validarFecha(fechaLlegada, 'fechaLlegada', { obligatorio: false });
    this.#estadoTransporte = validarEnumeracion(estadoTransporte, 'estadoTransporte', ESTADOS, { defecto: 'Disponible' });
    this.#fechaCreacion = validarFecha(fechaCreacion, 'fechaCreacion', { obligatorio: false });

    if (this.#fechaSalida && this.#fechaLlegada && Date.parse(this.#fechaLlegada) < Date.parse(this.#fechaSalida)) {
      const AppError = require('../utils/AppError');
      throw AppError.solicitudInvalida('La fecha de llegada no puede ser anterior a la fecha de salida', [
        { campo: 'fechaLlegada', mensaje: 'Rango de fechas invalido' }
      ]);
    }
  }

  estaDisponible() {
    return this.#estadoTransporte === 'Disponible';
  }

  get idTransporte() {
    return this.#idTransporte;
  }

  get tipoTransporte() {
    return this.#tipoTransporte;
  }

  get idProveedor() {
    return this.#idProveedor;
  }

  get idPaquete() {
    return this.#idPaquete;
  }

  get descripcion() {
    return this.#descripcion;
  }

  get capacidad() {
    return this.#capacidad;
  }

  get precio() {
    return this.#precio;
  }

  get fechaSalida() {
    return this.#fechaSalida;
  }

  get fechaLlegada() {
    return this.#fechaLlegada;
  }

  get estadoTransporte() {
    return this.#estadoTransporte;
  }

  get fechaCreacion() {
    return this.#fechaCreacion;
  }

  aJSON() {
    return {
      idTransporte: this.#idTransporte,
      tipoTransporte: this.#tipoTransporte,
      idProveedor: this.#idProveedor,
      idPaquete: this.#idPaquete,
      descripcion: this.#descripcion,
      capacidad: this.#capacidad,
      precio: this.#precio,
      fechaSalida: this.#fechaSalida,
      fechaLlegada: this.#fechaLlegada,
      estadoTransporte: this.#estadoTransporte,
      fechaCreacion: this.#fechaCreacion
    };
  }
}

Transporte.TIPOS = TIPOS;
Transporte.ESTADOS = ESTADOS;

module.exports = Transporte;
