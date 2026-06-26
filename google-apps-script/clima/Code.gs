/**
 * Backend Google Apps Script para la app de revisiones de mantenimiento.
 *
 * Configuracion recomendada en Apps Script > Project Settings > Script Properties:
 * - SPREADSHEET_ID: opcional si el script no esta vinculado directamente al Google Sheets.
 *
 * Publicar como Web App:
 * - Execute as: Me
 * - Who has access: Anyone
 */

const SHEETS = {
  INVENTORY: 'Inventario_Equipos',
  TEMPLATE_MAP: 'Mapa_Plantillas',
  CHECKLIST: 'Plantillas_Checklist',
  REVIEWS: 'Revisiones',
  REVIEW_DETAIL: 'Detalle_Revision',
  CENTER_SUMMARY: 'Resumen_Revisiones_Centro'
};

const INVENTORY_HEADERS = [
  'Código del equipo',
  'Centro',
  'Tag centro',
  'Instalación',
  'Tag instalación',
  'Subinstalación',
  'Tag subinstalación',
  'Familia',
  'Tag familia',
  'Nombre equipo',
  'Número equipo',
  'Ubicación',
  'Marca',
  'Modelo',
  'Nº de serie',
  'Tipo de refrigerante',
  'Carga de refrigerante',
  'GWP',
  'CO2 EQ',
  'Sellado hermético',
  'Relacionados',
  'Gas reciclado',
  'Tipo instalación',
  'Observaciones equipo',
  'Activo',
  'Plantilla revisión',
  'Origen hoja'
];

const REVIEW_HEADERS = [
  'ID revisión',
  'Fecha y hora',
  'Técnico',
  'Centro',
  'Tag centro',
  'Código del equipo',
  'Nombre equipo',
  'Número equipo',
  'Instalación',
  'Tag instalación',
  'Familia',
  'Tag familia',
  'Plantilla revisión',
  'Estado global',
  'Observaciones generales',
  'Validación'
];

const DETAIL_HEADERS = [
  'ID revisión',
  'Código del equipo',
  'Plantilla revisión',
  'Nº ítem',
  'Grupo',
  'Ítem',
  'Respuesta',
  'Observación',
  'Foto / evidencia'
];

const CHECKLIST_HEADERS = [
  'Plantilla revisión',
  'Nº ítem',
  'Grupo',
  'Ítem',
  'Tipo respuesta',
  'Opciones respuesta',
  'Obligatorio',
  'Requiere observación si falla',
  'Requiere foto si falla',
  'Orden'
];

const DOOR_CHECKLISTS = {
  'BARRERA': [
    'COMPROBAR (RUIDOS), AJUSTAR Y LIMPIAR REDUCTOR',
    'Localizar la llave de apertura del compartimento del motor reductor',
    'COMPROBAR, AJUSTAR Y LIMPIAR CABLEADO Y CONEXIONES ELECTRICAS',
    'COMPROBAR, AJUSTAR Y LIMPIAR LOS ELEMENTOS DE CONTROL (BOTONERAS, RECEPTORES DE MANDO, LECTORES DE TARJETAS)',
    'ENGRASE Y LUBRICACION ELEMENTOS MECANICOS (BISAGRAS, MUELLES DE COMPENSACION)',
    'COMPROBAR Y AJUSTAR CELULAS/SENSORES Y SISTEMAS DE SEGURIDAD',
    'COMPROBAR EL MODULO DE CONTROL',
    'VERIFICAR BUEN FUNCIONAMIENTO DE LA BARRERA'
  ],
  'CANCELA CORREDERA': [
    'VERIFICAR BUEN FUNCIONAMIENTO DE LA PUERTA',
    'COMPROBAR AJUSTAR Y LIMPIAR REDUCTOR',
    'COMPROBAR AJUSTAR Y LIMPIAR LOS FINALES DE CARRERA',
    'COMPROBAR AJUSTAR Y LIMPIAR CARRIL GUIA',
    'ENGRASAR RODAMIENTOS Y EQUIPOS QUE LO REQUIERAN',
    'COMPROBAR Y AJUSTAR CELULAS Y SEGURIDADES ASOCIADAS',
    'COMPROBAR EL MODULO DE CONTROL',
    'Localizar la llave de apertura del compartimento del motor reductor'
  ],
  'MUELLE': [
    'COMPROBACION CORRECTO FUNCIONAMIENTO SISTEMA HIDRAULICO ELEVACION Y TRASLACION',
    'INSPECCION VISUAL FUGAS LATIGUILLOS SISTEMA HIDRAULICO ELEVACION Y TRASLACION',
    'INSPECCION VISUAL FUGAS CILINDRO HIDRAULICO SISTEMA HIDRAULICO ELEVACION Y TRASLACION',
    'COMPROBACION CORRECTO NIVEL DE ACEITE',
    'ENGRASE GUIAS DESPLAZAMIENTO SI PROCEDE',
    'INSPECCION VISUAL ESTADO TOPES DE PROXIMIDAD',
    'COMPROBACION CORRECTO FUNCIONAMIENTO ABRIGO',
    'INSPECCION VISUAL ESTADO CABLEADO Y CONECTORES',
    'COMPROBACION CORRECTO FUNCIONAMIENTO CUADRO DE CONTROL/BOTONERA MUELLE Y PUERTA',
    'LIMPIEZA GENERAL MUELLE',
    'LIMPIEZA GENERAL ABRIGO',
    'COMPROBACION/REAPRIETE FIJACIONES ESTRUCTURA GENERAL'
  ],
  'PERSIANA': [
    'ENGRASE Y LUBRICACION ELEMENTOS MECANICOS. eje, poleas, rodamientos y muelles.',
    'COMPROBAR AJUSTAR Y LIMPIAR GUIAS',
    'VERIFICAR BUEN FUNCIONAMIENTO DE LA PUERTA'
  ],
  'PUERTA CORREDERA': [
    'VERIFICAR BUEN FUNCIONAMIENTO DE LA PUERTA',
    'COMPROBAR AJUSTAR Y LIMPIAR CARRIL GUIA',
    'COMPROBAR (RUIDOS), AJUSTAR Y LIMPIAR REDUCTOR (SI PROCEDE)',
    'Localizar la llave de apertura del compartimento del motor reductor (SI PROCEDE)'
  ],
  'PUERTA FRIGORIFICA': [
    'COMPROBACION CORRECTO FUNCIONAMIENTO DE APERTURA Y CIERRE',
    'COMPROBAR ESTADO PLACAS DE ANCLAJE Y UNIONES SOLDADAS',
    'COMPROBACION/REAPRIETE TORNILLERIA',
    'INSPECCION VISUAL CORRECTO ESTADO GENERAL ESTRUCTURA',
    'COMPROBACION CORRECTO ESTADO CABLEADO GENERAL',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO SISTEMAS DE APERTURA (MANDOS, PULSADORES, BOTONERAS...)',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO MOTOR',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO FRENO MOTOR',
    'Localizar la llave de apertura del compartimento del motor reductor (SI PROCEDE)',
    'COMPROBACION NIVEL DE ACEITE REDUCTOR',
    'COMPROBACION FIJACION MOTOR-REDUCTOR',
    'COMPROBACION CORRECTA ESTANQUEIDAD DE LA CAMARA'
  ],
  'PUERTA FUMIGACION': [
    'COMPROBAR ESTADO PLACAS DE ANCLAJE Y UNIONES SOLDADAS',
    'COMPROBACION/REAPRIETE TORNILLERIA',
    'INSPECCION VISUAL CORRECTO ESTADO GENERAL ESTRUCTURA',
    'COMPROBACION CORRECTO ESTADO CABLEADO GENERAL',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO SISTEMAS DE APERTURA (MANDOS, PULSADORES, BOTONERAS...)',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO MOTOR',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO FRENO MOTOR',
    'COMPROBACION NIVEL DE ACEITE REDUCTOR',
    'Localizar la llave de apertura del compartimento del motor reductor (SI PROCEDE)',
    'COMPROBACION FIJACION MOTOR-REDUCTOR',
    'COMPROBACION CORRECTA ESTANQUEIDAD DE LA CAMARA',
    'COMPROBACION CORRECTO FUNCIONAMIENTO DE APERTURA Y CIERRE',
    'INSPECCION VISUAL CORRECTO ESTADO LATIGUILLOS NEUMATICOS Y ELECTROVALVULAS'
  ],
  'PUERTA IGNIFUGA': [
    'COMPROBACION CORRECTA ESTANQUEIDAD DE LA CAMARA',
    'COMPROBAR ESTADO PLACAS DE ANCLAJE Y UNIONES SOLDADAS',
    'COMPROBACION TORNILLERIA',
    'INSPECCION VISUAL CORRECTO ESTADO GENERAL ESTRUCTURA',
    'COMPROBACION CORRECTO ESTADO CABLEADO GENERAL',
    'COMPROBACION CORRECTO ESTADO (MANDOS, PULSADORES, BOTONERAS...)',
    'COMPROBACION CORRECTO ESTADO DEL MOTOR',
    'COMPROBACION CORRECTO ESTADO FRENO MOTOR',
    'Localizar la llave de apertura del compartimento del motor reductor (SI PROCEDE)',
    'COMPROBACION NIVEL DE ACEITE REDUCTOR',
    'COMPROBACION FIJACION MOTOR-REDUCTOR'
  ],
  'PUERTA RAPIDA': [
    'COMPROBACION CORRECTO ESTADO Y DESGASTE DE LA LONA',
    'COMPROBAR ESTADO PLACAS DE ANCLAJE Y UNIONES SOLDADAS',
    'COMPROBACION/REAPRIETE TORNILLERIA',
    'INSPECCION VISUAL CORRECTO ESTADO GENERAL ESTRUCTURA',
    'COMPROBACION CORRECTO ESTADO CABLEADO GENERAL',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO SISTEMAS DE APERTURA (MANDOS, PULSADORES, BOTONERAS...)',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO ELEMENTOS DE SEGURIDAD (FOTOCELULAS, BANDA DE SEGURIDAD, PARO DE EMERGENCIA...)',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO MOTOR',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO FRENO MOTOR',
    'COMPROBACION NIVEL DE ACEITE REDUCTOR',
    'Localizar la llave de apertura del compartimento del motor reductor (SI PROCEDE)',
    'COMPROBACION FIJACION MOTOR-REDUCTOR',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO FINALES DE CARRERA',
    'COMPROBACION CORRECTO ESTADO DE LA CREMALLERA/GUIA DE DESLIZAMIENTO'
  ],
  'PUERTA SECCIONAL': [
    'COMPROBAR ESTADO PLACAS DE ANCLAJE Y UNIONES SOLDADAS',
    'COMPROBACION/REAPRIETE TORNILLERIA',
    'INSPECCION VISUAL CORRECTO ESTADO GENERAL ESTRUCTURA',
    'COMPROBACION CORRECTO ESTADO CABLEADO GENERAL',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO SISTEMAS DE APERTURA (MANDOS, PULSADORES, BOTONERAS...)',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO MOTOR',
    'COMPROBACION CORRECTO ESTADO Y FUNCIONAMIENTO FRENO MOTOR',
    'COMPROBACION NIVEL DE ACEITE REDUCTOR',
    'Localizar la llave de apertura del compartimento del motor reductor (SI PROCEDE)',
    'COMPROBACION FIJACION MOTOR-REDUCTOR',
    'COMPROBACION CORRECTO FUNCIONAMIENTO DE APERTURA Y CIERRE'
  ],
  'PUERTAS Y MUELLES': [
    'COMPROBACION CORRECTO FUNCIONAMIENTO SISTEMA HIDRAULICO ELEVACION Y TRASLACION',
    'INSPECCION VISUAL FUGAS LATIGUILLOS SISTEMA HIDRAULICO ELEVACION Y TRASLACION',
    'INSPECCION VISUAL FUGAS CILINDRO HIDRAULICO SISTEMA HIDRAULICO ELEVACION Y TRASLACION',
    'COMPROBACION CORRECTO NIVEL DE ACEITE',
    'ENGRASE GUIAS DESPLAZAMIENTO SI PROCEDE',
    'INSPECCION VISUAL ESTADO TOPES DE PROXIMIDAD',
    'COMPROBACION CORRECTO FUNCIONAMIENTO ABRIGO',
    'Localizar la llave de apertura del compartimento del motor reductor (SI PROCEDE)',
    'INSPECCION VISUAL ESTADO CABLEADO Y CONECTORES',
    'COMPROBACION CORRECTO FUNCIONAMIENTO CUADRO DE CONTROL/BOTONERA MUELLE Y PUERTA'
  ]
};

const LATEST_REVIEW_BASE_HEADERS = [
  'Código del equipo',
  'Centro',
  'Nombre equipo',
  'Número equipo',
  'Instalación',
  'Familia',
  'Plantilla revisión',
  'ID revisión',
  'Fecha y hora',
  'Técnico',
  'Estado global',
  'Observaciones generales'
];

const CENTER_REPORT_HEADERS = [
  'Centro',
  'Total de equipos revisados',
  'Total de revisiones',
  'Equipos correctos',
  'Equipos pendientes de revisión',
  'Código del equipo',
  'Nombre equipo',
  'Número equipo',
  'Familia',
  'Técnico',
  'Estado global',
  'Observaciones generales'
];

const CACHE_SECONDS = 120;
const CACHE_MAX_CHARS = 90000;
const ADMIN_PASSWORD = '456T*Yomee';
const REVIEW_PERIOD_START_PROPERTY = 'REVIEW_PERIOD_START';
const REVIEW_PERIOD_LABEL_PROPERTY = 'REVIEW_PERIOD_LABEL';

function doGet(e) {
  return handleRequest_({
    method: 'GET',
    path: e && e.parameter && e.parameter.path ? e.parameter.path : '/health',
    query: e && e.parameter ? e.parameter : {},
    body: {},
    password: e && e.parameter ? e.parameter.password || '' : ''
  });
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (error) {
    return jsonResponse_({ ok: false, error: 'Body JSON invalido.' });
  }

  return handleRequest_({
    method: String(body.method || 'GET').toUpperCase(),
    path: body.path || '/health',
    query: body.query || {},
    body: body.body || {},
    password: body.password || ''
  });
}

function handleRequest_(request) {
  try {
    var parsed = parsePath_(request.path, request.query);
    request.path = parsed.path;
    request.query = parsed.query;
    authenticate_(request.password || request.query.password || '');

    var result = route_(request);
    if (result && result.__csv) {
      return csvResponse_(result.csv);
    }
    return jsonResponse_({ ok: true, data: result });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error && error.message ? error.message : String(error) });
  }
}

function route_(request) {
  var method = request.method;
  var path = request.path;
  var parts = path.split('/').filter(Boolean).map(decodeURIComponent);

  if (path === '/health') return { ok: true, backend: 'google-apps-script' };

  if (method === 'GET' && path === '/fichas-qr') return getFichasQrRows_(request.query);

  if (method === 'GET' && path === '/equipment') return listEquipment_(request.query);
  if (method === 'POST' && path === '/equipment/reorder') return reorderEquipment_(request.body);
  if (method === 'POST' && path === '/equipment') return createEquipment_(request.body);
  if (method === 'GET' && parts[0] === 'equipment' && parts.length === 2) return getEquipmentByCode_(parts[1]);
  if (method === 'PATCH' && parts[0] === 'equipment' && parts.length === 2) return updateEquipment_(parts[1], request.body);
  if (method === 'DELETE' && parts[0] === 'equipment' && parts.length === 2) return deleteEquipment_(parts[1]);
  if (method === 'GET' && parts[0] === 'equipment' && parts[2] === 'history') return getEquipmentHistory_(parts[1]);

  if (method === 'GET' && parts[0] === 'templates' && parts[1] === 'equipment' && parts[3] === 'checklist') {
    return getChecklistForEquipment_(parts[2]);
  }

  if (method === 'POST' && path === '/reviews') return createReview_(request.body);
  if (method === 'GET' && parts[0] === 'reviews' && parts[1] === 'center') return getReviewsByCenter_(parts[2], request.query);
  if (method === 'GET' && parts[0] === 'reviews' && parts[1] === 'equipment') return getReviewsForEquipment_(parts[2]);

  if (method === 'POST' && path === '/admin/reset-period') return resetReviewPeriod_(request.body);

  if (method === 'GET' && path === '/reports/dashboard') return dashboard_();
  if (method === 'GET' && parts[0] === 'reports' && parts[1] === 'center' && parts.length === 3) {
    return generateCenterReport_(parts[2], request.query.dateFrom, request.query.dateTo);
  }
  if (method === 'GET' && parts[0] === 'reports' && parts[1] === 'center' && parts[3] === 'csv') {
    var report = generateCenterReport_(parts[2], request.query.dateFrom, request.query.dateTo);
    return { __csv: true, csv: rowsToCsv_(centerReportToRows_(report)) };
  }
  if (method === 'POST' && parts[0] === 'reports' && parts[1] === 'center' && parts[3] === 'sheet') {
    return writeCenterReportSheet_(parts[2], request.body.dateFrom, request.body.dateTo);
  }

  throw new Error('Ruta no encontrada: ' + method + ' ' + path);
}

function authenticate_(password) {
  return true;
}

function reviewPeriodLabel_(reviewNumber, year) {
  return reviewNumber + 'ªRevisión-' + year;
}

function defaultReviewPeriod_() {
  var now = new Date();
  var year = Number(Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy'));
  return {
    periodLabel: reviewPeriodLabel_(1, year),
    periodStart: year + '-01-01T00:00:00.000Z'
  };
}

function getReviewPeriod_() {
  var properties = PropertiesService.getScriptProperties();
  var periodLabel = properties.getProperty(REVIEW_PERIOD_LABEL_PROPERTY);
  var periodStart = properties.getProperty(REVIEW_PERIOD_START_PROPERTY);
  if (!periodLabel || !periodStart) return defaultReviewPeriod_();
  return { periodLabel: periodLabel, periodStart: periodStart };
}

function resetReviewPeriod_(data) {
  data = data || {};
  if (normalize_(data.adminPassword) !== ADMIN_PASSWORD) {
    throw new Error('Contraseña de administrador incorrecta.');
  }

  var now = new Date();
  var year = Number(Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy'));
  var current = getReviewPeriod_();
  var currentYearMatch = normalize_(current.periodLabel).match(/(\d{4})$/);
  var currentYear = currentYearMatch ? Number(currentYearMatch[1]) : 0;
  var currentReview = normalize_(current.periodLabel).indexOf('2') === 0 ? 2 : 1;
  var nextReview = currentYear === year && currentReview === 1 ? 2 : 1;
  var next = {
    periodLabel: reviewPeriodLabel_(nextReview, year),
    periodStart: now.toISOString()
  };

  PropertiesService.getScriptProperties().setProperties({
    [REVIEW_PERIOD_LABEL_PROPERTY]: next.periodLabel,
    [REVIEW_PERIOD_START_PROPERTY]: next.periodStart
  });
  return next;
}

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('No hay Google Sheets activo. Define SPREADSHEET_ID en Script Properties.');
  }
  return spreadsheet;
}

function getSheet_(name, createIfMissing, headers) {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet && createIfMissing) {
    sheet = spreadsheet.insertSheet(name);
  }
  if (!sheet) throw new Error('No existe la hoja ' + name + '.');
  if (headers) ensureHeaders_(sheet, headers);
  return sheet;
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }
  var current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getDisplayValues()[0];
  var empty = current.every(function (cell) { return !normalize_(cell); });
  if (empty) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var existing = {};
  current.forEach(function (header, index) {
    if (normalize_(header)) existing[normalizeForSearch_(header)] = true;
  });
  headers.forEach(function (header) {
    if (existing[normalizeForSearch_(header)]) return;
    var blankIndex = current.findIndex(function (cell) { return !normalize_(cell); });
    if (blankIndex < 0) {
      current.push(header);
      sheet.getRange(1, current.length, 1, 1).setValue(header);
    } else {
      current[blankIndex] = header;
      sheet.getRange(1, blankIndex + 1, 1, 1).setValue(header);
    }
    existing[normalizeForSearch_(header)] = true;
  });
}

function readObjects_(sheetName) {
  var cached = getCachedRows_(sheetName);
  if (cached) return cached;

  var sheet = getSheet_(sheetName, false);
  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  var headers = values[0].map(normalize_);
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    if (!values[i].some(function (cell) { return normalize_(cell); })) continue;
    var row = { __rowNumber: i + 1 };
    headers.forEach(function (header, index) {
      row[header] = normalize_(values[i][index]);
    });
    rows.push(row);
  }

  setCachedRows_(sheetName, rows);
  return rows;
}

function appendRows_(sheetName, headers, rows) {
  if (!rows.length) return;
  var sheet = getSheet_(sheetName, true, headers);
  var startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
  clearSheetCache_(sheetName);
}

function sortSheetByEquipmentCode_(sheetName, codeHeader) {
  if (sheetName === SHEETS.INVENTORY && isPuertasSpreadsheet_()) return;
  var sheet = getSheet_(sheetName, false);
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length <= 2) return;

  var headers = values[0].map(normalize_);
  var codeIndex = headers.indexOf(codeHeader || 'Código del equipo');
  if (codeIndex < 0) codeIndex = 0;

  var rows = values.slice(1).filter(function (row) {
    return row.some(function (cell) { return normalize_(cell); });
  });
  rows.sort(function (a, b) {
    return compareEquipmentCodes_(a[codeIndex], b[codeIndex]);
  });

  sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), sheet.getLastColumn()).clearContent();
  if (rows.length) sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  clearSheetCache_(sheetName);
}

function ordenarHojasPorCodigo() {
  sortSheetByEquipmentCode_(SHEETS.INVENTORY, 'Código del equipo');
  var spreadsheet = getSpreadsheet_();
  spreadsheet.getSheets().forEach(function (sheet) {
    var name = sheet.getName();
    if (name.indexOf('Ultima_') === 0 && sheet.getLastRow() > 1) {
      sortSheetByEquipmentCode_(name, 'Código del equipo');
    }
  });
}

function cacheKey_(sheetName) {
  return 'rows_' + sheetName;
}

function getCachedRows_(sheetName) {
  try {
    var value = CacheService.getScriptCache().get(cacheKey_(sheetName));
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

function setCachedRows_(sheetName, rows) {
  try {
    var value = JSON.stringify(rows);
    if (value.length <= CACHE_MAX_CHARS) {
      CacheService.getScriptCache().put(cacheKey_(sheetName), value, CACHE_SECONDS);
    }
  } catch (error) {
    // Si la cache falla o la hoja es demasiado grande, se sigue leyendo de Sheets.
  }
}

function clearSheetCache_(sheetName) {
  try {
    CacheService.getScriptCache().remove(cacheKey_(sheetName));
  } catch (error) {
    // No bloquea escrituras.
  }
}

function clearDataCaches_() {
  [
    SHEETS.INVENTORY,
    SHEETS.TEMPLATE_MAP,
    SHEETS.CHECKLIST,
    SHEETS.REVIEWS,
    SHEETS.REVIEW_DETAIL,
    SHEETS.CENTER_SUMMARY
  ].forEach(clearSheetCache_);
}

function normalize_(value) {
  return String(value == null ? '' : value).trim();
}

function normalizeForSearch_(value) {
  return normalize_(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function toBoolean_(value) {
  var normalized = normalizeForSearch_(value);
  return ['si', 'sí', 'true', '1', 'activo', 'x', 'yes'].indexOf(normalized) !== -1;
}

function boolToSheet_(value) {
  return value ? 'Sí' : 'No';
}

function splitOptions_(value) {
  return normalize_(value).split(/[;,|]/).map(function (option) {
    return option.trim();
  }).filter(Boolean);
}

function doorChecklistKey_(value) {
  return normalizeForSearch_(value).toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function getDoorQuestions_(familyOrTag) {
  var key = doorChecklistKey_(familyOrTag);
  return DOOR_CHECKLISTS[key] || null;
}

function actualizarPlantillasPuertas() {
  var mapRows = readObjects_(SHEETS.TEMPLATE_MAP);
  var rows = [];
  var usedTemplates = {};
  mapRows.forEach(function (row) {
    var family = normalize_(row.Familia);
    var tagFamily = normalize_(row['Tag familia']);
    var template = normalize_(row['Plantilla revisión']);
    var questions = getDoorQuestions_(family) || getDoorQuestions_(tagFamily);
    if (!questions || !template) return;
    if (usedTemplates[template]) return;
    usedTemplates[template] = true;

    questions.forEach(function (question, index) {
      rows.push([
        template,
        String(index + 1),
        family || tagFamily,
        question,
        'OK / NO OK / N/A',
        'OK;NO OK;N/A',
        'Sí',
        'Sí',
        'No',
        index + 1
      ]);
    });
  });

  if (!rows.length) {
    throw new Error('No se encontraron familias de puertas compatibles en Mapa_Plantillas.');
  }

  var sheet = getSheet_(SHEETS.CHECKLIST, true, CHECKLIST_HEADERS);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, CHECKLIST_HEADERS.length).setValues([CHECKLIST_HEADERS]);
  sheet.getRange(2, 1, rows.length, CHECKLIST_HEADERS.length).setValues(rows);
  clearSheetCache_(SHEETS.CHECKLIST);
  return { updatedRows: rows.length };
}

const SOURCE_FICHAS_QR_SPREADSHEET_ID = '1xS3DDh1hLnmLueIBMi22vRSimZ7uCsFOR7a2tQs7C2g';

function cell_(values, rowIndex, columnIndex) {
  return normalize_((values[rowIndex] || [])[columnIndex - 1]);
}

function numberFromEquipmentCode_(codigo) {
  var parsed = parseEquipmentCodeLoose_(codigo);
  var number = normalize_(parsed.numero);
  var asNumber = Number(number);
  return number && !isNaN(asNumber) ? String(asNumber) : number;
}

function importedTemplateForTags_(sourceSheetName, tagInstalacion, tagFamilia) {
  var key = normalize_(tagInstalacion).toUpperCase() + '|' + normalize_(tagFamilia).toUpperCase();
  var maps = {
    CLIMA: {
      'CL|UI': 'CHECK_CL_UI',
      'CL|UE': 'CHECK_CL_UE'
    },
    ELECTRICO: {
      'BT|BC': 'CHECK_EL_BC',
      'BT|CE': 'CHECK_EL_CE',
      'BT|GE': 'CHECK_EL_GE',
      'BT|PR': 'CHECK_EL_PR',
      'BT|TR': 'CHECK_EL_TR',
      'EL|BC': 'CHECK_EL_BC',
      'EL|CE': 'CHECK_EL_CE',
      'EL|GE': 'CHECK_EL_GE',
      'EL|PR': 'CHECK_EL_PR',
      'EL|TR': 'CHECK_EL_TR'
    },
    PUERTAS: {
      'PA|BR': 'CHECK_PA_BR',
      'PA|CA': 'CHECK_PA_CA',
      'PA|CC': 'CHECK_PA_CC',
      'PA|CI': 'CHECK_PA_CI',
      'PA|MM': 'CHECK_PA_MM',
      'PA|MP': 'CHECK_PA_MP',
      'PA|PB': 'CHECK_PA_PB',
      'PA|PC': 'CHECK_PA_PC',
      'PA|PE': 'CHECK_PA_PE',
      'PA|PF': 'CHECK_PA_PF',
      'PA|PI': 'CHECK_PA_PI',
      'PA|PR': 'CHECK_PA_PR',
      'PA|PS': 'CHECK_PA_PS',
      'PA|´PF': 'CHECK_PA_PF'
    }
  };

  if (sourceSheetName === 'CLIMA') return maps.CLIMA[key] || '';
  if (sourceSheetName === 'ELECTRICO') return maps.ELECTRICO[key] || '';
  return maps.PUERTAS[key] || '';
}

function buildImportedEquipment_(sourceSheetName) {
  var source = SpreadsheetApp.openById(SOURCE_FICHAS_QR_SPREADSHEET_ID).getSheetByName(sourceSheetName);
  if (!source) throw new Error('No existe la hoja origen ' + sourceSheetName + '.');

  var values = source.getDataRange().getDisplayValues();
  var rows = [];

  if (sourceSheetName === 'CLIMA') {
    for (var rowIndex = 2; rowIndex < values.length; rowIndex++) {
      var codigoClima = cell_(values, rowIndex, 10);
      if (!codigoClima) continue;

      var tagInstalacionClima = cell_(values, rowIndex, 5);
      var tagFamiliaClima = cell_(values, rowIndex, 9);
      rows.push({
        codigo: codigoClima,
        centro: cell_(values, rowIndex, 2),
        tagCentro: cell_(values, rowIndex, 3),
        instalacion: cell_(values, rowIndex, 4),
        tagInstalacion: tagInstalacionClima,
        subinstalacion: cell_(values, rowIndex, 6),
        tagSubinstalacion: cell_(values, rowIndex, 7),
        familia: cell_(values, rowIndex, 8),
        tagFamilia: tagFamiliaClima,
        nombreEquipo: cell_(values, rowIndex, 11),
        numeroEquipo: numberFromEquipmentCode_(codigoClima),
        ubicacion: cell_(values, rowIndex, 23),
        marca: cell_(values, rowIndex, 20),
        modelo: cell_(values, rowIndex, 12),
        numeroSerie: cell_(values, rowIndex, 13),
        tipoRefrigerante: cell_(values, rowIndex, 14),
        cargaRefrigerante: cell_(values, rowIndex, 15),
        gwp: cell_(values, rowIndex, 16),
        co2eq: cell_(values, rowIndex, 17),
        selladoHermetico: cell_(values, rowIndex, 18),
        relacionados: cell_(values, rowIndex, 19),
        gasReciclado: cell_(values, rowIndex, 21),
        tipoInstalacion: cell_(values, rowIndex, 22),
        observacionesEquipo: '',
        activo: true,
        plantillaRevision: importedTemplateForTags_(sourceSheetName, tagInstalacionClima, tagFamiliaClima),
        origenHoja: 'CLIMA'
      });
    }
    return rows;
  }

  for (var i = 1; i < values.length; i++) {
    var codigo = cell_(values, i, 10);
    if (!codigo) continue;

    var parsedCode = parseEquipmentCodeLoose_(codigo);
    if (!parsedCode.tagCentro || !parsedCode.tagInstalacion || !parsedCode.tagFamilia) continue;
    if (sourceSheetName === 'ELECTRICO' && parsedCode.tagFamilia !== 'CE') continue;

    var tagInstalacion = parsedCode.tagInstalacion;
    var tagFamilia = parsedCode.tagFamilia;
    var familyName = cell_(values, i, 8) || tagFamilia;
    var equipmentName = cell_(values, i, 11) || familyName || codigo;
    rows.push({
      codigo: codigo,
      centro: cell_(values, i, 2) || parsedCode.tagCentro,
      tagCentro: parsedCode.tagCentro,
      instalacion: sourceSheetName === 'ELECTRICO' ? 'Electrico' : 'Puertas',
      tagInstalacion: tagInstalacion,
      subinstalacion: familyName,
      tagSubinstalacion: tagFamilia,
      familia: familyName,
      tagFamilia: tagFamilia,
      nombreEquipo: equipmentName,
      numeroEquipo: numberFromEquipmentCode_(codigo),
      ubicacion: '',
      marca: '',
      modelo: '',
      numeroSerie: '',
      tipoRefrigerante: '',
      cargaRefrigerante: '',
      gwp: '',
      co2eq: '',
      selladoHermetico: '',
      relacionados: '',
      gasReciclado: '',
      tipoInstalacion: '',
      observacionesEquipo: '',
      activo: true,
      plantillaRevision: importedTemplateForTags_(sourceSheetName, tagInstalacion, tagFamilia),
      origenHoja: sourceSheetName
    });
  }
  return rows;
}

function fichasQrSheetNameForCurrentSpreadsheet_() {
  var title = getSpreadsheet_().getName().toLowerCase();
  if (title.indexOf('clima') !== -1) return 'CLIMA';
  if (title.indexOf('electrico') !== -1 || title.indexOf('elÃ©ctrico') !== -1 || title.indexOf('eléctrico') !== -1) return 'ELECTRICO';
  if (title.indexOf('puertas') !== -1) return 'PUERTAS AUTOMATICAS';
  return '';
}

function fichasQrValue_(value) {
  return value == null ? '' : value;
}

function fichasQrRowForEquipment_(sourceSheetName, equipment) {
  if (sourceSheetName === 'CLIMA') {
    return [
      '',
      fichasQrValue_(equipment.centro),
      fichasQrValue_(equipment.tagCentro),
      fichasQrValue_(equipment.instalacion || 'Clima'),
      fichasQrValue_(equipment.tagInstalacion || 'CL'),
      fichasQrValue_(equipment.subinstalacion || equipment.familia),
      fichasQrValue_(equipment.tagSubinstalacion || equipment.tagFamilia),
      fichasQrValue_(equipment.familia),
      fichasQrValue_(equipment.tagFamilia),
      fichasQrValue_(equipment.codigo),
      fichasQrValue_(equipment.nombreEquipo),
      fichasQrValue_(equipment.modelo),
      fichasQrValue_(equipment.numeroSerie),
      fichasQrValue_(equipment.tipoRefrigerante),
      fichasQrValue_(equipment.cargaRefrigerante),
      fichasQrValue_(equipment.gwp),
      fichasQrValue_(equipment.co2eq),
      fichasQrValue_(equipment.selladoHermetico),
      fichasQrValue_(equipment.relacionados),
      fichasQrValue_(equipment.marca),
      fichasQrValue_(equipment.gasReciclado),
      fichasQrValue_(equipment.tipoInstalacion),
      fichasQrValue_(equipment.ubicacion)
    ];
  }

  return [
    '',
    fichasQrValue_(equipment.centro),
    fichasQrValue_(equipment.tagCentro),
    fichasQrValue_(equipment.instalacion),
    fichasQrValue_(equipment.tagInstalacion),
    fichasQrValue_(equipment.subinstalacion || equipment.familia),
    fichasQrValue_(equipment.tagSubinstalacion || equipment.tagFamilia),
    fichasQrValue_(equipment.familia),
    fichasQrValue_(equipment.tagFamilia),
    fichasQrValue_(equipment.codigo),
    fichasQrValue_(equipment.nombreEquipo)
  ];
}

function syncFichasQrFromCurrentInventory_() {
  var sourceSheetName = fichasQrSheetNameForCurrentSpreadsheet_();
  if (!sourceSheetName) return { synced: false, reason: 'No se pudo detectar el modulo.' };

  var targetSheet = SpreadsheetApp.openById(SOURCE_FICHAS_QR_SPREADSHEET_ID).getSheetByName(sourceSheetName);
  if (!targetSheet) throw new Error('No existe la hoja de fichas QR ' + sourceSheetName + '.');

  var rows = readObjects_(SHEETS.INVENTORY).map(equipmentFromRow_).sort(compareEquipmentObjects_);
  var startRow = sourceSheetName === 'CLIMA' ? 3 : 2;
  var columnCount = sourceSheetName === 'CLIMA' ? 23 : 11;
  var lastRow = Math.max(targetSheet.getLastRow(), startRow);
  var clearColumns = Math.max(targetSheet.getLastColumn(), columnCount);

  if (lastRow >= startRow) {
    var clearRange = targetSheet.getRange(startRow, 1, lastRow - startRow + 1, clearColumns);
    clearRange.clearContent();
    clearRange.clearDataValidations();
  }

  if (rows.length) {
    var values = rows.map(function (equipment) {
      return fichasQrRowForEquipment_(sourceSheetName, equipment);
    });
    var writeRange = targetSheet.getRange(startRow, 1, values.length, columnCount);
    writeRange.clearDataValidations();
    writeRange.setValues(values);
  }

  return { synced: true, sourceSheetName: sourceSheetName, rows: rows.length };
}

function sincronizarFichasQrDesdeInventario() {
  return syncFichasQrFromCurrentInventory_();
}

function fichasQrSheetNameFromQuery_(query) {
  var value = normalize_(query && query.sheet).toUpperCase();
  if (value === 'CLIMA') return 'CLIMA';
  if (value === 'ELECTRICO' || value === 'ELÉCTRICO') return 'ELECTRICO';
  if (value === 'PUERTAS' || value === 'PUERTAS AUTOMATICAS' || value === 'PUERTAS AUTOMÁTICAS') return 'PUERTAS AUTOMATICAS';
  var current = fichasQrSheetNameForCurrentSpreadsheet_();
  if (current) return current;
  throw new Error('Indica una hoja valida: CLIMA, ELECTRICO o PUERTAS AUTOMATICAS.');
}

function getFichasQrRows_(query) {
  var sheetName = fichasQrSheetNameFromQuery_(query || {});
  var sheet = SpreadsheetApp.openById(SOURCE_FICHAS_QR_SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) throw new Error('No existe la hoja de fichas QR ' + sheetName + '.');
  return {
    sheet: sheetName,
    rows: sheet.getDataRange().getDisplayValues()
  };
}

function replaceInventoryWithImportedRows_(sourceSheetName) {
  var rows = buildImportedEquipment_(sourceSheetName).sort(compareEquipmentObjects_);
  var sheet = getSheet_(SHEETS.INVENTORY, true);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, INVENTORY_HEADERS.length).setValues([INVENTORY_HEADERS]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, INVENTORY_HEADERS.length).setValues(rows.map(equipmentToRow_));
  }
  clearSheetCache_(SHEETS.INVENTORY);
  return { sourceSheetName: sourceSheetName, importedRows: rows.length };
}

function actualizarInventarioClimaDesdeFichasQR() {
  return replaceInventoryWithImportedRows_('CLIMA');
}

function actualizarInventarioElectricoDesdeFichasQR() {
  return replaceInventoryWithImportedRows_('ELECTRICO');
}

function actualizarInventarioPuertasDesdeFichasQR() {
  return replaceInventoryWithImportedRows_('PUERTAS AUTOMATICAS');
}

function actualizarInventarioDesdeFichasQR() {
  var title = getSpreadsheet_().getName().toLowerCase();
  if (title.indexOf('clima') !== -1) return actualizarInventarioClimaDesdeFichasQR();
  if (title.indexOf('electrico') !== -1 || title.indexOf('eléctrico') !== -1) return actualizarInventarioElectricoDesdeFichasQR();
  if (title.indexOf('puertas') !== -1) return actualizarInventarioPuertasDesdeFichasQR();
  throw new Error('No se pudo detectar el modulo desde el nombre del Google Sheets: ' + getSpreadsheet_().getName());
}

function parsePath_(path, query) {
  var cleanPath = path || '/';
  var nextQuery = {};
  Object.keys(query || {}).forEach(function (key) {
    nextQuery[key] = query[key];
  });

  if (cleanPath.indexOf('?') !== -1) {
    var pieces = cleanPath.split('?');
    cleanPath = pieces[0];
    pieces[1].split('&').forEach(function (pair) {
      var item = pair.split('=');
      nextQuery[decodeURIComponent(item[0])] = decodeURIComponent(item[1] || '');
    });
  }

  if (cleanPath.charAt(0) !== '/') cleanPath = '/' + cleanPath;
  return { path: cleanPath, query: nextQuery };
}

function compareValues_(a, b, dir) {
  var result = normalize_(a).localeCompare(normalize_(b), 'es', { numeric: true, sensitivity: 'base' });
  return dir === 'desc' ? -result : result;
}

function equipmentFamilyRank_(tagFamilia) {
  var tag = normalize_(tagFamilia).toUpperCase();
  if (tag === 'UI') return 1;
  if (tag === 'UE') return 2;
  return 50;
}

function parseEquipmentCodeForSort_(codigo) {
  try {
    return parseEquipmentCode_(codigo);
  } catch (error) {
    return { tagCentro: '', tagInstalacion: '', tagFamilia: '', numero: normalize_(codigo) };
  }
}

function compareEquipmentCodes_(leftCode, rightCode) {
  var left = parseEquipmentCodeForSort_(leftCode);
  var right = parseEquipmentCodeForSort_(rightCode);
  var center = compareValues_(left.tagCentro, right.tagCentro, 'asc');
  if (center !== 0) return center;
  var installation = compareValues_(left.tagInstalacion, right.tagInstalacion, 'asc');
  if (installation !== 0) return installation;
  var familyRank = equipmentFamilyRank_(left.tagFamilia) - equipmentFamilyRank_(right.tagFamilia);
  if (familyRank !== 0) return familyRank;
  var family = compareValues_(left.tagFamilia, right.tagFamilia, 'asc');
  if (family !== 0) return family;
  return compareValues_(left.numero, right.numero, 'asc');
}

function compareEquipmentObjects_(left, right) {
  return compareEquipmentCodes_(left.codigo || left.codigoEquipo || '', right.codigo || right.codigoEquipo || '');
}

function isPuertasSpreadsheet_() {
  try {
    return normalizeForSearch_(getSpreadsheet_().getName()).indexOf('PUERTAS') !== -1;
  } catch (err) {
    return false;
  }
}

function isPuertasInventory_(rows) {
  if (isPuertasSpreadsheet_()) return true;
  return (rows || []).some(function (item) {
    return normalizeForSearch_(item.tagInstalacion) === 'PA' || normalizeForSearch_(item.instalacion).indexOf('PUERTA') !== -1;
  });
}

function inDateRange_(dateValue, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return true;
  var date = new Date(dateValue);
  if (isNaN(date.getTime())) return true;
  if (dateFrom && date < new Date(dateFrom + 'T00:00:00')) return false;
  if (dateTo && date > new Date(dateTo + 'T23:59:59')) return false;
  return true;
}

function parseEquipmentCode_(codigo) {
  var parts = normalize_(codigo).toUpperCase().split('-').filter(Boolean);
  if (parts.length !== 4) throw new Error('El código del equipo debe tener formato TAGCENTRO-TAGINSTALACION-TAGFAMILIA-NUMERO.');
  return { tagCentro: parts[0], tagInstalacion: parts[1], tagFamilia: parts[2], numero: parts[3] };
}

function isNegativeAnswer_(value) {
  var normalized = normalizeForSearch_(value);
  return ['no ok', 'nok', 'no', 'fallo', 'deficiente', 'incorrecto'].indexOf(normalized) !== -1;
}

function generateReviewId_(codigoEquipo, date) {
  var timestamp = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  return 'REV-' + timestamp + '-' + normalize_(codigoEquipo).toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

function equipmentFromRow_(row) {
  return {
    codigo: row['Código del equipo'] || '',
    centro: row.Centro || '',
    tagCentro: row['Tag centro'] || '',
    instalacion: row['Instalación'] || '',
    tagInstalacion: row['Tag instalación'] || '',
    subinstalacion: row['Subinstalación'] || '',
    tagSubinstalacion: row['Tag subinstalación'] || '',
    familia: row.Familia || '',
    tagFamilia: row['Tag familia'] || '',
    nombreEquipo: row['Nombre equipo'] || '',
    numeroEquipo: row['Número equipo'] || '',
    ubicacion: row['Ubicación'] || '',
    marca: row.Marca || '',
    modelo: row.Modelo || '',
    numeroSerie: row['Nº de serie'] || '',
    tipoRefrigerante: row['Tipo de refrigerante'] || row.Refrigerante || '',
    cargaRefrigerante: row['Carga de refrigerante'] || '',
    gwp: row.GWP || '',
    co2eq: row['CO2 EQ'] || '',
    selladoHermetico: row['Sellado hermético'] || '',
    relacionados: row.Relacionados || '',
    gasReciclado: row['Gas reciclado'] || '',
    tipoInstalacion: row['Tipo instalación'] || '',
    observacionesEquipo: row['Observaciones equipo'] || '',
    activo: toBoolean_(row.Activo),
    plantillaRevision: row['Plantilla revisión'] || '',
    __rowNumber: row.__rowNumber
  };
}

function equipmentToRow_(equipment) {
  return [
    equipment.codigo,
    equipment.centro,
    equipment.tagCentro,
    equipment.instalacion,
    equipment.tagInstalacion,
    equipment.subinstalacion || equipment.familia,
    equipment.tagSubinstalacion || equipment.tagFamilia,
    equipment.familia,
    equipment.tagFamilia,
    equipment.nombreEquipo,
    equipment.numeroEquipo,
    equipment.ubicacion,
    equipment.marca,
    equipment.modelo,
    equipment.numeroSerie,
    equipment.tipoRefrigerante,
    equipment.cargaRefrigerante,
    equipment.gwp || '',
    equipment.co2eq || '',
    equipment.selladoHermetico || '',
    equipment.relacionados || '',
    equipment.gasReciclado || '',
    equipment.tipoInstalacion || '',
    equipment.observacionesEquipo,
    boolToSheet_(equipment.activo),
    equipment.plantillaRevision,
    equipment.origenHoja || ''
  ];
}

function checklistItemFromRow_(row) {
  return {
    plantillaRevision: row['Plantilla revisión'] || '',
    numeroItem: row['Nº ítem'] || '',
    grupo: row.Grupo || '',
    item: row['Ítem'] || '',
    tipoRespuesta: row['Tipo respuesta'] || '',
    opcionesRespuesta: splitOptions_(row['Opciones respuesta'] || ''),
    obligatorio: toBoolean_(row.Obligatorio),
    requiereObservacionSiFalla: toBoolean_(row['Requiere observación si falla']),
    requiereFotoSiFalla: toBoolean_(row['Requiere foto si falla']),
    orden: Number(row.Orden) || 0
  };
}

function reviewFromRow_(row, equipment) {
  return {
    idRevision: row['ID revisión'] || '',
    fechaHora: row['Fecha y hora'] || '',
    tecnico: row['Técnico'] || '',
    centro: row.Centro || '',
    tagCentro: row['Tag centro'] || (equipment ? equipment.tagCentro : ''),
    codigoEquipo: row['Código del equipo'] || '',
    nombreEquipo: row['Nombre equipo'] || (equipment ? equipment.nombreEquipo : ''),
    numeroEquipo: row['Número equipo'] || (equipment ? equipment.numeroEquipo : ''),
    instalacion: row['Instalación'] || '',
    tagInstalacion: row['Tag instalación'] || (equipment ? equipment.tagInstalacion : ''),
    familia: row.Familia || '',
    tagFamilia: row['Tag familia'] || (equipment ? equipment.tagFamilia : ''),
    plantillaRevision: row['Plantilla revisión'] || '',
    estadoGlobal: row['Estado global'] || '',
    prioridad: row.Prioridad || '',
    observacionesGenerales: row['Observaciones generales'] || '',
    validacion: row['Validación'] || '',
    fechaProximaRevision: row['Fecha próxima revisión'] || '',
    __rowNumber: row.__rowNumber
  };
}

function reviewToRow_(review) {
  return [
    review.idRevision,
    review.fechaHora,
    review.tecnico,
    review.centro,
    review.tagCentro,
    review.codigoEquipo,
    review.nombreEquipo,
    review.numeroEquipo,
    review.instalacion,
    review.tagInstalacion,
    review.familia,
    review.tagFamilia,
    review.plantillaRevision,
    review.estadoGlobal,
    review.observacionesGenerales,
    review.validacion
  ];
}

function detailToRow_(detail) {
  return [
    detail.idRevision,
    detail.codigoEquipo,
    detail.plantillaRevision,
    detail.numeroItem,
    detail.grupo,
    detail.item,
    detail.respuesta,
    detail.observacion,
    detail.fotoEvidencia
  ];
}

function listEquipment_(filters) {
  var equipment = readObjects_(SHEETS.INVENTORY).map(equipmentFromRow_);
  var keepSheetOrder = isPuertasInventory_(equipment);
  filters = filters || {};

  if (filters.q) {
    var query = normalizeForSearch_(filters.q);
    equipment = equipment.filter(function (item) {
      return [
        item.codigo,
        item.centro,
        item.instalacion,
        item.familia,
        item.nombreEquipo,
        item.numeroEquipo,
        item.ubicacion,
        item.marca,
        item.modelo,
        item.numeroSerie
      ].some(function (value) {
        return normalizeForSearch_(value).indexOf(query) !== -1;
      });
    });
  }

  if (filters.centro) equipment = equipment.filter(function (item) { return normalizeForSearch_(item.centro) === normalizeForSearch_(filters.centro); });
  if (filters.instalacion) equipment = equipment.filter(function (item) { return normalizeForSearch_(item.instalacion) === normalizeForSearch_(filters.instalacion); });
  if (filters.familia) equipment = equipment.filter(function (item) { return normalizeForSearch_(item.familia) === normalizeForSearch_(filters.familia); });

  if (!keepSheetOrder) equipment.sort(compareEquipmentObjects_);
  return equipment.map(stripInternal_);
}

function getEquipmentByCode_(codigo) {
  var equipment = readObjects_(SHEETS.INVENTORY).map(equipmentFromRow_);
  var found = equipment.find(function (item) {
    return normalizeForSearch_(item.codigo) === normalizeForSearch_(codigo);
  });
  if (!found) throw new Error('No existe ningún equipo con código ' + codigo + '.');
  return stripInternal_(found);
}

function updateEquipment_(codigo, data) {
  data = data || {};
  var rows = readObjects_(SHEETS.INVENTORY).map(equipmentFromRow_);
  var current = rows.find(function (item) {
    return normalizeForSearch_(item.codigo) === normalizeForSearch_(codigo);
  });
  if (!current) throw new Error('No existe ningún equipo con código ' + codigo + '.');

  var nextFamilia = data.familia != null ? normalize_(data.familia) : current.familia;
  var nextTagFamilia = data.tagFamilia != null ? normalize_(data.tagFamilia) : current.tagFamilia;
  var nextCodigo = current.codigo;
  var nextNumero = current.numeroEquipo;
  var nextTemplate = current.plantillaRevision;
  if (normalizeForSearch_(nextTagFamilia) !== normalizeForSearch_(current.tagFamilia)) {
    var parsedCurrent = parseEquipmentCodeLoose_(current.codigo);
    nextNumero = parsedCurrent.numero || current.numeroEquipo;
    nextCodigo = [current.tagCentro, current.tagInstalacion, nextTagFamilia, nextNumero].join('-').toUpperCase();
    var conflict = rows.find(function (item) {
      return normalizeForSearch_(item.codigo) === normalizeForSearch_(nextCodigo) &&
        normalizeForSearch_(item.codigo) !== normalizeForSearch_(current.codigo);
    });
    if (conflict) {
      nextNumero = getNextEquipmentNumber_(rows, current.tagCentro, current.tagInstalacion, nextTagFamilia);
      nextCodigo = [current.tagCentro, current.tagInstalacion, nextTagFamilia, nextNumero].join('-').toUpperCase();
    }
    nextTemplate = findTemplateForTags_(current.tagInstalacion, nextTagFamilia);
  }

  var updated = {
    codigo: nextCodigo,
    centro: current.centro,
    tagCentro: current.tagCentro,
    instalacion: current.instalacion,
    tagInstalacion: current.tagInstalacion,
    familia: nextFamilia,
    tagFamilia: nextTagFamilia,
    nombreEquipo: data.nombreEquipo != null ? normalize_(data.nombreEquipo) : current.nombreEquipo,
    numeroEquipo: numberFromEquipmentCode_(nextCodigo) || nextNumero,
    ubicacion: data.ubicacion != null ? data.ubicacion : current.ubicacion,
    marca: data.marca != null ? data.marca : current.marca,
    modelo: data.modelo != null ? data.modelo : current.modelo,
    numeroSerie: data.numeroSerie != null ? data.numeroSerie : current.numeroSerie,
    tipoRefrigerante: data.tipoRefrigerante != null ? data.tipoRefrigerante : current.tipoRefrigerante,
    cargaRefrigerante: data.cargaRefrigerante != null ? data.cargaRefrigerante : current.cargaRefrigerante,
    tipoInstalacion: data.tipoInstalacion != null ? data.tipoInstalacion : current.tipoInstalacion,
    observacionesEquipo: data.observacionesEquipo != null ? data.observacionesEquipo : current.observacionesEquipo,
    activo: data.activo != null ? Boolean(data.activo) : current.activo,
    plantillaRevision: nextTemplate || current.plantillaRevision
  };

  var sheet = getSheet_(SHEETS.INVENTORY, false);
  sheet.getRange(current.__rowNumber, 1, 1, INVENTORY_HEADERS.length).setValues([equipmentToRow_(updated)]);
  clearSheetCache_(SHEETS.INVENTORY);
  sortSheetByEquipmentCode_(SHEETS.INVENTORY, 'Código del equipo');
  syncFichasQrFromCurrentInventory_();
  return updated;
}

function ensureClimateEquipmentName_(name, tagInstalacion, tagFamilia) {
  var clean = normalize_(name);
  if (normalizeForSearch_(tagInstalacion) !== 'CL') return clean;

  var family = normalizeForSearch_(tagFamilia);
  var prefix = '';
  var oldPrefix = '';
  if (family === 'UI') {
    prefix = 'UNIDAD INTERIOR CLIMATIZACIÓN';
    oldPrefix = 'UNIDAD INTERIOR';
  } else if (family === 'UE') {
    prefix = 'UNIDAD EXTERIOR CLIMATIZACIÓN';
    oldPrefix = 'UNIDAD EXTERIOR';
  } else {
    return clean;
  }

  if (normalizeForSearch_(clean).indexOf(normalizeForSearch_(prefix)) === 0) return clean;
  if (normalizeForSearch_(clean).indexOf(normalizeForSearch_(oldPrefix)) === 0) {
    clean = clean.substring(oldPrefix.length).trim();
  }
  return clean ? prefix + ' ' + clean : prefix;
}

function createEquipment_(data) {
  data = data || {};
  if (!normalize_(data.centro)) throw new Error('El centro es obligatorio.');
  if (!normalize_(data.familia) || !normalize_(data.tagFamilia)) throw new Error('La familia del equipo es obligatoria.');

  var rows = readObjects_(SHEETS.INVENTORY).map(equipmentFromRow_);
  var parsed = parseEquipmentCodeLoose_(data.codigo);
  var tagCentro = normalize_(data.tagCentro || parsed.tagCentro || findTagCentroForCenter_(rows, data.centro) || buildShortTag_(data.centro, 3));
  var tagInstalacion = normalize_(data.tagInstalacion || parsed.tagInstalacion);
  var tagFamilia = normalize_(data.tagFamilia || parsed.tagFamilia);
  var numero = normalize_(data.numeroEquipo || parsed.numero || getNextEquipmentNumber_(rows, tagCentro, tagInstalacion, tagFamilia));
  var codigo = normalize_(data.codigo || [tagCentro, tagInstalacion, tagFamilia, numero].join('-')).toUpperCase();

  var existing = rows.find(function (item) {
    return normalizeForSearch_(item.codigo) === normalizeForSearch_(codigo);
  });
  if (existing) throw new Error('Ya existe un equipo con código ' + codigo + '.');

  var template = findTemplateForTags_(tagInstalacion, tagFamilia);
  var equipment = {
    codigo: codigo,
    centro: normalize_(data.centro),
    tagCentro: tagCentro,
    instalacion: normalize_(data.instalacion),
    tagInstalacion: tagInstalacion,
    familia: normalize_(data.familia),
    tagFamilia: tagFamilia,
    nombreEquipo: ensureClimateEquipmentName_(data.nombreEquipo, tagInstalacion, tagFamilia),
    numeroEquipo: numero,
    ubicacion: normalize_(data.ubicacion),
    marca: normalize_(data.marca),
    modelo: normalize_(data.modelo),
    numeroSerie: normalize_(data.numeroSerie),
    tipoRefrigerante: normalize_(data.tipoRefrigerante),
    cargaRefrigerante: normalize_(data.cargaRefrigerante),
    tipoInstalacion: normalize_(data.tipoInstalacion),
    observacionesEquipo: normalize_(data.observacionesEquipo),
    activo: data.activo == null ? true : Boolean(data.activo),
    plantillaRevision: normalize_(data.plantillaRevision || template)
  };

  appendRows_(SHEETS.INVENTORY, INVENTORY_HEADERS, [equipmentToRow_(equipment)]);
  clearSheetCache_(SHEETS.INVENTORY);
  sortSheetByEquipmentCode_(SHEETS.INVENTORY, 'Código del equipo');
  syncFichasQrFromCurrentInventory_();
  return equipment;
}

function padEquipmentNumber_(number, width) {
  var text = String(number);
  while (text.length < width) text = '0' + text;
  return text;
}

function reorderEquipment_(data) {
  data = data || {};
  var orderedCodes = Array.isArray(data.orderedCodes) ? data.orderedCodes.map(normalize_) : [];
  if (!orderedCodes.length) throw new Error('No se ha recibido ningun orden de maquinas.');

  var orderIndex = {};
  orderedCodes.forEach(function (code, index) {
    orderIndex[normalizeForSearch_(code)] = index;
  });

  var rows = readObjects_(SHEETS.INVENTORY).map(equipmentFromRow_);
  var selected = rows.filter(function (item) {
    return orderIndex[normalizeForSearch_(item.codigo)] != null;
  }).sort(function (a, b) {
    return orderIndex[normalizeForSearch_(a.codigo)] - orderIndex[normalizeForSearch_(b.codigo)];
  });
  if (selected.length !== orderedCodes.length) throw new Error('No se encontraron todas las maquinas para reordenar.');

  var keepSheetOrder = isPuertasInventory_(rows);
  var counters = {};
  var widths = {};
  selected.forEach(function (item) {
    var parsed = parseEquipmentCodeLoose_(item.codigo);
    var key = [parsed.tagCentro, parsed.tagInstalacion, parsed.tagFamilia].join('|');
    widths[key] = Math.max(widths[key] || 2, normalize_(parsed.numero).length || 2);
  });

  var byOldCode = {};
  selected.forEach(function (item) {
    var parsed = parseEquipmentCodeLoose_(item.codigo);
    var key = [parsed.tagCentro, parsed.tagInstalacion, parsed.tagFamilia].join('|');
    counters[key] = (counters[key] || 0) + 1;
    var nextNumber = padEquipmentNumber_(counters[key], widths[key] || 2);
    byOldCode[normalizeForSearch_(item.codigo)] = Object.assign({}, item, {
      codigo: [parsed.tagCentro, parsed.tagInstalacion, parsed.tagFamilia, nextNumber].join('-').toUpperCase(),
      numeroEquipo: String(Number(nextNumber)),
      plantillaRevision: item.plantillaRevision || findTemplateForTags_(parsed.tagInstalacion, parsed.tagFamilia)
    });
  });

  var updatedRows;
  if (keepSheetOrder) {
    var selectedQueue = selected.map(function (item) {
      return byOldCode[normalizeForSearch_(item.codigo)];
    });
    updatedRows = rows.map(function (item) {
      return orderIndex[normalizeForSearch_(item.codigo)] != null ? selectedQueue.shift() : item;
    });
  } else {
    updatedRows = rows.map(function (item) {
      return byOldCode[normalizeForSearch_(item.codigo)] || item;
    }).sort(compareEquipmentObjects_);
  }

  var sheet = getSheet_(SHEETS.INVENTORY, true);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, INVENTORY_HEADERS.length).setValues([INVENTORY_HEADERS]);
  if (updatedRows.length) {
    sheet.getRange(2, 1, updatedRows.length, INVENTORY_HEADERS.length).setValues(updatedRows.map(equipmentToRow_));
  }
  clearSheetCache_(SHEETS.INVENTORY);
  syncFichasQrFromCurrentInventory_();
  return updatedRows.map(stripInternal_);
}

function findTagCentroForCenter_(rows, centro) {
  var centerKey = normalizeForSearch_(centro);
  var match = rows.find(function (item) {
    return normalizeForSearch_(item.centro) === centerKey && normalize_(item.tagCentro);
  });
  return match ? match.tagCentro : '';
}

function buildShortTag_(value, maxLength) {
  var text = normalizeForSearch_(value).toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').trim();
  if (!text) return 'CTR';
  var words = text.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words.map(function (word) { return word.charAt(0); }).join('').slice(0, maxLength || 3);
  }
  return text.replace(/[^A-Z0-9]/g, '').slice(0, maxLength || 3);
}

function getNextEquipmentNumber_(rows, tagCentro, tagInstalacion, tagFamilia) {
  var max = 0;
  rows.forEach(function (item) {
    var parsed = parseEquipmentCodeLoose_(item.codigo);
    var sameGroup =
      normalizeForSearch_(parsed.tagCentro || item.tagCentro) === normalizeForSearch_(tagCentro) &&
      normalizeForSearch_(parsed.tagInstalacion || item.tagInstalacion) === normalizeForSearch_(tagInstalacion) &&
      normalizeForSearch_(parsed.tagFamilia || item.tagFamilia) === normalizeForSearch_(tagFamilia);
    if (!sameGroup) return;

    var value = Number(parsed.numero || item.numeroEquipo);
    if (!isNaN(value) && value > max) max = value;
  });
  return String(max + 1).padStart(2, '0');
}

function deleteEquipment_(codigo) {
  var rows = readObjects_(SHEETS.INVENTORY).map(equipmentFromRow_);
  var current = rows.find(function (item) {
    return normalizeForSearch_(item.codigo) === normalizeForSearch_(codigo);
  });
  if (!current) throw new Error('No existe ningún equipo con código ' + codigo + '.');

  var sheet = getSheet_(SHEETS.INVENTORY, false);
  sheet.deleteRow(current.__rowNumber);
  clearSheetCache_(SHEETS.INVENTORY);
  sortSheetByEquipmentCode_(SHEETS.INVENTORY, 'Código del equipo');
  syncFichasQrFromCurrentInventory_();
  return { deleted: true, codigo: current.codigo };
}

function buildLatestReviewSheetName_(equipment) {
  var tag = normalize_(equipment.tagFamilia) || buildShortTag_(equipment.familia, 12);
  var family = normalize_(equipment.familia);
  var raw = 'Ultima_' + tag + (family ? '_' + family : '');
  return raw.replace(/[\\\/\?\*\[\]\:]/g, '-').slice(0, 99);
}

function latestQuestionHeader_(item) {
  var number = normalize_(item.numeroItem);
  var text = normalize_(item.item);
  return (number ? number + '. ' : '') + text;
}

function ensureDynamicHeaders_(sheet, requiredHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return requiredHeaders;
  }

  var lastColumn = Math.max(sheet.getLastColumn(), requiredHeaders.length, 1);
  var current = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0].map(normalize_);
  var hasAnyHeader = current.some(function (header) { return Boolean(header); });
  if (!hasAnyHeader) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return requiredHeaders;
  }

  var existing = {};
  current.forEach(function (header) {
    if (header) existing[normalizeForSearch_(header)] = true;
  });

  var missing = requiredHeaders.filter(function (header) {
    return !existing[normalizeForSearch_(header)];
  });

  if (missing.length) {
    sheet.getRange(1, current.length + 1, 1, missing.length).setValues([missing]);
    current = current.concat(missing);
  }

  return current.filter(function (header) { return Boolean(header); });
}

function findRowByEquipmentCode_(sheet, codigo) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  var codes = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  var target = normalizeForSearch_(codigo);
  for (var i = 0; i < codes.length; i++) {
    if (normalizeForSearch_(codes[i][0]) === target) return i + 2;
  }
  return 0;
}

function formatLatestAnswer_(answer) {
  if (!answer) return '';
  var parts = [];
  if (normalize_(answer.respuesta)) parts.push(normalize_(answer.respuesta));
  if (normalize_(answer.observacion)) parts.push('Obs: ' + normalize_(answer.observacion));
  return parts.join(' | ');
}

function parseLatestAnswer_(value) {
  var text = normalize_(value);
  if (!text) return { respuesta: '', observacion: '' };

  var marker = ' | Obs: ';
  var markerIndex = text.indexOf(marker);
  if (markerIndex >= 0) {
    return {
      respuesta: normalize_(text.slice(0, markerIndex)),
      observacion: normalize_(text.slice(markerIndex + marker.length))
    };
  }

  if (text.indexOf('Obs: ') === 0) {
    return { respuesta: '', observacion: normalize_(text.slice(5)) };
  }

  return { respuesta: text, observacion: '' };
}

function getLatestAnswersForEquipment_(equipment, items) {
  var sheetName = buildLatestReviewSheetName_(equipment);
  var sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 1) return [];

  var rowNumber = findRowByEquipmentCode_(sheet, equipment.codigo);
  if (!rowNumber) return [];

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var values = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var indexesByHeader = {};
  headers.forEach(function (header, index) {
    if (normalize_(header)) indexesByHeader[normalizeForSearch_(header)] = index;
  });

  return items.map(function (item) {
    var header = latestQuestionHeader_(item);
    var index = indexesByHeader[normalizeForSearch_(header)];
    var parsed = index == null ? { respuesta: '', observacion: '' } : parseLatestAnswer_(values[index]);
    return {
      numeroItem: item.numeroItem,
      grupo: item.grupo,
      item: item.item,
      tipoRespuesta: item.tipoRespuesta,
      respuesta: parsed.respuesta,
      observacion: parsed.observacion,
      fotoEvidencia: ''
    };
  }).filter(function (answer) {
    return normalize_(answer.respuesta) || normalize_(answer.observacion);
  });
}

function updateLatestReviewSheet_(equipment, review, checklist, answers) {
  var sheetName = buildLatestReviewSheetName_(equipment);
  var questionHeaders = checklist.items.map(latestQuestionHeader_);
  var requiredHeaders = LATEST_REVIEW_BASE_HEADERS.concat(questionHeaders);
  var sheet = getSheet_(sheetName, true);
  var headers = ensureDynamicHeaders_(sheet, requiredHeaders);

  var answersByItem = {};
  (answers || []).forEach(function (answer) {
    answersByItem[normalize_(answer.numeroItem)] = answer;
  });

  var valuesByHeader = {
    'Código del equipo': equipment.codigo,
    'Centro': equipment.centro,
    'Nombre equipo': equipment.nombreEquipo,
    'Número equipo': equipment.numeroEquipo,
    'Instalación': equipment.instalacion,
    'Familia': equipment.familia,
    'Plantilla revisión': checklist.plantillaRevision,
    'ID revisión': review.idRevision,
    'Fecha y hora': review.fechaHora,
    'Técnico': review.tecnico,
    'Estado global': review.estadoGlobal,
    'Observaciones generales': review.observacionesGenerales
  };

  checklist.items.forEach(function (item) {
    valuesByHeader[latestQuestionHeader_(item)] = formatLatestAnswer_(answersByItem[normalize_(item.numeroItem)]);
  });

  var row = headers.map(function (header) {
    return valuesByHeader[header] == null ? '' : valuesByHeader[header];
  });

  var rowNumber = findRowByEquipmentCode_(sheet, equipment.codigo) || sheet.getLastRow() + 1;
  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  clearSheetCache_(sheetName);
  sortSheetByEquipmentCode_(sheetName, 'Código del equipo');
}

function findTemplateForTags_(tagInstalacion, tagFamilia) {
  var mapRows = readObjects_(SHEETS.TEMPLATE_MAP);
  var mapRow = mapRows.find(function (row) {
    return normalizeForSearch_(row['Tag instalación']) === normalizeForSearch_(tagInstalacion) &&
      normalizeForSearch_(row['Tag familia']) === normalizeForSearch_(tagFamilia);
  });
  return mapRow ? normalize_(mapRow['Plantilla revisión']) : '';
}

function parseEquipmentCodeLoose_(codigo) {
  try {
    return parseEquipmentCode_(codigo);
  } catch (error) {
    var parts = normalize_(codigo).toUpperCase().split('-').filter(Boolean);
    return {
      tagCentro: parts[0] || '',
      tagInstalacion: parts[1] || '',
      tagFamilia: parts[2] || '',
      numero: parts[3] || ''
    };
  }
}

function getChecklistForEquipment_(codigo) {
  var parsed = parseEquipmentCode_(codigo);
  var equipment = getEquipmentByCode_(codigo);
  var plantillaRevision = equipment.plantillaRevision || findTemplateForTags_(parsed.tagInstalacion, parsed.tagFamilia);
  if (!plantillaRevision) {
    throw new Error('No se encontró plantilla para instalación ' + parsed.tagInstalacion + ' y familia ' + parsed.tagFamilia + '.');
  }

  var items = readObjects_(SHEETS.CHECKLIST).map(checklistItemFromRow_).filter(function (item) {
    return normalizeForSearch_(item.plantillaRevision) === normalizeForSearch_(plantillaRevision);
  }).sort(function (a, b) {
    return a.orden - b.orden;
  });

  if (!items.length) throw new Error('La plantilla ' + plantillaRevision + ' no tiene ítems en Plantillas_Checklist.');
  return { plantillaRevision: plantillaRevision, items: items, lastAnswers: getLatestAnswersForEquipment_(equipment, items) };
}

function validateReviewAnswers_(items, answers) {
  var errors = [];
  var byItem = {};
  (answers || []).forEach(function (answer) {
    byItem[answer.numeroItem] = answer;
  });

  items.forEach(function (item) {
    var answer = byItem[item.numeroItem];
    var response = answer ? normalize_(answer.respuesta) : '';
    if (item.obligatorio && !response) errors.push('El ítem obligatorio "' + item.item + '" no tiene respuesta.');

    if (answer && isNegativeAnswer_(response)) {
      if (item.requiereObservacionSiFalla && !normalize_(answer.observacion)) {
        errors.push('El ítem "' + item.item + '" requiere observación cuando falla.');
      }
    }
  });

  return errors;
}

function createReview_(payload) {
  payload = payload || {};
  if (!normalize_(payload.codigoEquipo)) throw new Error('El código del equipo es obligatorio para crear una revisión.');
  if (!normalize_(payload.tecnico)) throw new Error('El técnico es obligatorio para crear una revisión.');
  if (!Array.isArray(payload.answers)) throw new Error('La revisión debe incluir el detalle de respuestas.');

  var equipment = getEquipmentByCode_(payload.codigoEquipo);
  var checklist = getChecklistForEquipment_(payload.codigoEquipo);
  var validationErrors = validateReviewAnswers_(checklist.items, payload.answers);
  if (validationErrors.length) throw new Error(validationErrors.join(' '));

  var now = new Date();
  var idRevision = generateReviewId_(equipment.codigo, now);
  var fechaHora = now.toISOString();
  var review = {
    idRevision: idRevision,
    fechaHora: fechaHora,
    tecnico: normalize_(payload.tecnico),
    centro: equipment.centro,
    tagCentro: equipment.tagCentro,
    codigoEquipo: equipment.codigo,
    nombreEquipo: equipment.nombreEquipo,
    numeroEquipo: equipment.numeroEquipo,
    instalacion: equipment.instalacion,
    tagInstalacion: equipment.tagInstalacion,
    familia: equipment.familia,
    tagFamilia: equipment.tagFamilia,
    plantillaRevision: checklist.plantillaRevision,
    estadoGlobal: payload.estadoGlobal || 'Correcto',
    observacionesGenerales: normalize_(payload.observacionesGenerales),
    validacion: normalize_(payload.validacion)
  };

  var requiredItems = {};
  checklist.items.forEach(function (item) {
    if (item.obligatorio) requiredItems[item.numeroItem] = true;
  });

  var details = payload.answers.filter(function (answer) {
    return requiredItems[answer.numeroItem] ||
      normalize_(answer.respuesta) ||
      normalize_(answer.observacion) ||
      normalize_(answer.fotoEvidencia);
  }).map(function (answer) {
    return {
      idRevision: idRevision,
      codigoEquipo: equipment.codigo,
      plantillaRevision: checklist.plantillaRevision,
      numeroItem: answer.numeroItem,
      grupo: answer.grupo,
      item: answer.item,
      respuesta: normalize_(answer.respuesta),
      observacion: normalize_(answer.observacion),
      fotoEvidencia: normalize_(answer.fotoEvidencia)
    };
  });

  appendRows_(SHEETS.REVIEWS, REVIEW_HEADERS, [reviewToRow_(review)]);
  appendRows_(SHEETS.REVIEW_DETAIL, DETAIL_HEADERS, details.map(detailToRow_));
  updateLatestReviewSheet_(equipment, review, checklist, payload.answers);
  return { idRevision: idRevision };
}

function listReviews_() {
  getSheet_(SHEETS.REVIEWS, true, REVIEW_HEADERS);
  var equipmentByCode = {};
  listEquipment_({}).forEach(function (equipment) {
    equipmentByCode[equipment.codigo] = equipment;
  });
  return readObjects_(SHEETS.REVIEWS).map(function (row) {
    return reviewFromRow_(row, equipmentByCode[row['Código del equipo']]);
  });
}

function getReviewsByCenter_(center, filters) {
  filters = filters || {};
  var reviews = listReviews_().filter(function (review) {
    return normalizeForSearch_(review.centro) === normalizeForSearch_(center);
  }).filter(function (review) {
    return inDateRange_(review.fechaHora, filters.dateFrom, filters.dateTo);
  });

  if (filters.instalacion) reviews = reviews.filter(function (review) { return normalizeForSearch_(review.instalacion) === normalizeForSearch_(filters.instalacion); });
  if (filters.familia) reviews = reviews.filter(function (review) { return normalizeForSearch_(review.familia) === normalizeForSearch_(filters.familia); });
  if (filters.tecnico) reviews = reviews.filter(function (review) { return normalizeForSearch_(review.tecnico).indexOf(normalizeForSearch_(filters.tecnico)) !== -1; });
  if (filters.estadoGlobal) reviews = reviews.filter(function (review) { return normalizeForSearch_(review.estadoGlobal) === normalizeForSearch_(filters.estadoGlobal); });
  var sortBy = filters.sortBy || 'fechaHora';
  var sortDir = filters.sortDir || 'desc';
  return reviews.sort(function (a, b) { return compareValues_(a[sortBy], b[sortBy], sortDir); }).map(stripInternal_);
}

function getReviewsForEquipment_(codigo) {
  var equipment = getEquipmentByCode_(codigo);
  return listReviews_().filter(function (review) {
    return normalizeForSearch_(review.codigoEquipo) === normalizeForSearch_(equipment.codigo);
  }).sort(function (a, b) {
    return compareValues_(a.fechaHora, b.fechaHora, 'desc');
  }).map(stripInternal_);
}

function getEquipmentHistory_(codigo) {
  var reviews = getReviewsForEquipment_(codigo);

  return {
    reviews: reviews,
    lastReview: reviews[0] || null,
    observations: reviews.filter(function (review) {
      return review.observacionesGenerales;
    }).map(function (review) {
      return {
        fecha: review.fechaHora,
        observacion: review.observacionesGenerales,
        tecnico: review.tecnico,
        estadoGlobal: review.estadoGlobal
      };
    })
  };
}

function dashboard_() {
  var equipment = listEquipment_({});
  var reviews = listReviews_();
  var period = getReviewPeriod_();
  var periodStart = new Date(period.periodStart);
  var reviewedCodesThisMonth = {};
  var reviewedCentersThisMonth = {};
  var monthlyReviews = reviews.filter(function (review) {
    var reviewDate = new Date(review.fechaHora);
    return !isNaN(reviewDate.getTime()) && reviewDate >= periodStart;
  });
  monthlyReviews.forEach(function (review) {
    reviewedCodesThisMonth[review.codigoEquipo] = true;
    if (normalize_(review.centro)) reviewedCentersThisMonth[normalizeForSearch_(review.centro)] = true;
  });

  var centers = {};
  var centerNames = {};
  equipment.forEach(function (item) {
    if (normalize_(item.centro)) {
      var centerKey = normalizeForSearch_(item.centro);
      centers[centerKey] = true;
      centerNames[centerKey] = item.centro;
    }
  });

  var reviewedCenters = Object.keys(reviewedCentersThisMonth).filter(function (centerKey) {
    return centers[centerKey];
  }).map(function (centerKey) {
    return centerNames[centerKey] || centerKey;
  }).sort(function (a, b) {
    return compareValues_(a, b, 'asc');
  });

  var pendingCenters = Object.keys(centers).filter(function (centerKey) {
    return !reviewedCentersThisMonth[centerKey];
  }).map(function (centerKey) {
    return centerNames[centerKey] || centerKey;
  }).sort(function (a, b) {
    return compareValues_(a, b, 'asc');
  });

  var reviewedEquipmentCount = Object.keys(reviewedCodesThisMonth).filter(function (codigo) {
    return equipment.some(function (item) {
      return normalizeForSearch_(item.codigo) === normalizeForSearch_(codigo);
    });
  }).length;

  return {
    totalEquipos: equipment.length,
    totalCentros: Object.keys(centers).length,
    revisionesMes: monthlyReviews.length,
    equiposRevisadosMes: reviewedEquipmentCount,
    centrosRevisadosMes: reviewedCenters.length,
    equiposPendientes: Math.max(equipment.length - reviewedEquipmentCount, 0),
    centrosPendientes: pendingCenters.length,
    centrosRevisadosMesLista: reviewedCenters,
    centrosPendientesLista: pendingCenters,
    periodoRevision: period.periodLabel,
    periodoInicio: period.periodStart,
    mockMode: false
  };
}

function generateCenterReport_(center, dateFrom, dateTo) {
  var equipment = listEquipment_({ centro: center });
  var activeEquipment = equipment.filter(function (item) { return item.activo; });
  var allReviews = getReviewsByCenter_(center, {});
  var latestByCode = {};
  allReviews.forEach(function (review) {
    if (!latestByCode[review.codigoEquipo]) latestByCode[review.codigoEquipo] = review;
  });
  var reviews = Object.keys(latestByCode).map(function (codigo) {
    return latestByCode[codigo];
  }).sort(compareEquipmentObjects_);

  var reviewedCodes = {};
  reviews.forEach(function (review) { reviewedCodes[review.codigoEquipo] = true; });

  var correctCodes = {};
  reviews.filter(function (review) {
    return normalizeForSearch_(review.estadoGlobal) === 'correcto';
  }).forEach(function (review) {
    correctCodes[review.codigoEquipo] = true;
  });

  return {
    centro: center,
    rangoFechas: 'Ultima revision por maquina',
    totalEquiposRevisados: Object.keys(reviewedCodes).length,
    totalRevisiones: reviews.length,
    equiposCorrectos: Object.keys(correctCodes).length,
    equiposPendientesRevision: activeEquipment.filter(function (item) { return !reviewedCodes[item.codigo]; }).length,
    revisiones: reviews
  };
}

function writeCenterReportSheet_(center, dateFrom, dateTo) {
  var report = generateCenterReport_(center, dateFrom, dateTo);
  var rows = centerReportToRows_(report);
  var sheet = getSheet_(SHEETS.CENTER_SUMMARY, true, CENTER_REPORT_HEADERS);
  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  clearSheetCache_(SHEETS.CENTER_SUMMARY);
  return { updatedRows: rows.length };
}

function centerReportToRows_(report) {
  var summary = [
    report.centro,
    String(report.totalEquiposRevisados),
    String(report.totalRevisiones),
    String(report.equiposCorrectos),
    String(report.equiposPendientesRevision)
  ];

  if (!report.revisiones.length) {
    return [CENTER_REPORT_HEADERS, summary.concat(['', '', '', '', '', '', ''])];
  }

  return [CENTER_REPORT_HEADERS].concat(report.revisiones.map(function (review, index) {
    return (index === 0 ? summary : new Array(summary.length).fill('')).concat([
      review.codigoEquipo,
      review.nombreEquipo || '',
      review.numeroEquipo || '',
      review.familia,
      review.tecnico,
      review.estadoGlobal,
      review.observacionesGenerales
    ]);
  }));
}

function rowsToCsv_(rows) {
  return rows.map(function (row) {
    return row.map(function (cell) {
      var value = normalize_(cell);
      return /[",\n;]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
    }).join(';');
  }).join('\n');
}

function stripInternal_(value) {
  var clone = {};
  Object.keys(value).forEach(function (key) {
    if (key.indexOf('__') !== 0) clone[key] = value[key];
  });
  return clone;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function csvResponse_(csv) {
  return ContentService
    .createTextOutput('\uFEFF' + csv)
    .setMimeType(ContentService.MimeType.CSV);
}
