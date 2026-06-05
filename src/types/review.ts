import type { ChecklistItem } from './checklist';

export type ReviewPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type ReviewStatus = 'Correcto' | 'Con incidencia' | 'Pendiente' | 'No aplicable';

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
  incidencia: boolean;
  prioridad: ReviewPriority | string;
  checklistItem?: ChecklistItem;
}

export interface CreateReviewPayload {
  tecnico: string;
  codigoEquipo: string;
  estadoGlobal: ReviewStatus | string;
  prioridad: ReviewPriority | string;
  observacionesGenerales: string;
  validacion: string;
  fechaProximaRevision: string;
  answers: ReviewAnswer[];
}

export interface CenterReviewFilters {
  dateFrom?: string;
  dateTo?: string;
  instalacion?: string;
  familia?: string;
  tecnico?: string;
  estadoGlobal?: string;
  prioridad?: string;
  sortBy?: 'fechaHora' | 'codigoEquipo' | 'nombreEquipo' | 'numeroEquipo' | 'estadoGlobal';
  sortDir?: 'asc' | 'desc';
}

export interface CenterReport {
  centro: string;
  rangoFechas: string;
  totalEquiposRevisados: number;
  totalRevisiones: number;
  equiposCorrectos: number;
  equiposConIncidencia: number;
  incidenciasAbiertas: number;
  incidenciasCriticas: number;
  equiposPendientesRevision: number;
  revisiones: Review[];
}
