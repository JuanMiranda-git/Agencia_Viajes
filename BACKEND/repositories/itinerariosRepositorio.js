'use strict';

/**
 * Repositorio de itinerarios (RF-ITI-01..03).
 * Cada fila es una actividad programada (dia, horario) de un paquete.
 */

const { pool } = require('../config/baseDatos');

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

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarEstado };
