import type { CenterReviewFilters, CreateReviewPayload, Review } from '../types/review';
import { apiFetch, toQueryString } from './api';

export async function createReview(payload: CreateReviewPayload): Promise<{ idRevision: string; incidentsCreated: number }> {
  return apiFetch<{ idRevision: string; incidentsCreated: number }>('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getReviewsByCenter(center: string, filters: CenterReviewFilters = {}): Promise<Review[]> {
  return apiFetch<Review[]>(`/reviews/center/${encodeURIComponent(center)}${toQueryString(filters)}`);
}

export async function getReviewsForEquipment(codigo: string): Promise<Review[]> {
  return apiFetch<Review[]>(`/reviews/equipment/${encodeURIComponent(codigo)}`);
}
