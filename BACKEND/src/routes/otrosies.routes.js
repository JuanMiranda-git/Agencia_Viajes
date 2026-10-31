'use strict';

/**
 * Rutas de otrosies contractuales (RF-CON-03). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const otrosiesValidador = require('../validators/otrosiesValidador');
const otrosiesController = require('../controllers/otrosies.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(otrosiesValidador.listar), otrosiesController.listar);
enrutador.post('/', validar('body')(otrosiesValidador.crear), otrosiesController.crear);
enrutador.get('/:id', validar('params')(otrosiesValidador.parametroIdOtrosi), otrosiesController.obtener);
enrutador.put(
  '/:id',
  validar('params')(otrosiesValidador.parametroIdOtrosi),
  validar('body')(otrosiesValidador.actualizar),
  otrosiesController.actualizar
);
enrutador.patch(
  '/:id',
  validar('params')(otrosiesValidador.parametroIdOtrosi),
  validar('body')(otrosiesValidador.actualizarParcial),
  otrosiesController.actualizarParcial
);

module.exports = enrutador;
