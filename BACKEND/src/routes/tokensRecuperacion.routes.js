'use strict';

/**
 * Rutas de tokens de recuperacion de contrasena (RF-ACC-04, RF-ACC-05).
 * Sin autenticacion (fase de desarrollo); el token solo se devuelve al generarlo.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const tokensRecuperacionValidador = require('../validators/tokensRecuperacionValidador');
const tokensRecuperacionController = require('../controllers/tokensRecuperacion.controller');

const enrutador = Router();

enrutador.get(
  '/',
  validar('query')(tokensRecuperacionValidador.listar),
  tokensRecuperacionController.listar
);
enrutador.post('/', validar('body')(tokensRecuperacionValidador.crear), tokensRecuperacionController.crear);
enrutador.get(
  '/:id',
  validar('params')(tokensRecuperacionValidador.parametroIdToken),
  tokensRecuperacionController.obtener
);
enrutador.put(
  '/:id',
  validar('params')(tokensRecuperacionValidador.parametroIdToken),
  validar('body')(tokensRecuperacionValidador.actualizar),
  tokensRecuperacionController.actualizar
);
enrutador.patch(
  '/:id',
  validar('params')(tokensRecuperacionValidador.parametroIdToken),
  validar('body')(tokensRecuperacionValidador.actualizarParcial),
  tokensRecuperacionController.actualizarParcial
);

module.exports = enrutador;
