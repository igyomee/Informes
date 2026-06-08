import { Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CenterReviewReport } from '../components/CenterReviewReport';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { listEquipment } from '../services/equipmentService';
import { downloadCenterReportCsv, generateCenterReport, writeCenterReportSheet } from '../services/googleSheetsService';
import type { Equipment } from '../types/equipment';
import type { CenterReport } from '../types/review';

export function CenterReports() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [center, setCenter] = useState('');
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
    generateCenterReport(center)
      .then((reportResult) => {
        setReport(reportResult);
        setError('');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [center]);

  const centers = useMemo(() => {
    return Array.from(new Set(equipment.map((item) => item.centro).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
  }, [equipment]);

  async function createSheet() {
    if (!center) return;
    setWriting(true);
    setMessage('');
    try {
      const result = await writeCenterReportSheet(center);
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
      await downloadCenterReportCsv(center);
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
          <h1 className="text-xl font-bold text-ink">Informes por centro</h1>
        </div>
        <div className="mt-4 max-w-md">
          <label>
            <span className="form-label">Centro</span>
            <select className="form-input mt-1" value={center} onChange={(event) => setCenter(event.target.value)}>
              {centers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {message ? <div className="rounded-lg border border-black bg-yellow-100 p-4 text-sm font-semibold text-black">{message}</div> : null}
      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <LoadingState label="Cargando ultima revision del centro" /> : null}

      {!loading && report ? (
        <CenterReviewReport report={report} onDownloadCsv={downloadCsv} onWriteSheet={createSheet} downloading={downloading} writing={writing} />
      ) : null}

      {!loading && center && report && report.revisiones.length === 0 ? (
        <EmptyState title="Sin revisiones para este centro" detail="Cuando guardes revisiones apareceran en este listado." />
      ) : null}
    </div>
  );
}
