'use strict';

/**
 * Entidad de dominio: Cliente (RF-RES-*, RF-CRM-*, Ley 1581 de 2012).
 * Incluye consentimiento informado y clasificacion comercial.
 */

const { validarTexto, validarEmail, validarEntero, validarFecha } = require('./comun');

class Cliente {
  #idCliente;
  #nombre;
  #apellido;
  #email;
  #telefono;
  #direccion;
  #categoriaCliente;
  #consentimientoDatos;
  #fechaConsentimiento;
  #fechaRegistro;

  constructor({
    idCliente = null,
    nombre,
    apellido,
    email,
    telefono = null,
    direccion = null,
    categoriaCliente = null,
    consentimientoDatos = false,
    fechaConsentimiento = null,
    fechaRegistro = null
  } = {}) {
    this.#idCliente = validarEntero(idCliente, 'idCliente', { obligatorio: false, minimo: 1 });
    this.#nombre = validarTexto(nombre, 'nombre', { maximo: 100 });
    this.#apellido = validarTexto(apellido, 'apellido', { maximo: 100 });
    this.#email = validarEmail(email, 'email');
    this.#telefono = validarTexto(telefono, 'telefono', { obligatorio: false, maximo: 20 });
    this.#direccion = validarTexto(direccion, 'direccion', { obligatorio: false, maximo: 250 });
    this.#categoriaCliente = validarTexto(categoriaCliente, 'categoriaCliente', { obligatorio: false, maximo: 120 });
    this.#consentimientoDatos = Boolean(consentimientoDatos);
    this.#fechaConsentimiento = validarFecha(fechaConsentimiento, 'fechaConsentimiento', { obligatorio: false });
    this.#fechaRegistro = validarFecha(fechaRegistro, 'fechaRegistro', { obligatorio: false });
  }

  nombreCompleto() {
    return `${this.#nombre} ${this.#apellido}`.trim();
  }

  dioConsentimiento() {
    return this.#consentimientoDatos === true;
  }

  get idCliente() {
    return this.#idCliente;
  }

  get nombre() {
    return this.#nombre;
  }

  get apellido() {
    return this.#apellido;
  }

  get email() {
    return this.#email;
  }

  get telefono() {
    return this.#telefono;
  }

  get direccion() {
    return this.#direccion;
  }

  get categoriaCliente() {
    return this.#categoriaCliente;
  }

  get consentimientoDatos() {
    return this.#consentimientoDatos;
  }

  get fechaConsentimiento() {
    return this.#fechaConsentimiento;
  }

  get fechaRegistro() {
    return this.#fechaRegistro;
  }

  aJSON() {
    return {
      idCliente: this.#idCliente,
      nombre: this.#nombre,
      apellido: this.#apellido,
      nombreCompleto: this.nombreCompleto(),
      email: this.#email,
      telefono: this.#telefono,
      direccion: this.#direccion,
      categoriaCliente: this.#categoriaCliente,
      consentimientoDatos: this.#consentimientoDatos,
      fechaConsentimiento: this.#fechaConsentimiento,
      fechaRegistro: this.#fechaRegistro
    };
  }
}

module.exports = Cliente;
