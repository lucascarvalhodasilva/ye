"use client";
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

export default function CustomDatePicker({ value, onChange, className = "", min, placeholder = "TT.MM.JJJJ", clearable = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [previewDate, setPreviewDate] = useState(null); // Temporarily selected date

  // Initialize component and sync viewDate with value
  useEffect(() => {
    setMounted(true);
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        setViewDate(new Date(y, m - 1, d));
      }
    }
  }, [value]);

  // Reset preview when opening
  useEffect(() => {
    if (isOpen) {
      setPreviewDate(null);
    }
  }, [isOpen]);

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

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

  const handlePrevMonth = useCallback((e) => {
    e.stopPropagation();
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback((e) => {
    e.stopPropagation();
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleDayClick = useCallback((day) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateString = `${y}-${m}-${d}`;
    
    // Check if date is before minimum allowed date
    if (min && dateString < min) return;

    // Set as preview instead of immediately selecting
    setPreviewDate(dateString);
  }, [viewDate, min]);

  const handleConfirm = useCallback(() => {
    if (previewDate) {
      onChange({ target: { value: previewDate } });
      setIsOpen(false);
      setPreviewDate(null);
    }
  }, [previewDate, onChange]);

  const handleClear = useCallback(() => {
    onChange({ target: { value: '' } });
    setIsOpen(false);
    setPreviewDate(null);
  }, [onChange]);

  // Calendar calculations
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  // Adjust for Monday start (German standard: Monday = 0, Sunday = 6)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const displayValue = value 
    ? new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
    : "";

  // Format preview date for display
  const previewDisplayValue = previewDate 
    ? new Date(previewDate).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
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
        aria-label="Datum auswählen"
      >
        <span className="flex-1 truncate">
          {displayValue || placeholder}
        </span>
        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {/* Calendar Modal */}
      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Kalender"
        >
          <div 
            className="bg-card border border-border w-full max-w-sm rounded-t-xl sm:rounded-xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            
            {/* Header: Month Navigation */}
            <header className="flex items-center justify-between mb-6">
              <button 
                onClick={handlePrevMonth} 
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Vorheriger Monat"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="font-semibold text-lg">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h2>
              
              <button 
                onClick={handleNextMonth} 
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Nächster Monat"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </header>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2" role="row">
              {WEEKDAYS.map(day => (
                <div 
                  key={day} 
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                  role="columnheader"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1" role="grid">
              {/* Empty cells for offset */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} role="gridcell" aria-hidden="true" />
              ))}
              
              {/* Day buttons */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const currentY = viewDate.getFullYear();
                const currentM = String(viewDate.getMonth() + 1).padStart(2, '0');
                const currentD = String(day).padStart(2, '0');
                const dateStr = `${currentY}-${currentM}-${currentD}`;
                
                const isSelected = value === dateStr;
                const isPreview = previewDate === dateStr;
                const isToday = new Date().toDateString() === new Date(currentY, viewDate.getMonth(), day).toDateString();
                const isDisabled = min && dateStr < min;

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDayClick(day)}
                    role="gridcell"
                    aria-label={`${day}. ${MONTHS[viewDate.getMonth()]} ${currentY}`}
                    aria-selected={isSelected || isPreview}
                    aria-disabled={isDisabled}
                    className={`
                      h-10 w-full rounded-lg
                      flex items-center justify-center
                      text-sm font-medium
                      transition-all duration-200
                      ${isPreview 
                        ? 'bg-primary !text-white shadow-lg scale-110 ring-2 ring-primary ring-offset-2 ring-offset-card' 
                        : ''
                      }
                      ${isSelected && !isPreview
                        ? 'bg-primary/20 text-primary font-bold' 
                        : ''
                      }
                      ${!isSelected && !isPreview && !isDisabled 
                        ? 'hover:bg-secondary hover:scale-105' 
                        : ''
                      }
                      ${isToday && !isSelected && !isPreview
                        ? 'ring-2 ring-primary/50 ring-inset font-bold' 
                        : ''
                      }
                      ${isDisabled 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'cursor-pointer'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer: Preview & Actions */}
            <footer className="mt-6 pt-4 border-t border-border space-y-3">
              {/* Preview Display */}
              {previewDate && (
                <div className="text-center py-2 px-3 bg-primary/10 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <p className="text-sm font-medium text-primary">{previewDisplayValue}</p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  Abbrechen
                </button>

                {/* Clear Button - only show when clearable and has value */}
                {clearable && value && !previewDate && (
                  <button 
                    type="button"
                    onClick={handleClear}
                    className="flex-1 py-3 text-center text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <X className="w-4 h-4" />
                    Löschen
                  </button>
                )}
                
                <button 
                  type="button"
                  onClick={handleConfirm}
                  disabled={!previewDate}
                  className={`
                    flex-1 py-3 text-center text-sm font-medium rounded-lg transition-all
                    flex items-center justify-center gap-2
                    ${previewDate 
                      ? 'bg-primary !text-white hover:bg-primary/90 shadow-md' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }
                  `}
                >
                  <Check className="w-4 h-4" />
                  Bestätigen
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