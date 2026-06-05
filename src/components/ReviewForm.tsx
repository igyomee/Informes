import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ChecklistTemplate } from '../types/checklist';
import type { Equipment } from '../types/equipment';
import type { CreateReviewPayload, ReviewAnswer } from '../types/review';
import { isNegativeAnswer, validateReviewAnswers } from '../utils/validation';
import { ErrorBanner } from './ErrorBanner';
import { ReviewItem } from './ReviewItem';

interface ReviewFormProps {
  equipment: Equipment;
  template: ChecklistTemplate;
  saving: boolean;
  onSubmit: (payload: CreateReviewPayload) => Promise<void>;
}

export function ReviewForm({ equipment, template, saving, onSubmit }: ReviewFormProps) {
  const [tecnico, setTecnico] = useState('');
  const [estadoGlobal, setEstadoGlobal] = useState('Correcto');
  const [prioridad, setPrioridad] = useState('Media');
  const [observacionesGenerales, setObservacionesGenerales] = useState('');
  const [validacion, setValidacion] = useState('Pendiente');
  const [fechaProximaRevision, setFechaProximaRevision] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [answers, setAnswers] = useState<ReviewAnswer[]>(
    template.items.map((item) => ({
      numeroItem: item.numeroItem,
      grupo: item.grupo,
      item: item.item,
      tipoRespuesta: item.tipoRespuesta,
      respuesta: '',
      observacion: '',
      fotoEvidencia: '',
      incidencia: false,
      prioridad: 'Media',
      checklistItem: item
    }))
  );

  const groupedItems = useMemo(() => {
    return template.items.reduce<Record<string, typeof template.items>>((acc, item) => {
      const group = item.grupo || 'General';
      acc[group] = acc[group] ?? [];
      acc[group].push(item);
      return acc;
    }, {});
  }, [template.items]);

  const negativeCount = answers.filter((answer) => answer.incidencia || isNegativeAnswer(answer.respuesta)).length;

  function updateAnswer(nextAnswer: ReviewAnswer) {
    setAnswers((current) => current.map((answer) => (answer.numeroItem === nextAnswer.numeroItem ? nextAnswer : answer)));
    if (nextAnswer.incidencia || isNegativeAnswer(nextAnswer.respuesta)) {
      setEstadoGlobal('Con incidencia');
    }
  }

  async function submit() {
    const validationErrors = validateReviewAnswers(template.items, answers);
    if (!tecnico.trim()) {
      validationErrors.unshift('Indica el técnico responsable.');
    }

    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    await onSubmit({
      tecnico,
      codigoEquipo: equipment.codigo,
      estadoGlobal,
      prioridad,
      observacionesGenerales,
      validacion,
      fechaProximaRevision,
      answers
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {errors.length > 0 ? <ErrorBanner message={errors.join(' ')} /> : null}

      <section className="panel p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label>
            <span className="form-label">Técnico</span>
            <input className="form-input mt-1" value={tecnico} onChange={(event) => setTecnico(event.target.value)} required />
          </label>
          <label>
            <span className="form-label">Estado global</span>
            <select className="form-input mt-1" value={estadoGlobal} onChange={(event) => setEstadoGlobal(event.target.value)}>
              <option>Correcto</option>
              <option>Con incidencia</option>
              <option>Pendiente</option>
              <option>No aplicable</option>
            </select>
          </label>
          <label>
            <span className="form-label">Prioridad</span>
            <select className="form-input mt-1" value={prioridad} onChange={(event) => setPrioridad(event.target.value)}>
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>
          </label>
          <label>
            <span className="form-label">Validación</span>
            <select className="form-input mt-1" value={validacion} onChange={(event) => setValidacion(event.target.value)}>
              <option>Pendiente</option>
              <option>Validada</option>
              <option>Requiere revisión</option>
            </select>
          </label>
          <label>
            <span className="form-label">Fecha próxima revisión</span>
            <input
              type="date"
              className="form-input mt-1"
              value={fechaProximaRevision}
              onChange={(event) => setFechaProximaRevision(event.target.value)}
            />
          </label>
          <div className="flex items-end">
            <span className={`badge mb-1 border border-black ${negativeCount > 0 ? 'bg-brand text-black' : 'bg-white text-black'}`}>
              {negativeCount > 0 ? <AlertCircle className="mr-1 h-4 w-4" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
              {negativeCount} incidencias posibles
            </span>
          </div>
          <label className="md:col-span-3">
            <span className="form-label">Observaciones generales</span>
            <textarea
              className="form-input mt-1 min-h-24"
              value={observacionesGenerales}
              onChange={(event) => setObservacionesGenerales(event.target.value)}
            />
          </label>
        </div>
      </section>

      {Object.entries(groupedItems).map(([group, items]) => (
        <section key={group} className="space-y-3">
          <h2 className="text-lg font-bold text-ink">{group}</h2>
          {items.map((item) => {
            const answer = answers.find((current) => current.numeroItem === item.numeroItem)!;
            return <ReviewItem key={item.numeroItem} item={item} answer={answer} onChange={updateAnswer} />;
          })}
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-white/95 p-4 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? 'Guardando revisión' : 'Guardar revisión'}
        </button>
      </div>
    </form>
  );
}
