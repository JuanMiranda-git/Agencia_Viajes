'use strict';

/**
 * Rutas de ventas y pagos (RF-VEN-01..04). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const ventasValidador = require('../validators/ventasValidador');
const ventasController = require('../controllers/ventas.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(ventasValidador.listar), ventasController.listar);
enrutador.post('/', validar('body')(ventasValidador.crear), ventasController.crear);
enrutador.get('/:id', ventasController.obtener);
enrutador.put('/:id', validar('body')(ventasValidador.actualizar), ventasController.actualizar);
enrutador.patch('/:id', validar('body')(ventasValidador.actualizarParcial), ventasController.actualizar);
enrutador.post('/:id/pago', validar('body')(ventasValidador.registrarPago), ventasController.registrarPago);
enrutador.patch('/:id/cancelar', ventasController.cancelar);
enrutador.get('/:id/comprobante', ventasController.comprobante);

module.exports = enrutador;
