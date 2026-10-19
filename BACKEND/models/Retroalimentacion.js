'use strict';

/**
 * Entidad de dominio: Retroalimentacion de cliente (RF-DES-01..03).
 */

const { validarTexto, validarEntero, validarFecha } = require('./comun');

class Retroalimentacion {
  constructor({
    idRetroalimentacion = null,
    idPaquete,
    idCliente,
    calificacion,
    comentario = null,
    fechaCreacion = null
  } = {}) {
    this.idRetroalimentacion = validarEntero(idRetroalimentacion, 'idRetroalimentacion', { obligatorio: false, minimo: 1 });
    this.idPaquete = validarEntero(idPaquete, 'idPaquete', { minimo: 1 });
    this.idCliente = validarEntero(idCliente, 'idCliente', { minimo: 1 });
    this.calificacion = validarEntero(calificacion, 'calificacion', { minimo: 1, maximo: 5 });
    this.comentario = validarTexto(comentario, 'comentario', { obligatorio: false, maximo: 2000 });
    this.fechaCreacion = validarFecha(fechaCreacion, 'fechaCreacion', { obligatorio: false });
  }

  aJSON() {
    return {
      idRetroalimentacion: this.idRetroalimentacion,
      idPaquete: this.idPaquete,
      idCliente: this.idCliente,
      calificacion: this.calificacion,
      comentario: this.comentario,
      fechaCreacion: this.fechaCreacion
    };
  }
}

module.exports = Retroalimentacion;
