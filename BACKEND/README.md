# TourManager - Backend (API REST v1)

API REST del Sistema de Gestión de Operaciones Turísticas (TourManager) para la
agencia de viajes. Node.js + Express 5 con arquitectura en capas
`rutas → controladores → servicios → repositorios` sobre MySQL (mysql2/promise).

## Requisitos

- Node.js ≥ 18 (probado con v24)
- MySQL 8.x con el esquema `tourmanager` importado

## Instalación

```bash
cd BACKEND
npm install
cp .env.example .env    # complete credenciales de MySQL y JWT_CLAVE (mínimo 16 caracteres)
```

## Base de datos

```bash
mysql -u <usuario> -p < database/datos_agencia_viajes.sql
```

El script crea el esquema `tourmanager` (utf8mb4), 24 tablas y datos de ejemplo:
roles `Administrador`/`Cliente`, módulos, configuraciones y dos usuarios demo:

| Usuario | Correo | Contraseña | Rol |
|---------|--------|------------|-----|
| Administrador | `admin1@tourmanager.com` | `Admin123*` | Administrador |
| Cliente | `cliente@tourmanager.com` | `Cliente123*` | Cliente |

> Cambie estas credenciales en cualquier entorno que no sea local.

## Ejecución

```bash
npm start        # node app.js
npm run dev      # node --watch app.js (desarrollo)
```

- API base: `http://localhost:3000/api/v1`
- Salud: `GET /api/v1/salud` (200 con BD disponible, 503 si no)
- Apagado controlado con `Ctrl+C` (SIGINT/SIGTERM): cierra el pool ordenadamente.

## Estructura

```
BACKEND/
├── app.js               # Aplicación Express + apagado controlado
├── config/              # entorno, pool MySQL, logger Winston
├── controllers/         # Traducción HTTP ↔ servicio (16 módulos)
├── services/            # Reglas de negocio y transacciones
├── repositories/        # SQL parametrizado (sin reglas de negocio)
├── routes/              # Enrutadores /api/v1 (+ validación Joi)
├── validators/          # Esquemas Joi por módulo
├── models/              # Entidades de dominio ES6 (18 clases + comun.js)
├── middleware/          # auth JWT, validación, errores, límites, saneamiento, logs
├── utils/               # ErrorApi, JWT, bcrypt, paginación, PDF, respuestas
├── database/            # datos_agencia_viajes.sql (esquema + datos demo)
├── docs/                # MATRIZ_TRAZABILIDAD.md, DICCIONARIO_NOMBRES.md
└── postman/             # Colección y entorno listos para importar
```

## Documentación

- `docs/MATRIZ_TRAZABILIDAD.md`: los 50 RF del SRS ↔ endpoints ↔ capas ↔ estado.
- `docs/DICCIONARIO_NOMBRES.md`: nomenclatura (español camelCase ↔ snake_case),
  entidades, estados, errores y variables de entorno.
- `postman/`: importar `TourManager.postman_collection.json` y el entorno
  `TourManager-Local.postman_environment.json`. Ejecutar primero
  "Autenticación > Iniciar sesión" (guarda `{{token}}` automáticamente).

## Seguridad y datos personales

- Contraseñas con bcrypt (12 rondas); nunca se exponen en respuestas ni logs.
- JWT obligatorio (Bearer) en todos los endpoints salvo salud y autenticación.
- RBAC por rol: `Administrador` y `Cliente`.
- Ley 1581 de 2012: consentimiento en el registro, acceso/rectificación/supresión
  en `GET/PATCH/DELETE /api/v1/clientes/:id/datos-personales` (la supresión anonimiza
  conservando la trazabilidad contable de reservas).
- helmet, CORS restringido por `CORS_ORIGENES`, rate limiting (300/15 min global,
  20/15 min en autenticación) y saneamiento de entradas.
- Auditoría en tabla `bitacora` (quién, qué tabla, qué acción, cuándo).

## Decisiones de diseño relevantes

| Decisión | Justificación |
|----------|---------------|
| Joi para validación | Declarativo, `abortEarly:false` devuelve todos los errores por campo, `stripUnknown` evita campos no previstos; sin necesidad de TypeScript |
| Comprobantes PDF generados al vuelo | No se almacenan archivos (el esquema no guarda binarios); `comprobante_ruta` guarda la ruta de descarga |
| Pago con Tarjeta | Queda `Pendiente` con motivo explícito: no hay pasarela contratada (TBD-03); reintentable con Transferencia/Efectivo |
| Cupo por paquete/fecha | Aproximado por suma de `num_pasajeros` vs configuración `cupo_maximo_viaje` (el esquema no tiene tabla de cupos) |
| Reservas solo de paquetes | El esquema no modela vuelos/hoteles independientes (supuesto S-5 del análisis de contexto) |

## Verificación rápida

```bash
# Sintaxis de todo el código
node --check app.js

# Arranque y salud (requiere .env con JWT_CLAVE)
npm start
curl http://localhost:3000/api/v1/salud
```
