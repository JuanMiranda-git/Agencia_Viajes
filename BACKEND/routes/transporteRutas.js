'use strict';

/**
 * Rutas de transporte (RF-TRA-01..02). Solo Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const transporteValidador = require('../validators/transporteValidador');
const transporteControlador = require('../controllers/transporteControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/', validar('query')(transporteValidador.listar), transporteControlador.listar);
enrutador.post('/', validar('body')(transporteValidador.crear), transporteControlador.crear);
enrutador.get('/:id', transporteControlador.obtener);
enrutador.put('/:id', validar('body')(transporteValidador.actualizar), transporteControlador.actualizar);
enrutador.patch(
  '/:id/estado',
  validar('body')(transporteValidador.cambiarEstado),
  transporteControlador.cambiarEstado
);

module.exports = enrutador;
