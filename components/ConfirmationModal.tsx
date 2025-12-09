import React from 'react';
import { AlertTriangle, XCircle, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-slate-800 animate-in zoom-in-95 fade-in duration-200 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full text-red-600">
                <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Konfirmasi Hapus</h3>
          </div>
          <button 
            type="button" 
            onClick={onCancel} 
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
            {message}
            </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold transition-all shadow-sm"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Trash2 size={16} />
            Ya, Hapus Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;