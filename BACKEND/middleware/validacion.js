'use strict';

/**
 * Middleware de validacion de entrada con Joi.
 * Uso: validar('body')(esquema) o validar('query')(esquema) o validar('params')(esquema).
 */

const ErrorApi = require('../utils/ErrorApi');

/**
 * @param {'body'|'query'|'params'} fuente
 */
function validar(fuente) {
  return function validarConEsquema(esquema) {
    return async function middlewareValidacion(req, res, next) {
      try {
        const valor = await esquema.validateAsync(req[fuente], {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });
        req[fuente] = valor;
        return next();
      } catch (error) {
        if (error.isJoi) {
          const detalles = error.details.map((detalle) => ({
            campo: detalle.path.join('.'),
            mensaje: detalle.message
          }));
          return next(ErrorApi.solicitudInvalida('Datos de entrada invalidos', detalles));
        }
        return next(error);
      }
    };
  };
}

module.exports = { validar };
