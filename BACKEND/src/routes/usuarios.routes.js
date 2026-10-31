'use strict';

/**
 * Rutas de usuarios (RF-USR-01..06). Sin autenticacion (fase de desarrollo).
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const usuariosValidador = require('../validators/usuariosValidador');
const usuariosController = require('../controllers/usuarios.controller');

const enrutador = Router();

enrutador.get('/', validar('query')(usuariosValidador.listar), usuariosController.listar);
enrutador.post('/', validar('body')(usuariosValidador.crear), usuariosController.crear);
enrutador.get('/:id', validar('params')(usuariosValidador.parametroIdUsuario), usuariosController.obtener);
enrutador.put(
  '/:id',
  validar('params')(usuariosValidador.parametroIdUsuario),
  validar('body')(usuariosValidador.actualizar),
  usuariosController.actualizar
);
enrutador.patch(
  '/:id',
  validar('params')(usuariosValidador.parametroIdUsuario),
  validar('body')(usuariosValidador.actualizarParcial),
  usuariosController.actualizarParcial
);
enrutador.patch(
  '/:id/estado',
  validar('params')(usuariosValidador.parametroIdUsuario),
  validar('body')(usuariosValidador.cambiarEstado),
  usuariosController.cambiarEstado
);

module.exports = enrutador;
