import React from 'react';
import { CheckCircle2, Bookmark, BookmarkX, AlertCircle, Info } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'remove' | 'error';
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-[#5de6ff]" />;
        if (toast.type === 'remove') {
          icon = <BookmarkX className="w-4 h-4 text-[#ffb4ab]" />;
        } else if (toast.type === 'info') {
          icon = <Bookmark className="w-4 h-4 text-[#5de6ff]" />;
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-[#ffb4ab]" />;
        }

        return (
          <div
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#25293a] border border-[#2f3446] text-[#dee1f9] shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 cursor-pointer hover:bg-[#2f3446]"
          >
            {icon}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
