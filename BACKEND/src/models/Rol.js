'use strict';

/**
 * Entidad de dominio: Rol (RF-ROL-01..07).
 */

const { validarTexto, validarEntero, validarEnumeracion, validarFecha } = require('./comun');

const ESTADOS = ['Activo', 'Inactivo'];

class Rol {
  #idRol;
  #nombreRol;
  #descripcion;
  #estadoRol;
  #fechaCreacion;
  #fechaModificacion;

  constructor({ idRol = null, nombreRol, descripcion = null, estadoRol = 'Activo', fechaCreacion = null, fechaModificacion = null } = {}) {
    this.#idRol = validarEntero(idRol, 'idRol', { obligatorio: false, minimo: 1 });
    this.#nombreRol = validarTexto(nombreRol, 'nombreRol', { maximo: 80 });
    this.#descripcion = validarTexto(descripcion, 'descripcion', { obligatorio: false, maximo: 250 });
    this.#estadoRol = validarEnumeracion(estadoRol, 'estadoRol', ESTADOS, { defecto: 'Activo' });
    this.#fechaCreacion = validarFecha(fechaCreacion, 'fechaCreacion', { obligatorio: false });
    this.#fechaModificacion = validarFecha(fechaModificacion, 'fechaModificacion', { obligatorio: false });
  }

  estaActivo() {
    return this.#estadoRol === 'Activo';
  }

  get idRol() {
    return this.#idRol;
  }

  get nombreRol() {
    return this.#nombreRol;
  }

  get descripcion() {
    return this.#descripcion;
  }

  get estadoRol() {
    return this.#estadoRol;
  }

  get fechaCreacion() {
    return this.#fechaCreacion;
  }

  get fechaModificacion() {
    return this.#fechaModificacion;
  }

  aJSON() {
    return {
      idRol: this.#idRol,
      nombreRol: this.#nombreRol,
      descripcion: this.#descripcion,
      estadoRol: this.#estadoRol,
      fechaCreacion: this.#fechaCreacion,
      fechaModificacion: this.#fechaModificacion
    };
  }
}

Rol.ESTADOS = ESTADOS;

module.exports = Rol;
