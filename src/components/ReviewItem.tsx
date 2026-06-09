import { MessageSquare } from 'lucide-react';
import type { ChecklistItem } from '../types/checklist';
import type { ReviewAnswer } from '../types/review';
import { isNegativeAnswer } from '../utils/validation';

interface ReviewItemProps {
  item: ChecklistItem;
  answer: ReviewAnswer;
  onChange: (answer: ReviewAnswer) => void;
}

const CHECK_OPTIONS = ['Correcto', 'Incorrecto', 'No aplica'];

function defaultOptions(item: ChecklistItem): string[] {
  const type = item.tipoRespuesta.toLowerCase();
  if (item.opcionesRespuesta.length > 0 || type.includes('ok')) return CHECK_OPTIONS;
  if (type.includes('si / no') || type.includes('si')) return CHECK_OPTIONS;
  return [];
}

export function ReviewItem({ item, answer, onChange }: ReviewItemProps) {
  const options = defaultOptions(item);
  const type = item.tipoRespuesta.toLowerCase();
  const negative = isNegativeAnswer(answer.respuesta);
  const showObservation = negative || type.includes('observacion');

  function update<K extends keyof ReviewAnswer>(key: K, value: ReviewAnswer[K]) {
    onChange({ ...answer, [key]: value });
  }

  return (
    <article className="rounded-md border border-black bg-white">
      <div className="border-b border-black p-3">
        <p className="text-xs font-bold uppercase text-black">
          {item.grupo} - Item {item.numeroItem}
        </p>
        <h3 className="mt-1 text-sm font-bold text-ink md:text-base">{item.item}</h3>
      </div>

      <div className="grid grid-cols-3 border-b border-black">
        {options.length > 0 ? (
          options.map((option) => {
            const selected = answer.respuesta === option;
            return (
              <button
                key={option}
                type="button"
                className={`min-h-14 border-r border-black px-2 py-3 text-xs font-bold uppercase transition last:border-r-0 md:text-sm ${
                  selected ? 'bg-brand text-black' : 'bg-white text-black hover:bg-yellow-100'
                }`}
                onClick={() => update('respuesta', option)}
              >
                {option}
              </button>
            );
          })
        ) : type.includes('numero') ? (
          <div className="col-span-3 p-3">
            <input
              type="number"
              className="form-input"
              value={answer.respuesta}
              onChange={(event) => update('respuesta', event.target.value)}
            />
          </div>
        ) : type.includes('fecha') ? (
          <div className="col-span-3 p-3">
            <input type="date" className="form-input" value={answer.respuesta} onChange={(event) => update('respuesta', event.target.value)} />
          </div>
        ) : (
          <div className="col-span-3 p-3">
            <textarea className="form-input min-h-20" value={answer.respuesta} onChange={(event) => update('respuesta', event.target.value)} />
          </div>
        )}
      </div>

      {showObservation ? (
        <label className="block p-3">
          <span className="form-label inline-flex items-center gap-1">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Observacion
          </span>
          <textarea
            className="form-input mt-1 min-h-20"
            value={answer.observacion}
            onChange={(event) => update('observacion', event.target.value)}
            required={negative && item.requiereObservacionSiFalla}
          />
        </label>
      ) : null}
    </article>
  );
}
