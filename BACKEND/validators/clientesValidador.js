'use strict';

/**
 * Validadores de clientes (soporte de reservas, CRM y Ley 1581).
 */

const { Joi, email, paginacion } = require('./comunValidador');

const listar = paginacion.keys({
  nombre: Joi.string().trim().max(150).allow(''),
  email: Joi.string().trim().max(150).allow(''),
  categoria: Joi.string().trim().max(120).allow('')
});

const crear = Joi.object({
  nombre: Joi.string().trim().max(100).required().messages({
    'string.empty': 'El nombre es obligatorio',
    'any.required': 'El nombre es obligatorio'
  }),
  apellido: Joi.string().trim().max(100).required().messages({
    'string.empty': 'El apellido es obligatorio',
    'any.required': 'El apellido es obligatorio'
  }),
  email: email.required(),
  telefono: Joi.string().trim().max(20).allow('', null),
  direccion: Joi.string().trim().max(250).allow('', null),
  categoriaCliente: Joi.string().trim().max(120).allow('', null),
  consentimientoDatos: Joi.boolean().required().valid(true).messages({
    'boolean.base': 'Debe indicar si otorga el consentimiento de datos',
    'any.only': 'Debe aceptar el tratamiento de datos personales (Ley 1581 de 2012)',
    'any.required': 'El consentimiento de datos es obligatorio'
  })
});

const actualizar = Joi.object({
  nombre: Joi.string().trim().max(100).required().messages({
    'string.empty': 'El nombre es obligatorio',
    'any.required': 'El nombre es obligatorio'
  }),
  apellido: Joi.string().trim().max(100).required().messages({
    'string.empty': 'El apellido es obligatorio',
    'any.required': 'El apellido es obligatorio'
  }),
  telefono: Joi.string().trim().max(20).allow('', null),
  direccion: Joi.string().trim().max(250).allow('', null),
  categoriaCliente: Joi.string().trim().max(120).allow('', null)
});

const datosPersonales = Joi.object({
  nombre: Joi.string().trim().max(100).required().messages({
    'any.required': 'El nombre es obligatorio'
  }),
  apellido: Joi.string().trim().max(100).required().messages({
    'any.required': 'El apellido es obligatorio'
  }),
  email: email.required(),
  telefono: Joi.string().trim().max(20).allow('', null),
  direccion: Joi.string().trim().max(250).allow('', null),
  consentimientoDatos: Joi.boolean().required().messages({
    'any.required': 'Debe indicar el estado del consentimiento de datos'
  })
});

module.exports = { listar, crear, actualizar, datosPersonales };
