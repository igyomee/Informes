import { Camera, Flag, MessageSquare } from 'lucide-react';
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
  const showObservation = negative || answer.incidencia || type.includes('observación');
  const showEvidence = negative || answer.incidencia || type.includes('foto');

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
        {item.obligatorio ? <span className="badge bg-amber-100 text-amber-900">Obligatorio</span> : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto_auto]">
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

        <label className="mt-6 inline-flex h-10 items-center gap-2 rounded-md border border-line bg-slate-50 px-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line text-brand"
            checked={answer.incidencia}
            onChange={(event) => update('incidencia', event.target.checked)}
          />
          <Flag className="h-4 w-4 text-red-600" aria-hidden="true" />
          Incidencia
        </label>

        <label>
          <span className="form-label">Prioridad</span>
          <select className="form-input mt-1" value={answer.prioridad} onChange={(event) => update('prioridad', event.target.value)}>
            <option>Baja</option>
            <option>Media</option>
            <option>Alta</option>
            <option>Crítica</option>
          </select>
        </label>
      </div>

      {(showObservation || showEvidence) && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
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

          {showEvidence ? (
            <label>
              <span className="form-label inline-flex items-center gap-1">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Foto / evidencia
              </span>
              <input
                className="form-input mt-1"
                value={answer.fotoEvidencia}
                placeholder="URL de Drive, enlace o referencia"
                onChange={(event) => update('fotoEvidencia', event.target.value)}
                required={negative && item.requiereFotoSiFalla}
              />
            </label>
          ) : null}
        </div>
      )}
    </article>
  );
}
