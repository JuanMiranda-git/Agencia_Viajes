'use strict';

/**
 * Formato uniforme de respuestas exitosas.
 * { exito, datos, paginacion? }
 */

function responderExito(res, datos, estado = 200) {
  return res.status(estado).json({ exito: true, datos });
}

function responderCreado(res, datos, mensaje = 'Recurso creado correctamente') {
  return res.status(201).json({ exito: true, mensaje, datos });
}

function responderLista(res, datos, paginacion) {
  return res.status(200).json({ exito: true, datos, paginacion });
}

function responderMensaje(res, mensaje, estado = 200, datos = undefined) {
  const cuerpo = { exito: true, mensaje };
  if (datos !== undefined) cuerpo.datos = datos;
  return res.status(estado).json(cuerpo);
}

module.exports = { responderExito, responderCreado, responderLista, responderMensaje };
