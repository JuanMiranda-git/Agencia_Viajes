'use strict';

/**
 * Servicio de contratos y otrosies (RF-CON-01..04, RN-02).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Contrato = require('../models/Contrato');
const Otrosi = require('../models/Otrosi');
const contratosRepositorio = require('../repositories/contratosRepositorio');
const proveedoresRepositorio = require('../repositories/proveedoresRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');
const { ejecutarTransaccion } = require('../config/baseDatos');

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
  const { filas, total } = await contratosRepositorio.listar({
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
  const fila = await contratosRepositorio.obtenerPorId(idContrato);
  if (!fila) {
    throw ErrorApi.noEncontrado('El contrato solicitado no existe');
  }
  const contrato = mapearContrato(fila);
  const otrosies = await contratosRepositorio.listarOtrosis(idContrato);
  return {
    ...contrato,
    nombreEmpresa: fila.nombre_empresa,
    vigente: new Contrato(fila).estaVigente(),
    otrosies
  };
}

async function crearContrato(datos, contexto) {
  const proveedor = await proveedoresRepositorio.obtenerPorId(datos.idProveedor);
  if (!proveedor) {
    throw ErrorApi.solicitudInvalida('El proveedor indicado no existe', [
      { campo: 'idProveedor', mensaje: 'Proveedor inexistente' }
    ]);
  }

  if (await contratosRepositorio.existeNumeroContrato(datos.numeroContrato)) {
    throw ErrorApi.conflicto('Ya existe un contrato con ese numero');
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

  const idContrato = await contratosRepositorio.crear(contrato.aJSON());

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'contratos',
    idRegistro: idContrato,
    accion: 'Creacion',
    descripcion: `Contrato ${contrato.numeroContrato} creado para ${proveedor.nombre_empresa}`
  });

  return { idContrato };
}

async function actualizarContrato(idContrato, datos, contexto) {
  const fila = await contratosRepositorio.obtenerPorId(idContrato);
  if (!fila) {
    throw ErrorApi.noEncontrado('El contrato solicitado no existe');
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

  await contratosRepositorio.actualizar(idContrato, camposActualizables);

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'contratos',
    idRegistro: idContrato,
    accion: 'Actualizacion',
    descripcion: `Contrato ${fila.numero_contrato} actualizado`
  });

  return { mensaje: 'Contrato actualizado correctamente' };
}

/**
 * RF-CON-03: registra un otrosi conservando el valor anterior y aplica los cambios.
 */
async function crearOtrosi(idContrato, datos, contexto) {
  const fila = await contratosRepositorio.obtenerPorId(idContrato);
  if (!fila) {
    throw ErrorApi.noEncontrado('El contrato solicitado no existe');
  }
  if (fila.estado_contrato === 'Cancelado') {
    throw ErrorApi.reglaNegocio('No se pueden registrar otrosies sobre un contrato cancelado');
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

  const idOtrosi = await ejecutarTransaccion(async (conexion) => {
    const id = await contratosRepositorio.crearOtrosi(otrosi.aJSON(), conexion);

    if (datos.valorNuevo !== undefined || datos.fechaInicioNueva || datos.fechaFinNueva) {
      await contratosRepositorio.actualizar(idContrato, {
        descripcion: fila.descripcion,
        fechaInicio: datos.fechaInicioNueva || fila.fecha_inicio,
        fechaFin: datos.fechaFinNueva || fila.fecha_fin,
        valor: datos.valorNuevo !== undefined ? datos.valorNuevo : fila.valor,
        estadoContrato: fila.estado_contrato
      });
    }

    await bitacoraRepositorio.registrar(
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
  const fila = await contratosRepositorio.obtenerPorId(idContrato);
  if (!fila) {
    throw ErrorApi.noEncontrado('El contrato solicitado no existe');
  }
  return contratosRepositorio.listarOtrosis(idContrato);
}

/**
 * RN-02: verifica que el proveedor tenga contrato vigente.
 * Usado por el registro de transporte.
 */
async function obtenerContratoVigente(idProveedor, nombreEmpresa = 'el proveedor') {
  const vigente = await contratosRepositorio.obtenerVigentePorProveedor(idProveedor);
  if (!vigente) {
    throw ErrorApi.reglaNegocio(
      `No se puede operar con ${nombreEmpresa}: no tiene un contrato vigente (RN-02)`,
      [{ campo: 'idProveedor', mensaje: 'Contrato vigente requerido' }]
    );
  }
  return mapearContrato(vigente);
}

module.exports = {
  listarContratos,
  obtenerContrato,
  crearContrato,
  actualizarContrato,
  crearOtrosi,
  listarOtrosis,
  obtenerContratoVigente
};
