import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { closeIncident, listIncidents } from '../services/incidentService';
import type { Incident, IncidentFilters } from '../types/incident';

export function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [closing, setClosing] = useState('');
  const [actionById, setActionById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    listIncidents(filters)
      .then((result) => {
        setIncidents(result);
        setError('');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  const centers = useMemo(
    () => Array.from(new Set(incidents.map((incident) => incident.centro).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')),
    [incidents]
  );

  async function close(id: string) {
    setClosing(id);
    try {
      const updated = await closeIncident(id, actionById[id] ?? '');
      setIncidents((current) => current.map((incident) => (incident.idIncidencia === id ? updated : incident)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cerrar la incidencia.');
    } finally {
      setClosing('');
    }
  }

  return (
    <div className="space-y-4">
      <section className="panel p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-black" aria-hidden="true" />
          <h1 className="text-xl font-bold text-ink">Incidencias</h1>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label>
            <span className="form-label">Centro</span>
            <select
              className="form-input mt-1"
              value={filters.centro ?? ''}
              onChange={(event) => setFilters((current) => ({ ...current, centro: event.target.value }))}
            >
              <option value="">Todos</option>
              {centers.map((center) => (
                <option key={center} value={center}>
                  {center}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Prioridad</span>
            <select
              className="form-input mt-1"
              value={filters.prioridad ?? ''}
              onChange={(event) => setFilters((current) => ({ ...current, prioridad: event.target.value }))}
            >
              <option value="">Todas</option>
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>
          </label>
          <label>
            <span className="form-label">Estado</span>
            <select
              className="form-input mt-1"
              value={filters.estadoIncidencia ?? ''}
              onChange={(event) => setFilters((current) => ({ ...current, estadoIncidencia: event.target.value }))}
            >
              <option value="">Todos</option>
              <option>Abierta</option>
              <option>Cerrada</option>
            </select>
          </label>
        </div>
      </section>

      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingState label="Cargando incidencias" /> : null}
      {!loading && incidents.length === 0 ? <EmptyState title="No hay incidencias con esos filtros" /> : null}

      <section className="grid gap-3">
        {incidents.map((incident) => {
          const closed = incident.estadoIncidencia.toLowerCase() === 'cerrada';
          return (
            <article key={incident.idIncidencia} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-slate-500">{incident.idIncidencia}</p>
                  <h2 className="mt-1 text-lg font-bold text-ink">{incident.descripcion}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {incident.centro} · {incident.codigoEquipo} · {incident.instalacion} · {incident.familia}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`badge border border-black ${incident.prioridad === 'Crítica' ? 'bg-brand text-black' : 'bg-white text-black'}`}>
                    {incident.prioridad}
                  </span>
                  <span className={`badge border border-black ${closed ? 'bg-white text-black' : 'bg-brand text-black'}`}>
                    {incident.estadoIncidencia}
                  </span>
                </div>
              </div>

              {!closed ? (
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <label>
                    <span className="form-label">Acción realizada</span>
                    <input
                      className="form-input mt-1"
                      value={actionById[incident.idIncidencia] ?? ''}
                      onChange={(event) => setActionById((current) => ({ ...current, [incident.idIncidencia]: event.target.value }))}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-primary mt-6"
                    disabled={closing === incident.idIncidencia}
                    onClick={() => void close(incident.idIncidencia)}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Cerrar
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">Cierre: {incident.fechaCierre || 'Sin fecha'} · {incident.accionRecomendada}</p>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
