'use strict';

/**
 * Validadores de ventas y pagos (RF-VEN-01..04).
 */

const { Joi, fecha, paginacion } = require('./comunValidador');

const estados = ['Pendiente', 'Pagado', 'Cancelado'];
const metodos = ['Tarjeta', 'Transferencia', 'Efectivo'];

const listar = paginacion.keys({
  estado: Joi.string().valid(...estados).allow(''),
  fechaDesde: fecha.allow(''),
  fechaHasta: fecha.allow('')
});

const crear = Joi.object({
  idReserva: Joi.number().integer().positive().required().messages({
    'number.base': 'La reserva debe ser numerica',
    'any.required': 'La reserva es obligatoria'
  }),
  monto: Joi.number().min(0).messages({
    'number.base': 'El monto debe ser numerico',
    'number.min': 'El monto no puede ser negativo'
  }),
  metodoPago: Joi.string()
    .valid(...metodos)
    .required()
    .messages({
      'any.only': `El metodo de pago debe ser ${metodos.join(', ')}`,
      'any.required': 'El metodo de pago es obligatorio'
    })
});

const actualizar = Joi.object({
  monto: Joi.number().min(0).required().messages({
    'number.base': 'El monto debe ser numerico',
    'number.min': 'El monto no puede ser negativo',
    'any.required': 'El monto es obligatorio'
  }),
  metodoPago: Joi.string()
    .valid(...metodos)
    .required()
    .messages({
      'any.only': `El metodo de pago debe ser ${metodos.join(', ')}`,
      'any.required': 'El metodo de pago es obligatorio'
    })
});

const actualizarParcial = Joi.object({
  monto: Joi.number().min(0),
  metodoPago: Joi.string().valid(...metodos)
})
  .min(1)
  .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

const registrarPago = Joi.object({
  monto: Joi.number().min(0).messages({
    'number.base': 'El monto debe ser numerico',
    'number.min': 'El monto no puede ser negativo'
  }),
  metodoPago: Joi.string()
    .valid(...metodos)
    .messages({ 'any.only': `El metodo de pago debe ser ${metodos.join(', ')}` })
});

module.exports = { listar, crear, actualizar, actualizarParcial, registrarPago };
