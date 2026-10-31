'use strict';

/**
 * Registro estructurado de peticiones HTTP.
 * Adjunta un identificador unico (req.id) y registra metodo, ruta, estado y duracion.
 * No registra cuerpos ni cabeceras sensibles.
 */

const crypto = require('crypto');
const registro = require('../config/registro');

function registroPeticiones(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  const inicio = process.hrtime.bigint();

  res.on('finish', () => {
    const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6;
    const nivel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    registro.log(nivel, `${req.method} ${req.originalUrl} -> ${res.statusCode}`, {
      requestId: req.id,
      metodo: req.method,
      ruta: req.originalUrl,
      estado: res.statusCode,
      duracionMs: Number(duracionMs.toFixed(2)),
      ip: req.ip
    });
  });

  next();
}

module.exports = registroPeticiones;
