import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Cargando datos' }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-line bg-white p-8 text-slate-600">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
