'use strict';

/**
 * Entidad de dominio: Contrato con proveedor (RF-CON-01..04, RN-02).
 */

const ErrorApi = require('../utils/ErrorApi');
const { validarTexto, validarEntero, validarDecimal, validarEnumeracion, validarFecha } = require('./comun');

const ESTADOS = ['Vigente', 'Vencido', 'Cancelado'];

class Contrato {
  constructor({
    idContrato = null,
    idProveedor,
    numeroContrato,
    descripcion = null,
    fechaInicio,
    fechaFin,
    valor = 0,
    estadoContrato = 'Vigente',
    fechaCreacion = null,
    fechaModificacion = null
  } = {}) {
    this.idContrato = validarEntero(idContrato, 'idContrato', { obligatorio: false, minimo: 1 });
    this.idProveedor = validarEntero(idProveedor, 'idProveedor', { minimo: 1 });
    this.numeroContrato = validarTexto(numeroContrato, 'numeroContrato', { maximo: 50 });
    this.descripcion = validarTexto(descripcion, 'descripcion', { obligatorio: false, maximo: 2000 });
    this.fechaInicio = validarFecha(fechaInicio, 'fechaInicio');
    this.fechaFin = validarFecha(fechaFin, 'fechaFin');
    this.valor = validarDecimal(valor, 'valor', { minimo: 0 });
    this.estadoContrato = validarEnumeracion(estadoContrato, 'estadoContrato', ESTADOS, { defecto: 'Vigente' });
    this.fechaCreacion = validarFecha(fechaCreacion, 'fechaCreacion', { obligatorio: false });
    this.fechaModificacion = validarFecha(fechaModificacion, 'fechaModificacion', { obligatorio: false });

    if (Date.parse(this.fechaFin) < Date.parse(this.fechaInicio)) {
      throw ErrorApi.solicitudInvalida('La fecha de finalizacion no puede ser anterior a la fecha de inicio', [
        { campo: 'fechaFin', mensaje: 'Rango de fechas invalido' }
      ]);
    }
  }

  /**
   * RN-02: un contrato esta vigente si su estado es Vigente y la fecha actual
   * esta dentro del rango inicio/fin.
   */
  estaVigente(fecha = new Date()) {
    const hoy = fecha instanceof Date ? fecha : new Date(fecha);
    return (
      this.estadoContrato === 'Vigente' &&
      Date.parse(this.fechaInicio) <= hoy.getTime() &&
      hoy.getTime() <= Date.parse(this.fechaFin)
    );
  }

  aJSON() {
    return {
      idContrato: this.idContrato,
      idProveedor: this.idProveedor,
      numeroContrato: this.numeroContrato,
      descripcion: this.descripcion,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      valor: this.valor,
      estadoContrato: this.estadoContrato,
      fechaCreacion: this.fechaCreacion,
      fechaModificacion: this.fechaModificacion
    };
  }
}

Contrato.ESTADOS = ESTADOS;

module.exports = Contrato;
