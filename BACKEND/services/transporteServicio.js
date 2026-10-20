'use strict';

/**
 * Servicio de transporte (RF-TRA-01..02, RN-02).
 * Solo se registra transporte de proveedores con contrato vigente.
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Transporte = require('../models/Transporte');
const proveedoresServicio = require('./proveedoresServicio');
const paquetesServicio = require('./paquetesServicio');
const contratosServicio = require('./contratosServicio');
const bitacoraServicio = require('./bitacoraServicio');
const { pool } = require('../config/baseDatos');

function mapearTransporte(fila) {
  return new Transporte({
    idTransporte: fila.id_transporte,
    tipoTransporte: fila.tipo_transporte,
    idProveedor: fila.id_proveedor,
    idPaquete: fila.id_paquete,
    descripcion: fila.descripcion,
    capacidad: fila.capacidad,
    precio: fila.precio,
    fechaSalida: fila.fecha_salida,
    fechaLlegada: fila.fecha_llegada,
    estadoTransporte: fila.estado_transporte,
    fechaCreacion: fila.fecha_creacion
  }).aJSON();
}

async function listarTransportes(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    tipoTransporte: consulta.tipoTransporte,
    estado: consulta.estado,
    idPaquete: consulta.idPaquete,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      ...mapearTransporte(fila),
      nombreEmpresa: fila.nombre_empresa,
      nombrePaquete: fila.nombre_paquete
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerTransporte(idTransporte) {
  const fila = await obtenerPorId(idTransporte);
  if (!fila) {
    throw ErrorApi.noEncontrado('El transporte solicitado no existe');
  }
  return {
    ...mapearTransporte(fila),
    nombreEmpresa: fila.nombre_empresa,
    nombrePaquete: fila.nombre_paquete
  };
}

async function crearTransporte(datos, contexto) {
  const proveedor = await proveedoresServicio.datos.obtenerPorId(datos.idProveedor);
  if (!proveedor) {
    throw ErrorApi.solicitudInvalida('El proveedor indicado no existe', [
      { campo: 'idProveedor', mensaje: 'Proveedor inexistente' }
    ]);
  }

  // RN-02: contrato vigente obligatorio para operar con el proveedor.
  await contratosServicio.obtenerContratoVigente(datos.idProveedor, proveedor.nombre_empresa);

  if (datos.idPaquete) {
    const paquete = await paquetesServicio.datos.obtenerPorId(datos.idPaquete);
    if (!paquete) {
      throw ErrorApi.solicitudInvalida('El paquete indicado no existe', [
        { campo: 'idPaquete', mensaje: 'Paquete inexistente' }
      ]);
    }
  }

  const transporte = new Transporte({
    tipoTransporte: datos.tipoTransporte,
    idProveedor: datos.idProveedor,
    idPaquete: datos.idPaquete,
    descripcion: datos.descripcion,
    capacidad: datos.capacidad,
    precio: datos.precio,
    fechaSalida: datos.fechaSalida,
    fechaLlegada: datos.fechaLlegada,
    estadoTransporte: datos.estadoTransporte
  });

  const idTransporte = await crear(transporte.aJSON());

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'transporte',
    idRegistro: idTransporte,
    accion: 'Creacion',
    descripcion: `Transporte ${transporte.tipoTransporte} registrado con ${proveedor.nombre_empresa}`
  });

  return { idTransporte };
}

async function actualizarTransporte(idTransporte, datos, contexto) {
  const fila = await obtenerPorId(idTransporte);
  if (!fila) {
    throw ErrorApi.noEncontrado('El transporte solicitado no existe');
  }

  const transporte = new Transporte({
    idTransporte,
    tipoTransporte: datos.tipoTransporte,
    idProveedor: fila.id_proveedor,
    idPaquete: datos.idPaquete !== undefined ? datos.idPaquete : fila.id_paquete,
    descripcion: datos.descripcion,
    capacidad: datos.capacidad,
    precio: datos.precio,
    fechaSalida: datos.fechaSalida,
    fechaLlegada: datos.fechaLlegada,
    estadoTransporte: datos.estadoTransporte
  });

  const { idTransporte: id, ...campos } = transporte.aJSON();
  void id;

  await actualizar(idTransporte, campos);

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'transporte',
    idRegistro: idTransporte,
    accion: 'Actualizacion',
    descripcion: `Transporte ${idTransporte} actualizado`
  });

  return { mensaje: 'Transporte actualizado correctamente' };
}

async function cambiarEstadoTransporte(idTransporte, estadoTransporte, contexto) {
  const fila = await obtenerPorId(idTransporte);
  if (!fila) {
    throw ErrorApi.noEncontrado('El transporte solicitado no existe');
  }

  await cambiarEstado(idTransporte, estadoTransporte);

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'transporte',
    idRegistro: idTransporte,
    accion: 'Cambio de estado',
    descripcion: `Transporte ${idTransporte} marcado como ${estadoTransporte}`
  });

  return { mensaje: `Transporte marcado como ${estadoTransporte}` };
}

const CAMPOS_SELECT = `t.id_transporte, t.tipo_transporte, t.id_proveedor, pr.nombre_empresa, t.id_paquete,
                       p.nombre_paquete, t.descripcion, t.capacidad, t.precio, t.fecha_salida, t.fecha_llegada,
                       t.estado_transporte, t.fecha_creacion`;

async function listar({ tipoTransporte, estado, idPaquete, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (tipoTransporte) {
    condiciones.push('t.tipo_transporte = ?');
    parametros.push(tipoTransporte);
  }
  if (estado) {
    condiciones.push('t.estado_transporte = ?');
    parametros.push(estado);
  }
  if (idPaquete) {
    condiciones.push('t.id_paquete = ?');
    parametros.push(idPaquete);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM transporte t
       INNER JOIN proveedores pr ON pr.id_proveedor = t.id_proveedor
       LEFT JOIN paquetes_turisticos p ON p.id_paquete = t.id_paquete
       ${donde}
       ORDER BY t.id_transporte ASC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM transporte t
       INNER JOIN proveedores pr ON pr.id_proveedor = t.id_proveedor
       LEFT JOIN paquetes_turisticos p ON p.id_paquete = t.id_paquete
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idTransporte) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM transporte t
       INNER JOIN proveedores pr ON pr.id_proveedor = t.id_proveedor
       LEFT JOIN paquetes_turisticos p ON p.id_paquete = t.id_paquete
      WHERE t.id_transporte = ?`,
    [idTransporte]
  );
  return filas[0] || null;
}

async function crear({ tipoTransporte, idProveedor, idPaquete, descripcion, capacidad, precio, fechaSalida, fechaLlegada, estadoTransporte }) {
  const [resultado] = await pool.query(
    `INSERT INTO transporte (tipo_transporte, id_proveedor, id_paquete, descripcion, capacidad, precio, fecha_salida, fecha_llegada, estado_transporte)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tipoTransporte, idProveedor, idPaquete, descripcion, capacidad, precio, fechaSalida, fechaLlegada, estadoTransporte]
  );
  return resultado.insertId;
}

async function actualizar(idTransporte, { tipoTransporte, idProveedor, idPaquete, descripcion, capacidad, precio, fechaSalida, fechaLlegada, estadoTransporte }) {
  await pool.query(
    `UPDATE transporte
        SET tipo_transporte = ?, id_proveedor = ?, id_paquete = ?, descripcion = ?, capacidad = ?, precio = ?,
            fecha_salida = ?, fecha_llegada = ?, estado_transporte = ?
      WHERE id_transporte = ?`,
    [tipoTransporte, idProveedor, idPaquete, descripcion, capacidad, precio, fechaSalida, fechaLlegada, estadoTransporte, idTransporte]
  );
}

async function cambiarEstado(idTransporte, estadoTransporte) {
  await pool.query('UPDATE transporte SET estado_transporte = ? WHERE id_transporte = ?', [estadoTransporte, idTransporte]);
}

module.exports = {
  listarTransportes,
  obtenerTransporte,
  crearTransporte,
  actualizarTransporte,
  cambiarEstadoTransporte
};
