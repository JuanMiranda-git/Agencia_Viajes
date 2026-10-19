'use strict';

/**
 * Error de aplicacion con codigo HTTP y codigo de negocio.
 * Los servicios y repositorios lanzan ErrorApi; el middleware central lo traduce.
 */

class ErrorApi extends Error {
  /**
   * @param {number} estado Codigo HTTP
   * @param {string} mensaje Mensaje en espanol para el cliente
   * @param {string} codigo Codigo interno legible (p. ej. RECURSO_NO_ENCONTRADO)
   * @param {Array<{campo?: string, mensaje: string}>} [detalles]
   */
  constructor(estado, mensaje, codigo = 'ERROR', detalles = undefined) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
    this.esOperacional = true;
    Error.captureStackTrace(this, ErrorApi);
  }

  static solicitudInvalida(mensaje = 'Solicitud invalida', detalles) {
    return new ErrorApi(400, mensaje, 'SOLICITUD_INVALIDA', detalles);
  }

  static noAutenticado(mensaje = 'No autenticado') {
    return new ErrorApi(401, mensaje, 'NO_AUTENTICADO');
  }

  static prohibido(mensaje = 'No tiene permisos para esta operacion') {
    return new ErrorApi(403, mensaje, 'PROHIBIDO');
  }

  static noEncontrado(mensaje = 'Recurso no encontrado') {
    return new ErrorApi(404, mensaje, 'RECURSO_NO_ENCONTRADO');
  }

  static conflicto(mensaje = 'Conflicto con el estado actual del recurso') {
    return new ErrorApi(409, mensaje, 'CONFLICTO');
  }

  static reglaNegocio(mensaje, detalles) {
    return new ErrorApi(422, mensaje, 'REGLA_NEGOCIO', detalles);
  }

  static interno(mensaje = 'Error interno del servidor') {
    return new ErrorApi(500, mensaje, 'ERROR_INTERNO');
  }
}

module.exports = ErrorApi;
