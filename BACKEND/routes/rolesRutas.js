'use strict';

/**
 * Rutas de roles y permisos de modulo (RF-ROL-01..07). Solo Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const rolesValidador = require('../validators/rolesValidador');
const rolesControlador = require('../controllers/rolesControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/', rolesControlador.listar);
enrutador.post('/', validar('body')(rolesValidador.crear), rolesControlador.crear);
enrutador.get('/:id', validar('params')(rolesValidador.parametroIdRol), rolesControlador.obtener);
enrutador.put(
  '/:id',
  validar('params')(rolesValidador.parametroIdRol),
  validar('body')(rolesValidador.actualizar),
  rolesControlador.actualizar
);
enrutador.patch(
  '/:id/estado',
  validar('params')(rolesValidador.parametroIdRol),
  validar('body')(rolesValidador.cambiarEstado),
  rolesControlador.cambiarEstado
);

enrutador.get('/:id/modulos', validar('params')(rolesValidador.parametroIdRol), rolesControlador.listarModulos);
enrutador.post(
  '/:id/modulos',
  validar('params')(rolesValidador.parametroIdRol),
  validar('body')(rolesValidador.asignarModulo),
  rolesControlador.asignarModulo
);
enrutador.delete(
  '/:id/modulos/:idModulo',
  validar('params')(rolesValidador.parametroIdRolModulo),
  rolesControlador.quitarModulo
);

module.exports = enrutador;
