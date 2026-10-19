'use strict';

/**
 * Objeto de valor: Pago (RF-VEN-02, RF-VEN-04).
 * Representa un intento de pago de una venta. La pasarela con tarjeta es un
 * proveedor pendiente (TBD-03); sin ella, solo se procesan efectivo/transferencia.
 */

const ErrorApi = require('../utils/ErrorApi');
const { validarDecimal, validarEnumeracion } = require('./comun');

const METODOS = ['Tarjeta', 'Transferencia', 'Efectivo'];
const ESTADOS = ['Pendiente', 'Pagado', 'Cancelado'];

class Pago {
  constructor({ monto, metodoPago, estado = 'Pendiente', motivoRechazo = null } = {}) {
    this.monto = validarDecimal(monto, 'monto', { minimo: 0 });
    this.metodoPago = validarEnumeracion(metodoPago, 'metodoPago', METODOS);
    this.estado = validarEnumeracion(estado, 'estado', ESTADOS, { defecto: 'Pendiente' });
    this.motivoRechazo = motivoRechazo;
  }

  /**
   * Simula el procesamiento del pago:
   * - Efectivo/Transferencia: se aprueba de inmediato.
   * - Tarjeta: sin pasarela contratada (TBD-03), queda Pendiente con motivo.
   */
  procesar() {
    if (this.metodoPago === 'Tarjeta') {
      return new Pago({
        monto: this.monto,
        metodoPago: this.metodoPago,
        estado: 'Pendiente',
        motivoRechazo: 'La pasarela de pago con tarjeta no esta contratada (TBD-03). Intente con transferencia o efectivo.'
      });
    }
    return new Pago({ monto: this.monto, metodoPago: this.metodoPago, estado: 'Pagado' });
  }

  estaPagado() {
    return this.estado === 'Pagado';
  }

  aJSON() {
    return {
      monto: this.monto,
      metodoPago: this.metodoPago,
      estado: this.estado,
      motivoRechazo: this.motivoRechazo
    };
  }
}

Pago.METODOS = METODOS;
Pago.ESTADOS = ESTADOS;

module.exports = Pago;
