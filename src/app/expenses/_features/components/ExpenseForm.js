import React, { useEffect, useRef, useState } from 'react';
import NumberInput from '@/components/NumberInput';
import CustomDatePicker from '@/components/CustomDatePicker';
import { CameraSource } from '@capacitor/camera';

export default function ExpenseForm({ 
  formData, 
  setFormData, 
  handleSubmit, 
  submitError,
  tempExpenseReceipt,
  showExpenseCameraOptions,
  setShowExpenseCameraOptions,
  takeExpensePicture,
  removeExpenseReceipt,
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
    <article 
      ref={formRef}
      className={`rounded-lg border-2 border-blue-500 bg-white p-4 shadow-2xl transition-all duration-300 ${
        isFlashing ? 'ring-4 ring-blue-300' : ''
      }`}
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">
          {editingId ? 'Ausgabe bearbeiten' : 'Neue Ausgabe erfassen'}
        </h2>
        {editingId && (
          <button 
            type="button"
            onClick={cancelEdit}
            className="p-2 rounded-full text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Abbrechen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Description Field */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">
            Beschreibung
          </label>
          <input
            type="text"
            placeholder="z.B. Mittagessen, Kaffee"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date Field */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">
            Datum
          </label>
          <CustomDatePicker
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Amount Field */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">
            Betrag (Brutto €)
          </label>
          <NumberInput
            step="0.01"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-600">
            Beleg
          </label>
          <button 
            type="button" 
            onClick={() => setShowExpenseCameraOptions(true)} 
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium rounded-lg border border-dashed border-gray-300 text-gray-600 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Beleg hinzufügen
          </button>
          
          {/* Receipt Preview */}
          {tempExpenseReceipt && (
            <div className="relative w-24 h-24 mt-4 group">
              <img 
                src={`data:image/jpeg;base64,${tempExpenseReceipt}`} 
                alt="Beleg Vorschau" 
                className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button 
                type="button" 
                onClick={removeExpenseReceipt}
                className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
                aria-label="Beleg entfernen"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={editingId && !hasChanges}
          className={`flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 ${
            editingId && !hasChanges ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {editingId ? 'Aktualisieren' : 'Hinzufügen'}
        </button>

        {/* Error Message */}
        {submitError && (
          <div className="p-3 text-sm rounded-lg border border-red-200 bg-red-50 text-red-600 animate-in fade-in slide-in-from-top-2">
            {submitError}
          </div>
        )}
      </form>

      {/* Camera Options Modal */}
      {showExpenseCameraOptions && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-lg border-2 border-blue-500 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Beleg hinzufügen</h3>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => takeExpensePicture(CameraSource.Camera)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Kamera</span>
              </button>
              <button
                onClick={() => takeExpensePicture(CameraSource.Photos)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Galerie</span>
              </button>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowExpenseCameraOptions(false)}
                className="w-full px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
