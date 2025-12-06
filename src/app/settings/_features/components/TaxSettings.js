import React from 'react';
import NumberInput from '@/components/NumberInput';

export default function TaxSettings({ localTaxRates, handleTaxRateChange, currentTaxRates }) {
  return (
    <div className="card-modern">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Gesetzliche Pauschalen</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Passen Sie die steuerlichen Pauschalen an, falls sich die Gesetzeslage ändert.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Verpflegungspauschale (ab 8h)</label>
          <NumberInput
            step="0.5"
            name="mealRate8h"
            className="input-modern"
            value={localTaxRates.mealRate8h}
            onChange={handleTaxRateChange}
          />
          <p className="text-xs text-muted-foreground mt-1">Aktuell: 14,00 €</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Verpflegungspauschale (24h)</label>
          <NumberInput
            step="0.5"
            name="mealRate24h"
            className="input-modern"
            value={localTaxRates.mealRate24h}
            onChange={handleTaxRateChange}
          />
          <p className="text-xs text-muted-foreground mt-1">Aktuell: 28,00 €</p>
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
                onChange={handleTaxRateChange}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Motorrad / Roller</label>
              <NumberInput
                step="0.01"
                name="mileageRateMotorcycle"
                className="input-modern"
                value={localTaxRates.mileageRateMotorcycle || 0.20}
                onChange={handleTaxRateChange}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Fahrrad / E-Bike</label>
              <NumberInput
                step="0.01"
                name="mileageRateBike"
                className="input-modern"
                value={localTaxRates.mileageRateBike || 0.05}
                onChange={handleTaxRateChange}
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
            onChange={handleTaxRateChange}
          />
          <p className="text-xs text-muted-foreground mt-1">Aktuell: {currentTaxRates?.gwgLimit || 952} €</p>
        </div>
      </div>
    </div>
  );
}
