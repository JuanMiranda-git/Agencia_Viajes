'use strict';

/**
 * Validadores del catalogo de servicios de proveedor (RF-PRO-03).
 */

const { Joi, paginacion, esquemaIdParam } = require('./comunValidador');

const listar = paginacion.keys({
  idProveedor: Joi.number().integer().positive(),
  nombre: Joi.string().trim().max(150).allow(''),
  disponible: Joi.boolean().allow('')
});

const crear = Joi.object({
  idProveedor: Joi.number().integer().positive().required().messages({
    'number.base': 'El proveedor debe ser numerico',
    'any.required': 'El proveedor es obligatorio'
  }),
  nombreServicio: Joi.string().trim().max(150).required().messages({
    'string.empty': 'El nombre del servicio es obligatorio',
    'any.required': 'El nombre del servicio es obligatorio'
  }),
  descripcion: Joi.string().trim().max(300).allow('', null),
  precio: Joi.number().min(0).default(0).messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo'
  }),
  disponible: Joi.boolean().default(true)
});

const actualizar = Joi.object({
  idProveedor: Joi.number().integer().positive().required().messages({
    'number.base': 'El proveedor debe ser numerico',
    'any.required': 'El proveedor es obligatorio'
  }),
  nombreServicio: Joi.string().trim().max(150).required().messages({
    'string.empty': 'El nombre del servicio es obligatorio',
    'any.required': 'El nombre del servicio es obligatorio'
  }),
  descripcion: Joi.string().trim().max(300).allow('', null),
  precio: Joi.number().min(0).required().messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio'
  }),
  disponible: Joi.boolean().required().messages({
    'any.required': 'La disponibilidad es obligatoria'
  })
});

const actualizarParcial = Joi.object({
  idProveedor: Joi.number().integer().positive(),
  nombreServicio: Joi.string().trim().max(150),
  descripcion: Joi.string().trim().max(300).allow('', null),
  precio: Joi.number().min(0),
  disponible: Joi.boolean().allow('')
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

const parametroIdServicio = esquemaIdParam('id');

module.exports = { listar, crear, actualizar, actualizarParcial, parametroIdServicio };
