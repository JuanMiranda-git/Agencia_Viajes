'use strict';

/**
 * Entidad de dominio: Interaccion CRM (RF-CRM-01..03).
 */

const { validarTexto, validarEntero, validarEnumeracion, validarFecha } = require('./comun');

const TIPOS = ['Llamada', 'Correo', 'Reunion', 'Encuesta'];

class InteraccionCrm {
  constructor({
    idInteraccion = null,
    idCliente,
    tipoInteraccion,
    fechaInteraccion = null,
    descripcion = null,
    resultado = null
  } = {}) {
    this.idInteraccion = validarEntero(idInteraccion, 'idInteraccion', { obligatorio: false, minimo: 1 });
    this.idCliente = validarEntero(idCliente, 'idCliente', { minimo: 1 });
    this.tipoInteraccion = validarEnumeracion(tipoInteraccion, 'tipoInteraccion', TIPOS);
    this.fechaInteraccion = validarFecha(fechaInteraccion, 'fechaInteraccion', { obligatorio: false });
    this.descripcion = validarTexto(descripcion, 'descripcion', { obligatorio: false, maximo: 2000 });
    this.resultado = validarTexto(resultado, 'resultado', { obligatorio: false, maximo: 250 });
  }

  aJSON() {
    return {
      idInteraccion: this.idInteraccion,
      idCliente: this.idCliente,
      tipoInteraccion: this.tipoInteraccion,
      fechaInteraccion: this.fechaInteraccion,
      descripcion: this.descripcion,
      resultado: this.resultado
    };
  }
}

InteraccionCrm.TIPOS = TIPOS;

module.exports = InteraccionCrm;
