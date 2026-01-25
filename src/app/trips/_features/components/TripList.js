import React, { useEffect, useState, useRef, useMemo } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/shared/ConfirmationModal';

export default function TripList({ 
  tripEntries, 
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
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const swipeState = useRef({ id: null, startX: 0, translateX: 0, dragging: false });

  const toggleMonth = (key) => {
    setCollapsedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Group entries by month for separators
  const entriesByMonth = useMemo(() => {
    const filtered = searchQuery 
      ? tripEntries.filter(entry => 
          (entry.destination || entry.purpose || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      : tripEntries;
    
    const grouped = {};
    filtered.forEach(entry => {
      const date = new Date(entry.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[key]) {
        grouped[key] = {
          month: date.toLocaleDateString('de-DE', { month: 'long' }),
          year: date.getFullYear(),
          entries: []
        };
      }
      grouped[key].entries.push(entry);
    });
    // Sort by date descending (newest first)
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, value]) => value);
  }, [tripEntries, searchQuery]);
  
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
  }, [highlightId, tripEntries]);

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

  const actionsWidth = 120;

  // Render a single trip entry
  const renderTripEntry = (entry) => {
    const isMultiDay = entry.endDate && entry.endDate !== entry.date;
    
    const relatedMileage = mileageEntries.filter(m => m.relatedTripId === entry.id);
    const dayMileage = relatedMileage.length > 0
      ? relatedMileage
      : mileageEntries.filter(m => m.date === entry.date || m.date === entry.endDate);

    const tripTo = dayMileage.find(m => m.purpose && m.purpose.includes('Beginn'));
    const tripFrom = dayMileage.find(m => m.purpose && m.purpose.includes('Ende'));
    
    const amountTo = tripTo ? tripTo.allowance : 0;
    const amountFrom = tripFrom ? tripFrom.allowance : 0;
    
    const publicTransportEntries = dayMileage.filter(m => m.vehicleType === 'public_transport');
    const publicTransportSum = publicTransportEntries.reduce((sum, m) => sum + (m.allowance || 0), 0);
    
    const mileageSum = amountTo + amountFrom + publicTransportSum;
    const totalDeductible = (entry.deductible || 0) + mileageSum;

    return (
      <div 
        key={entry.id}
        id={`trip-row-${entry.id}`}
        className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/30"
        onMouseDown={(e) => handlePointerDown(e, entry.id)}
        onTouchStart={(e) => handlePointerDown(e, entry.id)}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      >
        {/* Swipe Actions */}
        <div 
          className="absolute top-0 right-0 h-full flex items-center justify-end gap-2 pr-3 z-0"
          style={{ width: `${actionsWidth}px` }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setOpenSwipeId(null); onEdit && onEdit(entry); }}
            className="w-11 h-11 bg-indigo-500 hover:bg-indigo-600 text-white transition-all flex items-center justify-center active:scale-95 rounded-xl"
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
            className="w-11 h-11 bg-rose-500 hover:bg-rose-600 text-white transition-all flex items-center justify-center active:scale-95 rounded-xl"
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
          className="relative p-4 transition-transform duration-200 bg-card z-10 rounded-2xl"
          onMouseUp={handlePointerUp}
          onTouchEnd={handlePointerUp}
        >
          <div className="flex items-center gap-4">
            {/* Date Badge */}
            <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 bg-primary/10 text-primary">
              <span className="text-base font-bold leading-none">
                {new Date(entry.date).getDate()}
              </span>
              <span className="text-[9px] uppercase font-medium mt-0.5 opacity-70">
                {new Date(entry.date).toLocaleDateString('de-DE', { month: 'short' })}
              </span>
            </div>

            {/* Trip Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-foreground truncate">
                  {entry.destination || entry.purpose || 'Dienstreise'}
                </span>
                {isMultiDay && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">
                    {Math.ceil((new Date(entry.endDate) - new Date(entry.date)) / (1000 * 60 * 60 * 24))} {Math.ceil((new Date(entry.endDate) - new Date(entry.date)) / (1000 * 60 * 60 * 24)) === 1 ? 'Nacht' : 'Nächte'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(entry.date)}</span>
                {isMultiDay && (
                  <>
                    <span>→</span>
                    <span>{formatDate(entry.endDate)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                +{totalDeductible.toFixed(2)} €
              </span>
              
              <div className="flex items-center gap-1">
                {(entry.deductible || 0) > 0 && (
                  <span className="text-[9px] text-muted-foreground">
                    V: {(entry.deductible || 0).toFixed(0)}€
                  </span>
                )}
                {mileageSum > 0 && (
                  <span className="text-[9px] text-muted-foreground">
                    F: {mileageSum.toFixed(0)}€
                  </span>
                )}
                
                {publicTransportEntries.some(m => m.receiptFileName) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const withReceipt = publicTransportEntries.find(m => m.receiptFileName);
                      if (withReceipt) handleViewReceipt(withReceipt.receiptFileName);
                    }}
                    className="w-6 h-6 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center ml-1"
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
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and Action Buttons */}
      <div className="flex items-center gap-3 pb-3 shrink-0">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-10 rounded-xl bg-white/60 dark:bg-white/5 border border-border/50 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button 
          onClick={() => setIsFullScreen(true)}
          className="w-12 h-12 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all border border-border/50 flex items-center justify-center shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        {onAddTrip && (
          <button 
            onClick={onAddTrip}
            className="h-12 px-5 rounded-xl bg-primary text-white transition-all shadow-sm flex items-center justify-center text-base font-medium"
          >
            Hinzufügen
          </button>
        )}
      </div>

      {/* Trip List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
        {tripEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Keine Einträge für {selectedYear}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Fügen Sie Ihre erste Dienstreise hinzu</p>
          </div>
        ) : (
          <>
            {entriesByMonth.map((monthGroup) => {
              const monthKey = `${monthGroup.year}-${monthGroup.month}`;
              const isCollapsed = collapsedMonths[monthKey];
              return (
                <div key={monthKey}>
                  {/* Month separator - clickable */}
                  <button
                    onClick={() => toggleMonth(monthKey)}
                    className="flex items-center gap-2 py-2 w-full text-left"
                  >
                    <svg 
                      className={`w-3 h-3 text-muted-foreground transition-transform ${isCollapsed ? '' : 'rotate-90'}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {monthGroup.month} {monthGroup.year}
                    </span>
                    <span className="text-xs text-muted-foreground/60">({monthGroup.entries.length})</span>
                    <div className="flex-1 h-px bg-border/50"></div>
                  </button>
                  
                  {/* Month entries */}
                  {!isCollapsed && (
                    <div className="space-y-2">
                      {monthGroup.entries.map(entry => renderTripEntry(entry))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

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
