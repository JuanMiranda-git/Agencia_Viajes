'use strict';

/**
 * Saneamiento basico de entradas:
 * - Recorta espacios en cadenas del body.
 * - Elimina bytes nulos.
 * El tipado estricto y el rechazo de campos desconocidos lo hacen los esquemas Joi.
 */

function sanearValor(valor) {
  if (typeof valor === 'string') {
    return valor.replace(/\u0000/g, '').trim();
  }
  if (Array.isArray(valor)) {
    return valor.map(sanearValor);
  }
  if (valor !== null && typeof valor === 'object') {
    const resultado = {};
    for (const [llave, contenido] of Object.entries(valor)) {
      resultado[llave] = sanearValor(contenido);
    }
    return resultado;
  }
  return valor;
}

function saneamiento(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanearValor(req.body);
  }
  next();
}

module.exports = saneamiento;
