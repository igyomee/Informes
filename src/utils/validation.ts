import type { ChecklistItem } from '../types/checklist';
import type { ReviewAnswer } from '../types/review';

export function isTruthySpanish(value: unknown): boolean {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') === 'si';
}

export function isNegativeAnswer(value: string): boolean {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  return ['no ok', 'nok', 'no', 'fallo', 'deficiente', 'incorrecto'].includes(normalized);
}

export function validateReviewAnswers(items: ChecklistItem[], answers: ReviewAnswer[]): string[] {
  const errors: string[] = [];
  const answerByItem = new Map(answers.map((answer) => [answer.numeroItem, answer]));

  for (const item of items) {
    const answer = answerByItem.get(item.numeroItem);
    const response = answer?.respuesta?.trim() ?? '';

    if (item.obligatorio && !response) {
      errors.push(`El ítem obligatorio "${item.item}" no tiene respuesta.`);
    }

    if (answer && isNegativeAnswer(response)) {
      if (item.requiereObservacionSiFalla && !answer.observacion.trim()) {
        errors.push(`El ítem "${item.item}" requiere observación cuando falla.`);
      }

      if (item.requiereFotoSiFalla && !answer.fotoEvidencia.trim()) {
        errors.push(`El ítem "${item.item}" requiere foto o evidencia cuando falla.`);
      }
    }
  }

  return errors;
}
