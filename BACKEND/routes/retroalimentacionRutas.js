'use strict';

/**
 * Rutas de retroalimentacion (RF-DES-01..03).
 * Un Cliente califica sus viajes; el resumen es del Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador, administradorOCliente } = require('../middleware/autenticacion');
const retroalimentacionValidador = require('../validators/retroalimentacionValidador');
const retroalimentacionControlador = require('../controllers/retroalimentacionControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion);

enrutador.get(
  '/',
  administradorOCliente,
  validar('query')(retroalimentacionValidador.listar),
  retroalimentacionControlador.listar
);
enrutador.post(
  '/',
  administradorOCliente,
  validar('body')(retroalimentacionValidador.crear),
  retroalimentacionControlador.crear
);

enrutador.use(soloAdministrador);

enrutador.get('/resumen', retroalimentacionControlador.resumen);

module.exports = enrutador;
