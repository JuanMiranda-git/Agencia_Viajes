'use strict';

/**
 * Validadores de contratos y otrosies (RF-CON-01..04).
 */

const { Joi, fecha, paginacion } = require('./comunValidador');

const estados = ['Vigente', 'Vencido', 'Cancelado'];

const listar = paginacion.keys({
  idProveedor: Joi.number().integer().positive(),
  estadoContrato: Joi.string().valid(...estados).allow(''),
  fechaDesde: fecha.allow(''),
  fechaHasta: fecha.allow('')
});

const crear = Joi.object({
  idProveedor: Joi.number().integer().positive().required().messages({
    'number.base': 'El proveedor debe ser numerico',
    'any.required': 'El proveedor es obligatorio'
  }),
  numeroContrato: Joi.string().trim().max(50).required().messages({
    'string.empty': 'El numero de contrato es obligatorio',
    'any.required': 'El numero de contrato es obligatorio'
  }),
  descripcion: Joi.string().trim().max(2000).allow('', null),
  fechaInicio: fecha.required(),
  fechaFin: fecha.required(),
  valor: Joi.number().min(0).required().messages({
    'number.base': 'El valor debe ser numerico',
    'number.min': 'El valor no puede ser negativo',
    'any.required': 'El valor es obligatorio'
  }),
  estadoContrato: Joi.string()
    .valid(...estados)
    .default('Vigente')
    .messages({ 'any.only': `El estado del contrato debe ser ${estados.join(', ')}` })
});

const actualizar = Joi.object({
  descripcion: Joi.string().trim().max(2000).allow('', null),
  fechaInicio: fecha.required(),
  fechaFin: fecha.required(),
  valor: Joi.number().min(0).required().messages({
    'number.base': 'El valor debe ser numerico',
    'number.min': 'El valor no puede ser negativo',
    'any.required': 'El valor es obligatorio'
  }),
  estadoContrato: Joi.string()
    .valid(...estados)
    .required()
    .messages({ 'any.only': `El estado del contrato debe ser ${estados.join(', ')}` })
});

const actualizarParcial = Joi.object({
  descripcion: Joi.string().trim().max(2000).allow('', null),
  fechaInicio: fecha,
  fechaFin: fecha,
  valor: Joi.number().min(0),
  estadoContrato: Joi.string().valid(...estados)
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

const crearOtrosi = Joi.object({
  numeroOtrosi: Joi.string().trim().max(50).required().messages({
    'string.empty': 'El numero del otrosi es obligatorio',
    'any.required': 'El numero del otrosi es obligatorio'
  }),
  descripcion: Joi.string().trim().max(2000).required().messages({
    'string.empty': 'La descripcion del otrosi es obligatoria',
    'any.required': 'La descripcion del otrosi es obligatoria'
  }),
  valorNuevo: Joi.number().min(0).messages({ 'number.min': 'El valor no puede ser negativo' }),
  fechaInicioNueva: fecha.allow(null),
  fechaFinNueva: fecha.allow(null)
});

module.exports = { listar, crear, actualizar, actualizarParcial, crearOtrosi };
