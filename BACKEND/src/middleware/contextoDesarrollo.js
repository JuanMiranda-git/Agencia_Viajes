'use strict';

/**
 * Contexto de desarrollo: la API no exige JWT ni roles mientras el equipo
 * valida el backend desde Postman (ver README_POSTMAN.md).
 *
 * Los controladores y servicios escriben auditoria con `req.usuario`, por lo
 * que se inyecta un usuario administrador ficticio en lugar de dejar la
 * peticion sin contexto. `idUsuario: null` evita romper la FK de bitacora
 * cuando la base no tiene usuarios sembrados.
 *
 * TODO: eliminar este middleware y reactivar verificarAutenticacion/RBAC en
 * los enrutadores cuando termine la fase de desarrollo.
 */

const USUARIO_DESARROLLO = Object.freeze({
  idUsuario: null,
  correo: 'desarrollo@tourmanager.local',
  nombreUsuario: 'Desarrollo',
  rol: 'Administrador'
});

function contextoDesarrollo(req, res, next) {
  if (!req.usuario) {
    req.usuario = { ...USUARIO_DESARROLLO };
  }
  return next();
}

module.exports = { contextoDesarrollo, USUARIO_DESARROLLO };
