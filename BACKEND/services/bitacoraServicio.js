'use strict';

/**
 * Servicio de consulta de bitacora de auditoria (RNF-SEG-02).
 */

const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const { pool } = require('../config/baseDatos');

async function listarBitacora(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    idUsuario: consulta.idUsuario,
    tablaAfectada: consulta.tablaAfectada,
    accion: consulta.accion,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      idBitacora: fila.id_bitacora,
      idUsuario: fila.id_usuario,
      nombreUsuario: fila.nombre_usuario,
      tablaAfectada: fila.tabla_afectada,
      idRegistro: fila.id_registro,
      accion: fila.accion,
      descripcion: fila.descripcion,
      fechaHora: fila.fecha_hora
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function registrar({ idUsuario, tablaAfectada, idRegistro, accion, descripcion }, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query(
    `INSERT INTO bitacora (id_usuario, tabla_afectada, id_registro, accion, descripcion)
     VALUES (?, ?, ?, ?, ?)`,
    [idUsuario, tablaAfectada, idRegistro, accion, descripcion]
  );
}

async function listar({ idUsuario, tablaAfectada, accion, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idUsuario) {
    condiciones.push('b.id_usuario = ?');
    parametros.push(idUsuario);
  }
  if (tablaAfectada) {
    condiciones.push('b.tabla_afectada = ?');
    parametros.push(tablaAfectada);
  }
  if (accion) {
    condiciones.push('b.accion = ?');
    parametros.push(accion);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT b.id_bitacora, b.id_usuario, u.nombre_usuario, b.tabla_afectada, b.id_registro,
            b.accion, b.descripcion, b.fecha_hora
       FROM bitacora b
       LEFT JOIN usuarios u ON u.id_usuario = b.id_usuario
       ${donde}
       ORDER BY b.fecha_hora DESC, b.id_bitacora DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM bitacora b LEFT JOIN usuarios u ON u.id_usuario = b.id_usuario ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

module.exports = { listarBitacora, datos: { registrar } };
