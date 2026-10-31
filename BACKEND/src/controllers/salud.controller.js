'use strict';

const capturarAsync = require('../utils/capturarAsync');
const { probarConexion } = require('../config/database');
const entorno = require('../config/entorno');

const verificar = capturarAsync(async (req, res) => {
  let bd = 'ok';
  try { await probarConexion(); } catch (error) { bd = 'error'; }
  const saludable = bd === 'ok';
  return res.status(saludable ? 200 : 503).json({
    ok: saludable,
    mensaje: saludable ? 'Servicio disponible' : 'Servicio no disponible',
    datos: { servicio: 'tourmanager-backend', entorno: entorno.nodeEnv, baseDatos: bd, fecha: new Date().toISOString() }
  });
});

module.exports = { verificar };
