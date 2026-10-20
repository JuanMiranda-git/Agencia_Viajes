# Diccionario de nombres - Backend TourManager

Criterio C11: código en español, nombres en `camelCase`, base de datos en
`snake_case`, y este diccionario agrupado por módulo/entidad.

## 1. Convenciones

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos | Español, `camelCase` con sufijo de capa | `reservasControlador.js`, `reservasServicio.js`, `reservasRutas.js`, `reservasValidador.js` |
| Clases de dominio | `PascalCase` | `Reserva`, `PaqueteTuristico` |
| Variables y funciones | `camelCase` en español | `confirmarReserva`, `numeroReserva` |
| Tablas y columnas (MySQL) | `snake_case` en español | `paquetes_turisticos`, `num_pasajeros` |
| Constantes | `MAYUSCULAS_CON_GUION_BAJO` | `ROL_ADMINISTRADOR` |
| Interfaz Express | `req`, `res`, `next` (se mantienen en inglés por ser API estándar) | `req.body`, `res.status` |

## 2. Entidades de dominio (modelo ↔ tabla)

| Modelo (`models/`) | Tabla MySQL | Descripción | Métodos de dominio |
|--------------------|-------------|-------------|--------------------|
| `Rol` | `roles` | Rol de acceso (Administrador, Cliente) | `aJSON()` |
| `Modulo` | `modulos` | Permiso asignable a un rol | `aJSON()` |
| `Usuario` | `usuarios` | Usuario del sistema; nunca expone contraseña | `estaActivo()`, `esAdministrador()`, `aJSON()` |
| `Cliente` | `clientes` | Cliente de la agencia (Ley 1581) | `nombreCompleto()`, `dioConsentimiento()`, `aJSON()` |
| `Proveedor` | `proveedores` | Empresa proveedora | `esDeTransporte()`, `aJSON()` |
| `ServicioProveedor` | `servicios_proveedor` | Servicio ofrecido por un proveedor | `aJSON()` |
| `Contrato` | `contratos` | Contrato con proveedor (RN-02) | `estaVigente(fecha)`, `aJSON()` |
| `Otrosi` | `contratos_otrosi` | Modificación de contrato con historial | `aJSON()` |
| `PaqueteTuristico` | `paquetes_turisticos` | Paquete turístico vendible | `estaActivo()`, `estaDisponiblePara(fechaViaje)`, `aJSON()` |
| `ServicioPaquete` | `servicios_paquete` (+ `PAQUETE_SERVICIO`) | Servicio incluido en un paquete | `aJSON()` |
| `Itinerario` | `itinerarios` | Actividad programada de un paquete | `estaActivo()`, `aJSON()` |
| `Reserva` | `reservas` | Reserva de un paquete por un cliente | `calcularTotal(precio, pasajeros)`, `puedeTransicionarA()`, `confirmar(numero)`, `cancelar()`, `esDeCliente(id)`, `aJSON()` |
| `Venta` | `ventas` | Venta asociada a una reserva confirmada | `validarReservaConfirmada()`, `validarMontoContraReserva()`, `marcarPagada()`, `cancelar()`, `aJSON()` |
| `Pago` | (objeto de valor, no tabla) | Intento de pago de una venta | `procesar()`, `estaPagado()`, `aJSON()` |
| `Transporte` | `transporte` | Medio de transporte asignado a un paquete | `estaDisponible()`, `aJSON()` |
| `InteraccionCrm` | `crm` | Interacción con un cliente | `aJSON()` |
| `Retroalimentacion` | `retroalimentacion` | Calificación (1-5) de un paquete | `aJSON()` |
| `TokenRecuperacion` | `tokens_recuperacion_clave` | Token de un solo uso para restablecer clave | `estaVigente(fecha)`, `aJSON()` |
| `comun.js` | - | Validadores de campos compartidos | `validarTexto`, `validarEmail`, `validarEntero`, `validarDecimal`, `validarEnumeracion`, `validarFecha` |

## 3. Estados y enumeraciones

| Entidad | Campo | Valores |
|---------|-------|---------|
| `Rol`, `Modulo`, `Usuario`, `PaqueteTuristico`, `Itinerario` | estado | `Activo`, `Inactivo` |
| `Contrato` | `estadoContrato` | `Vigente`, `Vencido`, `Cancelado` |
| `Transporte` | `estadoTransporte` | `Disponible`, `No Disponible`, `Mantenimiento` |
| `Transporte` | `tipoTransporte` | `Avion`, `Autobus`, `Tren`, `Ferry`, `Coche` |
| `Reserva` | `estadoReserva` | `Pendiente` → `Confirmada` → `Cancelada` (transiciones controladas) |
| `Venta` | `estadoVenta` | `Pendiente` → `Pagado` → `Cancelado` |
| `Venta`/`Pago` | `metodoPago` | `Tarjeta`, `Transferencia`, `Efectivo` |
| `Proveedor` | `tipoServicio` | `Hotel`, `Aerolinea`, `Guia`, `Restaurante`, `Transporte`, `Otro` |
| `ServicioPaquete` | `tipoServicio` | `Transporte`, `Hospedaje`, `Actividad`, `Seguro`, `Comida` |
| `InteraccionCrm` | `tipoInteraccion` | `Llamada`, `Correo`, `Reunion`, `Encuesta` |
| Roles de acceso (SRS 2.3) | `nombreRol` | `Administrador`, `Cliente` |

## 4. Formato de respuestas y errores

| Elemento | Estructura |
|----------|------------|
| Éxito simple | `{ "exito": true, "datos": {...} }` |
| Éxito con mensaje | `{ "exito": true, "mensaje": "...", "datos": {...} }` |
| Listados | `{ "exito": true, "datos": [...], "paginacion": { pagina, limite, total, totalPaginas } }` |
| Error | `{ "exito": false, "error": { "codigo": "...", "mensaje": "...", "detalles": [...] } }` |

| Código de error | HTTP | Significado |
|-----------------|------|-------------|
| `SOLICITUD_INVALIDA` | 400 | Falló la validación de entrada (incluye `detalles` por campo) |
| `NO_AUTENTICADO` | 401 | Falta token, token inválido o expirado |
| `PROHIBIDO` | 403 | El rol o el propietario no tiene permiso |
| `RECURSO_NO_ENCONTRADO` | 404 | El recurso solicitado no existe |
| `RUTA_NO_ENCONTRADA` | 404 | La ruta no está registrada |
| `CONFLICTO` / `DUPLICADO` | 409 | Valor único duplicado (correo, documento, número de contrato/otrosí) |
| `REGLA_NEGOCIO` | 422 | Violación de regla de negocio (cupo, transición, contrato vigente, Ley 1581) |
| `DEMASIADAS_PETICIONES` / `DEMASIADOS_INTENTOS` | 429 | Rate limiting global / de autenticación |
| `ERROR_INTERNO` | 500 | Error inesperado (sin trazas al cliente) |
| `BD_NO_DISPONIBLE` | 503 | MySQL no disponible |

## 5. Configuración y utilidades (`config/`, `utils/`)

| Archivo | Exporta | Descripción |
|---------|---------|-------------|
| `config/entorno.js` | `entorno` | Lectura y validación de variables de entorno (falla si `JWT_CLAVE` < 16) |
| `config/baseDatos.js` | `pool`, `probarConexion`, `ejecutarTransaccion`, `cerrarPool` | Pool mysql2/promise, transacciones y apagado |
| `config/registro.js` | `registro` | Logger Winston (`logs/error.log`, `logs/combinado.log`, consola) |
| `utils/ErrorApi.js` | `ErrorApi` | Error de aplicación con estado HTTP y código (`solicitudInvalida`, `noAutenticado`, `prohibido`, `noEncontrado`, `conflicto`, `reglaNegocio`, `interno`) |
| `utils/jwt.js` | `firmarToken`, `verificarToken` | Firma/verificación JWT (carga: `sub`, `correo`, `nombreUsuario`, `rol`) |
| `utils/claves.js` | `hashearClave`, `compararClave` | bcryptjs con 12 rondas |
| `utils/paginacion.js` | `normalizarPaginacion`, `metadatosPaginacion` | Parámetros `pagina`/`limite` (10 por defecto, máximo 100) |
| `utils/respuesta.js` | `responderExito`, `responderCreado`, `responderLista`, `responderMensaje` | Formato uniforme de respuestas |
| `utils/numeroReserva.js` | `generarNumeroReserva` | Genera `AV-YYYYMMDD-XXXX` (alfabeto sin caracteres ambiguos) |
| `utils/pdfComprobante.js` | `enviarComprobanteReserva`, `enviarComprobanteVenta`, `formatearCOP` | Comprobantes PDF (PDFKit) y formato COP `$1.234.567` |
| `utils/manejadorAsincrono.js` | `manejadorAsincrono` | Envuelve controladores async hacia el manejador central |

## 6. Middleware (`middleware/`)

| Archivo | Middleware | Descripción |
|---------|------------|-------------|
| `autenticacion.js` | `verificarAutenticacion`, `autorizarRoles`, `soloAdministrador`, `administradorOCliente` | JWT + RBAC |
| `validacion.js` | `validar(fuente)` | Validación Joi de `body`/`query`/`params` |
| `saneamiento.js` | `saneamiento` | Recorta textos y elimina bytes nulos |
| `limitadores.js` | `limitadorGlobal`, `limitadorAutenticacion` | Rate limiting (300/15 min global; 20/15 min auth) |
| `registroPeticiones.js` | `registroPeticiones` | `X-Request-Id` + log de acceso |
| `manejadorErrores.js` | `rutaNoEncontrada`, `manejadorErrores` | 404 y traducción central de errores |

## 7. Capas y módulos (`controllers/`, `services/`, `routes/`, `validators/`)

Cada módulo de negocio tiene controlador, servicio, rutas y validador (cuando
aplica). El SQL parametrizado vive dentro de su servicio, no en una capa aparte.

| Módulo | Controlador | Servicio (incluye SQL) | Rutas | Validador |
|--------|-------------|------------------------|-------|-----------|
| Roles | `rolesControlador.js` | `rolesServicio.js` | `rolesRutas.js` | `rolesValidador.js` |
| Usuarios | `usuariosControlador.js` | `usuariosServicio.js` | `usuariosRutas.js` | `usuariosValidador.js` |
| Autenticación | `autenticacionControlador.js` | `autenticacionServicio.js` | `autenticacionRutas.js` | `autenticacionValidador.js` |
| Clientes | `clientesControlador.js` | `clientesServicio.js` | `clientesRutas.js` | `clientesValidador.js` |
| Proveedores | `proveedoresControlador.js` | `proveedoresServicio.js` | `proveedoresRutas.js` | `proveedoresValidador.js` |
| Contratos | `contratosControlador.js` | `contratosServicio.js` | `contratosRutas.js` | `contratosValidador.js` |
| Paquetes | `paquetesControlador.js` | `paquetesServicio.js` | `paquetesRutas.js` | `paquetesValidador.js` |
| Itinerarios | `itinerariosControlador.js` | `itinerariosServicio.js` | `itinerariosRutas.js` | `itinerariosValidador.js` |
| Reservas | `reservasControlador.js` | `reservasServicio.js` | `reservasRutas.js` | `reservasValidador.js` |
| Ventas | `ventasControlador.js` | `ventasServicio.js` | `ventasRutas.js` | `ventasValidador.js` |
| Transporte | `transporteControlador.js` | `transporteServicio.js` | `transporteRutas.js` | `transporteValidador.js` |
| CRM | `crmControlador.js` | `crmServicio.js` | `crmRutas.js` | `crmValidador.js` |
| Retroalimentación | `retroalimentacionControlador.js` | `retroalimentacionServicio.js` | `retroalimentacionRutas.js` | `retroalimentacionValidador.js` |
| Informes | `informesControlador.js` | `informesServicio.js` | `informesRutas.js` | - |
| Bitácora | `bitacoraControlador.js` | `bitacoraServicio.js` | `bitacoraRutas.js` | - |
| Módulos | `modulosControlador.js` | `modulosServicio.js` | `modulosRutas.js` | - |
| Salud | `saludControlador.js` | - | `saludRutas.js` | - |

Reglas de capas (C3):
1. Las rutas solo enlazan validación + middleware + controlador.
2. Los controladores solo traducen HTTP ↔ servicio (sin SQL, sin reglas).
3. Los servicios contienen las reglas de negocio, las transacciones y el SQL
   parametrizado de su dominio (sin `req`/`res`).
4. Cuando un servicio necesita SQL de otro dominio, consume las funciones
   internas que el servicio dueño expone en `datos` (por ejemplo
   `bitacoraServicio.datos.registrar`).

## 8. Variables de entorno (`.env` / `.env.example`)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PUERTO` | Puerto HTTP | `3000` |
| `BD_HOST`, `BD_PUERTO` | Host y puerto de MySQL | `localhost`, `3306` |
| `BD_USUARIO`, `BD_CLAVE`, `BD_NOMBRE` | Credenciales y esquema | - , - , `tourmanager` |
| `BD_POOL_MAX`, `BD_POOL_MIN` | Tamaño del pool | `10`, `0` |
| `JWT_CLAVE` | Secreto de firma (mínimo 16 caracteres) | - (obligatorio) |
| `JWT_EXPIRACION` | Vigencia del token | `8h` |
| `CORS_ORIGENES` | Orígenes permitidos (separados por coma) | `http://localhost:5500,http://127.0.0.1:5500` |
| `LOG_NIVEL` | Nivel de registro | `info` |

## 9. Parámetros de consulta comunes

| Parámetro | Uso | Notas |
|-----------|-----|-------|
| `pagina` | Número de página | Entero ≥ 1, por defecto 1 |
| `limite` | Tamaño de página | Entero 1-100, por defecto 10 |
| `nombre`, `correo`, `estado` | Filtros de listado | Según módulo (usuarios, clientes, proveedores, paquetes, roles) |
| `fechaDesde`, `fechaHasta` | Rangos de fecha | Reservas, ventas, contratos, informes (formato `AAAA-MM-DD`) |
| `idPaquete`, `idCliente`, `idProveedor` | Filtros por relación | Según módulo |

## 10. Tablas adicionales de la base de datos

| Tabla | Propósito |
|-------|-----------|
| `roles_modulos` | Asignación rol ↔ módulo (RF-ROL-07) |
| `bitacora` | Auditoría de operaciones (RNF-SEG-02) |
| `configuraciones` | Parámetros del sistema (`cupo_maximo_viaje`, `prefijo_reserva`) |
| `tokens_recuperacion_clave` | Tokens de recuperación de contraseña |
| `PAQUETE_SERVICIO` | Relación paquete ↔ servicio (nombre heredado del esquema original) |
