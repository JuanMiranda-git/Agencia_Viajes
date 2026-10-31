'use strict';

/**
 * Servicio de clientes (soporte RF-RES/CRM) y derechos Ley 1581 de 2012:
 * acceso, rectificacion (actualizacion) y supresion de datos personales.
 */

const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Cliente = require('../models/Cliente');
const usuariosService = require('./usuarios.service');
const bitacoraService = require('./bitacora.service');
const { pool, conTransaccion } = require('../config/database');

function mapearCliente(fila) {
  return new Cliente({
    idCliente: fila.id_cliente,
    nombre: fila.nombre,
    apellido: fila.apellido,
    email: fila.email,
    telefono: fila.telefono,
    direccion: fila.direccion,
    categoriaCliente: fila.categoria_cliente,
    consentimientoDatos: fila.consentimiento_datos === 1 || fila.consentimiento_datos === true,
    fechaConsentimiento: fila.fecha_consentimiento,
    fechaRegistro: fila.fecha_registro
  }).aJSON();
}

async function listarClientes(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    nombre: consulta.nombre,
    email: consulta.email,
    categoria: consulta.categoria,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map(mapearCliente),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerCliente(idCliente) {
  const fila = await obtenerPorId(idCliente);
  if (!fila) {
    throw AppError.noEncontrado('El cliente solicitado no existe');
  }
  return mapearCliente(fila);
}

async function obtenerClientePorEmail(email) {
  const fila = await obtenerPorEmail(email);
  return fila ? mapearCliente(fila) : null;
}

/**
 * Resuelve (o autogenera) el perfil de cliente asociado al usuario autenticado.
 * El registro publico ya recogio el consentimiento de tratamiento (RF-ACC-02),
 * por lo que el perfil autogenerado se crea con consentimiento otorgado.
 */
async function asegurarClienteDeUsuario(usuario, contexto) {
  const existente = await obtenerPorEmail(usuario.correo);
  if (existente) {
    return existente.id_cliente;
  }

  const usuarioFila = await usuariosService.datos.obtenerPorId(usuario.idUsuario);
  const nombreCompleto = (usuarioFila && usuarioFila.nombre_usuario) || usuario.nombreUsuario || 'Cliente';
  const partes = String(nombreCompleto).trim().split(' ');
  const nombre = partes.shift() || nombreCompleto;
  const apellido = partes.join(' ') || '';

  return conTransaccion(async (conexion) => {
    const idCliente = await crear(
      {
        nombre,
        apellido,
        email: usuario.correo,
        telefono: usuarioFila ? usuarioFila.telefono : null,
        direccion: null,
        categoriaCliente: 'Nuevo',
        consentimientoDatos: true
      },
      conexion
    );

    await bitacoraService.datos.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'clientes',
        idRegistro: idCliente,
        accion: 'Creacion automatica',
        descripcion: `Perfil de cliente autogenerado para ${usuario.correo}`
      },
      conexion
    );

    return idCliente;
  });
}

async function crearCliente(datos, contexto) {
  if (!datos.consentimientoDatos) {
    throw AppError.reglaNegocio('Debe registrar el consentimiento de tratamiento de datos (Ley 1581 de 2012)');
  }
  if (await existeEmail(datos.email)) {
    throw AppError.conflicto('Ya existe un cliente con ese correo electronico');
  }

  const idCliente = await crear({
    nombre: datos.nombre,
    apellido: datos.apellido,
    email: datos.email,
    telefono: datos.telefono,
    direccion: datos.direccion,
    categoriaCliente: datos.categoriaCliente,
    consentimientoDatos: true
  });

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'clientes',
    idRegistro: idCliente,
    accion: 'Creacion',
    descripcion: `Cliente ${datos.email} registrado con consentimiento de datos`
  });

  return { idCliente };
}

async function actualizarCliente(idCliente, datos, contexto) {
  const fila = await obtenerPorId(idCliente);
  if (!fila) {
    throw AppError.noEncontrado('El cliente solicitado no existe');
  }

  await actualizar(idCliente, {
    nombre: datos.nombre,
    apellido: datos.apellido,
    telefono: datos.telefono,
    direccion: datos.direccion,
    categoriaCliente: datos.categoriaCliente
  });

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'clientes',
    idRegistro: idCliente,
    accion: 'Actualizacion',
    descripcion: `Cliente ${fila.email} actualizado`
  });

  return { mensaje: 'Cliente actualizado correctamente' };
}

/**
 * Ley 1581 - Derecho de acceso: datos personales almacenados del titular.
 */
/**
 * Actualizacion parcial (PATCH) de los datos editables del cliente.
 * Los campos omitidos conservan su valor actual.
 */
async function actualizarParcialCliente(idCliente, datos, contexto) {
  const fila = await obtenerPorId(idCliente);
  if (!fila) {
    throw AppError.noEncontrado('El cliente solicitado no existe');
  }

  const email = datos.email !== undefined ? datos.email : fila.email;
  if (email !== fila.email && (await existeEmail(email, idCliente))) {
    throw AppError.conflicto('Ya existe otro cliente con ese correo electronico');
  }

  await actualizarDatosPersonalesSql(idCliente, {
    nombre: datos.nombre !== undefined ? datos.nombre : fila.nombre,
    apellido: datos.apellido !== undefined ? datos.apellido : fila.apellido,
    email,
    telefono: datos.telefono !== undefined ? datos.telefono : fila.telefono,
    direccion: datos.direccion !== undefined ? datos.direccion : fila.direccion,
    consentimientoDatos: fila.consentimiento_datos === 1 || fila.consentimiento_datos === true
  });

  if (datos.categoriaCliente !== undefined) {
    await pool.query('UPDATE clientes SET categoria_cliente = ? WHERE id_cliente = ?', [
      datos.categoriaCliente,
      idCliente
    ]);
  }

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'clientes',
    idRegistro: idCliente,
    accion: 'Actualizacion parcial',
    descripcion: `Cliente ${email} actualizado parcialmente`
  });

  return { mensaje: 'Cliente actualizado correctamente' };
}

async function obtenerDatosPersonales(idCliente) {
  const fila = await obtenerPorId(idCliente);
  if (!fila) {
    throw AppError.noEncontrado('El cliente solicitado no existe');
  }
  const cliente = mapearCliente(fila);
  return {
    datosPersonales: cliente,
    finalidad: 'Gestion de reservas, ventas y atencion al cliente de la agencia de viajes',
    baseLegal: 'Ley 1581 de 2012 - Proteccion de Datos Personales (Colombia)'
  };
}

/**
 * Ley 1581 - Derecho de rectificacion: actualiza los datos del titular.
 */
async function actualizarDatosPersonales(idCliente, datos, contexto) {
  const fila = await obtenerPorId(idCliente);
  if (!fila) {
    throw AppError.noEncontrado('El cliente solicitado no existe');
  }

  if (datos.email !== fila.email && (await existeEmail(datos.email, idCliente))) {
    throw AppError.conflicto('Ya existe otro cliente con ese correo electronico');
  }

  await actualizarDatosPersonalesSql(idCliente, {
    nombre: datos.nombre,
    apellido: datos.apellido,
    email: datos.email,
    telefono: datos.telefono,
    direccion: datos.direccion,
    consentimientoDatos: datos.consentimientoDatos
  });

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'clientes',
    idRegistro: idCliente,
    accion: 'Rectificacion de datos personales',
    descripcion: `Datos personales del cliente ${idCliente} actualizados (Ley 1581)`
  });

  return { mensaje: 'Datos personales actualizados correctamente' };
}

/**
 * Ley 1581 - Derecho de supresion: anonimiza los datos personales.
 * Se conservan las reservas por trazabilidad contable, sin datos del titular.
 */
async function eliminarDatosPersonales(idCliente, contexto) {
  const fila = await obtenerPorId(idCliente);
  if (!fila) {
    throw AppError.noEncontrado('El cliente solicitado no existe');
  }

  const filasAfectadas = await anonimizar(idCliente);
  if (filasAfectadas === 0) {
    throw AppError.noEncontrado('El cliente solicitado no existe');
  }

  await bitacoraService.datos.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'clientes',
    idRegistro: idCliente,
    accion: 'Supresion de datos personales',
    descripcion: `Datos personales del cliente ${idCliente} anonimizados (Ley 1581)`
  });

  return { mensaje: 'Los datos personales del cliente fueron suprimidos (anonimizados)' };
}

/**
 * RF-CRM-02/RF-CRM-03: historial consolidado del cliente.
 */
async function obtenerHistorial(idCliente) {
  const fila = await obtenerPorId(idCliente);
  if (!fila) {
    throw AppError.noEncontrado('El cliente solicitado no existe');
  }

  const [reservas, interacciones, retroalimentacion] = await Promise.all([
    require('./crm.service').datos.reservasDeCliente(idCliente),
    require('./crm.service').datos.listar({ idCliente, pagina: 1, limite: 100, desplazamiento: 0 }),
    require('./retroalimentacion.service').datos.listar({ idCliente, pagina: 1, limite: 100, desplazamiento: 0 })
  ]);

  return {
    cliente: mapearCliente(fila),
    reservas,
    interacciones: interacciones.filas,
    retroalimentacion: retroalimentacion.filas
  };
}

const CAMPOS_SELECT = `c.id_cliente, c.nombre, c.apellido, c.email, c.telefono, c.direccion,
                       c.categoria_cliente, c.consentimiento_datos, c.fecha_consentimiento, c.fecha_registro`;

async function listar({ nombre, email, categoria, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (nombre) {
    condiciones.push('(c.nombre LIKE ? OR c.apellido LIKE ?)');
    parametros.push(`%${nombre}%`, `%${nombre}%`);
  }
  if (email) {
    condiciones.push('c.email LIKE ?');
    parametros.push(`%${email}%`);
  }
  if (categoria) {
    condiciones.push('c.categoria_cliente = ?');
    parametros.push(categoria);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT} FROM clientes c ${donde} ORDER BY c.id_cliente ASC LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(`SELECT COUNT(*) AS total FROM clientes c ${donde}`, parametros);

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idCliente) {
  const [filas] = await pool.query(`SELECT ${CAMPOS_SELECT} FROM clientes c WHERE c.id_cliente = ?`, [idCliente]);
  return filas[0] || null;
}

async function obtenerPorEmail(email) {
  const [filas] = await pool.query(`SELECT ${CAMPOS_SELECT} FROM clientes c WHERE c.email = ?`, [email]);
  return filas[0] || null;
}

async function existeEmail(email, exceptoId = null) {
  const parametros = [email];
  let condicionExtra = '';
  if (exceptoId) {
    condicionExtra = 'AND id_cliente <> ?';
    parametros.push(exceptoId);
  }
  const [filas] = await pool.query(`SELECT 1 AS existe FROM clientes WHERE email = ? ${condicionExtra}`, parametros);
  return filas.length > 0;
}

async function crear({ nombre, apellido, email, telefono, direccion, categoriaCliente, consentimientoDatos }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO clientes (nombre, apellido, email, telefono, direccion, categoria_cliente, consentimiento_datos, fecha_consentimiento)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      categoriaCliente,
      consentimientoDatos ? 1 : 0,
      consentimientoDatos ? new Date() : null
    ]
  );
  return resultado.insertId;
}

async function actualizar(idCliente, { nombre, apellido, telefono, direccion, categoriaCliente }) {
  await pool.query(
    `UPDATE clientes SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, categoria_cliente = ? WHERE id_cliente = ?`,
    [nombre, apellido, telefono, direccion, categoriaCliente, idCliente]
  );
}

async function actualizarDatosPersonalesSql(idCliente, { nombre, apellido, email, telefono, direccion, consentimientoDatos }) {
  await pool.query(
    `UPDATE clientes
        SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ?,
            consentimiento_datos = ?, fecha_consentimiento = COALESCE(fecha_consentimiento, ?)
      WHERE id_cliente = ?`,
    [nombre, apellido, email, telefono, direccion, consentimientoDatos ? 1 : 0, new Date(), idCliente]
  );
}

async function anonimizar(idCliente) {
  const [resultado] = await pool.query(
    `UPDATE clientes
        SET nombre = 'Anonimo', apellido = 'Anonimo', email = CONCAT('anonimo+', id_cliente, '@eliminado.local'),
            telefono = NULL, direccion = NULL, categoria_cliente = NULL, consentimiento_datos = 0
      WHERE id_cliente = ?`,
    [idCliente]
  );
  return resultado.affectedRows;
}

module.exports = {
  listarClientes,
  obtenerCliente,
  obtenerClientePorEmail,
  asegurarClienteDeUsuario,
  crearCliente,
  actualizarCliente,
  actualizarParcialCliente,
  obtenerDatosPersonales,
  actualizarDatosPersonales,
  eliminarDatosPersonales,
  obtenerHistorial,
  datos: { obtenerPorId, obtenerPorEmail, existeEmail, crear }
};
