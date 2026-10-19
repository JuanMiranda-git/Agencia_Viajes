'use strict';

/**
 * Servicio de retroalimentacion de clientes (RF-DES-01..03).
 */

const ErrorApi = require('../utils/ErrorApi');
const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const Retroalimentacion = require('../models/Retroalimentacion');
const retroalimentacionRepositorio = require('../repositories/retroalimentacionRepositorio');
const paquetesRepositorio = require('../repositories/paquetesRepositorio');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');
const clientesServicio = require('./clientesServicio');

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
  const paquete = await paquetesRepositorio.obtenerPorId(datos.idPaquete);
  if (!paquete) {
    throw ErrorApi.solicitudInvalida('El paquete indicado no existe', [
      { campo: 'idPaquete', mensaje: 'Paquete inexistente' }
    ]);
  }

  let idCliente;
  if (usuario.rol === 'Cliente') {
    idCliente = await clientesServicio.asegurarClienteDeUsuario(usuario, contexto);
  } else {
    if (!datos.idCliente) {
      throw ErrorApi.solicitudInvalida('Debe indicar el cliente de la retroalimentacion', [
        { campo: 'idCliente', mensaje: 'Campo obligatorio' }
      ]);
    }
    const cliente = await clientesServicio.obtenerCliente(datos.idCliente);
    idCliente = cliente.idCliente;
  }

  const retroalimentacion = new Retroalimentacion({
    idPaquete: datos.idPaquete,
    idCliente,
    calificacion: datos.calificacion,
    comentario: datos.comentario
  });

  const idRetroalimentacion = await retroalimentacionRepositorio.crear(retroalimentacion.aJSON());

  await bitacoraRepositorio.registrar({
    idUsuario: contexto.idUsuario,
    tablaAfectada: 'retroalimentacion',
    idRegistro: idRetroalimentacion,
    accion: 'Creacion',
    descripcion: `Calificacion ${retroalimentacion.calificacion}/5 registrada para el paquete ${datos.idPaquete}`
  });

  return { idRetroalimentacion };
}

async function listarRetroalimentacion(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await retroalimentacionRepositorio.listar({
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
  return retroalimentacionRepositorio.resumenPorPaquete();
}

module.exports = { crearRetroalimentacion, listarRetroalimentacion, resumenPorPaquete };
