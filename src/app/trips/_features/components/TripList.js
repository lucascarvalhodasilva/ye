import React, { useEffect, useState, useMemo } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import SwipeableListItem from '@/components/shared/SwipeableListItem';

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
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

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

  // Calculate totals for summary
  const totalEntries = entriesByMonth.reduce((sum, group) => sum + group.entries.length, 0);
  const totalDeductible = tripEntries.reduce((sum, entry) => {
    const relatedMileage = mileageEntries.filter(m => m.relatedTripId === entry.id);
    const dayMileage = relatedMileage.length > 0
      ? relatedMileage
      : mileageEntries.filter(m => m.date === entry.date || m.date === entry.endDate);
    const mileageSum = dayMileage.reduce((s, m) => s + (m.allowance || 0), 0);
    return sum + (entry.deductible || 0) + mileageSum;
  }, 0);

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Sticky Summary Header */}
      <div className="sticky top-0 z-10 mb-4 shrink-0">
        <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-lg p-4">
          <div className="flex items-center justify-between">
            {/* Left: Module Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Dienstreisen {selectedYear}</h2>
                <p className="text-xs text-muted-foreground">
                  {totalEntries} Fahrten · {totalDeductible.toFixed(2)}€ abzugsfähig
                </p>
              </div>
            </div>
            
            {/* Right: Actions */}
            <button
              onClick={() => setIsFullScreen(false)}
              className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            </button>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Einträge</p>
              <p className="text-lg font-semibold text-foreground">{totalEntries}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Fahrten</p>
              <p className="text-lg font-semibold text-foreground">{tripEntries.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10">
              <p className="text-[10px] text-green-600 uppercase tracking-wide font-medium">Gesamt</p>
              <p className="text-lg font-semibold text-green-600">{totalDeductible.toFixed(2)}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar - Search and Add */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-10 rounded-xl bg-card/80 backdrop-blur-sm border border-border/30 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        {onAddTrip && (
          <button 
            onClick={onAddTrip}
            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Hinzufügen
          </button>
        )}
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {totalEntries === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            {/* Icon with animation */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/20">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
            
            {/* Text */}
            <h3 className="text-base font-semibold text-foreground mb-2">
              Keine Dienstreisen für {selectedYear}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Fügen Sie Ihre erste Dienstreise hinzu und profitieren Sie von Steuerabzügen
            </p>
            
            {/* Call-to-Action Button */}
            {onAddTrip && (
              <button
                onClick={onAddTrip}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Erste Dienstreise hinzufügen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {entriesByMonth.map((monthGroup) => {
              const monthKey = `${monthGroup.year}-${monthGroup.month}`;
              const isCollapsed = collapsedMonths[monthKey];
              const monthTotal = monthGroup.entries.reduce((sum, entry) => {
                const relatedMileage = mileageEntries.filter(m => m.relatedTripId === entry.id);
                const dayMileage = relatedMileage.length > 0
                  ? relatedMileage
                  : mileageEntries.filter(m => m.date === entry.date || m.date === entry.endDate);
                const mileageSum = dayMileage.reduce((s, m) => s + (m.allowance || 0), 0);
                return sum + (entry.deductible || 0) + mileageSum;
              }, 0);
              
              return (
                <div key={monthKey}>
                  {/* Sticky Month Header */}
                  <div className="sticky top-[180px] z-[9] bg-background/80 backdrop-blur-md py-2 mb-2">
                    <button
                      onClick={() => toggleMonth(monthKey)}
                      className="flex items-center gap-3 w-full group"
                    >
                      <div className="flex items-center gap-2">
                        <svg 
                          className={`w-4 h-4 text-muted-foreground transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-sm font-semibold text-foreground">
                          {monthGroup.month} {monthGroup.year}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground">
                          {monthGroup.entries.length}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {monthTotal.toFixed(2)}€
                        </span>
                      </div>
                    </button>
                    <div className="h-px bg-border/30 mt-2"></div>
                  </div>
                  
                  {/* Month entries - Seamless list */}
                  {!isCollapsed && (
                    <div className="space-y-0">
                      {monthGroup.entries.map((entry, index) => {
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
                        const hasReceipt = publicTransportEntries.some(m => m.receiptFileName);
                        const receiptEntry = publicTransportEntries.find(m => m.receiptFileName);
                        
                        return (
                          <SwipeableListItem
                            key={entry.id}
                            itemId={entry.id}
                            className={`
                              border-b border-border/20 
                              hover:bg-muted/30 
                              transition-colors
                              ${index === 0 ? 'border-t border-border/20' : ''}
                            `}
                            hasReceipt={hasReceipt}
                            onEdit={() => onEdit && onEdit(entry)}
                            onDelete={() => setDeleteConfirmation({ isOpen: true, entry })}
                            onViewReceipt={() => {
                              if (receiptEntry) handleViewReceipt(receiptEntry.receiptFileName);
                            }}
                          >
                            <div id={`trip-row-${entry.id}`} className="py-3 px-4">
                              <div className="flex items-center gap-4">
                                {/* Date Badge */}
                                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 bg-green-500/10 text-green-600">
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
                                      <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium shrink-0">
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
                                  <span className="text-base font-bold text-green-600">
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
                                  </div>
                                </div>
                              </div>
                            </div>
                          </SwipeableListItem>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
