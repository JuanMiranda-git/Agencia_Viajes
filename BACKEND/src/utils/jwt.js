'use strict';

/**
 * Utilidades de JWT (jsonwebtoken).
 */

const jwt = require('jsonwebtoken');
const entorno = require('../config/entorno');

/**
 * Firma un token con los datos del usuario autenticado.
 */
function firmarToken(usuario) {
  const carga = {
    sub: String(usuario.idUsuario),
    correo: usuario.email,
    nombreUsuario: usuario.nombreUsuario,
    rol: usuario.nombreRol
  };
  return jwt.sign(carga, entorno.jwt.clave, { expiresIn: entorno.jwt.expiracion });
}

/**
 * Verifica y decodifica un token. Lanza AppError si es invalido o expiro.
 */
function verificarToken(token) {
  return jwt.verify(token, entorno.jwt.clave);
}

module.exports = { firmarToken, verificarToken };
