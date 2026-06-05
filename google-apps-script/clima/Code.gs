/**
 * Backend Google Apps Script para la app de revisiones de mantenimiento.
 *
 * Configuracion recomendada en Apps Script > Project Settings > Script Properties:
 * - APP_PASSWORD: clave simple de acceso a la app.
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
  INCIDENTS: 'Incidencias',
  CENTER_SUMMARY: 'Resumen_Revisiones_Centro'
};

const INVENTORY_HEADERS = [
  'Código del equipo',
  'Centro',
  'Tag centro',
  'Instalación',
  'Tag instalación',
  'Familia',
  'Tag familia',
  'Nombre equipo',
  'Número equipo',
  'Ubicación',
  'Marca',
  'Modelo',
  'Nº de serie',
  'Carga de refrigerante',
  'Observaciones equipo',
  'Activo',
  'Plantilla revisión'
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
  'Prioridad',
  'Observaciones generales',
  'Validación',
  'Fecha próxima revisión'
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
  'Foto / evidencia',
  'Incidencia',
  'Prioridad'
];

const INCIDENT_HEADERS = [
  'ID incidencia',
  'ID revisión',
  'Código del equipo',
  'Centro',
  'Instalación',
  'Familia',
  'Descripción',
  'Prioridad',
  'Estado incidencia',
  'Fecha creación',
  'Fecha cierre',
  'Acción recomendada'
];

const CENTER_REPORT_HEADERS = [
  'Centro',
  'Rango de fechas',
  'Total de equipos revisados',
  'Total de revisiones',
  'Equipos correctos',
  'Equipos con incidencia',
  'Incidencias abiertas',
  'Incidencias críticas',
  'Equipos pendientes de revisión',
  'Fecha',
  'Código del equipo',
  'Nombre equipo',
  'Número equipo',
  'Instalación',
  'Familia',
  'Técnico',
  'Estado global',
  'Prioridad',
  'Observaciones generales'
];

const CACHE_SECONDS = 120;
const CACHE_MAX_CHARS = 90000;

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

  if (method === 'GET' && path === '/equipment') return listEquipment_(request.query);
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

  if (method === 'GET' && path === '/incidents') return listIncidents_(request.query);
  if (method === 'PATCH' && parts[0] === 'incidents' && parts[2] === 'close') {
    return closeIncident_(parts[1], request.body.accionRealizada || '');
  }

  throw new Error('Ruta no encontrada: ' + method + ' ' + path);
}

function authenticate_(password) {
  var expected = PropertiesService.getScriptProperties().getProperty('APP_PASSWORD');
  if (expected && password !== expected) {
    throw new Error('No autorizado. Revisa APP_PASSWORD.');
  }
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
  var current = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
  var empty = current.every(function (cell) { return !normalize_(cell); });
  if (empty) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
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
    SHEETS.INCIDENTS,
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

function generateIncidentId_(idRevision, index) {
  return 'INC-' + idRevision.replace(/^REV-/, '') + '-' + String(index + 1).padStart(3, '0');
}

function equipmentFromRow_(row) {
  return {
    codigo: row['Código del equipo'] || '',
    centro: row.Centro || '',
    tagCentro: row['Tag centro'] || '',
    instalacion: row['Instalación'] || '',
    tagInstalacion: row['Tag instalación'] || '',
    familia: row.Familia || '',
    tagFamilia: row['Tag familia'] || '',
    nombreEquipo: row['Nombre equipo'] || '',
    numeroEquipo: row['Número equipo'] || '',
    ubicacion: row['Ubicación'] || '',
    marca: row.Marca || '',
    modelo: row.Modelo || '',
    numeroSerie: row['Nº de serie'] || '',
    cargaRefrigerante: row['Carga de refrigerante'] || '',
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
    equipment.familia,
    equipment.tagFamilia,
    equipment.nombreEquipo,
    equipment.numeroEquipo,
    equipment.ubicacion,
    equipment.marca,
    equipment.modelo,
    equipment.numeroSerie,
    equipment.cargaRefrigerante,
    equipment.observacionesEquipo,
    boolToSheet_(equipment.activo),
    equipment.plantillaRevision
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
    review.prioridad,
    review.observacionesGenerales,
    review.validacion,
    review.fechaProximaRevision
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
    detail.fotoEvidencia,
    detail.incidencia ? 'Sí' : 'No',
    detail.prioridad
  ];
}

function incidentFromRow_(row, equipment) {
  return {
    idIncidencia: row['ID incidencia'] || '',
    idRevision: row['ID revisión'] || '',
    codigoEquipo: row['Código del equipo'] || '',
    centro: row.Centro || '',
    instalacion: row['Instalación'] || '',
    familia: row.Familia || '',
    descripcion: row['Descripción'] || '',
    prioridad: row.Prioridad || '',
    estadoIncidencia: row['Estado incidencia'] || '',
    fechaCreacion: row['Fecha creación'] || '',
    fechaCierre: row['Fecha cierre'] || '',
    accionRecomendada: row['Acción recomendada'] || '',
    nombreEquipo: equipment ? equipment.nombreEquipo : '',
    numeroEquipo: equipment ? equipment.numeroEquipo : '',
    __rowNumber: row.__rowNumber
  };
}

function incidentToRow_(incident) {
  return [
    incident.idIncidencia,
    incident.idRevision,
    incident.codigoEquipo,
    incident.centro,
    incident.instalacion,
    incident.familia,
    incident.descripcion,
    incident.prioridad,
    incident.estadoIncidencia,
    incident.fechaCreacion,
    incident.fechaCierre,
    incident.accionRecomendada
  ];
}

function listEquipment_(filters) {
  var equipment = readObjects_(SHEETS.INVENTORY).map(equipmentFromRow_);
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

  var sortBy = filters.sortBy || 'nombreEquipo';
  var sortDir = filters.sortDir || 'asc';
  equipment.sort(function (a, b) { return compareValues_(a[sortBy], b[sortBy], sortDir); });
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

  var updated = {
    codigo: current.codigo,
    centro: current.centro,
    tagCentro: current.tagCentro,
    instalacion: current.instalacion,
    tagInstalacion: current.tagInstalacion,
    familia: current.familia,
    tagFamilia: current.tagFamilia,
    nombreEquipo: current.nombreEquipo,
    numeroEquipo: current.numeroEquipo,
    ubicacion: data.ubicacion != null ? data.ubicacion : current.ubicacion,
    marca: data.marca != null ? data.marca : current.marca,
    modelo: data.modelo != null ? data.modelo : current.modelo,
    numeroSerie: data.numeroSerie != null ? data.numeroSerie : current.numeroSerie,
    cargaRefrigerante: data.cargaRefrigerante != null ? data.cargaRefrigerante : current.cargaRefrigerante,
    observacionesEquipo: data.observacionesEquipo != null ? data.observacionesEquipo : current.observacionesEquipo,
    activo: data.activo != null ? Boolean(data.activo) : current.activo,
    plantillaRevision: current.plantillaRevision
  };

  var sheet = getSheet_(SHEETS.INVENTORY, false);
  sheet.getRange(current.__rowNumber, 1, 1, INVENTORY_HEADERS.length).setValues([equipmentToRow_(updated)]);
  clearSheetCache_(SHEETS.INVENTORY);
  return updated;
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
    nombreEquipo: normalize_(data.nombreEquipo),
    numeroEquipo: numero,
    ubicacion: normalize_(data.ubicacion),
    marca: normalize_(data.marca),
    modelo: normalize_(data.modelo),
    numeroSerie: normalize_(data.numeroSerie),
    cargaRefrigerante: normalize_(data.cargaRefrigerante),
    observacionesEquipo: normalize_(data.observacionesEquipo),
    activo: data.activo == null ? true : Boolean(data.activo),
    plantillaRevision: normalize_(data.plantillaRevision || template)
  };

  appendRows_(SHEETS.INVENTORY, INVENTORY_HEADERS, [equipmentToRow_(equipment)]);
  clearSheetCache_(SHEETS.INVENTORY);
  return equipment;
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
  return String(max + 1).padStart(3, '0');
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
  return { deleted: true, codigo: current.codigo };
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
  return { plantillaRevision: plantillaRevision, items: items };
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
    prioridad: normalize_(payload.prioridad),
    observacionesGenerales: normalize_(payload.observacionesGenerales),
    validacion: normalize_(payload.validacion),
    fechaProximaRevision: normalize_(payload.fechaProximaRevision)
  };

  var requiredItems = {};
  checklist.items.forEach(function (item) {
    if (item.obligatorio) requiredItems[item.numeroItem] = true;
  });

  var details = payload.answers.filter(function (answer) {
    return requiredItems[answer.numeroItem] ||
      normalize_(answer.respuesta) ||
      normalize_(answer.observacion) ||
      normalize_(answer.fotoEvidencia) ||
      answer.incidencia;
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
      fotoEvidencia: normalize_(answer.fotoEvidencia),
      incidencia: Boolean(answer.incidencia || isNegativeAnswer_(answer.respuesta)),
      prioridad: normalize_(answer.prioridad || payload.prioridad)
    };
  });

  var incidentAnswers = details.filter(function (detail) {
    return detail.incidencia || isNegativeAnswer_(detail.respuesta);
  });

  var incidents = incidentAnswers.map(function (answer, index) {
    return {
      idIncidencia: generateIncidentId_(idRevision, index),
      idRevision: idRevision,
      codigoEquipo: equipment.codigo,
      centro: equipment.centro,
      instalacion: equipment.instalacion,
      familia: equipment.familia,
      descripcion: (answer.grupo ? answer.grupo + ' - ' : '') + answer.item + ': ' + (answer.observacion || answer.respuesta),
      prioridad: normalize_(answer.prioridad || payload.prioridad),
      estadoIncidencia: 'Abierta',
      fechaCreacion: fechaHora,
      fechaCierre: '',
      accionRecomendada: answer.observacion || 'Revisar incidencia detectada en checklist.'
    };
  });

  appendRows_(SHEETS.REVIEWS, REVIEW_HEADERS, [reviewToRow_(review)]);
  appendRows_(SHEETS.REVIEW_DETAIL, DETAIL_HEADERS, details.map(detailToRow_));
  appendRows_(SHEETS.INCIDENTS, INCIDENT_HEADERS, incidents.map(incidentToRow_));
  return { idRevision: idRevision, incidentsCreated: incidents.length };
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
  if (filters.prioridad) reviews = reviews.filter(function (review) { return normalizeForSearch_(review.prioridad) === normalizeForSearch_(filters.prioridad); });

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
  var incidents = listIncidents_({}).filter(function (incident) {
    return normalizeForSearch_(incident.codigoEquipo) === normalizeForSearch_(codigo);
  });

  return {
    reviews: reviews,
    lastReview: reviews[0] || null,
    openIncidents: incidents.filter(function (incident) { return normalizeForSearch_(incident.estadoIncidencia) !== 'cerrada'; }),
    closedIncidents: incidents.filter(function (incident) { return normalizeForSearch_(incident.estadoIncidencia) === 'cerrada'; }),
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

function listIncidents_(filters) {
  filters = filters || {};
  getSheet_(SHEETS.INCIDENTS, true, INCIDENT_HEADERS);
  var equipmentByCode = {};
  listEquipment_({}).forEach(function (equipment) {
    equipmentByCode[equipment.codigo] = equipment;
  });
  var incidents = readObjects_(SHEETS.INCIDENTS).map(function (row) {
    return incidentFromRow_(row, equipmentByCode[row['Código del equipo']]);
  });

  if (filters.centro) incidents = incidents.filter(function (incident) { return normalizeForSearch_(incident.centro) === normalizeForSearch_(filters.centro); });
  if (filters.prioridad) incidents = incidents.filter(function (incident) { return normalizeForSearch_(incident.prioridad) === normalizeForSearch_(filters.prioridad); });
  if (filters.estadoIncidencia) incidents = incidents.filter(function (incident) { return normalizeForSearch_(incident.estadoIncidencia) === normalizeForSearch_(filters.estadoIncidencia); });

  return incidents.sort(function (a, b) {
    return compareValues_(a.fechaCreacion, b.fechaCreacion, 'desc');
  }).map(stripInternal_);
}

function closeIncident_(idIncidencia, accionRealizada) {
  var incidents = readObjects_(SHEETS.INCIDENTS).map(function (row) {
    return incidentFromRow_(row);
  });
  var incident = incidents.find(function (item) {
    return normalizeForSearch_(item.idIncidencia) === normalizeForSearch_(idIncidencia);
  });
  if (!incident) throw new Error('No existe la incidencia ' + idIncidencia + '.');

  incident.estadoIncidencia = 'Cerrada';
  incident.fechaCierre = new Date().toISOString();
  incident.accionRecomendada = accionRealizada || incident.accionRecomendada;

  var sheet = getSheet_(SHEETS.INCIDENTS, true, INCIDENT_HEADERS);
  sheet.getRange(incident.__rowNumber, 1, 1, INCIDENT_HEADERS.length).setValues([incidentToRow_(incident)]);
  clearSheetCache_(SHEETS.INCIDENTS);
  return stripInternal_(incident);
}

function dashboard_() {
  var equipment = listEquipment_({});
  var reviews = listReviews_();
  var incidents = listIncidents_({});
  var currentMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  var reviewedCodesThisMonth = {};
  reviews.filter(function (review) {
    return review.fechaHora.indexOf(currentMonth) === 0;
  }).forEach(function (review) {
    reviewedCodesThisMonth[review.codigoEquipo] = true;
  });

  return {
    totalEquipos: equipment.length,
    revisionesMes: reviews.filter(function (review) { return review.fechaHora.indexOf(currentMonth) === 0; }).length,
    incidenciasAbiertas: incidents.filter(function (incident) { return normalizeForSearch_(incident.estadoIncidencia) !== 'cerrada'; }).length,
    incidenciasCriticas: incidents.filter(function (incident) { return normalizeForSearch_(incident.prioridad) === 'critica'; }).length,
    equiposPendientes: equipment.filter(function (item) { return item.activo && !reviewedCodesThisMonth[item.codigo]; }).length,
    mockMode: false
  };
}

function generateCenterReport_(center, dateFrom, dateTo) {
  var equipment = listEquipment_({ centro: center });
  var activeEquipment = equipment.filter(function (item) { return item.activo; });
  var reviews = getReviewsByCenter_(center, { dateFrom: dateFrom, dateTo: dateTo });
  var incidents = listIncidents_({ centro: center }).filter(function (incident) {
    return inDateRange_(incident.fechaCreacion, dateFrom, dateTo);
  });

  var reviewedCodes = {};
  reviews.forEach(function (review) { reviewedCodes[review.codigoEquipo] = true; });

  var incidentCodes = {};
  incidents.filter(function (incident) {
    return normalizeForSearch_(incident.estadoIncidencia) !== 'cerrada';
  }).forEach(function (incident) {
    incidentCodes[incident.codigoEquipo] = true;
  });

  var correctCodes = {};
  reviews.filter(function (review) {
    return normalizeForSearch_(review.estadoGlobal) === 'correcto';
  }).forEach(function (review) {
    correctCodes[review.codigoEquipo] = true;
  });

  return {
    centro: center,
    rangoFechas: (dateFrom || 'inicio') + ' - ' + (dateTo || 'hoy'),
    totalEquiposRevisados: Object.keys(reviewedCodes).length,
    totalRevisiones: reviews.length,
    equiposCorrectos: Object.keys(correctCodes).length,
    equiposConIncidencia: Object.keys(incidentCodes).length,
    incidenciasAbiertas: incidents.filter(function (incident) { return normalizeForSearch_(incident.estadoIncidencia) !== 'cerrada'; }).length,
    incidenciasCriticas: incidents.filter(function (incident) { return normalizeForSearch_(incident.prioridad) === 'critica'; }).length,
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
    report.rangoFechas,
    String(report.totalEquiposRevisados),
    String(report.totalRevisiones),
    String(report.equiposCorrectos),
    String(report.equiposConIncidencia),
    String(report.incidenciasAbiertas),
    String(report.incidenciasCriticas),
    String(report.equiposPendientesRevision)
  ];

  if (!report.revisiones.length) {
    return [CENTER_REPORT_HEADERS, summary.concat(['', '', '', '', '', '', '', '', '', ''])];
  }

  return [CENTER_REPORT_HEADERS].concat(report.revisiones.map(function (review, index) {
    return (index === 0 ? summary : new Array(summary.length).fill('')).concat([
      review.fechaHora,
      review.codigoEquipo,
      review.nombreEquipo || '',
      review.numeroEquipo || '',
      review.instalacion,
      review.familia,
      review.tecnico,
      review.estadoGlobal,
      review.prioridad,
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
