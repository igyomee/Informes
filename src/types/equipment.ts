export interface Equipment {
  codigo: string;
  centro: string;
  tagCentro: string;
  instalacion: string;
  tagInstalacion: string;
  familia: string;
  tagFamilia: string;
  nombreEquipo: string;
  numeroEquipo: string;
  ubicacion: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  tipoRefrigerante: string;
  cargaRefrigerante: string;
  observacionesEquipo: string;
  activo: boolean;
  plantillaRevision: string;
}

export type EditableEquipmentFields = Pick<
  Equipment,
  | 'nombreEquipo'
  | 'familia'
  | 'tagFamilia'
  | 'marca'
  | 'modelo'
  | 'numeroSerie'
  | 'tipoRefrigerante'
  | 'cargaRefrigerante'
  | 'ubicacion'
  | 'observacionesEquipo'
  | 'activo'
>;

export interface EquipmentFilters {
  q?: string;
  centro?: string;
  instalacion?: string;
  familia?: string;
  sortBy?: 'centro' | 'nombreEquipo' | 'numeroEquipo' | 'codigo' | 'familia' | 'ubicacion';
  sortDir?: 'asc' | 'desc';
}

export interface EquipmentHistory {
  reviews: import('./review').Review[];
  lastReview: import('./review').Review | null;
  observations: Array<{
    fecha: string;
    observacion: string;
    tecnico: string;
    estadoGlobal: string;
  }>;
}
