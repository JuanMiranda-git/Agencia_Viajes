'use strict';

/**
 * Rutas de paquetes turisticos (RF-PAQ-01..05).
 * Sin autenticacion (fase de desarrollo); el rol ficticio es Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const paquetesValidador = require('../validators/paquetesValidador');
const itinerariosValidador = require('../validators/itinerariosValidador');
const paquetesController = require('../controllers/paquetes.controller');
const itinerariosController = require('../controllers/itinerarios.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(paquetesValidador.listar), paquetesController.listar);
enrutador.get('/:id', paquetesController.obtener);
enrutador.get('/:id/servicios', paquetesController.listarServicios);

enrutador.get(
  '/:id/itinerarios',
  validar('query')(itinerariosValidador.listar),
  (req, res, next) => {
    req.query.idPaquete = req.params.id;
    return itinerariosController.listar(req, res, next);
  }
);
enrutador.post(
  '/:id/itinerarios',
  validar('body')(itinerariosValidador.crear),
  itinerariosController.crear
);

enrutador.post('/', validar('body')(paquetesValidador.crear), paquetesController.crear);
enrutador.put('/:id', validar('body')(paquetesValidador.actualizar), paquetesController.actualizar);
enrutador.patch(
  '/:id',
  validar('body')(paquetesValidador.actualizarParcial),
  paquetesController.actualizarParcial
);
enrutador.patch(
  '/:id/estado',
  validar('body')(paquetesValidador.cambiarEstado),
  paquetesController.cambiarEstado
);
enrutador.post(
  '/:id/servicios',
  validar('body')(paquetesValidador.crearServicio),
  paquetesController.agregarServicio
);
enrutador.delete('/:id/servicios/:idServicio', paquetesController.quitarServicio);

module.exports = enrutador;
