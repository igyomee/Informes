import { ArrowDownAZ, ClipboardCheck, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Equipment, EquipmentFilters } from '../types/equipment';

interface EquipmentListProps {
  equipment: Equipment[];
  sortBy: EquipmentFilters['sortBy'];
  sortDir: EquipmentFilters['sortDir'];
  onSort: (sortBy: NonNullable<EquipmentFilters['sortBy']>) => void;
}

const sortableColumns: Array<{ key: NonNullable<EquipmentFilters['sortBy']>; label: string }> = [
  { key: 'centro', label: 'Centro' },
  { key: 'nombreEquipo', label: 'Nombre' },
  { key: 'numeroEquipo', label: 'Número' },
  { key: 'codigo', label: 'Código' },
  { key: 'familia', label: 'Familia' },
  { key: 'ubicacion', label: 'Ubicación' }
];

export function EquipmentList({ equipment, sortBy, sortDir, onSort }: EquipmentListProps) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4">
        <h2 className="text-lg font-bold text-ink">Máquinas</h2>
        <span className="text-sm text-slate-600">{equipment.length} resultados</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              {sortableColumns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-semibold"
                    onClick={() => onSort(column.key)}
                    title={`Ordenar por ${column.label}`}
                  >
                    {column.label}
                    <ArrowDownAZ
                      className={`h-3.5 w-3.5 ${sortBy === column.key && sortDir === 'desc' ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {equipment.map((item) => (
              <tr key={item.codigo} className="bg-white hover:bg-slate-50">
                <td className="px-4 py-3">{item.centro}</td>
                <td className="px-4 py-3 font-medium text-ink">{item.nombreEquipo}</td>
                <td className="px-4 py-3">{item.numeroEquipo}</td>
                <td className="px-4 py-3 font-mono text-xs">{item.codigo}</td>
                <td className="px-4 py-3">{item.familia}</td>
                <td className="px-4 py-3">{item.ubicacion}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${item.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {item.activo ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link className="btn-secondary px-3 py-2" to={`/equipos/${encodeURIComponent(item.codigo)}`} title="Ver ficha">
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Ver ficha</span>
                    </Link>
                    <Link
                      className="btn-primary px-3 py-2"
                      to={`/equipos/${encodeURIComponent(item.codigo)}/revision`}
                      title="Nueva revisión"
                    >
                      <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Nueva revisión</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
