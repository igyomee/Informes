import { Download, FileSpreadsheet } from 'lucide-react';
import type { CenterReport } from '../types/review';

interface CenterReviewReportProps {
  report: CenterReport;
  onDownloadCsv: () => void;
  onWriteSheet: () => void;
  downloading: boolean;
  writing: boolean;
}

const metricLabels: Array<[keyof CenterReport, string]> = [
  ['totalEquiposRevisados', 'Equipos revisados'],
  ['totalRevisiones', 'Revisiones'],
  ['equiposCorrectos', 'Equipos correctos'],
  ['equiposConIncidencia', 'Equipos con incidencia'],
  ['incidenciasAbiertas', 'Incidencias abiertas'],
  ['incidenciasCriticas', 'Incidencias críticas'],
  ['equiposPendientesRevision', 'Equipos pendientes']
];

export function CenterReviewReport({ report, onDownloadCsv, onWriteSheet, downloading, writing }: CenterReviewReportProps) {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricLabels.map(([key, label]) => (
          <div key={key} className="panel p-4">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-3xl font-bold text-ink">{String(report[key])}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={onDownloadCsv} disabled={downloading}>
          <Download className="h-4 w-4" aria-hidden="true" />
          {downloading ? 'Exportando CSV' : 'Exportar CSV'}
        </button>
        <button type="button" className="btn-primary" onClick={onWriteSheet} disabled={writing}>
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          {writing ? 'Generando hoja' : 'Generar hoja resumen'}
        </button>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-line p-4">
          <h2 className="text-lg font-bold text-ink">Listado de revisiones</h2>
          <p className="text-sm text-slate-600">{report.rangoFechas}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Instalación</th>
                <th className="px-4 py-3">Familia</th>
                <th className="px-4 py-3">Técnico</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Prioridad</th>
                <th className="px-4 py-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {report.revisiones.map((review) => (
                <tr key={review.idRevision} className="bg-white">
                  <td className="px-4 py-3">{new Date(review.fechaHora).toLocaleString('es-ES')}</td>
                  <td className="px-4 py-3 font-mono text-xs">{review.codigoEquipo}</td>
                  <td className="px-4 py-3">{review.nombreEquipo}</td>
                  <td className="px-4 py-3">{review.numeroEquipo}</td>
                  <td className="px-4 py-3">{review.instalacion}</td>
                  <td className="px-4 py-3">{review.familia}</td>
                  <td className="px-4 py-3">{review.tecnico}</td>
                  <td className="px-4 py-3">{review.estadoGlobal}</td>
                  <td className="px-4 py-3">{review.prioridad}</td>
                  <td className="px-4 py-3">{review.observacionesGenerales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
