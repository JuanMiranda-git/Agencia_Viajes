'use strict';

/**
 * Servicio de CRM: interacciones e historial del cliente (RF-CRM-01..03).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const InteraccionCrm = require('../models/InteraccionCrm');
const crmRepositorio = require('../repositories/crmRepositorio');
const clientesRepositorio = require('../repositories/clientesRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');
const clientesServicio = require('./clientesServicio');

function mapearInteraccion(fila) {
  return new InteraccionCrm({
    idInteraccion: fila.id_interaccion,
    idCliente: fila.id_cliente,
    tipoInteraccion: fila.tipo_interaccion,
    fechaInteraccion: fila.fecha_interaccion,
    descripcion: fila.descripcion,
    resultado: fila.resultado
  }).aJSON();
}

async function registrarInteraccion(datos, contexto) {
  const cliente = await clientesRepositorio.obtenerPorId(datos.idCliente);
  if (!cliente) {
    throw ErrorApi.solicitudInvalida('El cliente indicado no existe', [
      { campo: 'idCliente', mensaje: 'Cliente inexistente' }
    ]);
  }

  const interaccion = new InteraccionCrm({
    idCliente: datos.idCliente,
    tipoInteraccion: datos.tipoInteraccion,
    descripcion: datos.descripcion,
    resultado: datos.resultado
  });

  const idInteraccion = await crmRepositorio.crear(interaccion.aJSON());

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'crm',
    idRegistro: idInteraccion,
    accion: 'Creacion',
    descripcion: `Interaccion ${interaccion.tipoInteraccion} registrada para el cliente ${datos.idCliente}`
  });

  return { idInteraccion };
}

async function listarInteracciones(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await crmRepositorio.listar({
    idCliente: consulta.idCliente,
    tipoInteraccion: consulta.tipoInteraccion,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({ ...mapearInteraccion(fila), nombreCliente: fila.nombre_cliente })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerHistorialCliente(idCliente) {
  return clientesServicio.obtenerHistorial(idCliente);
}

module.exports = { registrarInteraccion, listarInteracciones, obtenerHistorialCliente };
