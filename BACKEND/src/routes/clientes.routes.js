'use strict';

/**
 * Rutas de clientes (soporte de reservas/CRM y Ley 1581 de 2012).
 * Sin autenticacion (fase de desarrollo); incluye datos personales.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const clientesValidador = require('../validators/clientesValidador');
const clientesController = require('../controllers/clientes.controller');

const enrutador = Router();

enrutador.get('/:id/datos-personales', clientesController.obtenerDatosPersonales);
enrutador.patch(
  '/:id/datos-personales',
  validar('body')(clientesValidador.datosPersonales),
  clientesController.actualizarDatosPersonales
);
enrutador.delete('/:id/datos-personales', clientesController.eliminarDatosPersonales);
enrutador.get('/:id/historial', clientesController.historial);

enrutador.get('/', validar('query')(clientesValidador.listar), clientesController.listar);
enrutador.post('/', validar('body')(clientesValidador.crear), clientesController.crear);
enrutador.get('/:id', clientesController.obtener);
enrutador.put('/:id', validar('body')(clientesValidador.actualizar), clientesController.actualizar);
enrutador.patch(
  '/:id',
  validar('body')(clientesValidador.actualizarParcial),
  clientesController.actualizarParcial
);

module.exports = enrutador;
