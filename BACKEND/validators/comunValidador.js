'use strict';

/**
 * Esquemas Joi compartidos por los validadores de modulo.
 */

const Joi = require('joi');

const MENSAJE_FECHA = 'Debe ser una fecha valida (formato AAAA-MM-DD)';
const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const PATRON_FECHA_HORA = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/;

const fecha = Joi.string().pattern(PATRON_FECHA).messages({
  'string.base': MENSAJE_FECHA,
  'string.empty': 'La fecha es obligatoria',
  'string.pattern.base': MENSAJE_FECHA,
  'any.required': 'La fecha es obligatoria'
});

const fechaHora = Joi.string().pattern(PATRON_FECHA_HORA).messages({
  'string.base': 'Debe ser una fecha valida',
  'string.pattern.base': 'Debe ser una fecha valida (AAAA-MM-DD o AAAA-MM-DD HH:MM)'
});

const contrasena = Joi.string().min(8).max(72).messages({
  'string.base': 'La contrasena debe ser texto',
  'string.min': 'La contrasena debe tener al menos 8 caracteres',
  'string.max': 'La contrasena no puede superar 72 caracteres',
  'any.required': 'La contrasena es obligatoria'
});

const email = Joi.string().email().max(150).lowercase().trim().messages({
  'string.email': 'Debe ser un correo electronico valido',
  'string.empty': 'El correo electronico es obligatorio',
  'any.required': 'El correo electronico es obligatorio'
});

const paginacion = Joi.object({
  pagina: Joi.number().integer().min(1).messages({
    'number.base': 'El numero de pagina debe ser entero',
    'number.min': 'El numero de pagina debe ser mayor o igual a 1'
  }),
  limite: Joi.number().integer().min(1).max(100).messages({
    'number.base': 'El limite debe ser entero',
    'number.min': 'El limite debe ser mayor o igual a 1',
    'number.max': 'El limite no puede superar 100'
  })
}).unknown(true);

function esquemaIdParam(nombreCampo = 'id') {
  return Joi.object({
    [nombreCampo]: Joi.number().integer().positive().required().messages({
      'number.base': 'El identificador debe ser numerico',
      'number.positive': 'El identificador debe ser positivo',
      'any.required': 'El identificador es obligatorio'
    })
  });
}

module.exports = { Joi, fecha, fechaHora, contrasena, email, paginacion, esquemaIdParam };
