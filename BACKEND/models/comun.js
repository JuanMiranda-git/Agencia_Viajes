'use strict';

/**
 * Helpers de validacion compartidos por los modelos de dominio.
 * Los modelos son independientes de la base de datos y de Express.
 */

const ErrorApi = require('../utils/ErrorApi');

function validarTexto(valor, campo, { obligatorio = true, maximo = 255, minimo = 0 } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (obligatorio) {
      throw ErrorApi.solicitudInvalida(`El campo ${campo} es obligatorio`, [{ campo, mensaje: 'Campo obligatorio' }]);
    }
    return null;
  }
  if (typeof valor !== 'string') {
    throw ErrorApi.solicitudInvalida(`El campo ${campo} debe ser texto`, [{ campo, mensaje: 'Debe ser texto' }]);
  }
  if (valor.length < minimo) {
    throw ErrorApi.solicitudInvalida(`El campo ${campo} debe tener al menos ${minimo} caracteres`, [{ campo, mensaje: 'Longitud invalida' }]);
  }
  if (valor.length > maximo) {
    throw ErrorApi.solicitudInvalida(`El campo ${campo} supera el maximo de ${maximo} caracteres`, [{ campo, mensaje: 'Longitud invalida' }]);
  }
  return valor;
}

function validarEmail(valor, campo = 'email', { obligatorio = true } = {}) {
  const correo = validarTexto(valor, campo, { obligatorio, maximo: 150 });
  if (correo === null) return null;
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patron.test(correo)) {
    throw ErrorApi.solicitudInvalida(`El campo ${campo} no es un correo valido`, [{ campo, mensaje: 'Correo invalido' }]);
  }
  return correo;
}

function validarEntero(valor, campo, { obligatorio = true, minimo = 0, maximo = Number.MAX_SAFE_INTEGER } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (obligatorio) {
      throw ErrorApi.solicitudInvalida(`El campo ${campo} es obligatorio`, [{ campo, mensaje: 'Campo obligatorio' }]);
    }
    return null;
  }
  const numero = Number(valor);
  if (!Number.isInteger(numero)) {
    throw ErrorApi.solicitudInvalida(`El campo ${campo} debe ser un entero`, [{ campo, mensaje: 'Debe ser entero' }]);
  }
  if (numero < minimo || numero > maximo) {
    throw ErrorApi.solicitudInvalida(`El campo ${campo} debe estar entre ${minimo} y ${maximo}`, [{ campo, mensaje: 'Rango invalido' }]);
  }
  return numero;
}

function validarDecimal(valor, campo, { obligatorio = true, minimo = 0 } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (obligatorio) {
      throw ErrorApi.solicitudInvalida(`El campo ${campo} es obligatorio`, [{ campo, mensaje: 'Campo obligatorio' }]);
    }
    return null;
  }
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    throw ErrorApi.solicitudInvalida(`El campo ${campo} debe ser numerico`, [{ campo, mensaje: 'Debe ser numerico' }]);
  }
  if (numero < minimo) {
    throw ErrorApi.solicitudInvalida(`El campo ${campo} no puede ser menor que ${minimo}`, [{ campo, mensaje: 'Valor invalido' }]);
  }
  return numero;
}

function validarEnumeracion(valor, campo, permitidos, { obligatorio = true, defecto = null } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (obligatorio) {
      throw ErrorApi.solicitudInvalida(`El campo ${campo} es obligatorio`, [{ campo, mensaje: 'Campo obligatorio' }]);
    }
    return defecto;
  }
  if (!permitidos.includes(valor)) {
    throw ErrorApi.solicitudInvalida(
      `El campo ${campo} debe ser uno de: ${permitidos.join(', ')}`,
      [{ campo, mensaje: 'Valor no permitido' }]
    );
  }
  return valor;
}

function validarFecha(valor, campo, { obligatorio = true } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (obligatorio) {
      throw ErrorApi.solicitudInvalida(`El campo ${campo} es obligatorio`, [{ campo, mensaje: 'Campo obligatorio' }]);
    }
    return null;
  }
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) {
      throw ErrorApi.solicitudInvalida(`El campo ${campo} no es una fecha valida`, [{ campo, mensaje: 'Fecha invalida' }]);
    }
    return valor;
  }
  if (typeof valor === 'string' && !Number.isNaN(Date.parse(valor))) {
    return valor;
  }
  throw ErrorApi.solicitudInvalida(`El campo ${campo} no es una fecha valida`, [{ campo, mensaje: 'Fecha invalida' }]);
}

module.exports = {
  validarTexto,
  validarEmail,
  validarEntero,
  validarDecimal,
  validarEnumeracion,
  validarFecha
};
