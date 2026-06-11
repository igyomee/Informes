import { parseEquipmentCode } from './parseEquipmentCode';

const FAMILY_ORDER: Record<string, number> = {
  UI: 1,
  UE: 2
};

function safeParseCode(code: string) {
  try {
    return parseEquipmentCode(code);
  } catch {
    return {
      tagCentro: '',
      tagInstalacion: '',
      tagFamilia: '',
      numero: code
    };
  }
}

function familyRank(tagFamilia: string): number {
  return FAMILY_ORDER[tagFamilia.toUpperCase()] ?? 50;
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
}

export function compareEquipmentCodes(a: string, b: string): number {
  const left = safeParseCode(a);
  const right = safeParseCode(b);
  const center = compareText(left.tagCentro, right.tagCentro);
  if (center !== 0) return center;

  const installation = compareText(left.tagInstalacion, right.tagInstalacion);
  if (installation !== 0) return installation;

  const family = familyRank(left.tagFamilia) - familyRank(right.tagFamilia);
  if (family !== 0) return family;

  const familyText = compareText(left.tagFamilia, right.tagFamilia);
  if (familyText !== 0) return familyText;

  return compareText(left.numero, right.numero);
}

export function compareByEquipmentCode<T extends { codigo?: string; codigoEquipo?: string }>(a: T, b: T): number {
  return compareEquipmentCodes(a.codigo ?? a.codigoEquipo ?? '', b.codigo ?? b.codigoEquipo ?? '');
}
