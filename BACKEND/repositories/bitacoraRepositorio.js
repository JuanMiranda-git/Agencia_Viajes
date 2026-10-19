'use strict';

/**
 * Repositorio de bitacora de auditoria (RNF-SEG-02).
 */

const { pool } = require('../config/baseDatos');

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

module.exports = { registrar, listar };
