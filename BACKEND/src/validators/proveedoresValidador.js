'use strict';

/**
 * Validadores de proveedores (RF-PRO-01..03).
 */

const { Joi, email, paginacion } = require('./comunValidador');

const TIPOS_SERVICIO = ['Hotel', 'Aerolinea', 'Guia', 'Restaurante', 'Transporte', 'Otro'];

const listar = paginacion.keys({
  nombre: Joi.string().trim().max(150).allow(''),
  tipoServicio: Joi.string().valid(...TIPOS_SERVICIO).allow('')
});

const crear = Joi.object({
  nombreEmpresa: Joi.string().trim().max(150).required().messages({
    'string.empty': 'El nombre de la empresa es obligatorio',
    'any.required': 'El nombre de la empresa es obligatorio'
  }),
  tipoServicio: Joi.string()
    .valid(...TIPOS_SERVICIO)
    .required()
    .messages({
      'any.only': `El tipo de servicio debe ser uno de: ${TIPOS_SERVICIO.join(', ')}`,
      'any.required': 'El tipo de servicio es obligatorio'
    }),
  contactoNombre: Joi.string().trim().max(150).allow('', null),
  contactoEmail: email.allow('', null),
  telefonoContacto: Joi.string().trim().max(20).allow('', null),
  direccion: Joi.string().trim().max(250).allow('', null)
});

const actualizar = crear;

const actualizarParcial = Joi.object({
  nombreEmpresa: Joi.string().trim().max(150),
  tipoServicio: Joi.string().valid(...TIPOS_SERVICIO),
  contactoNombre: Joi.string().trim().max(150).allow('', null),
  contactoEmail: email.allow('', null),
  telefonoContacto: Joi.string().trim().max(20).allow('', null),
  direccion: Joi.string().trim().max(250).allow('', null)
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

const crearServicio = Joi.object({
  nombreServicio: Joi.string().trim().max(150).required().messages({
    'string.empty': 'El nombre del servicio es obligatorio',
    'any.required': 'El nombre del servicio es obligatorio'
  }),
  descripcion: Joi.string().trim().max(500).allow('', null),
  precio: Joi.number().min(0).required().messages({
    'number.base': 'El precio debe ser numerico',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio'
  }),
  disponible: Joi.boolean().default(true)
});

module.exports = { listar, crear, actualizar, actualizarParcial, crearServicio };
