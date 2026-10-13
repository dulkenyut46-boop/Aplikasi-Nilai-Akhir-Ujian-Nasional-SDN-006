import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          ) : (
            <Info className="h-5 w-5 text-sky-500 shrink-0" />
          );

        const borderClass =
          toast.type === 'success'
            ? 'border-emerald-500/40 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100'
            : toast.type === 'error'
            ? 'border-rose-500/40 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100'
            : 'border-sky-500/40 bg-sky-50/95 dark:bg-sky-950/90 text-sky-900 dark:text-sky-100';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 shadow-lg backdrop-blur-xs transition-all ${borderClass}`}
          >
            {icon}
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
