import { Power, Snowflake, Wrench } from 'lucide-react';
import { getStoredModule } from '../services/api';
import type { Equipment } from '../types/equipment';

export function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const isClimate = getStoredModule() === 'clima';

  return (
    <article className="panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand">{equipment.codigo}</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{equipment.nombreEquipo}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {equipment.instalacion} - {equipment.familia} - No {equipment.numeroEquipo}
          </p>
        </div>
        <span className={`badge border border-black ${equipment.activo ? 'bg-brand text-black' : 'bg-white text-black'}`}>
          <Power className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          {equipment.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
        {isClimate ? (
          <>
            <span>{equipment.marca || 'Sin marca'}</span>
            <span>{equipment.modelo || 'Sin modelo'}</span>
            <span className="inline-flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-slate-400" aria-hidden="true" />
              {equipment.tipoRefrigerante || 'Sin refrigerante'} - {equipment.cargaRefrigerante || '0'} kg
            </span>
          </>
        ) : null}
        <span className="inline-flex items-center gap-2">
          <Wrench className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {equipment.plantillaRevision || 'Sin plantilla'}
        </span>
      </div>
    </article>
  );
}
