import { RotateCcw, Search } from 'lucide-react';
import type { EquipmentFilters } from '../types/equipment';

interface FiltersBarProps {
  filters: EquipmentFilters;
  centers: string[];
  installations: string[];
  families: string[];
  onChange: (filters: EquipmentFilters) => void;
  onReset: () => void;
}

export function FiltersBar({ filters, centers, installations, families, onChange, onReset }: FiltersBarProps) {
  function update(next: Partial<EquipmentFilters>) {
    onChange({ ...filters, ...next });
  }

  return (
    <section className="panel p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,2fr)_repeat(3,minmax(140px,1fr))_auto]">
        <label className="block">
          <span className="form-label">Buscar</span>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              className="form-input pl-9"
              value={filters.q ?? ''}
              placeholder="Código, nombre, número, ubicación, marca..."
              onChange={(event) => update({ q: event.target.value })}
            />
          </div>
        </label>

        <label className="block">
          <span className="form-label">Centro</span>
          <select className="form-input mt-1" value={filters.centro ?? ''} onChange={(event) => update({ centro: event.target.value })}>
            <option value="">Todos</option>
            {centers.map((center) => (
              <option key={center} value={center}>
                {center}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="form-label">Instalación</span>
          <select
            className="form-input mt-1"
            value={filters.instalacion ?? ''}
            onChange={(event) => update({ instalacion: event.target.value })}
          >
            <option value="">Todas</option>
            {installations.map((installation) => (
              <option key={installation} value={installation}>
                {installation}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="form-label">Familia</span>
          <select className="form-input mt-1" value={filters.familia ?? ''} onChange={(event) => update({ familia: event.target.value })}>
            <option value="">Todas</option>
            {families.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="btn-secondary mt-6 h-10 md:mt-auto" onClick={onReset} title="Restablecer filtros">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span className="md:hidden lg:inline">Limpiar</span>
        </button>
      </div>
    </section>
  );
}
