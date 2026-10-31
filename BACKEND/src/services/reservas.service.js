'use strict';

/**
 * Servicio de reservas (RF-RES-01..05).
 * Reglas del SDD:
 *  - Reserva es de un paquete (nunca vuelo+paquete a la vez).
 *  - El total se calcula al crear y no cambia.
 *  - El numero AV-YYYYMMDD-XXXX se genera al confirmar.
 *  - Transiciones: Pendiente -> Confirmada -> Cancelada.
 */

const AppError = require('../utils/AppError');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const { generarNumeroReserva } = require('../utils/numeroReserva');
const Reserva = require('../models/Reserva');
const PaqueteTuristico = require('../models/PaqueteTuristico');
const clientesService = require('./clientes.service');
const paquetesService = require('./paquetes.service');
const configuracionesService = require('./configuraciones.service');
const bitacoraService = require('./bitacora.service');
const { pool, conTransaccion } = require('../config/database');

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
    return clientesService.asegurarClienteDeUsuario(usuario, contexto);
  }

  if (!datos.idCliente) {
    throw AppError.solicitudInvalida('Debe indicar el cliente de la reserva', [
      { campo: 'idCliente', mensaje: 'Campo obligatorio' }
    ]);
  }

  const cliente = await clientesService.datos.obtenerPorId(datos.idCliente);
  if (!cliente) {
    throw AppError.solicitudInvalida('El cliente indicado no existe', [
      { campo: 'idCliente', mensaje: 'Cliente inexistente' }
    ]);
  }
  return cliente.id_cliente;
}

async function obtenerCupoConfigurado() {
  const parametro = await configuracionesService.datos.obtenerPorParametro('cupo_maximo_viaje');
  const cupo = parametro ? Number.parseInt(parametro.valor, 10) : CUPO_POR_DEFECTO;
  return Number.isInteger(cupo) && cupo > 0 ? cupo : CUPO_POR_DEFECTO;
}

async function listarReservas(consulta, usuario) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);

  let idCliente = consulta.idCliente;

  if (usuario.rol === 'Cliente') {
    const cliente = await clientesService.datos.obtenerPorEmail(usuario.correo);
    // Un cliente sin perfil simplemente no tiene reservas.
    idCliente = cliente ? cliente.id_cliente : -1;
  }

  const { filas, total } = await listar({
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
  const fila = await obtenerPorId(idReserva);
  if (!fila) {
    throw AppError.noEncontrado('La reserva solicitada no existe');
  }

  if (usuario.rol === 'Cliente') {
    const cliente = await clientesService.datos.obtenerPorEmail(usuario.correo);
    if (!cliente || Number(cliente.id_cliente) !== Number(fila.id_cliente)) {
      throw AppError.prohibido('Solo puede consultar sus propias reservas');
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
  const filaPaquete = await paquetesService.datos.obtenerPorId(datos.idPaquete);
  if (!filaPaquete) {
    throw AppError.solicitudInvalida('El paquete indicado no existe', [
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
    throw AppError.reglaNegocio('El paquete no esta disponible para la fecha de viaje indicada', [
      { campo: 'fechaViaje', mensaje: 'Fecha fuera del rango publicado o paquete inactivo' }
    ]);
  }

  const idCliente = await resolverIdCliente(datos, usuario, contexto);

  const cupoMaximo = await obtenerCupoConfigurado();
  const pasajerosReservados = await sumarPasajerosReservados(datos.idPaquete, datos.fechaViaje);

  if (Number(pasajerosReservados) + Number(datos.numPasajeros) > cupoMaximo) {
    throw AppError.reglaNegocio(`No hay cupo suficiente para esa fecha (cupo maximo ${cupoMaximo} pasajeros)`, [
      { campo: 'numPasajeros', mensaje: `Pasajeros ya reservados: ${pasajerosReservados}` }
    ]);
  }

  // Total inmutable: se calcula una sola vez al crear la reserva.
  const total = Reserva.calcularTotal(paquete.precio, datos.numPasajeros);

  const idReserva = await conTransaccion(async (conexion) => {
    const id = await crear(
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

    await bitacoraService.datos.registrar(
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
  const fila = await obtenerPorId(idReserva);
  if (!fila) {
    throw AppError.noEncontrado('La reserva solicitada no existe');
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
    const repetido = await existeNumero(candidato);
    if (!repetido) numeroReserva = candidato;
  }
  if (!numeroReserva) {
    throw AppError.interno('No fue posible generar un numero de reserva unico');
  }

  const reservaConfirmada = reserva.confirmar(numeroReserva);

  await conTransaccion(async (conexion) => {
    await cambiarEstado(
      idReserva,
      { estadoReserva: reservaConfirmada.estadoReserva, numeroReserva: reservaConfirmada.numeroReserva },
      conexion
    );
    await bitacoraService.datos.registrar(
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

  const actualizada = await obtenerPorId(idReserva);
  return mapearReserva(actualizada);
}

async function cancelarReserva(idReserva, usuario, contexto) {
  const fila = await obtenerPorId(idReserva);
  if (!fila) {
    throw AppError.noEncontrado('La reserva solicitada no existe');
  }

  if (usuario.rol === 'Cliente') {
    const cliente = await clientesService.datos.obtenerPorEmail(usuario.correo);
    if (!cliente || Number(cliente.id_cliente) !== Number(fila.id_cliente)) {
      throw AppError.prohibido('Solo puede cancelar sus propias reservas');
    }
  }

  const venta = await require('./ventas.service').datos.obtenerPorReserva(idReserva);
  if (venta && venta.estado_venta === 'Pagado') {
    throw AppError.reglaNegocio('No se puede cancelar una reserva con una venta pagada; anule primero la venta');
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

  await conTransaccion(async (conexion) => {
    await cambiarEstado(
      idReserva,
      { estadoReserva: reservaCancelada.estadoReserva },
      conexion
    );
    await bitacoraService.datos.registrar(
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

  const actualizada = await obtenerPorId(idReserva);
  return mapearReserva(actualizada);
}

/**
 * Actualiza la fecha de viaje de una reserva sin alterar su total (inmutable).
 * El cliente solo puede reprogramar sus propias reservas.
 */
async function actualizarReserva(idReserva, datos, usuario, contexto) {
  const fila = await obtenerPorId(idReserva);
  if (!fila) {
    throw AppError.noEncontrado('La reserva solicitada no existe');
  }

  if (usuario.rol === 'Cliente') {
    const cliente = await clientesService.datos.obtenerPorEmail(usuario.correo);
    if (!cliente || Number(cliente.id_cliente) !== Number(fila.id_cliente)) {
      throw AppError.prohibido('Solo puede actualizar sus propias reservas');
    }
  }

  if (fila.estado_reserva === 'Cancelada') {
    throw AppError.reglaNegocio('No se puede modificar una reserva cancelada');
  }

  const filaPaquete = await paquetesService.datos.obtenerPorId(fila.id_paquete);
  const paquete = new PaqueteTuristico({
    idPaquete: filaPaquete.id_paquete,
    nombrePaquete: filaPaquete.nombre_paquete,
    descripcion: filaPaquete.descripcion,
    precio: filaPaquete.precio,
    fechaInicio: filaPaquete.fecha_inicio,
    fechaFin: filaPaquete.fecha_fin,
    estadoPaquete: filaPaquete.estado_paquete
  });

  const fechaViaje = datos.fechaViaje !== undefined ? datos.fechaViaje : fila.fecha_viaje;
  if (!paquete.estaDisponiblePara(fechaViaje)) {
    throw AppError.reglaNegocio('El paquete no esta disponible para la fecha de viaje indicada', [
      { campo: 'fechaViaje', mensaje: 'Fecha fuera del rango publicado o paquete inactivo' }
    ]);
  }

  await conTransaccion(async (conexion) => {
    await conexion.query('UPDATE reservas SET fecha_viaje = ? WHERE id_reserva = ?', [fechaViaje, idReserva]);
    await bitacoraService.datos.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'reservas',
        idRegistro: idReserva,
        accion: 'Actualizacion',
        descripcion: `Reserva ${fila.numero_reserva || idReserva} reprogramada para ${fechaViaje}`
      },
      conexion
    );
  });

  return obtenerReserva(idReserva, usuario);
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

const CAMPOS_SELECT = `r.id_reserva, r.id_cliente, CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
                       r.id_usuario, r.id_paquete, p.nombre_paquete, p.precio AS precio_paquete,
                       r.fecha_reserva, r.fecha_viaje, r.num_pasajeros, r.estado_reserva, r.total,
                       r.numero_reserva, r.fecha_modificacion`;

async function listar({ estado, idCliente, fechaDesde, fechaHasta, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (estado) {
    condiciones.push('r.estado_reserva = ?');
    parametros.push(estado);
  }
  if (idCliente) {
    condiciones.push('r.id_cliente = ?');
    parametros.push(idCliente);
  }
  if (fechaDesde) {
    condiciones.push('r.fecha_viaje >= ?');
    parametros.push(fechaDesde);
  }
  if (fechaHasta) {
    condiciones.push('r.fecha_viaje <= ?');
    parametros.push(fechaHasta);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM reservas r
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
       ${donde}
       ORDER BY r.id_reserva DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM reservas r
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idReserva) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM reservas r
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
      WHERE r.id_reserva = ?`,
    [idReserva]
  );
  return filas[0] || null;
}

async function crear({ idCliente, idUsuario, idPaquete, fechaViaje, numPasajeros, total }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO reservas (id_cliente, id_usuario, id_paquete, fecha_viaje, num_pasajeros, estado_reserva, total)
     VALUES (?, ?, ?, ?, ?, 'Pendiente', ?)`,
    [idCliente, idUsuario, idPaquete, fechaViaje, numPasajeros, total]
  );
  return resultado.insertId;
}

async function cambiarEstado(idReserva, { estadoReserva, numeroReserva = null }, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('UPDATE reservas SET estado_reserva = ?, numero_reserva = COALESCE(?, numero_reserva) WHERE id_reserva = ?', [
    estadoReserva,
    numeroReserva,
    idReserva
  ]);
}

async function obtenerPorNumero(numeroReserva) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM reservas r
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
      WHERE r.numero_reserva = ?`,
    [numeroReserva]
  );
  return filas[0] || null;
}

async function sumarPasajerosReservados(idPaquete, fechaViaje) {
  const [filas] = await pool.query(
    `SELECT COALESCE(SUM(num_pasajeros), 0) AS pasajeros
       FROM reservas
      WHERE id_paquete = ?
        AND fecha_viaje = ?
        AND estado_reserva <> 'Cancelada'`,
    [idPaquete, fechaViaje]
  );
  return filas[0].pasajeros;
}

async function existeNumero(numeroReserva) {
  const [filas] = await pool.query('SELECT 1 AS existe FROM reservas WHERE numero_reserva = ?', [numeroReserva]);
  return filas.length > 0;
}

module.exports = {
  listarReservas,
  obtenerReserva,
  crearReserva,
  confirmarReserva,
  cancelarReserva,
  actualizarReserva,
  obtenerDatosComprobante,
  datos: { obtenerPorId }
};
