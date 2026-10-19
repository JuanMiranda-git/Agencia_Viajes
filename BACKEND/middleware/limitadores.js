'use strict';

/**
 * Limitadores de tasa (rate limiting) para proteger la API.
 * - Limitador global para todas las rutas.
 * - Limitador estricto para rutas de autenticacion (previene fuerza bruta).
 */

const rateLimit = require('express-rate-limit');

const limitadorGlobal = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    exito: false,
    error: {
      codigo: 'DEMASIADAS_PETICIONES',
      mensaje: 'Demasiadas peticiones. Intente de nuevo mas tarde.'
    }
  }
});

const limitadorAutenticacion = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    exito: false,
    error: {
      codigo: 'DEMASIADOS_INTENTOS',
      mensaje: 'Demasiados intentos de autenticacion. Intente de nuevo en 15 minutos.'
    }
  }
});

module.exports = { limitadorGlobal, limitadorAutenticacion };
