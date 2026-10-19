'use strict';

/**
 * Rutas de modulos del sistema (RF-ROL-05, RF-ROL-07). Solo Administrador.
 */

const { Router } = require('express');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const modulosControlador = require('../controllers/modulosControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/', modulosControlador.listar);

module.exports = enrutador;
