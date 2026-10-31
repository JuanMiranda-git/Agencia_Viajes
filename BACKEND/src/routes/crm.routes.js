'use strict';

/**
 * Rutas de CRM: interacciones e historial del cliente (RF-CRM-01..03).
 * Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const crmValidador = require('../validators/crmValidador');
const crmController = require('../controllers/crm.controller');

const enrutador = Router();

enrutador.get('/interacciones', validar('query')(crmValidador.listar), crmController.listar);
enrutador.post('/interacciones', validar('body')(crmValidador.crear), crmController.crear);
enrutador.get('/interacciones/:id', crmController.obtener);
enrutador.put('/interacciones/:id', validar('body')(crmValidador.actualizar), crmController.actualizar);
enrutador.patch(
  '/interacciones/:id',
  validar('body')(crmValidador.actualizarParcial),
  crmController.actualizarParcial
);
enrutador.get('/clientes/:id/historial', crmController.historial);

module.exports = enrutador;
