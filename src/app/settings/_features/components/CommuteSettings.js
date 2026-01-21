import React from 'react';
import NumberInput from '@/components/shared/NumberInput';
import TransportModeSelector, { DistanceSliderCompact } from '@/components/shared/TransportModeSelector';

export default function CommuteSettings({ localDefaultCommute, setLocalDefaultCommute, setHasChanges }) {
  const handleToggle = (mode) => {
    setLocalDefaultCommute(prev => ({
      ...prev,
      [mode]: { ...prev[mode], active: !prev[mode].active }
    }));
    setHasChanges(true);
  };

  const handleDistanceChange = (mode, distance) => {
    setLocalDefaultCommute(prev => ({
      ...prev,
      [mode]: { ...prev[mode], distance }
    }));
    setHasChanges(true);
  };

  return (
    <div className="card-modern">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Fahrweg</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Konfigurieren Sie Ihre tägliche Pendelstrecke. Diese wird automatisch jedem Arbeitstag hinzugefügt.
      </p>
      
      <div className="space-y-4">
        {/* Toggle Buttons - now with icons like TripForm */}
        <TransportModeSelector
          commuteData={localDefaultCommute}
          onToggle={handleToggle}
        />

        {/* Active Inputs */}
        <div className="space-y-3 mt-2">
          {/* Car Slider */}
          {localDefaultCommute.car.active && (
            <DistanceSliderCompact
              mode="car"
              distance={localDefaultCommute.car.distance}
              onChange={(val) => handleDistanceChange('car', val)}
              maxDistance={30}
            />
          )}

          {/* Motorcycle Slider */}
          {localDefaultCommute.motorcycle.active && (
            <DistanceSliderCompact
              mode="motorcycle"
              distance={localDefaultCommute.motorcycle.distance}
              onChange={(val) => handleDistanceChange('motorcycle', val)}
              maxDistance={100}
            />
          )}

          {/* Bike Slider */}
          {localDefaultCommute.bike.active && (
            <DistanceSliderCompact
              mode="bike"
              distance={localDefaultCommute.bike.distance}
              onChange={(val) => handleDistanceChange('bike', val)}
              maxDistance={100}
            />
          )}

          {/* Public Transport Input */}
          {localDefaultCommute.public_transport.active && (
            <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Kosten (Gesamt)</label>
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
              <p className="text-[10px] text-muted-foreground">Für Taxi, Uber, Roller, Bahn, Bus oder andere Tickets/Kosten.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
