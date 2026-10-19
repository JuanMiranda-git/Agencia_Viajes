'use strict';

/**
 * Servicio de consulta de bitacora de auditoria (RNF-SEG-02).
 */

const { normalizarPaginacion, metadatosPaginacion } = require('../utils/paginacion');
const bitacoraRepositorio = require('../repositories/bitacoraRepositorio');

async function listarBitacora(consulta) {
  const { pagina, limite, desplazamiento } = normalizarPaginacion(consulta);
  const { filas, total } = await bitacoraRepositorio.listar({
    idUsuario: consulta.idUsuario,
    tablaAfectada: consulta.tablaAfectada,
    accion: consulta.accion,
    pagina,
    limite,
    desplazamiento
  });

  return {
    datos: filas.map((fila) => ({
      idBitacora: fila.id_bitacora,
      idUsuario: fila.id_usuario,
      nombreUsuario: fila.nombre_usuario,
      tablaAfectada: fila.tabla_afectada,
      idRegistro: fila.id_registro,
      accion: fila.accion,
      descripcion: fila.descripcion,
      fechaHora: fila.fecha_hora
    })),
    paginacion: metadatosPaginacion(total, pagina, limite)
  };
}

module.exports = { listarBitacora };
