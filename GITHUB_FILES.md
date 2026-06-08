# Archivos para subir a GitHub

Sube estos archivos y carpetas:

```text
.github/
google-apps-script/
src/
.env.example
.env.production
.gitignore
GITHUB_FILES.md
index.html
package.json
postcss.config.cjs
README.md
tailwind.config.ts
tsconfig.json
tsconfig.backend.json
vite.config.ts
```

Para este cambio concreto, los imprescindibles son:

```text
src/
google-apps-script/
README.md
GITHUB_FILES.md
```

Si al ejecutar `npm install` se crea `package-lock.json`, sube tambien `package-lock.json`.

No subas:

```text
.env
node_modules/
dist/
dist-server/
coverage/
```

Configuracion de GitHub Pages:

1. Crea el repositorio y sube los archivos.
2. Ve a `Settings > Pages`.
3. En `Build and deployment`, selecciona `GitHub Actions`.
4. Sube los cambios a la rama `main`.
5. Espera a que termine el workflow `Deploy GitHub Pages`.

La URL publica quedara con este formato:

```text
https://TU_USUARIO.github.io/NOMBRE_DEL_REPOSITORIO/
```

El frontend ya apunta al Apps Script:

```text
VITE_API_URL_CLIMA=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
VITE_API_URL_PUERTAS=https://script.google.com/macros/s/AKfycbzS7S-YuiE0pmyJt8-WSfKWvw3aSEFX-I2RkXZFln_RZllXIP5lZsNkN_Wz-KPbygubGQ/exec
VITE_API_URL_ELECTRICO=https://script.google.com/macros/s/AKfycbzLFnFvZX8m90Ym-qTf7hqZ6SSklFU9xmUfQtjZ1aigbbM742lcVR7oqoN2MR99V06H/exec
```

Las URLs ya están puestas en `.env.production`.

Tras subir el frontend, actualiza también Apps Script:

1. En Clima, pega `google-apps-script/clima/Code.gs` y despliega `Nueva versión`.
2. En Puertas, pega `google-apps-script/puertas/Code.gs` y despliega `Nueva versión`.
3. En Eléctrico, pega `google-apps-script/electrico/Code.gs` y despliega `Nueva versión`.

Ese cambio añade alta y baja de máquinas desde la web.

Ultimo ajuste aplicado:

- La revision por centro ya no pide ubicacion, fecha de proxima revision, prioridad ni foto/evidencia.
- Al anadir una maquina solo se pide `Tipo / familia` y `Nombre equipo`.
- El codigo se genera automaticamente en Apps Script con el formato `TAGCENTRO-TAGINSTALACION-TAGFAMILIA-NUMERO`.
- Para que el alta automatica funcione, vuelve a pegar el `Code.gs` actualizado en los tres Apps Script y despliega una nueva version en cada uno.

Ultimo ajuste de Google Sheets:

- Al guardar una revision, Apps Script crea o actualiza una hoja por familia/tipo de maquina.
- El nombre de esas hojas empieza por `Ultima_`, por ejemplo `Ultima_UI_Unidad Interior`.
- Cada hoja guarda una fila por maquina con la revision mas reciente.
- Las columnas de preguntas salen automaticamente de `Plantillas_Checklist`.
- Si se anaden preguntas nuevas a una plantilla, Apps Script anade las nuevas columnas cuando se guarde la siguiente revision.

Ultimo ajuste de simplificacion:

- Se ha eliminado el apartado de incidencias de la app.
- Se han eliminado los archivos `src/pages/Incidents.tsx`, `src/services/incidentService.ts` y `src/types/incident.ts`.
- Apps Script ya no crea ni actualiza la hoja `Incidencias`.
- En informes por centro solo se elige `Centro`.
- El informe por centro muestra la ultima revision de cada maquina, no un rango de fechas.
- En cada Google Sheets puedes borrar manualmente la pestana `Incidencias`.
- Si quieres dejar las hojas limpias, tambien puedes borrar las columnas antiguas `Prioridad` y `Fecha proxima revision` de `Revisiones`, y `Incidencia` y `Prioridad` de `Detalle_Revision`.

