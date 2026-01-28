import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import FloatingScheduleCard from './FloatingScheduleCard';
import SwipeableListItem from '@/components/shared/SwipeableListItem';
import { useUIContext } from '@/context/UIContext';

export default function EquipmentList({ 
  filteredEquipmentEntries, 
  deleteEquipmentEntry, 
  selectedYear, 
  setIsFullScreen, 
  handleViewReceipt,
  highlightId,
  onEdit,
  onAddEquipment,
  generateDepreciationSchedule,
  scheduleOpen,
  setScheduleOpen,
  selectedEquipment,
  setSelectedEquipment
}) {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, entry: null });
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const { openScheduleCard, clearScheduleCardState } = useUIContext();

  // Handle schedule card close - integrates with UIContext for back button support
  const handleCloseScheduleCard = useCallback(() => {
    setScheduleOpen(false);
    setTimeout(() => setSelectedEquipment(null), 300);
    // Clear UIContext state since we're closing locally
    clearScheduleCardState();
  }, [setScheduleOpen, setSelectedEquipment, clearScheduleCardState]);

  // Sync with UIContext when schedule opens
  useEffect(() => {
    if (scheduleOpen) {
      openScheduleCard(handleCloseScheduleCard);
    }
  }, [scheduleOpen, openScheduleCard, handleCloseScheduleCard]);

  const toggleMonth = (key) => {
    setCollapsedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Group entries by month for separators
  const entriesByMonth = useMemo(() => {
    const filtered = searchQuery 
      ? filteredEquipmentEntries.filter(entry => 
          (entry.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      : filteredEquipmentEntries;
    
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
  }, [filteredEquipmentEntries, searchQuery]);

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`equipment-row-${highlightId}`);
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
  }, [highlightId, filteredEquipmentEntries]);

  const totalDeductible = filteredEquipmentEntries.reduce((sum, entry) => sum + (entry.deductibleAmount || 0), 0);

  // Calculate totals for summary
  const totalEntries = entriesByMonth.reduce((sum, group) => sum + group.entries.length, 0);
  const totalPrice = filteredEquipmentEntries.reduce((sum, entry) => sum + (entry.price || 0), 0);

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Sticky Summary Header */}
      <div className="sticky top-0 z-10 mb-4 shrink-0">
        <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-lg p-4">
          <div className="flex items-center justify-between">
            {/* Left: Module Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Arbeitsmittel {selectedYear}</h2>
                <p className="text-xs text-muted-foreground">
                  {totalEntries} Einträge · {totalDeductible.toFixed(2)}€ abzugsfähig
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
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Gesamt</p>
              <p className="text-lg font-semibold text-foreground">{totalPrice.toFixed(2)}€</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10">
              <p className="text-[10px] text-blue-600 uppercase tracking-wide font-medium">Abzugsfähig</p>
              <p className="text-lg font-semibold text-blue-600">{totalDeductible.toFixed(2)}€</p>
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
        {onAddEquipment && (
          <button 
            onClick={onAddEquipment}
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
      <div 
        className="flex-1 overflow-y-auto min-h-0 transition-all duration-300"
        style={{ paddingBottom: scheduleOpen ? '50vh' : '0' }}
      >
        {totalEntries === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            {/* Icon with animation */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/20">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            {/* Text */}
            <h3 className="text-base font-semibold text-foreground mb-2">
              Keine Arbeitsmittel für {selectedYear}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Erfassen Sie Ihr erstes Arbeitsmittel und profitieren Sie von Steuerabzügen
            </p>
            
            {/* Call-to-Action Button */}
            {onAddEquipment && (
              <button
                onClick={onAddEquipment}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Erstes Arbeitsmittel hinzufügen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {entriesByMonth.map((monthGroup) => {
              const monthKey = `${monthGroup.year}-${monthGroup.month}`;
              const isCollapsed = collapsedMonths[monthKey];
              const monthTotal = monthGroup.entries.reduce((sum, entry) => sum + (entry.deductibleAmount || 0), 0);
              
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
                      {monthGroup.entries.map((entry, index) => (
                        <SwipeableListItem
                          key={entry.id}
                          itemId={entry.id}
                          className={`
                            border-b border-border/20 
                            hover:bg-muted/30 
                            transition-colors
                            ${index === 0 ? 'border-t border-border/20' : ''}
                          `}
                          hasReceipt={!!entry.receiptFileName}
                          onEdit={() => onEdit && onEdit(entry)}
                          onDelete={() => setDeleteConfirmation({ isOpen: true, entry })}
                          onViewReceipt={() => handleViewReceipt(entry.receiptFileName)}
                          onSchedule={() => {
                            if (scheduleOpen && selectedEquipment?.id !== entry.id) {
                              setSelectedEquipment(entry);
                            } else if (scheduleOpen && selectedEquipment?.id === entry.id) {
                              handleCloseScheduleCard();
                            } else {
                              setSelectedEquipment(entry);
                              setScheduleOpen(true);
                            }
                          }}
                        >
                          <div id={`equipment-row-${entry.id}`} className="py-3 px-4">
                            <div className="flex items-center gap-4">
                              {/* Date Badge */}
                              <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 bg-blue-500/10 text-blue-600">
                                <span className="text-base font-bold leading-none">
                                  {new Date(entry.date).getDate()}
                                </span>
                                <span className="text-[9px] uppercase font-medium mt-0.5 opacity-70">
                                  {new Date(entry.date).toLocaleDateString('de-DE', { month: 'short' })}
                                </span>
                              </div>

                              {/* Equipment Details */}
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-foreground truncate block">
                                  {entry.name || 'Arbeitsmittel'}
                                </span>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <span>{formatDate(entry.date)}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    entry.status === 'GWG' 
                                      ? 'bg-emerald-500/10 text-emerald-600' 
                                      : 'bg-amber-500/10 text-amber-600'
                                  }`}>
                                    {entry.status}
                                  </span>
                                </div>
                              </div>

                              {/* Amount */}
                              <div className="text-right shrink-0">
                                <span className="text-base font-bold text-blue-600 block">
                                  +{(entry.deductibleAmount || 0).toFixed(2)} €
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {(entry.price || 0).toFixed(0)}€ Preis
                                </span>
                              </div>
                            </div>
                          </div>
                        </SwipeableListItem>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, entry: null })}
        onConfirm={() => {
          if (deleteConfirmation.entry) {
            deleteEquipmentEntry(deleteConfirmation.entry.id);
          }
        }}
        title="Eintrag löschen"
        message={deleteConfirmation.entry ? `Möchten Sie das Arbeitsmittel "${deleteConfirmation.entry.name}" wirklich löschen?` : ''}
      />

      {/* Floating Schedule Card */}
      <FloatingScheduleCard
        equipment={selectedEquipment}
        open={scheduleOpen}
        onClose={handleCloseScheduleCard}
        schedule={selectedEquipment && generateDepreciationSchedule ? generateDepreciationSchedule(selectedEquipment) : null}
        selectedYear={selectedYear}
        onViewReceipt={handleViewReceipt}
      />
    </div>
  );
}
