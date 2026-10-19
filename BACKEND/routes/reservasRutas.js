'use strict';

/**
 * Rutas de reservas (RF-RES-01..05).
 * El listado y la consulta se filtran por rol en el servicio.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador, administradorOCliente } = require('../middleware/autenticacion');
const reservasValidador = require('../validators/reservasValidador');
const reservasControlador = require('../controllers/reservasControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion);

enrutador.get(
  '/',
  administradorOCliente,
  validar('query')(reservasValidador.listar),
  reservasControlador.listar
);
enrutador.get('/mis-reservas', administradorOCliente, reservasControlador.listar);
enrutador.post(
  '/',
  administradorOCliente,
  validar('body')(reservasValidador.crear),
  reservasControlador.crear
);
enrutador.get('/:id', administradorOCliente, reservasControlador.obtener);
enrutador.get('/:id/comprobante', administradorOCliente, reservasControlador.comprobante);
enrutador.post('/:id/cancelar', administradorOCliente, reservasControlador.cancelar);

enrutador.use(soloAdministrador);

enrutador.post('/:id/confirmar', reservasControlador.confirmar);
enrutador.patch(
  '/:id/estado',
  validar('body')(reservasValidador.cambiarEstado),
  reservasControlador.cambiarEstado
);

module.exports = enrutador;
