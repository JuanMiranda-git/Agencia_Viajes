'use strict';

/**
 * Rutas de itinerarios (RF-ITI-01..03).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador, administradorOCliente } = require('../middleware/autenticacion');
const itinerariosValidador = require('../validators/itinerariosValidador');
const itinerariosControlador = require('../controllers/itinerariosControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion);

enrutador.get(
  '/',
  administradorOCliente,
  validar('query')(itinerariosValidador.listar),
  itinerariosControlador.listar
);
enrutador.get('/:id', administradorOCliente, itinerariosControlador.obtener);

enrutador.use(soloAdministrador);

enrutador.post('/', validar('body')(itinerariosValidador.crear), itinerariosControlador.crear);
enrutador.put('/:id', validar('body')(itinerariosValidador.actualizar), itinerariosControlador.actualizar);
enrutador.patch(
  '/:id/estado',
  validar('body')(itinerariosValidador.cambiarEstado),
  itinerariosControlador.cambiarEstado
);

module.exports = enrutador;
