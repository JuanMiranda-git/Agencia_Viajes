'use strict';

/**
 * Validadores de itinerarios (RF-ITI-01..03).
 */

const { Joi, paginacion } = require('./comunValidador');

const estados = ['Activo', 'Inactivo'];

const listar = paginacion.keys({
  idPaquete: Joi.number().integer().positive(),
  estado: Joi.string().valid(...estados).allow('')
});

const crear = Joi.object({
  idPaquete: Joi.number().integer().positive().messages({
    'number.base': 'El paquete debe ser numerico'
  }),
  titulo: Joi.string().trim().max(150).required().messages({
    'string.empty': 'El titulo de la actividad es obligatorio',
    'any.required': 'El titulo de la actividad es obligatorio'
  }),
  dia: Joi.number().integer().min(1).max(365).required().messages({
    'number.base': 'El dia debe ser un numero entero',
    'number.min': 'El dia debe ser mayor o igual a 1',
    'number.max': 'El dia no puede superar 365',
    'any.required': 'El dia es obligatorio'
  }),
  horaInicio: Joi.string()
    .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
    .allow('', null)
    .messages({ 'string.pattern.base': 'La hora de inicio debe tener formato HH:MM' }),
  horaFin: Joi.string()
    .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
    .allow('', null)
    .messages({ 'string.pattern.base': 'La hora de fin debe tener formato HH:MM' }),
  actividad: Joi.string().trim().max(300).required().messages({
    'string.empty': 'La actividad es obligatoria',
    'any.required': 'La actividad es obligatoria'
  }),
  descripcion: Joi.string().trim().max(2000).allow('', null),
  estadoItinerario: Joi.string()
    .valid(...estados)
    .default('Activo')
    .messages({ 'any.only': `El estado del itinerario debe ser ${estados.join(' o ')}` })
});

const actualizar = Joi.object({
  titulo: Joi.string().trim().max(150).required().messages({
    'string.empty': 'El titulo de la actividad es obligatorio',
    'any.required': 'El titulo de la actividad es obligatorio'
  }),
  dia: Joi.number().integer().min(1).max(365).required().messages({
    'number.base': 'El dia debe ser un numero entero',
    'any.required': 'El dia es obligatorio'
  }),
  horaInicio: Joi.string()
    .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
    .allow('', null),
  horaFin: Joi.string()
    .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
    .allow('', null),
  actividad: Joi.string().trim().max(300).required().messages({
    'string.empty': 'La actividad es obligatoria',
    'any.required': 'La actividad es obligatoria'
  }),
  descripcion: Joi.string().trim().max(2000).allow('', null),
  estadoItinerario: Joi.string()
    .valid(...estados)
    .required()
    .messages({ 'any.only': `El estado del itinerario debe ser ${estados.join(' o ')}` })
});

const actualizarParcial = Joi.object({
  titulo: Joi.string().trim().max(150),
  dia: Joi.number().integer().min(1).max(365),
  horaInicio: Joi.string()
    .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
    .allow('', null),
  horaFin: Joi.string()
    .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
    .allow('', null),
  actividad: Joi.string().trim().max(300),
  descripcion: Joi.string().trim().max(2000).allow('', null),
  estadoItinerario: Joi.string().valid(...estados)
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

const cambiarEstado = Joi.object({
  estadoItinerario: Joi.string()
    .valid(...estados)
    .required()
    .messages({
      'any.only': `El estado del itinerario debe ser ${estados.join(' o ')}`,
      'any.required': 'El estado del itinerario es obligatorio'
    })
});

module.exports = { listar, crear, actualizar, actualizarParcial, cambiarEstado };
