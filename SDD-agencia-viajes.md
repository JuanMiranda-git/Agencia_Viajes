# Software Design Document (SDD)

## Tours Out Here — Agencia de Viajes (Front-end)

| | |
|---|---|
| **Document** | Software Design Document |
| **Project** | Tours Out Here — modern travel agency website |
| **Version** | 1.0 |
| **Date** | 2026-09-15 |
| **Phase** | Front-end (HTML5 + CSS3 only) |
| **Status** | Draft for review |

---

## 1. Purpose

This Software Design Document specifies the design of a modern travel agency
website ("Tours Out Here") to be implemented with **HTML5 and CSS3 only**. It
exists so that the front-end team can build the site without guesswork, using:

- the authoritative palette values declared in Section 5.2 and implemented in
  `FRONTEND/css/desingSystem.css`;
- the local photographic assets in a **"Human in Motion"** style;
- **fluid measurements** so the site is usable on any device (phone, tablet,
  desktop);
- a defined **dashboard** section (instructions included in Section 9).

This document is the action-plan basis for the implementation described in
Section 11.

---

## 2. Scope

In scope:

- All public-facing pages (home, search results, details, catalog, booking
  flow, contact, about).
- A front-end `dashboard.html` with KPIs, charts and tables built entirely with
  HTML5 + CSS3 (static demo data).
- The visual identity (palette, typography, imagery style "Human in Motion").
- A responsive measurement system valid on any device.

Out of scope:

- Back-end, APIs, databases, authentication and payment gateways
  (see `backend-requerimientos.txt`, owned by the back-end team).
- JavaScript in any form. **Interactivity must be solved with CSS** (see
  Section 7.5).

---

## 3. Reference documents & context

| Reference | Where | What it gives us |
|---|---|---|
| `carpetaProyecto/Agencia_Viajes/Requisitos (SRS)/SRS-Agencia_Viajes-v1.0.md` | Project requirements | Authoritative `RF-*`, `RNF-*`, and `RN-*` requirements |
| `carpetaProyecto/Agencia_Viajes/Requisitos (SRS)/historias-usuario-Agencia_Viajes.md` | Project requirements | Given-When-Then acceptance scenarios and HU traceability |
| `carpetaProyecto/Agencia_Viajes/Agencia_Viajes.md` | Project reference | Original scope, entities, and database summary |
| `carpetaProyecto/Agencia_Viajes/Wireframe/` | Project reference | TourManager administrative layout and interaction reference |
| `FRONTEND/css/desingSystem.css` | `FRONTEND/css/` | Canonical design-system tokens and foundational CSS |
| `FRONTEND/*.html` | `FRONTEND/` | Current public-page entrypoints and legacy markup to migrate |

> Note: the palette values in Section 5.2 are authoritative for the token file.
> The historical `img/Paleta.png` reference must not be required at runtime; if
> that source asset is restored, it may only be used as design provenance.

**Business rules carried over from the original spec:**

- A booking (`Reserva`) is associated with a **Vuelo OR a Paquete**, never both.
- The **Total** is computed at booking time and does not change afterwards.
- A reservation number is generated at confirmation (`AV-YYYYMMDD-XXXX`).
- All visible interface text is in **Spanish**.

**Repository note (important for builders):**

- The current public entrypoints are under `FRONTEND/`; `BACKEND/` is reserved
  for the later server implementation.
- Before editing, check `git status`: the current checkout contains an
  unfinished relocation from the historical root-level site to `FRONTEND/`.
- Keep changes path-specific; do not stage unrelated untracked reference files.

---

## 4. Requirements

### 4.1 Functional requirements

| ID | Requirement |
|---|---|
| FR-01 | Home page (`index.html`) with hero search (origin, destination, date, passengers), featured destinations, promoted packages, trust section, footer. |
| FR-02 | Search results page (`buscar.html`) listing flight cards with airline, times, stops, price, and a "See detail" action. |
| FR-03 | Detail pages for a flight (`vuelo.html`) and a package (`paquete.html`) with full info and a "Reserve" action. |
| FR-04 | Package catalog (`catalogo.html`) filterable by country and price range. |
| FR-05 | Booking form (`reserva.html`) with customer fields and an order summary showing the total. |
| FR-06 | Confirmation page (`confirmacion.html`) showing the generated reservation number and summary. |
| FR-07 | Static `contacto.html` and `nosotros.html`; contact form shows a success message only. |
| FR-08 | `login.html` (mock) present; admin CRUD is not built in this phase. |
| FR-09 | **Dashboard** (`dashboard.html`) with KPIs, pure-CSS charts, recent bookings table and destination performance (Section 9). |
| FR-10 | Every destination card must use the "Human in Motion" photo treatment (Section 5.4). |

### 4.2 Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | **HTML5 + CSS3 only.** No JavaScript, no frameworks, no CDN at runtime. All assets are local under `FRONTEND/fonts/`, `FRONTEND/img/`, and `FRONTEND/css/`. |
| NFR-02 | **Any-device viewing.** Use `rem` for all fixed dimensions and spacing; use `%`, `vw`/`vh`, `fr`, `clamp()`, `min()`/`max()` only for fluid layout. Body layout must not overflow at a `20rem` viewport. Absolute pixel units are prohibited. |
| NFR-03 | Responsive, mobile-first: breakpoints at `36rem / 48rem / 62rem / 75rem` (see 7.6). |
| NFR-04 | Identical shared header (`.navbar-site`) and footer (`.footer-site`) on all pages. |
| NFR-05 | All visible text in Spanish; semantic HTML5 landmarks; `alt` on images; labels on form fields. |
| NFR-06 | Accessibility: focus-visible states, `prefers-reduced-motion` support, WCAG-AA contrast for text. |
| NFR-07 | Performance: reserve media space with CSS `aspect-ratio` and fluid media rules to avoid layout shift; no render-blocking third-party. |

---

## 5. Visual identity — "Human in Motion"

### 5.1 Brand

- Name: **Tours Out Here**.
- Style concept: an editorial, dynamic travel agency — static destinations are
  secondary; **people moving through the world** is the hero.
- Tone: high-contrast editorial "Midnight & Gold" style — deep indigo and
  navy surfaces with gold and amber accents — paired with cinematic,
  motion-filled photography.

### 5.2 Color palette (authoritative token values)

Authoritative hex codes, listed **in order of importance** (as provided by the
product owner). Declare them as CSS custom properties on `:root` (`--primario`,
`--dorado`, `--oliva`, ...) and consume them from `FRONTEND/css/desingSystem.css` — pure CSS,
no external framework.

| # | Token | Hex | Role |
|---|---|---|---|
| 1 | `--primario` | `#2000B8` | **Primary brand** — buttons, links, active states |
| 2 | `--dorado` | `#B8A200` | **Secondary accent** — highlights, trend-up, CTAs on dark |
| 3 | `--primario-oscuro` | `#312378` | **Primary dark** — hover states, gradients, dark sections |
| 4 | `--oliva` | `#635A00` | **Tertiary / muted accent** — borders, secondary emphasis |
| 5 | `--medianoche` | `#000338` | **Deepest tone** — body text on light, footers, dashboard shell, dark backgrounds |
| 6 | `--ambar` | `#F4A020` | **Warm accent** — badges, small emphasis, alerts, focus rings |

Usage rules:

- Derive light surface tokens from the palette (they are not in the 6 hex
  codes): `--superficie: #FDF6E4` (light "paper" for `<main>`, cards, forms,
  zebra rows) and muted text `--medianoche` at ~72% opacity (`rgba(0,3,56,.72)`).
  Declare them in `:root` next to the palette tokens.
- Darkest tone (`--medianoche`) for hero overlays, footer and dashboard
  sidebars; `--primario-oscuro` for mid-dark sections.
- Text on light surfaces uses `--medianoche`; text on dark surfaces uses a
  near-white tint. Verify WCAG-AA contrast (NFR-06).
- Primary actions use `--primario`; confirmations/positive states `--dorado`;
  warnings `--ambar`.
- Photo overlays reuse palette colors with CSS `mix-blend-mode` and gradient
  overlays (Section 5.4.2), keeping the whole site color-coherent.
- Map into custom properties for components: primary actions `--primario`,
  body text `--medianoche` on light surfaces, link hover `--dorado`.

### 5.3 Typography

Local variable fonts only (in `FRONTEND/fonts/`, no web font service, no CDN):

| Role | Family | Fallback |
|---|---|---|
| Headings / hero | `Playfair Display` | Georgia, serif |
| Body | `EB Garamond` | Georgia, serif |

- Size headings with the fluid tokens in `FRONTEND/css/desingSystem.css`; the hero uses `--font-size-hero`.
- Body base is `--font-size-body` with `--line-height-body`; small print uses `--font-size-body-sm` and `.texto-muted`.
- Weight/style defaults: headings `Playfair Display` 600–900; body and UI text
  `EB Garamond` 400 (italic reserved for quotes/brand accents).
- `.kicker` consumes `--font-size-kicker` and `--letter-spacing-kicker`; its
  underlying value is `clamp(0.75rem, 0.9vw, 0.85rem)` and `0.08em`.

### 5.4 Photography — "Human in Motion"

Two complementary asset families exist in `FRONTEND/img/`:

1. **Place shots** — destination without people:
   `parisFrancia.jpg`, `romaItalia.jpg`, `berlinAlemania.jpg`,
   `cartagenaColombia.jpg`, `kyotoJapon.jpg`, `rioBrasil.jpg`, `delhIndia.jpg`,
   `bannerIndex.jpeg`.
2. **Human-in-motion shots** — people captured in motion at the destination:
   `parisMujer.jpg`, `romaMujer.jpg`, `berlinMujer.jpg`, `cartagenaMujer.jpg`,
   `rioMujer.jpg`, `dalhiMujer.jpg`, `kyotoMujer.png`, and the `*Motion.jpeg`
   variants (`parisMujerMotion.jpeg`, `romaMujerMotion.jpeg`,
   `berlinMujerMotion.jpeg`, `cartagenaMujerMotion.jpeg`,
   `rioMujerMotion.jpeg`, `delhiMujerMotion.jpeg`, `kyotoMujerMotion.jpeg`).

#### 5.4.1 Placement per destination

| Destination | Place shot (backgrounds) | Human-in-motion shot (cards / heroes) |
|---|---|---|
| París | `parisFrancia.jpg` | `parisMujerMotion.jpeg` |
| Roma | `romaItalia.jpg` | `romaMujerMotion.jpeg` |
| Berlín | `berlinAlemania.jpg` | `berlinMujerMotion.jpeg` |
| Cartagena | `cartagenaColombia.jpg` | `cartagenaMujerMotion.jpeg` |
| Kioto | `kyotoJapon.jpg` | `kyotoMujerMotion.jpeg` |
| Río | `rioBrasil.jpg` | `rioMujerMotion.jpeg` |
| Delhi | `delhIndia.jpg` | `delhiMujerMotion.jpeg` |
| Banner (home hero) | `bannerIndex.jpeg` | — |

#### 5.4.2 Treatment recipes (CSS-only)

- **Destination cards** use `object-fit: cover` inside an `aspect-ratio`
  box (e.g. `4/3` or `16/9`). A color-overlay gradient (`--medianoche` →
  transparent) keeps text legible; add a subtle `mix-blend-mode` duotone using
  `--dorado`/`--primario` on the motion photo.
- **Hero (home)**: full-bleed motion photo, `width: 100%`, `min-height` with
  `clamp()`, overlaid with a `--medianoche` gradient and the `.kicker` + oversized
  `Playfair` title. Contrast the human-in-motion subject against a calm
  palette background.
- **Section dividers**: alternate `--primario-oscuro` and `--medianoche`
  backgrounds so place shots (cool, architectural) and motion shots (warm,
  human) alternate rhythm.
- **Cards in motion**: use CSS `transition`/`:hover` (e.g. the image
  `scale(1.05)` with `overflow: hidden` camera-zoom) and `prefers-reduced-motion`
  fallback that disables it.

### 5.5 Iconography

No icon framework. Use inline SVG icons (standards, color-matched to palette
tokens) for UI affordances: airplane (brand), search, map-pin, envelope,
telephone, WhatsApp, and social glyphs in `.redes`. Never use emojis in UI.

---

## 6. Site architecture

### 6.1 Page tree

```
index.html        Home (hero search, featured, mood selector)
  ├── buscar.html        Search results (flight cards, optional CSS filters)
  │     ├── vuelo.html   Flight detail
  │     └── paquete.html Package detail
  ├── catalogo.html      Package catalog (country / price filters)
  │     └── reserva.html Booking form + summary
  │           └── confirmacion.html  Confirmation
  ├── contacto.html
  ├── nosotros.html
  ├── login.html         (mock)
  └── dashboard.html     Admin dashboard (Section 9)
```

### 6.2 Shared layout

- `<header>` with `.navbar.navbar-site` (brand, links, collapse on mobile).
- `<main>` per page.
- `<footer>` with `.footer-site` (contact, social, `.footer-bottom`).
- Identical markup and classes on every page for future porting to a
  `_Layout.cshtml` (per original spec).

### 6.3 Navigation & state

- Plain relative URLs between pages (`index.html`, `buscar.html`, ...).
- Detail/booking pages document the query-string contract the back-end will
  consume (`vuelo.html?aerolinea=...&precio=...`,
  `reserva.html?tipo=vuelo&titulo=...`, `confirmacion.html?n=...&total=...`).
- **Static-data rule:** without JS, the pages cannot read those parameters at
  runtime. Each page shows **hardcoded demo data matching the documented
  query-string values**; the params are an illustrative future contract, not
  something the CSS-only pages read. Builders must not attempt to parse them.

---

## 7. Design system (CSS)

### 7.1 Tokens (`:root` in `FRONTEND/css/desingSystem.css`)

`FRONTEND/css/desingSystem.css` is the canonical design-system stylesheet. It defines
local `@font-face` declarations and the shared tokens consumed by every page.

- **Color:** `--primario`, `--dorado`, `--primario-oscuro`, `--oliva`,
  `--medianoche`, `--ambar`, plus surfaces, text, borders, overlays, gradients,
  and semantic aliases.
- **Typography:** `--ff-titulo`, `--ff-cuerpo`, `--font-size-*`,
  `--font-weight-*`, `--line-height-*`, and `--letter-spacing-*`.
- **Spacing:** the rem scale `--space-025`, `--space-05`, `--space-075`,
  `--space-1`, `--space-15`, `--space-2`, `--space-25`, `--space-3`,
  `--space-4`, `--space-5`, `--space-6`, `--space-8`, and `--space-10`, plus
  semantic section and inline aliases.
- **Layout and sizing:** `--content-max`, `--content-wide`, `--reading-max`,
  `--container-width`, `--grid-min`, `--grid-auto`, `--touch-target`,
  `--hero-min-height`, and the dashboard/layout dimensions.
- **Box dimensions:** `--box-width-md`, `--box-width-lg`, and `--box-width-xl`
  provide responsive medium-to-extra-large widths; `--box-height-md`,
  `--box-height-lg`, and `--box-height-xl` provide their corresponding heights.
- **Shape and effects:** `--radius-*`, `--border-width*`, `--shadow-*`,
  `--focus-ring-*`, `--duration-*`, `--ease-*`, and `--z-*`.
- **Component defaults:** control, button, card, badge, navigation, footer,
  avatar, and media tokens are defined once and consumed by components.
- **Responsive references:** `--breakpoint-sm` (`36rem`), `--breakpoint-md`
  (`48rem`), `--breakpoint-lg` (`62rem`), and `--breakpoint-xl` (`75rem`).
  Custom properties cannot be used inside media-query conditions, so future
  media queries must repeat these literal rem values.
- The current stylesheet is the token/foundation layer; page-specific component
  rules are added as the legacy markup is migrated. Components must consume
  these variables instead of introducing hard-coded colors or absolute units.

### 7.2 Fluid measurement strategy (any-device rule)

- **Measurement policy:** fixed dimensions, spacing, font sizes, radii, and
  media-query thresholds use `rem`. Absolute pixel units are prohibited.
  Percentages, `fr`, `vw`/`vh`, `clamp()`, `min()`, and `max()` are allowed
  only where they make a value fluid.
- Containers consume `var(--container-width)`, defined as
  `min(calc(100% - 2rem), var(--content-max))` and centered automatically.
- Fonts consume the `--font-size-*` and `--line-height-*` tokens (see 7.3).
- Media uses `max-width: 100%`, `height: auto`, and the `--aspect-*` tokens
  with `object-fit`.
- Grids consume `var(--grid-auto)` so columns wrap without fixed-width columns.
- Media-query thresholds use rem values only: `36rem`, `48rem`, `62rem`, and
  `75rem`.

### 7.3 Fluid type scale

| Style | Token | Underlying value |
|---|---|---|
| Hero title | `--font-size-hero` | `clamp(3rem, 10vw, 6rem)` |
| Section heading | `--font-size-h2` | `clamp(1.8rem, 4vw, 2.9rem)` |
| Card title | `--font-size-h3` | `clamp(1.35rem, 2.5vw, 1.75rem)` |
| Body | `--font-size-body` | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` |
| Kicker | `--font-size-kicker` | `clamp(0.75rem, 0.9vw, 0.85rem)` |

Components must reference these tokens rather than repeating literal font
sizes, line heights, or letter-spacing values.

### 7.4 Core components

Reuse current class conventions, but **re-author every one of them in
`FRONTEND/css/desingSystem.css`** (Bootstrap was removed — nothing comes from a library):

- Layout/grid: `.container`, `.col-*`/`.col-flight` columns, and display
  utilities `.d-none`, `.d-flex`, `.gap-*`, `.align-items-*`,
  `.justify-content-*` (implement these yourself, fluid `%`/`fr` only).
- Forms: `.form-label`, `.form-control`, `.form-select`, `.form-check`
  (input/select styling, focus states).
- `.navbar-site`, `.footer-site`, `.hero`, `.hero-marca`, `.hero-titulo`,
  `.hero-lead`, `.passepartout`, `.sello-precio`, `.rotulo-gira`.
- `.breadcrumb`, `.badge`, `.badge-escala`, `.list-group`.
- `.kicker`, `.section-site`, `.section-site--superficie` (canonical), and
  `.section-site--papel` (temporary compatibility alias for legacy markup),
  `.section-heading`, `.text-underline`, `.texto-muted`.
- Cards: `.card-destino`, `.card-paquete`, `.flight-card`, `[data-package-card]`.
- `.buscador`, `.mood-chip`, `.mood-group`, `.mood-label`, `.mood-group-title`.
- Buttons: `.btn`, `.btn-primary`, `.btn-outline-primary`, `.boton-accent`,
  `.btn-ver-mas` (states: default/hover/active/disabled).
- Timeline: `.diario-item`, `.diario-nodo`, `.diario-fecha` (flight/package diary).
- Reveal-on-scroll: `.reveal` / `.visible` (CSS-only, see 7.5).

### 7.5 Interactions — CSS-only (no JS)

- **Mobile menu / filters / tabs**: checkbox-hack
  (`<input type="checkbox" id="menu">` + `<label for="menu">`) with `.navbar-collapse`
  toggled by `:checked ~` selector.
- **Catalog/search filters**: prefer the `:has()` selector in supporting
  browsers, e.g. `body:has(#filtro-pais[value="cartagena"]:checked) [data-pais="cartagena"] { display:none }`,
  driven by radio inputs; elsewhere render mock data in pre-sorted static
  order. No JS, no requested-behavior promises beyond that.
- **Form success messages (contacto, reserva)**: reveal a `#gracias`/success
  `<section>` via the `:target` pattern (form `action="#gracias"`) or a
  checkbox-hack — never a server call. Input validation via HTML5 `required`
  + `:user-invalid` styling.
- **Accordions / item details**: native `<details>/<summary>`.
- **Dropdowns/hover menus**: `:hover` + `:focus-within`.
- **Charts**: static pure-CSS bars (width/height in `%`).
- **Mood selector chips (home)**: present as static, illustrative chips with
  `aria-disabled="true"`; the destination-suggestion behavior returns in the
  back-end phase.
- **Reservation number (confirmación)**: static demo value
  (`AV-20260901-0000`); generation is back-end logic.
- **Reveal animation**: `@keyframes` triggered by scroll via `animation-timeline`
  where supported, otherwise static visible; always honor `prefers-reduced-motion`.

### 7.6 Breakpoints (mobile-first)

All thresholds are expressed in `rem`; do not reintroduce absolute pixel
units when media queries are added.

| Breakpoint | Range | Behavior |
|---|---|---|
| base | `<36rem` | Single column, stacked hero, collapsed nav |
| `36rem` | `36rem–<48rem` | 2-fluid columns |
| `48rem` | `48rem–<62rem` | Tablet grid, expanded nav |
| `62rem` | `62rem–<75rem` | Desktop grid |
| `75rem` | `≥75rem` | Max container width, full hero |

Write media queries with `min-width` (mobile-first); keep the existing
`max-width` overrides only for targeted corrections. Because CSS custom
properties are not valid in media-query conditions, use the literal rem
thresholds above.

### 7.7 Motion & accessibility

- Wrap all motion in `@media (prefers-reduced-motion: reduce)` to disable
  transitions/scroll reveals.
- `:focus-visible` ring using `--ambar`.
- Color contrast AA for text on palette backgrounds (see 5.2 table).

---

## 8. Page-by-page specification

1. **`index.html`** — `.hero-marca` full-bleed motion photo
   (`bannerIndex.jpeg`), `.buscador` form, `.mood` selector chips (static,
   §7.5), featured destination cards (`.card-destino` with human-in-motion
   thumbs), promoted `.card-paquete`, trust/testimonials
   `.section-site--superficie`.
2. **`buscar.html`** — breadcrumb, filter bar (`.form-select`), `.col-flight`
   list of `.flight-card` cards with motion imagery, `.badge-escala`,
   `.duracion-vuelo`, `.hora-vuelo`, price; filters via `:has()`/static order
   (§7.5); "Ver detalle" → `vuelo.html`.
3. **`vuelo.html`** — hero panel with route `origen → destino`, airline/logo,
   `.diario-item` timeline, price (`.sello-precio`), "Reservar" →
   `reserva.html?tipo=vuelo`.
4. **`paquete.html`** — hero image (motion shot), title, `.icono-incluye` list,
   price, duration, diary timeline, "Reservar" →
   `reserva.html?tipo=paquete`.
5. **`catalogo.html`** — `[data-package-card]` grid with country/price filters,
   `.sinResultadosPaquetes` empty state.
6. **`reserva.html`** — HTML5-validated form (Nombre, Documento, Email,
   Teléfono), `.resumen` panel with items and Total (static demo price; it does
   not change), "Confirmar" → `confirmacion.html?n=...&total=...` (values are
   the documented demo data, §6.3).
7. **`confirmacion.html`** — big reservation number (static, §7.5), summary,
   success panel.
8. **`contacto.html` / `nosotros.html`** — static; contact form reveals a
   success section via `:target` (§7.5), no server call.
9. **`login.html`** — centered mock card; out of functional scope but styled.
10. **`dashboard.html`** — see Section 9.

Page specs may drop/replace leftover Bootstrap markup: remove `vendor/bootstrap`
and `bootstrap-icons` `<head>` links during Phase 1 (they already 404 after the
vendor removal) and re-implement those styles in `FRONTEND/css/desingSystem.css`.

---

## 9. Dashboard specification (instructions to build)

Goal: an **admin dashboard mock** (`dashboard.html`) — built with HTML5 + CSS3
only, static demo data, using the same palette/typography as the public site.

### 9.1 Layout

- Left **sidebar** (`.dashboard-sidebar`): fixed on desktop
  (`width: 16rem`), collapses to a `:checked`-hamburger overlay on mobile
  (checkbox-hack, Section 7.5). Brand at top ("Tours Out Here · Admin").
  Menu items (icons + Spanish labels): Inicio, Reservas, Vuelos, Paquetes,
  Destinos, Clientes, Usuarios, Configuración.
- **Topbar** (`<header class="dashboard-topbar">`): page title, search box,
  user chip (avatar initials), hamburger for mobile.
- **Content area** (`<main class="dashboard-contenido">`): grid of widgets,
  1 column on mobile → up to 4 on desktop via `auto-fit`.

### 9.2 Widgets

1. **KPI cards** (`.kpi-card` grid): Reservas hoy, Ingresos del mes (COP via
   `Intl`-style `$1.234.567` format is JS — use hardcoded Spanish-formatted
   strings), Paquetes activos, Vuelos vendidos. Each with a small trend badge
   (↑/↓ via `.badge` colors `--dorado` / `--ambar`).
2. **Charts (pure CSS, `%` widths/heights)**:
   - Bar chart "Ventas por destino" — a flex row of bars (`height` in `%`
     relative to the tallest stat bar), labels = destination names.
   - Horizontal bars "Ventas por mes" — width `%`.
   - Donut (optional) using `conic-gradient` with palette colors.
3. **Recent bookings table** (`.tabla-dash`): columns — Nº reserva, Cliente,
   Producto (Vuelo/Paquete + título), Fecha, Estado (`.badge`: Confirmada/
   Pendiente/Cancelada), Total (COP). `overflow-x: auto` wrapper for mobile.
4. **Quick links / pending panel**: list of pending reservations (`.list-group`).

### 9.3 Styling rules

- Use tokens (Section 5.2) exclusively; sidebar and chart bars use
  `--medianoche`/`--primario` with cream-tinted content surfaces.
- Status colors: Confirmada = `--dorado`, Pendiente = `--oliva`,
  Cancelada = `--ambar`.
- Tables get `thead` + `th` uppercase `.kicker`-style labels; zebra rows with
  a light tint of `--primario`.
- Responsive with the same breakpoints; charts never exceed viewport width.

### 9.4 Scope

- Static demo data; no login gate, no CRUD, no persistence (per original spec
  the admin CRUD belongs to the back-end team). The dashboard is a visual
  reference / handoff artifact.

---

## 10. Constraints & out of scope

- **HTML5 + CSS3 only** — no `.js` files, no inline `on*` handlers, no CDN.
- Local assets only: `FRONTEND/fonts/`, `FRONTEND/img/`, `FRONTEND/css/desingSystem.css`.
- No logic: bookings, prices, authentication, sorting, persistence or forms of
  real data handling. URL query strings are illustrative contracts only
  (§6.3); pages never read them.
- Admin CRUD/logic is the back-end team's responsibility
  (`backend-requerimientos.txt`).
- Keep identical navbar/footer across pages for later porting to Razor layout.
- `FRONTEND/css/desingSystem.css` is authored from scratch per Section 5.2; the previous
  "Costa Retro" palette/vendor references are removed.

---

## 11. Action plan (implementation phases)

| # | Phase | Deliverable | Acceptance check |
|---|---|---|---|
| 0 | Setup & audit | Inventory of pages/assets, file skeleton | Page tree + `FRONTEND/img/` naming matches SDD §5.4 |
| 1 | Design tokens & shared layout | Complete `FRONTEND/css/desingSystem.css` from the §7 token contract; `.navbar-site`, `.footer-site`; remove legacy vendor links; add container/grid utilities | Same header/footer on all pages; no absolute pixel units; no 404 vendor links; palette matches §5.2 |
| 2 | Home | `index.html` hero (banner + human-in-motion), search form, mood chips, featured cards, trust section | Palette + motion treatment applied; fluid hero at `20rem` |
| 3 | Catalog & search | `catalogo.html`, `buscar.html` with `.flight-card`/`[data-package-card]`, CSS filters/empty states | Cards use motion thumbs; no JS |
| 4 | Details & booking flow | `vuelo.html`, `paquete.html`, `reserva.html`, `confirmacion.html` | Summary/total readable; flow links correct query strings |
| 5 | Static pages | `contacto.html`, `nosotros.html`, `login.html` | Success message behavior CSS-only; consistent style |
| 6 | Dashboard | `dashboard.html` (sidebar, KPIs, CSS charts, bookings table) | Meets §9; responsive collapse on mobile |
| 7 | Responsive & device QA | Test at `20 / 36 / 48 / 62 / 75rem` | No horizontal overflow, touch targets ≥ `2.75rem` |
| 8 | Accessibility & motion | `prefers-reduced-motion`, `:focus-visible`, `alt`, labels, AA contrast | Automated/manual a11y pass green |
| 9 | Handoff | Updated `proyecto-agencia-viajes.md` notes + `backend-requerimientos.txt` pointers | Docs reference this SDD and dashboard |

Order matters: 0 → 1 → 2 → 3/4 → 5 → 6 → 7 → 8 → 9. Steps 3 and 4 can
proceed in parallel after Phase 2.

### Sign-off checklist

- [ ] HTML5 validator passes with no errors.
- [ ] Zero JS or external requests (open devtools Network — only local files).
- [ ] Palette matches Section 5.2 on every page.
- [ ] Every destination uses a human-in-motion image (§5.4.1).
- [ ] No horizontal scroll at `20rem`; desktop styled at `≥75rem`.
- [ ] Dashboard built per Section 9.

---

## 12. Appendix — target file structure

```
AgenciaViajes/
├── FRONTEND/
│   ├── index.html
│   ├── buscar.html
│   ├── catalogo.html
│   ├── vuelo.html
│   ├── paquete.html
│   ├── reserva.html
│   ├── confirmacion.html
│   ├── contacto.html
│   ├── nosotros.html
│   ├── login.html
│   ├── dashboard.html             <- planned static dashboard (Section 9)
│   ├── css/
│   │   └── desingSystem.css       <- canonical design-system tokens
│   ├── fonts/                     <- local variable fonts and licenses
│   │   ├── playfair-var.woff2 | playfair-italic-var.woff2
│   │   ├── ebgaramond-var.woff2 | ebgaramond-italic-var.woff2
│   │   └── OFL-PlayfairDisplay.txt | OFL-EBGaramond.txt
│   └── img/                       <- place and Human-in-Motion assets
├── BACKEND/                       <- reserved for the later API implementation
├── carpetaProyecto/Agencia_Viajes/  <- SRS, stories, schema, and wireframes
├── SDD-agencia-viajes.md
└── SDD-backend-agencia-viajes.md
```