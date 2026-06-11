import type { CenterReport } from '../types/review';
import { apiFetch, getActiveApiBaseUrl, getStoredPassword, isAppsScriptBackend } from './api';

export async function getDashboard(): Promise<{
  totalEquipos: number;
  totalCentros: number;
  revisionesMes: number;
  equiposRevisadosMes: number;
  centrosRevisadosMes: number;
  equiposPendientes: number;
  centrosPendientes: number;
  centrosRevisadosMesLista: string[];
  centrosPendientesLista: string[];
  mockMode: boolean;
}> {
  return apiFetch<{
    totalEquipos: number;
    totalCentros: number;
    revisionesMes: number;
    equiposRevisadosMes: number;
    centrosRevisadosMes: number;
    equiposPendientes: number;
    centrosPendientes: number;
    centrosRevisadosMesLista: string[];
    centrosPendientesLista: string[];
    mockMode: boolean;
  }>('/reports/dashboard');
}

export async function generateCenterReport(center: string): Promise<CenterReport> {
  return apiFetch<CenterReport>(`/reports/center/${encodeURIComponent(center)}`);
}

export async function writeCenterReportSheet(center: string): Promise<{ updatedRows: number }> {
  return apiFetch<{ updatedRows: number }>(`/reports/center/${encodeURIComponent(center)}/sheet`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

export async function downloadCenterReportCsv(center: string): Promise<void> {
  const path = `/reports/center/${encodeURIComponent(center)}/csv`;
  const apiBaseUrl = getActiveApiBaseUrl();
  const response = isAppsScriptBackend()
    ? await fetch(apiBaseUrl, {
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
    : await fetch(`${apiBaseUrl}${path}`, {
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
