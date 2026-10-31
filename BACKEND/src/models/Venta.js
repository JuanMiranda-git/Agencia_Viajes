'use strict';

/**
 * Entidad de dominio: Venta (RF-VEN-01..04).
 * Solo puede registrarse sobre una reserva confirmada (matriz CA_70_02).
 */

const AppError = require('../utils/AppError');
const { validarEntero, validarDecimal, validarEnumeracion, validarFecha } = require('./comun');

const ESTADOS = ['Pendiente', 'Pagado', 'Cancelado'];
const TRANSICIONES = {
  Pendiente: ['Pagado', 'Cancelado'],
  Pagado: ['Cancelado'],
  Cancelado: []
};

class Venta {
  #idVenta;
  #idReserva;
  #monto;
  #fechaVenta;
  #metodoPago;
  #estadoVenta;
  #comprobanteRuta;
  #fechaModificacion;
  #totalReserva;
  #estadoReserva;

  constructor({
    idVenta = null,
    idReserva,
    monto = 0,
    fechaVenta = null,
    metodoPago,
    estadoVenta = 'Pendiente',
    comprobanteRuta = null,
    fechaModificacion = null,
    totalReserva = null,
    estadoReserva = null
  } = {}) {
    this.#idVenta = validarEntero(idVenta, 'idVenta', { obligatorio: false, minimo: 1 });
    this.#idReserva = validarEntero(idReserva, 'idReserva', { minimo: 1 });
    this.#monto = validarDecimal(monto, 'monto', { minimo: 0 });
    this.#fechaVenta = validarFecha(fechaVenta, 'fechaVenta', { obligatorio: false });
    this.#metodoPago = validarEnumeracion(metodoPago, 'metodoPago', ['Tarjeta', 'Transferencia', 'Efectivo']);
    this.#estadoVenta = validarEnumeracion(estadoVenta, 'estadoVenta', ESTADOS, { defecto: 'Pendiente' });
    this.#comprobanteRuta = comprobanteRuta;
    this.#fechaModificacion = validarFecha(fechaModificacion, 'fechaModificacion', { obligatorio: false });
    this.#totalReserva = totalReserva === null ? null : validarDecimal(totalReserva, 'totalReserva', { minimo: 0 });
    this.#estadoReserva = estadoReserva;
  }

  /**
   * Solo se permite vender una reserva confirmada.
   */
  validarReservaConfirmada() {
    if (this.#estadoReserva !== null && this.#estadoReserva !== 'Confirmada') {
      throw AppError.reglaNegocio('Solo se puede registrar una venta sobre una reserva confirmada');
    }
  }

  /**
   * El monto de la venta no puede superar el total de la reserva.
   */
  validarMontoContraReserva() {
    if (this.#totalReserva !== null && this.#monto > this.#totalReserva) {
      throw AppError.reglaNegocio('El monto de la venta no puede superar el total de la reserva');
    }
  }

  puedeTransicionarA(nuevoEstado) {
    return (TRANSICIONES[this.#estadoVenta] || []).includes(nuevoEstado);
  }

  marcarPagada() {
    if (!this.puedeTransicionarA('Pagado')) {
      throw AppError.reglaNegocio(`No se puede pagar una venta en estado ${this.#estadoVenta}`);
    }
    const pagada = new Venta({ ...this.aJSON(), estadoVenta: 'Pagado', comprobanteRuta: `/api/v1/ventas/${this.#idVenta}/comprobante` });
    return pagada;
  }

  mantenerPendiente(motivo) {
    return { venta: this, motivo };
  }

  cancelar() {
    if (!this.puedeTransicionarA('Cancelado')) {
      throw AppError.reglaNegocio(`No se puede cancelar una venta en estado ${this.#estadoVenta}`);
    }
    return new Venta({ ...this.aJSON(), estadoVenta: 'Cancelado' });
  }

  get idVenta() {
    return this.#idVenta;
  }

  get idReserva() {
    return this.#idReserva;
  }

  get monto() {
    return this.#monto;
  }

  get fechaVenta() {
    return this.#fechaVenta;
  }

  get metodoPago() {
    return this.#metodoPago;
  }

  get estadoVenta() {
    return this.#estadoVenta;
  }

  get comprobanteRuta() {
    return this.#comprobanteRuta;
  }

  get fechaModificacion() {
    return this.#fechaModificacion;
  }

  get totalReserva() {
    return this.#totalReserva;
  }

  get estadoReserva() {
    return this.#estadoReserva;
  }

  aJSON() {
    return {
      idVenta: this.#idVenta,
      idReserva: this.#idReserva,
      monto: this.#monto,
      fechaVenta: this.#fechaVenta,
      metodoPago: this.#metodoPago,
      estadoVenta: this.#estadoVenta,
      comprobanteRuta: this.#comprobanteRuta,
      fechaModificacion: this.#fechaModificacion
    };
  }
}

Venta.ESTADOS = ESTADOS;
Venta.TRANSICIONES = TRANSICIONES;

module.exports = Venta;
