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
    {
      machineLabel: 'Total de equipos',
      machineValue: data.totalEquipos,
      centerLabel: 'Total de centros',
      centerValue: data.totalCentros,
      icon: Wrench,
      tone: 'text-black bg-brand'
    },
    {
      machineLabel: 'Revisiones del mes',
      machineValue: data.revisionesMes,
      centerLabel: 'Centros revisados del mes',
      centerValue: data.centrosRevisadosMes,
      icon: ClipboardCheck,
      tone: 'text-black bg-white border border-black'
    },
    {
      machineLabel: 'Equipos pendientes',
      machineValue: data.equiposPendientes,
      centerLabel: 'Centros pendientes',
      centerValue: data.centrosPendientes,
      icon: FileText,
      tone: 'text-black bg-white border border-black'
    }
  ];

  return (
    <div className="space-y-6">
      {data.mockMode ? (
        <div className="rounded-lg border border-black bg-yellow-100 p-4 text-sm font-semibold text-black">
          La app esta funcionando con datos mock porque no hay credenciales de Google Sheets configuradas.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ machineLabel, machineValue, centerLabel, centerValue, icon: Icon, tone }) => (
          <article key={machineLabel} className="panel p-4">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${tone}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-4">
              <div>
                <p className="text-sm text-slate-600">{machineLabel}</p>
                <p className="mt-1 text-3xl font-bold text-ink">{machineValue}</p>
              </div>
              <div className="h-16 w-px bg-black" aria-hidden="true" />
              <div>
                <p className="text-sm text-slate-600">{centerLabel}</p>
                <p className="mt-1 text-3xl font-bold text-ink">{centerValue}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section>
        <Link className="panel block p-5 transition hover:border-brand" to="/revision-centro">
          <ClipboardCheck className="h-6 w-6 text-brand" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-ink">Revision por centro</h2>
        </Link>
      </section>
    </div>
  );
}
