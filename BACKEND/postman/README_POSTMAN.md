# Colección Postman — TourManager API

Catálogo de rutas HTTP para probar la API REST de TourManager desde Postman o
`curl`.

> **Fase de desarrollo:** la API **no exige token JWT ni rol**. Todas las rutas
> responden sin `Authorization`; el equipo puede listar usuarios y probar
> cualquier módulo directamente. Esto es temporal: antes de producción se deben
> restaurar los guards de `src/middleware/autenticacion.js`.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `TourManager.postman_collection.json` | Colección con 83 solicitudes agrupadas por módulo (Salud, Autenticación, Usuarios, Roles, Clientes, etc.) |
| `TourManager-Local.postman_environment.json` | Entorno local: `baseUrl`, `idUsuario`, `idRol`, etc. |
| `README_POSTMAN.md` | Este archivo |

## Prerrequisitos

1. **Node.js ≥ 18** (probado con Node 24).
2. **MySQL 8.x** con el esquema `tourmanager` importado:
   ```bash
   mysql -u <usuario> -p < BACKEND/database/agencia_viajes.sql
   ```
   El script crea el esquema y carga datos de ejemplo (incluye usuarios). No pase
   el nombre de la base al comando: el propio script hace `CREATE SCHEMA tourmanager`.
3. **`BACKEND/.env`** con la conexión correcta:
   ```ini
   PUERTO=3111
   BD_HOST=localhost
   BD_PUERTO=3306
   BD_USUARIO=<usuario>
   BD_CLAVE=<clave>
   BD_NOMBRE=tourmanager
   JWT_CLAVE=<texto de al menos 16 caracteres>
   ```
   Aunque esta fase no use JWT, `src/config/entorno.js` exige `JWT_CLAVE` con 16+
   caracteres para arrancar.
4. **Backend corriendo** desde `BACKEND/`:
   ```bash
   npm start        # node index.js
   # o
   npm run dev      # node --watch index.js
   ```
   Base de la API: `http://localhost:3111` (el valor de `PUERTO` en `.env`).
5. Comprobar que hay conexión a la base:
   ```bash
   curl http://localhost:3111/api/v1/salud
   # 200 => base disponible; 503 => base no disponible
   ```

## Importar en Postman

1. Postman → **Import** → seleccione `TourManager.postman_collection.json`.
2. Importe también `TourManager-Local.postman_environment.json`.
3. Arriba a la derecha seleccione el entorno **TourManager - Local**.
4. Ejecute directamente cualquier solicitud. **No hace falta iniciar sesión** ni
   configurar `{{token}}`; la colección ya no envía cabecera `Authorization`.

## Obtener la lista de usuarios (sin token)

```bash
curl "http://localhost:3111/api/v1/usuarios?pagina=1&limite=10"
```

Respuesta real de la API (sobre `ok` / `datos` / `meta`):

```json
{
  "ok": true,
  "mensaje": "Listado obtenido correctamente",
  "datos": [
    {
      "idUsuario": 1,
      "nombreUsuario": "Admin Principal",
      "email": "admin1@tourmanager.com",
      "documento": "10000001",
      "telefono": "3102000001",
      "idRol": 1,
      "nombreRol": "Administrador",
      "estadoUsuario": "Activo",
      "proveedoresIdProveedor": null,
      "fechaRegistro": "2026-09-11 14:49:54",
      "fechaModificacion": "2026-09-11 14:49:54"
    }
  ],
  "meta": {
    "paginacion": {
      "pagina": 1,
      "limite": 10,
      "total": 21,
      "totalPaginas": 3
    }
  }
}
```

- Query params opcionales: `pagina`, `limite` (máx. 100), `nombre`, `correo`,
  `documento`, `estado` (`Activo`/`Inactivo`), `idRol`.
- Si la tabla está vacía, `datos` es `[]` y `meta.paginacion.total` es `0`.
- `GET /api/v1/usuarios/:id` devuelve un usuario; si no existe, `404`.

### Crear un usuario

```bash
curl -X POST "http://localhost:3111/api/v1/usuarios" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "Marta Ruiz",
    "email": "marta.ruiz@tourmanager.com",
    "contrasena": "Usuario2026*",
    "documento": "1020304050",
    "telefono": "+57 310 5556677",
    "idRol": 1
  }'
```

`contrasena` debe tener entre 8 y 72 caracteres. Para conocer los roles
disponibles use `GET /api/v1/roles` y tome `idRol`.

## Catálogo de rutas

Todas las rutas están bajo `http://localhost:3111/api/v1` y no requieren
permisos. Los listados aceptan `pagina` y `limite`; las respuestas de error usan
`{ "ok": false, "codigo": "...", "mensaje": "..." }`.

### Salud y autenticación

| Método | Ruta |
|--------|------|
| GET | `/salud` |
| POST | `/autenticacion/iniciar-sesion` |
| POST | `/autenticacion/cerrar-sesion` |
| POST | `/autenticacion/recuperar-clave` |
| POST | `/autenticacion/restablecer-clave` |
| POST | `/autenticacion/registro` |

Las rutas de autenticación siguen funcionando, pero ya no son necesarias para
usar el resto de la API.

### Usuarios

| Método | Ruta |
|--------|------|
| GET | `/usuarios` |
| POST | `/usuarios` |
| GET | `/usuarios/:id` |
| PUT | `/usuarios/:id` |
| PATCH | `/usuarios/:id` |
| PATCH | `/usuarios/:id/estado` |

### Roles y módulos

| Método | Ruta |
|--------|------|
| GET, POST | `/roles` |
| GET, PUT, PATCH | `/roles/:id` |
| PATCH | `/roles/:id/estado` |
| GET, POST | `/roles/:id/modulos` |
| DELETE | `/roles/:id/modulos/:idModulo` |
| GET, POST | `/modulos` |
| GET, PUT, PATCH | `/modulos/:id` |

### Clientes

| Método | Ruta |
|--------|------|
| GET, POST | `/clientes` |
| GET, PUT, PATCH | `/clientes/:id` |
| GET, PATCH, DELETE | `/clientes/:id/datos-personales` |
| GET | `/clientes/:id/historial` |

### Proveedores, contratos y servicios

| Método | Ruta |
|--------|------|
| GET, POST | `/proveedores` |
| GET, PUT, PATCH | `/proveedores/:id` |
| GET, POST | `/proveedores/:id/servicios` |
| GET, POST | `/servicios-proveedor` |
| GET, PUT, PATCH | `/servicios-proveedor/:id` |
| GET, POST | `/contratos` |
| GET, PUT, PATCH | `/contratos/:id` |
| GET, POST | `/contratos/:id/otrosi` |
| GET, POST | `/otrosies` |
| GET, PUT, PATCH | `/otrosies/:id` |

### Paquetes, itinerarios y servicios de paquete

| Método | Ruta |
|--------|------|
| GET, POST | `/paquetes` |
| GET, PUT, PATCH | `/paquetes/:id` |
| PATCH | `/paquetes/:id/estado` |
| GET, POST | `/paquetes/:id/servicios` |
| DELETE | `/paquetes/:id/servicios/:idServicio` |
| GET, POST | `/paquetes/:id/itinerarios` |
| GET, POST | `/itinerarios` |
| GET, PUT, PATCH | `/itinerarios/:id` |
| PATCH | `/itinerarios/:id/estado` |
| GET, POST | `/servicios-paquete` |
| GET, PUT, PATCH | `/servicios-paquete/:id` |

### Reservas

| Método | Ruta |
|--------|------|
| GET, POST | `/reservas` |
| GET | `/reservas/mis-reservas` |
| GET, PUT, PATCH | `/reservas/:id` |
| GET | `/reservas/:id/comprobante` |
| POST | `/reservas/:id/confirmar` |
| POST | `/reservas/:id/cancelar` |
| PATCH | `/reservas/:id/estado` |

### Ventas y pagos

| Método | Ruta |
|--------|------|
| GET, POST | `/ventas` |
| GET, PUT, PATCH | `/ventas/:id` |
| POST | `/ventas/:id/pago` |
| PATCH | `/ventas/:id/cancelar` |
| GET | `/ventas/:id/comprobante` |
| GET, POST | `/pagos` |
| GET, PUT, PATCH | `/pagos/:id` |

### Transporte, CRM, retroalimentación e informes

| Método | Ruta |
|--------|------|
| GET, POST | `/transporte` |
| GET, PUT, PATCH | `/transporte/:id` |
| PATCH | `/transporte/:id/estado` |
| GET, POST | `/crm/interacciones` |
| GET, PUT, PATCH | `/crm/interacciones/:id` |
| GET | `/crm/clientes/:id/historial` |
| GET, POST | `/retroalimentacion` |
| GET | `/retroalimentacion/resumen` |
| GET, PUT, PATCH | `/retroalimentacion/:id` |
| GET | `/informes/desempeno` |
| GET | `/informes/ventas` |

### Auditoría y recuperación de clave

| Método | Ruta |
|--------|------|
| GET | `/bitacora` |
| GET, POST | `/tokens-recuperacion` |
| GET, PUT, PATCH | `/tokens-recuperacion/:id` |

## Variables del entorno

| Variable | Uso |
|----------|-----|
| `baseUrl` | `http://localhost:3111` |
| `idUsuario` | Se captura al listar usuarios; se usa en las rutas con `:id` |
| `idRol`, `idCliente`, `idProveedor`, etc. | Se capturan en las solicitudes de creación para encadenar pruebas |
| `token` | Solo si desea probar `/autenticacion/iniciar-sesion`; no se envía en las demás rutas |

## Solución de problemas

- **`503 BD_NO_DISPONIBLE`**: MySQL no está corriendo, las credenciales de
  `.env` son incorrectas o el esquema no está importado. Verifique con
  `GET /api/v1/salud` y con `mysql -u <usuario> -p -e "USE tourmanager; SHOW TABLES;"`.
- **`Access denied for user`** en la consola: corrija `BD_USUARIO`/`BD_CLAVE`.
- **Lista vacía**: la base conectada no tiene datos; importe
  `BACKEND/database/agencia_viajes.sql` o cree un usuario con `POST /usuarios`.
- **`404` en una ruta**: revise el prefijo `/api/v1` y que el backend esté
  corriendo con la versión actual del código.
- **`EADDRINUSE`**: ya hay un proceso usando `PUERTO`; deténgalo o cambie el
  puerto en `.env`.
- **No aparece `meta.paginacion`**: la API devuelve `meta.paginacion`, no
  `paginacion` en la raíz. La colección ya está actualizada a ese formato.

## Seguridad

Esta configuración es **solo para desarrollo**. No exponga esta API fuera de la
red local hasta restaurar `verificarAutenticacion` y los guards de rol en los
enrutadores.
