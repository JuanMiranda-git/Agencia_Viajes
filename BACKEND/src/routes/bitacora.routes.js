'use strict';

/**
 * Rutas de bitacora de auditoria (RNF-SEG-02). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const bitacoraController = require('../controllers/bitacora.controller');

const enrutador = Router();

enrutador.get('/', bitacoraController.listar);

module.exports = enrutador;
