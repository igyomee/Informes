import { ClipboardCheck, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { EquipmentCard } from '../components/EquipmentCard';
import { EquipmentEditor } from '../components/EquipmentEditor';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { getStoredModule } from '../services/api';
import { getEquipmentByCode, getEquipmentHistory, updateEquipment } from '../services/equipmentService';
import type { EditableEquipmentFields, Equipment, EquipmentHistory } from '../types/equipment';

export function EquipmentDetail() {
  const { codigo = '' } = useParams();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [history, setHistory] = useState<EquipmentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([getEquipmentByCode(codigo), getEquipmentHistory(codigo)])
      .then(([equipmentResult, historyResult]) => {
        setEquipment(equipmentResult);
        setHistory(historyResult);
        setError('');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [codigo]);

  async function save(data: EditableEquipmentFields) {
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateEquipment(codigo, data);
      setEquipment(updated);
      setMessage('Cambios guardados correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Cargando ficha del equipo" />;
  if (error) return <ErrorBanner message={error} />;
  if (!equipment) return <EmptyState title="Equipo no encontrado" />;

  return (
    <div className="space-y-4">
      <EquipmentCard equipment={equipment} />

      <div className="flex flex-wrap gap-2">
        <Link className="btn-primary" to={`/equipos/${encodeURIComponent(equipment.codigo)}/revision`}>
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Nueva revision
        </Link>
      </div>

      {message ? <div className="rounded-lg border border-black bg-yellow-100 p-4 text-sm font-semibold text-black">{message}</div> : null}

      <EquipmentEditor equipment={equipment} saving={saving} onSave={save} moduleKey={getStoredModule()} />

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line p-4">
            <History className="h-5 w-5 text-brand" aria-hidden="true" />
            <h2 className="text-lg font-bold text-ink">Historico de maquina</h2>
          </div>
          {history?.reviews.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[680px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Tecnico</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {history.reviews.map((review) => (
                    <tr key={review.idRevision} className="bg-white">
                      <td className="px-4 py-3">{new Date(review.fechaHora).toLocaleString('es-ES')}</td>
                      <td className="px-4 py-3">{review.tecnico}</td>
                      <td className="px-4 py-3">{review.estadoGlobal}</td>
                      <td className="px-4 py-3">{review.observacionesGenerales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4">
              <EmptyState title="Sin revisiones todavia" />
            </div>
          )}
        </div>

        <aside className="panel p-4">
          <h2 className="text-lg font-bold text-ink">Ultima revision</h2>
          <p className="mt-2 text-sm text-slate-600">
            {history?.lastReview
              ? `${new Date(history.lastReview.fechaHora).toLocaleString('es-ES')} - ${history.lastReview.estadoGlobal}`
              : 'Sin revision registrada'}
          </p>
        </aside>
      </section>
    </div>
  );
}
