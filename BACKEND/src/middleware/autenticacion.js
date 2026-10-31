'use strict';

/**
 * Middleware de autenticacion (JWT) y autorizacion por rol (RBAC).
 * Roles del contexto (SRS 2.3): Administrador y Cliente.
 */

const { verificarToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const ROL_ADMINISTRADOR = 'Administrador';
const ROL_CLIENTE = 'Cliente';

/**
 * Exige un token JWT valido y adjunta `req.usuario` con { idUsuario, correo, nombreUsuario, rol }.
 */
function verificarAutenticacion(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(AppError.noAutenticado('Debe enviar un token Bearer en la cabecera Authorization'));
  }

  try {
    const carga = verificarToken(token);
    req.usuario = {
      idUsuario: Number.parseInt(carga.sub, 10),
      correo: carga.correo,
      nombreUsuario: carga.nombreUsuario,
      rol: carga.rol
    };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(AppError.noAutenticado('El token expiro; inicie sesion nuevamente'));
    }
    return next(AppError.noAutenticado('Token invalido'));
  }
}

/**
 * Restringe el acceso a los roles indicados.
 * @param  {...string} rolesPermitidos
 */
function autorizarRoles(...rolesPermitidos) {
  return function middlewareAutorizacion(req, res, next) {
    if (!req.usuario) {
      return next(AppError.noAutenticado());
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(AppError.prohibido('Su rol no tiene permitido ejecutar esta operacion'));
    }
    return next();
  };
}

const soloAdministrador = autorizarRoles(ROL_ADMINISTRADOR);
const administradorOCliente = autorizarRoles(ROL_ADMINISTRADOR, ROL_CLIENTE);

module.exports = {
  verificarAutenticacion,
  autorizarRoles,
  soloAdministrador,
  administradorOCliente,
  ROL_ADMINISTRADOR,
  ROL_CLIENTE
};
