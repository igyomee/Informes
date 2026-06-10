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
- Se ha eliminado el apartado de informes por centro de la web.
- La app queda con dos pantallas principales: `Dashboard` y `Revision por centro`.
- En cada Google Sheets puedes borrar manualmente la pestana `Incidencias`.
- Si quieres dejar las hojas limpias, tambien puedes borrar las columnas antiguas `Prioridad` y `Fecha proxima revision` de `Revisiones`, y `Incidencia` y `Prioridad` de `Detalle_Revision`.

Ultimo ajuste de ordenacion:

- La app ordena siempre las maquinas por codigo.
- La familia `UI` se muestra antes que `UE`.
- Dentro de cada familia se ordena por numero: `01`, `02`, `03`, etc.
- Ejemplo: `PDI-CL-UI-01`, `PDI-CL-UI-02`, `PDI-CL-UE-01`, `PDI-CL-UE-02`.
- Apps Script reordena `Inventario_Equipos` al crear, editar o borrar una maquina.
- Apps Script reordena las hojas `Ultima_...` cada vez que se guarda una revision.
- El informe `Resumen_Revisiones_Centro` se genera ordenado con ese mismo criterio.
- Para ordenar lo que ya existe, en cada Apps Script puedes ejecutar una vez la funcion `ordenarHojasPorCodigo`.

Ultimo ajuste de campos y plantillas:

- En el modulo `Electrico`, la web solo muestra equipos que sean `Cuadros electricos`.
- En `Puertas` y `Electrico` ya no se muestran campos de `Marca`, `Modelo`, `No de serie`, `Tipo de refrigerante` ni `Carga de refrigerante`.
- En `Clima` si se muestran esos campos.
- En `Clima` se ha anadido `Tipo de refrigerante`.
- En `Clima`, `Carga de refrigerante` aparece como `Carga de refrigerante (kg)`.
- Apps Script anade automaticamente la columna `Tipo de refrigerante` en `Inventario_Equipos` si no existe.
- En el Apps Script de `Puertas` hay una funcion nueva llamada `actualizarPlantillasPuertas`.
- Ejecuta `actualizarPlantillasPuertas` una vez en el Apps Script de Puertas para rellenar `Plantillas_Checklist` con las preguntas de barrera, cancela corredera, muelle, persiana, puerta corredera, puerta frigorifica, puerta fumigacion, puerta ignifuga, puerta rapida, puerta seccional y puertas y muelles.

Para el cambio de dejar solo `Dashboard` y `Revision por centro`, sube a GitHub estos archivos:

```text
src/App.tsx
src/pages/CenterMaintenance.tsx
src/pages/Dashboard.tsx
GITHUB_FILES.md
```

Y borra de GitHub estos archivos si siguen apareciendo:

```text
src/pages/CenterReports.tsx
src/pages/EquipmentDetail.tsx
src/pages/EquipmentSearch.tsx
src/pages/NewReview.tsx
src/components/CenterReviewReport.tsx
src/components/EquipmentCard.tsx
src/components/EquipmentEditor.tsx
src/components/EquipmentList.tsx
src/components/FiltersBar.tsx
src/components/ReviewForm.tsx
```

Y despues pega y despliega Apps Script:

1. En el Apps Script de Clima, pega `google-apps-script/clima/Code.gs` y despliega nueva version.
2. En el Apps Script de Electrico, pega `google-apps-script/electrico/Code.gs` y despliega nueva version.
3. En el Apps Script de Puertas, pega `google-apps-script/puertas/Code.gs`, ejecuta una vez `actualizarPlantillasPuertas`, y despues despliega nueva version.

Actualizacion de inventarios desde `Fichas QR actualizado 2026-06-09`:

- Se ha importado el Excel `Fichas QR (3).xlsx` a Google Drive como Google Sheets:
  `https://docs.google.com/spreadsheets/d/1xS3DDh1hLnmLueIBMi22vRSimZ7uCsFOR7a2tQs7C2g`
- El `Code.gs` nuevo incluye la funcion `actualizarInventarioDesdeFichasQR`.
- Esta funcion reconstruye `Inventario_Equipos` desde el Excel importado y conserva la estructura de 27 columnas:
  subinstalacion, familia, nombre, numero, marca/modelo/serie, tipo de refrigerante y carga.
- En cada Apps Script, pega el `Code.gs` actualizado y ejecuta una vez:

```text
actualizarInventarioDesdeFichasQR
```

- En Clima tambien puedes ejecutar directamente:

```text
actualizarInventarioClimaDesdeFichasQR
```

- En Electrico:

```text
actualizarInventarioElectricoDesdeFichasQR
```

- En Puertas:

```text
actualizarInventarioPuertasDesdeFichasQR
```

Importante: despues de ejecutar la funcion, despliega una nueva version del Apps Script en cada modulo.

Ultimo ajuste de revision en web:

- Cada pregunta muestra tres recuadros: `Correcto`, `Incorrecto` y `No aplica`.
- La opcion seleccionada queda resaltada en amarillo.
- El boton `Guardar ficha` aparece al final de cada maquina, despues de sus preguntas.
- Las respuestas marcadas se guardan en el navegador como borrador por si se refresca la pagina sin querer.
- Para subir este cambio a GitHub, actualiza:

```text
src/components/ReviewItem.tsx
src/pages/CenterMaintenance.tsx
GITHUB_FILES.md
```

Ultimo ajuste de mediciones de clima:

- Los items `I` y `R` se muestran como `Impulsion (°C)` y `Retorno (°C)`.
- Estos campos usan teclado decimal en movil con `inputMode="decimal"`.
- Solo dejan escribir numeros decimales con maximo dos decimales.
- Al salir del campo, el valor se formatea a dos decimales.
- Para este cambio sube:

```text
src/components/ReviewItem.tsx
GITHUB_FILES.md
```

Ultimo ajuste de campos de ficha en Clima:

- Los campos de clima muestran etiqueta visible: `Marca`, `Modelo`, `No de serie`, `Tipo de refrigerante` y `Carga de refrigerante (kg)`.
- Esto mejora la vista movil porque ya no depende solo del texto dentro de la casilla.
- Para este cambio sube:

```text
src/pages/CenterMaintenance.tsx
GITHUB_FILES.md
```

Ultimo ajuste de guardado de maquina:

- Al pulsar `Guardar ficha`, si la ficha se guarda correctamente, se cierra automaticamente el desplegable completo de esa maquina.
- Si hay un error al guardar, el desplegable se queda abierto para poder revisar o corregir.
- Para este cambio sube:

```text
src/pages/CenterMaintenance.tsx
GITHUB_FILES.md
```

Ultimo ajuste de ultimas respuestas:

- Cada vez que se despliega una maquina, la app vuelve a consultar Google Sheets y carga las ultimas respuestas guardadas desde la hoja `Ultima_...` correspondiente.
- Si Google Sheets no tiene ultima revision para esa maquina, se usa el borrador local del navegador como respaldo.
- El Apps Script devuelve ahora `lastAnswers` junto con las preguntas de la checklist.
- Para este cambio sube a GitHub:

```text
src/types/checklist.ts
src/pages/CenterMaintenance.tsx
google-apps-script/Code.gs
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
GITHUB_FILES.md
```

Despues pega y despliega de nuevo cada Apps Script:

```text
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
```

Correccion de inventario Electrico y Puertas:

- La importacion de Electrico y Puertas estaba leyendo columnas desplazadas.
- El codigo real de la maquina se toma ahora de la columna donde aparece el formato completo, por ejemplo `AL-BT-CE-01` o `BR-PA-BR-01`.
- Si el centro viene vacio, se usa el primer bloque del codigo como centro, por ejemplo `AL`, `BR`, `PDI`.
- Electrico importa solo cuadros electricos, tag familia `CE`.
- La web reconoce cuadros electricos tambien por tag familia `CE`, no solo por la palabra `cuadro`.
- Para este cambio sube a GitHub:

```text
src/pages/CenterMaintenance.tsx
google-apps-script/Code.gs
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
GITHUB_FILES.md
```

Despues pega y despliega de nuevo cada Apps Script. Y ejecuta:

```text
actualizarInventarioElectricoDesdeFichasQR
actualizarInventarioPuertasDesdeFichasQR
```

Ultimo ajuste de tecnicos y acceso publico:

- La app ya no pide clave al entrar.
- Todo el mundo puede ver las maquinas.
- Para modificar, responder preguntas, anadir, eliminar o guardar una ficha, hay que indicar tecnico y DNI.
- Se puede anadir mas de un tecnico con el boton amarillo `Anadir Tecnico +`.
- Al escribir un nombre completo de la lista se rellena el codigo.
- Al escribir un codigo existente se rellena el nombre.
- El DNI se escribe manualmente y no se publica la lista de DNI en GitHub por privacidad.
- Apps Script deja de comprobar `APP_PASSWORD`.
- Para este cambio sube a GitHub:

```text
src/App.tsx
src/pages/CenterMaintenance.tsx
src/components/ReviewItem.tsx
src/config/technicians.ts
google-apps-script/Code.gs
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
GITHUB_FILES.md
```

Despues pega y despliega de nuevo cada Apps Script:

```text
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
```

