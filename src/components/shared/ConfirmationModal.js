import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUIContext } from '@/context/UIContext';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Löschen", cancelText = "Abbrechen", subtitle = "Diese Aktion kann nicht rückgängig gemacht werden" }) {
  const { pushModal, removeModal } = useUIContext();
  
  // Refs to store stable values
  const modalIdRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isOpen) {
      const modalId = `confirmation-${Date.now()}`;
      modalIdRef.current = modalId;
      pushModal(modalId, () => onCloseRef.current());
      return () => {
        if (modalIdRef.current) {
          removeModal(modalIdRef.current);
          modalIdRef.current = null;
        }
      };
    }
  }, [isOpen, pushModal, removeModal]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4" aria-hidden="true">
      <div 
        className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 w-full max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/30">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 id="confirmation-modal-title" className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="text-[10px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-border/50">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 bg-card hover:bg-muted/50 text-foreground font-medium transition-colors"
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 !text-white font-medium transition-colors shadow-sm"
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}