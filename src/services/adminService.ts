import { apiFetch } from './api';

export async function resetReviewPeriod(adminPassword: string): Promise<{ periodLabel: string; periodStart: string }> {
  return apiFetch<{ periodLabel: string; periodStart: string }>('/admin/reset-period', {
    method: 'POST',
    body: JSON.stringify({ adminPassword })
  });
}
