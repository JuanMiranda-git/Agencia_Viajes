'use strict';

/**
 * Validadores de transporte (RF-TRA-01..02).
 */

const { Joi, fechaHora, paginacion } = require('./comunValidador');

const TIPOS = ['Avion', 'Autobus', 'Tren', 'Ferry', 'Coche'];
const estados = ['Disponible', 'No Disponible', 'Mantenimiento'];

const listar = paginacion.keys({
  tipoTransporte: Joi.string().valid(...TIPOS).allow(''),
  estado: Joi.string().valid(...estados).allow(''),
  idPaquete: Joi.number().integer().positive()
});

const crear = Joi.object({
  tipoTransporte: Joi.string()
    .valid(...TIPOS)
    .required()
    .messages({
      'any.only': `El tipo de transporte debe ser ${TIPOS.join(', ')}`,
      'any.required': 'El tipo de transporte es obligatorio'
    }),
  idProveedor: Joi.number().integer().positive().required().messages({
    'number.base': 'El proveedor debe ser numerico',
    'any.required': 'El proveedor es obligatorio'
  }),
  idPaquete: Joi.number().integer().positive().allow(null),
  descripcion: Joi.string().trim().max(300).allow('', null),
  capacidad: Joi.number().integer().min(0).max(1000).default(0).messages({
    'number.base': 'La capacidad debe ser entera',
    'number.min': 'La capacidad no puede ser negativa',
    'number.max': 'La capacidad no puede superar 1000'
  }),
  precio: Joi.number().min(0).default(0).messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo'
  }),
  fechaSalida: fechaHora.allow('', null),
  fechaLlegada: fechaHora.allow('', null),
  estadoTransporte: Joi.string()
    .valid(...estados)
    .default('Disponible')
    .messages({ 'any.only': `El estado del transporte debe ser ${estados.join(', ')}` })
});

const actualizar = Joi.object({
  tipoTransporte: Joi.string()
    .valid(...TIPOS)
    .required()
    .messages({
      'any.only': `El tipo de transporte debe ser ${TIPOS.join(', ')}`,
      'any.required': 'El tipo de transporte es obligatorio'
    }),
  idPaquete: Joi.number().integer().positive().allow(null),
  descripcion: Joi.string().trim().max(300).allow('', null),
  capacidad: Joi.number().integer().min(0).max(1000).required().messages({
    'number.base': 'La capacidad debe ser entera',
    'any.required': 'La capacidad es obligatoria'
  }),
  precio: Joi.number().min(0).required().messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio'
  }),
  fechaSalida: fechaHora.allow('', null),
  fechaLlegada: fechaHora.allow('', null),
  estadoTransporte: Joi.string()
    .valid(...estados)
    .required()
    .messages({ 'any.only': `El estado del transporte debe ser ${estados.join(', ')}` })
});

const cambiarEstado = Joi.object({
  estadoTransporte: Joi.string()
    .valid(...estados)
    .required()
    .messages({
      'any.only': `El estado del transporte debe ser ${estados.join(', ')}`,
      'any.required': 'El estado del transporte es obligatorio'
    })
});

module.exports = { listar, crear, actualizar, cambiarEstado };
