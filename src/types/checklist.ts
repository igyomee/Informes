export type ChecklistResponseType =
  | 'OK / NO OK / N/A'
  | 'Sí / No'
  | 'Texto libre'
  | 'Número'
  | 'Fecha'
  | 'Selección desplegable'
  | 'Foto o evidencia'
  | 'Observación'
  | string;

export interface ChecklistItem {
  plantillaRevision: string;
  numeroItem: string;
  grupo: string;
  item: string;
  tipoRespuesta: ChecklistResponseType;
  opcionesRespuesta: string[];
  obligatorio: boolean;
  requiereObservacionSiFalla: boolean;
  requiereFotoSiFalla: boolean;
  orden: number;
}

export interface ChecklistTemplate {
  plantillaRevision: string;
  items: ChecklistItem[];
}
