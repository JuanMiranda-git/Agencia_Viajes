'use strict';

/**
 * Manejo centralizado de errores.
 * - Ruta no encontrada (404).
 * - Errores operativos (ErrorApi) se traducen al formato uniforme.
 * - Errores inesperados se registran completos en logs; al cliente solo un mensaje generico.
 * (No se exponen trazas al cliente.)
 */

const ErrorApi = require('../utils/ErrorApi');
const registro = require('../config/registro');

function rutaNoEncontrada(req, res, next) {
  next(new ErrorApi(404, `La ruta ${req.method} ${req.originalUrl} no existe`, 'RUTA_NO_ENCONTRADA'));
}

// eslint-disable-next-line no-unused-vars
function manejadorErrores(error, req, res, next) {
  if (error instanceof ErrorApi && error.esOperacional) {
    if (error.estado >= 500) {
      registro.error(`Error operativo [${error.codigo}]: ${error.message}`, {
        metodo: req.method,
        ruta: req.originalUrl,
        requestId: req.id
      });
    } else {
      registro.warn(`Solicitud rechazada [${error.codigo}]: ${error.message}`, {
        metodo: req.method,
        ruta: req.originalUrl,
        requestId: req.id
      });
    }

    const cuerpo = {
      exito: false,
      error: {
        codigo: error.codigo,
        mensaje: error.message
      }
    };
    if (error.detalles) cuerpo.error.detalles = error.detalles;
    return res.status(error.estado).json(cuerpo);
  }

  // Errores de MySQL conocidos
  if (error && error.code === 'ER_DUP_ENTRY') {
    registro.warn('Intento de duplicado en base de datos', {
      metodo: req.method,
      ruta: req.originalUrl,
      requestId: req.id,
      detalle: error.sqlMessage
    });
    return res.status(409).json({
      exito: false,
      error: {
        codigo: 'DUPLICADO',
        mensaje: 'El registro ya existe (valor unico duplicado)'
      }
    });
  }

  if (error && ['ER_ACCESS_DENIED_ERROR', 'ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_NO_SUCH_TABLE'].includes(error.code)) {
    registro.error(`Error de base de datos: ${error.message}`, {
      metodo: req.method,
      ruta: req.originalUrl,
      requestId: req.id
    });
    return res.status(503).json({
      exito: false,
      error: {
        codigo: 'BD_NO_DISPONIBLE',
        mensaje: 'La base de datos no esta disponible en este momento'
      }
    });
  }

  registro.error(`Error no controlado: ${error.message}`, {
    metodo: req.method,
    ruta: req.originalUrl,
    requestId: req.id,
    pila: error.stack
  });

  return res.status(500).json({
    exito: false,
    error: {
      codigo: 'ERROR_INTERNO',
      mensaje: 'Ocurrio un error interno. Contacte al administrador.'
    }
  });
}

module.exports = { rutaNoEncontrada, manejadorErrores };
