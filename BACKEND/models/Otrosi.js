'use strict';

/**
 * Entidad de dominio: Otrosi de contrato (RF-CON-03).
 * Modifica un contrato existente conservando el historial.
 */

const { validarTexto, validarEntero, validarDecimal, validarFecha } = require('./comun');

class Otrosi {
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
    this.idOtrosi = validarEntero(idOtrosi, 'idOtrosi', { obligatorio: false, minimo: 1 });
    this.idContrato = validarEntero(idContrato, 'idContrato', { minimo: 1 });
    this.numeroOtrosi = validarTexto(numeroOtrosi, 'numeroOtrosi', { maximo: 50 });
    this.descripcion = validarTexto(descripcion, 'descripcion', { maximo: 2000 });
    this.valorAnterior = validarDecimal(valorAnterior, 'valorAnterior', { obligatorio: false, minimo: 0 });
    this.valorNuevo = validarDecimal(valorNuevo, 'valorNuevo', { obligatorio: false, minimo: 0 });
    this.fechaInicioNueva = validarFecha(fechaInicioNueva, 'fechaInicioNueva', { obligatorio: false });
    this.fechaFinNueva = validarFecha(fechaFinNueva, 'fechaFinNueva', { obligatorio: false });
    this.fechaCreacion = validarFecha(fechaCreacion, 'fechaCreacion', { obligatorio: false });
  }

  aJSON() {
    return {
      idOtrosi: this.idOtrosi,
      idContrato: this.idContrato,
      numeroOtrosi: this.numeroOtrosi,
      descripcion: this.descripcion,
      valorAnterior: this.valorAnterior,
      valorNuevo: this.valorNuevo,
      fechaInicioNueva: this.fechaInicioNueva,
      fechaFinNueva: this.fechaFinNueva,
      fechaCreacion: this.fechaCreacion
    };
  }
}

module.exports = Otrosi;
