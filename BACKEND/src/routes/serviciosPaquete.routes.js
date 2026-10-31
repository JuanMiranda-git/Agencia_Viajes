'use strict';

/**
 * Rutas del catalogo de servicios de paquete (RF-PAQ-02, RF-PAQ-04).
 * Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const serviciosPaqueteValidador = require('../validators/serviciosPaqueteValidador');
const serviciosPaqueteController = require('../controllers/serviciosPaquete.controller');

const enrutador = Router();

enrutador.get(
  '/',
  validar('query')(serviciosPaqueteValidador.listar),
  serviciosPaqueteController.listar
);
enrutador.get(
  '/:id',
  validar('params')(serviciosPaqueteValidador.parametroIdServicio),
  serviciosPaqueteController.obtener
);

enrutador.post('/', validar('body')(serviciosPaqueteValidador.crear), serviciosPaqueteController.crear);
enrutador.put(
  '/:id',
  validar('params')(serviciosPaqueteValidador.parametroIdServicio),
  validar('body')(serviciosPaqueteValidador.actualizar),
  serviciosPaqueteController.actualizar
);
enrutador.patch(
  '/:id',
  validar('params')(serviciosPaqueteValidador.parametroIdServicio),
  validar('body')(serviciosPaqueteValidador.actualizarParcial),
  serviciosPaqueteController.actualizarParcial
);

module.exports = enrutador;
