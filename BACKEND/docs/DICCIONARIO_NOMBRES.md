# Diccionario de nombres - Backend TourManager

Criterio C11: dominio en espanol (`camelCase`), base de datos en `snake_case`,
sufijos de capa en ingles (`controller`, `service`, `routes`, `model`) y este
diccionario agrupado por modulo/entidad.

## 1. Convenciones

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| Archivos de capa | `modulo.controller.js`, `modulo.service.js`, `modulo.routes.js` | `reservas.controller.js` |
| Clases de dominio | `PascalCase` en espanol | `Reserva`, `PaqueteTuristico` |
| Clases de capa | `PascalCase` + sufijo espanol | `ReservasControlador`, `ReservasServicio` |
| Instancias exportadas | `camelCase` + sufijo ingles | `reservasController`, `reservasService` |
| Variables y funciones | `camelCase` en espanol | `confirmarReserva`, `numeroReserva` |
| Tablas y columnas MySQL | `snake_case` en espanol | `paquetes_turisticos`, `num_pasajeros` |
| Constantes | `MAYUSCULAS_CON_GUION_BAJO` | `ROL_ADMINISTRADOR` |
| Interfaz Express | `req`, `res`, `next` | `req.body`, `res.status` |
| Campos JSON de salida | `camelCase` | `idReserva`, `estadoReserva`, `fechaViaje` |

## 2. Entidades de dominio (modelo <-> tabla)

Todos los modelos extienden `ModeloBase`, guardan su estado en un campo privado
`#datos`, exponen getters de solo lectura y `aJSON()`/`toJSON()`.

| Modelo (`models/`) | Tabla MySQL | Descripcion | Metodos de dominio |
|--------------------|-------------|-------------|--------------------|
| `ModeloBase` | - | Base comun con `#datos` y copia inmutable | `aJSON()`, `toJSON()` |
| `Rol` | `roles` | Rol de acceso | `estaActivo()` |
| `Modulo` | `modulos` | Permiso asignable a un rol | `aJSON()` |
| `Usuario` | `usuarios` | Usuario del sistema; no expone contrasena | `estaActivo()`, `esAdministrador()` |
| `Cliente` | `clientes` | Cliente de la agencia (Ley 1581) | `nombreCompleto()`, `dioConsentimiento()` |
| `Proveedor` | `proveedores` | Empresa proveedora | `esDeTransporte()` |
| `ServicioProveedor` | `servicios_proveedor` | Servicio ofrecido por un proveedor | `aJSON()` |
| `Contrato` | `contratos` | Contrato con proveedor (RN-02) | `estaVigente(fecha)` |
| `Otrosi` | `contratos_otrosi` | Modificacion de contrato con historial | `aJSON()` |
| `PaqueteTuristico` | `paquetes_turisticos` | Paquete turistico vendible | `estaActivo()`, `estaDisponiblePara(fecha)` |
| `ServicioPaquete` | `servicios_paquete` + `PAQUETE_SERVICIO` | Servicio incluido en un paquete | `aJSON()` |
| `Itinerario` | `itinerarios` | Actividad programada de un paquete | `estaActivo()` |
| `Reserva` | `reservas` | Reserva de un paquete por un cliente | `Reserva.calcularTotal(precio, pasajeros)`, `puedeTransicionarA()`, `confirmar(numero)`, `cancelar()`, `esDeCliente(id)` |
| `Venta` | `ventas` | Venta asociada a una reserva confirmada | `validarReservaConfirmada()`, `validarMontoContraReserva()`, `pagar()`, `cancelar()` |
| `Pago` | (objeto de valor) | Intento de pago de una venta | `procesar()`, `estaPagado()` |
| `Transporte` | `transporte` | Medio de transporte asignado a un paquete | `estaDisponible()` |
| `InteraccionCrm` | `crm` | Interaccion con un cliente | `aJSON()` |
| `Retroalimentacion` | `retroalimentacion` | Calificacion (1-5) de un paquete | `aJSON()` |
| `TokenRecuperacion` | `tokens_recuperacion_clave` | Token de un solo uso | `estaVigente(fecha)` |
| `comun.js` | - | Validadores compartidos | `validarTexto`, `validarEmail`, `validarEntero`, `validarDecimal`, `validarEnumeracion`, `validarFecha` |

## 3. Estados y enumeraciones

| Entidad | Campo | Valores |
|---------|-------|---------|
| `Rol`, `Modulo`, `Usuario`, `PaqueteTuristico`, `Itinerario` | estado | `Activo`, `Inactivo` |
| `Contrato` | `estadoContrato` | `Vigente`, `Vencido`, `Cancelado` |
| `Transporte` | `estadoTransporte` | `Disponible`, `No Disponible`, `Mantenimiento` |
| `Transporte` | `tipoTransporte` | `Avion`, `Autobus`, `Tren`, `Ferry`, `Coche` |
| `Reserva` | `estadoReserva` | `Pendiente` -> `Confirmada` -> `Cancelada` |
| `Venta` | `estadoVenta` | `Pendiente` -> `Pagado` -> `Cancelado` |
| `Venta`/`Pago` | `metodoPago` | `Tarjeta`, `Transferencia`, `Efectivo` |
| `Proveedor` | `tipoServicio` | `Hotel`, `Aerolinea`, `Guia`, `Restaurante`, `Transporte`, `Otro` |
| `ServicioPaquete` | `tipoServicio` | `Transporte`, `Hospedaje`, `Actividad`, `Seguro`, `Comida` |
| `InteraccionCrm` | `tipoInteraccion` | `Llamada`, `Correo`, `Reunion`, `Encuesta` |
| Usuario | `nombreRol` | `Administrador`, `Cliente` |

## 4. Formato de respuestas y errores

| Elemento | Estructura |
|----------|------------|
| Exito simple | `{ "ok": true, "mensaje": "...", "datos": {...} }` |
| Listado | `{ "ok": true, "mensaje": "...", "datos": [...], "meta": { "paginacion": {...} } }` |
| Error | `{ "ok": false, "codigo": "...", "mensaje": "...", "detalles": [...] }` |

| Codigo de error | HTTP | Significado |
|-----------------|------|-------------|
| `SOLICITUD_INVALIDA` | 400 | Fallo la validacion de entrada (incluye `detalles` por campo) |
| `NO_AUTENTICADO` | 401 | Falta token, token invalido/expirado o sesion revocada |
| `PROHIBIDO` | 403 | El rol o el propietario no tiene permiso |
| `RECURSO_NO_ENCONTRADO` | 404 | El recurso solicitado no existe |
| `RUTA_NO_ENCONTRADA` | 404 | La ruta no esta registrada |
| `CONFLICTO` / `DUPLICADO` | 409 | Valor unico duplicado |
| `REGLA_NEGOCIO` | 422 | Violacion de regla de negocio |
| `DEMASIADAS_PETICIONES` / `DEMASIADOS_INTENTOS` | 429 | Rate limiting global / autenticacion |
| `ERROR_INTERNO` | 500 | Error inesperado (sin trazas al cliente) |
| `BD_NO_DISPONIBLE` | 503 | MySQL no disponible |

## 5. Configuracion, utilidades y middleware

| Archivo | Exporta | Descripcion |
|---------|---------|-------------|
| `config/entorno.js` | `entorno` | Variables de entorno validadas; falla si `JWT_CLAVE` < 16 |
| `config/database.js` | `pool`, `ejecutar`, `ejecutarEn`, `obtenerUno`, `obtenerTodos`, `probarConexion`, `conTransaccion`, `cerrarPool` | Pool MySQL, helpers de consulta, transacciones y apagado |
| `config/express.js` | `crearApp` | Middleware global, rutas, 404 y manejador de errores |
| `config/registro.js` | `registro` | Logger Winston |
| `utils/AppError.js` | `AppError` | Error operacional con estado HTTP y codigo |
| `utils/capturarAsync.js` | `capturarAsync` | Envuelve handlers async y delega errores a `next` |
| `utils/jwt.js` | `firmarToken`, `verificarToken` | JWT con `sub`, `jti`, `correo`, `nombreUsuario`, `rol` |
| `utils/claves.js` | `hashearClave`, `compararClave` | bcryptjs con 12 rondas |
| `utils/paginacion.js` | `normalizarPaginacion`, `metadatosPaginacion` | `pagina`/`limite` (10 por defecto, maximo 100) |
| `utils/respuesta.js` | `responderExito`, `responderCreado`, `responderLista`, `responderMensaje` | Envelope C4 |
| `utils/numeroReserva.js` | `generarNumeroReserva` | Genera `AV-YYYYMMDD-XXXX` |
| `utils/pdfComprobante.js` | `enviarComprobanteReserva`, `enviarComprobanteVenta`, `formatearCOP` | Comprobantes PDF y COP |
| `middleware/autenticacion.js` | `verificarAutenticacion`, `autorizarRoles`, `soloAdministrador`, `administradorOCliente` | JWT + RBAC + revocacion |
| `middleware/validacion.js` | `validar(fuente)` | Validacion Joi de `body`/`query`/`params` |
| `middleware/errorHandler.js` | `rutaNoEncontrada`, `manejarErrores` | 404 y traduccion central de errores |
| `middleware/saneamiento.js` | `saneamiento` | Recorta textos y elimina bytes nulos |
| `middleware/limitadores.js` | `limitadorGlobal`, `limitadorAutenticacion` | Rate limiting |
| `middleware/registroPeticiones.js` | `registroPeticiones` | `X-Request-Id` + log de acceso |

## 6. Capas y modulos

Cada modulo tiene controlador, servicio, rutas y validador. Los controladores y
servicios exportan una instancia singleton de su clase.

| Modulo | Controlador | Servicio | Rutas | Validador |
|--------|-------------|----------|-------|-----------|
| Roles | `roles.controller.js` | `roles.service.js` | `roles.routes.js` | `rolesValidador.js` |
| Usuarios | `usuarios.controller.js` | `usuarios.service.js` | `usuarios.routes.js` | `usuariosValidador.js` |
| Autenticacion | `autenticacion.controller.js` | `autenticacion.service.js` | `autenticacion.routes.js` | `autenticacionValidador.js` |
| Clientes | `clientes.controller.js` | `clientes.service.js` | `clientes.routes.js` | `clientesValidador.js` |
| Proveedores | `proveedores.controller.js` | `proveedores.service.js` | `proveedores.routes.js` | `proveedoresValidador.js` |
| Contratos | `contratos.controller.js` | `contratos.service.js` | `contratos.routes.js` | `contratosValidador.js` |
| Paquetes | `paquetes.controller.js` | `paquetes.service.js` | `paquetes.routes.js` | `paquetesValidador.js` |
| Itinerarios | `itinerarios.controller.js` | `itinerarios.service.js` | `itinerarios.routes.js` | `itinerariosValidador.js` |
| Reservas | `reservas.controller.js` | `reservas.service.js` | `reservas.routes.js` | `reservasValidador.js` |
| Ventas | `ventas.controller.js` | `ventas.service.js` | `ventas.routes.js` | `ventasValidador.js` |
| Transporte | `transporte.controller.js` | `transporte.service.js` | `transporte.routes.js` | `transporteValidador.js` |
| CRM | `crm.controller.js` | `crm.service.js` | `crm.routes.js` | `crmValidador.js` |
| Retroalimentacion | `retroalimentacion.controller.js` | `retroalimentacion.service.js` | `retroalimentacion.routes.js` | `retroalimentacionValidador.js` |
| Informes | `informes.controller.js` | `informes.service.js` | `informes.routes.js` | - |
| Modulos | `modulos.controller.js` | `modulos.service.js` | `modulos.routes.js` | - |
| Bitacora | `bitacora.controller.js` | `bitacora.service.js` | `bitacora.routes.js` | - |
| Sesiones | - | `sesiones.service.js` | - | - |
| Configuraciones | - | `configuraciones.service.js` | - | - |
| Salud | `salud.controller.js` | - | `salud.routes.js` | - |
