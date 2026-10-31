'use strict';

/**
 * Servicio de modulos del sistema (RF-ROL-05, RF-ROL-07).
 * Los modulos son datos maestros; se administran con CRUD completo.
 */

const AppError = require('../utils/AppError');
const Modulo = require('../models/Modulo');
const bitacoraService = require('./bitacora.service');
const { pool } = require('../config/database');

function mapearModulo(fila) {
  return new Modulo({
    idModulo: fila.id_modulo,
    nombreModulo: fila.nombre_modulo,
    descripcion: fila.descripcion,
    estadoModulo: fila.estado_modulo
  }).aJSON();
}

async function listarModulos({ soloActivos = false } = {}) {
  const filas = await listar({ soloActivos: soloActivos === true || soloActivos === 'true' });
  return filas.map(mapearModulo);
}

async function obtenerModulo(idModulo) {
  const fila = await obtenerPorId(idModulo);
  if (!fila) {
    throw AppError.noEncontrado('El modulo solicitado no existe');
  }
  return mapearModulo(fila);
}

async function crearModulo(datos, contexto) {
  if (await existeNombre(datos.nombreModulo)) {
    throw AppError.conflicto('Ya existe un modulo con ese nombre');
  }

  const modulo = new Modulo({
    nombreModulo: datos.nombreModulo,
    descripcion: datos.descripcion,
    estadoModulo: datos.estadoModulo
  });

  const idModulo = await crear(modulo.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'modulos',
    idRegistro: idModulo,
    accion: 'Creacion',
    descripcion: `Modulo ${modulo.nombreModulo} creado`
  });

  return { idModulo };
}

async function actualizarModulo(idModulo, datos, contexto) {
  const fila = await obtenerPorId(idModulo);
  if (!fila) {
    throw AppError.noEncontrado('El modulo solicitado no existe');
  }

  if (await existeNombre(datos.nombreModulo, idModulo)) {
    throw AppError.conflicto('Ya existe un modulo con ese nombre');
  }

  const modulo = new Modulo({
    idModulo,
    nombreModulo: datos.nombreModulo,
    descripcion: datos.descripcion,
    estadoModulo: datos.estadoModulo
  });

  const { idModulo: id, ...campos } = modulo.aJSON();
  void id;
  await actualizar(idModulo, campos);

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'modulos',
    idRegistro: idModulo,
    accion: 'Actualizacion',
    descripcion: `Modulo ${modulo.nombreModulo} actualizado`
  });

  return { mensaje: 'Modulo actualizado correctamente' };
}

async function actualizarParcialModulo(idModulo, datos, contexto) {
  const fila = await obtenerPorId(idModulo);
  if (!fila) {
    throw AppError.noEncontrado('El modulo solicitado no existe');
  }

  const nombreModulo = datos.nombreModulo !== undefined ? datos.nombreModulo : fila.nombre_modulo;
  if (await existeNombre(nombreModulo, idModulo)) {
    throw AppError.conflicto('Ya existe un modulo con ese nombre');
  }

  const modulo = new Modulo({
    idModulo,
    nombreModulo,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : fila.descripcion,
    estadoModulo: datos.estadoModulo !== undefined ? datos.estadoModulo : fila.estado_modulo
  });

  const { idModulo: id, ...campos } = modulo.aJSON();
  void id;
  await actualizar(idModulo, campos);

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'modulos',
    idRegistro: idModulo,
    accion: 'Actualizacion parcial',
    descripcion: `Modulo ${modulo.nombreModulo} actualizado parcialmente`
  });

  return { mensaje: 'Modulo actualizado correctamente' };
}

async function listar({ soloActivos = false } = {}) {
  const donde = soloActivos ? "WHERE estado_modulo = 'Activo'" : '';
  const [filas] = await pool.query(
    `SELECT id_modulo, nombre_modulo, descripcion, estado_modulo FROM modulos ${donde} ORDER BY id_modulo ASC`
  );
  return filas;
}

async function obtenerPorId(idModulo) {
  const [filas] = await pool.query(
    'SELECT id_modulo, nombre_modulo, descripcion, estado_modulo FROM modulos WHERE id_modulo = ?',
    [idModulo]
  );
  return filas[0] || null;
}

async function existeNombre(nombreModulo, exceptoId = null) {
  const parametros = [nombreModulo];
  let condicionExtra = '';
  if (exceptoId) {
    condicionExtra = 'AND id_modulo <> ?';
    parametros.push(exceptoId);
  }
  const [filas] = await pool.query(`SELECT 1 AS existe FROM modulos WHERE nombre_modulo = ? ${condicionExtra}`, parametros);
  return filas.length > 0;
}

async function crear({ nombreModulo, descripcion, estadoModulo }) {
  const [resultado] = await pool.query(
    'INSERT INTO modulos (nombre_modulo, descripcion, estado_modulo) VALUES (?, ?, ?)',
    [nombreModulo, descripcion, estadoModulo]
  );
  return resultado.insertId;
}

async function actualizar(idModulo, { nombreModulo, descripcion, estadoModulo }) {
  await pool.query('UPDATE modulos SET nombre_modulo = ?, descripcion = ?, estado_modulo = ? WHERE id_modulo = ?', [
    nombreModulo,
    descripcion,
    estadoModulo,
    idModulo
  ]);
}

module.exports = {
  listarModulos,
  obtenerModulo,
  crearModulo,
  actualizarModulo,
  actualizarParcialModulo,
  datos: { obtenerPorId, listar }
};
