'use strict';

/**
 * Validadores de paquetes turisticos (RF-PAQ-01..05).
 */

const { Joi, fecha, paginacion } = require('./comunValidador');

const estados = ['Activo', 'Inactivo'];
const TIPOS_SERVICIO = ['Transporte', 'Hospedaje', 'Actividad', 'Seguro', 'Comida'];

const listar = paginacion.keys({
  nombre: Joi.string().trim().max(150).allow(''),
  estado: Joi.string().valid(...estados).allow(''),
  precioMinimo: Joi.number().min(0),
  precioMaximo: Joi.number().min(0)
});

const crear = Joi.object({
  nombrePaquete: Joi.string().trim().max(150).required().messages({
    'string.empty': 'El nombre del paquete es obligatorio',
    'any.required': 'El nombre del paquete es obligatorio'
  }),
  descripcion: Joi.string().trim().max(2000).allow('', null),
  precio: Joi.number().min(0).required().messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio'
  }),
  fechaInicio: fecha.required(),
  fechaFin: fecha.required(),
  estadoPaquete: Joi.string()
    .valid(...estados)
    .default('Activo')
    .messages({ 'any.only': `El estado del paquete debe ser ${estados.join(' o ')}` })
});

const actualizar = Joi.object({
  nombrePaquete: Joi.string().trim().max(150).required().messages({
    'string.empty': 'El nombre del paquete es obligatorio',
    'any.required': 'El nombre del paquete es obligatorio'
  }),
  descripcion: Joi.string().trim().max(2000).allow('', null),
  precio: Joi.number().min(0).required().messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio'
  }),
  fechaInicio: fecha.required(),
  fechaFin: fecha.required(),
  estadoPaquete: Joi.string()
    .valid(...estados)
    .required()
    .messages({ 'any.only': `El estado del paquete debe ser ${estados.join(' o ')}` })
});

const cambiarEstado = Joi.object({
  estadoPaquete: Joi.string()
    .valid(...estados)
    .required()
    .messages({
      'any.only': `El estado del paquete debe ser ${estados.join(' o ')}`,
      'any.required': 'El estado del paquete es obligatorio'
    })
});

const crearServicio = Joi.object({
  tipoServicio: Joi.string()
    .valid(...TIPOS_SERVICIO)
    .required()
    .messages({
      'any.only': `El tipo de servicio debe ser uno de: ${TIPOS_SERVICIO.join(', ')}`,
      'any.required': 'El tipo de servicio es obligatorio'
    }),
  descripcion: Joi.string().trim().max(500).required().messages({
    'string.empty': 'La descripcion del servicio es obligatoria',
    'any.required': 'La descripcion del servicio es obligatoria'
  }),
  precio: Joi.number().min(0).required().messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio'
  })
});

module.exports = { listar, crear, actualizar, cambiarEstado, crearServicio };
