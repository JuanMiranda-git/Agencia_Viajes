'use strict';

/**
 * Rutas de autenticacion (RF-ACC-01..05).
 * Sin autenticacion (fase de desarrollo); las rutas siguen disponibles.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const autenticacionValidador = require('../validators/autenticacionValidador');
const autenticacionController = require('../controllers/autenticacion.controller');

const enrutador = Router();

enrutador.post(
  '/iniciar-sesion',
  validar('body')(autenticacionValidador.iniciarSesion),
  autenticacionController.iniciarSesion
);

enrutador.post('/cerrar-sesion', autenticacionController.cerrarSesion);

enrutador.post(
  '/recuperar-clave',
  validar('body')(autenticacionValidador.solicitarRecuperacion),
  autenticacionController.solicitarRecuperacion
);

enrutador.post(
  '/restablecer-clave',
  validar('body')(autenticacionValidador.restablecerClave),
  autenticacionController.restablecerClave
);

enrutador.post(
  '/registro',
  validar('body')(autenticacionValidador.registroCliente),
  autenticacionController.registroCliente
);

module.exports = enrutador;
