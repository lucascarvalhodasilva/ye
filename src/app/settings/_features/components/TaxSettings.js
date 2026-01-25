import React, { useState, useEffect } from 'react';
import NumberInput from '@/components/shared/NumberInput';
import { useAppContext } from '@/context/AppContext';

// Default German tax rates (2024+)
const DEFAULT_TAX_RATES = {
  mealRate8h: 14,
  mealRate24h: 28,
  mileageRateCar: 0.30,
  mileageRateMotorcycle: 0.20,
  mileageRateBike: 0.05,
  gwgLimit: 952
};

// Validation ranges
const VALIDATION_RULES = {
  mealRate8h: { min: 0, max: 100, name: 'Verpflegungspauschale (8h)' },
  mealRate24h: { min: 0, max: 200, name: 'Verpflegungspauschale (24h)' },
  mileageRateCar: { min: 0, max: 5, name: 'PKW-Pauschale' },
  mileageRateMotorcycle: { min: 0, max: 5, name: 'Motorrad-Pauschale' },
  mileageRateBike: { min: 0, max: 2, name: 'Fahrrad-Pauschale' },
  gwgLimit: { min: 0, max: 10000, name: 'GWG-Grenze' }
};

export default function TaxSettings() {
  const { taxRates, setTaxRates } = useAppContext();
  const [localTaxRates, setLocalTaxRates] = useState(taxRates);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (taxRates) {
      setLocalTaxRates(taxRates);
    }
  }, [taxRates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalTaxRates(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
    setHasChanges(true);
  };

  const validateRates = () => {
    // Check each rate against validation rules
    for (const [key, rule] of Object.entries(VALIDATION_RULES)) {
      const value = localTaxRates[key];
      
      // Check if value is a valid number
      if (typeof value !== 'number' || isNaN(value)) {
        return `${rule.name}: Bitte geben Sie einen gültigen Zahlenwert ein.`;
      }
      
      // Check if value is within range
      if (value < rule.min || value > rule.max) {
        return `${rule.name} muss zwischen ${rule.min} und ${rule.max} liegen. Aktueller Wert: ${value.toFixed(2)}`;
      }
    }
    
    // Additional logical checks
    if (localTaxRates.mealRate24h < localTaxRates.mealRate8h) {
      return 'Verpflegungspauschale (24h) muss größer oder gleich der 8h-Pauschale sein.';
    }
    
    return null; // No errors
  };

  const handleSave = () => {
    // Clear previous errors
    setError(null);
    
    // Validate rates
    const validationError = validateRates();
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 5000); // Auto-dismiss after 5s
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      setTaxRates(localTaxRates);
      setHasChanges(false);
      setIsSaving(false);
    }, 800);
  };

  const handleReset = () => {
    setLocalTaxRates(DEFAULT_TAX_RATES);
    setHasChanges(true);
    setError(null);
  };

  return (
    <div className="card-modern flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Gesetzliche Pauschalen</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Passen Sie die steuerlichen Pauschalen an, falls sich die Gesetzeslage ändert.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="btn-secondary text-sm px-3 py-2 ml-4 shrink-0"
          title="Auf Standardwerte zurücksetzen"
        >
          Zurücksetzen
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-medium text-sm">⚠</span>
            <p className="text-red-700 text-sm flex-1">{error}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Verpflegungspauschale (ab 8h)</label>
          <NumberInput
            step="0.5"
            name="mealRate8h"
            className="input-modern"
            value={localTaxRates.mealRate8h}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground mt-1">Aktuell: {taxRates?.mealRate8h?.toFixed(2)} €</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Verpflegungspauschale (24h)</label>
          <NumberInput
            step="0.5"
            name="mealRate24h"
            className="input-modern"
            value={localTaxRates.mealRate24h}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground mt-1">Aktuell: {taxRates?.mealRate24h?.toFixed(2)} €</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Fahrzeugpauschalen (€/km)</label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">PKW</label>
              <NumberInput
                step="0.01"
                name="mileageRateCar"
                className="input-modern"
                value={localTaxRates.mileageRateCar || 0.30}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Motorrad / Roller</label>
              <NumberInput
                step="0.01"
                name="mileageRateMotorcycle"
                className="input-modern"
                value={localTaxRates.mileageRateMotorcycle || 0.20}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Fahrrad / E-Bike</label>
              <NumberInput
                step="0.01"
                name="mileageRateBike"
                className="input-modern"
                value={localTaxRates.mileageRateBike || 0.05}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">GWG-Grenze (Brutto €)</label>
          <NumberInput
            step="1"
            name="gwgLimit"
            className="input-modern"
            value={localTaxRates.gwgLimit || 952}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground mt-1">Aktuell: {taxRates?.gwgLimit || 952} €</p>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-out overflow-hidden ${
          hasChanges ? 'max-h-16 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
        }`}>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full btn-primary"
        >
          {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </button>
      </div>
    </div>
  );
}
