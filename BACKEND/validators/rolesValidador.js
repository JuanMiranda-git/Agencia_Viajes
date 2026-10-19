'use strict';

/**
 * Validadores de roles (RF-ROL-01..07).
 */

const { Joi, esquemaIdParam } = require('./comunValidador');

const estados = ['Activo', 'Inactivo'];

const crear = Joi.object({
  nombreRol: Joi.string().trim().max(80).required().messages({
    'string.empty': 'El nombre del rol es obligatorio',
    'any.required': 'El nombre del rol es obligatorio'
  }),
  descripcion: Joi.string().trim().max(250).allow('', null),
  estadoRol: Joi.string()
    .valid(...estados)
    .default('Activo')
    .messages({ 'any.only': `El estado del rol debe ser ${estados.join(' o ')}` })
});

const actualizar = Joi.object({
  nombreRol: Joi.string().trim().max(80).required().messages({
    'string.empty': 'El nombre del rol es obligatorio',
    'any.required': 'El nombre del rol es obligatorio'
  }),
  descripcion: Joi.string().trim().max(250).allow('', null),
  estadoRol: Joi.string()
    .valid(...estados)
    .required()
    .messages({ 'any.only': `El estado del rol debe ser ${estados.join(' o ')}` })
});

const cambiarEstado = Joi.object({
  estadoRol: Joi.string()
    .valid(...estados)
    .required()
    .messages({
      'any.only': `El estado del rol debe ser ${estados.join(' o ')}`,
      'any.required': 'El estado del rol es obligatorio'
    })
});

const asignarModulo = Joi.object({
  idModulo: Joi.number().integer().positive().required().messages({
    'number.base': 'El identificador del modulo debe ser numerico',
    'any.required': 'El identificador del modulo es obligatorio'
  })
});

const parametroIdRol = esquemaIdParam('id');
const parametroIdRolModulo = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'El identificador del rol debe ser numerico',
    'any.required': 'El identificador del rol es obligatorio'
  }),
  idModulo: Joi.number().integer().positive().required().messages({
    'number.base': 'El identificador del modulo debe ser numerico',
    'any.required': 'El identificador del modulo es obligatorio'
  })
});

module.exports = { crear, actualizar, cambiarEstado, asignarModulo, parametroIdRol, parametroIdRolModulo };
