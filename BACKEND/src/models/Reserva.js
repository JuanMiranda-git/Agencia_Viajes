'use strict';

/**
 * Entidad de dominio: Reserva (RF-RES-01..05, RN de negocio del SDD).
 * Reglas:
 *  - El total se calcula al crear la reserva y no cambia despues.
 *  - El numero AV-YYYYMMDD-XXXX se genera al confirmar.
 *  - Estados: Pendiente -> Confirmada -> Cancelada (según flujo permitido).
 */

const AppError = require('../utils/AppError');
const { validarEntero, validarDecimal, validarEnumeracion, validarFecha } = require('./comun');

const ESTADOS = ['Pendiente', 'Confirmada', 'Cancelada'];
const TRANSICIONES = {
  Pendiente: ['Confirmada', 'Cancelada'],
  Confirmada: ['Cancelada'],
  Cancelada: []
};

class Reserva {
  #idReserva;
  #idCliente;
  #idUsuario;
  #idPaquete;
  #fechaReserva;
  #fechaViaje;
  #numPasajeros;
  #estadoReserva;
  #total;
  #numeroReserva;
  #fechaModificacion;

  constructor({
    idReserva = null,
    idCliente,
    idUsuario = null,
    idPaquete,
    fechaReserva = null,
    fechaViaje,
    numPasajeros = 1,
    estadoReserva = 'Pendiente',
    total = 0,
    numeroReserva = null,
    fechaModificacion = null
  } = {}) {
    this.#idReserva = validarEntero(idReserva, 'idReserva', { obligatorio: false, minimo: 1 });
    this.#idCliente = validarEntero(idCliente, 'idCliente', { minimo: 1 });
    this.#idUsuario = validarEntero(idUsuario, 'idUsuario', { obligatorio: false, minimo: 1 });
    this.#idPaquete = validarEntero(idPaquete, 'idPaquete', { minimo: 1 });
    this.#fechaReserva = validarFecha(fechaReserva, 'fechaReserva', { obligatorio: false });
    this.#fechaViaje = validarFecha(fechaViaje, 'fechaViaje');
    this.#numPasajeros = validarEntero(numPasajeros, 'numPasajeros', { minimo: 1, maximo: 50 });
    this.#estadoReserva = validarEnumeracion(estadoReserva, 'estadoReserva', ESTADOS, { defecto: 'Pendiente' });
    this.#total = validarDecimal(total, 'total', { minimo: 0 });
    this.#numeroReserva = numeroReserva;
    this.#fechaModificacion = validarFecha(fechaModificacion, 'fechaModificacion', { obligatorio: false });
  }

  /**
   * Total inmutable: se calcula una sola vez con el precio del paquete al momento de reservar.
   */
  static calcularTotal(precioUnitario, numPasajeros) {
    const precio = validarDecimal(precioUnitario, 'precioUnitario', { minimo: 0 });
    const pasajeros = validarEntero(numPasajeros, 'numPasajeros', { minimo: 1, maximo: 50 });
    return Math.round(precio * pasajeros * 100) / 100;
  }

  puedeTransicionarA(nuevoEstado) {
    return (TRANSICIONES[this.#estadoReserva] || []).includes(nuevoEstado);
  }

  confirmar(numeroReserva) {
    if (!this.puedeTransicionarA('Confirmada')) {
      throw AppError.reglaNegocio(`No se puede confirmar una reserva en estado ${this.#estadoReserva}`);
    }
    if (!numeroReserva || !/^AV-\d{8}-[A-Z0-9]{4}$/.test(numeroReserva)) {
      throw AppError.solicitudInvalida('El numero de reserva debe tener el formato AV-YYYYMMDD-XXXX');
    }
    const confirmada = new Reserva({ ...this.aJSON(), estadoReserva: 'Confirmada', numeroReserva });
    return confirmada;
  }

  cancelar() {
    if (!this.puedeTransicionarA('Cancelada')) {
      throw AppError.reglaNegocio(`No se puede cancelar una reserva en estado ${this.#estadoReserva}`);
    }
    const cancelada = new Reserva({ ...this.aJSON(), estadoReserva: 'Cancelada' });
    return cancelada;
  }

  esDeCliente(idCliente) {
    return Number(this.#idCliente) === Number(idCliente);
  }

  get idReserva() {
    return this.#idReserva;
  }

  get idCliente() {
    return this.#idCliente;
  }

  get idUsuario() {
    return this.#idUsuario;
  }

  get idPaquete() {
    return this.#idPaquete;
  }

  get fechaReserva() {
    return this.#fechaReserva;
  }

  get fechaViaje() {
    return this.#fechaViaje;
  }

  get numPasajeros() {
    return this.#numPasajeros;
  }

  get estadoReserva() {
    return this.#estadoReserva;
  }

  get total() {
    return this.#total;
  }

  get numeroReserva() {
    return this.#numeroReserva;
  }

  get fechaModificacion() {
    return this.#fechaModificacion;
  }

  aJSON() {
    return {
      idReserva: this.#idReserva,
      idCliente: this.#idCliente,
      idUsuario: this.#idUsuario,
      idPaquete: this.#idPaquete,
      fechaReserva: this.#fechaReserva,
      fechaViaje: this.#fechaViaje,
      numPasajeros: this.#numPasajeros,
      estadoReserva: this.#estadoReserva,
      total: this.#total,
      numeroReserva: this.#numeroReserva,
      fechaModificacion: this.#fechaModificacion
    };
  }
}

Reserva.ESTADOS = ESTADOS;
Reserva.TRANSICIONES = TRANSICIONES;

module.exports = Reserva;
