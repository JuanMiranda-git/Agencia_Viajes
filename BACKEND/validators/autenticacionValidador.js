'use strict';

/**
 * Validadores de autenticacion (RF-ACC-01, RF-ACC-02, RF-ACC-04, RF-ACC-05).
 */

const { Joi, contrasena, email } = require('./comunValidador');

const iniciarSesion = Joi.object({
  email: email.required(),
  contrasena: Joi.string().required().messages({
    'string.empty': 'La contrasena es obligatoria',
    'any.required': 'La contrasena es obligatoria'
  })
});

const solicitarRecuperacion = Joi.object({
  email: email.required()
});

const restablecerClave = Joi.object({
  token: Joi.string().hex().length(64).required().messages({
    'string.hex': 'El token de recuperacion no es valido',
    'string.length': 'El token de recuperacion no es valido',
    'any.required': 'El token de recuperacion es obligatorio'
  }),
  nuevaContrasena: contrasena
});

const registroCliente = Joi.object({
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
  contrasena
});

module.exports = { iniciarSesion, solicitarRecuperacion, restablecerClave, registroCliente };
