'use strict';

/**
 * Entidad de dominio: Servicio ofrecido por un proveedor (RF-PRO-03).
 */

const { validarTexto, validarEntero, validarDecimal } = require('./comun');

class ServicioProveedor {
  #idServicio;
  #idProveedor;
  #nombreServicio;
  #descripcion;
  #precio;
  #disponible;

  constructor({ idServicio = null, idProveedor, nombreServicio, descripcion = null, precio = 0, disponible = true } = {}) {
    this.#idServicio = validarEntero(idServicio, 'idServicio', { obligatorio: false, minimo: 1 });
    this.#idProveedor = validarEntero(idProveedor, 'idProveedor', { minimo: 1 });
    this.#nombreServicio = validarTexto(nombreServicio, 'nombreServicio', { maximo: 150 });
    this.#descripcion = validarTexto(descripcion, 'descripcion', { obligatorio: false, maximo: 300 });
    this.#precio = validarDecimal(precio, 'precio', { minimo: 0 });
    this.#disponible = Boolean(disponible);
  }

  get idServicio() {
    return this.#idServicio;
  }

  get idProveedor() {
    return this.#idProveedor;
  }

  get nombreServicio() {
    return this.#nombreServicio;
  }

  get descripcion() {
    return this.#descripcion;
  }

  get precio() {
    return this.#precio;
  }

  get disponible() {
    return this.#disponible;
  }

  aJSON() {
    return {
      idServicio: this.#idServicio,
      idProveedor: this.#idProveedor,
      nombreServicio: this.#nombreServicio,
      descripcion: this.#descripcion,
      precio: this.#precio,
      disponible: this.#disponible
    };
  }
}

module.exports = ServicioProveedor;
