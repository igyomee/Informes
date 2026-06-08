import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { EquipmentList } from '../components/EquipmentList';
import { ErrorBanner } from '../components/ErrorBanner';
import { FiltersBar } from '../components/FiltersBar';
import { LoadingState } from '../components/LoadingState';
import { listEquipment } from '../services/equipmentService';
import type { Equipment, EquipmentFilters } from '../types/equipment';
import { compareByEquipmentCode } from '../utils/equipmentSort';

export function EquipmentSearch() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filters, setFilters] = useState<EquipmentFilters>({ sortBy: 'codigo', sortDir: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoading(true);
      listEquipment(filters)
        .then((result) => {
          setEquipment([...result].sort(compareByEquipmentCode));
          setError('');
        })
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false));
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [filters]);

  const facets = useMemo(() => {
    const values = (key: keyof Pick<Equipment, 'centro' | 'instalacion' | 'familia'>) =>
      Array.from(new Set(equipment.map((item) => item[key]).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
    return {
      centers: values('centro'),
      installations: values('instalacion'),
      families: values('familia')
    };
  }, [equipment]);

  function sortBy(sortKey: NonNullable<EquipmentFilters['sortBy']>) {
    setFilters((current) => ({
      ...current,
      sortBy: sortKey,
      sortDir: current.sortBy === sortKey && current.sortDir === 'asc' ? 'desc' : 'asc'
    }));
  }

  return (
    <div className="space-y-4">
      <FiltersBar
        filters={filters}
        centers={facets.centers}
        installations={facets.installations}
        families={facets.families}
        onChange={setFilters}
        onReset={() => setFilters({ sortBy: 'codigo', sortDir: 'asc' })}
      />

      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingState /> : equipment.length === 0 ? <EmptyState title="No hay máquinas con esos filtros" /> : null}
      {!loading && equipment.length > 0 ? (
        <EquipmentList equipment={[...equipment].sort(compareByEquipmentCode)} sortBy={filters.sortBy} sortDir={filters.sortDir} onSort={sortBy} />
      ) : null}
    </div>
  );
}
