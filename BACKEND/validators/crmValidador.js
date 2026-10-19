'use strict';

/**
 * Validadores de CRM: interacciones (RF-CRM-01..03).
 */

const { Joi, paginacion } = require('./comunValidador');

const TIPOS = ['Llamada', 'Correo', 'Reunion', 'Encuesta'];

const listar = paginacion.keys({
  idCliente: Joi.number().integer().positive(),
  tipoInteraccion: Joi.string().valid(...TIPOS).allow('')
});

const crear = Joi.object({
  idCliente: Joi.number().integer().positive().required().messages({
    'number.base': 'El cliente debe ser numerico',
    'any.required': 'El cliente es obligatorio'
  }),
  tipoInteraccion: Joi.string()
    .valid(...TIPOS)
    .required()
    .messages({
      'any.only': `El tipo de interaccion debe ser ${TIPOS.join(', ')}`,
      'any.required': 'El tipo de interaccion es obligatorio'
    }),
  descripcion: Joi.string().trim().max(2000).allow('', null),
  resultado: Joi.string().trim().max(250).allow('', null)
});

module.exports = { listar, crear };
