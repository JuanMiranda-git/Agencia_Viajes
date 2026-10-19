'use strict';

/**
 * Aplicacion Express de TourManager (API REST v1).
 * Capas: rutas -> controladores -> servicios -> repositorios -> MySQL.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const entorno = require('./config/entorno');
const registro = require('./config/registro');
const { cerrarPool } = require('./config/baseDatos');
const rutas = require('./routes');
const { limitadorGlobal, limitadorAutenticacion } = require('./middleware/limitadores');
const saneamiento = require('./middleware/saneamiento');
const registroPeticiones = require('./middleware/registroPeticiones');
const { rutaNoEncontrada, manejadorErrores } = require('./middleware/manejadorErrores');

const app = express();

app.disable('x-powered-by');

// Seguridad (C8): cabeceras HTTP, CORS restringido, limitacion de tasa.
app.use(helmet());
app.use(
  cors({
    origin: entorno.cors.origenes,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'Content-Disposition']
  })
);
app.use(limitadorGlobal);

// Parsers y saneamiento.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(saneamiento);

// Observabilidad (C8): identificador de peticion y log estructurado.
app.use(registroPeticiones);

// API v1.
app.use('/api/v1/autenticacion', limitadorAutenticacion);
app.use('/api/v1', rutas);

// Raiz informativa.
app.get('/', (req, res) => {
  res.json({
    exito: true,
    datos: {
      servicio: 'TourManager API',
      version: 'v1',
      documentacion: 'Ver carpeta postman/ y docs/ del proyecto',
      salud: '/api/v1/salud'
    }
  });
});

// 404 y manejador central de errores (siempre al final).
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

const servidor = app.listen(entorno.puerto, () => {
  registro.info(`TourManager API escuchando en http://localhost:${entorno.puerto} (entorno: ${entorno.nodeEnv})`);
});

/**
 * Apagado controlado (C8): deja de aceptar peticiones, cierra el pool y sale.
 */
function apagar(senal) {
  registro.info(`Senal ${senal} recibida: iniciando apagado controlado`);
  servidor.close(async () => {
    try {
      await cerrarPool();
      registro.info('Pool de conexiones cerrado. Adios.');
      process.exit(0);
    } catch (error) {
      registro.error(`Error durante el apagado: ${error.message}`);
      process.exit(1);
    }
  });

  // Salida forzada si el cierre no termina a tiempo.
  setTimeout(() => {
    registro.error('Apagado forzado tras 10 segundos sin cerrar conexiones');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => apagar('SIGINT'));
process.on('SIGTERM', () => apagar('SIGTERM'));

process.on('unhandledRejection', (motivo) => {
  registro.error(`Promesa rechazada sin manejar: ${motivo}`);
});

process.on('uncaughtException', (error) => {
  registro.error(`Excepcion no capturada: ${error.message}`, { pila: error.stack });
  process.exit(1);
});

module.exports = { app, servidor };
