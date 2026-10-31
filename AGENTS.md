# AGENTS.md

## Repo map
- `FRONTEND/`: customer-facing single-page site, brand **"Tours Out Here"**. `BACKEND/`: **TourManager** REST API (Express 5, CommonJS, MySQL). The two brands are intentional; do not unify them.
- Backend entry: `BACKEND/index.js` → `app.js`. `app.js` calls `listen()` at module load, so requiring the app starts a server (no test-only app export).
- Layer code lives in `BACKEND/src/`; ignore stale flat `BACKEND/controllers/` paths in git history/README.
- Requirements: `Agencia_Viajes_Contexto/`; SRS is under `Requisitos (SRS)/`, not the repo root. Wireframes use the admin brand "TourManager".
- Backend docs: `BACKEND/docs/MATRIZ_TRAZABILIDAD.md` (RF ↔ endpoint), `DICCIONARIO_NOMBRES.md` (naming, entities, states). `promt.txt` is the original backend build brief (criteria C1–C11).
- No CI, lint, test framework, root manifest, or OpenCode config.

## Commands (verified)
```bash
cd BACKEND
npm install
cp .env.example .env   # JWT_CLAVE must be >= 16 chars; entorno.js throws on require otherwise
npm start              # node index.js; PUERTO=3111 in current .env (default 3000)
npm run dev            # node --watch index.js
find src -name '*.js' -print0 | xargs -0 -n1 node --check   # only working syntax check
```
- `npm run check` is **broken**: it points to a missing `scripts/check-syntax.js`.
- Import DB: `mysql -u <user> -p < database/agencia_viajes.sql` (file creates/uses schema `tourmanager`). The README's `datos_agencia_viajes.sql` does not exist.
- API base `http://localhost:3111/api/v1`; health `GET /api/v1/salud`; Postman collection in `BACKEND/postman/` (no auth headers).

## Backend conventions
- Layers: routes → controllers → services → MySQL. `src/models/` are DB-independent domain classes (extend `ModeloBase`, private `#datos`), **not repositories**; all SQL/transactions belong in services.
- Services export named operations plus a `datos` sub-object for cross-service access (e.g. `paquetesService.datos.obtenerPorId`).
- Input validation: Joi schemas in `src/validators/*Validador.js`, wired as `validar('body'|'query'|'params')(schema)`.
- Throw `AppError` factories (`reglaNegocio`, `noEncontrado`, …); `middleware/errorHandler.js` renders `{ ok:false, codigo, mensaje, detalles? }`. Success uses `utils/respuesta.js` → `{ ok:true, mensaje, datos, meta? }` (root `/` is a legacy `exito` exception).
- Auth is **disabled for development**: `src/middleware/contextoDesarrollo.js` injects a fake `Administrador` (`idUsuario: null`) and `src/routes/index.js` mounts it before all routers. No JWT/role guards; controllers still require `req.usuario` for audit. Re-enable by removing that middleware and restoring guards from `middleware/autenticacion.js`.
- `postman/README_POSTMAN.md` is the manual verification guide (full route catalog, no token needed); the collection has no `Authorization` headers. API base `http://localhost:3111/api/v1`; health `GET /api/v1/salud`.
- DB pool: `mysql2/promise` in `config/database.js` (`dateStrings: true`, `decimalNumbers: true`); use `conTransaccion(fn)` for multi-step writes.
- Naming: Spanish camelCase for variables/JSON, snake_case for DB, files `modulo.controller.js` / `.service.js` / `.routes.js`. See `DICCIONARIO_NOMBRES.md`.
- Business rules: a reservation is for a **package only** (schema has no standalone flights/hotels); total is computed at creation and immutable; `AV-YYYYMMDD-XXXX` is generated only on confirmation; states `Pendiente → Confirmada → Cancelada`.
- Demo users: `admin1@tourmanager.com` / `Admin123*`, `cliente@tourmanager.com` / `Cliente123*`.

## Frontend
- `html/index.html` loads `../css/main.css` and `../javascript/main.js`, but **`FRONTEND/javascript/main.js` does not exist**; today the page renders an empty `#aplicacion` shell. JS is expected here, not forbidden.
- `css/main.css` is the only stylesheet importer: `desingSystem.css` (canonical tokens + base elements) first, then the numbered `01-tokens` … `07-paginas` partials. Put new styles in the matching layer and add the `@import` in `main.css`.
- `css/styles.css` is not imported anywhere; editing it has no effect.
- Define raw design values only in `desingSystem.css` (Midnight & Gold: `--primario #2000B8`, `--dorado #B8A200`, `--medianoche #000338`); `01-tokens/_tokens.css` is an alias layer over those tokens.
- Only `index.html` exists; the old `vuelo.html` / `reserva.html` / `confirmacion.html` query-string contract is not implemented.
- UI text Spanish; currency COP formatted `$1.234.567`.

## Known doc drift (trust code)
- README says `node app.js` and port 3000; actual entry is `index.js` and current `.env` uses 3111.
- `MATRIZ_TRAZABILIDAD.md` links the SRS at the repo root; the real path is `Agencia_Viajes_Contexto/Requisitos (SRS)/SRS-Agencia_Viajes-v1.0.md`.
