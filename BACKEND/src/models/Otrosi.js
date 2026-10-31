'use strict';

/**
 * Entidad de dominio: Otrosi de contrato (RF-CON-03).
 * Modifica un contrato existente conservando el historial.
 */

const { validarTexto, validarEntero, validarDecimal, validarFecha } = require('./comun');

class Otrosi {
  #idOtrosi;
  #idContrato;
  #numeroOtrosi;
  #descripcion;
  #valorAnterior;
  #valorNuevo;
  #fechaInicioNueva;
  #fechaFinNueva;
  #fechaCreacion;

  constructor({
    idOtrosi = null,
    idContrato,
    numeroOtrosi,
    descripcion,
    valorAnterior = null,
    valorNuevo = null,
    fechaInicioNueva = null,
    fechaFinNueva = null,
    fechaCreacion = null
  } = {}) {
    this.#idOtrosi = validarEntero(idOtrosi, 'idOtrosi', { obligatorio: false, minimo: 1 });
    this.#idContrato = validarEntero(idContrato, 'idContrato', { minimo: 1 });
    this.#numeroOtrosi = validarTexto(numeroOtrosi, 'numeroOtrosi', { maximo: 50 });
    this.#descripcion = validarTexto(descripcion, 'descripcion', { maximo: 2000 });
    this.#valorAnterior = validarDecimal(valorAnterior, 'valorAnterior', { obligatorio: false, minimo: 0 });
    this.#valorNuevo = validarDecimal(valorNuevo, 'valorNuevo', { obligatorio: false, minimo: 0 });
    this.#fechaInicioNueva = validarFecha(fechaInicioNueva, 'fechaInicioNueva', { obligatorio: false });
    this.#fechaFinNueva = validarFecha(fechaFinNueva, 'fechaFinNueva', { obligatorio: false });
    this.#fechaCreacion = validarFecha(fechaCreacion, 'fechaCreacion', { obligatorio: false });
  }

  get idOtrosi() {
    return this.#idOtrosi;
  }

  get idContrato() {
    return this.#idContrato;
  }

  get numeroOtrosi() {
    return this.#numeroOtrosi;
  }

  get descripcion() {
    return this.#descripcion;
  }

  get valorAnterior() {
    return this.#valorAnterior;
  }

  get valorNuevo() {
    return this.#valorNuevo;
  }

  get fechaInicioNueva() {
    return this.#fechaInicioNueva;
  }

  get fechaFinNueva() {
    return this.#fechaFinNueva;
  }

  get fechaCreacion() {
    return this.#fechaCreacion;
  }

  aJSON() {
    return {
      idOtrosi: this.#idOtrosi,
      idContrato: this.#idContrato,
      numeroOtrosi: this.#numeroOtrosi,
      descripcion: this.#descripcion,
      valorAnterior: this.#valorAnterior,
      valorNuevo: this.#valorNuevo,
      fechaInicioNueva: this.#fechaInicioNueva,
      fechaFinNueva: this.#fechaFinNueva,
      fechaCreacion: this.#fechaCreacion
    };
  }
}

module.exports = Otrosi;
