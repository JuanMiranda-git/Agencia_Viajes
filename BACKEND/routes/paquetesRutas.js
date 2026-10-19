'use strict';

/**
 * Rutas de paquetes turisticos (RF-PAQ-01..05).
 * Consulta: Administrador y Cliente (el cliente solo ve activos).
 * Mutaciones: solo Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador, administradorOCliente } = require('../middleware/autenticacion');
const paquetesValidador = require('../validators/paquetesValidador');
const itinerariosValidador = require('../validators/itinerariosValidador');
const paquetesControlador = require('../controllers/paquetesControlador');
const itinerariosControlador = require('../controllers/itinerariosControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion);

enrutador.get('/', administradorOCliente, validar('query')(paquetesValidador.listar), paquetesControlador.listar);
enrutador.get('/:id', administradorOCliente, paquetesControlador.obtener);
enrutador.get('/:id/servicios', administradorOCliente, paquetesControlador.listarServicios);

enrutador.get(
  '/:id/itinerarios',
  administradorOCliente,
  validar('query')(itinerariosValidador.listar),
  (req, res, next) => {
    req.query.idPaquete = req.params.id;
    return itinerariosControlador.listar(req, res, next);
  }
);
enrutador.post(
  '/:id/itinerarios',
  soloAdministrador,
  validar('body')(itinerariosValidador.crear),
  itinerariosControlador.crear
);

enrutador.use(soloAdministrador);

enrutador.post('/', validar('body')(paquetesValidador.crear), paquetesControlador.crear);
enrutador.put('/:id', validar('body')(paquetesValidador.actualizar), paquetesControlador.actualizar);
enrutador.patch(
  '/:id/estado',
  validar('body')(paquetesValidador.cambiarEstado),
  paquetesControlador.cambiarEstado
);
enrutador.post(
  '/:id/servicios',
  validar('body')(paquetesValidador.crearServicio),
  paquetesControlador.agregarServicio
);
enrutador.delete('/:id/servicios/:idServicio', paquetesControlador.quitarServicio);

module.exports = enrutador;
