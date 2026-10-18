# Historias de Usuario — Sistema de Gestión de Operaciones Turísticas (Agencia de Viajes)

> Trazabilidad: cada historia referencia los requerimientos funcionales de `SRS-Agencia_Viajes-v1.0.md` que implementa. Complementa (no reemplaza) la Matriz de Historias de Usuario ya existente en el proyecto, que fue actualizada con columnas de trazabilidad y criterios Given-When-Then.

## Épica 1: Configuración (Roles)

### HU-01 — Crear y proteger roles del sistema
**Como** Administrador
**quiero** crear roles con nombre único y al menos un privilegio
**para** controlar qué módulos puede usar cada tipo de usuario

**Requerimientos que implementa:** RF-ROL-01, RF-ROL-02
**Prioridad:** Alta · **Estimación:** 3 puntos

**Criterios de aceptación**
1. **Dado** que soy Administrador autenticado, **cuando** completo nombre y al menos un privilegio y confirmo, **entonces** el sistema crea el rol y lo muestra en el listado.
2. **Dado** que ya existe un rol con el mismo nombre, **cuando** intento crearlo de nuevo, **entonces** el sistema rechaza la operación y muestra "El rol ya existe".
3. **Dado** que no seleccioné ningún privilegio, **cuando** intento guardar, **entonces** el sistema bloquea el guardado y pide asignar al menos uno.

### HU-02 — Inactivar un rol sin romper el acceso de otros
**Como** Administrador
**quiero** cambiar el estado de un rol
**para** retirarlo de circulación sin perder su historial

**Requerimientos que implementa:** RF-ROL-05, RF-ROL-06
**Prioridad:** Alta · **Estimación:** 2 puntos

**Criterios de aceptación**
1. **Dado** un rol sin usuarios activos asignados, **cuando** lo inactivo y confirmo, **entonces** el sistema cambia su estado y lo mantiene visible en el histórico.
2. **Dado** un rol con usuarios activos asignados, **cuando** intento inactivarlo, **entonces** el sistema rechaza la acción e informa el motivo.

## Épica 2: Usuarios y Acceso

### HU-03 — Registrar un nuevo usuario
**Como** Administrador
**quiero** crear un usuario con correo único
**para** darle acceso al sistema según su rol

**Requerimientos que implementa:** RF-USR-01, RF-USR-02
**Prioridad:** Alta · **Estimación:** 3 puntos

**Criterios de aceptación**
1. **Dado** que ingreso nombre, correo, documento y rol válidos, **cuando** confirmo el registro, **entonces** el sistema crea el usuario y lo marca activo.
2. **Dado** que el correo o documento ya está registrado, **cuando** intento guardar, **entonces** el sistema rechaza el registro y muestra "El usuario ya está registrado".

### HU-04 — Iniciar y cerrar sesión de forma segura
**Como** Administrador o Cliente
**quiero** autenticarme con correo y contraseña
**para** acceder solo a las funciones que me corresponden

**Requerimientos que implementa:** RF-ACC-01, RF-ACC-02, RF-ACC-03
**Prioridad:** Alta · **Estimación:** 3 puntos

**Criterios de aceptación**
1. **Dado** que tengo credenciales válidas, **cuando** las ingreso y confirmo, **entonces** el sistema me autentica y me dirige al panel correspondiente a mi rol.
2. **Dado** que ingreso una contraseña incorrecta, **cuando** confirmo, **entonces** el sistema muestra un mensaje genérico de error sin indicar si el correo existe.
3. **Dado** que tengo una sesión activa, **cuando** selecciono cerrar sesión, **entonces** el sistema destruye la sesión y me redirige al login.

### HU-05 — Recuperar contraseña olvidada
**Como** usuario registrado
**quiero** recuperar mi contraseña por correo
**para** volver a acceder sin depender de soporte técnico

**Requerimientos que implementa:** RF-ACC-04, RF-ACC-05
**Prioridad:** Alta · **Estimación:** 3 puntos

**Criterios de aceptación**
1. **Dado** que ingreso mi correo registrado, **cuando** solicito recuperación, **entonces** el sistema envía un enlace de restablecimiento a ese correo.
2. **Dado** un enlace de restablecimiento válido y no expirado, **cuando** defino una nueva contraseña y la confirmo, **entonces** el sistema la actualiza y muestra confirmación.
3. **Dado** un enlace expirado, **cuando** intento usarlo, **entonces** el sistema lo rechaza y ofrece solicitar uno nuevo.

## Épica 3: Paquetes Turísticos e Itinerarios

### HU-06 — Armar un paquete turístico personalizado
**Como** Administrador
**quiero** crear un paquete con sus servicios asociados
**para** ofrecer opciones adaptadas a cada cliente

**Requerimientos que implementa:** RF-PAQ-01, RF-PAQ-02
**Prioridad:** Alta · **Estimación:** 5 puntos

**Criterios de aceptación**
1. **Dado** que ingreso nombre, descripción, precio y fechas válidas, **cuando** confirmo, **entonces** el sistema crea el paquete.
2. **Dado** un paquete creado, **cuando** asocio uno o más servicios (transporte, hospedaje, actividad, seguro, comida), **entonces** el sistema los guarda vinculados al paquete con su precio individual.

### HU-07 — Planificar el itinerario de un paquete
**Como** Administrador
**quiero** crear un itinerario con horarios y actividades
**para** que el cliente sepa exactamente qué incluye su viaje

**Requerimientos que implementa:** RF-ITI-01, RF-ITI-03
**Prioridad:** Alta · **Estimación:** 3 puntos

**Criterios de aceptación**
1. **Dado** un paquete existente, **cuando** registro actividades con horario para cada día, **entonces** el sistema guarda el itinerario asociado al paquete.
2. **Dado** un itinerario existente, **cuando** consulto su detalle, **entonces** el sistema muestra todas sus actividades y horarios.

## Épica 4: Proveedores y Contratos

### HU-08 — Registrar y consultar proveedores
**Como** Administrador
**quiero** registrar proveedores con su tipo de servicio
**para** tener control centralizado de hoteles, aerolíneas y guías

**Requerimientos que implementa:** RF-PRO-01, RF-PRO-02
**Prioridad:** Alta · **Estimación:** 3 puntos

**Criterios de aceptación**
1. **Dado** que ingreso nombre de empresa, tipo de servicio y contacto, **cuando** confirmo, **entonces** el sistema registra el proveedor.
2. **Dado** un proveedor registrado, **cuando** actualizo sus datos de contacto, **entonces** el sistema guarda los cambios y los refleja en su ficha.

### HU-09 — Formalizar contratos con proveedores
**Como** Administrador
**quiero** registrar y actualizar contratos con proveedores
**para** garantizar condiciones de servicio y costos acordados

**Requerimientos que implementa:** RF-CON-01, RF-CON-03, RF-CON-04
**Prioridad:** Alta · **Estimación:** 5 puntos

**Criterios de aceptación**
1. **Dado** un proveedor registrado, **cuando** registro un nuevo contrato con sus condiciones, **entonces** el sistema lo asocia al proveedor y lo marca vigente.
2. **Dado** un contrato vigente, **cuando** lo actualizo mediante un otrosí, **entonces** el sistema conserva el historial de la versión anterior.
3. **Dado** un proveedor de transporte sin contrato vigente, **cuando** intento asignarlo a un paquete, **entonces** el sistema rechaza la asignación e indica el motivo.

## Épica 5: Reservas

### HU-10 — Reservar un paquete turístico
**Como** Cliente
**quiero** reservar un paquete, vuelo u hotel disponible
**para** asegurar mi viaje sin depender de WhatsApp

**Requerimientos que implementa:** RF-RES-01, RF-RES-02
**Prioridad:** Alta · **Estimación:** 5 puntos

**Criterios de aceptación**
1. **Dado** un paquete disponible, **cuando** indico fechas y número de pasajeros y confirmo, **entonces** el sistema crea la reserva en estado "pendiente".
2. **Dado** que la reserva fue confirmada, **cuando** se procesa el pago, **entonces** el sistema envía automáticamente una notificación de confirmación al correo del cliente.
3. **Dado** un paquete sin disponibilidad en las fechas solicitadas, **cuando** intento reservar, **entonces** el sistema informa la falta de disponibilidad y sugiere fechas alternativas.

### HU-11 — Supervisar todas las reservas
**Como** Administrador
**quiero** ver el estado de todas las reservas
**para** anticipar problemas operativos y de capacidad

**Requerimientos que implementa:** RF-RES-03
**Prioridad:** Alta · **Estimación:** 3 puntos

**Criterios de aceptación**
1. **Dado** que existen reservas registradas, **cuando** accedo al panel de reservas, **entonces** el sistema las muestra con su estado (pendiente/confirmada/cancelada) filtrables por fecha.

### HU-12 — Consultar y descargar mis reservas
**Como** Cliente
**quiero** ver el historial de mis reservas y descargar el comprobante
**para** tener respaldo de mi compra

**Requerimientos que implementa:** RF-RES-04, RF-RES-05
**Prioridad:** Media · **Estimación:** 2 puntos

**Criterios de aceptación**
1. **Dado** que tengo reservas registradas, **cuando** accedo a "Mis reservas", **entonces** el sistema muestra el historial con su estado.
2. **Dado** una reserva confirmada, **cuando** selecciono descargar comprobante, **entonces** el sistema genera un PDF con los datos de la reserva.

## Épica 6: CRM

### HU-13 — Registrar interacciones con el cliente
**Como** Administrador
**quiero** registrar cada contacto con un cliente
**para** dar seguimiento a sus preferencias e historial

**Requerimientos que implementa:** RF-CRM-01, RF-CRM-03
**Prioridad:** Media · **Estimación:** 3 puntos

**Criterios de aceptación**
1. **Dado** un cliente existente, **cuando** registro una interacción (llamada, correo, reunión o encuesta) con su resultado, **entonces** el sistema la guarda con fecha y hora.
2. **Dado** un cliente con historial de interacciones y reservas, **cuando** consulto su ficha, **entonces** el sistema muestra ambos historiales consolidados.

## Épica 7: Ventas

### HU-14 — Cobrar una reserva confirmada
**Como** Administrador
**quiero** registrar el pago de una venta con su método
**para** cerrar el ciclo de reserva con un comprobante formal

**Requerimientos que implementa:** RF-VEN-01, RF-VEN-02, RF-VEN-03
**Prioridad:** Alta · **Estimación:** 5 puntos

**Criterios de aceptación**
1. **Dado** una reserva confirmada, **cuando** registro el pago con su método (tarjeta, transferencia o efectivo), **entonces** el sistema crea la venta y genera el comprobante descargable.
2. **Dado** un pago con tarjeta rechazado por la pasarela, **cuando** se intenta procesar, **entonces** el sistema conserva la venta en estado "pendiente", informa el motivo del rechazo y permite reintentar con otro método.

## Épica 8: Transporte

### HU-15 — Asignar transporte a un paquete
**Como** Administrador
**quiero** registrar y consultar los medios de transporte disponibles
**para** coordinar la logística de cada paquete turístico

**Requerimientos que implementa:** RF-TRA-01, RF-TRA-02
**Prioridad:** Alta · **Estimación:** 3 puntos

**Criterios de aceptación**
1. **Dado** que ingreso tipo, proveedor, capacidad y fechas de un transporte, **cuando** confirmo, **entonces** el sistema lo registra disponible para asignación.
2. **Dado** transportes registrados, **cuando** consulto la lista asignada a un paquete, **entonces** el sistema la muestra con su estado.

## Épica 9: Medición de Desempeño

### HU-16 — Analizar el desempeño de los paquetes
**Como** Administrador
**quiero** recopilar y analizar retroalimentación de clientes
**para** tomar decisiones informadas sobre precios y promociones

**Requerimientos que implementa:** RF-DES-01, RF-DES-02, RF-DES-03
**Prioridad:** Media · **Estimación:** 5 puntos

**Criterios de aceptación**
1. **Dado** que un paquete fue ejecutado, **cuando** registro la retroalimentación recibida, **entonces** el sistema la asocia al paquete y al periodo correspondiente.
2. **Dado** datos de retroalimentación acumulados, **cuando** solicito el informe de ejecución, **entonces** el sistema genera un reporte exportable por paquete, itinerario y transporte.

**Notas y restricciones**
- Aplica RNF-CAL-01 (disponibilidad) y RNF-SEG-02 (bitácora) como criterios de Definición de Terminado transversales a todas las historias que modifiquen datos.
- El tiempo de respuesta del listado de paquetes (RNF-REN-01) es criterio de aceptación técnico de HU-06, verificable en pruebas de carga separadas.

## Tabla de cobertura

| RF-ID | Historia(s) | Prioridad |
|---|---|---|
| RF-ROL-01 a 07 | HU-01, HU-02 | Alta |
| RF-USR-01 a 06 | HU-03 | Alta |
| RF-ACC-01 a 05 | HU-04, HU-05 | Alta |
| RF-PAQ-01 a 05 | HU-06 | Alta |
| RF-ITI-01 a 03 | HU-07 | Alta |
| RF-PRO-01 a 03 | HU-08 | Alta |
| RF-CON-01 a 04 | HU-09 | Alta |
| RF-RES-01 a 05 | HU-10, HU-11, HU-12 | Alta |
| RF-CRM-01 a 03 | HU-13 | Media |
| RF-VEN-01 a 04 | HU-14 | Alta |
| RF-TRA-01, 02 | HU-15 | Alta |
| RF-DES-01 a 03 | HU-16 | Media |
