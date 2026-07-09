'use client';

import { useUI } from '@/stores';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const styles = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
};

export function Toast() {
  const { state, hideToast } = useUI();
  const { toast } = state;

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
          'transition-all duration-300 ease-in-out',
          styles[toast.type]
        )}
      >
        {icons[toast.type]}
        <p className="text-sm font-medium text-gray-900">{toast.message}</p>
        <button
          onClick={hideToast}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
