import type { ChecklistItem } from './checklist';

export type ReviewPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type ReviewStatus = 'Correcto' | 'Con observaciones' | 'Pendiente' | 'No aplicable';

export interface Review {
  idRevision: string;
  fechaHora: string;
  tecnico: string;
  centro: string;
  codigoEquipo: string;
  instalacion: string;
  familia: string;
  plantillaRevision: string;
  estadoGlobal: ReviewStatus | string;
  prioridad: ReviewPriority | string;
  observacionesGenerales: string;
  validacion: string;
  fechaProximaRevision?: string;
  nombreEquipo?: string;
  numeroEquipo?: string;
}

export interface ReviewAnswer {
  numeroItem: string;
  grupo: string;
  item: string;
  tipoRespuesta?: string;
  respuesta: string;
  observacion: string;
  fotoEvidencia: string;
  checklistItem?: ChecklistItem;
}

export interface CreateReviewPayload {
  tecnico: string;
  codigoEquipo: string;
  estadoGlobal: ReviewStatus | string;
  observacionesGenerales: string;
  validacion: string;
  fechaProximaRevision?: string;
  answers: ReviewAnswer[];
}

export interface CenterReviewFilters {
  sortBy?: 'fechaHora' | 'codigoEquipo' | 'nombreEquipo' | 'numeroEquipo' | 'estadoGlobal';
  sortDir?: 'asc' | 'desc';
}

export interface CenterReport {
  centro: string;
  rangoFechas: string;
  totalEquiposRevisados: number;
  totalRevisiones: number;
  equiposCorrectos: number;
  equiposPendientesRevision: number;
  revisiones: Review[];
}
