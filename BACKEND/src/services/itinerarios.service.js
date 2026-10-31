'use strict';

/**
 * Servicio de itinerarios (RF-ITI-01..03).
 */

const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Itinerario = require('../models/Itinerario');
const paquetesService = require('./paquetes.service');
const bitacoraService = require('./bitacora.service');
const { pool } = require('../config/database');

function mapearItinerario(fila) {
  return new Itinerario({
    idItinerario: fila.id_itinerario,
    idPaquete: fila.id_paquete,
    titulo: fila.titulo,
    dia: fila.dia,
    horaInicio: fila.hora_inicio,
    horaFin: fila.hora_fin,
    actividad: fila.actividad,
    descripcion: fila.descripcion,
    estadoItinerario: fila.estado_itinerario,
    fechaCreacion: fila.fecha_creacion,
    fechaModificacion: fila.fecha_modificacion
  }).aJSON();
}

async function listarItinerarios(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    idPaquete: consulta.idPaquete,
    estado: consulta.estado,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({ ...mapearItinerario(fila), nombrePaquete: fila.nombre_paquete })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerItinerario(idItinerario) {
  const fila = await obtenerPorId(idItinerario);
  if (!fila) {
    throw AppError.noEncontrado('El itinerario solicitado no existe');
  }
  return mapearItinerario(fila);
}

async function crearItinerario(datos, contexto) {
  const paquete = await paquetesService.datos.obtenerPorId(datos.idPaquete);
  if (!paquete) {
    throw AppError.solicitudInvalida('El paquete indicado no existe', [
      { campo: 'idPaquete', mensaje: 'Paquete inexistente' }
    ]);
  }

  const itinerario = new Itinerario({
    idPaquete: datos.idPaquete,
    titulo: datos.titulo,
    dia: datos.dia,
    horaInicio: datos.horaInicio,
    horaFin: datos.horaFin,
    actividad: datos.actividad,
    descripcion: datos.descripcion,
    estadoItinerario: datos.estadoItinerario
  });

  const idItinerario = await crear(itinerario.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'itinerarios',
    idRegistro: idItinerario,
    accion: 'Creacion',
    descripcion: `Actividad ${itinerario.titulo} agregada al paquete ${paquete.nombre_paquete}`
  });

  return { idItinerario };
}

async function actualizarItinerario(idItinerario, datos, contexto) {
  const fila = await obtenerPorId(idItinerario);
  if (!fila) {
    throw AppError.noEncontrado('El itinerario solicitado no existe');
  }

  const itinerario = new Itinerario({
    idItinerario,
    idPaquete: fila.id_paquete,
    titulo: datos.titulo,
    dia: datos.dia,
    horaInicio: datos.horaInicio,
    horaFin: datos.horaFin,
    actividad: datos.actividad,
    descripcion: datos.descripcion,
    estadoItinerario: datos.estadoItinerario
  });

  const { idItinerario: id, idPaquete, ...campos } = itinerario.aJSON();
  void id;
  void idPaquete;

  await actualizar(idItinerario, campos);

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'itinerarios',
    idRegistro: idItinerario,
    accion: 'Actualizacion',
    descripcion: `Itinerario ${itinerario.titulo} actualizado`
  });

  return { mensaje: 'Itinerario actualizado correctamente' };
}

async function actualizarParcialItinerario(idItinerario, datos, contexto) {
  const fila = await obtenerPorId(idItinerario);
  if (!fila) {
    throw AppError.noEncontrado('El itinerario solicitado no existe');
  }

  const itinerario = new Itinerario({
    idItinerario,
    idPaquete: fila.id_paquete,
    titulo: datos.titulo !== undefined ? datos.titulo : fila.titulo,
    dia: datos.dia !== undefined ? datos.dia : fila.dia,
    horaInicio: datos.horaInicio !== undefined ? datos.horaInicio : fila.hora_inicio,
    horaFin: datos.horaFin !== undefined ? datos.horaFin : fila.hora_fin,
    actividad: datos.actividad !== undefined ? datos.actividad : fila.actividad,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : fila.descripcion,
    estadoItinerario: datos.estadoItinerario !== undefined ? datos.estadoItinerario : fila.estado_itinerario
  });

  const { idItinerario: id, idPaquete, ...campos } = itinerario.aJSON();
  void id;
  void idPaquete;

  await actualizar(idItinerario, campos);

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'itinerarios',
    idRegistro: idItinerario,
    accion: 'Actualizacion parcial',
    descripcion: `Itinerario ${itinerario.titulo} actualizado parcialmente`
  });

  return { mensaje: 'Itinerario actualizado correctamente' };
}

async function cambiarEstadoItinerario(idItinerario, estadoItinerario, contexto) {
  const fila = await obtenerPorId(idItinerario);
  if (!fila) {
    throw AppError.noEncontrado('El itinerario solicitado no existe');
  }

  await cambiarEstado(idItinerario, estadoItinerario);

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'itinerarios',
    idRegistro: idItinerario,
    accion: 'Cambio de estado',
    descripcion: `Itinerario ${fila.titulo} marcado como ${estadoItinerario}`
  });

  return { mensaje: `Itinerario marcado como ${estadoItinerario}` };
}

const CAMPOS_SELECT = `i.id_itinerario, i.id_paquete, p.nombre_paquete, i.titulo, i.dia, i.hora_inicio, i.hora_fin,
                       i.actividad, i.descripcion, i.estado_itinerario, i.fecha_creacion, i.fecha_modificacion`;

async function listar({ idPaquete, estado, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idPaquete) {
    condiciones.push('i.id_paquete = ?');
    parametros.push(idPaquete);
  }
  if (estado) {
    condiciones.push('i.estado_itinerario = ?');
    parametros.push(estado);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM itinerarios i
       INNER JOIN paquetes_turisticos p ON p.id_paquete = i.id_paquete
       ${donde}
       ORDER BY i.id_paquete ASC, i.dia ASC, i.id_itinerario ASC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM itinerarios i INNER JOIN paquetes_turisticos p ON p.id_paquete = i.id_paquete ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idItinerario) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM itinerarios i
       INNER JOIN paquetes_turisticos p ON p.id_paquete = i.id_paquete
      WHERE i.id_itinerario = ?`,
    [idItinerario]
  );
  return filas[0] || null;
}

async function crear({ idPaquete, titulo, dia, horaInicio, horaFin, actividad, descripcion, estadoItinerario }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO itinerarios (id_paquete, titulo, dia, hora_inicio, hora_fin, actividad, descripcion, estado_itinerario)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [idPaquete, titulo, dia, horaInicio, horaFin, actividad, descripcion, estadoItinerario]
  );
  return resultado.insertId;
}

async function actualizar(idItinerario, { titulo, dia, horaInicio, horaFin, actividad, descripcion, estadoItinerario }) {
  await pool.query(
    `UPDATE itinerarios
        SET titulo = ?, dia = ?, hora_inicio = ?, hora_fin = ?, actividad = ?, descripcion = ?, estado_itinerario = ?
      WHERE id_itinerario = ?`,
    [titulo, dia, horaInicio, horaFin, actividad, descripcion, estadoItinerario, idItinerario]
  );
}

async function cambiarEstado(idItinerario, estadoItinerario) {
  await pool.query('UPDATE itinerarios SET estado_itinerario = ? WHERE id_itinerario = ?', [estadoItinerario, idItinerario]);
}

module.exports = {
  listarItinerarios,
  obtenerItinerario,
  crearItinerario,
  actualizarItinerario,
  actualizarParcialItinerario,
  cambiarEstadoItinerario
};
