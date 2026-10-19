'use strict';

/**
 * Repositorio de contratos y otrosies (RF-CON-01..04).
 */

const { pool } = require('../config/baseDatos');

const CAMPOS_SELECT = `c.id_contrato, c.id_proveedor, p.nombre_empresa, c.numero_contrato, c.descripcion,
                       c.fecha_inicio, c.fecha_fin, c.valor, c.estado_contrato,
                       c.fecha_creacion, c.fecha_modificacion`;

async function listar({ idProveedor, estadoContrato, fechaDesde, fechaHasta, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idProveedor) {
    condiciones.push('c.id_proveedor = ?');
    parametros.push(idProveedor);
  }
  if (estadoContrato) {
    condiciones.push('c.estado_contrato = ?');
    parametros.push(estadoContrato);
  }
  if (fechaDesde) {
    condiciones.push('c.fecha_inicio >= ?');
    parametros.push(fechaDesde);
  }
  if (fechaHasta) {
    condiciones.push('c.fecha_fin <= ?');
    parametros.push(fechaHasta);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM contratos c
       INNER JOIN proveedores p ON p.id_proveedor = c.id_proveedor
       ${donde}
       ORDER BY c.id_contrato DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM contratos c INNER JOIN proveedores p ON p.id_proveedor = c.id_proveedor ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idContrato) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM contratos c
       INNER JOIN proveedores p ON p.id_proveedor = c.id_proveedor
      WHERE c.id_contrato = ?`,
    [idContrato]
  );
  return filas[0] || null;
}

async function existeNumeroContrato(numeroContrato, exceptoId = null) {
  const parametros = [numeroContrato];
  let condicionExtra = '';
  if (exceptoId) {
    condicionExtra = 'AND id_contrato <> ?';
    parametros.push(exceptoId);
  }
  const [filas] = await pool.query(`SELECT 1 AS existe FROM contratos WHERE numero_contrato = ? ${condicionExtra}`, parametros);
  return filas.length > 0;
}

async function crear({ idProveedor, numeroContrato, descripcion, fechaInicio, fechaFin, valor, estadoContrato }) {
  const [resultado] = await pool.query(
    `INSERT INTO contratos (id_proveedor, numero_contrato, descripcion, fecha_inicio, fecha_fin, valor, estado_contrato)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [idProveedor, numeroContrato, descripcion, fechaInicio, fechaFin, valor, estadoContrato]
  );
  return resultado.insertId;
}

async function actualizar(idContrato, { descripcion, fechaInicio, fechaFin, valor, estadoContrato }) {
  await pool.query(
    `UPDATE contratos SET descripcion = ?, fecha_inicio = ?, fecha_fin = ?, valor = ?, estado_contrato = ? WHERE id_contrato = ?`,
    [descripcion, fechaInicio, fechaFin, valor, estadoContrato, idContrato]
  );
}

async function listarOtrosis(idContrato) {
  const [filas] = await pool.query(
    `SELECT id_otrosi, id_contrato, numero_otrosi, descripcion, valor_anterior, valor_nuevo,
            fecha_inicio_nueva, fecha_fin_nueva, fecha_creacion
       FROM contratos_otrosi
      WHERE id_contrato = ?
      ORDER BY id_otrosi ASC`,
    [idContrato]
  );
  return filas;
}

async function crearOtrosi({ idContrato, numeroOtrosi, descripcion, valorAnterior, valorNuevo, fechaInicioNueva, fechaFinNueva }) {
  const [resultado] = await pool.query(
    `INSERT INTO contratos_otrosi (id_contrato, numero_otrosi, descripcion, valor_anterior, valor_nuevo, fecha_inicio_nueva, fecha_fin_nueva)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [idContrato, numeroOtrosi, descripcion, valorAnterior, valorNuevo, fechaInicioNueva, fechaFinNueva]
  );
  return resultado.insertId;
}

/**
 * RN-02: contrato vigente de un proveedor (estado Vigente y fecha actual dentro del rango).
 */
async function obtenerVigentePorProveedor(idProveedor) {
  const [filas] = await pool.query(
    `SELECT id_contrato, id_proveedor, numero_contrato, fecha_inicio, fecha_fin, valor, estado_contrato
       FROM contratos
      WHERE id_proveedor = ?
        AND estado_contrato = 'Vigente'
        AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
      ORDER BY fecha_fin DESC
      LIMIT 1`,
    [idProveedor]
  );
  return filas[0] || null;
}

module.exports = {
  listar,
  obtenerPorId,
  existeNumeroContrato,
  crear,
  actualizar,
  listarOtrosis,
  crearOtrosi,
  obtenerVigentePorProveedor
};
