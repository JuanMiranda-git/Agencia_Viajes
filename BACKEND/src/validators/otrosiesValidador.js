'use strict';

/**
 * Validadores de otrosies contractuales (RF-CON-03).
 */

const { Joi, fecha, paginacion, esquemaIdParam } = require('./comunValidador');

const listar = paginacion.keys({
  idContrato: Joi.number().integer().positive(),
  numeroOtrosi: Joi.string().trim().max(50).allow('')
});

const crear = Joi.object({
  idContrato: Joi.number().integer().positive().required().messages({
    'number.base': 'El contrato debe ser numerico',
    'any.required': 'El contrato es obligatorio'
  }),
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

const actualizar = Joi.object({
  numeroOtrosi: Joi.string().trim().max(50).required().messages({
    'string.empty': 'El numero del otrosi es obligatorio',
    'any.required': 'El numero del otrosi es obligatorio'
  }),
  descripcion: Joi.string().trim().max(2000).required().messages({
    'string.empty': 'La descripcion del otrosi es obligatoria',
    'any.required': 'La descripcion del otrosi es obligatoria'
  }),
  valorNuevo: Joi.number().min(0).allow(null).messages({ 'number.min': 'El valor no puede ser negativo' }),
  fechaInicioNueva: fecha.allow(null),
  fechaFinNueva: fecha.allow(null)
});

const actualizarParcial = Joi.object({
  numeroOtrosi: Joi.string().trim().max(50),
  descripcion: Joi.string().trim().max(2000),
  valorNuevo: Joi.number().min(0).allow(null),
  fechaInicioNueva: fecha.allow(null),
  fechaFinNueva: fecha.allow(null)
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

const parametroIdOtrosi = esquemaIdParam('id');

module.exports = { listar, crear, actualizar, actualizarParcial, parametroIdOtrosi };
