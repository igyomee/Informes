import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ModuleKey } from '../config/modules';
import type { EditableEquipmentFields, Equipment } from '../types/equipment';

interface EquipmentEditorProps {
  equipment: Equipment;
  saving: boolean;
  onSave: (data: EditableEquipmentFields) => Promise<void>;
  moduleKey?: ModuleKey;
}

export function EquipmentEditor({ equipment, saving, onSave, moduleKey = 'clima' }: EquipmentEditorProps) {
  const isClimate = moduleKey === 'clima';
  const [form, setForm] = useState<EditableEquipmentFields>({
    marca: equipment.marca,
    modelo: equipment.modelo,
    numeroSerie: equipment.numeroSerie,
    tipoRefrigerante: equipment.tipoRefrigerante,
    cargaRefrigerante: equipment.cargaRefrigerante,
    ubicacion: equipment.ubicacion,
    observacionesEquipo: equipment.observacionesEquipo,
    activo: equipment.activo
  });

  useEffect(() => {
    setForm({
      marca: equipment.marca,
      modelo: equipment.modelo,
      numeroSerie: equipment.numeroSerie,
      tipoRefrigerante: equipment.tipoRefrigerante,
      cargaRefrigerante: equipment.cargaRefrigerante,
      ubicacion: equipment.ubicacion,
      observacionesEquipo: equipment.observacionesEquipo,
      activo: equipment.activo
    });
  }, [equipment]);

  function update<K extends keyof EditableEquipmentFields>(key: K, value: EditableEquipmentFields[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="panel p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(form);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Ficha editable</h2>
        <button type="submit" className="btn-primary" disabled={saving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? 'Guardando' : 'Guardar cambios'}
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {isClimate ? (
          <>
            <label>
              <span className="form-label">Marca</span>
              <input className="form-input mt-1" value={form.marca} onChange={(event) => update('marca', event.target.value)} />
            </label>
            <label>
              <span className="form-label">Modelo</span>
              <input className="form-input mt-1" value={form.modelo} onChange={(event) => update('modelo', event.target.value)} />
            </label>
            <label>
              <span className="form-label">No de serie</span>
              <input className="form-input mt-1" value={form.numeroSerie} onChange={(event) => update('numeroSerie', event.target.value)} />
            </label>
            <label>
              <span className="form-label">Tipo de refrigerante</span>
              <input
                className="form-input mt-1"
                value={form.tipoRefrigerante}
                placeholder="R-410A, R-32..."
                onChange={(event) => update('tipoRefrigerante', event.target.value)}
              />
            </label>
            <label>
              <span className="form-label">Carga de refrigerante (kg)</span>
              <input
                className="form-input mt-1"
                value={form.cargaRefrigerante}
                inputMode="decimal"
                onChange={(event) => update('cargaRefrigerante', event.target.value)}
              />
            </label>
          </>
        ) : null}
        <label className="md:col-span-2">
          <span className="form-label">Observaciones equipo</span>
          <textarea
            className="form-input mt-1 min-h-24"
            value={form.observacionesEquipo}
            onChange={(event) => update('observacionesEquipo', event.target.value)}
          />
        </label>
        <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-line text-brand"
            checked={form.activo}
            onChange={(event) => update('activo', event.target.checked)}
          />
          Equipo activo
        </label>
      </div>
    </form>
  );
}
