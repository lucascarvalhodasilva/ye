"use client";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function CustomDatePicker({ value, onChange, className = "", min }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        setViewDate(new Date(y, m - 1, d));
      }
    }
  }, [value]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateString = `${y}-${m}-${d}`;
    
    if (min && dateString < min) return;

    onChange({ target: { value: dateString } });
    setIsOpen(false);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 = Sun
  // Adjust for Monday start (German standard)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const displayValue = value ? new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "";

  return (
    <>
      <div onClick={toggleOpen} className={`relative flex items-center cursor-pointer ${className}`}>
        <div className={`flex-1 truncate ${!value ? 'text-muted-foreground' : ''}`}>
          {displayValue || "TT.MM.JJJJ"}
        </div>
        <svg className="w-4 h-4 text-muted-foreground ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-card border border-border w-full max-w-sm sm:rounded-xl rounded-t-xl p-4 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-200" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-secondary rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="font-semibold text-lg">
                {months[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button onClick={handleNextMonth} className="p-2 hover:bg-secondary rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const currentY = viewDate.getFullYear();
                const currentM = String(viewDate.getMonth() + 1).padStart(2, '0');
                const currentD = String(day).padStart(2, '0');
                const dateStr = `${currentY}-${currentM}-${currentD}`;
                const isSelected = value === dateStr;
                const isToday = new Date().toDateString() === new Date(currentY, viewDate.getMonth(), day).toDateString();
                const isDisabled = min && dateStr < min;

                return (
                  <button
                    key={day}
                    disabled={isDisabled}
                    onClick={() => handleDayClick(day)}
                    className={`
                      h-10 w-full rounded-lg flex items-center justify-center text-sm font-medium transition-all
                      ${isSelected ? 'bg-primary text-primary-foreground shadow-md' : ''}
                      ${!isSelected && !isDisabled ? 'hover:bg-secondary' : ''}
                      ${isToday && !isSelected ? 'text-primary border border-primary/50' : ''}
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <button onClick={() => setIsOpen(false)} className="w-full mt-4 py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground">
              Abbrechen
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
