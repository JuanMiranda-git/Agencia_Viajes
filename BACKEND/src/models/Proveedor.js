'use strict';

/**
 * Entidad de dominio: Proveedor (RF-PRO-01..03, RN-01).
 */

const { validarTexto, validarEmail, validarEntero, validarEnumeracion, validarFecha } = require('./comun');

const TIPOS_SERVICIO = ['Hotel', 'Aerolinea', 'Guia', 'Restaurante', 'Transporte', 'Otro'];

class Proveedor {
  #idProveedor;
  #nombreEmpresa;
  #tipoServicio;
  #contactoNombre;
  #contactoEmail;
  #telefonoContacto;
  #direccion;
  #fechaRegistro;
  #fechaModificacion;

  constructor({
    idProveedor = null,
    nombreEmpresa,
    tipoServicio,
    contactoNombre = null,
    contactoEmail = null,
    telefonoContacto = null,
    direccion = null,
    fechaRegistro = null,
    fechaModificacion = null
  } = {}) {
    this.#idProveedor = validarEntero(idProveedor, 'idProveedor', { obligatorio: false, minimo: 1 });
    this.#nombreEmpresa = validarTexto(nombreEmpresa, 'nombreEmpresa', { maximo: 150 });
    this.#tipoServicio = validarEnumeracion(tipoServicio, 'tipoServicio', TIPOS_SERVICIO);
    this.#contactoNombre = validarTexto(contactoNombre, 'contactoNombre', { obligatorio: false, maximo: 150 });
    this.#contactoEmail = validarEmail(contactoEmail, 'contactoEmail', { obligatorio: false });
    this.#telefonoContacto = validarTexto(telefonoContacto, 'telefonoContacto', { obligatorio: false, maximo: 20 });
    this.#direccion = validarTexto(direccion, 'direccion', { obligatorio: false, maximo: 250 });
    this.#fechaRegistro = validarFecha(fechaRegistro, 'fechaRegistro', { obligatorio: false });
    this.#fechaModificacion = validarFecha(fechaModificacion, 'fechaModificacion', { obligatorio: false });
  }

  esDeTransporte() {
    return this.#tipoServicio === 'Transporte';
  }

  get idProveedor() {
    return this.#idProveedor;
  }

  get nombreEmpresa() {
    return this.#nombreEmpresa;
  }

  get tipoServicio() {
    return this.#tipoServicio;
  }

  get contactoNombre() {
    return this.#contactoNombre;
  }

  get contactoEmail() {
    return this.#contactoEmail;
  }

  get telefonoContacto() {
    return this.#telefonoContacto;
  }

  get direccion() {
    return this.#direccion;
  }

  get fechaRegistro() {
    return this.#fechaRegistro;
  }

  get fechaModificacion() {
    return this.#fechaModificacion;
  }

  aJSON() {
    return {
      idProveedor: this.#idProveedor,
      nombreEmpresa: this.#nombreEmpresa,
      tipoServicio: this.#tipoServicio,
      contactoNombre: this.#contactoNombre,
      contactoEmail: this.#contactoEmail,
      telefonoContacto: this.#telefonoContacto,
      direccion: this.#direccion,
      fechaRegistro: this.#fechaRegistro,
      fechaModificacion: this.#fechaModificacion
    };
  }
}

Proveedor.TIPOS_SERVICIO = TIPOS_SERVICIO;

module.exports = Proveedor;
