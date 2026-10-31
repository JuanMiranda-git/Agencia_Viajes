'use strict';

/**
 * Validadores de usuarios (RF-USR-01..06).
 */

const { Joi, contrasena, email, paginacion, esquemaIdParam } = require('./comunValidador');

const estados = ['Activo', 'Inactivo'];

const listar = paginacion.keys({
  nombre: Joi.string().trim().max(100).allow(''),
  correo: Joi.string().trim().max(150).allow(''),
  estado: Joi.string().valid(...estados).allow(''),
  documento: Joi.string().trim().max(20).allow(''),
  idRol: Joi.number().integer().positive()
});

const crear = Joi.object({
  nombreUsuario: Joi.string().trim().max(100).required().messages({
    'string.empty': 'El nombre del usuario es obligatorio',
    'any.required': 'El nombre del usuario es obligatorio'
  }),
  email: email.required(),
  contrasena,
  documento: Joi.string().trim().max(20).required().messages({
    'string.empty': 'El documento es obligatorio',
    'any.required': 'El documento es obligatorio'
  }),
  telefono: Joi.string().trim().max(20).allow('', null),
  idRol: Joi.number().integer().positive().required().messages({
    'number.base': 'El rol debe ser numerico',
    'any.required': 'El rol es obligatorio'
  }),
  proveedoresIdProveedor: Joi.number().integer().positive().allow(null).messages({
    'number.base': 'El proveedor debe ser numerico'
  })
});

const actualizar = Joi.object({
  nombreUsuario: Joi.string().trim().max(100).required().messages({
    'string.empty': 'El nombre del usuario es obligatorio',
    'any.required': 'El nombre del usuario es obligatorio'
  }),
  telefono: Joi.string().trim().max(20).allow('', null),
  idRol: Joi.number().integer().positive().required().messages({
    'number.base': 'El rol debe ser numerico',
    'any.required': 'El rol es obligatorio'
  })
});

const actualizarParcial = Joi.object({
  nombreUsuario: Joi.string().trim().max(100),
  telefono: Joi.string().trim().max(20).allow('', null),
  idRol: Joi.number().integer().positive().messages({ 'number.base': 'El rol debe ser numerico' }),
  estadoUsuario: Joi.string().valid(...estados)
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

const cambiarEstado = Joi.object({
  estadoUsuario: Joi.string()
    .valid(...estados)
    .required()
    .messages({
      'any.only': `El estado del usuario debe ser ${estados.join(' o ')}`,
      'any.required': 'El estado del usuario es obligatorio'
    })
});

const parametroIdUsuario = esquemaIdParam('id');

module.exports = { listar, crear, actualizar, actualizarParcial, cambiarEstado, parametroIdUsuario };
