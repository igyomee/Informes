import type { ChecklistTemplate } from '../types/checklist';
import { apiFetch } from './api';

export async function getChecklistForEquipment(codigo: string): Promise<ChecklistTemplate> {
  return apiFetch<ChecklistTemplate>(`/templates/equipment/${encodeURIComponent(codigo)}/checklist`);
}
