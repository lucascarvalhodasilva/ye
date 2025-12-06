"use client";
import { useSettings } from './_features/hooks/useSettings';
import CommuteSettings from './_features/components/CommuteSettings';
import TaxSettings from './_features/components/TaxSettings';

export default function SettingsPage() {
  const {
    localDefaultCommute,
    setLocalDefaultCommute,
    localTaxRates,
    handleTaxRateChange,
    hasChanges,
    setHasChanges,
    isSaving,
    handleSave,
    taxRates
  } = useSettings();

  return (
    <div className="space-y-8 py-8 container-custom pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start">
        <p className="text-muted-foreground max-w-2xl sm:mr-4">Spezialisiert für Fahrzeugüberführer: Konfigurieren Sie Ihren festen Arbeitsweg zum lokalen Bahnhof.</p>
        
        <div className={`transition-all duration-500 ease-out overflow-hidden shrink-0 ${
            hasChanges 
              ? 'max-h-24 opacity-100 mt-4 sm:mt-0 py-2' 
              : 'max-h-0 opacity-0 mt-0 py-0'
          }`}>
          <button 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`btn-primary min-w-[200px] shadow-lg shadow-primary/20 ${isSaving ? 'opacity-80 cursor-wait' : ''}`}
          >
            {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CommuteSettings 
          localDefaultCommute={localDefaultCommute}
          setLocalDefaultCommute={setLocalDefaultCommute}
          setHasChanges={setHasChanges}
        />

        <TaxSettings 
          localTaxRates={localTaxRates}
          handleTaxRateChange={handleTaxRateChange}
          currentTaxRates={taxRates}
        />
      </div>
    </div>
  );
}
