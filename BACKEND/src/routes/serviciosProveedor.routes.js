'use strict';

/**
 * Rutas del catalogo de servicios de proveedor (RF-PRO-03). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const serviciosProveedorValidador = require('../validators/serviciosProveedorValidador');
const serviciosProveedorController = require('../controllers/serviciosProveedor.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(serviciosProveedorValidador.listar), serviciosProveedorController.listar);
enrutador.post('/', validar('body')(serviciosProveedorValidador.crear), serviciosProveedorController.crear);
enrutador.get(
  '/:id',
  validar('params')(serviciosProveedorValidador.parametroIdServicio),
  serviciosProveedorController.obtener
);
enrutador.put(
  '/:id',
  validar('params')(serviciosProveedorValidador.parametroIdServicio),
  validar('body')(serviciosProveedorValidador.actualizar),
  serviciosProveedorController.actualizar
);
enrutador.patch(
  '/:id',
  validar('params')(serviciosProveedorValidador.parametroIdServicio),
  validar('body')(serviciosProveedorValidador.actualizarParcial),
  serviciosProveedorController.actualizarParcial
);

module.exports = enrutador;
