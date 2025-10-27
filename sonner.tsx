import React from 'react';
import { useToast } from '../../hooks/use-toast';

export const Toaster: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-gray-800 border border-purple-500/50 text-white rounded-lg shadow-lg p-4 animate-fade-in-up"
        >
          <p className="font-bold">{toast.title}</p>
          {toast.description && <p className="text-sm text-gray-300">{toast.description}</p>}
        </div>
      ))}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};