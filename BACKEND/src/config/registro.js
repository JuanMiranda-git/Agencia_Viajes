'use strict';

/**
 * Registro (logging) estructurado con Winston.
 * - Niveles configurables por LOG_NIVEL.
 * - Archivo separado para errores (error.log) y archivo combinado (combinado.log).
 * - Oculta datos sensibles (contrasenas, tokens, cabeceras de autorizacion).
 */

const path = require('path');
const fs = require('fs');
const { createLogger, format, transports } = require('winston');
const entorno = require('./entorno');

const directorioLogs = path.join(__dirname, '..', 'logs');
fs.mkdirSync(directorioLogs, { recursive: true });

const CAMPOS_SENSIBLES = ['contrasena', 'clave', 'password', 'token', 'authorization', 'jwt', 'contrasenaHash'];

function ocultarSensibles(valor, profundidad = 0) {
  if (profundidad > 6 || valor === null || typeof valor !== 'object') {
    return valor;
  }
  if (Array.isArray(valor)) {
    return valor.map((elemento) => ocultarSensibles(elemento, profundidad + 1));
  }
  const resultado = {};
  for (const [llave, contenido] of Object.entries(valor)) {
    resultado[llave] = CAMPOS_SENSIBLES.includes(llave.toLowerCase())
      ? '[OCULTO]'
      : ocultarSensibles(contenido, profundidad + 1);
  }
  return resultado;
}

const formatoOcultar = format((info) => {
  const copia = ocultarSensibles(info);
  copia.level = info.level;
  return copia;
});

const formatoArchivo = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  formatoOcultar(),
  format.json()
);

const formatoConsola = format.combine(
  format.timestamp({ format: 'HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ timestamp, level, message, ...resto }) => {
    const extra = Object.keys(resto).length > 0 ? ` ${JSON.stringify(ocultarSensibles(resto))}` : '';
    return `${timestamp} [${level}] ${message}${extra}`;
  })
);

const registro = createLogger({
  level: entorno.registro.nivel,
  transports: [
    new transports.File({
      filename: path.join(directorioLogs, 'error.log'),
      level: 'error',
      format: formatoArchivo,
      maxsize: 5242880,
      maxFiles: 5
    }),
    new transports.File({
      filename: path.join(directorioLogs, 'combinado.log'),
      format: formatoArchivo,
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

if (entorno.nodeEnv !== 'test') {
  registro.add(
    new transports.Console({
      format: formatoConsola
    })
  );
}

module.exports = registro;
