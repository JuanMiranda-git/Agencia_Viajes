'use strict';

/**
 * Validadores de modulos del sistema (RF-ROL-05, RF-ROL-07).
 */

const { Joi, paginacion, esquemaIdParam } = require('./comunValidador');

const estados = ['Activo', 'Inactivo'];

const listar = paginacion.keys({
  soloActivos: Joi.boolean()
});

const parametroIdModulo = esquemaIdParam('id');

const crear = Joi.object({
  nombreModulo: Joi.string().trim().max(80).required().messages({
    'string.empty': 'El nombre del modulo es obligatorio',
    'any.required': 'El nombre del modulo es obligatorio'
  }),
  descripcion: Joi.string().trim().max(250).allow('', null),
  estadoModulo: Joi.string()
    .valid(...estados)
    .default('Activo')
    .messages({ 'any.only': `El estado del modulo debe ser ${estados.join(' o ')}` })
});

const actualizar = Joi.object({
  nombreModulo: Joi.string().trim().max(80).required().messages({
    'string.empty': 'El nombre del modulo es obligatorio',
    'any.required': 'El nombre del modulo es obligatorio'
  }),
  descripcion: Joi.string().trim().max(250).allow('', null),
  estadoModulo: Joi.string()
    .valid(...estados)
    .required()
    .messages({ 'any.only': `El estado del modulo debe ser ${estados.join(' o ')}` })
});

const actualizarParcial = Joi.object({
  nombreModulo: Joi.string().trim().max(80),
  descripcion: Joi.string().trim().max(250).allow('', null),
  estadoModulo: Joi.string().valid(...estados)
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

module.exports = { listar, parametroIdModulo, crear, actualizar, actualizarParcial };
