# Proyecto: Sistema de Gestión de Operaciones Turísticas (Agencia de Viajes "Tours")

Carpeta: `Agencia_Viajes` — Programa: Técnico en Programación de Software (SENA)

## 1. Ficha del Proyecto

**Cliente:** Tours [Nombre por definir], agencia de viajes ubicada en Sabaneta, Antioquia (constituida el 16 de octubre de 2017). Organiza paquetes turísticos nacionales (Antioquia, Caribe, Pacífico, Eje Cafetero) e internacionales (América y Europa), con reservas de transporte, alojamiento y actividades personalizadas.

**Problema:** procesos manuales de reservas (errores, duplicaciones, esperas), falta de canales de atención al cliente (PQR), control ineficiente de proveedores, análisis de datos limitado y competencia desleal de agentes informales.

**Objetivo general:** desarrollar una aplicación web que gestione los procesos de la agencia según sus necesidades.

**Objetivos específicos:** configurar roles y permisos; gestionar usuarios y accesos (login/recuperación/logout); permitir reservas de paquetes, vuelos y hoteles; confirmaciones automáticas de reservas; crear y editar paquetes turísticos e itinerarios; gestionar clientes (CRM) y su clasificación por intereses; gestionar proveedores y contratos; gestionar ventas (pagos/comprobantes); planificar transporte.

**Alcance (procesos/subprocesos):**
- Configuración: Roles, Permisos
- Usuarios: Gestión de Usuarios, Gestión de Acceso
- Gestión de Reservas: Reservas, Confirmaciones Automáticas
- Gestión de Paquetes Turísticos: Paquetes, Itinerarios
- CRM: Seguimiento de Clientes, Clasificación de Clientes
- Gestión de Proveedores: Proveedores, Negociación y Contratos
- Gestión de Ventas: métodos de pago, comprobantes
- Gestión de Transporte: Planificación de Transporte

**Entregables:** acta de entrevista y matriz de historias de usuario; diagramas UML de casos de uso; modelo entidad-relación, diagrama de clases y script SQL; diseño de interfaces; informe de pruebas; manual de usuario.

## 2. Casos de Uso

### 2.1 Diagramas (PlantUML) por módulo
El documento `Diagrama Casos de Uso.docx` define 8 diagramas de paquetes de casos de uso:

1. **Gestión de Roles** (actor: Administrador) — Crear Rol, Editar Rol, Listar Roles, Cambiar Estado de Rol, Ver Detalle del Rol, Asignar Módulos a Rol, Ver Módulos Asociados al Rol, Eliminar Módulo Asociado al Rol. `Crear/Editar Rol` incluyen `Asignar Módulos`; `Ver Detalle` incluye `Ver Módulos Asociados`, que puede extenderse a `Eliminar Módulo Asociado`.
2. **Gestión de Usuarios** (Administrador) — Crear, Listar (incluye Buscar; se extiende a Ver Detalle/Editar/Cambiar Estado).
3. **Gestión de Paquetes Turísticos** (Administrador) — Crear, Listar (incluye Buscar; se extiende a Editar/Ver Detalle/Cambiar Estado).
4. **Gestión de Itinerarios** (Administrador) — Crear, Listar (incluye Buscar; se extiende a Editar/Ver Detalle/Cambiar Estado).
5. **Gestión de Proveedores** (Administrador) — Registrar Proveedor, Consultar Proveedores, Actualizar Información de Proveedor.
6. **Gestión de Negociación y Contratos** (Administrador) — Registrar Nuevo Contrato, Consultar Contratos Existentes, Actualizar Información de Contrato.
7. **Gestión de Reservas** (Administrador, Cliente) — Administrador: Controlar y Supervisar Reservas, Gestionar Envío de Notificaciones. Cliente: Realizar Reserva de Paquete y Transporte, Generar Informe de Reservas del Cliente.
8. **Medición del Desempeño de la Agencia** (Administrador) — Recopilar datos de retroalimentación, Analizar datos de retroalimentación, Generar informes personalizados de ejecución.

### 2.2 Casos de uso documentados en detalle (`Documentación casos de uso (1).docx`)
Cada uno con dependencias, pre-condiciones, actores, secuencia normal paso a paso, post-condición, excepciones y reglas de negocio (formato CA_xx):

- **CU.01.1.1 Crear un Rol** — formulario con nombre_rol, permisos, estado_rol, privilegio; valida nombre único y al menos un privilegio asignado.
- **CU.01.1.2 Editar un Rol** — carga datos por id, valida nombre único al modificar.
- **CU.01.1.3 Listar Roles** — tabla con opciones de ver detalle/editar/cambiar estado; mensaje si no hay registros.
- **CU.01.1.4 Cambiar Estado del Rol** — activa/inactiva un rol con confirmación previa; no permite inactivar roles asignados a usuarios activos.
- **CU.02.1.1 Crear Usuario** — valida correo único y campos obligatorios.
- **CU.02.1.2 Listar Usuarios**
- **CU.02.1.3 Buscar Usuario** — por nombre, documento o rol.
- **CU.02.1.6 Cambiar Estado del Usuario** — activa/inactiva sin eliminar.
- **CU.03.1.1 Crear Paquete Turístico** — registra un paquete adaptado a las necesidades del cliente.

(El resto de los procesos del alcance —Itinerarios, Proveedores, Contratos, Reservas, Transporte, Medición de Desempeño— quedan definidos a nivel de diagrama y de historias de usuario, sin ficha CU expandida en este documento.)

## 3. Historias de Usuario (Matriz — 47 HU)

Extraídas de `Matriz Historias de Usuario Proyecto Agencia de Turismo.xlsx` (hojas: Visión Proyecto, Epics, HU + Criterios Aceptación). Cada HU trae criterios de aceptación (CA) con reglas de validación y tipos de dato.

**Configuración — Roles (HU_01–HU_08):** crear, editar, listar, cambiar estado y ver detalle de un rol; asignar/ver/eliminar módulos asociados al rol.

**Usuarios (HU_09–HU_15):** crear, listar, asignar módulos, buscar, editar, ver detalle y cambiar estado de usuarios.

**Gestión de Acceso — Administrador (HU_16–HU_19):** iniciar sesión, cerrar sesión, recuperar contraseña, restablecer contraseña.

**Gestión de Acceso — Cliente (HU_20–HU_23):** mismas 4 funcionalidades de acceso para el rol Cliente.

**Paquetes Turísticos (HU_24–HU_29):** crear, listar, buscar, editar, ver detalle, cambiar estado de un paquete turístico.

**Itinerarios (HU_30–HU_35):** crear, listar, buscar, editar, ver detalle, cambiar estado de un itinerario.

**Transporte (HU_36–HU_38):** gestionar planificación de transporte (registrar nuevo medio), consultar lista de transportes, validar que proveedores de transporte tengan contratos vigentes.

**Proveedores (HU_39–HU_41):** registrar, consultar y actualizar información de proveedores.

**Contratos (HU_42–HU_44):** registrar nuevo contrato, consultar contratos existentes, actualizar información de contrato (otrosí).

**Medición de Desempeño (HU_67–HU_69):** recopilar datos de retroalimentación de paquetes turísticos, analizar datos de retroalimentación de clientes, generar informes personalizados sobre ejecución de paquetes/itinerarios/transporte.

*(Nota: la numeración salta de HU_44 a HU_67 en el archivo fuente; los procesos de Reservas, CRM y Ventas descritos en la Visión del Proyecto no tienen HU numeradas explícitas en la hoja de criterios de aceptación.)*

La hoja **Visión Proyecto** resume necesidades/funcionalidades/beneficios por grupo de usuario:
- **Administrador:** gestionar roles, permisos, usuarios, accesos, paquetes turísticos, itinerarios, proveedores, ventas, informes y planificación de transporte.
- **Cliente:** gestionar reservas, recibir confirmaciones automáticas, gestionar información personal y preferencias, descargar informes/comprobantes en PDF.

## 4. Base de Datos

Script SQL en `4 Base de Datos/Bases de datos para la agencia de turismo sena.docx` — 11 tablas:

| Tabla | Campos clave |
|---|---|
| Usuarios | id_usuario PK, nombre_usuario, email (único), contrasena, rol ENUM(Administrador/Agente/Cliente), fecha_registro |
| Clientes | id_cliente PK, nombre, apellido, email (único), telefono, direccion, fecha_registro |
| Reservas | id_reserva PK, id_cliente FK, id_usuario FK, fecha_reserva, estado ENUM(Pendiente/Confirmada/Cancelada), total |
| Paquetes_Turisticos | id_paquete PK, nombre_paquete, descripcion, precio, fecha_inicio, fecha_fin |
| Servicios_Paquete | id_servicio PK, id_paquete FK, tipo_servicio ENUM(Transporte/Hospedaje/Actividad/Seguro/Comida), descripcion, precio |
| CRM | id_interaccion PK, id_cliente FK, tipo_interaccion ENUM(Llamada/Correo/Reunión/Encuesta), fecha_interaccion, descripcion, resultado |
| Proveedores | id_proveedor PK, nombre_empresa, tipo_servicio ENUM, contacto_nombre, contacto_email, telefono_contacto, direccion, fecha_registro |
| Servicios_Proveedor | id_servicio PK, id_proveedor FK, nombre_servicio, descripcion, precio, disponible |
| Ventas | id_venta PK, id_reserva FK, monto, fecha_venta, metodo_pago ENUM(Tarjeta/Transferencia/Efectivo), estado ENUM(Pendiente/Pagado/Cancelado) |
| Transporte | id_transporte PK, tipo_transporte ENUM(Avión/Autobús/Tren/Ferry/Coche), id_proveedor FK, descripcion, capacidad, precio, fecha_salida, fecha_llegada |
| Configuraciones | id_configuracion PK, parametro, valor, descripcion |

**Relaciones:** Usuarios→Reservas (gestión); Clientes→Reservas (1:N); Reservas→Paquetes_Turisticos y Transporte; Paquetes_Turisticos→Servicios_Paquete (1:N); Clientes→CRM (historial de interacciones); Proveedores→Servicios_Proveedor; Ventas→Reservas (1:1); Proveedores→Transporte.

## 5. Wireframes (17 pantallas, carpeta `Wireframe/`)

Diseño consistente tipo panel administrativo bajo la marca **"TourManager"**: layout con sidebar de navegación (Dashboard, Usuarios, Roles, Módulos, Configuración, Reportes → Actividad/Auditoría), breadcrumbs, tablas de listado con acciones (ver/editar/eliminar), paneles de detalle y formularios con validación en línea.

- **Login Gestión de acceso.png** — flujo de 4 pantallas: Iniciar Sesión (correo + contraseña), Recuperar Contraseña (envío de enlace), Crear Nueva Contraseña, y confirmación "Contraseña Actualizada".
- **Gestion de roles.png** — listado de roles (nombre, descripción, usuarios asignados, estado, acciones) + panel de detalle del rol con permisos (toggles) y usuarios asignados.
- **Gestion de usuarios.png** — administración de usuarios del sistema (listado, alta, edición, estado).
- **Registro de nuevo proveedor.png** / **Consulta de Proveedores.png** / **Actualizar información de Proveedor.png** — alta, listado/búsqueda y edición de proveedores.
- **Registro nuevo contrato.png** / **Consulta de contratos.png** / **Gestión de contratos.png** / **Validación de contrato de Transpote.png** — ciclo completo de contratos con proveedores, incluida validación de vigencia para transporte.
- **Crear Itinerario.png** / **Editar Itinerario.png** / **RUD Itinerarios.png** / **Buscar Itinerario.png** — ABM (alta/baja/modificación) y búsqueda de itinerarios de paquetes turísticos.
- **Registrar nuevo transporte.png** / **Lista de Transporte.png** / **Gestión de transporte.png** — registro y planificación de medios de transporte asociados a los paquetes.

## 6. Documentos fuente
- `1 Ficha Proyecto/Proyecto Agencia Viajes.docx`
- `2 Matriz Historias de Usuario/Matriz Historias de Usuario Proyecto Agencia de Turismo.xlsx`
- `3 Casos de Uso y Documentación CU/Diagrama Casos de Uso.docx`, `Documentación casos de uso (1).docx`
- `4 Base de Datos/Bases de datos para la agencia de turismo sena.docx`
- `Wireframe/` (17 imágenes PNG)

## 7. Vacíos identificados
No hay un plan SCRUM (backlog priorizado, sprints, story points) en la carpeta del proyecto.
