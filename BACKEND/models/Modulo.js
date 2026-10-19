'use strict';

/**
 * Entidad de dominio: Modulo (permisos asignables a un rol, RF-ROL-07).
 */

const { validarTexto, validarEntero, validarEnumeracion } = require('./comun');

const ESTADOS = ['Activo', 'Inactivo'];

class Modulo {
  constructor({ idModulo = null, nombreModulo, descripcion = null, estadoModulo = 'Activo' } = {}) {
    this.idModulo = validarEntero(idModulo, 'idModulo', { obligatorio: false, minimo: 1 });
    this.nombreModulo = validarTexto(nombreModulo, 'nombreModulo', { maximo: 80 });
    this.descripcion = validarTexto(descripcion, 'descripcion', { obligatorio: false, maximo: 250 });
    this.estadoModulo = validarEnumeracion(estadoModulo, 'estadoModulo', ESTADOS, { defecto: 'Activo' });
  }

  aJSON() {
    return {
      idModulo: this.idModulo,
      nombreModulo: this.nombreModulo,
      descripcion: this.descripcion,
      estadoModulo: this.estadoModulo
    };
  }
}

Modulo.ESTADOS = ESTADOS;

module.exports = Modulo;
