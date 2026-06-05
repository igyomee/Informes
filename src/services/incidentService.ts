import type { Incident, IncidentFilters } from '../types/incident';
import { apiFetch, toQueryString } from './api';

export async function listIncidents(filters: IncidentFilters = {}): Promise<Incident[]> {
  return apiFetch<Incident[]>(`/incidents${toQueryString(filters)}`);
}

export async function closeIncident(idIncidencia: string, accionRealizada: string): Promise<Incident> {
  return apiFetch<Incident>(`/incidents/${encodeURIComponent(idIncidencia)}/close`, {
    method: 'PATCH',
    body: JSON.stringify({ accionRealizada })
  });
}
