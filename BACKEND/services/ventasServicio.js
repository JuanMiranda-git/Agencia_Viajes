'use strict';

/**
 * Servicio de ventas y pagos (RF-VEN-01..04).
 * Solo se registra venta sobre reserva confirmada; el monto no supera el total.
 * La pasarela de tarjeta es un pendiente (TBD-03): esos pagos quedan Pendiente.
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Venta = require('../models/Venta');
const Pago = require('../models/Pago');
const reservasServicio = require('./reservasServicio');
const bitacoraServicio = require('./bitacoraServicio');
const { pool, ejecutarTransaccion } = require('../config/baseDatos');

function mapearVenta(fila) {
  return new Venta({
    idVenta: fila.id_venta,
    idReserva: fila.id_reserva,
    monto: fila.monto,
    fechaVenta: fila.fecha_venta,
    metodoPago: fila.metodo_pago,
    estadoVenta: fila.estado_venta,
    comprobanteRuta: fila.comprobante_ruta,
    fechaModificacion: fila.fecha_modificacion
  }).aJSON();
}

async function listarVentas(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await listar({
    estado: consulta.estado,
    fechaDesde: consulta.fechaDesde,
    fechaHasta: consulta.fechaHasta,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      ...mapearVenta(fila),
      numeroReserva: fila.numero_reserva,
      nombreCliente: fila.nombre_cliente,
      nombrePaquete: fila.nombre_paquete
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

async function obtenerVenta(idVenta) {
  const fila = await obtenerPorId(idVenta);
  if (!fila) {
    throw ErrorApi.noEncontrado('La venta solicitada no existe');
  }
  return {
    ...mapearVenta(fila),
    numeroReserva: fila.numero_reserva,
    nombreCliente: fila.nombre_cliente,
    nombrePaquete: fila.nombre_paquete
  };
}

/**
 * RF-VEN-01: registra la venta de una reserva confirmada.
 */
async function crearVenta(datos, contexto) {
  const filaReserva = await reservasServicio.datos.obtenerPorId(datos.idReserva);
  if (!filaReserva) {
    throw ErrorApi.solicitudInvalida('La reserva indicada no existe', [
      { campo: 'idReserva', mensaje: 'Reserva inexistente' }
    ]);
  }

  const ventaExistente = await obtenerPorReserva(datos.idReserva);
  if (ventaExistente) {
    throw ErrorApi.conflicto('Ya existe una venta registrada para esa reserva');
  }

  const venta = new Venta({
    idReserva: datos.idReserva,
    monto: datos.monto !== undefined ? datos.monto : filaReserva.total,
    metodoPago: datos.metodoPago,
    estadoReserva: filaReserva.estado_reserva,
    totalReserva: filaReserva.total
  });

  venta.validarReservaConfirmada();
  venta.validarMontoContraReserva();

  const pago = new Pago({ monto: venta.monto, metodoPago: venta.metodoPago }).procesar();
  const estadoVenta = pago.estaPagado() ? 'Pagado' : 'Pendiente';

  const idVenta = await ejecutarTransaccion(async (conexion) => {
    const id = await crear(
      {
        idReserva: venta.idReserva,
        monto: venta.monto,
        metodoPago: venta.metodoPago,
        estadoVenta,
        comprobanteRuta: null
      },
      conexion
    );

    if (pago.estaPagado()) {
      await actualizarEstado(
        id,
        { estadoVenta, comprobanteRuta: `/api/v1/ventas/${id}/comprobante` },
        conexion
      );
    }

    await bitacoraServicio.datos.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'ventas',
        idRegistro: id,
        accion: 'Creacion',
        descripcion: `Venta registrada para la reserva ${filaReserva.numero_reserva || venta.idReserva} (${estadoVenta})`
      },
      conexion
    );

    return id;
  });

  const creada = await obtenerVenta(idVenta);
  return { venta: creada, pago: pago.aJSON() };
}

/**
 * RF-VEN-02/RF-VEN-04: procesa el pago de una venta pendiente.
 */
async function registrarPago(idVenta, datos, contexto) {
  const fila = await obtenerPorId(idVenta);
  if (!fila) {
    throw ErrorApi.noEncontrado('La venta solicitada no existe');
  }

  const venta = new Venta({
    idVenta: fila.id_venta,
    idReserva: fila.id_reserva,
    monto: datos.monto !== undefined ? datos.monto : fila.monto,
    metodoPago: datos.metodoPago || fila.metodo_pago,
    estadoVenta: fila.estado_venta,
    comprobanteRuta: fila.comprobante_ruta,
    totalReserva: fila.total,
    estadoReserva: fila.estado_reserva
  });

  venta.validarMontoContraReserva();

  const pago = new Pago({ monto: venta.monto, metodoPago: venta.metodoPago }).procesar();

  if (pago.estaPagado()) {
    const pagada = venta.marcarPagada();
    await ejecutarTransaccion(async (conexion) => {
      await actualizarEstado(
        idVenta,
        { estadoVenta: pagada.estadoVenta, comprobanteRuta: `/api/v1/ventas/${idVenta}/comprobante` },
        conexion
      );
      await bitacoraServicio.datos.registrar(
        {
          idUsuario: contexto.idUsuario,
          tablaAfectada: 'ventas',
          idRegistro: idVenta,
          accion: 'Pago registrado',
          descripcion: `Pago ${pago.metodoPago} aprobado por ${pago.monto}`
        },
        conexion
      );
    });
  } else {
    await bitacoraServicio.datos.registrar({
      idUsuario: contexto.idUsuario,
      tablaAfectada: 'ventas',
      idRegistro: idVenta,
      accion: 'Intento de pago',
      descripcion: `Pago ${pago.metodoPago} quedo pendiente: ${pago.motivoRechazo}`
    });
  }

  const actualizada = await obtenerVenta(idVenta);
  return { venta: actualizada, pago: pago.aJSON() };
}

async function cancelarVenta(idVenta, contexto) {
  const fila = await obtenerPorId(idVenta);
  if (!fila) {
    throw ErrorApi.noEncontrado('La venta solicitada no existe');
  }

  const venta = new Venta({
    idVenta: fila.id_venta,
    idReserva: fila.id_reserva,
    monto: fila.monto,
    metodoPago: fila.metodo_pago,
    estadoVenta: fila.estado_venta
  });

  const cancelada = venta.cancelar();

  await ejecutarTransaccion(async (conexion) => {
    await actualizarEstado(idVenta, { estadoVenta: cancelada.estadoVenta }, conexion);
    await bitacoraServicio.datos.registrar(
      {
        idUsuario: contexto.idUsuario,
        tablaAfectada: 'ventas',
        idRegistro: idVenta,
        accion: 'Cancelacion',
        descripcion: `Venta ${idVenta} cancelada`
      },
      conexion
    );
  });

  const actualizada = await obtenerVenta(idVenta);
  return mapearVenta(actualizada);
}

/**
 * RF-VEN-03: datos para el comprobante PDF de la venta.
 */
async function obtenerDatosComprobante(idVenta) {
  const venta = await obtenerVenta(idVenta);
  return {
    idVenta: venta.idVenta,
    numeroReserva: venta.numeroReserva,
    idReserva: venta.idReserva,
    cliente: venta.nombreCliente,
    paquete: venta.nombrePaquete,
    fechaVenta: venta.fechaVenta,
    metodoPago: venta.metodoPago,
    estadoVenta: venta.estadoVenta,
    monto: venta.monto
  };
}

const CAMPOS_SELECT = `v.id_venta, v.id_reserva, r.numero_reserva, r.id_cliente,
                       CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente, r.id_paquete, p.nombre_paquete,
                       v.monto, v.fecha_venta, v.metodo_pago, v.estado_venta, v.comprobante_ruta, v.fecha_modificacion`;

async function listar({ estado, fechaDesde, fechaHasta, pagina, limite, desplazamiento }) {
  const condiciones = [];
  const parametros = [];

  if (estado) {
    condiciones.push('v.estado_venta = ?');
    parametros.push(estado);
  }
  if (fechaDesde) {
    condiciones.push('DATE(v.fecha_venta) >= ?');
    parametros.push(fechaDesde);
  }
  if (fechaHasta) {
    condiciones.push('DATE(v.fecha_venta) <= ?');
    parametros.push(fechaHasta);
  }

  const donde = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM ventas v
       INNER JOIN reservas r ON r.id_reserva = v.id_reserva
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
       ${donde}
       ORDER BY v.id_venta DESC
       LIMIT ? OFFSET ?`,
    [...parametros, limite, desplazamiento]
  );

  const [conteo] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM ventas v
       INNER JOIN reservas r ON r.id_reserva = v.id_reserva
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
       ${donde}`,
    parametros
  );

  return { filas, total: conteo[0].total };
}

async function obtenerPorId(idVenta) {
  const [filas] = await pool.query(
    `SELECT ${CAMPOS_SELECT}
       FROM ventas v
       INNER JOIN reservas r ON r.id_reserva = v.id_reserva
       INNER JOIN clientes c ON c.id_cliente = r.id_cliente
       INNER JOIN paquetes_turisticos p ON p.id_paquete = r.id_paquete
      WHERE v.id_venta = ?`,
    [idVenta]
  );
  return filas[0] || null;
}

async function obtenerPorReserva(idReserva) {
  const [filas] = await pool.query('SELECT * FROM ventas WHERE id_reserva = ?', [idReserva]);
  return filas[0] || null;
}

async function crear({ idReserva, monto, metodoPago, estadoVenta, comprobanteRuta = null }, conexion = null) {
  const ejecutor = conexion || pool;
  const [resultado] = await ejecutor.query(
    `INSERT INTO ventas (id_reserva, monto, metodo_pago, estado_venta, comprobante_ruta)
     VALUES (?, ?, ?, ?, ?)`,
    [idReserva, monto, metodoPago, estadoVenta, comprobanteRuta]
  );
  return resultado.insertId;
}

async function actualizarEstado(idVenta, { estadoVenta, comprobanteRuta = null }, conexion = null) {
  const ejecutor = conexion || pool;
  await ejecutor.query('UPDATE ventas SET estado_venta = ?, comprobante_ruta = COALESCE(?, comprobante_ruta) WHERE id_venta = ?', [
    estadoVenta,
    comprobanteRuta,
    idVenta
  ]);
}

module.exports = {
  listarVentas,
  obtenerVenta,
  crearVenta,
  registrarPago,
  cancelarVenta,
  obtenerDatosComprobante,
  datos: { obtenerPorReserva }
};
