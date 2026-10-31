'use strict';

/**
 * Controlador de bitacora de auditoria (RNF-SEG-02).
 */

const capturarAsync = require('../utils/capturarAsync');
const { responderLista } = require('../utils/respuesta');
const bitacoraService = require('../services/bitacora.service');

const listar = capturarAsync(async (req, res) => {
  const { datos, paginacion } = await bitacoraService.listarBitacora(req.query);
  return responderLista(res, datos, paginacion);
});

module.exports = { listar };
