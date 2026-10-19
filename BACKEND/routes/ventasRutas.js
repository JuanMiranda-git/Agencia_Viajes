'use strict';

/**
 * Rutas de ventas y pagos (RF-VEN-01..04). Solo Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const ventasValidador = require('../validators/ventasValidador');
const ventasControlador = require('../controllers/ventasControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/', validar('query')(ventasValidador.listar), ventasControlador.listar);
enrutador.post('/', validar('body')(ventasValidador.crear), ventasControlador.crear);
enrutador.get('/:id', ventasControlador.obtener);
enrutador.post('/:id/pago', validar('body')(ventasValidador.registrarPago), ventasControlador.registrarPago);
enrutador.patch('/:id/cancelar', ventasControlador.cancelar);
enrutador.get('/:id/comprobante', ventasControlador.comprobante);

module.exports = enrutador;
