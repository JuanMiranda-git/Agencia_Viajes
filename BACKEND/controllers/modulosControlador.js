'use strict';

/**
 * Controlador de modulos del sistema (RF-ROL-05, RF-ROL-07).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { responderExito } = require('../utils/respuesta');
const modulosServicio = require('../services/modulosServicio');

const listar = manejadorAsincrono(async (req, res) => {
  const modulos = await modulosServicio.listarModulos({ soloActivos: req.query.soloActivos });
  return responderExito(res, modulos);
});

module.exports = { listar };
