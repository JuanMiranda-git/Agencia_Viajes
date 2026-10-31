'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const entorno = require('./entorno');
const rutas = require('../routes');
const { limitadorGlobal, limitadorAutenticacion } = require('../middleware/limitadores');
const saneamiento = require('../middleware/saneamiento');
const registroPeticiones = require('../middleware/registroPeticiones');
const { rutaNoEncontrada, manejarErrores } = require('../middleware/errorHandler');

function crearApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin: entorno.cors.origenes,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'Content-Disposition']
  }));
  app.use(limitadorGlobal);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(saneamiento);
  app.use(registroPeticiones);
  app.use('/api/v1/autenticacion', limitadorAutenticacion);
  app.use('/api/v1', rutas);
  app.get('/', (req, res) => {
    res.json({ ok: true, mensaje: 'TourManager API v1', datos: {
      servicio: 'TourManager API', version: 'v1',
      documentacion: 'Ver carpeta postman/ y docs/ del proyecto', salud: '/api/v1/salud'
    }});
  });
  app.use(rutaNoEncontrada);
  app.use(manejarErrores);
  return app;
}

module.exports = { crearApp };
