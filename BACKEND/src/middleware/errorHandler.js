'use strict';

const AppError = require('../utils/AppError');
const registro = require('../config/registro');

function rutaNoEncontrada(req, res, next) {
  next(new AppError(404, `La ruta ${req.method} ${req.originalUrl} no existe`, 'RUTA_NO_ENCONTRADA'));
}

// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, next) {
  if (error instanceof AppError && error.esOperacional) {
    if (error.estado >= 500) {
      registro.error(`Error operativo [${error.codigo}]: ${error.message}`, { metodo: req.method, ruta: req.originalUrl, requestId: req.id });
    } else {
      registro.warn(`Solicitud rechazada [${error.codigo}]: ${error.message}`, { metodo: req.method, ruta: req.originalUrl, requestId: req.id });
    }
    const cuerpo = { ok: false, codigo: error.codigo, mensaje: error.message };
    if (error.detalles) cuerpo.detalles = error.detalles;
    return res.status(error.estado).json(cuerpo);
  }
  if (error && error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ ok: false, codigo: 'DUPLICADO', mensaje: 'El registro ya existe (valor unico duplicado)' });
  }
  if (error && ['ER_ACCESS_DENIED_ERROR', 'ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_NO_SUCH_TABLE'].includes(error.code)) {
    registro.error(`Error de base de datos: ${error.message}`);
    return res.status(503).json({ ok: false, codigo: 'BD_NO_DISPONIBLE', mensaje: 'La base de datos no esta disponible en este momento' });
  }
  registro.error(`Error no controlado: ${error.message}`, { metodo: req.method, ruta: req.originalUrl, requestId: req.id, pila: error.stack });
  return res.status(500).json({ ok: false, codigo: 'ERROR_INTERNO', mensaje: 'Ocurrio un error interno. Contacte al administrador.' });
}

module.exports = { rutaNoEncontrada, manejarErrores, errorHandler: manejarErrores };
