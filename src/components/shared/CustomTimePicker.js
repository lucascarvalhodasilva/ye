"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, X, Check } from 'lucide-react';

export default function CustomTimePicker({ value, onChange, className = "", placeholder = "--:--" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedHour, setSelectedHour] = useState('00');
  const [selectedMinute, setSelectedMinute] = useState('00');
  
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const hourScrollTimeoutRef = useRef(null);
  const minuteScrollTimeoutRef = useRef(null);

  // Generate time options
  const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 5-minute steps

  const ITEM_HEIGHT = 44; // h-11 = 44px
  const SPACER_HEIGHT = 52; // Top spacer height

  // Initialize component
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync selected values with prop value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(h);
      // Round minute to nearest 5
      const roundedMin = String(Math.round(parseInt(m) / 5) * 5).padStart(2, '0');
      setSelectedMinute(roundedMin === '60' ? '55' : roundedMin);
    }
  }, [value]);

  // Auto-scroll to selected values when modal opens
  useEffect(() => {
    if (isOpen && hourScrollRef.current && minuteScrollRef.current) {
      const hourIndex = HOURS.indexOf(selectedHour);
      const minuteIndex = MINUTES.indexOf(selectedMinute);
      
      // Center the selected item
      if (hourIndex !== -1) {
        const scrollTop = hourIndex * ITEM_HEIGHT;
        hourScrollRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
      if (minuteIndex !== -1) {
        const scrollTop = minuteIndex * ITEM_HEIGHT;
        minuteScrollRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }
  }, [isOpen, selectedHour, selectedMinute, HOURS, MINUTES]);

  // Auto-select hour after scroll stops
  const handleHourScroll = useCallback(() => {
    if (hourScrollTimeoutRef.current) {
      clearTimeout(hourScrollTimeoutRef.current);
    }
    
    hourScrollTimeoutRef.current = setTimeout(() => {
      if (hourScrollRef.current) {
        const scrollTop = hourScrollRef.current.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, HOURS.length - 1));
        const newHour = HOURS[clampedIndex];
        
        if (newHour !== selectedHour) {
          setSelectedHour(newHour);
        }
        
        // Snap to exact position
        hourScrollRef.current.scrollTo({ 
          top: clampedIndex * ITEM_HEIGHT, 
          behavior: 'smooth' 
        });
      }
    }, 150);
  }, [HOURS, selectedHour]);

  // Auto-select minute after scroll stops
  const handleMinuteScroll = useCallback(() => {
    if (minuteScrollTimeoutRef.current) {
      clearTimeout(minuteScrollTimeoutRef.current);
    }
    
    minuteScrollTimeoutRef.current = setTimeout(() => {
      if (minuteScrollRef.current) {
        const scrollTop = minuteScrollRef.current.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, MINUTES.length - 1));
        const newMinute = MINUTES[clampedIndex];
        
        if (newMinute !== selectedMinute) {
          setSelectedMinute(newMinute);
        }
        
        // Snap to exact position
        minuteScrollRef.current.scrollTo({ 
          top: clampedIndex * ITEM_HEIGHT, 
          behavior: 'smooth' 
        });
      }
    }, 150);
  }, [MINUTES, selectedMinute]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (hourScrollTimeoutRef.current) clearTimeout(hourScrollTimeoutRef.current);
      if (minuteScrollTimeoutRef.current) clearTimeout(minuteScrollTimeoutRef.current);
    };
  }, []);

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
  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Reset to value or default when closing without confirming
    if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(h);
      const roundedMin = String(Math.round(parseInt(m) / 5) * 5).padStart(2, '0');
      setSelectedMinute(roundedMin === '60' ? '55' : roundedMin);
    } else {
      setSelectedHour('00');
      setSelectedMinute('00');
    }
  }, [value]);

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
          px-3 py-2.5
          bg-card border border-border/50 rounded-lg
          text-sm text-left
          hover:border-primary/50
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent
          transition-all duration-200
          ${!value ? 'text-muted-foreground' : 'text-foreground'}
          ${className}
        `}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Zeit auswählen"
      >
        <span className="flex-1 truncate font-medium">
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
            className="bg-card/95 backdrop-blur-md border border-border/50 w-full max-w-xs rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 fade-in duration-300 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-xs font-semibold text-foreground">Zeit wählen</h3>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-md bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Schließen"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </header>

            {/* Scrollable Time Pickers */}
            <div className="p-4">
              <div className="flex justify-center gap-2 h-40 relative">
                {/* Selection Indicator */}
                <div className="absolute inset-x-4 top-[calc(50%+8px)] -translate-y-1/2 h-11 bg-primary/10 rounded-lg border border-primary/20 pointer-events-none z-0" />
                
                {/* Hours Column */}
                <div className="flex flex-col items-center flex-1 max-w-20 relative z-10">
                  <span className="text-[9px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Std
                  </span>
                  <div 
                    ref={hourScrollRef}
                    onScroll={handleHourScroll}
                    className="w-full flex-1 overflow-y-auto snap-y snap-mandatory rounded-lg no-scrollbar"
                    role="listbox"
                    aria-label="Stunden"
                  >
                    <div className="h-[52px]" /> {/* Top spacer */}
                    {HOURS.map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSelectedHour(h)}
                        role="option"
                        aria-selected={selectedHour === h}
                        className={`
                          w-full h-11 
                          flex items-center justify-center 
                          snap-center
                          text-base tabular-nums
                          transition-all duration-200
                          ${selectedHour === h 
                            ? 'text-primary font-bold scale-105' 
                            : 'text-muted-foreground/60 hover:text-foreground'
                          }
                        `}
                      >
                        {h}
                      </button>
                    ))}
                    <div className="h-[52px]" /> {/* Bottom spacer */}
                  </div>
                </div>

                {/* Separator */}
                <div className="flex items-center justify-center w-6 relative z-10">
                  <span className="text-xl font-bold text-primary/40">:</span>
                </div>

                {/* Minutes Column */}
                <div className="flex flex-col items-center flex-1 max-w-20 relative z-10">
                  <span className="text-[9px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Min
                  </span>
                  <div 
                    ref={minuteScrollRef}
                    onScroll={handleMinuteScroll}
                    className="w-full flex-1 overflow-y-auto snap-y snap-mandatory rounded-lg no-scrollbar"
                    role="listbox"
                    aria-label="Minuten"
                  >
                    <div className="h-[52px]" /> {/* Top spacer */}
                    {MINUTES.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMinute(m)}
                        role="option"
                        aria-selected={selectedMinute === m}
                        className={`
                          w-full h-11 
                          flex items-center justify-center 
                          snap-center
                          text-base tabular-nums
                          transition-all duration-200
                          ${selectedMinute === m 
                            ? 'text-primary font-bold scale-105' 
                            : 'text-muted-foreground/60 hover:text-foreground'
                          }
                        `}
                      >
                        {m}
                      </button>
                    ))}
                    <div className="h-[52px]" /> {/* Bottom spacer */}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer: Action Buttons */}
            <footer className="p-3 border-t border-border/50 bg-muted/30">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={handleClose} 
                  className="px-3 py-2.5 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-foreground rounded-lg text-sm font-medium transition-all border border-border/50"
                >
                  Abbrechen
                </button>
                <button 
                  type="button"
                  onClick={confirmSelection} 
                  className="px-3 py-2.5 bg-primary hover:bg-primary/90 !text-white rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  OK
                </button>
              </div>
            </footer>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}