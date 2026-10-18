# Software Design Document (SDD) — Backend

## Tours Out Here — Sistema de Gestión de Operaciones Turísticas (Back-end)

| | |
|---|---|
| **Document** | Software Design Document (backend phase) |
| **Project** | Tours Out Here — agencia de viajes (SENA ADSO) |
| **Version** | 1.0 |
| **Date** | 2026-09-22 |
| **Phase** | Back-end (API + base de datos + integraciones) |
| **Status** | Draft for review |
| **Companion** | `SDD-agencia-viajes.md` (front-end phase — read first) |

---

## 1. Purpose

This document defines everything required to implement the back-end of the
"Sistema de Gestión de Operaciones Turísticas": data model, API, security,
integrations, module behavior, and a phased action plan. It exists so the
back-end can be built without re-reading every source document, and so the
known **conflicts between the source documents and the SQL script** (Section 5)
are resolved before code is written, not after.

The front-end phase already fixed these contracts the back-end must honor:

- A booking (`Reserva`) is for **a Vuelo OR a Paquete, never both**.
- The **Total is computed at booking time and never changes afterwards**.
- Reservation number format: **`AV-YYYYMMDD-XXXX`**, generated at confirmation.
- Query-string contract for future back-end consumption:
  `vuelo.html?aerolinea=...&precio=...`, `reserva.html?tipo=vuelo&titulo=...`,
  `confirmacion.html?n=...&total=...`.
- All visible interface text in **Spanish**; currency **COP** (`$1.234.567`).

---

## 2. Scope

**In scope:**

- All 12 feature areas of the SRS: Roles, Usuarios, Acceso, Paquetes,
  Itinerarios, Proveedores, Contratos, Reservas, CRM, Ventas, Transporte,
  Desempeño (43 functional requirements `RF-*`).
- Schema execution + required migrations over the provided MySQL script.
- Authentication, authorization (2 classes + role management), audit log.
- Integrations: transactional email (confirmations, password reset), payment
  gateway registration, PDF receipts.
- Serving/bridging the existing static `FRONTEND/` and powering
  `dashboard.html` with real data.

**Out of scope (v1.0, per SRS §1.4):**

- Native mobile app; i18n (Spanish only); GDS/airline/hotel external systems.
- Payment gateway beyond registering the method — and even that is gated on
  TBD-03 (if not contracted: efectivo/transferencia only).
- Provider (hotel/airline/guide) self-service access — Administrador manages
  their data.
- Training and external-system integration (Ficha "Limitaciones").

---

## 3. Reference documents (verified paths)

| Reference | What it gives us |
|---|---|
| `carpetaProyecto/Agencia_Viajes/Requisitos (SRS)/SRS-Agencia_Viajes-v1.0.md` | **Authoritative requirements**: all `RF-*`, `RNF-*`, `RN-01..03`, TBD registry. Do not restate them here — implement against these IDs. |
| `.../Requisitos (SRS)/historias-usuario-Agencia_Viajes.md` | 16 HU with Given-When-Then acceptance criteria + RF traceability table → drives tests. |
| `.../4 Base de Datos/Bases de datos para la agencia de turismo sena.docx` | **Authoritative SQL script** (11 tables, MySQL). Extract text from the .docx; a prose summary also lives in `.../Agencia_Viajes.md` §4. |
| `.../3 Casos de Uso y Documentación CU/Documentación casos de uso (1).docx` | Detailed CU flows + field-level rules `CA01.1_*` (roles: VARCHAR lengths, uniqueness, confirmations). |
| `.../2 Matriz Historias de Usuario/*.xlsx` | Original 47-HU matrix (HU_01–HU_44, HU_67–69); note: Reservas/CRM/Ventas have **no numbered HU** in the source — SRS RFs are the fallback. |
| `.../Wireframe/` (17 PNG, marca "TourManager") | Layout contract `RNF-TEC-02`: sidebar (Dashboard, Usuarios, Roles, Módulos, Configuración, Reportes), breadcrumbs, list tables with ver/editar/cambiar estado, inline form validation. |
| `SDD-agencia-viajes.md` | Frontend design: business rules (§3), query-string contract (§6.3), dashboard spec (§9). |
| SRS refs `backend-requerimientos.txt` and `proyecto-agencia-viajes.md` at repo root | **Neither file exists.** This document replaces them as the backend spec. |

SRS explicitly **imposes no framework or language** (§2.5); MySQL is the only
mandated technology. The original spec's mention of a Razor `_Layout.cshtml`
implies ASP.NET MVC was anticipated, but any mainstream stack (ASP.NET,
Spring, Node/Express, PHP/Laravel, Django) is compliant. Stack choice is
Phase 0 decision #1.

---

## 4. User classes and role model

| Clase | SRS | Login | Access |
|---|---|---|---|
| Administrador | §2.3 | correo + contraseña | all modules |
| Cliente | §2.3 | correo + contraseña | own reservations, profile, receipts |

The SQL `Usuarios.rol` ENUM is `('Administrador', 'Agente', 'Cliente')` —
**`Agente` exists in the DB but not in the SRS user classes.** Decide in
Phase 0 (recommendation: keep it — seed the role, no UI class page needed).

The SRS additionally requires **full role CRUD with módulos/privileges**
(RF-ROL-01..07), which a plain ENUM cannot express → migration M1, Section 6.

---

## 5. Source conflicts — resolve before building

These are real contradictions between the SRS, the prose summaries, and the
SQL script. Each needs a decision (D-#) and, where noted, a migration.

| # | Conflict | Resolution |
|---|---|---|
| C-1 | `Reservas` has **no FK to `Paquetes_Turisticos` or `Transporte`**, yet SRS §6 / `Agencia_Viajes.md` §4 claim the relation, and RF-RES-01 requires booking those products. | **Migration M4**: add `Detalle_Reserva` (Section 6.4). Service layer enforces one product row per reserva. |
| C-2 | Role management (RF-ROL-01..07) vs `rol` ENUM. | **Migration M1**: `Roles` + `Modulos` + junction tables; ENUM deprecated then dropped after backfill (keep data intact per RNF-TEC-01). |
| C-3 | RF-CON-* requires contracts; **no `Contratos` table exists**. | **Migration M3**. |
| C-4 | RF-ITI-* requires itineraries; **no itinerary table exists**. | **Migration M2**. |
| C-5 | RF-ACC-04/05 password reset needs expiring tokens; no table. RF-RES-05/VEN-03 PDFs; RNF-SEG-02 audit log; **no tables**. | **Migrations M5 (tokens), M6 (bitácora)**. |
| C-6 | "Hotel" is bookable (RF-RES-01) but there is no `Hoteles` table. | **No new table.** Domain mapping: Vuelo → `Transporte` (tipo `Avión`), Hotel → `Servicios_Proveedor` (tipo `Hospedaje`), Paquete → `Paquetes_Turisticos`. Store the reference generically in `Detalle_Reserva` (`tipo` + `id_producto`). |
| C-7 | Frontend rule "Vuelo XOR Paquete" vs SRS "paquete, vuelo **u hotel**". | Compatible: exactly **one** product per booking; frontend simply exposes two of the three `tipo` values. Enforce single `Detalle_Reserva` row per reserva in the service layer. |
| C-8 | `Agencia_Viajes.md`: Ventas→Reservas **1:1**; Ficha mentions "**abonos**" (partial payments); schema allows 1:N (no UNIQUE). | Phase 0 decision #3. Recommendation: **1:N with abonos** (schema already allows it; comprobante shows paid-to-date vs `Reservas.total`). |
| C-9 | `Clientes` has no `documento`, but the frontend `reserva.html` form collects Documento and RF-USR-* uses documento for uniqueness. | **Migration M4**: add `Clientes.documento VARCHAR(20) UNIQUE` + Ley 1581 consent fields (RNF-PRI-01). |
| C-10 | `Reservas.total` "computed at booking, immutable" vs plain mutable column. | Service never UPDATEs `total`; add DB trigger rejecting `UPDATE total` (defense in depth) in migration M4. |
| C-11 | Current `FRONTEND/` is JS-free static HTML (phase-1 constraint). Backend integration needs interactivity (fetch, form POST, dynamic dashboard). | Phase 0 decision #4: server-rendered templates vs adding JS to `FRONTEND/`. The "no JS" rule applied to the *front-end phase only* — confirm before lifting it. |

---

## 6. Data model

### 6.1 Baseline (execute as-is)

Run the 11-table script from `4 Base de Datos/... .docx` verbatim, then apply
migrations M1–M6. **Use `utf8mb4`** — ENUM values contain accented Spanish
(`'Avión'`, `'Reunión'`, `'Correo electrónico'`). Exact ENUMs to preserve:

| Column | Values |
|---|---|
| `Usuarios.rol` | Administrador / Agente / Cliente (→ deprecated by M1) |
| `Reservas.estado` | Pendiente / Confirmada / Cancelada |
| `Servicios_Paquete.tipo_servicio`, `Proveedores.tipo_servicio` | Transporte / Hospedaje / Actividad / Seguro / Comida |
| `CRM.tipo_interaccion` | Llamada / Correo electrónico / Reunión / Encuesta |
| `Ventas.metodo_pago` | Tarjeta de Crédito / Transferencia / Efectivo |
| `Ventas.estado` | Pendiente / Pagado / Cancelado |
| `Transporte.tipo_transporte` | Avión / Autobús / Tren / Ferry / Coche |

Money: `DECIMAL(10,2)` everywhere; COP only. Timestamps default
`CURRENT_TIMESTAMP`.

### 6.2 M1 — Roles y módulos (RF-ROL-01..07)

- `Roles(id_rol PK, nombre VARCHAR(80) UNIQUE, descripcion VARCHAR(250), estado BOOLEAN)`
- `Modulos(id_modulo PK, nombre UNIQUE, descripcion)` — one row per sidebar
  module from the wireframes (Dashboard, Usuarios, Roles, Módulos,
  Configuración, Reportes, Reservas, Paquetes, Proveedores, Contratos,
  Transporte, CRM, Ventas).
- `Roles_Modulos(id_rol FK, id_modulo FK, PK(id_rol, id_modulo))`.
- `Usuarios.id_rol FK → Roles`; backfill from old ENUM, then drop the ENUM.
- Rules from CU.01.1: ≥1 privilegio to save, unique name on create *and* edit,
  cannot deactivate a role with active users (RN-03), state change never
  deletes history.

### 6.3 M2 — Itinerarios (RF-ITI-01..03)

- `Itinerarios(id_itinerario PK, id_paquete FK, titulo, estado)`
- `Actividades_Itinerario(id_actividad PK, id_itinerario FK, fecha, hora_inicio, hora_fin, descripcion, orden)`

### 6.4 M3/M4 — Contratos y detalle de reserva

- `Contratos(id_contrato PK, id_proveedor FK, numero, fecha_inicio, fecha_fin,
  objeto TEXT, estado, created_at)` +
  `Otrosis(id_otrosi PK, id_contrato FK, descripcion, fecha, vigencia_desde,
  vigencia_hasta)` — RF-CON-03 requires preserving prior versions (never
  overwrite; append an Otrosí).
- `Detalle_Reserva(id_detalle PK, id_reserva FK, tipo ENUM('Paquete','Vuelo','Hotel'),
  id_producto INT, titulo VARCHAR(255), precio_unitario DECIMAL(10,2), pasajeros INT,
  fecha_salida DATE, fecha_llegada DATE)` — exactly **one row per reserva** (C-1,
  C-7); snapshot `titulo`/`precio_unitario` so later catalog edits don't rewrite
  history or totals.
- `Reservas.numero_reserva VARCHAR(16) UNIQUE` — format `AV-YYYYMMDD-XXXX`.
- `Clientes.documento`, `Clientes.consentimiento BOOLEAN`,
  `Clientes.fecha_consentimiento TIMESTAMP` (Ley 1581, RNF-PRI-01).
- Trigger: reject `UPDATE ... total` on `Reservas` (C-10).

### 6.5 M5/M6 — Tokens y bitácora

- `Tokens_Recuperacion(id_token PK /* store hash only */, id_usuario FK,
  expira_at, usado BOOLEAN)` — single-use, expiry (RF-ACC-05).
- `Bitacora(id_bitacora PK, tabla, id_registro, accion ENUM('Crear','Editar','CambioEstado'),
  id_usuario FK, fecha_hora, detalle TEXT)` — mandatory for **roles, usuarios,
  contratos, ventas** (RNF-SEG-02). Never log passwords.
- `Retroalimentacion(id_feedback PK, id_paquete FK, id_cliente FK,
  calificacion TINYINT, comentario TEXT, fecha)` — RF-DES-01/02 (no table existed).

### 6.6 Referential integrity to preserve (SRS §6)

Usuarios→Reservas, Clientes→Reservas, Paquetes_Turisticos→Servicios_Paquete,
Proveedores→Servicios_Proveedor/Transporte, Ventas→Reservas. Migrations may
only **add** relations, never remove these.

---

## 7. Architecture

```
Request → HTTP layer (REST JSON / server-rendered pages)
        → Auth middleware (session cookie; role/permission check vs Roles_Modulos)
        → Module service (business rules: RN-*, totals, availability, RN-02)
        → Repository (SQL; parameterized only)
        → MySQL (utf8mb4)
Side effects: Email queue (≤60 s), Bitácora writer, PDF generator
```

- **Placement:** all backend code under `BACKEND/` (repo folder exists,
  currently empty except an empty `css/`). Frontend stays in `FRONTEND/`.
- **Config via environment variables** (Appendix A). No secrets in git — the
  repo has **no `.gitignore` yet; create one before the first `.env`**.
- Layering must keep rules (Section 9) out of controllers so they are unit-testable.

---

## 8. API specification

Conventions: JSON, Spanish error messages that state **cause + corrective
action** next to the field (RNF-USA-01 / wireframes), pagination
(`?pagina=&tamano=`), ISO 8601 dates, `401` unauthenticated / `403` wrong role /
`404` missing / `409` uniqueness conflicts (e.g. "El rol ya existe", "El
usuario ya está registrado" — exact wording fixed by SRS RF-ROL-02, RF-USR-02).
All admin endpoints require an Administrador session with the módulo permission.

### 8.1 Auth (RF-ACC-01..05)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login` | generic failure message (RF-ACC-02); redirect by role |
| POST | `/api/auth/logout` | destroys session server-side (RF-ACC-03) |
| POST | `/api/auth/recuperar` | email enlace; always 200 (no user enumeration) |
| POST | `/api/auth/restablecer` | body: token + nueva contraseña; rejects expired/used |

### 8.2 Admin CRUD (RF-*)

- `/api/roles` CRUD + `PATCH /{id}/estado` + `GET|POST|DELETE /{id}/modulos`
- `/api/usuarios` CRUD + `PATCH /{id}/estado` + `GET /?q=` (nombre/documento/rol)
- `/api/paquetes` CRUD + estado + `GET|POST /{id}/servicios` (RF-PAQ-02)
- `/api/itinerarios` CRUD + estado + `GET /{id}/actividades`
- `/api/proveedores` CRUD + `GET|POST /{id}/servicios` (RF-PRO-03)
- `/api/contratos` CRUD + `POST /{id}/otrosis` + `GET /verificar?proveedor=` (RF-CON-04)
- `/api/transporte` CRUD (RF-TRA-01/02)
- `/api/clientes` CRUD (consentimiento required) · `/api/clientes/{id}/ficha`
  (interacciones + reservas consolidadas, RF-CRM-03)
- `/api/clientes/{id}/interacciones` (RF-CRM-01)

### 8.3 Reservas (RF-RES-01..05) — core flow

1. `POST /api/reservas` (Cliente or Admin): `{tipo, id_producto, fechas,
   pasajeros, cliente{...documento}}` → validates **availability** (HU-10 CA3):
   paquete date range overlap, `Transporte.capacidad` vs pasajeros,
   `Servicios_Proveedor.disponible`; creates `Pendiente`; computes `total`
   server-side (product snapshot + `Servicios_Paquete` sum) — **never from the
   client**.
2. `PATCH /api/reservas/{id}/estado` (Admin) → on `Confirmada`: generate
   `numero_reserva` (today + 4 random chars), enqueue confirmation email.
3. `GET /api/reservas?estado=&fecha=` (Admin, HU-11) ·
   `GET /api/reservas/mias` (Cliente, HU-12) ·
   `GET /api/reservas/{numero}/comprobante` → PDF (RF-RES-05).

### 8.4 Ventas (RF-VEN-01..04)

- `POST /api/ventas` `{id_reserva, monto, metodo_pago}` → comprobante PDF.
- Card rejection → venta stays `Pendiente`, response includes motivo, client
  may retry with another method (RF-VEN-04).
- `GET /api/ventas/{id}/comprobante` → PDF (RF-VEN-03).

### 8.5 Desempeño (RF-DES-01..03) + dashboard

- `POST /api/retroalimentacion`, `GET /api/informes/{paquete|itinerario|transporte}?formato=csv|pdf` (exportable, RF-DES-03).
- `GET /api/dashboard/kpis`, `/api/dashboard/ventas-por-destino`,
  `/api/dashboard/ventas-por-mes`, `/api/dashboard/reservas-recientes` —
  data behind `dashboard.html` widgets (SDD front-end §9): Reservas hoy,
  Ingresos del mes, Paquetes activos, Vuelos vendidos; estados
  Confirmada/Pendiente/Cancelada.

---

## 9. Business rules (implement + test each)

| ID | Rule | Where |
|---|---|---|
| RN-01 | Only Administrador creates/edits/state-changes roles, proveedores, contratos. | permission middleware |
| RN-02 | A transporte provider must have an **active, in-force contract** to be assigned to a paquete/itinerario — reject with motivo (HU-09 CA3, RF-CON-04). | assignment service |
| RN-03 | A role with active users cannot be deactivated — reject with motivo (RF-ROL-06). | roles service |
| (front §3) | Booking = one product (Vuelo XOR Paquete, XOR Hotel); `total` frozen at creation; `numero_reserva` = `AV-YYYYMMDD-XXXX` at confirmation. | reservas service |
| (SRS) | Duplicate email/documento rejected with the exact SRS messages; roles need ≥1 privilege and unique names. | forms/API validation |

---

## 10. Security, privacy, audit (SRS §5.3)

- **TLS 1.2+** in production (RNF-SEG-01) — termination at reverse proxy.
- **Passwords**: bcrypt (or equivalent) + per-row salt, cost ≥12; never stored
  or logged in plaintext; excluded from bitácora (RNF-SEG-03).
- **Sessions**: server-side, `HttpOnly` + `SameSite` cookie, destroyed on
  logout; idle expiry. (JWT alternative acceptable but logout must still work.)
- **Bitácora**: roles/usuarios/contratos/ventas mutations (RNF-SEG-02).
- **Ley 1581 de 2012**: explicit consent at client registration, right to
  access/rectify (`GET /api/clientes/{id}`), no data shared with third parties
  beyond the booking (RNF-PRI-01).
- Login must not reveal whether the email exists (RF-ACC-02).

---

## 11. Integrations

| Integration | Trigger | Requirement | Fallback |
|---|---|---|---|
| Email (SMTP/API) | reservation confirmed (RF-RES-02); password reset (RF-ACC-04) | **sent within 60 s** of confirmation (RNF-REN-02) — use a queue/worker, not inline | dev: file/log transport; provider = **TBD-02** |
| Payment gateway | card payment (RF-VEN-02/04) | register method; rejection → venta `Pendiente` + motivo + retry | provider = **TBD-03**; if uncontracted, efectivo/transferencia only |
| PDF generation | RF-RES-05, RF-VEN-03 | printable comprobante (reserva confirmada / venta) | server-side lib; must render Spanish chars (utf8mb4) |

TBD decisions must land **before** building the module they gate (SRS App. C).

---

## 12. Non-functional requirements (summary — implement per SRS §5)

- **Performance**: package listing < 2 s at p95 with up to 100 concurrent users
  (RNF-REN-01; concurrency figure = TBD-04); confirmation email ≤ 60 s.
- **Availability**: 99% in 7am–10pm, monthly (RNF-CAL-01; 24/7 = TBD-05).
- **Responsive UI**: 360 px → 1920 px (RNF-CAL-02) — applies to server-rendered
  admin pages too; reuse the frontend design system where pages overlap.
- **Inline validation** with errors beside fields (RNF-USA-01).
- Spanish only, COP (SRS §6).

---

## 13. Testing strategy (deliverable: "Informe de pruebas")

- **Unit tests**: every rule in Section 9 (totals immutability, availability,
  RN-02/03, number format, ENUM constraints).
- **API/integration tests** against a scratch MySQL DB (utf8mb4): full CRUD per
  module + the unhappy paths named in the SRS (duplicates, expired token,
  rejected payment, inactive role with users).
- **Traceability**: each `RF-*` maps to ≥1 test; use the HU Given-When-Then
  criteria as scenarios (`historias-usuario-Agencia_Viajes.md`).
- **Load test** for RNF-REN-01 (after TBD-04).
- **Security spot-checks**: no user enumeration, session destruction, password
  never in logs/bitácora.

---

## 14. Action plan (implementation phases)

| # | Phase | Deliverable | Acceptance check |
|---|---|---|---|
| 0 | Decisions & setup | Stack (D-1), Agente role (D-2), Ventas 1:N abonos (D-3), JS/server-render (D-4); `.gitignore` + `.env` | TBD-02/03 answered or explicitly deferred with fallback |
| 1 | Schema | Baseline script + migrations M1–M6 + seed (roles, módulos, admin user) | All 11 baseline tables intact (RNF-TEC-01); `utf8mb4`; FKs from §6.6 hold |
| 2 | Auth & roles | login/logout/reset, Roles/Usuarios CRUD, bitácora | RF-ACC-01..05, RF-ROL-01..07, RF-USR-01..06 pass; exact SRS error messages |
| 3 | Catálogo | Paquetes + servicios, Itinerarios + actividades | RF-PAQ-*, RF-ITI-*; RNF-REN-01 baseline measured |
| 4 | Cadena | Proveedores, servicios, Contratos + otrosí, Transporte | RF-PRO-*, RF-CON-*; **RN-02 rejection verified** |
| 5 | Reservas | full flow §8.3: availability, total, `AV-` number, email ≤60 s, PDF | RF-RES-01..05; frontend rules (XOR, immutability) hold |
| 6 | Ventas | payments, abonos, comprobantes, rejected-card path | RF-VEN-01..04 (or efectivo/transferencia if TBD-03 negative) |
| 7 | CRM & Desempeño | interacciones, ficha consolidada, retroalimentación, informes exportables, dashboard API | RF-CRM-*, RF-DES-*; dashboard.html consumes real data |
| 8 | Frontend bridge | serve `FRONTEND/`, wire query-string contract, fix stray `BACKEND/css/styles.css` link in `index.html`, shared navbar/footer decision (D-4) | Full journey index → buscar → reserva → confirmación works against the API |
| 9 | Hardening & QA | TLS, load test, a11y/responsive pass, bitácora audit review | All RNF verified; **Informe de pruebas** green |
| 10 | Handoff | Manual de usuario + manual técnico (Ficha deliverables) | Docs reference this SDD + SRS IDs |

Order matters: 0 → 1 → 2 → (3 ∥ 4) → 5 → 6 → 7 → 8 → 9 → 10. Phases 3 and 4
are parallelizable after 1–2.

### Sign-off checklist

- [ ] Every `RF-*` in SRS §4 implemented and covered by a test.
- [ ] RN-01/02/03 enforced server-side (not just in the UI).
- [ ] `total` immutable; `numero_reserva` matches `AV-YYYYMMDD-XXXX`; one product per reserva.
- [ ] bcrypt passwords; generic login errors; logout destroys session; no secrets committed.
- [ ] Bitácora registers roles/usuarios/contratos/ventas changes with user, timestamp, action.
- [ ] Confirmation email sent within 60 s; password-reset links expire and are single-use.
- [ ] Ley 1581 consent captured; client data rectifiable.
- [ ] UTF-8 renders accented ENUMs and Spanish PDF text correctly.
- [ ] Informe de pruebas, manual de usuario, manual técnico delivered.

---

## Appendix A — Environment variables

```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD      # MySQL, utf8mb4
APP_BASE_URL                                          # for reset links
SESSION_SECRET
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM   # TBD-02
PAYMENT_API_KEY, PAYMENT_BASE_URL                     # TBD-03 (optional)
RESET_TOKEN_TTL_MINUTES                               # recommend 30
```

Store in `.env` (git-ignored). Seed data: roles (Administrador, Agente,
Cliente), módulos per wireframe sidebar, one admin account, `Configuraciones`
rows (e.g., `prefijo_reserva = AV`, `moneda = COP`).

## Appendix B — Open decisions (TBD registry)

| ID | Decision | Owner | Gates |
|---|---|---|---|
| D-1 / TBD-* | Backend stack (SRS imposes none; Razor hinted in original spec) | team | Phase 0 |
| D-2 | Keep `Agente` role? | team | Phase 1 |
| D-3 | Ventas 1:1 vs abonos 1:N (C-8) | client | Phase 6 |
| D-4 | Server-rendered templates vs adding JS to `FRONTEND/` | team | Phase 8 |
| TBD-01 | Agency commercial name/contacts | client | production |
| TBD-02 | Email provider | project admin | Phase 5 |
| TBD-03 | Payment gateway (else efectivo/transferencia) | client | Phase 6 |
| TBD-04 | Expected concurrent load | client | Phase 9 |
| TBD-05 | 24/7 vs 7am–10pm availability | client | SLA/Phase 9 |
