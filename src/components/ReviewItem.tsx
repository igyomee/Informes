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
const CELSIUS_LABEL = '°C';

function normalizedText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function displayItemName(item: ChecklistItem): string {
  const value = normalizedText(item.item);
  if (value === 'i') return `Impulsion (${CELSIUS_LABEL})`;
  if (value === 'r') return `Retorno (${CELSIUS_LABEL})`;
  return item.item;
}

function isTemperatureItem(item: ChecklistItem): boolean {
  const value = normalizedText(item.item);
  return value === 'i' || value === 'r';
}

function defaultOptions(item: ChecklistItem): string[] {
  const type = item.tipoRespuesta.toLowerCase();
  if (isTemperatureItem(item)) return [];
  if (item.opcionesRespuesta.length > 0 || type.includes('ok')) return CHECK_OPTIONS;
  if (type.includes('si / no') || type.includes('si')) return CHECK_OPTIONS;
  return [];
}

export function ReviewItem({ item, answer, onChange }: ReviewItemProps) {
  const options = defaultOptions(item);
  const type = item.tipoRespuesta.toLowerCase();
  const temperatureItem = isTemperatureItem(item);
  const negative = isNegativeAnswer(answer.respuesta);
  const showObservation = negative || type.includes('observacion');

  function update<K extends keyof ReviewAnswer>(key: K, value: ReviewAnswer[K]) {
    onChange({ ...answer, [key]: value });
  }

  function updateDecimal(value: string) {
    const normalized = value.replace(',', '.');
    if (normalized === '' || /^-?\d{0,3}(\.\d{0,2})?$/.test(normalized)) {
      update('respuesta', normalized);
    }
  }

  return (
    <article className="rounded-md border border-black bg-white">
      <div className="border-b border-black p-3">
        <p className="text-xs font-bold uppercase text-black">
          {item.grupo} - Item {item.numeroItem}
        </p>
        <h3 className="mt-1 text-sm font-bold text-ink md:text-base">{displayItemName(item)}</h3>
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
        ) : temperatureItem || type.includes('numero') ? (
          <div className="col-span-3 p-3">
            <label className="block">
              <span className="form-label">{temperatureItem ? `Valor en ${CELSIUS_LABEL}` : 'Valor numerico'}</span>
              <div className="mt-1 flex items-center rounded-md border border-black bg-white focus-within:ring-2 focus-within:ring-brand">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="-?[0-9]+([.,][0-9]{1,2})?"
                  className="min-h-14 flex-1 rounded-md border-0 bg-white px-4 text-xl font-bold text-black outline-none"
                  value={answer.respuesta}
                  placeholder={temperatureItem ? '0.00' : '0'}
                  onChange={(event) => updateDecimal(event.target.value)}
                  onBlur={(event) => {
                    const value = event.target.value;
                    if (value && !Number.isNaN(Number(value))) update('respuesta', Number(value).toFixed(2));
                  }}
                />
                {temperatureItem ? <span className="border-l border-black px-4 text-lg font-bold text-black">{CELSIUS_LABEL}</span> : null}
              </div>
            </label>
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
