export interface ParsedEquipmentCode {
  tagCentro: string;
  tagInstalacion: string;
  tagFamilia: string;
  numero: string;
}

export function parseEquipmentCode(codigo: string): ParsedEquipmentCode {
  const parts = codigo.trim().toUpperCase().split('-').filter(Boolean);

  if (parts.length !== 4) {
    throw new Error('El código del equipo debe tener formato TAGCENTRO-TAGINSTALACION-TAGFAMILIA-NUMERO.');
  }

  const [tagCentro, tagInstalacion, tagFamilia, numero] = parts;

  if (!tagCentro || !tagInstalacion || !tagFamilia || !numero) {
    throw new Error('El código del equipo contiene segmentos vacíos.');
  }

  return { tagCentro, tagInstalacion, tagFamilia, numero };
}
