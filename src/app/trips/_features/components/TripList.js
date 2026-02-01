import React, { useEffect, useState, useMemo, useRef } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import SwipeableListItem from '@/components/shared/SwipeableListItem';
import ReceiptBadge from '@/components/shared/ReceiptBadge';
import FullScreenTableView from './FullScreenTableView';

export default function TripList({ 
  tripEntries, 
  handleDeleteEntry, 
  selectedYear, 
  setIsFullScreen, 
  highlightId, 
  handleViewReceipt,
  onEdit,
  onAddTrip,
  isFullScreen
}) {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, entry: null });
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTooltip, setShowAddTooltip] = useState(false);
  const addButtonRef = useRef(null);
  const tooltipRef = useRef(null);
  const [tooltipStyle, setTooltipStyle] = useState({});

  const hasOngoingTrip = useMemo(() =>
    tripEntries.some(entry => entry.isOngoing && new Date(entry.date).getFullYear() === selectedYear),
  [tripEntries, selectedYear]);

  // Hide tooltip when clicking outside
  useEffect(() => {
    if (!showAddTooltip) return;
    const handleClickOutside = (e) => {
      if (tooltipRef.current && tooltipRef.current.contains(e.target)) return;
      if (addButtonRef.current && addButtonRef.current.contains(e.target)) return;
      setShowAddTooltip(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddTooltip]);

  // Position tooltip to avoid viewport overflow
  useEffect(() => {
    if (!showAddTooltip) return;
    const placeTooltip = () => {
      const btn = addButtonRef.current;
      const tooltip = tooltipRef.current;
      if (!btn || !tooltip) return;

      const btnRect = btn.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth || 300;
      const viewportWidth = window.innerWidth;
      const padding = 16;

      let left = btnRect.left + btnRect.width / 2 - tooltipWidth / 2;
      left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding));
      const top = btnRect.bottom + 8;

      setTooltipStyle({ left: `${left}px`, top: `${top}px` });
    };

    placeTooltip();
    window.addEventListener('resize', placeTooltip);
    return () => window.removeEventListener('resize', placeTooltip);
  }, [showAddTooltip]);

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
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          element.classList.add('transition-all', 'duration-300', 'ease-in-out');
          const flash = () => {
            element.classList.add('scale-[1.02]');
            element.classList.add('ring-2', 'ring-primary/50');
            setTimeout(() => {
              element.classList.remove('scale-[1.02]');
              element.classList.remove('ring-2', 'ring-primary/50');
            }, 300);
          };
          
          flash();
          setTimeout(flash, 600);
        }, 100);
      }
    }
  }, [highlightId, tripEntries]);

  // Render a single trip entry
  const renderTripEntry = (entry) => {
    const isMultiDay = entry.endDate && entry.endDate !== entry.date;
    const isOngoing = entry.isOngoing;
    
    // Use nested transportRecords instead of filtering mileageEntries
    const transportRecords = entry.transportRecords || [];
    const transportSum = entry.sumTransportAllowances || 0;
    
    const totalMealAllowance = (entry.mealAllowance || 0) + transportSum;
    
    // Check if this entry has a receipt
    const publicTransportEntries = transportRecords.filter(m => m.vehicleType === 'public_transport');
    const hasReceipt = publicTransportEntries.some(m => m.receiptFileName);
    const receiptEntry = publicTransportEntries.find(m => m.receiptFileName);

    return (
      <SwipeableListItem
        key={entry.id}
        itemId={entry.id}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/30"
        hasReceipt={hasReceipt}
        onEdit={() => onEdit && onEdit(entry)}
        onDelete={() => setDeleteConfirmation({ isOpen: true, entry })}
        onViewReceipt={() => {
          if (receiptEntry) handleViewReceipt(receiptEntry.receiptFileName);
        }}
      >
        <div id={`trip-row-${entry.id}`} className="p-4 rounded-2xl">
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
                {hasReceipt && <ReceiptBadge />}
                {isOngoing && (
                  <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                    Laufend
                  </span>
                )}
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
              <span className={`text-base font-bold ${isOngoing ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isOngoing ? 'Offen' : `+${totalMealAllowance.toFixed(2)} €`}
              </span>
              
              <div className="flex items-center gap-1">
                {(entry.mealAllowance || 0) > 0 && !isOngoing && (
                  <span className="text-[9px] text-muted-foreground">
                    V: {(entry.mealAllowance || 0).toFixed(0)}€
                  </span>
                )}
                {transportSum > 0 && !isOngoing && (
                  <span className="text-[9px] text-muted-foreground">
                    F: {transportSum.toFixed(0)}€
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </SwipeableListItem>
    );
  };

  return (
    <>
      <FullScreenTableView
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        tripEntries={tripEntries}
        selectedYear={selectedYear}
      />

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
          <div className="relative inline-flex">
            <button 
              ref={addButtonRef}
              type="button"
              aria-disabled={hasOngoingTrip}
              onClick={() => {
                if (hasOngoingTrip) {
                  setShowAddTooltip(true);
                } else {
                  onAddTrip();
                }
              }}
              className={`h-12 px-5 rounded-xl transition-all shadow-sm flex items-center justify-center text-base font-medium ${hasOngoingTrip ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70' : 'bg-primary !text-white hover:bg-primary/90'}`}
            >
              Hinzufügen
            </button>
            <div
              ref={tooltipRef}
              style={tooltipStyle}
              className={`fixed whitespace-normal w-[300px] max-w-[calc(100vw-32px)] rounded-lg bg-white text-gray-900 px-3 py-2 text-xs shadow-xl transition-all duration-200 z-[9999] ${showAddTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}
            >
              Beende die laufende Reise, um eine neue zu starten.
            </div>
          </div>
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
            handleDeleteEntry(deleteConfirmation.entry.id);
          }
        }}
        title="Eintrag löschen"
        message={deleteConfirmation.entry ? `Möchten Sie den Eintrag vom ${formatDate(deleteConfirmation.entry.date)} wirklich löschen?` : ''}
      />
    </div>
    </>
  );
}
