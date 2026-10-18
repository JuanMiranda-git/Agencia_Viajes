## 1. Introducción

### 1.1 Propósito
Esta Especificación de Requerimientos de Software (SRS) define el comportamiento funcional y las restricciones no funcionales del **Sistema de Gestión de Operaciones Turísticas** para la agencia de viajes "Tours [Nombre por definir]" (Sabaneta, Antioquia). Cubre la totalidad del sistema: configuración, usuarios, paquetes turísticos, itinerarios, proveedores, contratos, reservas, CRM, ventas, transporte y medición de desempeño. Versión 1.0, basada en la Ficha de Proyecto, la documentación de casos de uso y la Matriz de Historias de Usuario del proyecto.

### 1.2 Convenciones del documento
- `RF-<CAR>-##` — requerimiento funcional, `<CAR>` identifica la característica (ver tabla de la sección 4).
- `RNF-<CAT>-##` — requerimiento no funcional. Categorías fijas: `REN` rendimiento, `SEG` seguridad informática, `PRI` privacidad, `SAF` seguridad física/safety, `USA` usabilidad, `CAL` calidad, `TEC` restricción tecnológica.
- `RN-##` — regla de negocio.
- Prioridad: **Alta** (sin esto el sistema no cumple su propósito), **Media** (utilizable con fricción manual), **Baja** (mejora postergable).
- "Debe" expresa obligación vinculante; no se usa "podrá" ni condicional para requerimientos.
- Los IDs no se reutilizan tras eliminarse un requerimiento.

### 1.3 Audiencia objetivo y sugerencias de lectura
- **Equipo de desarrollo**: secciones 3, 4 y 5 completas antes de diseñar.
- **QA**: secciones 4 (columna Verificación) y 5, y el archivo de historias de usuario para los criterios Given-When-Then.
- **Gerencia/cliente (agencia de viajes)**: secciones 1 y 2 para validar alcance y objetivos de negocio.
- **Instructores/evaluadores SENA**: sección 2.3 (clases de usuario), sección 4 (trazabilidad) y Apéndice C (TBD).

### 1.4 Alcance del producto
El sistema es una **aplicación web** que automatiza los procesos manuales actuales de la agencia: gestión de reservas, atención al cliente, control de proveedores, análisis de datos y planificación de transporte. Objetivo de negocio: reducir errores y duplicaciones en reservas, ofrecer atención 24/7, centralizar la gestión de proveedores/contratos y habilitar decisiones basadas en datos.

**Fuera de alcance en esta versión:** integración con pasarelas de pago de terceros más allá del registro del método de pago; aplicación móvil nativa (solo web responsive); traducción a otros idiomas; integración con sistemas de reservas de aerolíneas/hoteles externos (GDS).

### 1.5 Referencias
- Ficha de Proyecto — `1 Ficha Proyecto/Proyecto Agencia Viajes.docx`.
- Diagramas y documentación de casos de uso — `3 Casos de Uso y Documentación CU/`.
- Matriz de Historias de Usuario — `2 Matriz Historias de Usuario/Matriz Historias de Usuario Proyecto Agencia de Turismo.xlsx`.
- Script de base de datos — `4 Base de Datos/Bases de datos para la agencia de turismo sena.docx`.
- Wireframes ("TourManager") — `Wireframe/` (17 pantallas).
- Ley 1581 de 2012 (Colombia) — Régimen General de Protección de Datos Personales (Habeas Data).

## 2. Descripción general

### 2.1 Perspectiva del producto
Producto nuevo, autocontenido, que reemplaza procesos manuales (WhatsApp, hojas de cálculo, registros en papel) por una plataforma web única. No es componente de un sistema mayor; puede integrarse en el futuro con pasarelas de pago y proveedores externos, pero en v1.0 esas integraciones quedan fuera de alcance salvo el registro del método de pago.

### 2.2 Funciones del producto
- Configuración de roles y permisos.
- Gestión de usuarios y control de acceso.
- Gestión de paquetes turísticos e itinerarios.
- Gestión de proveedores y contratos.
- Gestión de reservas con confirmaciones automáticas.
- CRM: seguimiento y clasificación de clientes.
- Gestión de ventas (pagos, comprobantes).
- Planificación de transporte.
- Medición de desempeño de la agencia.

### 2.3 Clases de usuario y características

| Clase | Descripción | Frecuencia de uso | Privilegios | Importancia |
|---|---|---|---|---|
| Administrador | Personal de la agencia que configura el sistema y gestiona el negocio | Diaria | Acceso total a todos los módulos | Alta |
| Cliente | Persona que compra paquetes turísticos | Ocasional a frecuente | Reservas propias, su perfil, sus comprobantes | Alta |

### 2.4 Ambiente de operación
Aplicación web responsive, accesible desde navegadores modernos (Chrome, Firefox, Edge, Safari, últimas 2 versiones mayores) en escritorio y móvil. Backend y base de datos relacional (MySQL, según el script de la sección 4 del documento fuente) alojados en un servidor o servicio en la nube con disponibilidad 24/7.

### 2.5 Restricciones de diseño e implementación
- `RNF-TEC-01` — El modelo de datos debe implementarse sobre un motor relacional compatible con el script SQL ya definido (tablas `Usuarios`, `Clientes`, `Reservas`, `Paquetes_Turisticos`, `Servicios_Paquete`, `CRM`, `Proveedores`, `Servicios_Proveedor`, `Ventas`, `Transporte`, `Configuraciones`).
- `RNF-TEC-02` — La interfaz debe seguir el diseño ya validado en los wireframes (marca "TourManager": sidebar de navegación, breadcrumbs, tablas de listado con acciones, paneles de detalle).
- El diseño debe mantenerse libre de tecnología de implementación específica (framework, lenguaje) salvo que el cliente la exija; esta versión no impone ninguna.

### 2.6 Documentación de usuario
Se entrega, además de este SRS: manual de usuario (para Administrador y Cliente) y manual técnico, conforme a los "Resultados Esperados" de la Ficha de Proyecto. Formato: PDF/Word, distribuido junto con el aplicativo.

### 2.7 Supuestos y dependencias
- **Supuesto:** el nombre comercial y los datos de contacto de la agencia ("Tours [Nombre por definir]") se definirán antes de producción; no bloquea el desarrollo. Ver TBD-01.
- **Supuesto:** los proveedores (hoteles, aerolíneas, guías) no tendrán acceso directo al sistema en v1.0; su información la administra el Administrador.
- **Dependencia:** el envío de confirmaciones automáticas y notificaciones depende de un servicio de correo electrónico transaccional (proveedor por definir, ver TBD-02).
- **Dependencia:** el procesamiento de pagos con tarjeta depende de una pasarela de pago externa (proveedor por definir, ver TBD-03); si no se contrata, `RF-VEN-03` se limita a efectivo/transferencia.

## 3. Requerimientos de interfaz externa

### 3.1 Interfaces de usuario
Los wireframes en `Wireframe/` (17 pantallas) son la referencia de diseño lógico: sidebar con Dashboard, Usuarios, Roles, Módulos, Configuración y Reportes; breadcrumbs en cada pantalla; tablas de listado con acciones ver/editar/cambiar estado; formularios con validación en línea y mensajes de error junto al campo. Todo mensaje de error debe indicar la causa y la acción correctiva. Flujo de autenticación estándar: login, recuperar contraseña (envío de enlace), crear nueva contraseña, confirmación.

### 3.2 Interfaces de hardware
No aplica: el sistema no interactúa con hardware especializado más allá del equipo cliente estándar (computador o móvil con navegador).

### 3.3 Interfaces de software
- Motor de base de datos relacional (según script SQL de la sección 4 del documento fuente).
- Servicio de correo saliente (SMTP o API transaccional) para confirmaciones de reserva y recuperación de contraseña — proveedor TBD-02.
- Pasarela de pago externa para tarjeta de crédito — proveedor TBD-03; en su ausencia, el sistema opera con transferencia y efectivo.

### 3.4 Interfaces de comunicaciones
El sistema se comunica con el navegador del cliente mediante HTTP/HTTPS. Toda comunicación debe cifrarse con TLS 1.2 o superior (`RNF-SEG-01`). Las notificaciones de confirmación de reserva se envían por correo electrónico.

## 4. Características del sistema

Códigos de característica usados en esta sección: `ROL` Roles, `USR` Usuarios, `ACC` Acceso, `PAQ` Paquetes Turísticos, `ITI` Itinerarios, `PRO` Proveedores, `CON` Contratos, `RES` Reservas, `CRM` CRM/Clientes, `VEN` Ventas, `TRA` Transporte, `DES` Desempeño.

### 4.1 Gestión de Roles
**4.1.1 Descripción y prioridad:** administración de roles y sus permisos de acceso a los módulos. Prioridad Alta — sin roles no hay control de acceso.

**4.1.2 Secuencias de estímulo/respuesta**

| Estímulo del actor | Respuesta del sistema |
|---|---|
| Administrador solicita crear un rol | El sistema muestra el formulario, valida nombre único y al menos un privilegio, y confirma la creación |
| Administrador solicita listar roles | El sistema muestra tabla con nombre, descripción, usuarios asignados, estado y acciones |

**4.1.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-ROL-01 | El sistema debe permitir al Administrador crear un rol con nombre único (VARCHAR 80), descripción de permisos (VARCHAR 250) y al menos un privilegio asignado. | Alta | HU_01/CA_01_01-03 | Prueba funcional |
| RF-ROL-02 | Cuando el Administrador intente crear un rol con un nombre ya registrado, el sistema debe rechazar la operación y mostrar "El rol ya existe". | Alta | HU_01/CA_01_02, CU.01.1.1 | Prueba funcional |
| RF-ROL-03 | El sistema debe permitir al Administrador editar nombre, permisos y estado de un rol existente, sin permitir un nombre duplicado. | Alta | HU_02, CU.01.1.2 | Prueba funcional |
| RF-ROL-04 | El sistema debe listar todos los roles registrados con nombre, descripción y número de usuarios asignados, con opción de filtrar por nombre. | Media | HU_03, CU.01.1.3 | Prueba funcional |
| RF-ROL-05 | El sistema debe permitir al Administrador activar o inactivar un rol, sin afectar su historial. | Alta | HU_04, CU.01.1.4 | Prueba funcional |
| RF-ROL-06 | Cuando el Administrador intente inactivar un rol con usuarios activos asignados, el sistema debe rechazar la operación e informar el motivo. | Alta | CA01.1_04_02 | Prueba funcional |
| RF-ROL-07 | El sistema debe permitir al Administrador asignar y retirar módulos (permisos) asociados a un rol, y visualizar la lista de módulos asignados. | Alta | HU_06, HU_07, HU_08 | Prueba funcional |

### 4.2 Gestión de Usuarios
**4.2.1 Descripción y prioridad:** alta.

**4.2.2 Secuencias de estímulo/respuesta**

| Estímulo del actor | Respuesta del sistema |
|---|---|
| Administrador crea un usuario | El sistema valida correo único y campos obligatorios, guarda y confirma |

**4.2.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-USR-01 | El sistema debe permitir al Administrador crear un usuario con nombre, correo (único), documento, rol y teléfono. | Alta | HU_09, CU.02.1.1 | Prueba funcional |
| RF-USR-02 | Cuando el correo o documento ya exista, el sistema debe rechazar el registro y mostrar "El usuario ya está registrado". | Alta | CU.02.1.1 | Prueba funcional |
| RF-USR-03 | El sistema debe listar todos los usuarios con nombre, correo, rol(es) y estado, con filtro por nombre, correo o estado. | Media | HU_10 | Prueba funcional |
| RF-USR-04 | El sistema debe permitir buscar un usuario por nombre, documento o rol. | Media | HU_12, CU.02.1.3 | Prueba funcional |
| RF-USR-05 | El sistema debe permitir al Administrador editar los datos de un usuario existente. | Alta | HU_13 | Prueba funcional |
| RF-USR-06 | El sistema debe permitir al Administrador cambiar el estado de un usuario (activo/inactivo) sin eliminarlo. | Alta | HU_15, CU.02.1.6 | Prueba funcional |

### 4.3 Gestión de Acceso
**4.3.1 Descripción y prioridad:** Alta — sin autenticación no hay control de quién opera el sistema.

**4.3.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-ACC-01 | El sistema debe permitir a Administrador y Cliente autenticarse con correo electrónico y contraseña. | Alta | HU_16, HU_20 | Prueba funcional |
| RF-ACC-02 | Cuando las credenciales sean inválidas, el sistema debe rechazar el acceso y mostrar un mensaje genérico sin revelar si el correo existe. | Alta | Buena práctica de seguridad | Prueba funcional |
| RF-ACC-03 | El sistema debe permitir cerrar sesión, destruyendo la sesión activa del usuario. | Alta | HU_17, HU_21 | Prueba funcional |
| RF-ACC-04 | El sistema debe permitir solicitar recuperación de contraseña mediante el envío de un enlace al correo registrado. | Alta | HU_18, HU_22 | Prueba funcional |
| RF-ACC-05 | El sistema debe permitir establecer una nueva contraseña a partir de un enlace de recuperación válido y no expirado, y confirmar el cambio. | Alta | HU_19, HU_23 | Prueba funcional |

### 4.4 Gestión de Paquetes Turísticos
**4.4.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-PAQ-01 | El sistema debe permitir al Administrador crear un paquete turístico con nombre, descripción, precio, fecha de inicio y fin. | Alta | HU_24, CU.03.1.1 | Prueba funcional |
| RF-PAQ-02 | El sistema debe permitir asociar a un paquete uno o más servicios de tipo Transporte, Hospedaje, Actividad, Seguro o Comida, cada uno con su descripción y precio. | Alta | Tabla `Servicios_Paquete` | Prueba funcional |
| RF-PAQ-03 | El sistema debe listar y permitir buscar paquetes turísticos por nombre. | Media | HU_25, HU_26 | Prueba funcional |
| RF-PAQ-04 | El sistema debe permitir editar un paquete existente y cambiar su estado (activo/inactivo). | Alta | HU_27, HU_29 | Prueba funcional |
| RF-PAQ-05 | El sistema debe mostrar el detalle completo de un paquete turístico, incluidos sus servicios asociados. | Media | HU_28 | Prueba funcional |

### 4.5 Gestión de Itinerarios
**4.5.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-ITI-01 | El sistema debe permitir crear un itinerario para un paquete turístico con horarios y actividades programadas. | Alta | HU_30 | Prueba funcional |
| RF-ITI-02 | El sistema debe listar, buscar, editar y cambiar el estado de un itinerario existente. | Media | HU_31-35 | Prueba funcional |
| RF-ITI-03 | El sistema debe mostrar el detalle de un itinerario con sus actividades y horarios. | Media | HU_34 | Prueba funcional |

### 4.6 Gestión de Proveedores
**4.6.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-PRO-01 | El sistema debe permitir registrar un proveedor con nombre de empresa, tipo de servicio, contacto y datos de ubicación. | Alta | HU_39, CU (Gestión de Proveedores) | Prueba funcional |
| RF-PRO-02 | El sistema debe permitir consultar y actualizar la información de un proveedor existente. | Media | HU_40, HU_41 | Prueba funcional |
| RF-PRO-03 | El sistema debe permitir asociar uno o más servicios (con precio y disponibilidad) a un proveedor. | Media | Tabla `Servicios_Proveedor` | Prueba funcional |

### 4.7 Gestión de Contratos con Proveedores
**4.7.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-CON-01 | El sistema debe permitir registrar un nuevo contrato con un proveedor. | Alta | HU_42, CU_CON_01 | Prueba funcional |
| RF-CON-02 | El sistema debe permitir consultar los contratos existentes y su vigencia. | Media | HU_43, CU_CON_02 | Prueba funcional |
| RF-CON-03 | El sistema debe permitir actualizar un contrato existente mediante un otrosí, conservando el historial de cambios. | Media | HU_44, CU_CON_03 | Prueba funcional |
| RF-CON-04 | El sistema debe validar que un proveedor de transporte tenga un contrato activo y vigente antes de asignarlo a un paquete o itinerario. | Alta | HU_38 | Prueba funcional |

### 4.8 Gestión de Reservas
**4.8.1 Descripción y prioridad:** Alta — es la función central del negocio.

**4.8.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-RES-01 | El sistema debe permitir al Cliente reservar un paquete turístico, vuelo u hotel disponible, indicando fechas y número de pasajeros. | Alta | Visión Proyecto — Cliente | Prueba funcional |
| RF-RES-02 | Cuando se confirme una reserva, el sistema debe enviar automáticamente una notificación de confirmación al correo del cliente. | Alta | Alcance — Confirmaciones Automáticas | Prueba funcional |
| RF-RES-03 | El sistema debe permitir al Administrador controlar y supervisar el estado de todas las reservas (pendiente/confirmada/cancelada). | Alta | Tabla `Reservas`, CU Gestión de Reservas | Prueba funcional |
| RF-RES-04 | El sistema debe permitir al Cliente consultar el historial y estado de sus propias reservas. | Alta | HU — Visión Proyecto Cliente | Prueba funcional |
| RF-RES-05 | El sistema debe permitir al Cliente descargar en PDF el comprobante de una reserva confirmada. | Media | Visión Proyecto — Cliente | Prueba funcional |

### 4.9 CRM — Seguimiento y Clasificación de Clientes
**4.9.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-CRM-01 | El sistema debe registrar cada interacción con un cliente (llamada, correo, reunión, encuesta) con fecha, descripción y resultado. | Media | Tabla `CRM` | Prueba funcional |
| RF-CRM-02 | El sistema debe permitir clasificar a los clientes según sus intereses y comportamiento de compra. | Media | Alcance — Clasificación de Conductores/Clientes | Prueba funcional |
| RF-CRM-03 | El sistema debe permitir consultar el historial completo de interacciones y reservas de un cliente. | Media | Objetivos específicos | Prueba funcional |

### 4.10 Gestión de Ventas
**4.10.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-VEN-01 | El sistema debe registrar una venta asociada a una reserva, con monto y fecha. | Alta | Tabla `Ventas` | Prueba funcional |
| RF-VEN-02 | El sistema debe permitir registrar el método de pago (tarjeta de crédito, transferencia o efectivo) de una venta. | Alta | Tabla `Ventas` | Prueba funcional |
| RF-VEN-03 | El sistema debe generar un comprobante de pago descargable tras confirmar una venta. | Alta | Objetivos del proyecto | Prueba funcional |
| RF-VEN-04 | Cuando el pago con tarjeta sea rechazado por la pasarela, el sistema debe conservar la venta en estado "pendiente", informar el motivo y permitir reintentar con otro método. | Alta | Buena práctica — camino infeliz | Prueba funcional |

### 4.11 Gestión de Transporte
**4.11.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-TRA-01 | El sistema debe permitir registrar un medio de transporte (tipo, proveedor, capacidad, precio, fechas de salida/llegada). | Alta | HU_36, tabla `Transporte` | Prueba funcional |
| RF-TRA-02 | El sistema debe permitir consultar la lista de transportes asignados a los paquetes turísticos. | Media | HU_37 | Prueba funcional |

### 4.12 Medición de Desempeño
**4.12.3 Requerimientos funcionales**

| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RF-DES-01 | El sistema debe permitir al Administrador recopilar datos de retroalimentación de los paquetes turísticos ejecutados. | Media | HU_67 | Prueba funcional |
| RF-DES-02 | El sistema debe analizar los datos de retroalimentación de clientes para identificar áreas de mejora. | Media | HU_68 | Prueba funcional |
| RF-DES-03 | El sistema debe generar informes personalizados sobre la ejecución de paquetes, itinerarios y transporte, exportables para compartir con terceros. | Media | HU_69 | Prueba funcional |

## 5. Otros requerimientos no funcionales

### 5.1 Requerimientos de rendimiento
| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RNF-REN-01 | El sistema debe presentar el listado de paquetes turísticos en menos de 2 segundos en el percentil 95, con hasta 100 usuarios concurrentes. | Media | Inferido — no confirmado por el cliente (TBD-04) | Prueba de carga |
| RNF-REN-02 | El envío de la confirmación automática de reserva debe iniciarse dentro de los 60 segundos posteriores a la confirmación del pago. | Alta | Alcance — Confirmaciones Automáticas | Prueba funcional |

### 5.2 Requerimientos de seguridad física / safety
No aplica de forma directa: el sistema no controla equipos físicos. Sin embargo, una reserva o cobro erróneo (`RF-RES-*`, `RF-VEN-*`) puede causar perjuicio económico al cliente o a la agencia; el control de dicho riesgo se cubre mediante los requerimientos funcionales de validación de la sección 4 y la trazabilidad de auditoría de `RNF-SEG-02`.

### 5.3 Requerimientos de seguridad informática y privacidad
| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RNF-SEG-01 | Toda comunicación entre cliente y servidor debe cifrarse con TLS 1.2 o superior. | Alta | Buena práctica | Inspección |
| RNF-SEG-02 | El sistema debe registrar en bitácora cada creación, edición y cambio de estado de roles, usuarios, contratos y ventas, con usuario, fecha/hora y acción. | Alta | Objetivos — seguridad de la información | Inspección |
| RNF-PRI-01 | El sistema debe cumplir la Ley 1581 de 2012 (Habeas Data) en el tratamiento de datos personales de clientes, incluyendo consentimiento informado y derecho de acceso/rectificación. | Alta | Marco legal colombiano | Inspección |
| RNF-SEG-03 | Las contraseñas deben almacenarse cifradas (hash con sal, algoritmo mínimo bcrypt o equivalente) y nunca deben registrarse en bitácoras. | Alta | Buena práctica | Inspección |

### 5.4 Atributos de calidad de software
| ID | Requerimiento | Prioridad | Fuente | Verificación |
|---|---|---|---|---|
| RNF-USA-01 | Todo formulario debe validar los campos obligatorios en línea, mostrando el error junto al campo antes de permitir el envío. | Alta | Wireframes — patrón de formularios | Demostración |
| RNF-CAL-01 | El sistema debe estar disponible el 99% del tiempo en horario comercial (7am–10pm), medido mensualmente. | Media | Inferido — atención 24/7 declarada como objetivo (TBD-05) | Análisis |
| RNF-CAL-02 | El diseño de interfaz debe ser responsivo y usable en resoluciones desde 360px (móvil) hasta 1920px (escritorio). | Alta | Objetivo — app web | Demostración |

### 5.5 Reglas de negocio
| ID | Regla | RF que la refuerzan |
|---|---|---|
| RN-01 | Solo el Administrador puede crear, editar o cambiar el estado de roles, proveedores y contratos. | RF-ROL-01 a 07, RF-PRO-01 a 03, RF-CON-01 a 04 |
| RN-02 | Un proveedor de transporte solo puede asignarse a un paquete si su contrato está activo y vigente. | RF-CON-04 |
| RN-03 | Un rol no puede inactivarse mientras tenga usuarios activos asignados. | RF-ROL-06 |

## 6. Otros requerimientos
- **Base de datos:** modelo relacional de 11 tablas ya definido (ver 2.5); cualquier cambio de esquema debe mantener la integridad referencial descrita (Usuarios→Reservas, Clientes→Reservas, Paquetes_Turisticos→Servicios_Paquete, Proveedores→Servicios_Proveedor/Transporte, Ventas→Reservas).
- **Internacionalización:** fuera de alcance en v1.0 (solo español, moneda COP).
- **Migración de datos:** no aplica — no existe sistema previo automatizado del cual migrar.

## Apéndice A: Glosario
| Término | Definición |
|---|---|
| CRM | Customer Relationship Management — gestión de relación con clientes |
| Itinerario | Programación detallada de horarios y actividades de un paquete turístico |
| Otrosí | Documento que modifica un contrato existente sin reemplazarlo |
| PQR | Peticiones, Quejas y Reclamos |

## Apéndice B: Modelos de análisis
El modelo entidad-relación de 11 tablas (`Usuarios`, `Clientes`, `Reservas`, `Paquetes_Turisticos`, `Servicios_Paquete`, `CRM`, `Proveedores`, `Servicios_Proveedor`, `Ventas`, `Transporte`, `Configuraciones`) está documentado en `4 Base de Datos/Bases de datos para la agencia de turismo sena.docx` y resumido en el archivo `Agencia_Viajes.md` de este mismo proyecto. Los 8 diagramas de casos de uso (PlantUML) están en `3 Casos de Uso y Documentación CU/Diagrama Casos de Uso.docx`.

## Apéndice C: Lista TBD
| ID TBD | Sección | Qué falta | Quién debe decidir | Fecha límite |
|---|---|---|---|---|
| TBD-01 | 2.7 | Nombre comercial definitivo y datos de contacto de la agencia | Cliente (agencia de viajes) | Antes de diseño visual final |
| TBD-02 | 2.7, 3.3 | Proveedor del servicio de correo transaccional | Administrador del proyecto | Antes de construcción del módulo de notificaciones |
| TBD-03 | 2.7, 3.3 | Pasarela de pago a contratar (o confirmación de solo efectivo/transferencia) | Cliente | Antes de construcción de RF-VEN-02 |
| TBD-04 | 5.1 | Carga concurrente real esperada (número de usuarios simultáneos) | Cliente | Antes de pruebas de rendimiento |
| TBD-05 | 5.4 | Confirmar si "atención 24/7" implica disponibilidad de sistema 24/7 o solo canal de contacto | Cliente | Antes de definir SLA de disponibilidad |
