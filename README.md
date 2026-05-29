# Aplicación de revisiones de mantenimiento con Google Sheets

Aplicación web responsive para buscar equipos, editar datos de inventario, lanzar revisiones dinámicas desde plantillas de Google Sheets, registrar incidencias y exportar resúmenes por centro.

## Opción recomendada: GitHub Pages + Google Apps Script

Para acceder desde cualquier parte sin mantener un servidor Node, usa:

```text
Frontend React en GitHub Pages
        ↓
Google Apps Script Web App
        ↓
Google Sheets
```

El código listo para pegar en Apps Script está en:

- `google-apps-script/Code.gs`
- `google-apps-script/appsscript.json`

El backend Node de `backend/` queda como alternativa local o para Render/Railway, pero no es necesario si usas Apps Script.

## Funcionalidades incluidas

- Búsqueda de equipos por código, centro, instalación, familia, nombre, número, ubicación, marca, modelo y nº de serie.
- Tabla responsive con ordenación por centro, nombre, número, código, familia y ubicación.
- Ficha editable del equipo para marca, modelo, nº de serie, carga de refrigerante, ubicación, observaciones y estado activo.
- Checklist dinámico según `Código del equipo` y `Mapa_Plantillas`.
- Validación de ítems obligatorios y reglas de observación/evidencia si la respuesta falla.
- Guardado separado en `Revisiones`, `Detalle_Revision` e `Incidencias`.
- Histórico de máquina con última revisión, observaciones e incidencias.
- Revisiones por centro con filtros y ordenación.
- Exportación CSV y generación de hoja `Resumen_Revisiones_Centro`.
- Autenticación simple con `APP_PASSWORD`.
- Modo mock automático si no hay credenciales de Google Sheets.

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

La aplicación puede crear y rellenar `Resumen_Revisiones_Centro`. También añade cabeceras en hojas de escritura si están vacías.

## Variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Configura:

```env
VITE_API_BACKEND=apps-script
VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycbxtUK4nNctozREj0kmNvt-N2hdTSeWryfvh2kwYORB2H6UO60oeJ5TGjdzf-bXK77eukw/exec
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

## Configurar Google Apps Script

1. Abre el Google Sheets.
2. Ve a **Extensiones > Apps Script**.
3. Crea o sustituye el archivo `Code.gs` con el contenido de `google-apps-script/Code.gs`.
4. En **Project Settings**, activa la visualización de `appsscript.json`.
5. Sustituye `appsscript.json` con el contenido de `google-apps-script/appsscript.json`.
6. En **Script Properties**, añade:
   - `APP_PASSWORD`: clave que pedirá la app.
   - `SPREADSHEET_ID`: opcional si el script está vinculado al Sheets. Recomendado si el script es standalone.
7. Pulsa **Deploy > New deployment**.
8. Tipo: **Web app**.
9. Execute as: **Me**.
10. Who has access: **Anyone**.
11. Copia la URL terminada en `/exec`.
12. Pon esa URL en `VITE_API_BASE_URL`.

El frontend envía peticiones simples `POST text/plain` para evitar problemas de CORS con Apps Script.

## Configurar Google Cloud y Sheets para backend Node opcional

1. Entra en [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto o selecciona uno existente.
3. Activa **Google Sheets API**.
4. Crea una **Service Account**.
5. Genera una clave JSON para esa service account.
6. Copia `client_email` a `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
7. Copia `private_key` a `GOOGLE_PRIVATE_KEY`, manteniendo los saltos como `\n`.
8. Abre tu Google Sheets y compártelo con el email de la service account con permiso de edición.
9. Copia el ID de la URL del Sheets a `GOOGLE_SHEETS_ID`.

## Instalar y ejecutar localmente

```bash
npm install
npm run dev
```

Abre:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001/api/health`

La app pedirá la clave definida en `APP_PASSWORD`.

Para probar contra Apps Script desde local:

```env
VITE_API_BACKEND=apps-script
VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycbxtUK4nNctozREj0kmNvt-N2hdTSeWryfvh2kwYORB2H6UO60oeJ5TGjdzf-bXK77eukw/exec
```

Después:

```bash
npm run dev:web
```

## Publicar frontend en GitHub Pages

El repositorio ya incluye un workflow en `.github/workflows/deploy-github-pages.yml`.
Cada vez que subas cambios a la rama `main`, GitHub compilará la app y la publicará en GitHub Pages.

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
VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycbxtUK4nNctozREj0kmNvt-N2hdTSeWryfvh2kwYORB2H6UO60oeJ5TGjdzf-bXK77eukw/exec
```

Pasos en GitHub:

1. Crea un repositorio.
2. Sube los archivos anteriores.
3. Entra en **Settings > Pages**.
4. En **Build and deployment**, selecciona **GitHub Actions**.
5. Sube a la rama `main`.
6. Espera a que termine la acción **Deploy GitHub Pages**.
7. GitHub te dará una URL pública tipo `https://usuario.github.io/repositorio/`.

La app usa `HashRouter` y `base: './'`, así que funcionará aunque GitHub Pages la publique dentro de una subcarpeta.

Si quieres compilar a mano antes de subir:

```bash
npm install
npm run build
```

## Despliegue desde GitHub con backend Node opcional

Una opción sencilla es Render o Railway:

1. Sube el repositorio a GitHub.
2. Crea un nuevo servicio web conectado al repositorio.
3. Define las variables de entorno del apartado anterior.
4. Usa estos comandos:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
5. Configura `VITE_API_BASE_URL=/api` para servir frontend y backend desde el mismo dominio.

El servidor Express sirve el contenido generado por Vite en producción.

## Columnas esperadas

### Inventario_Equipos

`Código del equipo`, `Centro`, `Tag centro`, `Instalación`, `Tag instalación`, `Familia`, `Tag familia`, `Nombre equipo`, `Número equipo`, `Ubicación`, `Marca`, `Modelo`, `Nº de serie`, `Carga de refrigerante`, `Observaciones equipo`, `Activo`, `Plantilla revisión`.

### Mapa_Plantillas

`Tag instalación`, `Instalación`, `Tag familia`, `Familia`, `Plantilla revisión`.

### Plantillas_Checklist

`Plantilla revisión`, `Nº ítem`, `Grupo`, `Ítem`, `Tipo respuesta`, `Opciones respuesta`, `Obligatorio`, `Requiere observación si falla`, `Requiere foto si falla`, `Orden`.

### Revisiones

`ID revisión`, `Fecha y hora`, `Técnico`, `Centro`, `Código del equipo`, `Instalación`, `Familia`, `Plantilla revisión`, `Estado global`, `Prioridad`, `Observaciones generales`, `Validación`, `Fecha próxima revisión`.

### Detalle_Revision

`ID revisión`, `Código del equipo`, `Plantilla revisión`, `Nº ítem`, `Grupo`, `Ítem`, `Respuesta`, `Observación`, `Foto / evidencia`, `Incidencia`, `Prioridad`.

### Incidencias

`ID incidencia`, `ID revisión`, `Código del equipo`, `Centro`, `Instalación`, `Familia`, `Descripción`, `Prioridad`, `Estado incidencia`, `Fecha creación`, `Fecha cierre`, `Acción recomendada`.

## Tipos de respuesta soportados

- `OK / NO OK / N/A`
- `Sí / No`
- `Texto libre`
- `Número`
- `Fecha`
- `Selección desplegable`
- `Foto o evidencia`
- `Observación`

Para `Selección desplegable`, separa opciones con coma, punto y coma o barra vertical.

## Flujo de guardado de revisión

1. La app lee el código y ejecuta `parseEquipmentCode`.
2. Busca la plantilla en `Mapa_Plantillas` o usa `Plantilla revisión` del inventario si existe.
3. Carga los ítems desde `Plantillas_Checklist`.
4. Valida obligatorios y reglas de fallo.
5. Genera `REV-YYYYMMDD-HHMMSS-CODIGOEQUIPO`.
6. Crea una fila en `Revisiones`.
7. Crea una fila por ítem en `Detalle_Revision`.
8. Crea incidencias `INC-...` para respuestas negativas o marcadas como incidencia.

## Scripts

```bash
npm run dev       # Frontend Vite + API Express
npm run build     # Typecheck + build del frontend
npm run start     # API Express sirviendo dist en producción
npm run typecheck # Revisión TypeScript
```
