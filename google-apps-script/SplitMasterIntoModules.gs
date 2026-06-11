/**
 * Ejecuta createModuleSpreadsheetsFromMaster() desde el Apps Script vinculado
 * al Google Sheets maestro para crear tres Google Sheets separados:
 * - Informes - Clima
 * - Informes - Puertas
 * - Informes - Electrico
 */

const MODULE_DEFINITIONS = {
  clima: {
    title: 'Informes - Clima',
    installationTags: ['CL']
  },
  puertas: {
    title: 'Informes - Puertas',
    installationTags: ['PA']
  },
  electrico: {
    title: 'Informes - Electrico',
    installationTags: ['EL']
  }
};

const MASTER_SHEETS = {
  INVENTORY: 'Inventario_Equipos',
  TEMPLATE_MAP: 'Mapa_Plantillas',
  CHECKLIST: 'Plantillas_Checklist',
  REVIEWS: 'Revisiones',
  REVIEW_DETAIL: 'Detalle_Revision',
  INCIDENTS: 'Incidencias'
};

function createModuleSpreadsheetsFromMaster() {
  const source = SpreadsheetApp.getActiveSpreadsheet();
  if (!source) throw new Error('Abre este script desde el Google Sheets maestro.');

  const results = {};
  Object.keys(MODULE_DEFINITIONS).forEach((moduleKey) => {
    const config = MODULE_DEFINITIONS[moduleKey];
    const target = SpreadsheetApp.create(config.title);
    buildModuleSpreadsheet_(source, target, config);
    results[moduleKey] = {
      name: target.getName(),
      spreadsheetId: target.getId(),
      url: target.getUrl()
    };
  });

  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

function buildModuleSpreadsheet_(source, target, config) {
  const inventory = readSheetObjects_(source, MASTER_SHEETS.INVENTORY);
  const inventoryRows = filterRowsByTags_(inventory.rows, 'Tag instalación', config.installationTags);
  const templateMap = readSheetObjects_(source, MASTER_SHEETS.TEMPLATE_MAP);
  const templateMapRows = filterRowsByTags_(templateMap.rows, 'Tag instalación', config.installationTags);
  const templateNames = {};

  templateMapRows.forEach((row) => {
    const name = normalize_(row['Plantilla revisión']);
    if (name) templateNames[name] = true;
  });
  inventoryRows.forEach((row) => {
    const name = normalize_(row['Plantilla revisión']);
    if (name) templateNames[name] = true;
  });

  const checklist = readSheetObjects_(source, MASTER_SHEETS.CHECKLIST);
  const checklistRows = checklist.rows.filter((row) => templateNames[normalize_(row['Plantilla revisión'])]);

  writeSheet_(target, MASTER_SHEETS.INVENTORY, inventory.headers, inventoryRows);
  writeSheet_(target, MASTER_SHEETS.TEMPLATE_MAP, templateMap.headers, templateMapRows);
  writeSheet_(target, MASTER_SHEETS.CHECKLIST, checklist.headers, checklistRows);

  copyHeaderOnly_(source, target, MASTER_SHEETS.REVIEWS);
  copyHeaderOnly_(source, target, MASTER_SHEETS.REVIEW_DETAIL);
  copyHeaderOnly_(source, target, MASTER_SHEETS.INCIDENTS);

  const firstSheet = target.getSheets()[0];
  if (firstSheet && firstSheet.getName() === 'Sheet1') {
    target.deleteSheet(firstSheet);
  }
}

function readSheetObjects_(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error('No existe la hoja ' + sheetName);

  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0].map(normalize_);
  const rows = values.slice(1).filter((row) => row.some((cell) => normalize_(cell))).map((row) => {
    const object = {};
    headers.forEach((header, index) => {
      object[header] = normalize_(row[index]);
    });
    return object;
  });

  return { headers, rows };
}

function filterRowsByTags_(rows, header, tags) {
  const allowed = {};
  tags.forEach((tag) => {
    allowed[normalize_(tag).toUpperCase()] = true;
  });

  return rows.filter((row) => allowed[normalize_(row[header]).toUpperCase()]);
}

function writeSheet_(spreadsheet, sheetName, headers, rows) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  sheet.clearContents();

  const values = [headers].concat(rows.map((row) => headers.map((header) => row[header] || '')));
  sheet.getRange(1, 1, values.length, headers.length).setValues(values);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

function copyHeaderOnly_(source, target, sheetName) {
  const sourceSheet = source.getSheetByName(sheetName);
  if (!sourceSheet) return;
  const lastColumn = sourceSheet.getLastColumn();
  const headers = sourceSheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  writeSheet_(target, sheetName, headers, []);
}

function normalize_(value) {
  return String(value == null ? '' : value).trim();
}
