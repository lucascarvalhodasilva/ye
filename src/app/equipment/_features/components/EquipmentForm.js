import React, { useEffect, useRef, useState } from 'react';
import NumberInput from '@/components/shared/NumberInput';
import CustomDatePicker from '@/components/shared/CustomDatePicker';
import SuggestionInput from '@/components/shared/SuggestionInput';
import ReceiptUpload from '@/components/shared/ReceiptUpload';
import { LoadingButton } from '@/components/shared/skeletons';

export default function EquipmentForm({ 
  formData, 
  setFormData, 
  handleSubmit, 
  tempReceipt,
  tempReceiptType = 'image',
  removeReceipt,
  takePicture,
  pickFile,
  nameSuggestions, 
  submitError,
  isSubmitting,
  editingId,
  cancelEdit,
  hasChanges
}) {
  const formRef = useRef(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (editingId && formRef.current) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [editingId]);

  return (
    <div 
      ref={formRef}
      className={`rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300 max-h-[80vh] flex flex-col ${
        isFlashing ? 'ring-2 ring-primary/50' : ''
      }`}
    >
      {/* Modal Header */}
      <div className="flex justify-between items-center p-4 border-b border-border/50 bg-muted/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${editingId ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
            {editingId ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {editingId ? 'Arbeitsmittel bearbeiten' : 'Neues Arbeitsmittel'}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {editingId ? 'Änderungen vornehmen' : 'Arbeitsmittel erfassen'}
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={cancelEdit}
          className="w-8 h-8 rounded-lg bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form id="equipment-form" onSubmit={handleSubmit} className="p-4 space-y-5 overflow-y-auto flex-1">
        
        {/* Section: Arbeitsmittel Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold text-foreground">Arbeitsmittel Details</h3>
          </div>

          {/* Name Field */}
          <div className="p-3 rounded-xl border border-border/30">
            <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
              Bezeichnung
            </label>
            <SuggestionInput
              className="w-full px-3 py-2.5 bg-card rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground transition-colors"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              suggestions={nameSuggestions}
              placeholder="z.B. Laptop, Monitor"
            />
          </div>

          {/* Date and Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border/30">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
                Kaufdatum
              </label>
              <CustomDatePicker
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="p-3 rounded-xl border border-border/30">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
                Preis (Brutto €)
              </label>
              <NumberInput
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2.5 bg-card rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm text-foreground"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Section: Beleg */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold text-foreground">Beleg (optional)</h3>
          </div>

          <ReceiptUpload
            receipt={tempReceipt}
            receiptType={tempReceiptType}
            onTakePicture={takePicture}
            onPickFile={pickFile}
            onRemove={removeReceipt}
            accentColor="blue"
            showLabel={false}
          />
        </div>
      </form>

      {/* Error Message - Sticky above button */}
      {submitError && (
        <div className="px-4 pb-2 shrink-0 border-t border-border/50 pt-3 bg-card/95">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-2">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        </div>
      )}

      {/* Footer with Submit Button */}
      <div className={`border-t border-border/50 bg-muted/30 p-4 shrink-0 ${submitError ? 'border-t-0 pt-2' : ''}`}>
        <LoadingButton 
          type="submit" 
          form="equipment-form"
          disabled={(editingId && !hasChanges) || isSubmitting}
          isLoading={isSubmitting}
          className={`w-full px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm ${
            (editingId && !hasChanges) || isSubmitting
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : editingId
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {editingId ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Aktualisieren
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Hinzufügen
            </>
          )}
        </LoadingButton>
      </div>
    </div>
  );
}
