'use strict';

/**
 * Servicio de contratos y otrosies (RF-CON-01..04, RN-02).
 */

const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Contrato = require('../models/Contrato');
const Otrosi = require('../models/Otrosi');
const proveedoresService = require('./proveedores.service');
const bitacoraService = require('./bitacora.service');
const { pool, conTransaccion } = require('../config/database');

function mapearContrato(fila) {
  return new Contrato({
    idContrato: fila.id_contrato,
    idProveedor: fila.id_proveedor,
    numeroContrato: fila.numero_contrato,
    descripcion: fila.descripcion,
    fechaInicio: fila.fecha_inicio,
    fechaFin: fila.fecha_fin,
    valor: fila.valor,
    estadoContrato: fila.estado_contrato,
    fechaCreacion: fila.fecha_creacion,
    fechaModificacion: fila.fecha_modificacion
  }).aJSON();
}

async function listarContratos(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    idProveedor: consulta.idProveedor,
    estadoContrato: consulta.estadoContrato,
    fechaDesde: consulta.fechaDesde,
    fechaHasta: consulta.fechaHasta,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({ ...mapearContrato(fila), nombreEmpresa: fila.nombre_empresa })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerContrato(idContrato) {
  const fila = await obtenerPorId(idContrato);
  if (!fila) {
    throw AppError.noEncontrado('El contrato solicitado no existe');
  }
  const contrato = mapearContrato(fila);
  const otrosies = await listarOtrosis(idContrato);
  return {
    ...contrato,
    nombreEmpresa: fila.nombre_empresa,
    vigente: new Contrato(fila).estaVigente(),
    otrosies
  };
}

async function crearContrato(datos, contexto) {
  const proveedor = await proveedoresService.datos.obtenerPorId(datos.idProveedor);
  if (!proveedor) {
    throw AppError.solicitudInvalida('El proveedor indicado no existe', [
      { campo: 'idProveedor', mensaje: 'Proveedor inexistente' }
    ]);
  }

  if (await existeNumeroContrato(datos.numeroContrato)) {
    throw AppError.conflicto('Ya existe un contrato con ese numero');
  }

  const contrato = new Contrato({
    idProveedor: datos.idProveedor,
    numeroContrato: datos.numeroContrato,
    descripcion: datos.descripcion,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    valor: datos.valor,
    estadoContrato: datos.estadoContrato
  });

  const idContrato = await crear(contrato.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'contratos',
    idRegistro: idContrato,
    accion: 'Creacion',
    descripcion: `Contrato ${contrato.numeroContrato} creado para ${proveedor.nombre_empresa}`
  });

  return { idContrato };
}

async function actualizarContrato(idContrato, datos, contexto) {
  const fila = await obtenerPorId(idContrato);
  if (!fila) {
    throw AppError.noEncontrado('El contrato solicitado no existe');
  }

  const contrato = new Contrato({
    idContrato,
    idProveedor: fila.id_proveedor,
    numeroContrato: fila.numero_contrato,
    descripcion: datos.descripcion,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    valor: datos.valor,
    estadoContrato: datos.estadoContrato
  });

  const { idProveedor, numeroContrato, ...camposActualizables } = contrato.aJSON();
  void idProveedor;
  void numeroContrato;

  await actualizar(idContrato, camposActualizables);

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'contratos',
    idRegistro: idContrato,
    accion: 'Actualizacion',
    descripcion: `Contrato ${fila.numero_contrato} actualizado`
  });

  return { mensaje: 'Contrato actualizado correctamente' };
}

/**
 * Actualizacion parcial (PATCH) de un contrato: conserva los campos omitidos.
 */
async function actualizarParcialContrato(idContrato, datos, contexto) {
  const fila = await obtenerPorId(idContrato);
  if (!fila) {
    throw AppError.noEncontrado('El contrato solicitado no existe');
  }

  const contrato = new Contrato({
    idContrato,
    idProveedor: fila.id_proveedor,
    numeroContrato: fila.numero_contrato,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : fila.descripcion,
    fechaInicio: datos.fechaInicio !== undefined ? datos.fechaInicio : fila.fecha_inicio,
    fechaFin: datos.fechaFin !== undefined ? datos.fechaFin : fila.fecha_fin,
    valor: datos.valor !== undefined ? datos.valor : fila.valor,
    estadoContrato: datos.estadoContrato !== undefined ? datos.estadoContrato : fila.estado_contrato
  });

  const { idProveedor, numeroContrato, ...camposActualizables } = contrato.aJSON();
  void idProveedor;
  void numeroContrato;

  await actualizar(idContrato, camposActualizables);

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'contratos',
    idRegistro: idContrato,
    accion: 'Actualizacion parcial',
    descripcion: `Contrato ${fila.numero_contrato} actualizado parcialmente`
  });

  return { mensaje: 'Contrato actualizado correctamente' };
}

/**
 * RF-CON-03: registra un otrosi conservando el valor anterior y aplica los cambios.
 */
async function crearOtrosi(idContrato, datos, contexto) {
  const fila = await obtenerPorId(idContrato);
  if (!fila) {
    throw AppError.noEncontrado('El contrato solicitado no existe');
  }
  if (fila.estado_contrato === 'Cancelado') {
    throw AppError.reglaNegocio('No se pueden registrar otrosies sobre un contrato cancelado');
  }

  const otrosi = new Otrosi({
    idContrato,
    numeroOtrosi: datos.numeroOtrosi,
    descripcion: datos.descripcion,
    valorAnterior: fila.valor,
    valorNuevo: datos.valorNuevo !== undefined ? datos.valorNuevo : fila.valor,
    fechaInicioNueva: datos.fechaInicioNueva,
    fechaFinNueva: datos.fechaFinNueva
  });

  const idOtrosi = await conTransaccion(async (conexion) => {
    const id = await crearOtrosiSql(otrosi.aJSON(), conexion);

    if (datos.valorNuevo !== undefined || datos.fechaInicioNueva || datos.fechaFinNueva) {
      await actualizar(idContrato, {
        descripcion: fila.descripcion,
        fechaInicio: datos.fechaInicioNueva || fila.fecha_inicio,
        fechaFin: datos.fechaFinNueva || fila.fecha_fin,
        valor: datos.valorNuevo !== undefined ? datos.valorNuevo : fila.valor,
        estadoContrato: fila.estado_contrato
      });
    }

    await bitacoraService.datos.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'contratos_otrosi',
        idRegistro: id,
        accion: 'Creacion',
        descripcion: `Otrosi ${datos.numeroOtrosi} registrado sobre el contrato ${fila.numero_contrato}`
      },
      conexion
    );

    return id;
  });

  return { idOtrosi };
}

async function listarOtrosis(idContrato) {
  const fila = await obtenerPorId(idContrato);
  if (!fila) {
    throw AppError.noEncontrado('El contrato solicitado no existe');
  }
  return listarOtrosisSql(idContrato);
}

/**
 * RN-02: verifica que el proveedor tenga contrato vigente.
 * Usado por el registro de transporte.
 */
async function obtenerContratoVigente(idProveedor, nombreEmpresa = 'el proveedor') {
  const vigente = await obtenerVigentePorProveedor(idProveedor);
  if (!vigente) {
    throw AppError.reglaNegocio(
      `No se puede operar con ${nombreEmpresa}: no tiene un contrato vigente (RN-02)`,
      [{ campo: 'idProveedor', mensaje: 'Contrato vigente requerido' }]
    );
  }
  return mapearContrato(vigente);
}

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

async function listarOtrosisSql(idContrato) {
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

async function crearOtrosiSql({ idContrato, numeroOtrosi, descripcion, valorAnterior, valorNuevo, fechaInicioNueva, fechaFinNueva }) {
  const [resultado] = await pool.query(
    `INSERT INTO contratos_otrosi (id_contrato, numero_otrosi, descripcion, valor_anterior, valor_nuevo, fecha_inicio_nueva, fecha_fin_nueva)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [idContrato, numeroOtrosi, descripcion, valorAnterior, valorNuevo, fechaInicioNueva, fechaFinNueva]
  );
  return resultado.insertId;
}

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
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  actualizarParcialContrato,
  crearOtrosi,
  listarOtrosis,
  obtenerContratoVigente
};
