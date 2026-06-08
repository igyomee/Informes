import { MessageSquare } from 'lucide-react';
import type { ChecklistItem } from '../types/checklist';
import type { ReviewAnswer } from '../types/review';
import { isNegativeAnswer } from '../utils/validation';

interface ReviewItemProps {
  item: ChecklistItem;
  answer: ReviewAnswer;
  onChange: (answer: ReviewAnswer) => void;
}

function defaultOptions(item: ChecklistItem): string[] {
  const type = item.tipoRespuesta.toLowerCase();
  if (item.opcionesRespuesta.length > 0) return item.opcionesRespuesta;
  if (type.includes('ok')) return ['OK', 'NO OK', 'N/A'];
  if (type.includes('sí') || type.includes('si / no')) return ['Sí', 'No'];
  return [];
}

export function ReviewItem({ item, answer, onChange }: ReviewItemProps) {
  const options = defaultOptions(item);
  const type = item.tipoRespuesta.toLowerCase();
  const negative = isNegativeAnswer(answer.respuesta);
  const showObservation = negative || type.includes('observación');

  function update<K extends keyof ReviewAnswer>(key: K, value: ReviewAnswer[K]) {
    onChange({ ...answer, [key]: value });
  }

  return (
    <article className="rounded-lg border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            {item.grupo} · Ítem {item.numeroItem}
          </p>
          <h3 className="mt-1 text-base font-semibold text-ink">{item.item}</h3>
        </div>
        {item.obligatorio ? <span className="badge border border-black bg-brand text-black">Obligatorio</span> : null}
      </div>

      <div className="mt-4 grid gap-3">
        <label>
          <span className="form-label">Respuesta</span>
          {options.length > 0 ? (
            <select className="form-input mt-1" value={answer.respuesta} onChange={(event) => update('respuesta', event.target.value)}>
              <option value="">Selecciona</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : type.includes('número') || type.includes('numero') ? (
            <input
              type="number"
              className="form-input mt-1"
              value={answer.respuesta}
              onChange={(event) => update('respuesta', event.target.value)}
            />
          ) : type.includes('fecha') ? (
            <input
              type="date"
              className="form-input mt-1"
              value={answer.respuesta}
              onChange={(event) => update('respuesta', event.target.value)}
            />
          ) : type.includes('observación') || type.includes('observacion') ? (
            <textarea
              className="form-input mt-1 min-h-20"
              value={answer.respuesta}
              onChange={(event) => update('respuesta', event.target.value)}
            />
          ) : (
            <input className="form-input mt-1" value={answer.respuesta} onChange={(event) => update('respuesta', event.target.value)} />
          )}
        </label>
      </div>

      {showObservation && (
        <div className="mt-3 grid gap-3">
          {showObservation ? (
            <label>
              <span className="form-label inline-flex items-center gap-1">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Observación
              </span>
              <textarea
                className="form-input mt-1 min-h-20"
                value={answer.observacion}
                onChange={(event) => update('observacion', event.target.value)}
                required={negative && item.requiereObservacionSiFalla}
              />
            </label>
          ) : null}

        </div>
      )}
    </article>
  );
}
