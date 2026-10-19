'use strict';

/**
 * Validadores de reservas (RF-RES-01..05).
 */

const { Joi, fecha, paginacion } = require('./comunValidador');

const estados = ['Pendiente', 'Confirmada', 'Cancelada'];

const listar = paginacion.keys({
  estado: Joi.string().valid(...estados).allow(''),
  idCliente: Joi.number().integer().positive(),
  fechaDesde: fecha.allow(''),
  fechaHasta: fecha.allow('')
});

const crear = Joi.object({
  idPaquete: Joi.number().integer().positive().required().messages({
    'number.base': 'El paquete debe ser numerico',
    'any.required': 'El paquete es obligatorio'
  }),
  idCliente: Joi.number().integer().positive().messages({
    'number.base': 'El cliente debe ser numerico'
  }),
  fechaViaje: fecha.required(),
  numPasajeros: Joi.number().integer().min(1).max(50).required().messages({
    'number.base': 'El numero de pasajeros debe ser entero',
    'number.min': 'Debe haber al menos 1 pasajero',
    'number.max': 'El numero de pasajeros no puede superar 50',
    'any.required': 'El numero de pasajeros es obligatorio'
  })
});

const cambiarEstado = Joi.object({
  estadoReserva: Joi.string()
    .valid('Confirmada', 'Cancelada')
    .required()
    .messages({
      'any.only': 'La reserva solo puede pasar a Confirmada o Cancelada',
      'any.required': 'El estado de la reserva es obligatorio'
    })
});

module.exports = { listar, crear, cambiarEstado };
