# AplicaciÃ³n de revisiones de mantenimiento con Google Sheets

AplicaciÃ³n web responsive para buscar equipos, editar datos de inventario, lanzar revisiones dinÃ¡micas desde plantillas de Google Sheets, registrar incidencias y exportar resÃºmenes por centro.

## OpciÃ³n recomendada: GitHub Pages + Google Apps Script por mÃ³dulos

Para acceder desde cualquier parte sin mantener un servidor Node, usa:

```text
Frontend React en GitHub Pages
        â†“
Selector Clima / Puertas / ElÃ©ctrico
        â†“
Google Apps Script Web App del mÃ³dulo elegido
        â†“
Google Sheets del mÃ³dulo elegido
```

El cÃ³digo listo estÃ¡ en:

- `google-apps-script/Code.gs`
- `google-apps-script/appsscript.json`
- `google-apps-script/SplitMasterIntoModules.gs`
- `google-apps-script/clima/Code.gs`
- `google-apps-script/puertas/Code.gs`
- `google-apps-script/electrico/Code.gs`

El backend Node de `backend/` queda como alternativa local o para Render/Railway, pero no es necesario si usas Apps Script.

## Funcionalidades incluidas

- BÃºsqueda de equipos por cÃ³digo, centro, instalaciÃ³n, familia, nombre, nÃºmero, ubicaciÃ³n, marca, modelo y nÂº de serie.
- Tabla responsive con ordenaciÃ³n por centro, nombre, nÃºmero, cÃ³digo, familia y ubicaciÃ³n.
- Ficha editable del equipo para marca, modelo, nÂº de serie, carga de refrigerante, ubicaciÃ³n, observaciones y estado activo.
- Checklist dinÃ¡mico segÃºn `CÃ³digo del equipo` y `Mapa_Plantillas`.
- ValidaciÃ³n de Ã­tems obligatorios y reglas de observaciÃ³n/evidencia si la respuesta falla.
- Guardado separado en `Revisiones`, `Detalle_Revision` e `Incidencias`.
- HistÃ³rico de mÃ¡quina con Ãºltima revisiÃ³n, observaciones e incidencias.
- Revisiones por centro con filtros y ordenaciÃ³n.
- ExportaciÃ³n CSV y generaciÃ³n de hoja `Resumen_Revisiones_Centro`.
- AutenticaciÃ³n simple con `APP_PASSWORD`.
- Modo mock automÃ¡tico si no hay credenciales de Google Sheets.

## Estructura

```text
backend/
  middleware/
  routes/
  services/
src/
  components/
  pages/
  services/
  types/
  utils/
```

## Requisitos

- Node.js 20 o superior.
- Un Google Sheets con estas hojas:
  - `Inventario_Equipos`
  - `Mapa_Plantillas`
  - `Plantillas_Checklist`
  - `Revisiones`
  - `Detalle_Revision`
  - `Incidencias`

La aplicaciÃ³n puede crear y rellenar `Resumen_Revisiones_Centro`. TambiÃ©n aÃ±ade cabeceras en hojas de escritura si estÃ¡n vacÃ­as.

## Variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Configura:

```env
VITE_API_BACKEND=apps-script
VITE_API_URL_CLIMA=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
VITE_API_URL_PUERTAS=https://script.google.com/macros/s/AKfycbzS7S-YuiE0pmyJt8-WSfKWvw3aSEFX-I2RkXZFln_RZllXIP5lZsNkN_Wz-KPbygubGQ/exec
VITE_API_URL_ELECTRICO=https://script.google.com/macros/s/AKfycbzLFnFvZX8m90Ym-qTf7hqZ6SSklFU9xmUfQtjZ1aigbbM742lcVR7oqoN2MR99V06H/exec
VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
```

Si quieres usar el backend Node opcional:

```env
VITE_API_BACKEND=express
VITE_API_BASE_URL=http://localhost:3001/api
PORT=3001
APP_PASSWORD=cambia-esta-clave
GOOGLE_SHEETS_ID=pon-aqui-el-id-del-google-sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

No hay credenciales hardcodeadas. Si faltan las variables de Google, el backend usa datos mock para probar el flujo completo.

En modo Apps Script, `APP_PASSWORD` no se guarda en `.env`; se define en Apps Script como Script Property.

## Crear los tres Google Sheets desde el maestro

1. Abre el Google Sheets maestro importado desde `Informes.xlsx`.
2. Ve a **Extensiones > Apps Script**.
3. Crea un archivo llamado `SplitMasterIntoModules.gs`.
4. Pega el contenido de `google-apps-script/SplitMasterIntoModules.gs`.
5. Ejecuta la funciÃ³n:

```text
createModuleSpreadsheetsFromMaster
```

6. Acepta permisos.
7. Abre **Executions** o **Ver > Registros**.
8. Copia los tres `spreadsheetId` creados:
   - `clima`
   - `puertas`
   - `electrico`

El script crea:

```text
Informes - Clima
Informes - Puertas
Informes - Electrico
```

Ventilación (`VE`) queda fuera de estos tres módulos.

## Configurar Google Apps Script de cada mÃ³dulo

Haz esto tres veces, una por cada Google Sheets generado.

1. Abre el Google Sheets del mÃ³dulo.
2. Ve a **Extensiones > Apps Script**.
3. Crea o sustituye el archivo `Code.gs`:
   - Clima: `google-apps-script/clima/Code.gs`
   - Puertas: `google-apps-script/puertas/Code.gs`
   - ElÃ©ctrico: `google-apps-script/electrico/Code.gs`
4. En **Project Settings**, activa la visualizaciÃ³n de `appsscript.json`.
5. Sustituye `appsscript.json` con el contenido del mÃ³dulo.
6. En **Script Properties**, aÃ±ade:
   - `APP_PASSWORD`: clave que pedirÃ¡ la app.
   - `SPREADSHEET_ID`: ID del Google Sheets de ese mÃ³dulo.
   - `MODULE_NAME`: `Clima`, `Puertas` o `Electrico`.
7. Pulsa **Deploy > New deployment**.
8. Tipo: **Web app**.
9. Execute as: **Me**.
10. Who has access: **Anyone**.
11. Copia la URL terminada en `/exec`.
12. Pon cada URL en `.env.production`:

```env
VITE_API_URL_CLIMA=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
VITE_API_URL_PUERTAS=https://script.google.com/macros/s/AKfycbzS7S-YuiE0pmyJt8-WSfKWvw3aSEFX-I2RkXZFln_RZllXIP5lZsNkN_Wz-KPbygubGQ/exec
VITE_API_URL_ELECTRICO=https://script.google.com/macros/s/AKfycbzLFnFvZX8m90Ym-qTf7hqZ6SSklFU9xmUfQtjZ1aigbbM742lcVR7oqoN2MR99V06H/exec
```

El frontend envÃ­a peticiones simples `POST text/plain` para evitar problemas de CORS con Apps Script.

## Configurar Google Cloud y Sheets para backend Node opcional

1. Entra en [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto o selecciona uno existente.
3. Activa **Google Sheets API**.
4. Crea una **Service Account**.
5. Genera una clave JSON para esa service account.
6. Copia `client_email` a `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
7. Copia `private_key` a `GOOGLE_PRIVATE_KEY`, manteniendo los saltos como `\n`.
8. Abre tu Google Sheets y compÃ¡rtelo con el email de la service account con permiso de ediciÃ³n.
9. Copia el ID de la URL del Sheets a `GOOGLE_SHEETS_ID`.

## Instalar y ejecutar localmente

```bash
npm install
npm run dev
```

Abre:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001/api/health`

La app pedirÃ¡ la clave definida en `APP_PASSWORD`.

Para probar contra Apps Script desde local:

```env
VITE_API_BACKEND=apps-script
VITE_API_URL_CLIMA=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
VITE_API_URL_PUERTAS=https://script.google.com/macros/s/AKfycbzS7S-YuiE0pmyJt8-WSfKWvw3aSEFX-I2RkXZFln_RZllXIP5lZsNkN_Wz-KPbygubGQ/exec
VITE_API_URL_ELECTRICO=https://script.google.com/macros/s/AKfycbzLFnFvZX8m90Ym-qTf7hqZ6SSklFU9xmUfQtjZ1aigbbM742lcVR7oqoN2MR99V06H/exec
VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
```

DespuÃ©s:

```bash
npm run dev:web
```

## Publicar frontend en GitHub Pages

El repositorio ya incluye un workflow en `.github/workflows/deploy-github-pages.yml`.
Cada vez que subas cambios a la rama `main`, GitHub compilarÃ¡ la app y la publicarÃ¡ en GitHub Pages.

Sube a GitHub estos archivos y carpetas:

```text
.github/
src/
google-apps-script/
.env.example
.env.production
.gitignore
index.html
package.json
postcss.config.cjs
README.md
tailwind.config.ts
tsconfig.json
tsconfig.backend.json
vite.config.ts
```

No subas:

```text
.env
node_modules/
dist/
```

El archivo `.env.production` ya apunta a tu Apps Script:

```env
VITE_API_BACKEND=apps-script
VITE_API_URL_CLIMA=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
VITE_API_URL_PUERTAS=https://script.google.com/macros/s/AKfycbzS7S-YuiE0pmyJt8-WSfKWvw3aSEFX-I2RkXZFln_RZllXIP5lZsNkN_Wz-KPbygubGQ/exec
VITE_API_URL_ELECTRICO=https://script.google.com/macros/s/AKfycbzLFnFvZX8m90Ym-qTf7hqZ6SSklFU9xmUfQtjZ1aigbbM742lcVR7oqoN2MR99V06H/exec
VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
```

Pasos en GitHub:

1. Crea un repositorio.
2. Sube los archivos anteriores.
3. Entra en **Settings > Pages**.
4. En **Build and deployment**, selecciona **GitHub Actions**.
5. Sube a la rama `main`.
6. Espera a que termine la acciÃ³n **Deploy GitHub Pages**.
7. GitHub te darÃ¡ una URL pÃºblica tipo `https://usuario.github.io/repositorio/`.

La app usa `HashRouter` y `base: './'`, asÃ­ que funcionarÃ¡ aunque GitHub Pages la publique dentro de una subcarpeta.

Si quieres compilar a mano antes de subir:

```bash
npm install
npm run build
```

## Despliegue desde GitHub con backend Node opcional

Una opciÃ³n sencilla es Render o Railway:

1. Sube el repositorio a GitHub.
2. Crea un nuevo servicio web conectado al repositorio.
3. Define las variables de entorno del apartado anterior.
4. Usa estos comandos:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
5. Configura `VITE_API_BASE_URL=/api` para servir frontend y backend desde el mismo dominio.

El servidor Express sirve el contenido generado por Vite en producciÃ³n.

## Columnas esperadas

### Inventario_Equipos

`CÃ³digo del equipo`, `Centro`, `Tag centro`, `InstalaciÃ³n`, `Tag instalaciÃ³n`, `Familia`, `Tag familia`, `Nombre equipo`, `NÃºmero equipo`, `UbicaciÃ³n`, `Marca`, `Modelo`, `NÂº de serie`, `Carga de refrigerante`, `Observaciones equipo`, `Activo`, `Plantilla revisiÃ³n`.

### Mapa_Plantillas

`Tag instalaciÃ³n`, `InstalaciÃ³n`, `Tag familia`, `Familia`, `Plantilla revisiÃ³n`.

### Plantillas_Checklist

`Plantilla revisiÃ³n`, `NÂº Ã­tem`, `Grupo`, `Ãtem`, `Tipo respuesta`, `Opciones respuesta`, `Obligatorio`, `Requiere observaciÃ³n si falla`, `Requiere foto si falla`, `Orden`.

### Revisiones

`ID revisiÃ³n`, `Fecha y hora`, `TÃ©cnico`, `Centro`, `CÃ³digo del equipo`, `InstalaciÃ³n`, `Familia`, `Plantilla revisiÃ³n`, `Estado global`, `Prioridad`, `Observaciones generales`, `ValidaciÃ³n`, `Fecha prÃ³xima revisiÃ³n`.

### Detalle_Revision

`ID revisiÃ³n`, `CÃ³digo del equipo`, `Plantilla revisiÃ³n`, `NÂº Ã­tem`, `Grupo`, `Ãtem`, `Respuesta`, `ObservaciÃ³n`, `Foto / evidencia`, `Incidencia`, `Prioridad`.

### Incidencias

`ID incidencia`, `ID revisiÃ³n`, `CÃ³digo del equipo`, `Centro`, `InstalaciÃ³n`, `Familia`, `DescripciÃ³n`, `Prioridad`, `Estado incidencia`, `Fecha creaciÃ³n`, `Fecha cierre`, `AcciÃ³n recomendada`.

## Tipos de respuesta soportados

- `OK / NO OK / N/A`
- `SÃ­ / No`
- `Texto libre`
- `NÃºmero`
- `Fecha`
- `SelecciÃ³n desplegable`
- `Foto o evidencia`
- `ObservaciÃ³n`

Para `SelecciÃ³n desplegable`, separa opciones con coma, punto y coma o barra vertical.

## Flujo de guardado de revisiÃ³n

1. La app lee el cÃ³digo y ejecuta `parseEquipmentCode`.
2. Busca la plantilla en `Mapa_Plantillas` o usa `Plantilla revisiÃ³n` del inventario si existe.
3. Carga los Ã­tems desde `Plantillas_Checklist`.
4. Valida obligatorios y reglas de fallo.
5. Genera `REV-YYYYMMDD-HHMMSS-CODIGOEQUIPO`.
6. Crea una fila en `Revisiones`.
7. Crea una fila por Ã­tem en `Detalle_Revision`.
8. Crea incidencias `INC-...` para respuestas negativas o marcadas como incidencia.

## Scripts

```bash
npm run dev       # Frontend Vite + API Express
npm run build     # Typecheck + build del frontend
npm run start     # API Express sirviendo dist en producciÃ³n
npm run typecheck # RevisiÃ³n TypeScript
```

