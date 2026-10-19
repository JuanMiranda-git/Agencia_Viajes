'use strict';

/**
 * Servicio de clientes (soporte RF-RES/CRM) y derechos Ley 1581 de 2012:
 * acceso, rectificacion (actualizacion) y supresion de datos personales.
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Cliente = require('../models/Cliente');
const clientesRepositorio = require('../repositories/clientesRepositorio');
const usuariosRepositorio = require('../repositories/usuariosRepositorio');
const crmRepositorio = require('../repositories/crmRepositorio');
const retroalimentacionRepositorio = require('../repositories/retroalimentacionRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');
const { ejecutarTransaccion } = require('../config/baseDatos');

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
  const { filas, total } = await clientesRepositorio.listar({
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
  const fila = await clientesRepositorio.obtenerPorId(idCliente);
  if (!fila) {
    throw ErrorApi.noEncontrado('El cliente solicitado no existe');
  }
  return mapearCliente(fila);
}

async function obtenerClientePorEmail(email) {
  const fila = await clientesRepositorio.obtenerPorEmail(email);
  return fila ? mapearCliente(fila) : null;
}

/**
 * Resuelve (o autogenera) el perfil de cliente asociado al usuario autenticado.
 * El registro publico ya recogio el consentimiento de tratamiento (RF-ACC-02),
 * por lo que el perfil autogenerado se crea con consentimiento otorgado.
 */
async function asegurarClienteDeUsuario(usuario, contexto) {
  const existente = await clientesRepositorio.obtenerPorEmail(usuario.correo);
  if (existente) {
    return existente.id_cliente;
  }

  const usuarioFila = await usuariosRepositorio.obtenerPorId(usuario.idUsuario);
  const nombreCompleto = (usuarioFila && usuarioFila.nombre_usuario) || usuario.nombreUsuario || 'Cliente';
  const partes = String(nombreCompleto).trim().split(' ');
  const nombre = partes.shift() || nombreCompleto;
  const apellido = partes.join(' ') || '';

  return ejecutarTransaccion(async (conexion) => {
    const idCliente = await clientesRepositorio.crear(
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

    await bitacoraRepositorio.registrar(
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
    throw ErrorApi.reglaNegocio('Debe registrar el consentimiento de tratamiento de datos (Ley 1581 de 2012)');
  }
  if (await clientesRepositorio.existeEmail(datos.email)) {
    throw ErrorApi.conflicto('Ya existe un cliente con ese correo electronico');
  }

  const idCliente = await clientesRepositorio.crear({
    nombre: datos.nombre,
    apellido: datos.apellido,
    email: datos.email,
    telefono: datos.telefono,
    direccion: datos.direccion,
    categoriaCliente: datos.categoriaCliente,
    consentimientoDatos: true
  });

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'clientes',
    idRegistro: idCliente,
    accion: 'Creacion',
    descripcion: `Cliente ${datos.email} registrado con consentimiento de datos`
  });

  return { idCliente };
}

async function actualizarCliente(idCliente, datos, contexto) {
  const fila = await clientesRepositorio.obtenerPorId(idCliente);
  if (!fila) {
    throw ErrorApi.noEncontrado('El cliente solicitado no existe');
  }

  await clientesRepositorio.actualizar(idCliente, {
    nombre: datos.nombre,
    apellido: datos.apellido,
    telefono: datos.telefono,
    direccion: datos.direccion,
    categoriaCliente: datos.categoriaCliente
  });

  await bitacoraRepositorio.registrar({
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
async function obtenerDatosPersonales(idCliente) {
  const fila = await clientesRepositorio.obtenerPorId(idCliente);
  if (!fila) {
    throw ErrorApi.noEncontrado('El cliente solicitado no existe');
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
  const fila = await clientesRepositorio.obtenerPorId(idCliente);
  if (!fila) {
    throw ErrorApi.noEncontrado('El cliente solicitado no existe');
  }

  if (datos.email !== fila.email && (await clientesRepositorio.existeEmail(datos.email, idCliente))) {
    throw ErrorApi.conflicto('Ya existe otro cliente con ese correo electronico');
  }

  await clientesRepositorio.actualizarDatosPersonales(idCliente, {
    nombre: datos.nombre,
    apellido: datos.apellido,
    email: datos.email,
    telefono: datos.telefono,
    direccion: datos.direccion,
    consentimientoDatos: datos.consentimientoDatos
  });

  await bitacoraRepositorio.registrar({
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
  const fila = await clientesRepositorio.obtenerPorId(idCliente);
  if (!fila) {
    throw ErrorApi.noEncontrado('El cliente solicitado no existe');
  }

  const filasAfectadas = await clientesRepositorio.anonimizar(idCliente);
  if (filasAfectadas === 0) {
    throw ErrorApi.noEncontrado('El cliente solicitado no existe');
  }

  await bitacoraRepositorio.registrar({
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
  const fila = await clientesRepositorio.obtenerPorId(idCliente);
  if (!fila) {
    throw ErrorApi.noEncontrado('El cliente solicitado no existe');
  }

  const [reservas, interacciones, retroalimentacion] = await Promise.all([
    crmRepositorio.reservasDeCliente(idCliente),
    crmRepositorio.listar({ idCliente, pagina: 1, limite: 100, desplazamiento: 0 }),
    retroalimentacionRepositorio.listar({ idCliente, pagina: 1, limite: 100, desplazamiento: 0 })
  ]);

  return {
    cliente: mapearCliente(fila),
    reservas,
    interacciones: interacciones.filas,
    retroalimentacion: retroalimentacion.filas
  };
}

module.exports = {
  listarClientes,
  obtenerCliente,
  obtenerClientePorEmail,
  asegurarClienteDeUsuario,
  crearCliente,
  actualizarCliente,
  obtenerDatosPersonales,
  actualizarDatosPersonales,
  eliminarDatosPersonales,
  obtenerHistorial
};
