import { AlertTriangle } from 'lucide-react';

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-black bg-yellow-100 p-4 text-sm font-semibold text-black" role="alert">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
