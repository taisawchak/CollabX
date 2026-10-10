import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
        };

        const bgColors = {
          success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          error: 'bg-red-50 border-red-200 text-red-900',
          warning: 'bg-amber-50 border-amber-200 text-amber-900',
          info: 'bg-blue-50 border-blue-200 text-blue-900',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl border shadow-lg text-xs font-medium animate-in slide-in-from-right duration-200 ${bgColors[toast.type]}`}
          >
            {icons[toast.type]}
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
