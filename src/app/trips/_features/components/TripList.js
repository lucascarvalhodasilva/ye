import React, { useEffect, useState, useRef } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/ConfirmationModal';

/**
 * @typedef {Object} MealEntry
 * @property {number|string} id - Unique identifier
 * @property {string} date - Start date
 * @property {string} [endDate] - End date for multi-day trips
 * @property {number} deductible - Deductible meal amount
 * @property {string} [destination] - Trip destination
 * @property {string} [purpose] - Trip purpose
 */

/**
 * @typedef {Object} MileageEntry
 * @property {number|string} id - Unique identifier
 * @property {string} date - Entry date
 * @property {number} [allowance] - Mileage allowance amount
 * @property {string} [vehicleType] - Type of vehicle used
 * @property {string} [receiptFileName] - Receipt file name if available
 * @property {number|string} [relatedMealId] - Related meal entry ID
 * @property {string} [purpose] - Trip purpose
 */

/**
 * @typedef {Object} TripListProps
 * @property {MealEntry[]} filteredMealEntries - Filtered meal entries for the selected year
 * @property {MileageEntry[]} mileageEntries - All mileage entries
 * @property {Function} handleDeleteEntry - Function to delete an entry
 * @property {string|number} selectedYear - Currently selected year
 * @property {Function} setIsFullScreen - Function to toggle fullscreen view
 * @property {number|string|null} highlightId - ID of entry to highlight
 * @property {Function} handleViewReceipt - Function to view a receipt
 * @property {Function} [onEdit] - Function to edit an entry
 * @property {Function} [onAddTrip] - Function to add a new trip
 */

/**
 * Displays a list of trips with swipe-to-reveal actions for edit and delete.
 * Shows trip dates, destinations, and calculated deductible amounts.
 * 
 * @param {TripListProps} props - Component props
 * @returns {JSX.Element} The rendered trip list
 */
export default function TripList({ 
  filteredMealEntries, 
  mileageEntries, 
  handleDeleteEntry, 
  selectedYear, 
  setIsFullScreen, 
  highlightId, 
  handleViewReceipt,
  onEdit,
  onAddTrip
}) {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, entry: null });
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const swipeState = useRef({ id: null, startX: 0, translateX: 0, dragging: false });
  
  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`trip-row-${highlightId}`);
      const innerElement = document.getElementById(`swipe-inner-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (innerElement) {
          innerElement.classList.add('transition-all', 'duration-300', 'ease-in-out');
          const flash = () => {
            innerElement.classList.add('scale-[1.02]');
            innerElement.classList.add('ring-2', 'ring-primary/50');
            setTimeout(() => {
              innerElement.classList.remove('scale-[1.02]');
              innerElement.classList.remove('ring-2', 'ring-primary/50');
            }, 300);
          };
          
          flash();
          setTimeout(flash, 600);
        }
      }
    }
  }, [highlightId, filteredMealEntries]);

  const handlePointerDown = (e, id) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    swipeState.current = { id, startX: clientX, translateX: 0, dragging: true };
  };

  const handlePointerMove = (e) => {
    if (!swipeState.current.dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let delta = clientX - swipeState.current.startX;
    if (delta > 0) delta = 0;
    const maxSwipe = -actionsWidth;
    if (delta < maxSwipe) delta = maxSwipe;
    swipeState.current.translateX = delta;
    const el = document.getElementById(`swipe-inner-${swipeState.current.id}`);
    if (el) {
      el.style.transform = `translateX(${delta}px)`;
    }
  };

  const handlePointerUp = () => {
    if (!swipeState.current.dragging) return;
    const shouldOpen = swipeState.current.translateX < -(actionsWidth / 3);
    const id = swipeState.current.id;
    setOpenSwipeId(shouldOpen ? id : null);
    const el = document.getElementById(`swipe-inner-${id}`);
    if (el) {
      el.style.transform = `translateX(${shouldOpen ? -actionsWidth : 0}px)`;
    }
    swipeState.current = { id: null, startX: 0, translateX: 0, dragging: false };
  };

  useEffect(() => {
    const onPointerUp = () => handlePointerUp();
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    return () => {
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, []);

  const actionsWidth = 170;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Fahrtenbuch</h2>
            <p className="text-[10px] text-muted-foreground">{filteredMealEntries.length} Einträge in {selectedYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-all border border-border/50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Vollbild
          </button>
          {onAddTrip && (
            <button 
              onClick={onAddTrip}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary hover:bg-primary/90 text-xs font-medium text-primary-foreground transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Hinzufügen
            </button>
          )}
        </div>
      </div>

      {/* Trip List */}
      <div className="divide-y divide-border/30">
        {filteredMealEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Keine Einträge für {selectedYear}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Fügen Sie Ihre erste Dienstreise hinzu</p>
          </div>
        ) : (
          filteredMealEntries.map((entry, index) => {
            const isMultiDay = entry.endDate && entry.endDate !== entry.date;
            
            // Calculate totals (prioritize relatedMealId, fallback to date)
            const relatedMileage = mileageEntries.filter(m => m.relatedMealId === entry.id);
            const dayMileage = relatedMileage.length > 0
              ? relatedMileage
              : mileageEntries.filter(m => m.date === entry.date || m.date === entry.endDate);

            const tripTo = dayMileage.find(m => m.purpose && m.purpose.includes('Beginn'));
            const tripFrom = dayMileage.find(m => m.purpose && m.purpose.includes('Ende'));
            
            const amountTo = tripTo ? tripTo.allowance : 0;
            const amountFrom = tripFrom ? tripFrom.allowance : 0;
            
            // Find public transport entries for this trip
            const publicTransportEntries = dayMileage.filter(m => m.vehicleType === 'public_transport');
            const publicTransportSum = publicTransportEntries.reduce((sum, m) => sum + (m.allowance || 0), 0);
            
            const mileageSum = amountTo + amountFrom + publicTransportSum;
            const totalDeductible = entry.deductible + mileageSum;

            const isOpen = openSwipeId === entry.id;

            return (
              <div 
                key={entry.id}
                id={`trip-row-${entry.id}`}
                className="relative overflow-hidden bg-transparent"
                onMouseDown={(e) => handlePointerDown(e, entry.id)}
                onTouchStart={(e) => handlePointerDown(e, entry.id)}
                onMouseMove={handlePointerMove}
                onTouchMove={handlePointerMove}
              >
                {/* Swipe Actions */}
                <div 
                  className="absolute top-0 right-0 h-full flex items-stretch z-0"
                  style={{ width: `${actionsWidth}px` }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenSwipeId(null); onEdit && onEdit(entry); }}
                    className="w-1/2 bg-slate-600/90 hover:bg-slate-500/90 text-white transition-all flex items-center justify-center active:scale-95"
                    aria-label="Eintrag bearbeiten"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setOpenSwipeId(null); 
                      setDeleteConfirmation({ isOpen: true, entry }); 
                    }}
                    className="w-1/2 bg-rose-500/80 hover:bg-rose-400/80 text-white transition-all flex items-center justify-center active:scale-95"
                    aria-label="Eintrag löschen"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>

                {/* Card Content */}
                <div
                  id={`swipe-inner-${entry.id}`}
                  className="relative p-4 transition-transform duration-200 bg-card z-10"
                  onMouseUp={handlePointerUp}
                  onTouchEnd={handlePointerUp}
                >
                  <div className="flex items-center gap-4">
                    {/* Date Badge */}
                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                      isMultiDay 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-white/60 dark:bg-white/5 text-foreground'
                    }`}>
                      <span className="text-lg font-bold leading-none">
                        {new Date(entry.date).getDate()}
                      </span>
                      <span className="text-[10px] uppercase font-medium mt-0.5 opacity-70">
                        {new Date(entry.date).toLocaleDateString('de-DE', { month: 'short' })}
                      </span>
                    </div>

                    {/* Trip Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {entry.destination || formatDate(entry.date)}
                        </h3>
                        {isMultiDay && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">
                            {Math.ceil((new Date(entry.endDate) - new Date(entry.date)) / (1000 * 60 * 60 * 24))} {Math.ceil((new Date(entry.endDate) - new Date(entry.date)) / (1000 * 60 * 60 * 24)) === 1 ? 'Nacht' : 'Nächte'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(entry.date)}</span>
                        {isMultiDay && (
                          <>
                            <span>→</span>
                            <span>{formatDate(entry.endDate)}</span>
                          </>
                        )}
                      </div>

                      {entry.purpose && (
                        <p className="text-[11px] text-muted-foreground/70 mt-1 truncate">{entry.purpose}</p>
                      )}
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        +{totalDeductible.toFixed(2)} €
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {/* Breakdown Badges */}
                        {entry.deductible > 0 && (
                          <span className="text-[9px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded">
                            V: {entry.deductible.toFixed(0)}€
                          </span>
                        )}
                        {mileageSum > 0 && (
                          <span className="text-[9px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded">
                            F: {mileageSum.toFixed(0)}€
                          </span>
                        )}
                        
                        {/* Receipt Button */}
                        {publicTransportEntries.some(m => m.receiptFileName) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const withReceipt = publicTransportEntries.find(m => m.receiptFileName);
                              if (withReceipt) handleViewReceipt(withReceipt.receiptFileName);
                            }}
                            className="w-6 h-6 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
                            aria-label="Beleg ansehen"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      {filteredMealEntries.length > 0 && (
        <div className="p-3 bg-muted/20 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/60 text-center">
            ← Nach links wischen zum Bearbeiten oder Löschen
          </p>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, entry: null })}
        onConfirm={() => {
          if (deleteConfirmation.entry) {
            handleDeleteEntry(
              deleteConfirmation.entry.id, 
              deleteConfirmation.entry.date, 
              deleteConfirmation.entry.endDate
            );
          }
        }}
        title="Eintrag löschen"
        message={deleteConfirmation.entry ? `Möchten Sie den Eintrag vom ${formatDate(deleteConfirmation.entry.date)} wirklich löschen?` : ''}
      />
    </div>
  );
}
