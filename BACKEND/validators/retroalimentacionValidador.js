'use strict';

/**
 * Validadores de retroalimentacion (RF-DES-01..03).
 */

const { Joi, paginacion } = require('./comunValidador');

const listar = paginacion.keys({
  idPaquete: Joi.number().integer().positive(),
  idCliente: Joi.number().integer().positive(),
  calificacion: Joi.number().integer().min(1).max(5)
});

const crear = Joi.object({
  idPaquete: Joi.number().integer().positive().required().messages({
    'number.base': 'El paquete debe ser numerico',
    'any.required': 'El paquete es obligatorio'
  }),
  idCliente: Joi.number().integer().positive().messages({
    'number.base': 'El cliente debe ser numerico'
  }),
  calificacion: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'La calificacion debe ser un numero entero',
    'number.min': 'La calificacion minima es 1',
    'number.max': 'La calificacion maxima es 5',
    'any.required': 'La calificacion es obligatoria'
  }),
  comentario: Joi.string().trim().max(2000).allow('', null)
});

module.exports = { listar, crear };
