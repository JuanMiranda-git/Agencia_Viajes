'use strict';

/**
 * Validadores del catalogo de servicios de paquete (RF-PAQ-02, RF-PAQ-04).
 */

const { Joi, paginacion, esquemaIdParam } = require('./comunValidador');

const TIPOS = ['Transporte', 'Hospedaje', 'Actividad', 'Seguro', 'Comida'];

const listar = paginacion.keys({
  tipoServicio: Joi.string().valid(...TIPOS).allow(''),
  idPaquete: Joi.number().integer().positive()
});

const crear = Joi.object({
  idPaquete: Joi.number().integer().positive().required().messages({
    'number.base': 'El paquete debe ser numerico',
    'any.required': 'El paquete es obligatorio'
  }),
  tipoServicio: Joi.string()
    .valid(...TIPOS)
    .required()
    .messages({
      'any.only': `El tipo de servicio debe ser ${TIPOS.join(', ')}`,
      'any.required': 'El tipo de servicio es obligatorio'
    }),
  descripcion: Joi.string().trim().max(300).required().messages({
    'string.empty': 'La descripcion del servicio es obligatoria',
    'any.required': 'La descripcion del servicio es obligatoria'
  }),
  precio: Joi.number().min(0).required().messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio'
  })
});

const actualizar = Joi.object({
  tipoServicio: Joi.string()
    .valid(...TIPOS)
    .required()
    .messages({
      'any.only': `El tipo de servicio debe ser ${TIPOS.join(', ')}`,
      'any.required': 'El tipo de servicio es obligatorio'
    }),
  descripcion: Joi.string().trim().max(300).required().messages({
    'string.empty': 'La descripcion del servicio es obligatoria',
    'any.required': 'La descripcion del servicio es obligatoria'
  }),
  precio: Joi.number().min(0).required().messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio'
  })
});

const actualizarParcial = Joi.object({
  tipoServicio: Joi.string().valid(...TIPOS),
  descripcion: Joi.string().trim().max(300),
  precio: Joi.number().min(0)
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

const parametroIdServicio = esquemaIdParam('id');

module.exports = { listar, crear, actualizar, actualizarParcial, parametroIdServicio };
