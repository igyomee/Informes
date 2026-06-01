import { AlertTriangle, ClipboardCheck, FileText, Search, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { getDashboard } from '../services/googleSheetsService';

type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!data) return <LoadingState label="Cargando indicadores" />;

  const metrics = [
    { label: 'Total de equipos', value: data.totalEquipos, icon: Wrench, tone: 'text-teal-700 bg-teal-50' },
    { label: 'Revisiones del mes', value: data.revisionesMes, icon: ClipboardCheck, tone: 'text-blue-700 bg-blue-50' },
    { label: 'Incidencias abiertas', value: data.incidenciasAbiertas, icon: AlertTriangle, tone: 'text-amber-700 bg-amber-50' },
    { label: 'Incidencias críticas', value: data.incidenciasCriticas, icon: AlertTriangle, tone: 'text-red-700 bg-red-50' },
    { label: 'Equipos pendientes', value: data.equiposPendientes, icon: FileText, tone: 'text-slate-700 bg-slate-100' }
  ];

  return (
    <div className="space-y-6">
      {data.mockMode ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          La app está funcionando con datos mock porque no hay credenciales de Google Sheets configuradas.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="panel p-4">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${tone}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm text-slate-600">{label}</p>
            <p className="mt-1 text-3xl font-bold text-ink">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link className="panel p-5 transition hover:border-brand" to="/equipos">
          <Search className="h-6 w-6 text-brand" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-ink">Buscar máquina</h2>
        </Link>
        <Link className="panel p-5 transition hover:border-brand" to="/centros">
          <FileText className="h-6 w-6 text-blue-700" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-ink">Revisiones por centro</h2>
        </Link>
        <Link className="panel p-5 transition hover:border-brand" to="/incidencias">
          <AlertTriangle className="h-6 w-6 text-red-700" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-ink">Incidencias</h2>
        </Link>
      </section>
    </div>
  );
}
