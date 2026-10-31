'use strict';

/**
 * Rutas de itinerarios (RF-ITI-01..03).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const itinerariosValidador = require('../validators/itinerariosValidador');
const itinerariosController = require('../controllers/itinerarios.controller');

const enrutador = Router();

enrutador.get(
  '/',
  validar('query')(itinerariosValidador.listar),
  itinerariosController.listar
);
enrutador.get('/:id', itinerariosController.obtener);

enrutador.post('/', validar('body')(itinerariosValidador.crear), itinerariosController.crear);
enrutador.put('/:id', validar('body')(itinerariosValidador.actualizar), itinerariosController.actualizar);
enrutador.patch(
  '/:id',
  validar('body')(itinerariosValidador.actualizarParcial),
  itinerariosController.actualizarParcial
);
enrutador.patch(
  '/:id/estado',
  validar('body')(itinerariosValidador.cambiarEstado),
  itinerariosController.cambiarEstado
);

module.exports = enrutador;
