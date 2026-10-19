'use strict';

/**
 * Rutas de salud del servicio. Publica.
 */

const { Router } = require('express');
const saludControlador = require('../controllers/saludControlador');

const enrutador = Router();

enrutador.get('/', saludControlador.verificar);

module.exports = enrutador;
