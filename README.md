# TourManager - Backend (API REST v1)

API REST del Sistema de Gestión de Operaciones Turísticas (TourManager) para la
agencia de viajes. Node.js + Express 5 con arquitectura en capas
`rutas → controladores → servicios (reglas de negocio + SQL)` sobre MySQL (mysql2/promise).

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
mysql -u <usuario> -p < database/agencia_viajes.sql
```

El script crea el esquema `tourmanager` (utf8mb4), 24 tablas y datos de ejemplo:
roles `Administrador`/`Cliente`, módulos, configuraciones y usuarios demo; por ejemplo:

| Usuario | Correo | Contraseña | Rol |
|---------|--------|------------|-----|
| Administrador | `admin1@tourmanager.com` | `Admin123*` | Administrador |
| Cliente | `cliente@tourmanager.com` | `Cliente123*` | Cliente |

> Cambie estas credenciales en cualquier entorno que no sea local.

## Ejecución

```bash
npm start        # node index.js
npm run dev      # node --watch index.js (desarrollo)
```

- API base: `http://localhost:3111`
- Salud: `GET /api/v1/salud` (200 con BD disponible, 503 si no)
- Apagado controlado con `Ctrl+C` (SIGINT/SIGTERM): cierra el pool ordenadamente.

## Estructura

```
BACKEND/
├── index.js             # Punto de entrada (carga app.js)
├── app.js               # Aplicación Express + apagado controlado
├── src/
│   ├── config/          # entorno, pool MySQL, logger Winston
│   ├── controllers/     # Traducción HTTP ↔ servicio (22 módulos)
│   ├── services/        # Reglas de negocio, transacciones y SQL parametrizado
│   ├── routes/          # Enrutadores /api/v1 (+ validación Joi)
│   ├── validators/      # Esquemas Joi por módulo
│   ├── models/          # Entidades de dominio ES6 (18 clases + comun.js)
│   ├── middleware/      # contexto de desarrollo, validación, errores, límites, logs
│   └── utils/           # AppError, JWT, bcrypt, paginación, PDF, respuestas
├── database/            # agencia_viajes.sql (esquema + datos demo)
├── docs/                # MATRIZ_TRAZABILIDAD.md, DICCIONARIO_NOMBRES.md
└── postman/             # Colección, entorno y README_POSTMAN.md
```

## Documentación

- `docs/MATRIZ_TRAZABILIDAD.md`: los 50 RF del SRS ↔ endpoints ↔ capas ↔ estado.
- `docs/DICCIONARIO_NOMBRES.md`: nomenclatura (español camelCase ↔ snake_case),
  entidades, estados, errores y variables de entorno.
- `postman/`: importar `TourManager.postman_collection.json` y el entorno
  `TourManager-Local.postman_environment.json`. No hace falta iniciar sesión;
  consulte `postman/README_POSTMAN.md` para el catálogo completo de rutas.

## Seguridad y datos personales

- **Modo desarrollo:** JWT y RBAC están desactivados; todas las rutas son
  públicas para probar con Postman (ver `postman/README_POSTMAN.md`). No usar
  esta configuración en producción.
- Contraseñas con bcrypt (12 rondas); nunca se exponen en respuestas ni logs.
- Para reactivar seguridad: quitar `contextoDesarrollo` de `src/routes/index.js`
  y restaurar `verificarAutenticacion` / guards de rol en cada enrutador.
- RBAC previsto por rol: `Administrador` y `Cliente`.
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
find src -name '*.js' -print0 | xargs -0 -n1 node --check

# Arranque y salud (requiere .env con JWT_CLAVE)
npm start
curl http://localhost:3111/api/v1/salud
```
