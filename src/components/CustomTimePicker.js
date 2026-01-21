"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, X } from 'lucide-react';

export default function CustomTimePicker({ value, onChange, className = "", placeholder = "--:--" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // Generate time options
  const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 5-minute steps

  // Initialize component
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync selected values with prop value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(h);
      setSelectedMinute(m);
    }
  }, [value]);

  // Auto-scroll to selected values when modal opens
  useEffect(() => {
    if (isOpen && hourScrollRef.current && minuteScrollRef.current) {
      const hourIndex = HOURS.indexOf(selectedHour);
      const minuteIndex = MINUTES.indexOf(selectedMinute);
      
      if (hourIndex !== -1) {
        hourScrollRef.current.scrollTop = hourIndex * 40; // 40px = h-10
      }
      if (minuteIndex !== -1) {
        minuteScrollRef.current.scrollTop = minuteIndex * 40;
      }
    }
  }, [isOpen, selectedHour, selectedMinute, HOURS, MINUTES]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const confirmSelection = useCallback(() => {
    onChange({ target: { value: `${selectedHour}:${selectedMinute}` } });
    setIsOpen(false);
  }, [selectedHour, selectedMinute, onChange]);

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className={`
          flex items-center justify-between w-full
          px-3 py-2
          bg-background border border-input rounded-lg
          text-sm text-left
          hover:border-ring
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          transition-colors
          ${!value ? 'text-muted-foreground' : 'text-foreground'}
          ${className}
        `}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Zeit auswählen"
      >
        <span className="flex-1 truncate">
          {value || placeholder}
        </span>
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {/* Time Picker Modal */}
      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Zeit-Auswahl"
        >
          <div 
            className="bg-card border border-border w-full max-w-sm rounded-t-xl sm:rounded-xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Zeit wählen</h3>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            
            {/* Time Selection Display */}
            <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-secondary/30 rounded-lg">
              <span className="text-4xl font-bold tabular-nums">{selectedHour}</span>
              <span className="text-4xl font-bold text-muted-foreground">:</span>
              <span className="text-4xl font-bold tabular-nums">{selectedMinute}</span>
            </div>

            {/* Scrollable Time Pickers */}
            <div className="flex justify-center gap-4 mb-6 h-48">
              {/* Hours Column */}
              <div className="flex flex-col items-center w-20">
                <span className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Std
                </span>
                <div 
                  ref={hourScrollRef}
                  className="w-full h-full overflow-y-auto snap-y snap-mandatory rounded-lg bg-secondary/30 border border-border scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                  role="listbox"
                  aria-label="Stunden"
                >
                  {HOURS.map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSelectedHour(h)}
                      role="option"
                      aria-selected={selectedHour === h}
                      className={`
                        w-full h-10 
                        flex items-center justify-center 
                        snap-center
                        text-sm font-medium tabular-nums
                        transition-all duration-200
                        ${selectedHour === h 
                          ? 'bg-primary text-primary-foreground font-bold scale-110 shadow-sm' 
                          : 'hover:bg-secondary hover:scale-105'
                        }
                      `}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div className="flex items-center text-2xl font-bold text-muted-foreground pb-6">
                :
              </div>

              {/* Minutes Column */}
              <div className="flex flex-col items-center w-20">
                <span className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Min
                </span>
                <div 
                  ref={minuteScrollRef}
                  className="w-full h-full overflow-y-auto snap-y snap-mandatory rounded-lg bg-secondary/30 border border-border scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
                  role="listbox"
                  aria-label="Minuten"
                >
                  {MINUTES.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMinute(m)}
                      role="option"
                      aria-selected={selectedMinute === m}
                      className={`
                        w-full h-10 
                        flex items-center justify-center 
                        snap-center
                        text-sm font-medium tabular-nums
                        transition-all duration-200
                        ${selectedMinute === m 
                          ? 'bg-primary text-primary-foreground font-bold scale-110 shadow-sm' 
                          : 'hover:bg-secondary hover:scale-105'
                        }
                      `}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer: Action Buttons */}
            <footer className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={handleClose} 
                className="px-4 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Abbrechen
              </button>
              <button 
                type="button"
                onClick={confirmSelection} 
                className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Übernehmen
              </button>
            </footer>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}