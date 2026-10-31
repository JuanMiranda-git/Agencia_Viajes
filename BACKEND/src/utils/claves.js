'use strict';

/**
 * Utilidades de hash de contrasenas con bcrypt (bcryptjs).
 * RNF-SEG-03: nunca se almacenan contrasenas en texto plano.
 */

const bcrypt = require('bcryptjs');

const RONDAS_BCRYPT = 12;

async function hashearClave(clavePlano) {
  return bcrypt.hash(clavePlano, RONDAS_BCRYPT);
}

async function compararClave(clavePlano, claveHash) {
  return bcrypt.compare(clavePlano, claveHash);
}

module.exports = { hashearClave, compararClave };
