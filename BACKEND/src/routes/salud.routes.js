'use strict';

/**
 * Rutas de salud del servicio. Publica.
 */

const { Router } = require('express');
const saludController = require('../controllers/salud.controller');

const enrutador = Router();

enrutador.get('/', saludController.verificar);

module.exports = enrutador;
