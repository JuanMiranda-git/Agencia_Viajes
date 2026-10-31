'use strict';

/**
 * Servicio de tokens de recuperacion de contrasena (RF-ACC-04, RF-ACC-05).
 * El token nunca se expone en consultas; solo al momento de generarlo.
 */

const crypto = require('crypto');
const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const TokenRecuperacion = require('../models/TokenRecuperacion');
const usuariosService = require('./usuarios.service');
const bitacoraService = require('./bitacora.service');
const { pool } = require('../config/database');

function mapearToken(fila) {
  return new TokenRecuperacion({
    idToken: fila.id_token,
    idUsuario: fila.id_usuario,
    token: fila.token,
    fechaExpiracion: fila.fecha_expiracion,
    usado: fila.usado,
    fechaCreacion: fila.fecha_creacion
  }).aJSON();
}

function generarToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function listarTokensRecuperacion(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    idUsuario: consulta.idUsuario,
    usado: consulta.usado,
    soloVigentes: consulta.soloVigentes,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      ...mapearToken(fila),
      nombreUsuario: fila.nombre_usuario,
      email: fila.email
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerTokenRecuperacion(idToken) {
  const fila = await obtenerPorId(idToken);
  if (!fila) {
    throw AppError.noEncontrado('El token de recuperacion solicitado no existe');
  }
  return {
    ...mapearToken(fila),
    nombreUsuario: fila.nombre_usuario,
    email: fila.email
  };
}

async function crearTokenRecuperacion(datos, contexto) {
  const usuario = await usuariosService.datos.obtenerPorId(datos.idUsuario);
  if (!usuario) {
    throw AppError.solicitudInvalida('El usuario indicado no existe', [
      { campo: 'idUsuario', mensaje: 'Usuario inexistente' }
    ]);
  }

  const fechaExpiracion = new Date(datos.fechaExpiracion);
  if (Number.isNaN(fechaExpiracion.getTime()) || fechaExpiracion.getTime() <= Date.now()) {
    throw AppError.solicitudInvalida('La fecha de expiracion debe ser posterior a la fecha actual', [
      { campo: 'fechaExpiracion', mensaje: 'Fecha de expiracion invalida' }
    ]);
  }

  const token = generarToken();
  const idToken = await crear({ idUsuario: datos.idUsuario, token, fechaExpiracion: datos.fechaExpiracion });

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'tokens_recuperacion_clave',
    idRegistro: idToken,
    accion: 'Creacion',
    descripcion: `Token de recuperacion generado para el usuario ${datos.idUsuario}`
  });

  return { idToken, token, fechaExpiracion: datos.fechaExpiracion };
}

async function actualizarTokenRecuperacion(idToken, datos, contexto) {
  const fila = await obtenerPorId(idToken);
  if (!fila) {
    throw AppError.noEncontrado('El token de recuperacion solicitado no existe');
  }

  const fechaExpiracion = datos.fechaExpiracion !== undefined ? datos.fechaExpiracion : fila.fecha_expiracion;
  const usado = datos.usado !== undefined ? Boolean(datos.usado) : Boolean(fila.usado);

  await actualizar(idToken, { fechaExpiracion, usado });

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'tokens_recuperacion_clave',
    idRegistro: idToken,
    accion: 'Actualizacion',
    descripcion: `Token de recuperacion ${idToken} actualizado`
  });

  return obtenerTokenRecuperacion(idToken);
}

async function actualizarParcialTokenRecuperacion(idToken, datos, contexto) {
  return actualizarTokenRecuperacion(idToken, datos, contexto);
}

async function listar({ idUsuario, usado, soloVigentes, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idUsuario) {
    condiciones.push('t.id_usuario = ?');
    parametros.push(idUsuario);
  }
  if (usado !== undefined && usado !== null && usado !== '') {
    condiciones.push('t.usado = ?');
    parametros.push(usado === true || usado === 'true' || usado === '1' ? 1 : 0);
  }
  if (soloVigentes === true || soloVigentes === 'true' || soloVigentes === '1') {
    condiciones.push('t.usado = 0 AND t.fecha_expiracion > NOW()');
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT t.id_token, t.id_usuario, u.nombre_usuario, u.email, t.token, t.fecha_expiracion,
            t.usado, t.fecha_creacion
       FROM tokens_recuperacion_clave t
       INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
       ${donde}
       ORDER BY t.id_token DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM tokens_recuperacion_clave t
       INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idToken) {
  const [filas] = await pool.query(
    `SELECT t.id_token, t.id_usuario, u.nombre_usuario, u.email, t.token, t.fecha_expiracion,
            t.usado, t.fecha_creacion
       FROM tokens_recuperacion_clave t
       INNER JOIN usuarios u ON u.id_usuario = t.id_usuario
      WHERE t.id_token = ?`,
    [idToken]
  );
  return filas[0] || null;
}

async function crear({ idUsuario, token, fechaExpiracion }) {
  const [resultado] = await pool.query(
    'INSERT INTO tokens_recuperacion_clave (id_usuario, token, fecha_expiracion) VALUES (?, ?, ?)',
    [idUsuario, token, fechaExpiracion]
  );
  return resultado.insertId;
}

async function actualizar(idToken, { fechaExpiracion, usado }) {
  await pool.query('UPDATE tokens_recuperacion_clave SET fecha_expiracion = ?, usado = ? WHERE id_token = ?', [
    fechaExpiracion,
    usado ? 1 : 0,
    idToken
  ]);
}

module.exports = {
  listarTokensRecuperacion,
  obtenerTokenRecuperacion,
  crearTokenRecuperacion,
  actualizarTokenRecuperacion,
  actualizarParcialTokenRecuperacion
};
