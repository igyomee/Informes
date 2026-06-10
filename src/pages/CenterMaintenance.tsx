import { ChevronDown, ChevronRight, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { ReviewItem } from '../components/ReviewItem';
import { getModuleByKey } from '../config/modules';
import { TECHNICIANS } from '../config/technicians';
import { getStoredModule } from '../services/api';
import { createEquipment, deleteEquipment, listEquipment, updateEquipment } from '../services/equipmentService';
import { createReview } from '../services/reviewService';
import { getChecklistForEquipment } from '../services/templateService';
import type { ChecklistTemplate } from '../types/checklist';
import type { EditableEquipmentFields, Equipment } from '../types/equipment';
import type { ReviewAnswer } from '../types/review';
import { compareByEquipmentCode } from '../utils/equipmentSort';
import { isNegativeAnswer, validateReviewAnswers } from '../utils/validation';

interface MachineState {
  open: boolean;
  loading: boolean;
  saving: boolean;
  checklist: ChecklistTemplate | null;
  answers: ReviewAnswer[];
}

type MachineStates = Record<string, MachineState>;

interface TechnicianSigner {
  id: number;
  nombre: string;
  codigo: string;
  dni: string;
}

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
    checklistItem: item
  }));
}

function isElectricalPanel(item: Equipment): boolean {
  const text = `${item.familia} ${item.nombreEquipo} ${item.plantillaRevision} ${item.codigo}`.toLowerCase();
  return text.includes('cuadro');
}

function normalizeForMatch(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function emptyTechnicianSigner(id = Date.now()): TechnicianSigner {
  return { id, nombre: '', codigo: '', dni: '' };
}

export function CenterMaintenance() {
  const module = getModuleByKey(getStoredModule());
  const isClimate = module.key === 'clima';
  const isElectric = module.key === 'electrico';
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [center, setCenter] = useState('');
  const [technicians, setTechnicians] = useState<TechnicianSigner[]>(() => [emptyTechnicianSigner(1)]);
  const [machineStates, setMachineStates] = useState<MachineStates>({});
  const [newMachine, setNewMachine] = useState({ nombreEquipo: '', familia: '', tagFamilia: '' });
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const techniciansRef = useRef<HTMLDivElement | null>(null);

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
        .filter((item) => !isElectric || isElectricalPanel(item))
        .sort(compareByEquipmentCode),
    [center, equipment, isElectric]
  );

  const familyOptions = useMemo(() => {
    const byFamily = new Map<string, string>();
    equipment.filter((item) => !isElectric || isElectricalPanel(item)).forEach((item) => {
      if (item.familia && item.tagFamilia) byFamily.set(item.familia, item.tagFamilia);
    });
    return Array.from(byFamily.entries())
      .map(([familia, tagFamilia]) => ({ familia, tagFamilia }))
      .sort((a, b) => a.familia.localeCompare(b.familia, 'es'));
  }, [equipment, isElectric]);

  const technicianErrors = useMemo(() => {
    const active = technicians.filter((item) => item.nombre.trim() || item.codigo.trim() || item.dni.trim());
    if (!active.length) return ['Indica al menos un tecnico y su DNI antes de modificar o guardar.'];

    return active.flatMap((item, index) => {
      const row = index + 1;
      const errors: string[] = [];
      const byCode = TECHNICIANS.find((technician) => technician.codigo === item.codigo.trim());
      const byName = TECHNICIANS.find((technician) => normalizeForMatch(technician.nombre) === normalizeForMatch(item.nombre));
      const selected = byCode ?? byName;

      if (!selected) errors.push(`Tecnico ${row}: selecciona un nombre de la lista o escribe un codigo valido.`);
      if (!item.dni.trim()) errors.push(`Tecnico ${row}: indica el DNI.`);
      if (byCode && byName && byCode.codigo !== byName.codigo) errors.push(`Tecnico ${row}: el nombre y el codigo no coinciden.`);
      return errors;
    });
  }, [technicians]);

  const canModify = technicianErrors.length === 0;

  function focusTechnicians() {
    techniciansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function technicianSignature() {
    return technicians
      .filter((item) => item.nombre.trim() || item.codigo.trim() || item.dni.trim())
      .map((item) => {
        const selected =
          TECHNICIANS.find((technician) => technician.codigo === item.codigo.trim()) ??
          TECHNICIANS.find((technician) => normalizeForMatch(technician.nombre) === normalizeForMatch(item.nombre));
        const nombre = selected?.nombre ?? item.nombre.trim();
        const codigo = selected?.codigo ?? item.codigo.trim();
        return `${nombre} (Codigo: ${codigo || '-'}, DNI: ${item.dni.trim()})`;
      })
      .join(' / ');
  }

  function updateTechnician(id: number, field: keyof Omit<TechnicianSigner, 'id'>, value: string) {
    setTechnicians((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, [field]: field === 'codigo' ? value.replace(/\D/g, '').slice(0, 3) : value };
        if (field === 'nombre') {
          const selected = TECHNICIANS.find((technician) => normalizeForMatch(technician.nombre) === normalizeForMatch(value));
          if (selected) next.codigo = selected.codigo;
        }
        if (field === 'codigo') {
          const selected = TECHNICIANS.find((technician) => technician.codigo === next.codigo);
          if (selected) next.nombre = selected.nombre;
        }
        return next;
      })
    );
  }

  function addTechnician() {
    setTechnicians((current) => [...current, emptyTechnicianSigner(Date.now())]);
  }

  function removeTechnician(id: number) {
    setTechnicians((current) => (current.length === 1 ? [emptyTechnicianSigner(1)] : current.filter((item) => item.id !== id)));
  }

  function setStateForCode(codigo: string, updater: (state: MachineState) => MachineState) {
    setMachineStates((current) => ({ ...current, [codigo]: updater(current[codigo] ?? emptyMachineState()) }));
  }

  function draftKey(codigo: string) {
    return `maintenance-review-draft:${module.key}:${center}:${codigo}`;
  }

  function restoreAnswers(codigo: string, template: ChecklistTemplate): ReviewAnswer[] {
    const baseAnswers = answersFromTemplate(template);
    if (template.lastAnswers?.length) {
      return baseAnswers.map((answer) => {
        const saved = template.lastAnswers?.find((item) => item.numeroItem === answer.numeroItem);
        return saved ? { ...answer, respuesta: saved.respuesta ?? '', observacion: saved.observacion ?? '' } : answer;
      });
    }

    try {
      const stored = window.localStorage.getItem(draftKey(codigo));
      if (!stored) return baseAnswers;
      const parsed = JSON.parse(stored) as ReviewAnswer[];
      return baseAnswers.map((answer) => {
        const saved = parsed.find((item) => item.numeroItem === answer.numeroItem);
        return saved ? { ...answer, respuesta: saved.respuesta ?? '', observacion: saved.observacion ?? '' } : answer;
      });
    } catch {
      return baseAnswers;
    }
  }

  function persistAnswers(codigo: string, answers: ReviewAnswer[]) {
    window.localStorage.setItem(
      draftKey(codigo),
      JSON.stringify(answers.map((answer) => ({ numeroItem: answer.numeroItem, respuesta: answer.respuesta, observacion: answer.observacion })))
    );
  }

  async function loadChecklistForMachine(item: Equipment, forceRefresh = false) {
    const current = machineStates[item.codigo] ?? emptyMachineState();
    if ((!forceRefresh && current.checklist) || current.loading) return;

    setStateForCode(item.codigo, (state) => ({ ...state, open: true, loading: true }));
    const checklist = await getChecklistForEquipment(item.codigo);
    setStateForCode(item.codigo, (state) => ({
      ...state,
      open: true,
      loading: false,
      checklist,
      answers: restoreAnswers(item.codigo, checklist)
    }));
  }

  async function loadAllCenterQuestions() {
    setLoadingAll(true);
    setError('');
    try {
      for (const item of centerEquipment) {
        await loadChecklistForMachine(item, true);
      }
      setMessage(`Preguntas cargadas para ${centerEquipment.length} maquinas.`);
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

    setStateForCode(item.codigo, (state) => ({ ...state, open: true, loading: true }));
    try {
      await loadChecklistForMachine(item, true);
    } catch (err) {
      setStateForCode(item.codigo, (state) => ({ ...state, loading: false }));
      setError(err instanceof Error ? err.message : 'No se pudo cargar el checklist.');
    }
  }

  function updateAnswer(codigo: string, nextAnswer: ReviewAnswer) {
    if (!canModify) {
      focusTechnicians();
      setError(technicianErrors[0]);
      return;
    }

    setStateForCode(codigo, (state) => {
      const answers = state.answers.map((answer) => (answer.numeroItem === nextAnswer.numeroItem ? nextAnswer : answer));
      persistAnswers(codigo, answers);
      return { ...state, answers };
    });
  }

  async function saveEquipmentField(item: Equipment, data: Partial<EditableEquipmentFields>) {
    const updated = await updateEquipment(item.codigo, data);
    setEquipment((current) => current.map((row) => (row.codigo === item.codigo ? updated : row)));
  }

  async function removeEquipment(item: Equipment) {
    if (!canModify) {
      focusTechnicians();
      setError(technicianErrors[0]);
      return;
    }
    if (!window.confirm(`Eliminar ${item.codigo}?`)) return;
    await deleteEquipment(item.codigo);
    window.localStorage.removeItem(draftKey(item.codigo));
    setEquipment((current) => current.filter((row) => row.codigo !== item.codigo));
    setMessage(`Equipo eliminado: ${item.codigo}`);
  }

  async function addEquipment() {
    if (!canModify) {
      focusTechnicians();
      setError(technicianErrors[0]);
      return;
    }
    if (!center) {
      setError('Selecciona un centro antes de anadir una maquina.');
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
    setEquipment((current) => [...current, created].sort(compareByEquipmentCode));
    setNewMachine({ nombreEquipo: '', familia: '', tagFamilia: '' });
    setMessage(`Equipo anadido: ${created.codigo}`);
  }

  async function saveReviewForMachine(item: Equipment) {
    const state = machineStates[item.codigo];
    if (!state?.checklist) throw new Error(`Carga las preguntas de ${item.codigo}.`);
    if (!canModify) throw new Error(technicianErrors[0]);

    const validationErrors = validateReviewAnswers(state.checklist.items, state.answers);
    if (validationErrors.length > 0) throw new Error(`${item.codigo}: ${validationErrors.join(' ')}`);

    const hasIssue = state.answers.some((answer) => isNegativeAnswer(answer.respuesta));
    await createReview({
      tecnico: technicianSignature(),
      codigoEquipo: item.codigo,
      estadoGlobal: hasIssue ? 'Con observaciones' : 'Correcto',
      observacionesGenerales: '',
      validacion: 'Pendiente',
      answers: state.answers
    });
  }

  async function saveMachine(item: Equipment) {
    if (!canModify) {
      focusTechnicians();
      setError(technicianErrors[0]);
      return;
    }

    setStateForCode(item.codigo, (state) => ({ ...state, saving: true }));
    setError('');
    let saved = false;
    try {
      await saveEquipmentField(item, {
        marca: item.marca,
        modelo: item.modelo,
        numeroSerie: item.numeroSerie,
        tipoRefrigerante: item.tipoRefrigerante,
        cargaRefrigerante: item.cargaRefrigerante,
        observacionesEquipo: item.observacionesEquipo,
        activo: item.activo
      });
      await saveReviewForMachine(item);
      saved = true;
      setMessage(`Ficha y revision guardadas: ${item.codigo}`);
      setStateForCode(item.codigo, (state) => ({ ...state, open: false, saving: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la ficha.');
    } finally {
      if (!saved) {
        setStateForCode(item.codigo, (state) => ({ ...state, saving: false }));
      }
    }
  }

  if (loading) return <LoadingState label="Cargando maquinas del modulo" />;

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <div>
          <p className="text-sm font-bold uppercase text-black">{module.description}</p>
          <h1 className="text-2xl font-bold text-ink">Revision por centro</h1>
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
        </div>

        <div ref={techniciansRef} className="mt-4 rounded-md border border-black bg-yellow-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-ink">Tecnicos de la revision</h2>
              <p className="text-sm font-semibold text-black">Para modificar o guardar, indica nombre/codigo y DNI.</p>
            </div>
            <button type="button" className="btn-primary" onClick={addTechnician}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Anadir Tecnico +
            </button>
          </div>

          <datalist id="technician-name-options">
            {TECHNICIANS.map((item) => (
              <option key={item.codigo} value={item.nombre} />
            ))}
          </datalist>

          <div className="mt-3 space-y-3">
            {technicians.map((item, index) => (
              <div key={item.id} className="grid gap-2 rounded-md border border-black bg-white p-3 md:grid-cols-[1fr_120px_180px_auto]">
                <label>
                  <span className="form-label">Nombre tecnico {index + 1}</span>
                  <input
                    className="form-input mt-1"
                    list="technician-name-options"
                    value={item.nombre}
                    placeholder="Empieza a escribir el nombre"
                    onChange={(event) => updateTechnician(item.id, 'nombre', event.target.value)}
                  />
                </label>
                <label>
                  <span className="form-label">Codigo</span>
                  <input
                    className="form-input mt-1"
                    value={item.codigo}
                    inputMode="numeric"
                    maxLength={3}
                    placeholder="3 digitos"
                    onChange={(event) => updateTechnician(item.id, 'codigo', event.target.value)}
                  />
                </label>
                <label>
                  <span className="form-label">DNI</span>
                  <input
                    className="form-input mt-1 uppercase"
                    value={item.dni}
                    placeholder="DNI manual"
                    autoComplete="off"
                    onChange={(event) => updateTechnician(item.id, 'dni', event.target.value.toUpperCase())}
                  />
                </label>
                <button type="button" className="btn-secondary self-end px-3" onClick={() => removeTechnician(item.id)} title="Quitar tecnico">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          {!canModify ? (
            <div className="mt-3 rounded-md border border-black bg-white p-3 text-sm font-semibold text-black">
              {technicianErrors[0]}
            </div>
          ) : null}
        </div>
      </section>

      {error ? <ErrorBanner message={error} /> : null}
      {message ? <div className="rounded-lg border border-black bg-yellow-100 p-4 text-sm font-semibold text-black">{message}</div> : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" disabled={loadingAll} onClick={() => void loadAllCenterQuestions()}>
          {loadingAll ? 'Cargando preguntas' : 'Cargar todas las preguntas del centro'}
        </button>
        <span className="rounded-md border border-black bg-white px-3 py-2 text-sm font-bold">
          {centerEquipment.length} maquinas en {center || 'centro'}
        </span>
      </div>

      <section className="panel p-4">
        <h2 className="text-lg font-bold text-ink">Anadir maquina</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="form-input"
            placeholder="Nombre equipo"
            value={newMachine.nombreEquipo}
            disabled={!canModify}
            onChange={(event) => setNewMachine((value) => ({ ...value, nombreEquipo: event.target.value }))}
          />
          <select
            className="form-input"
            value={newMachine.familia}
            disabled={!canModify}
            onChange={(event) => {
              const selected = familyOptions.find((option) => option.familia === event.target.value);
              setNewMachine((value) => ({ ...value, familia: event.target.value, tagFamilia: selected?.tagFamilia ?? value.tagFamilia }));
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
        <button type="button" className="btn-secondary mt-3" disabled={!canModify} onClick={() => void addEquipment()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Anadir maquina
        </button>
      </section>

      <section className="space-y-3">
        {centerEquipment.map((item) => {
          const state = machineStates[item.codigo] ?? emptyMachineState();
          return (
            <article key={item.codigo} className="panel overflow-hidden">
              <button type="button" className="flex w-full items-center justify-between gap-3 p-4 text-left" onClick={() => void toggleMachine(item)}>
                <div>
                  <p className="font-mono text-xs font-bold text-black">{item.codigo}</p>
                  <h2 className="text-lg font-bold text-ink">{item.nombreEquipo || item.familia}</h2>
                  <p className="text-sm text-black">
                    {item.familia} - No {item.numeroEquipo || '-'}
                  </p>
                </div>
                {state.open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>

              {state.open ? (
                <div className="border-t border-black p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {isClimate ? (
                      <>
                        <label className="block">
                          <span className="form-label">Marca</span>
                          <input
                            className="form-input mt-1"
                            value={item.marca}
                            disabled={!canModify}
                            onChange={(event) =>
                              setEquipment((current) => current.map((row) => (row.codigo === item.codigo ? { ...row, marca: event.target.value } : row)))
                            }
                          />
                        </label>
                        <label className="block">
                          <span className="form-label">Modelo</span>
                          <input
                            className="form-input mt-1"
                            value={item.modelo}
                            disabled={!canModify}
                            onChange={(event) =>
                              setEquipment((current) => current.map((row) => (row.codigo === item.codigo ? { ...row, modelo: event.target.value } : row)))
                            }
                          />
                        </label>
                        <label className="block">
                          <span className="form-label">No de serie</span>
                          <input
                            className="form-input mt-1"
                            value={item.numeroSerie}
                            disabled={!canModify}
                            onChange={(event) =>
                              setEquipment((current) =>
                                current.map((row) => (row.codigo === item.codigo ? { ...row, numeroSerie: event.target.value } : row))
                              )
                            }
                          />
                        </label>
                        <label className="block">
                          <span className="form-label">Tipo de refrigerante</span>
                          <input
                            className="form-input mt-1"
                            value={item.tipoRefrigerante}
                            disabled={!canModify}
                            onChange={(event) =>
                              setEquipment((current) =>
                                current.map((row) => (row.codigo === item.codigo ? { ...row, tipoRefrigerante: event.target.value } : row))
                              )
                            }
                          />
                        </label>
                        <label className="block">
                          <span className="form-label">Carga de refrigerante (kg)</span>
                          <input
                            className="form-input mt-1"
                            value={item.cargaRefrigerante}
                            inputMode="decimal"
                            disabled={!canModify}
                            onChange={(event) =>
                              setEquipment((current) =>
                                current.map((row) => (row.codigo === item.codigo ? { ...row, cargaRefrigerante: event.target.value } : row))
                              )
                            }
                          />
                        </label>
                      </>
                    ) : null}
                    <label className="inline-flex items-center gap-2 text-sm font-bold">
                      <input
                        type="checkbox"
                        checked={item.activo}
                        disabled={!canModify}
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
                    disabled={!canModify}
                    onChange={(event) =>
                      setEquipment((current) =>
                        current.map((row) => (row.codigo === item.codigo ? { ...row, observacionesEquipo: event.target.value } : row))
                      )
                    }
                  />

                  <div className="mt-4 space-y-3">
                    {state.loading ? <LoadingState label="Cargando preguntas" /> : null}
                    {state.checklist
                      ? state.checklist.items.map((checklistItem) => {
                          const answer = state.answers.find((row) => row.numeroItem === checklistItem.numeroItem);
                          return answer ? (
                            <ReviewItem
                              key={checklistItem.numeroItem}
                              item={checklistItem}
                              answer={answer}
                              disabled={!canModify}
                              onChange={(next) => updateAnswer(item.codigo, next)}
                            />
                          ) : null;
                        })
                      : null}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-black pt-4">
                    <button type="button" className="btn-danger" disabled={!canModify} onClick={() => void removeEquipment(item)}>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                    <button type="button" className="btn-primary" disabled={state.saving || !state.checklist || !canModify} onClick={() => void saveMachine(item)}>
                      <Save className="h-4 w-4" />
                      {state.saving ? 'Guardando' : 'Guardar ficha'}
                    </button>
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
