import type { CenterReport } from '../types/review';
import { apiFetch, getStoredPassword, isAppsScriptBackend, toQueryString } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function getDashboard(): Promise<{
  totalEquipos: number;
  revisionesMes: number;
  incidenciasAbiertas: number;
  incidenciasCriticas: number;
  equiposPendientes: number;
  mockMode: boolean;
}> {
  return apiFetch<{
    totalEquipos: number;
    revisionesMes: number;
    incidenciasAbiertas: number;
    incidenciasCriticas: number;
    equiposPendientes: number;
    mockMode: boolean;
  }>('/reports/dashboard');
}

export async function generateCenterReport(center: string, dateFrom?: string, dateTo?: string): Promise<CenterReport> {
  return apiFetch<CenterReport>(`/reports/center/${encodeURIComponent(center)}${toQueryString({ dateFrom, dateTo })}`);
}

export async function writeCenterReportSheet(center: string, dateFrom?: string, dateTo?: string): Promise<{ updatedRows: number }> {
  return apiFetch<{ updatedRows: number }>(`/reports/center/${encodeURIComponent(center)}/sheet`, {
    method: 'POST',
    body: JSON.stringify({ dateFrom, dateTo })
  });
}

export async function downloadCenterReportCsv(center: string, dateFrom?: string, dateTo?: string): Promise<void> {
  const path = `/reports/center/${encodeURIComponent(center)}/csv${toQueryString({ dateFrom, dateTo })}`;
  const response = isAppsScriptBackend()
    ? await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          path,
          method: 'GET',
          password: getStoredPassword(),
          body: {}
        })
      })
    : await fetch(`${API_BASE_URL}${path}`, {
        headers: {
          'x-app-password': getStoredPassword()
        }
      });

  if (!response.ok) {
    throw new Error((await response.text()) || 'No se pudo descargar el CSV.');
  }

  const text = await response.text();
  try {
    const payload = JSON.parse(text) as { ok?: boolean; error?: string };
    if (payload.ok === false) throw new Error(payload.error ?? 'No se pudo descargar el CSV.');
  } catch (error) {
    if (error instanceof Error && text.trim().startsWith('{')) throw error;
  }

  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `resumen-${center}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
