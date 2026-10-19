'use strict';

/**
 * Rutas de autenticacion (RF-ACC-01..05).
 * Iniciar sesion, recuperar y restablecer clave son publicas.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion } = require('../middleware/autenticacion');
const autenticacionValidador = require('../validators/autenticacionValidador');
const autenticacionControlador = require('../controllers/autenticacionControlador');

const enrutador = Router();

enrutador.post(
  '/iniciar-sesion',
  validar('body')(autenticacionValidador.iniciarSesion),
  autenticacionControlador.iniciarSesion
);

enrutador.post('/cerrar-sesion', verificarAutenticacion, autenticacionControlador.cerrarSesion);

enrutador.post(
  '/recuperar-clave',
  validar('body')(autenticacionValidador.solicitarRecuperacion),
  autenticacionControlador.solicitarRecuperacion
);

enrutador.post(
  '/restablecer-clave',
  validar('body')(autenticacionValidador.restablecerClave),
  autenticacionControlador.restablecerClave
);

enrutador.post(
  '/registro',
  validar('body')(autenticacionValidador.registroCliente),
  autenticacionControlador.registroCliente
);

module.exports = enrutador;
