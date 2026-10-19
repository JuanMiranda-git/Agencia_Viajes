# Matriz de trazabilidad - Backend TourManager

Criterio de aceptación C1: cobertura ≥ 80 % de los requerimientos funcionales (RF) del
SRS, 100 % de los RF núcleo (core) y justificación de lo excluido.

- Fuentes: `Agencia_Viajes_Contexto/SRS-Agencia_Viajes-v1.0.md` (50 RF),
  `historias-usuario-Agencia_Viajes.md`, matriz de historias y wireframes.
- Numeración `FR-xx` (01..50) = requerimientos funcionales del SRS en orden de sección.
- RF núcleo (core): FR-14, 15, 16, 19, 20, 22, 24, 30, 31, 33, 34, 35, 36, 42, 43, 44.
- Estados: **Implementado** | **Parcial** (con nota) | **Excluido** (con justificación).

## 4.1 Gestión de Roles

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-01 | RF-ROL-01 | Crear rol con nombre único, descripción y privilegios | Alta | No | `POST /api/v1/roles` | `rolesControlador.crear` | `rolesServicio.crearRol` | Implementado |
| FR-02 | RF-ROL-02 | Rechazar rol con nombre duplicado | Alta | No | `POST /api/v1/roles` (409) | `rolesControlador.crear` | `rolesServicio.crearRol` | Implementado |
| FR-03 | RF-ROL-03 | Editar nombre/permisos/estado sin duplicar nombre | Alta | No | `PUT /api/v1/roles/:id` | `rolesControlador.actualizar` | `rolesServicio.actualizarRol` | Implementado |
| FR-04 | RF-ROL-04 | Listar roles con usuarios asignados y filtro por nombre | Media | No | `GET /api/v1/roles?nombre=` | `rolesControlador.listar` | `rolesServicio.listarRoles` | Implementado |
| FR-05 | RF-ROL-05 | Activar/inactivar rol conservando historial | Alta | No | `PATCH /api/v1/roles/:id/estado` | `rolesControlador.cambiarEstado` | `rolesServicio.cambiarEstadoRol` | Implementado |
| FR-06 | RF-ROL-06 | Impedir inactivar rol con usuarios activos | Alta | No | `PATCH /api/v1/roles/:id/estado` (422) | `rolesControlador.cambiarEstado` | `rolesServicio.cambiarEstadoRol` | Implementado |
| FR-07 | RF-ROL-07 | Asignar/retirar y listar módulos de un rol | Alta | No | `GET/POST /api/v1/roles/:id/modulos`, `DELETE /api/v1/roles/:id/modulos/:idModulo`, `GET /api/v1/modulos` | `rolesControlador` | `rolesServicio` | Implementado |

## 4.2 Gestión de Usuarios

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-08 | RF-USR-01 | Crear usuario con correo único, documento, rol y teléfono | Alta | No | `POST /api/v1/usuarios` | `usuariosControlador.crear` | `usuariosServicio.crearUsuario` | Implementado |
| FR-09 | RF-USR-02 | Rechazar correo o documento duplicado | Alta | No | `POST /api/v1/usuarios` (409) | `usuariosControlador.crear` | `usuariosServicio.crearUsuario` | Implementado |
| FR-10 | RF-USR-03 | Listar usuarios con filtros por nombre/correo/estado | Media | No | `GET /api/v1/usuarios` | `usuariosControlador.listar` | `usuariosServicio.listarUsuarios` | Implementado |
| FR-11 | RF-USR-04 | Buscar usuario por nombre, documento o rol | Media | No | `GET /api/v1/usuarios?documento=&idRol=` | `usuariosControlador.listar` | `usuariosServicio.listarUsuarios` | Implementado |
| FR-12 | RF-USR-05 | Editar datos de un usuario | Alta | No | `PUT /api/v1/usuarios/:id` | `usuariosControlador.actualizar` | `usuariosServicio.actualizarUsuario` | Implementado |
| FR-13 | RF-USR-06 | Cambiar estado activo/inactivo sin eliminar | Alta | No | `PATCH /api/v1/usuarios/:id/estado` | `usuariosControlador.cambiarEstado` | `usuariosServicio.cambiarEstadoUsuario` | Implementado |

## 4.3 Gestión de Acceso

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-14 | RF-ACC-01 | Autenticación de Administrador y Cliente | Alta | **Sí** | `POST /api/v1/autenticacion/iniciar-sesion` | `autenticacionControlador.iniciarSesion` | `autenticacionServicio.iniciarSesion` | Implementado |
| FR-15 | RF-ACC-02 | Mensaje genérico con credenciales inválidas | Alta | **Sí** | `POST /api/v1/autenticacion/iniciar-sesion` (401) | `autenticacionControlador.iniciarSesion` | `autenticacionServicio.iniciarSesion` | Implementado |
| FR-16 | RF-ACC-03 | Cerrar sesión destruyendo la sesión | Alta | **Sí** | `POST /api/v1/autenticacion/cerrar-sesion` | `autenticacionControlador.cerrarSesion` | `autenticacionServicio.cerrarSesion` | Implementado |
| FR-17 | RF-ACC-04 | Solicitar recuperación con enlace al correo | Alta | No | `POST /api/v1/autenticacion/recuperar-clave` | `autenticacionControlador.solicitarRecuperacion` | `autenticacionServicio.solicitarRecuperacion` | Parcial: token de un solo uso con expiración; sin servicio SMTP contratado el token se retorna en la respuesta (documentado en README) |
| FR-18 | RF-ACC-05 | Restablecer contraseña con enlace válido | Alta | No | `POST /api/v1/autenticacion/restablecer-clave` | `autenticacionControlador.restablecerClave` | `autenticacionServicio.restablecerClave` | Implementado |
| FR-18b | RF-ACC (registro) | Registro público de cliente (HU_19/20, soporte al flujo Cliente) | Media | No | `POST /api/v1/autenticacion/registro` | `autenticacionControlador.registroCliente` | `autenticacionServicio.registrarCliente` | Implementado |

## 4.4 Gestión de Paquetes Turísticos

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-19 | RF-PAQ-01 | Crear paquete con nombre, descripción, precio y fechas | Alta | **Sí** | `POST /api/v1/paquetes` | `paquetesControlador.crear` | `paquetesServicio.crearPaquete` | Implementado |
| FR-20 | RF-PAQ-02 | Asociar servicios (Transporte, Hospedaje, Actividad, Seguro, Comida) | Alta | **Sí** | `POST /api/v1/paquetes/:id/servicios` | `paquetesControlador.agregarServicio` | `paquetesServicio.agregarServicioAPaquete` | Implementado |
| FR-21 | RF-PAQ-03 | Listar y buscar paquetes por nombre | Media | No | `GET /api/v1/paquetes?nombre=` | `paquetesControlador.listar` | `paquetesServicio.listarPaquetes` | Implementado |
| FR-22 | RF-PAQ-04 | Editar paquete y cambiar estado | Alta | **Sí** | `PUT /api/v1/paquetes/:id`, `PATCH /api/v1/paquetes/:id/estado` | `paquetesControlador` | `paquetesServicio` | Implementado |
| FR-23 | RF-PAQ-05 | Detalle del paquete con servicios asociados | Media | No | `GET /api/v1/paquetes/:id` | `paquetesControlador.obtener` | `paquetesServicio.obtenerPaquete` | Implementado |

## 4.5 Gestión de Itinerarios

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-24 | RF-ITI-01 | Crear itinerario (actividades y horarios) de un paquete | Alta | **Sí** | `POST /api/v1/paquetes/:id/itinerarios`, `POST /api/v1/itinerarios` | `itinerariosControlador.crear` | `itinerariosServicio.crearItinerario` | Implementado |
| FR-25 | RF-ITI-02 | Listar, buscar, editar y cambiar estado de itinerarios | Media | No | `GET /api/v1/itinerarios`, `PUT /api/v1/itinerarios/:id`, `PATCH /api/v1/itinerarios/:id/estado` | `itinerariosControlador` | `itinerariosServicio` | Implementado |
| FR-26 | RF-ITI-03 | Detalle del itinerario con actividades y horarios | Media | No | `GET /api/v1/itinerarios/:id`, `GET /api/v1/paquetes/:id/itinerarios` | `itinerariosControlador.obtener/listar` | `itinerariosServicio` | Implementado |

## 4.6 Gestión de Proveedores

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-27 | RF-PRO-01 | Registrar proveedor (empresa, tipo, contacto, ubicación) | Alta | No | `POST /api/v1/proveedores` | `proveedoresControlador.crear` | `proveedoresServicio.crearProveedor` | Implementado |
| FR-28 | RF-PRO-02 | Consultar y actualizar proveedor | Media | No | `GET/PUT /api/v1/proveedores/:id` | `proveedoresControlador` | `proveedoresServicio` | Implementado |
| FR-29 | RF-PRO-03 | Asociar servicios con precio y disponibilidad | Media | No | `GET/POST /api/v1/proveedores/:id/servicios` | `proveedoresControlador` | `proveedoresServicio` | Implementado |

## 4.7 Gestión de Contratos

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-30 | RF-CON-01 | Registrar contrato con proveedor | Alta | **Sí** | `POST /api/v1/contratos` | `contratosControlador.crear` | `contratosServicio.crearContrato` | Implementado |
| FR-31 | RF-CON-02 | Consultar contratos y su vigencia | Media | **Sí** | `GET /api/v1/contratos`, `GET /api/v1/contratos/:id` | `contratosControlador` | `contratosServicio` | Implementado |
| FR-32 | RF-CON-03 | Actualizar contrato mediante otrosí con historial | Media | No | `POST /api/v1/contratos/:id/otrosi`, `GET /api/v1/contratos/:id/otrosi` | `contratosControlador` | `contratosServicio.crearOtrosi` | Implementado |
| FR-33 | RF-CON-04 | Validar contrato activo/vigente de proveedor de transporte (RN-02) | Alta | **Sí** | `POST /api/v1/transporte` (422 si no hay contrato vigente) | `transporteControlador.crear` | `contratosServicio.obtenerContratoVigente` + `transporteServicio.crearTransporte` | Implementado |

## 4.8 Gestión de Reservas

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-34 | RF-RES-01 | Reservar paquete con fechas y número de pasajeros | Alta | **Sí** | `POST /api/v1/reservas` | `reservasControlador.crear` | `reservasServicio.crearReserva` | Parcial: reservas de paquetes; vuelo/hotel se modelan como servicios del paquete (supuesto S-5 sobre el esquema real, que no tiene tabla de vuelos) |
| FR-35 | RF-RES-02 | Notificación automática de confirmación al correo | Alta | **Sí** | `POST /api/v1/reservas/:id/confirmar` | `reservasControlador.confirmar` | `reservasServicio.confirmarReserva` | Parcial: la confirmación y el número AV-YYYYMMDD-XXXX quedan en el sistema; el envío de correo requiere proveedor SMTP no contratado (mismo vacío que FR-17) |
| FR-36 | RF-RES-03 | Supervisar estado de todas las reservas | Alta | **Sí** | `GET /api/v1/reservas`, `PATCH /api/v1/reservas/:id/estado` | `reservasControlador` | `reservasServicio` | Implementado |
| FR-37 | RF-RES-04 | Cliente consulta historial/estado de sus reservas | Alta | No | `GET /api/v1/reservas/mis-reservas` (filtro por rol) | `reservasControlador.listar` | `reservasServicio.listarReservas` | Implementado |
| FR-38 | RF-RES-05 | Descargar comprobante PDF de reserva confirmada | Media | No | `GET /api/v1/reservas/:id/comprobante` | `reservasControlador.comprobante` | `reservasServicio.obtenerDatosComprobante` | Implementado |

## 4.9 CRM

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-39 | RF-CRM-01 | Registrar interacciones (llamada, correo, reunión, encuesta) | Media | No | `POST /api/v1/crm/interacciones` | `crmControlador.crear` | `crmServicio.registrarInteraccion` | Implementado |
| FR-40 | RF-CRM-02 | Clasificar clientes según intereses/comportamiento | Media | No | `PUT /api/v1/clientes/:id` (categoría) | `clientesControlador.actualizar` | `clientesServicio.actualizarCliente` | Implementado |
| FR-41 | RF-CRM-03 | Historial completo de interacciones y reservas | Media | No | `GET /api/v1/crm/clientes/:id/historial`, `GET /api/v1/clientes/:id/historial` | `crmControlador.historial` | `crmServicio.obtenerHistorialCliente` | Implementado |

## 4.10 Gestión de Ventas

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-42 | RF-VEN-01 | Registrar venta asociada a reserva con monto y fecha | Alta | **Sí** | `POST /api/v1/ventas` (solo reserva confirmada) | `ventasControlador.crear` | `ventasServicio.crearVenta` | Implementado |
| FR-43 | RF-VEN-02 | Registrar método de pago de la venta | Alta | **Sí** | `POST /api/v1/ventas/:id/pago` | `ventasControlador.registrarPago` | `ventasServicio.registrarPago` | Implementado |
| FR-44 | RF-VEN-03 | Comprobante de pago descargable | Alta | **Sí** | `GET /api/v1/ventas/:id/comprobante` | `ventasControlador.comprobante` | `ventasServicio.obtenerDatosComprobante` | Implementado |
| FR-45 | RF-VEN-04 | Pago con tarjeta rechazado queda pendiente y reintentable | Alta | No | `POST /api/v1/ventas/:id/pago` (Tarjeta → Pendiente + motivo) | `ventasControlador.registrarPago` | `ventasServicio.registrarPago` + modelo `Pago` | Parcial: sin pasarela contratada (TBD-03) el pago con tarjeta queda Pendiente con motivo y permite reintentar con otro método; la integración real queda como TBD |

## 4.11 Gestión de Transporte

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-46 | RF-TRA-01 | Registrar transporte (tipo, proveedor, capacidad, precio, fechas) | Alta | No | `POST /api/v1/transporte` | `transporteControlador.crear` | `transporteServicio.crearTransporte` | Implementado |
| FR-47 | RF-TRA-02 | Consultar transportes asignados a paquetes | Media | No | `GET /api/v1/transporte?idPaquete=` | `transporteControlador.listar` | `transporteServicio.listarTransportes` | Implementado |

## 4.12 Medición de Desempeño

| FR | RF | Descripción | Prioridad | Core | Endpoints | Controlador | Servicio | Estado |
|----|----|-------------|-----------|------|-----------|-------------|----------|--------|
| FR-48 | RF-DES-01 | Recopilar retroalimentación de paquetes ejecutados | Media | No | `POST /api/v1/retroalimentacion` | `retroalimentacionControlador.crear` | `retroalimentacionServicio.crearRetroalimentacion` | Implementado |
| FR-49 | RF-DES-02 | Analizar retroalimentación para áreas de mejora | Media | No | `GET /api/v1/retroalimentacion/resumen`, `GET /api/v1/informes/desempeno` | `retroalimentacionControlador.resumen`, `informesControlador.desempeno` | `retroalimentacionServicio.resumenPorPaquete`, `informesServicio.obtenerDesempenoPorPaquete` | Implementado |
| FR-50 | RF-DES-03 | Informes de ejecución exportables para terceros | Media | No | `GET /api/v1/informes/desempeno`, `GET /api/v1/informes/ventas` | `informesControlador` | `informesServicio` | Parcial: los informes se entregan en JSON (agregados de reservas, ventas y calificaciones); la exportación a PDF/Excel no estaba en el alcance acordado |

## Extras fuera del SRS (soporte técnico)

| Módulo | Justificación | Endpoints |
|--------|---------------|-----------|
| Clientes (CRUD) | El esquema real de la BD lo exige para reservas; el SRS no define RF de CRUD de clientes | `GET/POST/PUT /api/v1/clientes` |
| Ley 1581 de 2012 | Criterio C8b: consentimiento, minimización, acceso/rectificación/supresión | `GET/PATCH/DELETE /api/v1/clientes/:id/datos-personales` |
| Bitácora | RNF-SEG-02 (auditoría de operaciones) | `GET /api/v1/bitacora` |
| Módulos (catálogo) | Soporte a RF-ROL-07 (permisos por módulo) | `GET /api/v1/modulos` |
| Salud | Criterio C8d (health check) para monitoreo y apagado controlado | `GET /api/v1/salud` |

## Resumen de cobertura

| Métrica | Valor |
|---------|-------|
| RF del SRS cubiertos (Implementado o Parcial) | 50 / 50 (100 %) |
| RF núcleo (core) cubiertos | 16 / 16 (100 %) |
| RF totalmente implementados | 46 / 50 |
| RF parciales con justificación | 4 (FR-17, FR-34, FR-35, FR-45, FR-50 según detalle) |
| Módulos extra de soporte | Clientes, Ley 1581, bitácora, módulos, salud |

Notas de los parciales:
1. FR-17 y FR-35 dependen de un proveedor SMTP no contratado; el flujo técnico
   (token de un solo uso con expiración, número de reserva y confirmación) sí está
   implementado y es verificable por API.
2. FR-34: el esquema de datos no modela vuelos/hoteles independientes; se siguió el
   supuesto S-5 (reservas solo de paquetes, con vuelo/hotel como servicios del paquete).
3. FR-45: sin pasarela de pago (TBD-03) el pago con tarjeta queda en Pendiente con
   motivo explícito y puede reintentarse con Transferencia o Efectivo.
4. FR-50: exportación JSON; formatos PDF/Excel no solicitados en el alcance acordado.
