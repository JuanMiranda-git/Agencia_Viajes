'use strict';

/**
 * Servicio de CRM: interacciones e historial del cliente (RF-CRM-01..03).
 */

const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const InteraccionCrm = require('../models/InteraccionCrm');
const bitacoraService = require('./bitacora.service');
const clientesService = require('./clientes.service');
const { pool } = require('../config/database');

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
  const cliente = await clientesService.datos.obtenerPorId(datos.idCliente);
  if (!cliente) {
    throw AppError.solicitudInvalida('El cliente indicado no existe', [
      { campo: 'idCliente', mensaje: 'Cliente inexistente' }
    ]);
  }

  const interaccion = new InteraccionCrm({
    idCliente: datos.idCliente,
    tipoInteraccion: datos.tipoInteraccion,
    descripcion: datos.descripcion,
    resultado: datos.resultado
  });

  const idInteraccion = await crear(interaccion.aJSON());

  await bitacoraService.datos.registrar({
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
  const { filas, total } = await listar({
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

async function obtenerInteraccion(idInteraccion) {
  const fila = await obtenerPorId(idInteraccion);
  if (!fila) {
    throw AppError.noEncontrado('La interaccion solicitada no existe');
  }
  return mapearInteraccion(fila);
}

async function actualizarInteraccion(idInteraccion, datos, contexto) {
  const fila = await obtenerPorId(idInteraccion);
  if (!fila) {
    throw AppError.noEncontrado('La interaccion solicitada no existe');
  }

  const cliente = await clientesService.datos.obtenerPorId(datos.idCliente);
  if (!cliente) {
    throw AppError.solicitudInvalida('El cliente indicado no existe', [
      { campo: 'idCliente', mensaje: 'Cliente inexistente' }
    ]);
  }

  const interaccion = new InteraccionCrm({
    idInteraccion,
    idCliente: datos.idCliente,
    tipoInteraccion: datos.tipoInteraccion,
    descripcion: datos.descripcion,
    resultado: datos.resultado
  });

  await actualizar(idInteraccion, interaccion.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'crm',
    idRegistro: idInteraccion,
    accion: 'Actualizacion',
    descripcion: `Interaccion ${interaccion.tipoInteraccion} actualizada`
  });

  return { mensaje: 'Interaccion actualizada correctamente' };
}

async function actualizarParcialInteraccion(idInteraccion, datos, contexto) {
  const fila = await obtenerPorId(idInteraccion);
  if (!fila) {
    throw AppError.noEncontrado('La interaccion solicitada no existe');
  }

  const idCliente = datos.idCliente !== undefined ? datos.idCliente : fila.id_cliente;
  if (datos.idCliente !== undefined) {
    const cliente = await clientesService.datos.obtenerPorId(idCliente);
    if (!cliente) {
      throw AppError.solicitudInvalida('El cliente indicado no existe', [
        { campo: 'idCliente', mensaje: 'Cliente inexistente' }
      ]);
    }
  }

  const interaccion = new InteraccionCrm({
    idInteraccion,
    idCliente,
    tipoInteraccion: datos.tipoInteraccion !== undefined ? datos.tipoInteraccion : fila.tipo_interaccion,
    descripcion: datos.descripcion !== undefined ? datos.descripcion : fila.descripcion,
    resultado: datos.resultado !== undefined ? datos.resultado : fila.resultado
  });

  await actualizar(idInteraccion, interaccion.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'crm',
    idRegistro: idInteraccion,
    accion: 'Actualizacion parcial',
    descripcion: `Interaccion ${interaccion.tipoInteraccion} actualizada parcialmente`
  });

  return { mensaje: 'Interaccion actualizada correctamente' };
}

async function obtenerHistorialCliente(idCliente) {
  return clientesService.obtenerHistorial(idCliente);
}

async function crear({ idCliente, tipoInteraccion, descripcion, resultado }, conexion = null) {
  const ejecutor = conexion || pool;
  const [res] = await ejecutor.query(
    'INSERT INTO crm (id_cliente, tipo_interaccion, descripcion, resultado) VALUES (?, ?, ?, ?)',
    [idCliente, tipoInteraccion, descripcion, resultado]
  );
  return res.insertId;
}

async function actualizar(idInteraccion, { idCliente, tipoInteraccion, descripcion, resultado }) {
  await pool.query(
    'UPDATE crm SET id_cliente = ?, tipo_interaccion = ?, descripcion = ?, resultado = ? WHERE id_interaccion = ?',
    [idCliente, tipoInteraccion, descripcion, resultado, idInteraccion]
  );
}

async function listar({ idCliente, tipoInteraccion, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idCliente) {
    condiciones.push('crm.id_cliente = ?');
    parametros.push(idCliente);
  }
  if (tipoInteraccion) {
    condiciones.push('crm.tipo_interaccion = ?');
    parametros.push(tipoInteraccion);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT crm.id_interaccion, crm.id_cliente, CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
            crm.tipo_interaccion, crm.fecha_interaccion, crm.descripcion, crm.resultado
       FROM crm
       INNER JOIN clientes c ON c.id_cliente = crm.id_cliente
       ${donde}
       ORDER BY crm.fecha_interaccion DESC, crm.id_interaccion DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total FROM crm INNER JOIN clientes c ON c.id_cliente = crm.id_cliente ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idInteraccion) {
  const [filas] = await pool.query('SELECT * FROM crm WHERE id_interaccion = ?', [idInteraccion]);
  return filas[0] || null;
}

async function reservasDeCliente(idCliente) {
  const [filas] = await pool.query(
    `SELECT r.id_reserva, r.numero_reserva, r.fecha_reserva, r.fecha_viaje, r.num_pasajeros,
            r.estado_reserva, r.total, p.nombre_paquete
       FROM reservas r
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
      WHERE r.id_cliente = ?
      ORDER BY r.fecha_reserva DESC`,
    [idCliente]
  );
  return filas;
}

module.exports = {
  registrarInteraccion,
  listarInteracciones,
  obtenerInteraccion,
  actualizarInteraccion,
  actualizarParcialInteraccion,
  obtenerHistorialCliente,
  datos: { listar, reservasDeCliente, obtenerPorId }
};
