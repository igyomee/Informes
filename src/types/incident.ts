export interface Incident {
  idIncidencia: string;
  idRevision: string;
  codigoEquipo: string;
  centro: string;
  instalacion: string;
  familia: string;
  descripcion: string;
  prioridad: string;
  estadoIncidencia: string;
  fechaCreacion: string;
  fechaCierre: string;
  accionRecomendada: string;
  nombreEquipo?: string;
  numeroEquipo?: string;
}

export interface IncidentFilters {
  centro?: string;
  prioridad?: string;
  estadoIncidencia?: string;
}
