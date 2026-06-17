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

Ultimo ajuste de scroll al guardar:

- Al guardar una ficha, la maquina se sigue cerrando automaticamente.
- Si esa maquina cerrada queda por encima de la zona que estas mirando, la web compensa el scroll para que la pantalla no salte.
- No requiere cambios en Apps Script.
- Para este cambio sube a GitHub:

```text
src/pages/CenterMaintenance.tsx
GITHUB_FILES.md
```

Fichas QR conectadas a los Google Sheets de informes:

- Estos HTML sustituyen los CSV publicados del Google Sheet antiguo.
- Cada HTML lee directamente el Apps Script del modulo correspondiente.
- Si se cambia una maquina desde la app de informes y se guarda en su Google Sheet, al recargar la ficha QR se vera el dato actualizado.
- Para el repositorio de fichas QR, sube:

```text
fichas_clima.html
fichas_electrico.html
fichas_puertas.html
GITHUB_FILES.md
```

Correspondencia:

```text
fichas_clima.html -> Informes - Clima
fichas_electrico.html -> Informes - Electrico
fichas_puertas.html -> Informes - Puertas
```

CAMBIO VIGENTE - Fichas QR con formato original y Sheets general:

- Los 6 HTML conservan el formato y las funciones originales de los archivos que estaban en Descargas.
- Las fichas y paginas de impresion QR leen del Google Sheets general `Fichas QR actualizado 2026-06-09`.
- Cuando se crea, edita, borra o reordena una maquina desde la app de informes, el Apps Script actualiza primero el Google Sheets del modulo y despues sincroniza la hoja correspondiente del Google Sheets general.
- Asi los HTML antiguos no cambian de aspecto: simplemente ven datos actualizados al recargar.
- Los QR impresos apuntan al repositorio `Fichas`:

```text
https://igyomee.github.io/Fichas/fichas_clima.html
https://igyomee.github.io/Fichas/fichas_electrico.html
https://igyomee.github.io/Fichas/fichas_puertas.html
```

Para este cambio sube al repositorio `Fichas`:

```text
fichas_clima.html
fichas_electrico.html
fichas_puertas.html
imprimir_qr.html
imprimir_qr_electrico.html
imprimir_qr_puertas.html
GITHUB_FILES.md
```

Y en la app de informes actualiza tambien:

```text
google-apps-script/Code.gs
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
```

Despues pega y despliega de nuevo cada Apps Script:

```text
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
```

Importante: el Google Sheets general `Fichas QR actualizado 2026-06-09` debe seguir publicado como CSV para que los HTML originales puedan leerlo.

Ultimo ajuste de Clima - Tipo Instalacion:

- En las fichas de Clima se ha quitado el checkbox visible `Activo`.
- Al lado de `Carga de refrigerante (kg)` aparece ahora el campo editable `Tipo Instalación`.
- Ese campo lee y guarda la columna `Tipo instalación` del inventario de Clima.
- En la exportacion al Google Sheets general de fichas QR, ese dato se mantiene en la columna correspondiente.
- Para este cambio sube a GitHub:

```text
src/pages/CenterMaintenance.tsx
src/types/equipment.ts
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

Cambio vigente para fichas QR manteniendo el formato original:

- Los 6 HTML vuelven a conservar el formato y funciones originales de los archivos que estaban en Descargas.
- Las fichas y paginas de impresion QR leen del Google Sheets general `Fichas QR actualizado 2026-06-09`.
- Cuando se crea, edita, borra o reordena una maquina desde la app de informes, el Apps Script actualiza:
  1. El Google Sheets del modulo correspondiente (`Informes - Clima`, `Informes - Electrico` o `Informes - Puertas`).
  2. La hoja correspondiente del Google Sheets general `Fichas QR actualizado 2026-06-09`.
- De esta forma, los HTML antiguos no cambian de aspecto: simplemente ven datos actualizados al recargar.
- Los QR impresos apuntan al repositorio `Fichas`:

```text
https://igyomee.github.io/Fichas/fichas_clima.html
https://igyomee.github.io/Fichas/fichas_electrico.html
https://igyomee.github.io/Fichas/fichas_puertas.html
```

Para este cambio sube al repositorio `Fichas`:

```text
fichas_clima.html
fichas_electrico.html
fichas_puertas.html
imprimir_qr.html
imprimir_qr_electrico.html
imprimir_qr_puertas.html
GITHUB_FILES.md
```

Y en el repositorio/app de informes actualiza tambien:

```text
google-apps-script/Code.gs
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
```

Despues pega y despliega de nuevo cada Apps Script:

```text
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
```

Importante: el Google Sheets general `Fichas QR actualizado 2026-06-09` debe seguir publicado como CSV para que los HTML originales puedan leerlo.

Paginas de impresion QR conectadas a los Google Sheets de informes:

- Estas paginas generan los QR leyendo directamente el inventario actual de cada Apps Script.
- Si anades o borras una maquina en el Google Sheet de informes, al abrir o pulsar `Actualizar listado` cambiara el listado de QR.
- Los QR fisicos ya impresos no cambian solos: si se crea una maquina nueva hay que imprimir su QR nuevo; si se cambia el codigo de una maquina antigua, conviene reimprimir ese QR.
- Para el repositorio de fichas QR, sube tambien:

```text
imprimir_qr.html
imprimir_qr_electrico.html
imprimir_qr_puertas.html
GITHUB_FILES.md
```

Fichas QR conectadas a los Google Sheets de informes:

- Estos HTML sustituyen los CSV publicados del Google Sheet antiguo.
- Cada HTML lee directamente el Apps Script del modulo correspondiente.
- Si se cambia una maquina desde la app de informes y se guarda en su Google Sheet, al recargar la ficha QR se vera el dato actualizado.
- Para el repositorio de fichas QR, sube:

```text
fichas_clima.html
fichas_electrico.html
fichas_puertas.html
GITHUB_FILES.md
```

Correspondencia:

```text
fichas_clima.html -> Informes - Clima
fichas_electrico.html -> Informes - Electrico
fichas_puertas.html -> Informes - Puertas
```

Ultimo ajuste al anadir maquinas:

- En Electrico ya no aparece desplegable de tipo, porque solo se pueden crear cuadros electricos.
- Si en Electrico escriben `Sala bombas`, se guardara como `CUADRO ELECTRICO Sala bombas`.
- En Clima se elige solo `Unidad Interior` o `Unidad Exterior`.
- Si en Clima eligen unidad interior y escriben `Comedor`, se guardara como `UNIDAD INTERIOR Comedor`.
- Si eligen unidad exterior, se guardara como `UNIDAD EXTERIOR ...`.
- En Puertas se mantiene el desplegable de tipo/familia y se pone ese tipo delante del nombre.
- Para este cambio sube a GitHub:

```text
src/pages/CenterMaintenance.tsx
GITHUB_FILES.md
```

Ultimo ajuste de DNI como contraseña:

- El DNI escrito por el tecnico se compara con el DNI real de ese tecnico.
- No se guardan los DNI en claro en el codigo: solo se guardan huellas `SHA-256`.
- Si el DNI no corresponde al tecnico elegido, no se puede modificar, responder, anadir, eliminar ni guardar maquinas.
- El campo DNI se muestra como contraseña.
- En la revision guardada queda `DNI validado`, no el DNI escrito.
- Para este cambio sube a GitHub:

```text
src/config/technicians.ts
src/pages/CenterMaintenance.tsx
GITHUB_FILES.md
```

Ultimo ajuste de editar nombre/familia y reordenar:

- Los tecnicos validados pueden modificar el nombre de cada maquina.
- Los tecnicos validados pueden modificar la familia/tipo de cada maquina.
- En Electrico la familia queda fija como `Cuadro Electrico`.
- Se ha anadido el boton `Reordenar maquinas`.
- En modo reordenar aparecen flechas para subir o bajar maquinas.
- Al guardar el orden, Apps Script renumera los codigos de las maquinas segun el nuevo orden.
- Si una maquina cambia de familia, Apps Script actualiza el tag de familia, la plantilla y el codigo si hace falta.
- Para este cambio sube a GitHub:

```text
src/types/equipment.ts
src/services/equipmentService.ts
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

Ultimo ajuste de DNI visible y boton tecnico:

- El campo DNI tiene un boton con icono de ojo para ver/ocultar lo escrito.
- El boton amarillo queda como `Anadir Tecnico`, sin el signo `+` final.
- Para este cambio sube a GitHub:

```text
src/pages/CenterMaintenance.tsx
GITHUB_FILES.md
```

Ultimo ajuste de Dashboard por maquina y centro:

- Las tres tarjetas del Dashboard muestran ahora dos columnas: maquina y centro.
- `Total de equipos` se acompana de `Total de centros`.
- `Revisiones del mes` se acompana de `Centros revisados del mes`.
- `Equipos pendientes` se acompana de `Centros pendientes`.
- Para este cambio sube a GitHub:

```text
src/pages/Dashboard.tsx
src/services/googleSheetsService.ts
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

Correccion de Dashboard pendientes y listas de centros:

- Los equipos pendientes se calculan como `total equipos - equipos revisados del mes`.
- Los centros pendientes se calculan como `total centros - centros revisados del mes`.
- Se anade desplegable en centros revisados para ver cuales estan revisados.
- Se anade desplegable en centros pendientes para ver cuales faltan.
- Para este cambio sube a GitHub:

```text
src/pages/Dashboard.tsx
src/services/googleSheetsService.ts
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

Ultimo ajuste ADMIN y reinicio de cuatrimestre:

- Hay un boton amarillo `ADMIN` arriba a la derecha.
- Al pulsarlo pide contraseña de administrador.
- Si la contraseña es correcta aparece `Reiniciar Cuatrimestre`.
- La contraseña esperada es `456T*Yomee`.
- `Reiniciar Cuatrimestre` cambia el periodo activo del Dashboard.
- El Dashboard cuenta revisiones desde el inicio del periodo activo, no desde el mes.
- El periodo se nombra como `1ªRevisión-2027`, `2ªRevisión-2027`, etc.
- Al cambiar de año vuelve a `1ªRevisión`.
- No se borran revisiones, detalle, inventario ni hojas `Ultima_...`.
- Las respuestas anteriores siguen apareciendo al abrir cada maquina.
- Para este cambio sube a GitHub:

```text
src/App.tsx
src/pages/Dashboard.tsx
src/services/adminService.ts
src/services/googleSheetsService.ts
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
- Se puede anadir mas de un tecnico con el boton amarillo `Anadir Tecnico`.
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

Fichas QR conectadas a los Google Sheets de informes:

- Estos HTML sustituyen los CSV publicados del Google Sheet antiguo.
- Cada HTML lee directamente el Apps Script del modulo correspondiente.
- Si se cambia una maquina desde la app de informes y se guarda en su Google Sheet, al recargar la ficha QR se vera el dato actualizado.
- Para el repositorio de fichas QR, sube:

```text
fichas_clima.html
fichas_electrico.html
fichas_puertas.html
GITHUB_FILES.md
```

Correspondencia:

```text
fichas_clima.html -> Informes - Clima
fichas_electrico.html -> Informes - Electrico
fichas_puertas.html -> Informes - Puertas
```

CAMBIO VIGENTE - Fichas QR con formato original y Sheets general:

- Los 6 HTML conservan el formato y las funciones originales de los archivos que estaban en Descargas.
- Las fichas y paginas de impresion QR leen del Google Sheets general `Fichas QR actualizado 2026-06-09`.
- Cuando se crea, edita, borra o reordena una maquina desde la app de informes, el Apps Script actualiza primero el Google Sheets del modulo y despues sincroniza la hoja correspondiente del Google Sheets general.
- Asi los HTML antiguos no cambian de aspecto: simplemente ven datos actualizados al recargar.
- Los QR impresos apuntan al repositorio `Fichas`:

```text
https://igyomee.github.io/Fichas/fichas_clima.html
https://igyomee.github.io/Fichas/fichas_electrico.html
https://igyomee.github.io/Fichas/fichas_puertas.html
```

Para este cambio sube al repositorio `Fichas`:

```text
fichas_clima.html
fichas_electrico.html
fichas_puertas.html
imprimir_qr.html
imprimir_qr_electrico.html
imprimir_qr_puertas.html
GITHUB_FILES.md
```

Y en la app de informes actualiza tambien:

```text
google-apps-script/Code.gs
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
```

Despues pega y despliega de nuevo cada Apps Script:

```text
google-apps-script/clima/Code.gs
google-apps-script/electrico/Code.gs
google-apps-script/puertas/Code.gs
```

Importante: el Google Sheets general `Fichas QR actualizado 2026-06-09` debe seguir publicado como CSV para que los HTML originales puedan leerlo.

