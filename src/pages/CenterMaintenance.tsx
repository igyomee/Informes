import { ChevronDown, ChevronRight, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { ReviewItem } from '../components/ReviewItem';
import { getModuleByKey } from '../config/modules';
import { getStoredModule } from '../services/api';
import { createEquipment, deleteEquipment, listEquipment, updateEquipment } from '../services/equipmentService';
import { createReview } from '../services/reviewService';
import { getChecklistForEquipment } from '../services/templateService';
import type { ChecklistTemplate } from '../types/checklist';
import type { EditableEquipmentFields, Equipment } from '../types/equipment';
import type { ReviewAnswer } from '../types/review';
import { isNegativeAnswer, validateReviewAnswers } from '../utils/validation';

interface MachineState {
  open: boolean;
  loading: boolean;
  saving: boolean;
  checklist: ChecklistTemplate | null;
  answers: ReviewAnswer[];
}

type MachineStates = Record<string, MachineState>;

function emptyMachineState(): MachineState {
  return { open: false, loading: false, saving: false, checklist: null, answers: [] };
}

function answersFromTemplate(template: ChecklistTemplate): ReviewAnswer[] {
  return template.items.map((item) => ({
    numeroItem: item.numeroItem,
    grupo: item.grupo,
    item: item.item,
    tipoRespuesta: item.tipoRespuesta,
    respuesta: '',
    observacion: '',
    fotoEvidencia: '',
    incidencia: false,
    prioridad: '',
    checklistItem: item
  }));
}

export function CenterMaintenance() {
  const module = getModuleByKey(getStoredModule());
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [center, setCenter] = useState('');
  const [technician, setTechnician] = useState('');
  const [machineStates, setMachineStates] = useState<MachineStates>({});
  const [newMachine, setNewMachine] = useState({
    nombreEquipo: '',
    familia: '',
    tagFamilia: ''
  });
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    listEquipment({ sortBy: 'centro', sortDir: 'asc' })
      .then((rows) => {
        setEquipment(rows);
        const firstCenter = Array.from(new Set(rows.map((item) => item.centro).filter(Boolean))).sort()[0] ?? '';
        setCenter(firstCenter);
        setError('');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const centers = useMemo(
    () => Array.from(new Set(equipment.map((item) => item.centro).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')),
    [equipment]
  );

  const centerEquipment = useMemo(
    () =>
      equipment
        .filter((item) => item.centro === center)
        .sort((a, b) => a.nombreEquipo.localeCompare(b.nombreEquipo, 'es', { numeric: true })),
    [center, equipment]
  );

  const familyOptions = useMemo(() => {
    const byFamily = new Map<string, string>();
    equipment.forEach((item) => {
      if (item.familia && item.tagFamilia) byFamily.set(item.familia, item.tagFamilia);
    });
    return Array.from(byFamily.entries())
      .map(([familia, tagFamilia]) => ({ familia, tagFamilia }))
      .sort((a, b) => a.familia.localeCompare(b.familia, 'es'));
  }, [equipment]);

  function setStateForCode(codigo: string, updater: (state: MachineState) => MachineState) {
    setMachineStates((current) => ({ ...current, [codigo]: updater(current[codigo] ?? emptyMachineState()) }));
  }

  async function loadChecklistForMachine(item: Equipment) {
    const current = machineStates[item.codigo] ?? emptyMachineState();
    if (current.checklist || current.loading) return;

    setStateForCode(item.codigo, (state) => ({ ...state, open: true, loading: true }));
    const checklist = await getChecklistForEquipment(item.codigo);
    setStateForCode(item.codigo, (state) => ({
      ...state,
      open: true,
      loading: false,
      checklist,
      answers: answersFromTemplate(checklist)
    }));
  }

  async function loadAllCenterQuestions() {
    setLoadingAll(true);
    setError('');
    try {
      for (const item of centerEquipment) {
        await loadChecklistForMachine(item);
      }
      setMessage(`Preguntas cargadas para ${centerEquipment.length} máquinas.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar todas las preguntas.');
    } finally {
      setLoadingAll(false);
    }
  }

  async function toggleMachine(item: Equipment) {
    const current = machineStates[item.codigo] ?? emptyMachineState();
    if (current.open) {
      setStateForCode(item.codigo, (state) => ({ ...state, open: false }));
      return;
    }

    setStateForCode(item.codigo, (state) => ({ ...state, open: true, loading: !state.checklist }));
    if (!current.checklist) {
      try {
        await loadChecklistForMachine(item);
      } catch (err) {
        setStateForCode(item.codigo, (state) => ({ ...state, loading: false }));
        setError(err instanceof Error ? err.message : 'No se pudo cargar el checklist.');
      }
    }
  }

  function updateAnswer(codigo: string, nextAnswer: ReviewAnswer) {
    setStateForCode(codigo, (state) => ({
      ...state,
      answers: state.answers.map((answer) => (answer.numeroItem === nextAnswer.numeroItem ? nextAnswer : answer))
    }));
  }

  async function saveEquipmentField(item: Equipment, data: Partial<EditableEquipmentFields>) {
    const updated = await updateEquipment(item.codigo, data);
    setEquipment((current) => current.map((row) => (row.codigo === item.codigo ? updated : row)));
    setMessage(`Ficha guardada: ${updated.codigo}`);
  }

  async function removeEquipment(item: Equipment) {
    if (!window.confirm(`¿Eliminar ${item.codigo}?`)) return;
    await deleteEquipment(item.codigo);
    setEquipment((current) => current.filter((row) => row.codigo !== item.codigo));
    setMessage(`Equipo eliminado: ${item.codigo}`);
  }

  async function addEquipment() {
    if (!center) {
      setError('Selecciona un centro antes de añadir una máquina.');
      return;
    }
    if (!newMachine.familia || !newMachine.nombreEquipo.trim()) {
      setError('Indica el tipo/familia y el nombre de la maquina.');
      return;
    }

    const created = await createEquipment({
      centro: center,
      instalacion: module.installation,
      tagInstalacion: module.installationTag,
      familia: newMachine.familia,
      tagFamilia: newMachine.tagFamilia,
      nombreEquipo: newMachine.nombreEquipo,
      activo: true
    });
    setEquipment((current) => [...current, created]);
    setNewMachine({ nombreEquipo: '', familia: '', tagFamilia: '' });
    setMessage(`Equipo añadido: ${created.codigo}`);
  }

  async function saveReviewForMachine(item: Equipment): Promise<void> {
    const state = machineStates[item.codigo];
    if (!state?.checklist) throw new Error(`Carga las preguntas de ${item.codigo}.`);
    if (!technician.trim()) throw new Error('Indica el técnico responsable.');

    const validationErrors = validateReviewAnswers(state.checklist.items, state.answers);
    if (validationErrors.length > 0) throw new Error(`${item.codigo}: ${validationErrors.join(' ')}`);

    const hasIncident = state.answers.some((answer) => answer.incidencia || isNegativeAnswer(answer.respuesta));
    await createReview({
      tecnico: technician,
      codigoEquipo: item.codigo,
      estadoGlobal: hasIncident ? 'Con incidencia' : 'Correcto',
      prioridad: '',
      observacionesGenerales: '',
      validacion: 'Pendiente',
      answers: state.answers
    });
  }

  async function saveAllLoadedReviews() {
    const loaded = centerEquipment.filter((item) => machineStates[item.codigo]?.checklist);
    if (loaded.length === 0) {
      setError('Abre al menos una máquina para cargar sus preguntas antes de guardar.');
      return;
    }

    setSavingAll(true);
    setError('');
    try {
      for (const item of loaded) {
        await saveReviewForMachine(item);
      }
      setMessage(`Revisión guardada para ${loaded.length} máquinas.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la revisión.');
    } finally {
      setSavingAll(false);
    }
  }

  if (loading) return <LoadingState label="Cargando máquinas del módulo" />;

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-black">{module.description}</p>
            <h1 className="text-2xl font-bold text-ink">Revisión por centro</h1>
          </div>
          <button type="button" className="btn-primary" disabled={savingAll} onClick={() => void saveAllLoadedReviews()}>
            <Save className="h-4 w-4" aria-hidden="true" />
            {savingAll ? 'Guardando' : 'Guardar revisiones cargadas'}
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label>
            <span className="form-label">Centro</span>
            <select className="form-input mt-1" value={center} onChange={(event) => setCenter(event.target.value)}>
              {centers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Técnico</span>
            <input className="form-input mt-1" value={technician} onChange={(event) => setTechnician(event.target.value)} />
          </label>
        </div>
      </section>

      {error ? <ErrorBanner message={error} /> : null}
      {message ? <div className="rounded-lg border border-black bg-yellow-100 p-4 text-sm font-semibold text-black">{message}</div> : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" disabled={loadingAll} onClick={() => void loadAllCenterQuestions()}>
          {loadingAll ? 'Cargando preguntas' : 'Cargar todas las preguntas del centro'}
        </button>
        <span className="rounded-md border border-black bg-white px-3 py-2 text-sm font-bold">
          {centerEquipment.length} máquinas en {center || 'centro'}
        </span>
      </div>

      <section className="panel p-4">
        <h2 className="text-lg font-bold text-ink">Añadir máquina</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="form-input"
            placeholder="Nombre equipo"
            value={newMachine.nombreEquipo}
            onChange={(event) => setNewMachine((v) => ({ ...v, nombreEquipo: event.target.value }))}
          />
          <select
            className="form-input"
            value={newMachine.familia}
            onChange={(event) => {
              const selected = familyOptions.find((option) => option.familia === event.target.value);
              setNewMachine((v) => ({ ...v, familia: event.target.value, tagFamilia: selected?.tagFamilia ?? v.tagFamilia }));
            }}
          >
            <option value="">Tipo / familia</option>
            {familyOptions.map((option) => (
              <option key={option.familia} value={option.familia}>
                {option.familia}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-secondary mt-3" onClick={() => void addEquipment()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Añadir máquina
        </button>
      </section>

      <section className="space-y-3">
        {centerEquipment.map((item) => {
          const state = machineStates[item.codigo] ?? emptyMachineState();
          return (
            <article key={item.codigo} className="panel overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
                onClick={() => void toggleMachine(item)}
              >
                <div>
                  <p className="font-mono text-xs font-bold text-black">{item.codigo}</p>
                  <h2 className="text-lg font-bold text-ink">{item.nombreEquipo || item.familia}</h2>
                  <p className="text-sm text-black">{item.familia} · Nº {item.numeroEquipo || '-'}</p>
                </div>
                {state.open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>

              {state.open ? (
                <div className="border-t border-black p-4">
        <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="form-input"
                      value={item.marca}
                      placeholder="Marca"
                      onChange={(event) =>
                        setEquipment((current) => current.map((row) => (row.codigo === item.codigo ? { ...row, marca: event.target.value } : row)))
                      }
                    />
                    <input
                      className="form-input"
                      value={item.modelo}
                      placeholder="Modelo"
                      onChange={(event) =>
                        setEquipment((current) => current.map((row) => (row.codigo === item.codigo ? { ...row, modelo: event.target.value } : row)))
                      }
                    />
                    <input
                      className="form-input"
                      value={item.numeroSerie}
                      placeholder="Nº serie"
                      onChange={(event) =>
                        setEquipment((current) => current.map((row) => (row.codigo === item.codigo ? { ...row, numeroSerie: event.target.value } : row)))
                      }
                    />
                    <input
                      className="form-input"
                      value={item.cargaRefrigerante}
                      placeholder="Carga refrigerante"
                      onChange={(event) =>
                        setEquipment((current) =>
                          current.map((row) => (row.codigo === item.codigo ? { ...row, cargaRefrigerante: event.target.value } : row))
                        )
                      }
                    />
                    <label className="inline-flex items-center gap-2 text-sm font-bold">
                      <input
                        type="checkbox"
                        checked={item.activo}
                        onChange={(event) =>
                          setEquipment((current) => current.map((row) => (row.codigo === item.codigo ? { ...row, activo: event.target.checked } : row)))
                        }
                      />
                      Activo
                    </label>
                  </div>
                  <textarea
                    className="form-input mt-3 min-h-20"
                    value={item.observacionesEquipo}
                    placeholder="Observaciones equipo"
                    onChange={(event) =>
                      setEquipment((current) =>
                        current.map((row) => (row.codigo === item.codigo ? { ...row, observacionesEquipo: event.target.value } : row))
                      )
                    }
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() =>
                        void saveEquipmentField(item, {
                          marca: item.marca,
                          modelo: item.modelo,
                          numeroSerie: item.numeroSerie,
                          cargaRefrigerante: item.cargaRefrigerante,
                          observacionesEquipo: item.observacionesEquipo,
                          activo: item.activo
                        })
                      }
                    >
                      <Save className="h-4 w-4" />
                      Guardar ficha
                    </button>
                    <button type="button" className="btn-danger" onClick={() => void removeEquipment(item)}>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {state.loading ? <LoadingState label="Cargando preguntas" /> : null}
                    {state.checklist
                      ? state.checklist.items.map((checklistItem) => {
                          const answer = state.answers.find((row) => row.numeroItem === checklistItem.numeroItem);
                          return answer ? (
                            <ReviewItem key={checklistItem.numeroItem} item={checklistItem} answer={answer} onChange={(next) => updateAnswer(item.codigo, next)} />
                          ) : null;
                        })
                      : null}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
