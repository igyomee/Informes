import type { EditableEquipmentFields, Equipment, EquipmentFilters, EquipmentHistory } from '../types/equipment';
import { apiFetch, toQueryString } from './api';

export async function listEquipment(filters: EquipmentFilters = {}): Promise<Equipment[]> {
  return apiFetch<Equipment[]>(`/equipment${toQueryString(filters)}`);
}

export async function getEquipmentByCode(codigo: string): Promise<Equipment> {
  return apiFetch<Equipment>(`/equipment/${encodeURIComponent(codigo)}`);
}

export async function updateEquipment(codigo: string, data: Partial<EditableEquipmentFields>): Promise<Equipment> {
  return apiFetch<Equipment>(`/equipment/${encodeURIComponent(codigo)}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function getEquipmentHistory(codigo: string): Promise<EquipmentHistory> {
  return apiFetch<EquipmentHistory>(`/equipment/${encodeURIComponent(codigo)}/history`);
}
