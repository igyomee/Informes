import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EquipmentCard } from '../components/EquipmentCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { ReviewForm } from '../components/ReviewForm';
import { getEquipmentByCode } from '../services/equipmentService';
import { createReview } from '../services/reviewService';
import { getChecklistForEquipment } from '../services/templateService';
import type { ChecklistTemplate } from '../types/checklist';
import type { Equipment } from '../types/equipment';
import type { CreateReviewPayload } from '../types/review';
import { parseEquipmentCode } from '../utils/parseEquipmentCode';

export function NewReview() {
  const { codigo = '' } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([getEquipmentByCode(codigo), getChecklistForEquipment(codigo)])
      .then(([equipmentResult, templateResult]) => {
        setEquipment(equipmentResult);
        setTemplate(templateResult);
        setError('');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [codigo]);

  async function save(payload: CreateReviewPayload) {
    setSaving(true);
    try {
      await createReview(payload);
      navigate(`/equipos/${encodeURIComponent(codigo)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la revisión.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Cargando checklist" />;
  if (error) return <ErrorBanner message={error} />;
  if (!equipment || !template) return <ErrorBanner message="No se pudo cargar la revisión." />;

  const parsed = parseEquipmentCode(equipment.codigo);

  return (
    <div className="space-y-4">
      <Link className="btn-secondary" to={`/equipos/${encodeURIComponent(equipment.codigo)}`}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a ficha
      </Link>

      <EquipmentCard equipment={equipment} />

      <section className="panel p-4">
        <h1 className="text-xl font-bold text-ink">Nueva revisión</h1>
        <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-5">
          <span>Plantilla: {template.plantillaRevision}</span>
          <span>Tag centro: {parsed.tagCentro}</span>
          <span>Tag instalación: {parsed.tagInstalacion}</span>
          <span>Tag familia: {parsed.tagFamilia}</span>
          <span>Número: {parsed.numero}</span>
        </div>
      </section>

      <ReviewForm equipment={equipment} template={template} saving={saving} onSubmit={save} />
    </div>
  );
}
