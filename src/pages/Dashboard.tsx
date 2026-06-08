import { ClipboardCheck, FileText, Wrench } from 'lucide-react';
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
    { label: 'Total de equipos', value: data.totalEquipos, icon: Wrench, tone: 'text-black bg-brand' },
    { label: 'Revisiones del mes', value: data.revisionesMes, icon: ClipboardCheck, tone: 'text-black bg-white border border-black' },
    { label: 'Equipos pendientes', value: data.equiposPendientes, icon: FileText, tone: 'text-black bg-white border border-black' }
  ];

  return (
    <div className="space-y-6">
      {data.mockMode ? (
        <div className="rounded-lg border border-black bg-yellow-100 p-4 text-sm font-semibold text-black">
          La app esta funcionando con datos mock porque no hay credenciales de Google Sheets configuradas.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      <section className="grid gap-4 md:grid-cols-2">
        <Link className="panel p-5 transition hover:border-brand" to="/revision-centro">
          <ClipboardCheck className="h-6 w-6 text-brand" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-ink">Revision por centro</h2>
        </Link>
        <Link className="panel p-5 transition hover:border-brand" to="/centros">
          <FileText className="h-6 w-6 text-black" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-ink">Informes por centro</h2>
        </Link>
      </section>
    </div>
  );
}
