'use strict';

/**
 * Utilidades de paginacion para endpoints de listado.
 */

const LIMITE_POR_DEFECTO = 10;
const LIMITE_MAXIMO = 100;

/**
 * Normaliza los parametros `pagina` y `limite` del query string.
 */
function normalizarPaginacion(consulta = {}, opciones = {}) {
  const limitePorDefecto = opciones.limitePorDefecto || LIMITE_POR_DEFECTO;
  const limiteMaximo = opciones.limiteMaximo || LIMITE_MAXIMO;

  let pagina = Number.parseInt(consulta.pagina, 10);
  let limite = Number.parseInt(consulta.limite, 10);

  if (!Number.isInteger(pagina) || pagina < 1) pagina = 1;
  if (!Number.isInteger(limite) || limite < 1) limite = limitePorDefecto;
  if (limite > limiteMaximo) limite = limiteMaximo;

  return {
    pagina,
    limite,
    desplazamiento: (pagina - 1) * limite
  };
}

/**
 * Metadatos de paginacion para la respuesta JSON.
 */
function metadatosPaginacion(total, pagina, limite) {
  return {
    pagina,
    limite,
    total,
    totalPaginas: limite > 0 ? Math.ceil(total / limite) : 0
  };
}

module.exports = { normalizarPaginacion, metadatosPaginacion };
