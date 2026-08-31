import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 sm:px-0">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border transition-all duration-300 ${
          type === 'success'
            ? 'bg-[#002517] border-[#0D6C45] text-white'
            : type === 'error'
            ? 'bg-rose-900 border-rose-700 text-white'
            : 'bg-[#002517] border-[#9DF1C0] text-white'
        }`}
      >
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#9DF1C0] shrink-0 mt-0.5" />}
        {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />}
        {type === 'info' && <Info className="w-5 h-5 text-[#FFDF9E] shrink-0 mt-0.5" />}
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-relaxed">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

