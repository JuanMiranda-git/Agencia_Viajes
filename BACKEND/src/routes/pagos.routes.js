'use strict';

/**
 * Rutas de pagos (RF-VEN-02, RF-VEN-04). Sin autenticacion (fase de desarrollo).
 * Fachada sobre ventas: cada pago corresponde a una venta.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const pagosValidador = require('../validators/pagosValidador');
const pagosController = require('../controllers/pagos.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(pagosValidador.listar), pagosController.listar);
enrutador.post('/', validar('body')(pagosValidador.crear), pagosController.crear);
enrutador.get('/:id', validar('params')(pagosValidador.parametroIdPago), pagosController.obtener);
enrutador.put(
  '/:id',
  validar('params')(pagosValidador.parametroIdPago),
  validar('body')(pagosValidador.actualizar),
  pagosController.actualizar
);
enrutador.patch(
  '/:id',
  validar('params')(pagosValidador.parametroIdPago),
  validar('body')(pagosValidador.actualizarParcial),
  pagosController.actualizarParcial
);

module.exports = enrutador;
