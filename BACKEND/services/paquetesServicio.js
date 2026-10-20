'use strict';

/**
 * Servicio de paquetes turisticos y servicios del paquete (RF-PAQ-01..05).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const PaqueteTuristico = require('../models/PaqueteTuristico');
const ServicioPaquete = require('../models/ServicioPaquete');
const bitacoraServicio = require('./bitacoraServicio');
const { pool, ejecutarTransaccion } = require('../config/baseDatos');

function mapearPaquete(fila) {
  return new PaqueteTuristico({
    idPaquete: fila.id_paquete,
    nombrePaquete: fila.nombre_paquete,
    descripcion: fila.descripcion,
    precio: fila.precio,
    fechaInicio: fila.fecha_inicio,
    fechaFin: fila.fecha_fin,
    estadoPaquete: fila.estado_paquete,
    fechaCreacion: fila.fecha_creacion,
    fechaModificacion: fila.fecha_modificacion
  }).aJSON();
}

function mapearServicioPaquete(fila) {
  return new ServicioPaquete({
    idServicio: fila.id_servicio,
    tipoServicio: fila.tipo_servicio,
    descripcion: fila.descripcion,
    precio: fila.precio
  }).aJSON();
}

async function listarPaquetes(consulta, opciones = {}) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const estado = opciones.soloActivos ? 'Activo' : consulta.estado;

  const { filas, total } = await listar({
    nombre: consulta.nombre,
    estado,
    precioMinimo: consulta.precioMinimo,
    precioMaximo: consulta.precioMaximo,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map(mapearPaquete),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerPaquete(idPaquete) {
  const fila = await obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }
  const paquete = mapearPaquete(fila);
  const servicios = await listarServicios(idPaquete);
  return { ...paquete, servicios: servicios.map(mapearServicioPaquete) };
}

async function crearPaquete(datos, contexto) {
  const paquete = new PaqueteTuristico({
    nombrePaquete: datos.nombrePaquete,
    descripcion: datos.descripcion,
    precio: datos.precio,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    estadoPaquete: datos.estadoPaquete
  });

  const idPaquete = await crear(paquete.aJSON());

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'paquetes_turisticos',
    idRegistro: idPaquete,
    accion: 'Creacion',
    descripcion: `Paquete ${paquete.nombrePaquete} creado`
  });

  return { idPaquete };
}

async function actualizarPaquete(idPaquete, datos, contexto) {
  const fila = await obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }

  const paquete = new PaqueteTuristico({
    idPaquete,
    nombrePaquete: datos.nombrePaquete,
    descripcion: datos.descripcion,
    precio: datos.precio,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    estadoPaquete: datos.estadoPaquete
  });

  const { idPaquete: id, ...campos } = paquete.aJSON();
  void id;

  await actualizar(idPaquete, campos);

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'paquetes_turisticos',
    idRegistro: idPaquete,
    accion: 'Actualizacion',
    descripcion: `Paquete ${paquete.nombrePaquete} actualizado`
  });

  return { mensaje: 'Paquete actualizado correctamente' };
}

async function cambiarEstadoPaquete(idPaquete, estadoPaquete, contexto) {
  const fila = await obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }

  await cambiarEstado(idPaquete, estadoPaquete);

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'paquetes_turisticos',
    idRegistro: idPaquete,
    accion: 'Cambio de estado',
    descripcion: `Paquete ${fila.nombre_paquete} marcado como ${estadoPaquete}`
  });

  return { mensaje: `Paquete marcado como ${estadoPaquete}` };
}

async function listarServiciosDePaquete(idPaquete) {
  const fila = await obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }
  const servicios = await listarServicios(idPaquete);
  return servicios.map(mapearServicioPaquete);
}

/**
 * RF-PAQ-04: agrega un servicio al paquete creando el servicio y la asociacion
 * dentro de una transaccion.
 */
async function agregarServicioAPaquete(idPaquete, datos, contexto) {
  const fila = await obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }

  const servicio = new ServicioPaquete({
    tipoServicio: datos.tipoServicio,
    descripcion: datos.descripcion,
    precio: datos.precio
  });

  const idServicio = await ejecutarTransaccion(async (conexion) => {
    const id = await crearServicio(servicio.aJSON(), conexion);
    await asociarServicio(idPaquete, id, conexion);
    await bitacoraServicio.datos.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'servicios_paquete',
        idRegistro: id,
        accion: 'Creacion',
        descripcion: `Servicio ${servicio.tipoServicio} agregado al paquete ${fila.nombre_paquete}`
      },
      conexion
    );
    return id;
  });

  return { idServicio };
}

async function quitarServicioDePaquete(idPaquete, idServicio, contexto) {
  const fila = await obtenerPorId(idPaquete);
  if (!fila) {
    throw ErrorApi.noEncontrado('El paquete solicitado no existe');
  }

  const filasAfectadas = await quitarServicio(idPaquete, idServicio);
  if (filasAfectadas === 0) {
    throw ErrorApi.noEncontrado('El paquete no tiene asociado ese servicio');
  }

  await bitacoraServicio.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'PAQUETE_SERVICIO',
    idRegistro: idPaquete,
    accion: 'Retiro de servicio',
    descripcion: `Servicio ${idServicio} retirado del paquete ${fila.nombre_paquete}`
  });

  return { mensaje: 'Servicio retirado del paquete correctamente' };
}

async function listar({ nombre, estado, precioMinimo, precioMaximo, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (nombre) {
    condiciones.push('p.nombre_paquete LIKE ?');
    parametros.push(`%${nombre}%`);
  }
  if (estado) {
    condiciones.push('p.estado_paquete = ?');
    parametros.push(estado);
  }
  if (precioMinimo !== undefined && precioMinimo !== null) {
    condiciones.push('p.precio >= ?');
    parametros.push(precioMinimo);
  }
  if (precioMaximo !== undefined && precioMaximo !== null) {
    condiciones.push('p.precio <= ?');
    parametros.push(precioMaximo);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT p.id_paquete, p.nombre_paquete, p.descripcion, p.precio, p.fecha_inicio, p.fecha_fin,
            p.estado_paquete, p.fecha_creacion, p.fecha_modificacion
       FROM paquetes_turisticos p
       ${donde}
       ORDER BY p.id_paquete ASC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(`SELECT COUNT(*) AS total FROM paquetes_turisticos p ${donde}`, parametros);

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idPaquete) {
  const [filas] = await pool.query(
    `SELECT id_paquete, nombre_paquete, descripcion, precio, fecha_inicio, fecha_fin, estado_paquete,
            fecha_creacion, fecha_modificacion
       FROM paquetes_turisticos WHERE id_paquete = ?`,
    [idPaquete]
  );
  return filas[0] || null;
}

async function crear({ nombrePaquete, descripcion, precio, fechaInicio, fechaFin, estadoPaquete }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO paquetes_turisticos (nombre_paquete, descripcion, precio, fecha_inicio, fecha_fin, estado_paquete)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombrePaquete, descripcion, precio, fechaInicio, fechaFin, estadoPaquete]
  );
  return resultado.insertId;
}

async function actualizar(idPaquete, { nombrePaquete, descripcion, precio, fechaInicio, fechaFin, estadoPaquete }) {
  await pool.query(
    `UPDATE paquetes_turisticos
        SET nombre_paquete = ?, descripcion = ?, precio = ?, fecha_inicio = ?, fecha_fin = ?, estado_paquete = ?
      WHERE id_paquete = ?`,
    [nombrePaquete, descripcion, precio, fechaInicio, fechaFin, estadoPaquete, idPaquete]
  );
}

async function cambiarEstado(idPaquete, estadoPaquete) {
  await pool.query('UPDATE paquetes_turisticos SET estado_paquete = ? WHERE id_paquete = ?', [estadoPaquete, idPaquete]);
}

async function listarServicios(idPaquete) {
  const [filas] = await pool.query(
    `SELECT s.id_servicio, s.tipo_servicio, s.descripcion, s.precio
       FROM PAQUETE_SERVICIO ps
       INNER JOIN servicios_paquete s ON s.id_servicio = ps.servicios_paquete_id_servicio
      WHERE ps.paquetes_turisticos_id_paquete = ?
      ORDER BY s.id_servicio ASC`,
    [idPaquete]
  );
  return filas;
}

async function crearServicio({ tipoServicio, descripcion, precio }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    'INSERT INTO servicios_paquete (tipo_servicio, descripcion, precio) VALUES (?, ?, ?)',
    [tipoServicio, descripcion, precio]
  );
  return resultado.insertId;
}

async function asociarServicio(idPaquete, idServicio, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('INSERT INTO PAQUETE_SERVICIO (paquetes_turisticos_id_paquete, servicios_paquete_id_servicio) VALUES (?, ?)', [
    idPaquete,
    idServicio
  ]);
}

async function quitarServicio(idPaquete, idServicio) {
  const [resultado] = await pool.query(
    'DELETE FROM PAQUETE_SERVICIO WHERE paquetes_turisticos_id_paquete = ? AND servicios_paquete_id_servicio = ?',
    [idPaquete, idServicio]
  );
  return resultado.affectedRows;
}

module.exports = {
  listarPaquetes,
  obtenerPaquete,
  crearPaquete,
  actualizarPaquete,
  cambiarEstadoPaquete,
  listarServiciosDePaquete,
  agregarServicioAPaquete,
  quitarServicioDePaquete,
  datos: { obtenerPorId }
};
