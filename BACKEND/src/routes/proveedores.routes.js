'use strict';

/**
 * Rutas de proveedores (RF-PRO-01..03). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const proveedoresValidador = require('../validators/proveedoresValidador');
const proveedoresController = require('../controllers/proveedores.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(proveedoresValidador.listar), proveedoresController.listar);
enrutador.post('/', validar('body')(proveedoresValidador.crear), proveedoresController.crear);
enrutador.get('/:id', proveedoresController.obtener);
enrutador.put('/:id', validar('body')(proveedoresValidador.actualizar), proveedoresController.actualizar);
enrutador.patch(
  '/:id',
  validar('body')(proveedoresValidador.actualizarParcial),
  proveedoresController.actualizarParcial
);

enrutador.get('/:id/servicios', proveedoresController.listarServicios);
enrutador.post(
  '/:id/servicios',
  validar('body')(proveedoresValidador.crearServicio),
  proveedoresController.crearServicio
);

module.exports = enrutador;
