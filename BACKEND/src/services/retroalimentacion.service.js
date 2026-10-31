'use strict';

/**
 * Servicio de retroalimentacion de clientes (RF-DES-01..03).
 */

const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Retroalimentacion = require('../models/Retroalimentacion');
const bitacoraService = require('./bitacora.service');
const paquetesService = require('./paquetes.service');
const clientesService = require('./clientes.service');
const { pool } = require('../config/database');

function mapearRetroalimentacion(fila) {
  return new Retroalimentacion({
    idRetroalimentacion: fila.id_retroalimentacion,
    idPaquete: fila.id_paquete,
    idCliente: fila.id_cliente,
    calificacion: fila.calificacion,
    comentario: fila.comentario,
    fechaCreacion: fila.fecha_creacion
  }).aJSON();
}

/**
 * RF-DES-01: registra la calificacion de un paquete por parte del cliente.
 * Un Cliente solo califica en su propio nombre; un Administrador puede indicar cliente.
 */
async function crearRetroalimentacion(datos, usuario, contexto) {
  const paquete = await paquetesService.datos.obtenerPorId(datos.idPaquete);
  if (!paquete) {
    throw AppError.solicitudInvalida('El paquete indicado no existe', [
      { campo: 'idPaquete', mensaje: 'Paquete inexistente' }
    ]);
  }

  let idCliente;
  if (usuario.rol === 'Cliente') {
    idCliente = await clientesService.asegurarClienteDeUsuario(usuario, contexto);
  } else {
    if (!datos.idCliente) {
      throw AppError.solicitudInvalida('Debe indicar el cliente de la retroalimentacion', [
        { campo: 'idCliente', mensaje: 'Campo obligatorio' }
      ]);
    }
    const cliente = await clientesService.obtenerCliente(datos.idCliente);
    idCliente = cliente.idCliente;
  }

  const retroalimentacion = new Retroalimentacion({
    idPaquete: datos.idPaquete,
    idCliente,
    calificacion: datos.calificacion,
    comentario: datos.comentario
  });

  const idRetroalimentacion = await crear(retroalimentacion.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'retroalimentacion',
    idRegistro: idRetroalimentacion,
    accion: 'Creacion',
    descripcion: `Calificacion ${retroalimentacion.calificacion}/5 registrada para el paquete ${datos.idPaquete}`
  });

  return { idRetroalimentacion };
}

function mapearConNombres(fila) {
  return {
    ...mapearRetroalimentacion(fila),
    nombrePaquete: fila.nombre_paquete,
    nombreCliente: fila.nombre_cliente
  };
}

async function verificarPropietario(fila, usuario) {
  if (usuario.rol !== 'Cliente') return;
  const cliente = await clientesService.obtenerClientePorEmail(usuario.correo);
  if (!cliente || Number(cliente.idCliente) !== Number(fila.id_cliente)) {
    throw AppError.prohibido('Solo puede acceder a su propia retroalimentacion');
  }
}

async function obtenerRetroalimentacion(idRetroalimentacion, usuario) {
  const fila = await obtenerPorId(idRetroalimentacion);
  if (!fila) {
    throw AppError.noEncontrado('La retroalimentacion solicitada no existe');
  }
  await verificarPropietario(fila, usuario);
  return mapearConNombres(fila);
}

async function actualizarRetroalimentacion(idRetroalimentacion, datos, usuario, contexto) {
  const fila = await obtenerPorId(idRetroalimentacion);
  if (!fila) {
    throw AppError.noEncontrado('La retroalimentacion solicitada no existe');
  }
  await verificarPropietario(fila, usuario);

  const paquete = await paquetesService.datos.obtenerPorId(datos.idPaquete);
  if (!paquete) {
    throw AppError.solicitudInvalida('El paquete indicado no existe', [
      { campo: 'idPaquete', mensaje: 'Paquete inexistente' }
    ]);
  }

  const retroalimentacion = new Retroalimentacion({
    idRetroalimentacion,
    idPaquete: datos.idPaquete,
    idCliente: fila.id_cliente,
    calificacion: datos.calificacion,
    comentario: datos.comentario
  });

  await actualizar(idRetroalimentacion, retroalimentacion.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'retroalimentacion',
    idRegistro: idRetroalimentacion,
    accion: 'Actualizacion',
    descripcion: `Retroalimentacion ${idRetroalimentacion} actualizada`
  });

  return { mensaje: 'Retroalimentacion actualizada correctamente' };
}

async function actualizarParcialRetroalimentacion(idRetroalimentacion, datos, usuario, contexto) {
  const fila = await obtenerPorId(idRetroalimentacion);
  if (!fila) {
    throw AppError.noEncontrado('La retroalimentacion solicitada no existe');
  }
  await verificarPropietario(fila, usuario);

  if (datos.idPaquete !== undefined) {
    const paquete = await paquetesService.datos.obtenerPorId(datos.idPaquete);
    if (!paquete) {
      throw AppError.solicitudInvalida('El paquete indicado no existe', [
        { campo: 'idPaquete', mensaje: 'Paquete inexistente' }
      ]);
    }
  }

  const retroalimentacion = new Retroalimentacion({
    idRetroalimentacion,
    idPaquete: datos.idPaquete !== undefined ? datos.idPaquete : fila.id_paquete,
    idCliente: fila.id_cliente,
    calificacion: datos.calificacion !== undefined ? datos.calificacion : fila.calificacion,
    comentario: datos.comentario !== undefined ? datos.comentario : fila.comentario
  });

  await actualizar(idRetroalimentacion, retroalimentacion.aJSON());

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'retroalimentacion',
    idRegistro: idRetroalimentacion,
    accion: 'Actualizacion parcial',
    descripcion: `Retroalimentacion ${idRetroalimentacion} actualizada parcialmente`
  });

  return { mensaje: 'Retroalimentacion actualizada correctamente' };
}

async function listarRetroalimentacion(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    idPaquete: consulta.idPaquete,
    idCliente: consulta.idCliente,
    calificacion: consulta.calificacion,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      ...mapearRetroalimentacion(fila),
      nombrePaquete: fila.nombre_paquete,
      nombreCliente: fila.nombre_cliente
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

/**
 * RF-DES-02: resumen de calificaciones por paquete.
 */
async function resumenPorPaquete() {
  return resumenPorPaqueteSql();
}

const CAMPOS_SELECT = `rt.id_retroalimentacion, rt.id_paquete, p.nombre_paquete, rt.id_cliente,
                       CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente, rt.calificacion,
                       rt.comentario, rt.fecha_creacion`;

async function crear({ idPaquete, idCliente, calificacion, comentario }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    'INSERT INTO retroalimentacion (id_paquete, id_cliente, calificacion, comentario) VALUES (?, ?, ?, ?)',
    [idPaquete, idCliente, calificacion, comentario]
  );
  return resultado.insertId;
}

async function listar({ idPaquete, idCliente, calificacion, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (idPaquete) {
    condiciones.push('rt.id_paquete = ?');
    parametros.push(idPaquete);
  }
  if (idCliente) {
    condiciones.push('rt.id_cliente = ?');
    parametros.push(idCliente);
  }
  if (calificacion) {
    condiciones.push('rt.calificacion = ?');
    parametros.push(calificacion);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM retroalimentacion rt
       INNER JOIN paquetes_turisticos p ON p.id_paquete = rt.id_paquete
       INNER JOIN clientes c ON c.id_cliente = rt.id_cliente
       ${donde}
       ORDER BY rt.fecha_creacion DESC, rt.id_retroalimentacion DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM retroalimentacion rt
       INNER JOIN paquetes_turisticos p ON p.id_paquete = rt.id_paquete
       INNER JOIN clientes c ON c.id_cliente = rt.id_cliente
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function actualizar(idRetroalimentacion, { idPaquete, idCliente, calificacion, comentario }) {
  await pool.query(
    'UPDATE retroalimentacion SET id_paquete = ?, id_cliente = ?, calificacion = ?, comentario = ? WHERE id_retroalimentacion = ?',
    [idPaquete, idCliente, calificacion, comentario, idRetroalimentacion]
  );
}

async function obtenerPorId(idRetroalimentacion) {
  const [filas] = await pool.query(`SELECT ${CAMPOS_SELECT} FROM retroalimentacion rt
       INNER JOIN paquetes_turisticos p ON p.id_paquete = rt.id_paquete
       INNER JOIN clientes c ON c.id_cliente = rt.id_cliente
      WHERE rt.id_retroalimentacion = ?`, [idRetroalimentacion]);
  return filas[0] || null;
}

async function resumenPorPaqueteSql() {
  const [filas] = await pool.query(
    `SELECT p.id_paquete, p.nombre_paquete,
            COUNT(rt.id_retroalimentacion) AS total_resenas,
            ROUND(AVG(rt.calificacion), 2) AS promedio_calificacion
       FROM paquetes_turisticos p
       LEFT JOIN retroalimentacion rt ON rt.id_paquete = p.id_paquete
      GROUP BY p.id_paquete, p.nombre_paquete
      ORDER BY promedio_calificacion DESC`
  );
  return filas;
}

module.exports = {
  crearRetroalimentacion,
  listarRetroalimentacion,
  obtenerRetroalimentacion,
  actualizarRetroalimentacion,
  actualizarParcialRetroalimentacion,
  resumenPorPaquete,
  datos: { listar, obtenerPorId }
};
