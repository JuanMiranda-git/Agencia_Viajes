'use strict';

/**
 * Envuelve controladores asincronos para delegar los errores
 * al middleware central de errores.
 */
function manejadorAsincrono(fn) {
  return function envoltura(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = manejadorAsincrono;
