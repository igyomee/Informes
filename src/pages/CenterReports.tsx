import { Filter, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CenterReviewReport } from '../components/CenterReviewReport';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { listEquipment } from '../services/equipmentService';
import { downloadCenterReportCsv, generateCenterReport, writeCenterReportSheet } from '../services/googleSheetsService';
import { getReviewsByCenter } from '../services/reviewService';
import type { Equipment } from '../types/equipment';
import type { CenterReviewFilters, CenterReport, Review } from '../types/review';

export function CenterReports() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [center, setCenter] = useState('');
  const [filters, setFilters] = useState<CenterReviewFilters>({ sortBy: 'fechaHora', sortDir: 'desc' });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [report, setReport] = useState<CenterReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [writing, setWriting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    listEquipment()
      .then((items) => {
        setEquipment(items);
        const firstCenter = Array.from(new Set(items.map((item) => item.centro).filter(Boolean))).sort()[0] ?? '';
        setCenter(firstCenter);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!center) return;
    setLoading(true);
    Promise.all([getReviewsByCenter(center, filters), generateCenterReport(center, filters.dateFrom, filters.dateTo)])
      .then(([reviewRows, reportResult]) => {
        setReviews(reviewRows);
        setReport(reportResult);
        setError('');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [center, filters]);

  const facets = useMemo(() => {
    const currentCenterEquipment = equipment.filter((item) => item.centro === center);
    return {
      centers: Array.from(new Set(equipment.map((item) => item.centro).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')),
      installations: Array.from(new Set(currentCenterEquipment.map((item) => item.instalacion).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'es')
      ),
      families: Array.from(new Set(currentCenterEquipment.map((item) => item.familia).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'es')
      )
    };
  }, [center, equipment]);

  function updateFilters(next: Partial<CenterReviewFilters>) {
    setFilters((current) => ({ ...current, ...next }));
  }

  async function createSheet() {
    if (!center) return;
    setWriting(true);
    setMessage('');
    try {
      const result = await writeCenterReportSheet(center, filters.dateFrom, filters.dateTo);
      setMessage(`Hoja Resumen_Revisiones_Centro actualizada con ${result.updatedRows} filas.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la hoja resumen.');
    } finally {
      setWriting(false);
    }
  }

  async function downloadCsv() {
    if (!center) return;
    setDownloading(true);
    try {
      await downloadCenterReportCsv(center, filters.dateFrom, filters.dateTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo exportar el CSV.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-brand" aria-hidden="true" />
          <h1 className="text-xl font-bold text-ink">Revisiones por centro</h1>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4 lg:grid-cols-8">
          <label className="md:col-span-2">
            <span className="form-label">Centro</span>
            <select className="form-input mt-1" value={center} onChange={(event) => setCenter(event.target.value)}>
              {facets.centers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Desde</span>
            <input
              className="form-input mt-1"
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(event) => updateFilters({ dateFrom: event.target.value })}
            />
          </label>
          <label>
            <span className="form-label">Hasta</span>
            <input
              className="form-input mt-1"
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(event) => updateFilters({ dateTo: event.target.value })}
            />
          </label>
          <label>
            <span className="form-label">Instalación</span>
            <select
              className="form-input mt-1"
              value={filters.instalacion ?? ''}
              onChange={(event) => updateFilters({ instalacion: event.target.value })}
            >
              <option value="">Todas</option>
              {facets.installations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Familia</span>
            <select className="form-input mt-1" value={filters.familia ?? ''} onChange={(event) => updateFilters({ familia: event.target.value })}>
              <option value="">Todas</option>
              {facets.families.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Técnico</span>
            <input className="form-input mt-1" value={filters.tecnico ?? ''} onChange={(event) => updateFilters({ tecnico: event.target.value })} />
          </label>
          <label>
            <span className="form-label">Estado</span>
            <select
              className="form-input mt-1"
              value={filters.estadoGlobal ?? ''}
              onChange={(event) => updateFilters({ estadoGlobal: event.target.value })}
            >
              <option value="">Todos</option>
              <option>Correcto</option>
              <option>Con incidencia</option>
              <option>Pendiente</option>
              <option>No aplicable</option>
            </select>
          </label>
          <label>
            <span className="form-label">Prioridad</span>
            <select className="form-input mt-1" value={filters.prioridad ?? ''} onChange={(event) => updateFilters({ prioridad: event.target.value })}>
              <option value="">Todas</option>
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>
          </label>
          <label>
            <span className="form-label">Ordenar</span>
            <select
              className="form-input mt-1"
              value={filters.sortBy ?? 'fechaHora'}
              onChange={(event) => updateFilters({ sortBy: event.target.value as CenterReviewFilters['sortBy'] })}
            >
              <option value="fechaHora">Fecha</option>
              <option value="codigoEquipo">Máquina</option>
              <option value="nombreEquipo">Nombre</option>
              <option value="numeroEquipo">Número</option>
              <option value="estadoGlobal">Estado</option>
            </select>
          </label>
          <label>
            <span className="form-label">Dirección</span>
            <select
              className="form-input mt-1"
              value={filters.sortDir ?? 'desc'}
              onChange={(event) => updateFilters({ sortDir: event.target.value as CenterReviewFilters['sortDir'] })}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </label>
        </div>
      </section>

      {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div> : null}
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingState label="Cargando revisiones del centro" /> : null}

      {!loading && report ? (
        <CenterReviewReport
          report={{ ...report, revisiones: reviews }}
          onDownloadCsv={downloadCsv}
          onWriteSheet={createSheet}
          downloading={downloading}
          writing={writing}
        />
      ) : null}

      {!loading && center && reviews.length === 0 ? (
        <EmptyState title="Sin revisiones para este centro" detail="Cuando guardes revisiones aparecerán en este listado." />
      ) : null}

      <button type="button" className="btn-secondary" onClick={() => setFilters({ sortBy: 'fechaHora', sortDir: 'desc' })}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Restablecer filtros
      </button>
    </div>
  );
}
