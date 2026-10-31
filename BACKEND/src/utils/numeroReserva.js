'use strict';

/**
 * Generacion del numero de reserva.
 * Formato del contrato (SDD): AV-YYYYMMDD-XXXX, generado al confirmar.
 */

const crypto = require('crypto');

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * @param {string} [prefijo='AV']
 * @param {Date} [fecha=new Date()]
 */
function generarNumeroReserva(prefijo = 'AV', fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  let sufijo = '';
  for (let indice = 0; indice < 4; indice += 1) {
    sufijo += ALFABETO[crypto.randomInt(0, ALFABETO.length)];
  }

  return `${prefijo}-${anio}${mes}${dia}-${sufijo}`;
}

module.exports = { generarNumeroReserva };
