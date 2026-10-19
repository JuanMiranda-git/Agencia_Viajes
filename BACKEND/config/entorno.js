'use strict';

/**
 * Configuracion central del entorno.
 * Carga las variables desde .env y falla rapido si falta un secreto critico.
 */

require('dotenv').config();

const entorno = {
  nodeEnv: process.env.NODE_ENV || 'development',
  puerto: Number.parseInt(process.env.PUERTO || '3000', 10),
  bd: {
    host: process.env.BD_HOST || 'localhost',
    puerto: Number.parseInt(process.env.BD_PUERTO || '3306', 10),
    usuario: process.env.BD_USUARIO || '',
    clave: process.env.BD_CLAVE || '',
    nombre: process.env.BD_NOMBRE || 'tourmanager',
    poolMax: Number.parseInt(process.env.BD_POOL_MAX || '10', 10),
    poolMin: Number.parseInt(process.env.BD_POOL_MIN || '0', 10)
  },
  jwt: {
    clave: process.env.JWT_CLAVE || '',
    expiracion: process.env.JWT_EXPIRACION || '8h'
  },
  cors: {
    origenes: (process.env.CORS_ORIGENES || 'http://localhost:5500,http://127.0.0.1:5500')
      .split(',')
      .map((origen) => origen.trim())
      .filter(Boolean)
  },
  registro: {
    nivel: process.env.LOG_NIVEL || 'info'
  }
};

if (entorno.jwt.clave.length < 16) {
  throw new Error('JWT_CLAVE debe estar definida en el archivo .env y tener al menos 16 caracteres');
}

module.exports = entorno;
