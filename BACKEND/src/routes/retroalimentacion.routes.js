'use strict';

/**
 * Rutas de retroalimentacion (RF-DES-01..03).
 * Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const retroalimentacionValidador = require('../validators/retroalimentacionValidador');
const retroalimentacionController = require('../controllers/retroalimentacion.controller');

const enrutador = Router();

enrutador.get(
  '/',
  validar('query')(retroalimentacionValidador.listar),
  retroalimentacionController.listar
);
enrutador.post(
  '/',
  validar('body')(retroalimentacionValidador.crear),
  retroalimentacionController.crear
);
enrutador.get('/resumen', retroalimentacionController.resumen);
enrutador.get('/:id', retroalimentacionController.obtener);
enrutador.put(
  '/:id',
  validar('body')(retroalimentacionValidador.actualizar),
  retroalimentacionController.actualizar
);
enrutador.patch(
  '/:id',
  validar('body')(retroalimentacionValidador.actualizarParcial),
  retroalimentacionController.actualizarParcial
);

module.exports = enrutador;
