# Google Apps Script

Pega estos archivos en el editor de Apps Script del Google Sheets:

- `Code.gs`
- `appsscript.json`

Configuracion en **Project Settings > Script Properties**:

```text
APP_PASSWORD=tu-clave-de-acceso
SPREADSHEET_ID=id-del-google-sheets
```

`SPREADSHEET_ID` es opcional si creas el script desde **Extensiones > Apps Script** dentro del propio Google Sheets.

Despliegue:

1. `Deploy > New deployment`.
2. Tipo: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Copia la URL `/exec`.
6. Configura el frontend:

```env
VITE_API_BACKEND=apps-script
VITE_API_BASE_URL=https://script.google.com/macros/s/AKfycbxtUK4nNctozREj0kmNvt-N2hdTSeWryfvh2kwYORB2H6UO60oeJ5TGjdzf-bXK77eukw/exec
```
