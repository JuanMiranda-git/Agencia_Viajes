'use strict';

/**
 * Enrutador principal de la API v1.
 * Prefijo montado en app.js: /api/v1
 */

const { Router } = require('express');

const { contextoDesarrollo } = require('../middleware/contextoDesarrollo');
const saludRoutes = require('./salud.routes');
const autenticacionRoutes = require('./autenticacion.routes');
const usuariosRoutes = require('./usuarios.routes');
const rolesRoutes = require('./roles.routes');
const modulosRoutes = require('./modulos.routes');
const clientesRoutes = require('./clientes.routes');
const proveedoresRoutes = require('./proveedores.routes');
const contratosRoutes = require('./contratos.routes');
const paquetesRoutes = require('./paquetes.routes');
const itinerariosRoutes = require('./itinerarios.routes');
const reservasRoutes = require('./reservas.routes');
const ventasRoutes = require('./ventas.routes');
const transporteRoutes = require('./transporte.routes');
const crmRoutes = require('./crm.routes');
const retroalimentacionRoutes = require('./retroalimentacion.routes');
const informesRoutes = require('./informes.routes');
const bitacoraRoutes = require('./bitacora.routes');
const otrosiesRoutes = require('./otrosies.routes');
const pagosRoutes = require('./pagos.routes');
const serviciosPaqueteRoutes = require('./serviciosPaquete.routes');
const serviciosProveedorRoutes = require('./serviciosProveedor.routes');
const tokensRecuperacionRoutes = require('./tokensRecuperacion.routes');

const enrutador = Router();

// Fase de desarrollo: sin JWT ni RBAC. El contexto ficticio mantiene la
// auditoria y evita que los controladores accedan a req.usuario indefinido.
// Para reactivar la seguridad, quite esta linea y restaure los guards en cada
// enrutador (ver middleware/autenticacion.js).
enrutador.use(contextoDesarrollo);

enrutador.use('/salud', saludRoutes);
enrutador.use('/autenticacion', autenticacionRoutes);
enrutador.use('/usuarios', usuariosRoutes);
enrutador.use('/roles', rolesRoutes);
enrutador.use('/modulos', modulosRoutes);
enrutador.use('/clientes', clientesRoutes);
enrutador.use('/proveedores', proveedoresRoutes);
enrutador.use('/contratos', contratosRoutes);
enrutador.use('/paquetes', paquetesRoutes);
enrutador.use('/itinerarios', itinerariosRoutes);
enrutador.use('/reservas', reservasRoutes);
enrutador.use('/ventas', ventasRoutes);
enrutador.use('/transporte', transporteRoutes);
enrutador.use('/crm', crmRoutes);
enrutador.use('/retroalimentacion', retroalimentacionRoutes);
enrutador.use('/informes', informesRoutes);
enrutador.use('/bitacora', bitacoraRoutes);
enrutador.use('/otrosies', otrosiesRoutes);
enrutador.use('/pagos', pagosRoutes);
enrutador.use('/servicios-paquete', serviciosPaqueteRoutes);
enrutador.use('/servicios-proveedor', serviciosProveedorRoutes);
enrutador.use('/tokens-recuperacion', tokensRecuperacionRoutes);

module.exports = enrutador;
