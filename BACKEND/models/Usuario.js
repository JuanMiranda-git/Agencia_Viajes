'use strict';

/**
 * Entidad de dominio: Usuario del sistema (RF-USR-01..06).
 * La contrasena jamas se expone en aJSON().
 */

const { validarTexto, validarEmail, validarEntero, validarEnumeracion, validarFecha } = require('./comun');

const ESTADOS = ['Activo', 'Inactivo'];

class Usuario {
  constructor({
    idUsuario = null,
    nombreUsuario,
    email,
    contrasena = null,
    documento,
    telefono = null,
    idRol,
    nombreRol = null,
    estadoUsuario = 'Activo',
    proveedoresIdProveedor = null,
    fechaRegistro = null,
    fechaModificacion = null
  } = {}) {
    this.idUsuario = validarEntero(idUsuario, 'idUsuario', { obligatorio: false, minimo: 1 });
    this.nombreUsuario = validarTexto(nombreUsuario, 'nombreUsuario', { maximo: 100 });
    this.email = validarEmail(email, 'email');
    this.contrasena = validarTexto(contrasena, 'contrasena', { obligatorio: false, maximo: 255 });
    this.documento = validarTexto(documento, 'documento', { maximo: 20 });
    this.telefono = validarTexto(telefono, 'telefono', { obligatorio: false, maximo: 20 });
    this.idRol = validarEntero(idRol, 'idRol', { minimo: 1 });
    this.nombreRol = validarTexto(nombreRol, 'nombreRol', { obligatorio: false, maximo: 80 });
    this.estadoUsuario = validarEnumeracion(estadoUsuario, 'estadoUsuario', ESTADOS, { defecto: 'Activo' });
    this.proveedoresIdProveedor = validarEntero(proveedoresIdProveedor, 'proveedoresIdProveedor', { obligatorio: false, minimo: 1 });
    this.fechaRegistro = validarFecha(fechaRegistro, 'fechaRegistro', { obligatorio: false });
    this.fechaModificacion = validarFecha(fechaModificacion, 'fechaModificacion', { obligatorio: false });
  }

  estaActivo() {
    return this.estadoUsuario === 'Activo';
  }

  esAdministrador() {
    return this.nombreRol === 'Administrador';
  }

  aJSON() {
    return {
      idUsuario: this.idUsuario,
      nombreUsuario: this.nombreUsuario,
      email: this.email,
      documento: this.documento,
      telefono: this.telefono,
      idRol: this.idRol,
      nombreRol: this.nombreRol,
      estadoUsuario: this.estadoUsuario,
      proveedoresIdProveedor: this.proveedoresIdProveedor,
      fechaRegistro: this.fechaRegistro,
      fechaModificacion: this.fechaModificacion
    };
  }
}

Usuario.ESTADOS = ESTADOS;

module.exports = Usuario;
