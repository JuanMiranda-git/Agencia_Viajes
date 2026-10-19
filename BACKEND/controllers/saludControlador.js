'use strict';

/**
 * Controlador de salud del servicio (C8: health check).
 */

const manejadorAsincrono = require('../utils/manejadorAsincrono');
const { probarConexion } = require('../config/baseDatos');
const entorno = require('../config/entorno');

const verificar = manejadorAsincrono(async (req, res) => {
  let bd = 'ok';
  try {
    await probarConexion();
  } catch (error) {
    bd = 'error';
  }

  const saludable = bd === 'ok';
  return res.status(saludable ? 200 : 503).json({
    exito: saludable,
    datos: {
      servicio: 'tourmanager-backend',
      entorno: entorno.nodeEnv,
      baseDatos: bd,
      fecha: new Date().toISOString()
    }
  });
});

module.exports = { verificar };
