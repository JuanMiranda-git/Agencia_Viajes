'use strict';

/**
 * Servicio de reservas (RF-RES-01..05).
 * Reglas del SDD:
 *  - Reserva es de un paquete (nunca vuelo+paquete a la vez).
 *  - El total se calcula al crear y no cambia.
 *  - El numero AV-YYYYMMDD-XXXX se genera al confirmar.
 *  - Transiciones: Pendiente -> Confirmada -> Cancelada.
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const { generarNumeroReserva } = require('../utils/numeroReserva');
const Reserva = require('../models/Reserva');
const PaqueteTuristico = require('../models/PaqueteTuristico');
const reservasRepositorio = require('../repositories/reservasRepositorio');
const paquetesRepositorio = require('../repositories/paquetesRepositorio');
const clientesRepositorio = require('../repositories/clientesRepositorio');
const clientesServicio = require('./clientesServicio');
const ventasRepositorio = require('../repositories/ventasRepositorio');
const configuracionesRepositorio = require('../repositories/configuracionesRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');
const { ejecutarTransaccion } = require('../config/baseDatos');

const CUPO_POR_DEFECTO = 30;

function mapearReserva(fila) {
  return new Reserva({
    idReserva: fila.id_reserva,
    idCliente: fila.id_cliente,
    idUsuario: fila.id_usuario,
    idPaquete: fila.id_paquete,
    fechaReserva: fila.fecha_reserva,
    fechaViaje: fila.fecha_viaje,
    numPasajeros: fila.num_pasajeros,
    estadoReserva: fila.estado_reserva,
    total: fila.total,
    numeroReserva: fila.numero_reserva,
    fechaModificacion: fila.fecha_modificacion
  }).aJSON();
}

async function resolverIdCliente(datos, usuario, contexto) {
  if (usuario.rol === 'Cliente') {
    return clientesServicio.asegurarClienteDeUsuario(usuario, contexto);
  }

  if (!datos.idCliente) {
    throw ErrorApi.solicitudInvalida('Debe indicar el cliente de la reserva', [
      { campo: 'idCliente', mensaje: 'Campo obligatorio' }
    ]);
  }

  const cliente = await clientesRepositorio.obtenerPorId(datos.idCliente);
  if (!cliente) {
    throw ErrorApi.solicitudInvalida('El cliente indicado no existe', [
      { campo: 'idCliente', mensaje: 'Cliente inexistente' }
    ]);
  }
  return cliente.id_cliente;
}

async function obtenerCupoConfigurado() {
  const parametro = await configuracionesRepositorio.obtenerPorParametro('cupo_maximo_viaje');
  const cupo = parametro ? Number.parseInt(parametro.valor, 10) : CUPO_POR_DEFECTO;
  return Number.isInteger(cupo) && cupo > 0 ? cupo : CUPO_POR_DEFECTO;
}

async function listarReservas(consulta, usuario) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);

  let idCliente = consulta.idCliente;

  if (usuario.rol === 'Cliente') {
    const cliente = await clientesRepositorio.obtenerPorEmail(usuario.correo);
    // Un cliente sin perfil simplemente no tiene reservas.
    idCliente = cliente ? cliente.id_cliente : -1;
  }

  const { filas, total } = await reservasRepositorio.listar({
    estado: consulta.estado,
    idCliente,
    fechaDesde: consulta.fechaDesde,
    fechaHasta: consulta.fechaHasta,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      ...mapearReserva(fila),
      nombreCliente: fila.nombre_cliente,
      nombrePaquete: fila.nombre_paquete
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerReserva(idReserva, usuario) {
  const fila = await reservasRepositorio.obtenerPorId(idReserva);
  if (!fila) {
    throw ErrorApi.noEncontrado('La reserva solicitada no existe');
  }

  if (usuario.rol === 'Cliente') {
    const cliente = await clientesRepositorio.obtenerPorEmail(usuario.correo);
    if (!cliente || Number(cliente.id_cliente) !== Number(fila.id_cliente)) {
      throw ErrorApi.prohibido('Solo puede consultar sus propias reservas');
    }
  }

  return {
    ...mapearReserva(fila),
    nombreCliente: fila.nombre_cliente,
    nombrePaquete: fila.nombre_paquete,
    precioPaquete: fila.precio_paquete
  };
}

async function crearReserva(datos, usuario, contexto) {
  const filaPaquete = await paquetesRepositorio.obtenerPorId(datos.idPaquete);
  if (!filaPaquete) {
    throw ErrorApi.solicitudInvalida('El paquete indicado no existe', [
      { campo: 'idPaquete', mensaje: 'Paquete inexistente' }
    ]);
  }

  const paquete = new PaqueteTuristico({
    idPaquete: filaPaquete.id_paquete,
    nombrePaquete: filaPaquete.nombre_paquete,
    descripcion: filaPaquete.descripcion,
    precio: filaPaquete.precio,
    fechaInicio: filaPaquete.fecha_inicio,
    fechaFin: filaPaquete.fecha_fin,
    estadoPaquete: filaPaquete.estado_paquete
  });

  if (!paquete.estaDisponiblePara(datos.fechaViaje)) {
    throw ErrorApi.reglaNegocio('El paquete no esta disponible para la fecha de viaje indicada', [
      { campo: 'fechaViaje', mensaje: 'Fecha fuera del rango publicado o paquete inactivo' }
    ]);
  }

  const idCliente = await resolverIdCliente(datos, usuario, contexto);

  const cupoMaximo = await obtenerCupoConfigurado();
  const pasajerosReservados = await reservasRepositorio.sumarPasajerosReservados(datos.idPaquete, datos.fechaViaje);

  if (Number(pasajerosReservados) + Number(datos.numPasajeros) > cupoMaximo) {
    throw ErrorApi.reglaNegocio(`No hay cupo suficiente para esa fecha (cupo maximo ${cupoMaximo} pasajeros)`, [
      { campo: 'numPasajeros', mensaje: `Pasajeros ya reservados: ${pasajerosReservados}` }
    ]);
  }

  // Total inmutable: se calcula una sola vez al crear la reserva.
  const total = Reserva.calcularTotal(paquete.precio, datos.numPasajeros);

  const idReserva = await ejecutarTransaccion(async (conexion) => {
    const id = await reservasRepositorio.crear(
      {
        idCliente,
        idUsuario: contexto.idUsuario,
        idPaquete: datos.idPaquete,
        fechaViaje: datos.fechaViaje,
        numPasajeros: datos.numPasajeros,
        total
      },
      conexion
    );

    await bitacoraRepositorio.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'reservas',
        idRegistro: id,
        accion: 'Creacion',
        descripcion: `Reserva creada para el paquete ${paquete.nombrePaquete} por un total de ${total}`
      },
      conexion
    );

    return id;
  });

  return obtenerReserva(idReserva, usuario);
}

async function confirmarReserva(idReserva, contexto) {
  const fila = await reservasRepositorio.obtenerPorId(idReserva);
  if (!fila) {
    throw ErrorApi.noEncontrado('La reserva solicitada no existe');
  }

  const reserva = new Reserva({
    idReserva: fila.id_reserva,
    idCliente: fila.id_cliente,
    idUsuario: fila.id_usuario,
    idPaquete: fila.id_paquete,
    fechaReserva: fila.fecha_reserva,
    fechaViaje: fila.fecha_viaje,
    numPasajeros: fila.num_pasajeros,
    estadoReserva: fila.estado_reserva,
    total: fila.total,
    numeroReserva: fila.numero_reserva
  });

  let numeroReserva = null;
  for (let intento = 0; intento < 5 && !numeroReserva; intento += 1) {
    const candidato = generarNumeroReserva('AV');
    const repetido = await reservasRepositorio.existeNumero(candidato);
    if (!repetido) numeroReserva = candidato;
  }
  if (!numeroReserva) {
    throw ErrorApi.interno('No fue posible generar un numero de reserva unico');
  }

  const reservaConfirmada = reserva.confirmar(numeroReserva);

  await ejecutarTransaccion(async (conexion) => {
    await reservasRepositorio.cambiarEstado(
      idReserva,
      { estadoReserva: reservaConfirmada.estadoReserva, numeroReserva: reservaConfirmada.numeroReserva },
      conexion
    );
    await bitacoraRepositorio.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'reservas',
        idRegistro: idReserva,
        accion: 'Confirmacion',
        descripcion: `Reserva confirmada con numero ${numeroReserva}`
      },
      conexion
    );
  });

  const actualizada = await reservasRepositorio.obtenerPorId(idReserva);
  return mapearReserva(actualizada);
}

async function cancelarReserva(idReserva, usuario, contexto) {
  const fila = await reservasRepositorio.obtenerPorId(idReserva);
  if (!fila) {
    throw ErrorApi.noEncontrado('La reserva solicitada no existe');
  }

  if (usuario.rol === 'Cliente') {
    const cliente = await clientesRepositorio.obtenerPorEmail(usuario.correo);
    if (!cliente || Number(cliente.id_cliente) !== Number(fila.id_cliente)) {
      throw ErrorApi.prohibido('Solo puede cancelar sus propias reservas');
    }
  }

  const venta = await ventasRepositorio.obtenerPorReserva(idReserva);
  if (venta && venta.estado_venta === 'Pagado') {
    throw ErrorApi.reglaNegocio('No se puede cancelar una reserva con una venta pagada; anule primero la venta');
  }

  const reserva = new Reserva({
    idReserva: fila.id_reserva,
    idCliente: fila.id_cliente,
    idUsuario: fila.id_usuario,
    idPaquete: fila.id_paquete,
    fechaReserva: fila.fecha_reserva,
    fechaViaje: fila.fecha_viaje,
    numPasajeros: fila.num_pasajeros,
    estadoReserva: fila.estado_reserva,
    total: fila.total,
    numeroReserva: fila.numero_reserva
  });

  const reservaCancelada = reserva.cancelar();

  await ejecutarTransaccion(async (conexion) => {
    await reservasRepositorio.cambiarEstado(
      idReserva,
      { estadoReserva: reservaCancelada.estadoReserva },
      conexion
    );
    await bitacoraRepositorio.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'reservas',
        idRegistro: idReserva,
        accion: 'Cancelacion',
        descripcion: `Reserva ${fila.numero_reserva || idReserva} cancelada`
      },
      conexion
    );
  });

  const actualizada = await reservasRepositorio.obtenerPorId(idReserva);
  return mapearReserva(actualizada);
}

/**
 * RF-RES-05: datos para el comprobante PDF de la reserva.
 */
async function obtenerDatosComprobante(idReserva, usuario) {
  const reserva = await obtenerReserva(idReserva, usuario);
  return {
    numeroReserva: reserva.numeroReserva,
    cliente: reserva.nombreCliente,
    paquete: reserva.nombrePaquete,
    fechaViaje: reserva.fechaViaje,
    numPasajeros: reserva.numPasajeros,
    total: reserva.total,
    estado: reserva.estadoReserva,
    fechaReserva: reserva.fechaReserva
  };
}

module.exports = {
  listarReservas,
  obtenerReserva,
  crearReserva,
  confirmarReserva,
  cancelarReserva,
  obtenerDatosComprobante
};
