'use strict';

/**
 * Rutas de informes de desempeno (RF-DES-02, RF-VEN-04). Solo Administrador.
 */

const { Router } = require('express');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const informesControlador = require('../controllers/informesControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/desempeno', informesControlador.desempeno);
enrutador.get('/ventas', informesControlador.ventasPorPeriodo);

module.exports = enrutador;
