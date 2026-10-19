'use strict';

/**
 * Rutas de clientes (soporte de reservas/CRM y Ley 1581 de 2012).
 * CRUD solo Administrador; los datos personales permiten acceso al titular.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador, administradorOCliente } = require('../middleware/autenticacion');
const clientesValidador = require('../validators/clientesValidador');
const clientesControlador = require('../controllers/clientesControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion);

enrutador.get('/:id/datos-personales', administradorOCliente, clientesControlador.obtenerDatosPersonales);
enrutador.patch(
  '/:id/datos-personales',
  administradorOCliente,
  validar('body')(clientesValidador.datosPersonales),
  clientesControlador.actualizarDatosPersonales
);
enrutador.delete('/:id/datos-personales', administradorOCliente, clientesControlador.eliminarDatosPersonales);
enrutador.get('/:id/historial', administradorOCliente, clientesControlador.historial);

enrutador.use(soloAdministrador);

enrutador.get('/', validar('query')(clientesValidador.listar), clientesControlador.listar);
enrutador.post('/', validar('body')(clientesValidador.crear), clientesControlador.crear);
enrutador.get('/:id', clientesControlador.obtener);
enrutador.put('/:id', validar('body')(clientesValidador.actualizar), clientesControlador.actualizar);

module.exports = enrutador;
