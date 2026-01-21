"use client";
import { useSettings } from './_features/hooks/useSettings';
import CommuteSettings from './_features/components/CommuteSettings';
import TaxSettings from './_features/components/TaxSettings';
import BackupSettings from './_features/components/BackupSettings';

export default function SettingsPage() {
  const {
    localDefaultCommute,
    setLocalDefaultCommute,
    hasChanges,
    setHasChanges,
    isSaving,
    handleSave
  } = useSettings();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex flex-col gap-8 py-8 max-w-6xl mx-auto w-full pb-32" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl">Spezialisiert für Fahrzeugüberführer: Konfigurieren Sie Ihren festen Arbeitsweg zum lokalen Bahnhof.</p>
        
          <div className={`transition-all duration-500 ease-out overflow-hidden shrink-0 ${
              hasChanges 
                ? 'max-h-24 opacity-100 py-2' 
                : 'max-h-0 opacity-0 py-0'
            }`}>
            <button 
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 ${isSaving ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
            </button>
          </div>
        </div>

        <CommuteSettings 
          localDefaultCommute={localDefaultCommute}
          setLocalDefaultCommute={setLocalDefaultCommute}
          setHasChanges={setHasChanges}
        />
        <TaxSettings />
        <BackupSettings />
      </div>
    </div>
  );
}
