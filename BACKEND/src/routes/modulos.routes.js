'use strict';

/**
 * Rutas de modulos del sistema (RF-ROL-05, RF-ROL-07). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const modulosValidador = require('../validators/modulosValidador');
const modulosController = require('../controllers/modulos.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(modulosValidador.listar), modulosController.listar);
enrutador.post('/', validar('body')(modulosValidador.crear), modulosController.crear);
enrutador.get('/:id', validar('params')(modulosValidador.parametroIdModulo), modulosController.obtener);
enrutador.put(
  '/:id',
  validar('params')(modulosValidador.parametroIdModulo),
  validar('body')(modulosValidador.actualizar),
  modulosController.actualizar
);
enrutador.patch(
  '/:id',
  validar('params')(modulosValidador.parametroIdModulo),
  validar('body')(modulosValidador.actualizarParcial),
  modulosController.actualizarParcial
);

module.exports = enrutador;
