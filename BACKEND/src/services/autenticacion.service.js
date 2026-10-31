'use strict';

/**
 * Servicio de autenticacion (RF-ACC-01, RF-ACC-04, RF-ACC-05).
 * Inicio/cierre de sesion con JWT y recuperacion de contrasena con tokens.
 */

const crypto = require('crypto');
const AppError = require('../utils/AppError');
const { firmarToken } = require('../utils/jwt');
const { hashearClave, compararClave } = require('../utils/claves');
const Usuario = require('../models/Usuario');
const usuariosService = require('./usuarios.service');
const clientesService = require('./clientes.service');
const rolesService = require('./roles.service');
const bitacoraService = require('./bitacora.service');
const { pool, conTransaccion } = require('../config/database');

const VIGENCIA_TOKEN_HORAS = 1;

/**
 * Valida credenciales y emite un token JWT.
 */
async function iniciarSesion({ email, contrasena }) {
  const fila = await usuariosService.datos.obtenerPorEmail(email);
  if (!fila) {
    throw AppError.noAutenticado('Credenciales invalidas');
  }

  const usuario = new Usuario(fila);
  if (!usuario.estaActivo()) {
    throw AppError.prohibido('El usuario se encuentra inactivo; contacte al administrador');
  }

  const claveValida = await compararClave(contrasena, fila.contrasena);
  if (!claveValida) {
    throw AppError.noAutenticado('Credenciales invalidas');
  }

  const token = firmarToken(usuario);
  await bitacoraService.datos.registrar({
    idUsuario: usuario.idUsuario,
    tablaAfectada: 'usuarios',
    idRegistro: usuario.idUsuario,
    accion: 'Inicio de sesion',
    descripcion: `Inicio de sesion del usuario ${usuario.email}`
  });

  return { token, usuario: usuario.aJSON() };
}

/**
 * Cierre de sesion: JWT es sin estado, el cliente descarta el token.
 * Se registra en bitacora para auditoria.
 */
async function cerrarSesion(idUsuario) {
  await bitacoraService.datos.registrar({
    idUsuario,
    tablaAfectada: 'usuarios',
    idRegistro: idUsuario,
    accion: 'Cierre de sesion',
    descripcion: 'Cierre de sesion solicitado por el usuario'
  });
  return { mensaje: 'Sesion cerrada correctamente' };
}

/**
 * RF-ACC-04: genera un token de recuperacion de contrasena.
 * No existe servicio de correo en el contexto: en desarrollo el token se
 * retorna en la respuesta para permitir el flujo completo (documentado en README).
 */
async function solicitarRecuperacion({ email, baseUrlComprobante = null }) {
  const fila = await usuariosService.datos.obtenerPorEmail(email);

  // Respuesta generica para no revelar si el correo existe.
  if (!fila) {
    return { mensaje: 'Si el correo esta registrado, recibira las instrucciones de recuperacion' };
  }

  const usuario = new Usuario(fila);
  const token = crypto.randomBytes(32).toString('hex');
  const fechaExpiracion = new Date(Date.now() + VIGENCIA_TOKEN_HORAS * 60 * 60 * 1000);

  await conTransaccion(async (conexion) => {
    await invalidarPendientes(usuario.idUsuario, conexion);
    await crear({ idUsuario: usuario.idUsuario, token, fechaExpiracion }, conexion);
    await bitacoraService.datos.registrar(
      {
        idUsuario: usuario.idUsuario,
        tablaAfectada: 'tokens_recuperacion_clave',
        idRegistro: null,
        accion: 'Solicitud de recuperacion',
        descripcion: `Token de recuperacion generado para ${usuario.email}`
      },
      conexion
    );
  });

  return {
    mensaje: 'Si el correo esta registrado, recibira las instrucciones de recuperacion',
    token,
    fechaExpiracion,
    nota: 'Sin servicio de correo contratado, el token se retorna en esta respuesta (entorno de desarrollo)',
    enlaceSugerido: baseUrlComprobante ? `${baseUrlComprobante}?token=${token}` : undefined
  };
}

/**
 * RF-ACC-05: restablece la contrasena con un token vigente.
 */
async function restablecerClave({ token, nuevaContrasena }) {
  const registro = await obtenerValidoPorToken(token);
  if (!registro) {
    throw AppError.solicitudInvalida('El token de recuperacion no es valido o ya expiro');
  }

  const nuevaHash = await hashearClave(nuevaContrasena);

  await conTransaccion(async (conexion) => {
    await usuariosService.datos.actualizarContrasena(registro.id_usuario, nuevaHash);
    await marcarUsado(registro.id_token, conexion);
    await bitacoraService.datos.registrar(
      {
        idUsuario: registro.id_usuario,
        tablaAfectada: 'usuarios',
        idRegistro: registro.id_usuario,
        accion: 'Restablecimiento de clave',
        descripcion: 'Contrasena restablecida mediante token de recuperacion'
      },
      conexion
    );
  });

  return { mensaje: 'Contrasena restablecida correctamente' };
}

/**
 * Utilidad para el registro publico de clientes (RF-ACC-02):
 * crea el cliente y su usuario con rol Cliente en una sola transaccion.
 */
async function registrarCliente({ nombre, apellido, email, telefono, direccion, contrasena }) {
  const rolCliente = await rolesService.datos.obtenerPorNombre('Cliente');
  if (!rolCliente || rolCliente.estado_rol !== 'Activo') {
    throw AppError.reglaNegocio('El registro de clientes no esta habilitado en este momento');
  }

  const emailUsuario = await usuariosService.datos.existeEmail(email);
  if (emailUsuario) {
    throw AppError.conflicto('Ya existe un usuario registrado con ese correo electronico');
  }

  const emailCliente = await clientesService.datos.existeEmail(email);
  if (emailCliente) {
    throw AppError.conflicto('Ya existe un cliente registrado con ese correo electronico');
  }

  const hash = await hashearClave(contrasena);

  return conTransaccion(async (conexion) => {
    const idCliente = await clientesService.datos.crear(
      { nombre, apellido, email, telefono, direccion, categoriaCliente: 'Nuevo', consentimientoDatos: true },
      conexion
    );

    const idUsuario = await usuariosService.datos.crear(
      {
        nombreUsuario: `${nombre} ${apellido}`.trim(),
        email,
        contrasena: hash,
        documento: null,
        telefono,
        idRol: rolCliente.id_rol
      },
      conexion
    );

    await bitacoraService.datos.registrar(
      {
        idUsuario,
        tablaAfectada: 'usuarios',
        idRegistro: idUsuario,
        accion: 'Registro publico de cliente',
        descripcion: `Cliente ${email} registrado en el portal`
      },
      conexion
    );

    return { idCliente, idUsuario };
  });
}

async function invalidarPendientes(idUsuario, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('UPDATE tokens_recuperacion_clave SET usado = 1 WHERE id_usuario = ? AND usado = 0', [idUsuario]);
}

async function crear({ idUsuario, token, fechaExpiracion }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    'INSERT INTO tokens_recuperacion_clave (id_usuario, token, fecha_expiracion) VALUES (?, ?, ?)',
    [idUsuario, token, fechaExpiracion]
  );
  return resultado.insertId;
}

async function obtenerValidoPorToken(token) {
  const [filas] = await pool.query(
    `SELECT t.id_token, t.id_usuario, t.token, t.fecha_expiracion, t.usado, t.fecha_creacion,
            u.email AS usuario_email, u.estado_usuario
       FROM tokens_recuperacion_clave t
       INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
      WHERE t.token = ?
        AND t.usado = 0
        AND t.fecha_expiracion > NOW()`,
    [token]
  );
  return filas[0] || null;
}

async function marcarUsado(idToken, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('UPDATE tokens_recuperacion_clave SET usado = 1 WHERE id_token = ?', [idToken]);
}

module.exports = { iniciarSesion, cerrarSesion, solicitarRecuperacion, restablecerClave, registrarCliente };
