'use strict';

/**
 * Servicio de autenticacion (RF-ACC-01, RF-ACC-04, RF-ACC-05).
 * Inicio/cierre de sesion con JWT y recuperacion de contrasena con tokens.
 */

const crypto = require('crypto');
const ErrorApi = require('../utils/ErrorApi');
const { firmarToken } = require('../utils/jwt');
const { hashearClave, compararClave } = require('../utils/claves');
const Usuario = require('../models/Usuario');
const usuariosRepositorio = require('../repositories/usuariosRepositorio');
const clientesRepositorio = require('../repositories/clientesRepositorio');
const rolesRepositorio = require('../repositories/rolesRepositorio');
const tokensRepositorio = require('../repositories/tokensRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');
const { ejecutarTransaccion } = require('../config/baseDatos');

const VIGENCIA_TOKEN_HORAS = 1;

/**
 * Valida credenciales y emite un token JWT.
 */
async function iniciarSesion({ email, contrasena }) {
  const fila = await usuariosRepositorio.obtenerPorEmail(email);
  if (!fila) {
    throw ErrorApi.noAutenticado('Credenciales invalidas');
  }

  const usuario = new Usuario(fila);
  if (!usuario.estaActivo()) {
    throw ErrorApi.prohibido('El usuario se encuentra inactivo; contacte al administrador');
  }

  const claveValida = await compararClave(contrasena, fila.contrasena);
  if (!claveValida) {
    throw ErrorApi.noAutenticado('Credenciales invalidas');
  }

  const token = firmarToken(usuario);
  await bitacoraRepositorio.registrar({
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
  await bitacoraRepositorio.registrar({
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
  const fila = await usuariosRepositorio.obtenerPorEmail(email);

  // Respuesta generica para no revelar si el correo existe.
  if (!fila) {
    return { mensaje: 'Si el correo esta registrado, recibira las instrucciones de recuperacion' };
  }

  const usuario = new Usuario(fila);
  const token = crypto.randomBytes(32).toString('hex');
  const fechaExpiracion = new Date(Date.now() + VIGENCIA_TOKEN_HORAS * 60 * 60 * 1000);

  await ejecutarTransaccion(async (conexion) => {
    await tokensRepositorio.invalidarPendientes(usuario.idUsuario, conexion);
    await tokensRepositorio.crear({ idUsuario: usuario.idUsuario, token, fechaExpiracion }, conexion);
    await bitacoraRepositorio.registrar(
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
  const registro = await tokensRepositorio.obtenerValidoPorToken(token);
  if (!registro) {
    throw ErrorApi.solicitudInvalida('El token de recuperacion no es valido o ya expiro');
  }

  const nuevaHash = await hashearClave(nuevaContrasena);

  await ejecutarTransaccion(async (conexion) => {
    await usuariosRepositorio.actualizarContrasena(registro.id_usuario, nuevaHash);
    await tokensRepositorio.marcarUsado(registro.id_token, conexion);
    await bitacoraRepositorio.registrar(
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
  const rolCliente = await rolesRepositorio.obtenerPorNombre('Cliente');
  if (!rolCliente || rolCliente.estado_rol !== 'Activo') {
    throw ErrorApi.reglaNegocio('El registro de clientes no esta habilitado en este momento');
  }

  const emailUsuario = await usuariosRepositorio.existeEmail(email);
  if (emailUsuario) {
    throw ErrorApi.conflicto('Ya existe un usuario registrado con ese correo electronico');
  }

  const emailCliente = await clientesRepositorio.existeEmail(email);
  if (emailCliente) {
    throw ErrorApi.conflicto('Ya existe un cliente registrado con ese correo electronico');
  }

  const hash = await hashearClave(contrasena);

  return ejecutarTransaccion(async (conexion) => {
    const idCliente = await clientesRepositorio.crear(
      { nombre, apellido, email, telefono, direccion, categoriaCliente: 'Nuevo', consentimientoDatos: true },
      conexion
    );

    const idUsuario = await usuariosRepositorio.crear(
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

    await bitacoraRepositorio.registrar(
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

module.exports = { iniciarSesion, cerrarSesion, solicitarRecuperacion, restablecerClave, registrarCliente };
