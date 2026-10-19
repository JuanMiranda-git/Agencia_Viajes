'use strict';

/**
 * Entidad de dominio: Servicio incluido en un paquete (RF-PAQ-02).
 */

const { validarTexto, validarEntero, validarDecimal, validarEnumeracion } = require('./comun');

const TIPOS = ['Transporte', 'Hospedaje', 'Actividad', 'Seguro', 'Comida'];

class ServicioPaquete {
  constructor({ idServicio = null, tipoServicio, descripcion, precio = 0 } = {}) {
    this.idServicio = validarEntero(idServicio, 'idServicio', { obligatorio: false, minimo: 1 });
    this.tipoServicio = validarEnumeracion(tipoServicio, 'tipoServicio', TIPOS);
    this.descripcion = validarTexto(descripcion, 'descripcion', { maximo: 300 });
    this.precio = validarDecimal(precio, 'precio', { minimo: 0 });
  }

  aJSON() {
    return {
      idServicio: this.idServicio,
      tipoServicio: this.tipoServicio,
      descripcion: this.descripcion,
      precio: this.precio
    };
  }
}

ServicioPaquete.TIPOS = TIPOS;

module.exports = ServicioPaquete;
