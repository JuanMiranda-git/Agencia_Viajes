'use strict';

/**
 * Servicio del catalogo de servicios de paquete (RF-PAQ-02, RF-PAQ-04).
 */

const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const ServicioPaquete = require('../models/ServicioPaquete');
const paquetesService = require('./paquetes.service');
const bitacoraService = require('./bitacora.service');
const { pool } = require('../config/database');

function mapearServicio(fila) {
  return new ServicioPaquete({
    idServicio: fila.id_servicio,
    tipoServicio: fila.tipo_servicio,
    descripcion: fila.descripcion,
    precio: fila.precio
  }).aJSON();
}

async function listarServiciosPaquete(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    tipoServicio: consulta.tipoServicio,
    idPaquete: consulta.idPaquete,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map(mapearServicio),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerServicioPaquete(idServicio) {
  const fila = await obtenerPorId(idServicio);
  if (!fila) {
    throw AppError.noEncontrado('El servicio de paquete solicitado no existe');
  }
  const paquetes = await listarPaquetesAsociados(idServicio);
  return {
    ...mapearServicio(fila),
    paquetes: paquetes.map((p) => ({ idPaquete: p.id_paquete, nombrePaquete: p.nombre_paquete }))
  };
}

async function crearServicioPaquete(datos, contexto) {
  const { idServicio } = await paquetesService.agregarServicioAPaquete(datos.idPaquete, datos, contexto);
  return obtenerServicioPaquete(idServicio);
}

async function actualizarServicioPaquete(idServicio, datos, contexto) {
  const fila = await obtenerPorId(idServicio);
  if (!fila) {
    throw AppError.noEncontrado('El servicio de paquete solicitado no existe');
  }

  const servicio = new ServicioPaquete({
    idServicio,
    tipoServicio: datos.tipoServicio !== undefined ? datos.tipoServicio : fila.tipo_servicio,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : fila.descripcion,
    precio: datos.precio !== undefined ? datos.precio : fila.precio
  });

  await actualizar(idServicio, servicio.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'servicios_paquete',
    idRegistro: idServicio,
    accion: 'Actualizacion',
    descripcion: `Servicio de paquete ${idServicio} actualizado`
  });

  return obtenerServicioPaquete(idServicio);
}

async function actualizarParcialServicioPaquete(idServicio, datos, contexto) {
  return actualizarServicioPaquete(idServicio, datos, contexto);
}

async function listar({ tipoServicio, idPaquete, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (tipoServicio) {
    condiciones.push('s.tipo_servicio = ?');
    parametros.push(tipoServicio);
  }
  if (idPaquete) {
    condiciones.push(
      'EXISTS (SELECT 1 FROM PAQUETE_SERVICIO ps WHERE ps.servicios_paquete_id_servicio = s.id_servicio AND ps.paquetes_turisticos_id_paquete = ?)'
    );
    parametros.push(idPaquete);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT s.id_servicio, s.tipo_servicio, s.descripcion, s.precio
       FROM servicios_paquete s
       ${donde}
       ORDER BY s.id_servicio ASC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM servicios_paquete s ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idServicio) {
  const [filas] = await pool.query(
    'SELECT id_servicio, tipo_servicio, descripcion, precio FROM servicios_paquete WHERE id_servicio = ?',
    [idServicio]
  );
  return filas[0] || null;
}

async function listarPaquetesAsociados(idServicio) {
  const [filas] = await pool.query(
    `SELECT p.id_paquete, p.nombre_paquete
       FROM PAQUETE_SERVICIO ps
       INNER JOIN paquetes_turisticos p ON p.id_paquete = ps.paquetes_turisticos_id_paquete
      WHERE ps.servicios_paquete_id_servicio = ?
      ORDER BY p.id_paquete ASC`,
    [idServicio]
  );
  return filas;
}

async function actualizar(idServicio, { tipoServicio, descripcion, precio }) {
  await pool.query('UPDATE servicios_paquete SET tipo_servicio = ?, descripcion = ?, precio = ? WHERE id_servicio = ?', [
    tipoServicio,
    descripcion,
    precio,
    idServicio
  ]);
}

module.exports = {
  listarServiciosPaquete,
  obtenerServicioPaquete,
  crearServicioPaquete,
  actualizarServicioPaquete,
  actualizarParcialServicioPaquete
};
