'use strict';

/**
 * Punto de entrada del backend TourManager.
 * La aplicacion Express y el apagado controlado viven en app.js.
 */

const { app, servidor } = require('./app');

module.exports = { app, servidor };
