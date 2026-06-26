# Google Apps Script por mÃ³dulos

## 1. Crear los tres Google Sheets

En el Google Sheets maestro, pega y ejecuta:

```text
SplitMasterIntoModules.gs
```

FunciÃ³n:

```text
createModuleSpreadsheetsFromMaster
```

Crea:

```text
Informes - Clima
Informes - Puertas
Informes - Electrico
```

Ventilación queda fuera de estos tres módulos.

## 2. Apps Script de cada mÃ³dulo

Para cada Google Sheets generado, pega estos archivos en Apps Script:

```text
clima/Code.gs
clima/appsscript.json

puertas/Code.gs
puertas/appsscript.json

electrico/Code.gs
electrico/appsscript.json
```

ConfiguraciÃ³n en **Project Settings > Script Properties**:

```text
APP_PASSWORD=tu-clave-de-acceso
SPREADSHEET_ID=id-del-google-sheets-del-modulo
MODULE_NAME=Clima/Puertas/Electrico
```

Despliegue:

1. `Deploy > New deployment`.
2. Tipo: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Copia la URL `/exec`.
6. Repite en los tres mÃ³dulos.

## 3. Configurar el frontend

En `.env.production`:

```env
VITE_API_BACKEND=apps-script
VITE_API_URL_CLIMA=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
VITE_API_URL_PUERTAS=https://script.google.com/macros/s/AKfycbzS7S-YuiE0pmyJt8-WSfKWvw3aSEFX-I2RkXZFln_RZllXIP5lZsNkN_Wz-KPbygubGQ/exec
VITE_API_URL_ELECTRICO=https://script.google.com/macros/s/AKfycbzLFnFvZX8m90Ym-qTf7hqZ6SSklFU9xmUfQtjZ1aigbbM742lcVR7oqoN2MR99V06H/exec
VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycbwIBPPI6y68rZct2JvLFkXg45pNZoferwRi7_nGcTiWJE5zCnuQ2GdLPDdb2GIou5wC/exec
```

