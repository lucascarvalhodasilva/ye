import React from 'react';
import NumberInput from '@/components/NumberInput';
import CustomDatePicker from '@/components/CustomDatePicker';
import SuggestionInput from '@/components/SuggestionInput';
import { CameraSource } from '@capacitor/camera';

export default function EquipmentForm({ 
  formData, 
  setFormData, 
  handleSubmit, 
  tempReceipt, 
  setTempReceipt, 
  showCameraOptions, 
  setShowCameraOptions, 
  nameSuggestions, 
  takePicture 
}) {
  return (
    <div className="card-modern">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Neuer Eintrag</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bezeichnung</label>
          <SuggestionInput
            required
            className="input-modern text-sm"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            suggestions={nameSuggestions}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Kaufdatum</label>
          <CustomDatePicker
            required
            className="input-modern text-sm"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Preis (Brutto €)</label>
          <NumberInput
            step="0.01"
            required
            className="input-modern text-sm"
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Beleg</label>
          <button 
            type="button" 
            onClick={() => setShowCameraOptions(true)} 
            className="w-full py-2.5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-secondary/50 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Beleg hinzufügen
          </button>
          {tempReceipt && (
            <div className="relative w-24 h-24 mt-2 group">
              <img 
                src={`data:image/jpeg;base64,${tempReceipt}`} 
                alt="Beleg Vorschau" 
                className="w-full h-full object-cover rounded-lg border border-border shadow-sm"
              />
              <button 
                type="button" 
                onClick={() => setTempReceipt(null)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="w-full btn-primary py-3 mt-4 shadow-lg shadow-primary/20">
          Hinzufügen
        </button>
      </form>

      {/* Camera Options Modal */}
      {showCameraOptions && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Beleg hinzufügen</h3>
            <div className="space-y-3">
              <button
                onClick={() => takePicture(CameraSource.Camera)}
                className="w-full p-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-border flex items-center gap-3 transition-all"
              >
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Kamera</span>
              </button>
              <button
                onClick={() => takePicture(CameraSource.Photos)}
                className="w-full p-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-border flex items-center gap-3 transition-all"
              >
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Galerie</span>
              </button>
              <button
                onClick={() => setShowCameraOptions(false)}
                className="w-full p-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors mt-2"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
