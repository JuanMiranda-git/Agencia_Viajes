'use strict';

function responderExito(res, datos, estado = 200, meta = undefined) {
  const cuerpo = { ok: true, mensaje: 'Operacion exitosa', datos };
  if (meta !== undefined) cuerpo.meta = meta;
  return res.status(estado).json(cuerpo);
}

function responderCreado(res, datos, mensaje = 'Recurso creado correctamente') {
  return res.status(201).json({ ok: true, mensaje, datos });
}

function responderLista(res, datos, paginacion, mensaje = 'Listado obtenido correctamente') {
  const cuerpo = { ok: true, mensaje, datos };
  if (paginacion !== undefined) cuerpo.meta = { paginacion };
  return res.status(200).json(cuerpo);
}

function responderMensaje(res, mensaje, estado = 200, datos = undefined, meta = undefined) {
  const cuerpo = { ok: true, mensaje };
  if (datos !== undefined) cuerpo.datos = datos;
  if (meta !== undefined) cuerpo.meta = meta;
  return res.status(estado).json(cuerpo);
}

module.exports = { responderExito, responderCreado, responderLista, responderMensaje };
