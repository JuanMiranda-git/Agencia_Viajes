'use strict';

/**
 * Rutas de contratos y otrosies (RF-CON-01..04). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const contratosValidador = require('../validators/contratosValidador');
const contratosController = require('../controllers/contratos.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(contratosValidador.listar), contratosController.listar);
enrutador.post('/', validar('body')(contratosValidador.crear), contratosController.crear);
enrutador.get('/:id', contratosController.obtener);
enrutador.put('/:id', validar('body')(contratosValidador.actualizar), contratosController.actualizar);
enrutador.patch(
  '/:id',
  validar('body')(contratosValidador.actualizarParcial),
  contratosController.actualizarParcial
);

enrutador.get('/:id/otrosi', contratosController.listarOtrosis);
enrutador.post('/:id/otrosi', validar('body')(contratosValidador.crearOtrosi), contratosController.crearOtrosi);

module.exports = enrutador;
