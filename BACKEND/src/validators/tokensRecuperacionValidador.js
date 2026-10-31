'use strict';

/**
 * Validadores de tokens de recuperacion de contrasena (RF-ACC-04, RF-ACC-05).
 */

const { Joi, fechaHora, paginacion, esquemaIdParam } = require('./comunValidador');

const listar = paginacion.keys({
  idUsuario: Joi.number().integer().positive(),
  usado: Joi.boolean().allow(''),
  soloVigentes: Joi.boolean().allow('')
});

const crear = Joi.object({
  idUsuario: Joi.number().integer().positive().required().messages({
    'number.base': 'El usuario debe ser numerico',
    'any.required': 'El usuario es obligatorio'
  }),
  fechaExpiracion: fechaHora.required().messages({
    'any.required': 'La fecha de expiracion es obligatoria'
  })
});

const actualizar = Joi.object({
  fechaExpiracion: fechaHora.required().messages({
    'any.required': 'La fecha de expiracion es obligatoria'
  }),
  usado: Joi.boolean().required().messages({
    'any.required': 'El estado de uso es obligatorio'
  })
});

const actualizarParcial = Joi.object({
  fechaExpiracion: fechaHora,
  usado: Joi.boolean()
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

const parametroIdToken = esquemaIdParam('id');

module.exports = { listar, crear, actualizar, actualizarParcial, parametroIdToken };
