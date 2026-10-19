'use strict';

/**
 * Rutas de proveedores (RF-PRO-01..03). Solo Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const proveedoresValidador = require('../validators/proveedoresValidador');
const proveedoresControlador = require('../controllers/proveedoresControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/', validar('query')(proveedoresValidador.listar), proveedoresControlador.listar);
enrutador.post('/', validar('body')(proveedoresValidador.crear), proveedoresControlador.crear);
enrutador.get('/:id', proveedoresControlador.obtener);
enrutador.put('/:id', validar('body')(proveedoresValidador.actualizar), proveedoresControlador.actualizar);

enrutador.get('/:id/servicios', proveedoresControlador.listarServicios);
enrutador.post(
  '/:id/servicios',
  validar('body')(proveedoresValidador.crearServicio),
  proveedoresControlador.crearServicio
);

module.exports = enrutador;
