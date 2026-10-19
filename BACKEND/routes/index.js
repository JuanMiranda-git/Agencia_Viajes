'use strict';

/**
 * Enrutador principal de la API v1.
 * Prefijo montado en app.js: /api/v1
 */

const { Router } = require('express');

const saludRutas = require('./saludRutas');
const autenticacionRutas = require('./autenticacionRutas');
const usuariosRutas = require('./usuariosRutas');
const rolesRutas = require('./rolesRutas');
const modulosRutas = require('./modulosRutas');
const clientesRutas = require('./clientesRutas');
const proveedoresRutas = require('./proveedoresRutas');
const contratosRutas = require('./contratosRutas');
const paquetesRutas = require('./paquetesRutas');
const itinerariosRutas = require('./itinerariosRutas');
const reservasRutas = require('./reservasRutas');
const ventasRutas = require('./ventasRutas');
const transporteRutas = require('./transporteRutas');
const crmRutas = require('./crmRutas');
const retroalimentacionRutas = require('./retroalimentacionRutas');
const informesRutas = require('./informesRutas');
const bitacoraRutas = require('./bitacoraRutas');

const enrutador = Router();

enrutador.use('/salud', saludRutas);
enrutador.use('/autenticacion', autenticacionRutas);
enrutador.use('/usuarios', usuariosRutas);
enrutador.use('/roles', rolesRutas);
enrutador.use('/modulos', modulosRutas);
enrutador.use('/clientes', clientesRutas);
enrutador.use('/proveedores', proveedoresRutas);
enrutador.use('/contratos', contratosRutas);
enrutador.use('/paquetes', paquetesRutas);
enrutador.use('/itinerarios', itinerariosRutas);
enrutador.use('/reservas', reservasRutas);
enrutador.use('/ventas', ventasRutas);
enrutador.use('/transporte', transporteRutas);
enrutador.use('/crm', crmRutas);
enrutador.use('/retroalimentacion', retroalimentacionRutas);
enrutador.use('/informes', informesRutas);
enrutador.use('/bitacora', bitacoraRutas);

module.exports = enrutador;
