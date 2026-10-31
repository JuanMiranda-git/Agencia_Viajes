'use strict';

/**
 * Servicio de otrosies contractuales (RF-CON-03).
 * El otrosi conserva el valor anterior del contrato y registra los cambios.
 */

const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Otrosi = require('../models/Otrosi');
const contratosService = require('./contratos.service');
const bitacoraService = require('./bitacora.service');
const { pool } = require('../config/database');

function mapearOtrosi(fila) {
  return new Otrosi({
    idOtrosi: fila.id_otrosi,
    idContrato: fila.id_contrato,
    numeroOtrosi: fila.numero_otrosi,
    descripcion: fila.descripcion,
    valorAnterior: fila.valor_anterior,
    valorNuevo: fila.valor_nuevo,
    fechaInicioNueva: fila.fecha_inicio_nueva,
    fechaFinNueva: fila.fecha_fin_nueva,
    fechaCreacion: fila.fecha_creacion
  }).aJSON();
}

async function listarOtrosis(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    idContrato: consulta.idContrato,
    numeroOtrosi: consulta.numeroOtrosi,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      ...mapearOtrosi(fila),
      numeroContrato: fila.numero_contrato,
      nombreProveedor: fila.nombre_empresa
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerOtrosi(idOtrosi) {
  const fila = await obtenerPorId(idOtrosi);
  if (!fila) {
    throw AppError.noEncontrado('El otrosi solicitado no existe');
  }
  return {
    ...mapearOtrosi(fila),
    numeroContrato: fila.numero_contrato,
    nombreProveedor: fila.nombre_empresa
  };
}

async function crearOtrosi(datos, contexto) {
  const { idOtrosi } = await contratosService.crearOtrosi(datos.idContrato, datos, contexto);
  return obtenerOtrosi(idOtrosi);
}

async function actualizarOtrosi(idOtrosi, datos, contexto) {
  const fila = await obtenerPorId(idOtrosi);
  if (!fila) {
    throw AppError.noEncontrado('El otrosi solicitado no existe');
  }

  const otrosi = new Otrosi({
    idOtrosi,
    idContrato: fila.id_contrato,
    numeroOtrosi: datos.numeroOtrosi !== undefined ? datos.numeroOtrosi : fila.numero_otrosi,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : fila.descripcion,
    valorAnterior: fila.valor_anterior,
    valorNuevo: datos.valorNuevo !== undefined ? datos.valorNuevo : fila.valor_nuevo,
    fechaInicioNueva: datos.fechaInicioNueva !== undefined ? datos.fechaInicioNueva : fila.fecha_inicio_nueva,
    fechaFinNueva: datos.fechaFinNueva !== undefined ? datos.fechaFinNueva : fila.fecha_fin_nueva
  });

  const { idOtrosi: id, idContrato, valorAnterior, fechaCreacion, ...campos } = otrosi.aJSON();
  void id;
  void idContrato;
  void valorAnterior;
  void fechaCreacion;

  await actualizar(idOtrosi, campos);

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'contratos_otrosi',
    idRegistro: idOtrosi,
    accion: 'Actualizacion',
    descripcion: `Otrosi ${otrosi.numeroOtrosi} actualizado`
  });

  return obtenerOtrosi(idOtrosi);
}

async function actualizarParcialOtrosi(idOtrosi, datos, contexto) {
  return actualizarOtrosi(idOtrosi, datos, contexto);
}

async function listar({ idContrato, numeroOtrosi, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idContrato) {
    condiciones.push('o.id_contrato = ?');
    parametros.push(idContrato);
  }
  if (numeroOtrosi) {
    condiciones.push('o.numero_otrosi LIKE ?');
    parametros.push(`%${numeroOtrosi}%`);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT o.id_otrosi, o.id_contrato, o.numero_otrosi, o.descripcion, o.valor_anterior, o.valor_nuevo,
            o.fecha_inicio_nueva, o.fecha_fin_nueva, o.fecha_creacion,
            c.numero_contrato, pr.nombre_empresa
       FROM contratos_otrosi o
       INNER JOIN contratos c ON c.id_contrato = o.id_contrato
       INNER JOIN proveedores pr ON pr.id_proveedor = c.id_proveedor
       ${donde}
       ORDER BY o.id_otrosi DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM contratos_otrosi o
       INNER JOIN contratos c ON c.id_contrato = o.id_contrato
       INNER JOIN proveedores pr ON pr.id_proveedor = c.id_proveedor
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idOtrosi) {
  const [filas] = await pool.query(
    `SELECT o.id_otrosi, o.id_contrato, o.numero_otrosi, o.descripcion, o.valor_anterior, o.valor_nuevo,
            o.fecha_inicio_nueva, o.fecha_fin_nueva, o.fecha_creacion,
            c.numero_contrato, pr.nombre_empresa
       FROM contratos_otrosi o
       INNER JOIN contratos c ON c.id_contrato = o.id_contrato
       INNER JOIN proveedores pr ON pr.id_proveedor = c.id_proveedor
      WHERE o.id_otrosi = ?`,
    [idOtrosi]
  );
  return filas[0] || null;
}

async function actualizar(idOtrosi, { numeroOtrosi, descripcion, valorNuevo, fechaInicioNueva, fechaFinNueva }) {
  await pool.query(
    `UPDATE contratos_otrosi
        SET numero_otrosi = ?, descripcion = ?, valor_nuevo = ?, fecha_inicio_nueva = ?, fecha_fin_nueva = ?
      WHERE id_otrosi = ?`,
    [numeroOtrosi, descripcion, valorNuevo, fechaInicioNueva, fechaFinNueva, idOtrosi]
  );
}

module.exports = {
  listarOtrosis,
  obtenerOtrosi,
  crearOtrosi,
  actualizarOtrosi,
  actualizarParcialOtrosi
};
