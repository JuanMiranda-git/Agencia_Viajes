'use strict';

/**
 * Entidad de dominio: Servicio incluido en un paquete (RF-PAQ-02).
 */

const { validarTexto, validarEntero, validarDecimal, validarEnumeracion } = require('./comun');

const TIPOS = ['Transporte', 'Hospedaje', 'Actividad', 'Seguro', 'Comida'];

class ServicioPaquete {
  #idServicio;
  #tipoServicio;
  #descripcion;
  #precio;

  constructor({ idServicio = null, tipoServicio, descripcion, precio = 0 } = {}) {
    this.#idServicio = validarEntero(idServicio, 'idServicio', { obligatorio: false, minimo: 1 });
    this.#tipoServicio = validarEnumeracion(tipoServicio, 'tipoServicio', TIPOS);
    this.#descripcion = validarTexto(descripcion, 'descripcion', { maximo: 300 });
    this.#precio = validarDecimal(precio, 'precio', { minimo: 0 });
  }

  get idServicio() {
    return this.#idServicio;
  }

  get tipoServicio() {
    return this.#tipoServicio;
  }

  get descripcion() {
    return this.#descripcion;
  }

  get precio() {
    return this.#precio;
  }

  aJSON() {
    return {
      idServicio: this.#idServicio,
      tipoServicio: this.#tipoServicio,
      descripcion: this.#descripcion,
      precio: this.#precio
    };
  }
}

ServicioPaquete.TIPOS = TIPOS;

module.exports = ServicioPaquete;
