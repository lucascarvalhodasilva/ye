import React from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Löschen", cancelText = "Abbrechen" }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white border border-gray-200 w-full max-w-sm rounded-lg shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
        
        <div className="flex gap-2 p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}