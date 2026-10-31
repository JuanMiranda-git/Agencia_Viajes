'use strict';

/**
 * Rutas de informes de desempeno (RF-DES-02, RF-VEN-04). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const informesController = require('../controllers/informes.controller');

const enrutador = Router();

enrutador.get('/desempeno', informesController.desempeno);
enrutador.get('/ventas', informesController.ventasPorPeriodo);

module.exports = enrutador;
