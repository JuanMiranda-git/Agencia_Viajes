'use strict';

/**
 * Rutas de CRM: interacciones e historial del cliente (RF-CRM-01..03).
 * Solo Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const crmValidador = require('../validators/crmValidador');
const crmControlador = require('../controllers/crmControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/interacciones', validar('query')(crmValidador.listar), crmControlador.listar);
enrutador.post('/interacciones', validar('body')(crmValidador.crear), crmControlador.crear);
enrutador.get('/clientes/:id/historial', crmControlador.historial);

module.exports = enrutador;
