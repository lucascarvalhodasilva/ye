import React from 'react';
import NumberInput from '@/components/NumberInput';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTimePicker from '@/components/CustomTimePicker';

export default function TripForm({ formData, setFormData, handleSubmit, submitError }) {
  return (
    <div className="card-modern">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Neuer Eintrag</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section: Reisezeitraum */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Reisezeitraum</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Start</label>
              <CustomDatePicker
                className="input-modern text-sm"
                value={formData.date}
                onChange={e => {
                  const newDate = e.target.value;
                  if (!formData.endDate || formData.endDate < newDate) {
                    setFormData({...formData, date: newDate, endDate: newDate});
                  } else {
                    setFormData({...formData, date: newDate});
                  }
                }}
              />
              <CustomTimePicker
                className="input-modern text-sm"
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ende</label>
              <CustomDatePicker
                className="input-modern text-sm"
                min={formData.date}
                value={formData.endDate || formData.date}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
              <CustomTimePicker
                className="input-modern text-sm"
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Section: Verkehrsmittel */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Verkehrsmittel</h3>
          
          {/* Toggle Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {['car', 'motorcycle', 'bike', 'public_transport'].map(mode => {
              const labels = { car: 'Auto', motorcycle: 'Motorrad', bike: 'Fahrrad', public_transport: 'Öffi' };
              const isActive = formData.commute[mode].active;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      commute: {
                        ...prev.commute,
                        [mode]: { ...prev.commute[mode], active: !isActive }
                      }
                    }));
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
            {formData.commute.car.active && (
              <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Auto (Hin & Zurück)</span>
                  <span>{(formData.commute.car.distance * 2).toFixed(1)} km</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  value={formData.commute.car.distance * 2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) / 2;
                    setFormData(prev => ({
                      ...prev,
                      commute: { ...prev.commute, car: { ...prev.commute.car, distance: val } }
                    }));
                  }}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            {/* Motorcycle Slider */}
            {formData.commute.motorcycle.active && (
              <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Motorrad (Hin & Zurück)</span>
                  <span>{(formData.commute.motorcycle.distance * 2).toFixed(1)} km</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  value={formData.commute.motorcycle.distance * 2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) / 2;
                    setFormData(prev => ({
                      ...prev,
                      commute: { ...prev.commute, motorcycle: { ...prev.commute.motorcycle, distance: val } }
                    }));
                  }}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            {/* Bike Slider */}
            {formData.commute.bike.active && (
              <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Fahrrad (Hin & Zurück)</span>
                  <span>{(formData.commute.bike.distance * 2).toFixed(1)} km</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  value={formData.commute.bike.distance * 2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) / 2;
                    setFormData(prev => ({
                      ...prev,
                      commute: { ...prev.commute, bike: { ...prev.commute.bike, distance: val } }
                    }));
                  }}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            {/* Public Transport Input */}
            {formData.commute.public_transport.active && (
              <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ticketkosten (Gesamt)</label>
                <NumberInput
                  className="input-modern text-sm bg-card"
                  value={formData.commute.public_transport.cost}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      commute: { ...prev.commute, public_transport: { ...prev.commute.public_transport, cost: val } }
                    }));
                  }}
                  placeholder="0.00"
                />
                <p className="text-[10px] text-muted-foreground">Für Bahn, Bus, Flug oder andere Tickets (voll absetzbar).</p>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="w-full btn-primary py-3 mt-4 shadow-lg shadow-primary/20">
          Eintrag hinzufügen
        </button>
        
        {submitError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive animate-in fade-in slide-in-from-top-2">
            {submitError}
          </div>
        )}
      </form>
    </div>
  );
}
