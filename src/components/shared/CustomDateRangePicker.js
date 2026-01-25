"use client";
import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

const CustomDateRangePicker = forwardRef(function CustomDateRangePicker({ 
  startDate, 
  endDate, 
  onChangeStart, 
  onChangeEnd, 
  className = "", 
  min,
  placeholder = "Zeitraum wählen",
  clearable = false,
  // Control props for external trigger
  isOpen: controlledIsOpen,
  onOpenChange,
  initialMode = 'start', // 'start' or 'end'
  showTrigger = true, // Whether to show the default trigger button
}, ref) {
  // Internal state for uncontrolled mode
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Determine if controlled or uncontrolled
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalIsOpen;

  const [viewDate, setViewDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  
  // Selection state: 'start' or 'end'
  const [selectionMode, setSelectionMode] = useState(initialMode);
  const [previewStart, setPreviewStart] = useState(null);
  const [previewEnd, setPreviewEnd] = useState(null);
  const [pendingMode, setPendingMode] = useState(null); // Track mode set via ref.open()

  // Expose open method via ref
  useImperativeHandle(ref, () => ({
    open: (mode = 'start') => {
      setPendingMode(mode);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
  }), [setIsOpen]);

  // Initialize component
  useEffect(() => {
    setMounted(true);
    if (startDate) {
      const [y, m, d] = startDate.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        setViewDate(new Date(y, m - 1, d));
      }
    }
  }, []);

  // Reset preview when opening
  useEffect(() => {
    if (isOpen) {
      setPreviewStart(startDate || null);
      setPreviewEnd(endDate || null);
      
      // Use pending mode from ref.open() call, or default logic
      if (pendingMode) {
        setSelectionMode(pendingMode);
        setPendingMode(null);
      } else if (!isControlled) {
        setSelectionMode(startDate ? 'end' : 'start');
      }
      
      // Set view to relevant date based on the mode we're opening with
      const modeToUse = pendingMode || selectionMode;
      const relevantDate = modeToUse === 'end' && endDate ? endDate : startDate;
      if (relevantDate) {
        const [y, m, d] = relevantDate.split('-').map(Number);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          setViewDate(new Date(y, m - 1, d));
        }
      }
    }
  }, [isOpen, startDate, endDate]);

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

    if (selectionMode === 'start') {
      setPreviewStart(dateString);
      // If new start is after current end, reset end
      if (previewEnd && dateString > previewEnd) {
        setPreviewEnd(null);
      }
      setSelectionMode('end');
    } else {
      // End date selection
      if (previewStart && dateString < previewStart) {
        // If selected date is before start, make it the new start
        setPreviewStart(dateString);
        setPreviewEnd(null);
        setSelectionMode('end');
      } else {
        setPreviewEnd(dateString);
      }
    }
  }, [viewDate, min, selectionMode, previewStart, previewEnd]);

  const handleConfirm = useCallback(() => {
    if (previewStart) {
      onChangeStart({ target: { value: previewStart } });
    }
    if (previewEnd) {
      onChangeEnd({ target: { value: previewEnd } });
    } else if (previewStart && !previewEnd) {
      // If only start selected, use same date for end
      onChangeEnd({ target: { value: previewStart } });
    }
    setIsOpen(false);
  }, [previewStart, previewEnd, onChangeStart, onChangeEnd]);

  const handleClear = useCallback(() => {
    onChangeStart({ target: { value: '' } });
    onChangeEnd({ target: { value: '' } });
    setPreviewStart(null);
    setPreviewEnd(null);
    setSelectionMode('start');
    setIsOpen(false);
  }, [onChangeStart, onChangeEnd]);

  const handleSelectStart = useCallback(() => {
    setSelectionMode('start');
  }, []);

  const handleSelectEnd = useCallback(() => {
    if (previewStart) {
      setSelectionMode('end');
    }
  }, [previewStart]);

  // Calendar calculations
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  // Format dates for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Display value for trigger button
  const displayValue = startDate && endDate 
    ? `${formatDate(startDate)} – ${formatDate(endDate)}`
    : startDate 
      ? formatDate(startDate)
      : "";

  // Check if a date is in the range
  const isInRange = (dateStr) => {
    if (!previewStart || !previewEnd) return false;
    return dateStr > previewStart && dateStr < previewEnd;
  };

  return (
    <>
      {/* Trigger Button - only show if showTrigger is true */}
      {showTrigger && (
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
            ${!startDate ? 'text-muted-foreground' : 'text-foreground'}
            ${className}
          `}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Zeitraum auswählen"
        >
          <span className="flex-1 truncate">
            {displayValue || placeholder}
          </span>
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      )}

      {/* Calendar Modal */}
      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Kalender Zeitraum"
        >
          <div 
            className="bg-card border border-border w-full max-w-sm rounded-t-xl sm:rounded-xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            
            {/* Range Selection Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={handleSelectStart}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${selectionMode === 'start' 
                    ? 'bg-primary !text-white shadow-md' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }
                `}
              >
                <div className="text-xs opacity-70 mb-0.5">Von</div>
                <div>{previewStart ? formatDateLong(previewStart) : '—'}</div>
              </button>
              <button
                type="button"
                onClick={handleSelectEnd}
                disabled={!previewStart}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${selectionMode === 'end' 
                    ? 'bg-primary !text-white shadow-md' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }
                  ${!previewStart ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="text-xs opacity-70 mb-0.5">Bis</div>
                <div>{previewEnd ? formatDateLong(previewEnd) : '—'}</div>
              </button>
            </div>

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
                
                const isStart = previewStart === dateStr;
                const isEnd = previewEnd === dateStr;
                const isRangeMiddle = isInRange(dateStr);
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
                    aria-selected={isStart || isEnd}
                    aria-disabled={isDisabled}
                    className={`
                      h-10 w-full rounded-lg
                      flex items-center justify-center
                      text-sm font-medium
                      transition-all duration-200
                      ${isStart 
                        ? 'bg-primary !text-white rounded-r-none shadow-md z-10' 
                        : ''
                      }
                      ${isEnd 
                        ? 'bg-primary !text-white rounded-l-none shadow-md z-10' 
                        : ''
                      }
                      ${isStart && isEnd 
                        ? 'rounded-lg' 
                        : ''
                      }
                      ${isRangeMiddle 
                        ? 'bg-primary/20 text-primary rounded-none' 
                        : ''
                      }
                      ${!isStart && !isEnd && !isRangeMiddle && !isDisabled 
                        ? 'hover:bg-secondary hover:scale-105' 
                        : ''
                      }
                      ${isToday && !isStart && !isEnd && !isRangeMiddle
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

            {/* Footer: Actions */}
            <footer className="mt-6 pt-4 border-t border-border space-y-3">
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  Abbrechen
                </button>

                {/* Clear Button */}
                {clearable && (startDate || endDate) && (
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
                  disabled={!previewStart}
                  className={`
                    flex-1 py-3 text-center text-sm font-medium rounded-lg transition-all
                    flex items-center justify-center gap-2
                    ${previewStart 
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
});

export default CustomDateRangePicker;
