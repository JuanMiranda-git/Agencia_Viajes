'use strict';

/**
 * Rutas de transporte (RF-TRA-01..02). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const transporteValidador = require('../validators/transporteValidador');
const transporteController = require('../controllers/transporte.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(transporteValidador.listar), transporteController.listar);
enrutador.post('/', validar('body')(transporteValidador.crear), transporteController.crear);
enrutador.get('/:id', transporteController.obtener);
enrutador.put('/:id', validar('body')(transporteValidador.actualizar), transporteController.actualizar);
enrutador.patch(
  '/:id',
  validar('body')(transporteValidador.actualizarParcial),
  transporteController.actualizarParcial
);
enrutador.patch(
  '/:id/estado',
  validar('body')(transporteValidador.cambiarEstado),
  transporteController.cambiarEstado
);

module.exports = enrutador;
