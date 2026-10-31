'use strict';

/**
 * Rutas de roles y permisos de modulo (RF-ROL-01..07). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const rolesValidador = require('../validators/rolesValidador');
const rolesController = require('../controllers/roles.controller');

const enrutador = Router();

enrutador.get('/', rolesController.listar);
enrutador.post('/', validar('body')(rolesValidador.crear), rolesController.crear);
enrutador.get('/:id', validar('params')(rolesValidador.parametroIdRol), rolesController.obtener);
enrutador.put(
  '/:id',
  validar('params')(rolesValidador.parametroIdRol),
  validar('body')(rolesValidador.actualizar),
  rolesController.actualizar
);
enrutador.patch(
  '/:id',
  validar('params')(rolesValidador.parametroIdRol),
  validar('body')(rolesValidador.actualizarParcial),
  rolesController.actualizarParcial
);
enrutador.patch(
  '/:id/estado',
  validar('params')(rolesValidador.parametroIdRol),
  validar('body')(rolesValidador.cambiarEstado),
  rolesController.cambiarEstado
);

enrutador.get('/:id/modulos', validar('params')(rolesValidador.parametroIdRol), rolesController.listarModulos);
enrutador.post(
  '/:id/modulos',
  validar('params')(rolesValidador.parametroIdRol),
  validar('body')(rolesValidador.asignarModulo),
  rolesController.asignarModulo
);
enrutador.delete(
  '/:id/modulos/:idModulo',
  validar('params')(rolesValidador.parametroIdRolModulo),
  rolesController.quitarModulo
);

module.exports = enrutador;
