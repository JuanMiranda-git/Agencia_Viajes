'use strict';

/**
 * Rutas de bitacora de auditoria (RNF-SEG-02). Solo Administrador.
 */

const { Router } = require('express');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const bitacoraControlador = require('../controllers/bitacoraControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/', bitacoraControlador.listar);

module.exports = enrutador;
