import React, { useState, useEffect } from 'react';
import NumberInput from '@/components/shared/NumberInput';
import { useAppContext } from '@/context/AppContext';

export default function TaxSettings() {
  const { taxRates, setTaxRates } = useAppContext();
  const [localTaxRates, setLocalTaxRates] = useState(taxRates);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setTaxRates(localTaxRates);
      setHasChanges(false);
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="card-modern flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Gesetzliche Pauschalen</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Passen Sie die steuerlichen Pauschalen an, falls sich die Gesetzeslage ändert.
          </p>
        </div>
      </div>
      
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
