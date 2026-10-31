'use strict';

/**
 * Rutas de reservas (RF-RES-01..05).
 * El listado y la consulta se filtran por rol en el servicio.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const reservasValidador = require('../validators/reservasValidador');
const reservasController = require('../controllers/reservas.controller');

const enrutador = Router();

enrutador.get(
  '/',
  validar('query')(reservasValidador.listar),
  reservasController.listar
);
enrutador.get('/mis-reservas', reservasController.listar);
enrutador.post(
  '/',
  validar('body')(reservasValidador.crear),
  reservasController.crear
);
enrutador.get('/:id', reservasController.obtener);
enrutador.get('/:id/comprobante', reservasController.comprobante);
enrutador.put(
  '/:id',
  validar('body')(reservasValidador.actualizar),
  reservasController.actualizar
);
enrutador.patch(
  '/:id',
  validar('body')(reservasValidador.actualizarParcial),
  reservasController.actualizar
);
enrutador.post('/:id/cancelar', reservasController.cancelar);

enrutador.post('/:id/confirmar', reservasController.confirmar);
enrutador.patch(
  '/:id/estado',
  validar('body')(reservasValidador.cambiarEstado),
  reservasController.cambiarEstado
);

module.exports = enrutador;
