# AGENTS.md

## Repo structure
- `FRONTEND/`: Static HTML/CSS only (no JavaScript). Entry `FRONTEND/html/index.html`. Styles: `FRONTEND/css/styles.css`, `FRONTEND/css/desingSystem.css` (canonical design tokens).
- `BACKEND/`: Express + MySQL2, `package.json` defines deps (express, mysql2, dotenv, cors). App source directories (controllers, routes, models, services, middleware, config, utils) are currently empty. `database/datos_agencia_viajes.sql` is the schema for `tourmanager`.
- `Agencia_Viajes_Contexto/`: Authoritative requirements (SRS, user stories, wireframes, cases). Read these for business rules/UX contracts.
- `SDD-agencia-viajes.md`, `SDD-backend-agencia-viajes.md`: Implementation contracts; front-end SDD is authoritative for palette/tokens.

## Business rules (must honor)
- Booking (`Reserva`) is for a **Vuelo OR a Paquete, never both**.
- **Total is computed at booking time and never changes afterwards**.
- Confirmation number format: **`AV-YYYYMMDD-XXXX`**, generated at confirmation.
- Query-string contract (back-end future): `vuelo.html?aerolinea=...&precio=...`, `reserva.html?tipo=vuelo&titulo=...`, `confirmacion.html?n=...&total=...`.
- UI text in **Spanish**; currency **COP** (format `$1.234.567`).
- Wireframes reference brand **"TourManager"** (admin layout).

## Design system
- Treat `FRONTEND/css/desingSystem.css` as the canonical source of design tokens. Do not guess palette values; if conflicting, trust that file per SDD §5.2.

## Backend
- Database schema: `BACKEND/database/datos_agencia_viajes.sql` (MySQL, schema `tourmanager`). Use utf8mb4.
- Dependencies present: express ^5.3.0, mysql2 ^3.24.6, dotenv ^18.0.8, cors ^2.8.6. No npm scripts defined.
- App code paths expected under BACKEND: `controllers/`, `routes/`, `models/`, `services/`, `middleware/`, `config/`, `utils/`. They are empty currently.
- Avoid adding JS to FRONTEND unless explicitly requested; project is HTML/CSS-only for frontend phase.

## Commands
- Backend (from `BACKEND/`): run app with `node <entry>` (no start script). If creating entry, prefer `app.js`/`server.js` and document in README/package.json if needed.
- DB: import schema via `mysql` (e.g. `mysql -u <user> -p tourmanager < database/datos_agencia_viajes.sql`).

## Investigation priority
1. `SDD-agencia-viajes.md`, `SDD-backend-agencia-viajes.md`
2. `Agencia_Viajes_Contexto/SRS-Agencia_Viajes-v1.0.md`, `Agencia_Viajes_Contexto/historias-usuario-Agencia_Viajes.md`
3. `BACKEND/database/datos_agencia_viajes.sql`, `FRONTEND/css/desingSystem.css`
4. Wireframes in `Agencia_Viajes_Contexto/Wireframe/` (UX contracts)
5. Existing instruction files: none found (no AGENTS.md/CLAUDE.md/.cursor/). Keep this file minimal and repo-specific.

## Notes
- Do not invent npm scripts or tooling not present. Prefer executable sources over prose.
- If docs conflict with schema/scripts, trust executable sources (schema, CSS tokens, package.json).
