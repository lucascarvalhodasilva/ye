import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import FloatingScheduleCard from '@/components/equipment/FloatingScheduleCard';
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

  // Render a single equipment entry
  const renderEquipmentEntry = (entry) => {
    return (
      <SwipeableListItem
        key={entry.id}
        itemId={entry.id}
        className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/30"
        hasReceipt={!!entry.receiptFileName}
        onEdit={() => onEdit && onEdit(entry)}
        onDelete={() => setDeleteConfirmation({ isOpen: true, entry })}
        onViewReceipt={() => handleViewReceipt(entry.receiptFileName)}
        onSchedule={() => {
          if (scheduleOpen && selectedEquipment?.id !== entry.id) {
            // Switch equipment - card will transition automatically
            setSelectedEquipment(entry);
          } else if (scheduleOpen && selectedEquipment?.id === entry.id) {
            // Same equipment clicked - close
            handleCloseScheduleCard();
          } else {
            // Open fresh
            setSelectedEquipment(entry);
            setScheduleOpen(true);
          }
        }}
      >
        <div id={`equipment-row-${entry.id}`} className="p-4 rounded-2xl">
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
            className="w-full h-12 pl-11 pr-10 rounded-xl bg-white/60 dark:bg-white/5 border border-border/50 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
        {onAddEquipment && (
          <button 
            onClick={onAddEquipment}
            className="h-12 px-5 rounded-xl bg-primary hover:bg-primary/90 !text-white transition-all shadow-sm flex items-center justify-center text-base font-medium"
          >
            Hinzufügen
          </button>
        )}
      </div>

      {/* Equipment List */}
      <div 
        className="flex-1 overflow-y-auto min-h-0 space-y-2 transition-all duration-300"
        style={{ paddingBottom: scheduleOpen ? '50vh' : '0' }}
      >
        {filteredEquipmentEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Keine Arbeitsmittel für {selectedYear}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Erfassen Sie Ihr erstes Arbeitsmittel</p>
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
                      {monthGroup.entries.map(entry => renderEquipmentEntry(entry))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
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
