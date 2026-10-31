'use strict';

/**
 * Entidad de dominio: Token de recuperacion de contrasena (RF-ACC-04, RF-ACC-05).
 */

const { validarTexto, validarEntero, validarFecha } = require('./comun');

class TokenRecuperacion {
  #idToken;
  #idUsuario;
  #token;
  #fechaExpiracion;
  #usado;
  #fechaCreacion;

  constructor({
    idToken = null,
    idUsuario,
    token,
    fechaExpiracion,
    usado = false,
    fechaCreacion = null
  } = {}) {
    this.#idToken = validarEntero(idToken, 'idToken', { obligatorio: false, minimo: 1 });
    this.#idUsuario = validarEntero(idUsuario, 'idUsuario', { minimo: 1 });
    this.#token = validarTexto(token, 'token', { maximo: 255 });
    this.#fechaExpiracion = validarFecha(fechaExpiracion, 'fechaExpiracion');
    this.#usado = Boolean(usado);
    this.#fechaCreacion = validarFecha(fechaCreacion, 'fechaCreacion', { obligatorio: false });
  }

  estaVigente(fecha = new Date()) {
    const referencia = fecha instanceof Date ? fecha : new Date(fecha);
    return !this.#usado && Date.parse(this.#fechaExpiracion) > referencia.getTime();
  }

  get idToken() {
    return this.#idToken;
  }

  get idUsuario() {
    return this.#idUsuario;
  }

  get fechaExpiracion() {
    return this.#fechaExpiracion;
  }

  get usado() {
    return this.#usado;
  }

  get fechaCreacion() {
    return this.#fechaCreacion;
  }

  aJSON() {
    return {
      idToken: this.#idToken,
      idUsuario: this.#idUsuario,
      fechaExpiracion: this.#fechaExpiracion,
      usado: this.#usado,
      fechaCreacion: this.#fechaCreacion
    };
  }
}

module.exports = TokenRecuperacion;
