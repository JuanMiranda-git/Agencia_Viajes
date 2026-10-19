'use strict';

/**
 * Rutas de contratos y otrosies (RF-CON-01..04). Solo Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const contratosValidador = require('../validators/contratosValidador');
const contratosControlador = require('../controllers/contratosControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/', validar('query')(contratosValidador.listar), contratosControlador.listar);
enrutador.post('/', validar('body')(contratosValidador.crear), contratosControlador.crear);
enrutador.get('/:id', contratosControlador.obtener);
enrutador.put('/:id', validar('body')(contratosValidador.actualizar), contratosControlador.actualizar);

enrutador.get('/:id/otrosi', contratosControlador.listarOtrosis);
enrutador.post('/:id/otrosi', validar('body')(contratosValidador.crearOtrosi), contratosControlador.crearOtrosi);

module.exports = enrutador;
