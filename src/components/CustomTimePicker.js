"use client";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function CustomTimePicker({ value, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 5 minute steps for better UX

  const handleTimeSelect = (h, m) => {
    onChange({ target: { value: `${h}:${m}` } });
    setIsOpen(false);
  };

  const [selectedHour, setSelectedHour] = useState(value ? value.split(':')[0] : '12');
  const [selectedMinute, setSelectedMinute] = useState(value ? value.split(':')[1] : '00');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(h);
      setSelectedMinute(m);
    }
  }, [value]);

  const confirmSelection = () => {
    onChange({ target: { value: `${selectedHour}:${selectedMinute}` } });
    setIsOpen(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className={`relative flex items-center cursor-pointer ${className}`}>
        <div className={`flex-1 truncate ${!value ? 'text-muted-foreground' : ''}`}>
          {value || "--:--"}
        </div>
        <svg className="w-4 h-4 text-muted-foreground ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-card border border-border w-full max-w-sm sm:rounded-xl rounded-t-xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-center mb-6">Zeit wählen</h3>
            
            <div className="flex justify-center gap-4 mb-8 h-48">
              {/* Hours */}
              <div className="flex flex-col items-center w-20">
                <span className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Std</span>
                <div className="w-full h-full overflow-y-auto snap-y snap-mandatory rounded-lg bg-secondary/30 border border-border no-scrollbar">
                  {hours.map(h => (
                    <button
                      key={h}
                      onClick={() => setSelectedHour(h)}
                      className={`w-full h-10 flex items-center justify-center snap-center transition-colors ${
                        selectedHour === h ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center text-2xl font-bold text-muted-foreground pb-6">:</div>

              {/* Minutes */}
              <div className="flex flex-col items-center w-20">
                <span className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Min</span>
                <div className="w-full h-full overflow-y-auto snap-y snap-mandatory rounded-lg bg-secondary/30 border border-border no-scrollbar">
                  {minutes.map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMinute(m)}
                      className={`w-full h-10 flex items-center justify-center snap-center transition-colors ${
                        selectedMinute === m ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsOpen(false)} className="btn-secondary w-full">
                Abbrechen
              </button>
              <button onClick={confirmSelection} className="btn-primary w-full">
                Übernehmen
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
