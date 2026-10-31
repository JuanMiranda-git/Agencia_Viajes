'use strict';

/**
 * Validadores de pagos (RF-VEN-02, RF-VEN-04). Fachada sobre ventas.
 */

const { Joi, fecha, paginacion, esquemaIdParam } = require('./comunValidador');

const estados = ['Pendiente', 'Pagado', 'Cancelado'];
const metodos = ['Tarjeta', 'Transferencia', 'Efectivo'];

const listar = paginacion.keys({
  estado: Joi.string().valid(...estados).allow(''),
  fechaDesde: fecha.allow(''),
  fechaHasta: fecha.allow('')
});

const crear = Joi.object({
  idVenta: Joi.number().integer().positive().required().messages({
    'number.base': 'La venta debe ser numerica',
    'any.required': 'La venta es obligatoria'
  }),
  monto: Joi.number().min(0).messages({
    'number.base': 'El monto debe ser numerico',
    'number.min': 'El monto no puede ser negativo'
  }),
  metodoPago: Joi.string()
    .valid(...metodos)
    .messages({ 'any.only': `El metodo de pago debe ser ${metodos.join(', ')}` })
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

const parametroIdPago = esquemaIdParam('id');

module.exports = { listar, crear, actualizar, actualizarParcial, parametroIdPago };
