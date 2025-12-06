import React from 'react';
import NumberInput from '@/components/NumberInput';

export default function CommuteSettings({ localDefaultCommute, setLocalDefaultCommute, setHasChanges }) {
  return (
    <div className="card-modern">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Fahrweg</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Konfigurieren Sie Ihre tägliche Pendelstrecke. Diese wird automatisch jedem Arbeitstag hinzugefügt.
      </p>
      
      <div className="space-y-4">
        {/* Toggle Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {['car', 'motorcycle', 'bike', 'public_transport'].map(mode => {
            const labels = { car: 'Auto', motorcycle: 'Motorrad', bike: 'Fahrrad', public_transport: 'Öffi' };
            const isActive = localDefaultCommute[mode].active;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setLocalDefaultCommute(prev => ({
                    ...prev,
                    [mode]: { ...prev[mode], active: !isActive }
                  }));
                  setHasChanges(true);
                }}
                className={`p-2 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-primary' 
                    : 'bg-card hover:bg-secondary border-border text-muted-foreground'
                }`}
              >
                <span>{labels[mode]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Inputs */}
        <div className="space-y-3 mt-2">
          {/* Car Slider */}
          {localDefaultCommute.car.active && (
            <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Auto (Hin & Zurück)</span>
                <span>{(localDefaultCommute.car.distance * 2).toFixed(1)} km</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="0.1"
                value={localDefaultCommute.car.distance * 2}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) / 2;
                  setLocalDefaultCommute(prev => ({
                    ...prev,
                    car: { ...prev.car, distance: val }
                  }));
                  setHasChanges(true);
                }}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}

          {/* Motorcycle Slider */}
          {localDefaultCommute.motorcycle.active && (
            <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Motorrad (Hin & Zurück)</span>
                <span>{(localDefaultCommute.motorcycle.distance * 2).toFixed(1)} km</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="0.1"
                value={localDefaultCommute.motorcycle.distance * 2}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) / 2;
                  setLocalDefaultCommute(prev => ({
                    ...prev,
                    motorcycle: { ...prev.motorcycle, distance: val }
                  }));
                  setHasChanges(true);
                }}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}

          {/* Bike Slider */}
          {localDefaultCommute.bike.active && (
            <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Fahrrad (Hin & Zurück)</span>
                <span>{(localDefaultCommute.bike.distance * 2).toFixed(1)} km</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="0.1"
                value={localDefaultCommute.bike.distance * 2}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) / 2;
                  setLocalDefaultCommute(prev => ({
                    ...prev,
                    bike: { ...prev.bike, distance: val }
                  }));
                  setHasChanges(true);
                }}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}

          {/* Public Transport Input */}
          {localDefaultCommute.public_transport.active && (
            <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ticketkosten (Gesamt)</label>
              <NumberInput
                className="input-modern text-sm bg-card"
                value={localDefaultCommute.public_transport.cost}
                onChange={e => {
                  const val = e.target.value;
                  setLocalDefaultCommute(prev => ({
                    ...prev,
                    public_transport: { ...prev.public_transport, cost: val }
                  }));
                  setHasChanges(true);
                }}
                placeholder="0.00"
              />
              <p className="text-[10px] text-muted-foreground">Für Bahn, Bus, Flug oder andere Tickets (voll absetzbar).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
