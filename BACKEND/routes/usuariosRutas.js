'use strict';

/**
 * Rutas de usuarios (RF-USR-01..06). Solo Administrador.
 */

const { Router } = require('express');
const { validar } = require('../middleware/validacion');
const { verificarAutenticacion, soloAdministrador } = require('../middleware/autenticacion');
const usuariosValidador = require('../validators/usuariosValidador');
const usuariosControlador = require('../controllers/usuariosControlador');

const enrutador = Router();

enrutador.use(verificarAutenticacion, soloAdministrador);

enrutador.get('/', validar('query')(usuariosValidador.listar), usuariosControlador.listar);
enrutador.post('/', validar('body')(usuariosValidador.crear), usuariosControlador.crear);
enrutador.get('/:id', validar('params')(usuariosValidador.parametroIdUsuario), usuariosControlador.obtener);
enrutador.put(
  '/:id',
  validar('params')(usuariosValidador.parametroIdUsuario),
  validar('body')(usuariosValidador.actualizar),
  usuariosControlador.actualizar
);
enrutador.patch(
  '/:id/estado',
  validar('params')(usuariosValidador.parametroIdUsuario),
  validar('body')(usuariosValidador.cambiarEstado),
  usuariosControlador.cambiarEstado
);

module.exports = enrutador;
