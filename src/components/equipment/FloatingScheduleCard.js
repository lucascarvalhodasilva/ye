 import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { DEFAULT_TAX_RATES } from '@/constants/taxRates';

export default function FloatingScheduleCard({ 
  equipment, 
  open, 
  onClose, 
  schedule,
  selectedYear 
}) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(equipment);
  const [currentSchedule, setCurrentSchedule] = useState(schedule);
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle keyboard close (Escape key)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  
  // Handle equipment change - slide out and back in
  useEffect(() => {
    if (open && equipment) {
      if (currentEquipment && equipment.id !== currentEquipment.id) {
        // Different equipment - slide down, swap content, slide back up
        setIsVisible(false);
        setTimeout(() => {
          setCurrentEquipment(equipment);
          setCurrentSchedule(schedule);
          setTimeout(() => setIsVisible(true), 50);
        }, 300);
      } else if (!currentEquipment) {
        // First open
        setCurrentEquipment(equipment);
        setCurrentSchedule(schedule);
        setTimeout(() => setIsVisible(true), 50);
      } else {
        // Same equipment, just update schedule
        setCurrentSchedule(schedule);
        if (!isVisible) setIsVisible(true);
      }
    } else if (!open) {
      setIsVisible(false);
      // Reset after animation completes
      setTimeout(() => {
        setCurrentEquipment(null);
        setCurrentSchedule(null);
        setIsClosing(false);
        setDragY(0);
      }, 300);
    }
  }, [equipment, schedule, open]);
  
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.deltaY > 0) {
        setDragY(eventData.deltaY);
        setIsDragging(true);
      }
    },
    onSwiped: (eventData) => {
      if (eventData.deltaY > 50 || Math.abs(eventData.velocity) > 0.3) {
        // Mark as closing to enable smooth transition from current position
        setIsClosing(true);
        setIsDragging(false);
        // Use requestAnimationFrame to ensure the transition starts from current drag position
        requestAnimationFrame(() => {
          onClose();
        });
      } else {
        setIsDragging(false);
        setDragY(0);
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: true,
    delta: 10
  });

  if (!currentEquipment) return null;

  const scheduleData = currentSchedule || {};
  const isGWG = scheduleData.type === 'GWG';
  const gwgLimit = DEFAULT_TAX_RATES.gwgLimit;
  // Calculate years from schedule data or default to 3
  const depreciationYears = scheduleData.years?.length || 3;

  // Calculate transform: when closing, start from drag position and go to hidden
  const getTransform = () => {
    if (!isVisible && isClosing) {
      // Closing from drag - animate from dragY to off-screen
      return `translateY(calc(100% + 32px))`;
    }
    if (isVisible) {
      return `translateY(${dragY}px)`;
    }
    return `translateY(calc(100% + 32px))`;
  };

  return (
    <>
      {/* Floating Card */}
      <div
        {...handlers}
        className="fixed bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-4 z-[1200] overflow-hidden shadow-xl"
        style={{
          height: 'auto',
          transform: getTransform(),
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
      >
        {/* Drag Handle - Enhanced */}
        <div className="flex items-center justify-center mb-3">
          <div 
            className="w-12 h-[5px] bg-muted-foreground/40 rounded-full cursor-grab active:cursor-grabbing active:bg-muted-foreground/60"
            aria-label="Zum Schließen nach unten wischen"
            role="button"
            tabIndex={0}
          />
        </div>

        {/* Non-scrollable Content */}
        <div>
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {currentEquipment.name || 'Arbeitsmittel'}
            </h3>
          </div>
          
          {/* Status Chip */}
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            isGWG 
              ? 'bg-emerald-500/10 text-emerald-600' 
              : 'bg-amber-500/10 text-amber-600'
          }`}>
            {currentEquipment.status || (isGWG ? 'GWG' : 'AfA')}
          </span>
        </div>

        {/* Depreciation Schedule */}
        {scheduleData.years && scheduleData.years.length > 0 && (
          <div className="rounded-xl bg-white/60 dark:bg-white/5 border border-border/30 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/20">
              <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-foreground">Abschreibungsplan</span>
            </div>
            
            <div>
              {scheduleData.years.map((yearData, index) => (
                <div
                  key={yearData.year}
                  className={`flex items-center justify-between py-2 px-3 ${
                    index < scheduleData.years.length - 1 ? 'border-b border-border/20' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-foreground flex items-center gap-2">
                    {yearData.year}
                    {yearData.isCurrentYear && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary text-white font-medium">
                        AKTUELL
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    +{yearData.deduction.toFixed(2)} €
                  </div>
                </div>
              ))}
              
              {/* Restwert - Emphasized */}
              <div className="flex items-center justify-between py-2.5 px-3 bg-emerald-500/10">
                <div className="text-sm font-bold text-foreground">Restwert</div>
                <div className="flex items-center gap-1.5">
                  <div className="text-sm font-bold text-emerald-600">
                    {scheduleData.bookValue?.toFixed(2) || '0.00'} €
                  </div>
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </>
  );
}
