'use strict';

/**
 * Controlador de bitacora de auditoria (RNF-SEG-02).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderLista } = require('../utils/respuesta');
const bitacoraServicio = require('../services/bitacoraServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const { datos, paginacion } = await bitacoraServicio.listarBitacora(req.query);
  return responderLista(res, datos, paginacion);
});

module.exports = { listar };
