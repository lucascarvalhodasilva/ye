"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';

/**
 * Side navigation panel for managing monthly employer reimbursements (Spesen)
 * Slides in from the left with a backdrop
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the side nav is open
 * @param {Function} props.onClose - Callback to close the side nav
 * @param {number} props.year - Selected year
 * @returns {JSX.Element}
 */
export default function SpesenSideNav({ isOpen, onClose, year }) {
  const { monthlyEmployerExpenses, addMonthlyEmployerExpense, updateMonthlyEmployerExpense, deleteMonthlyEmployerExpense, getSpesenForYear } = useAppContext();
  const [quickAddMonth, setQuickAddMonth] = useState(null);
  const [quickAddAmount, setQuickAddAmount] = useState('');
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickEditAmount, setQuickEditAmount] = useState('');
  const [swipeState, setSwipeState] = useState({ id: null, startX: 0, currentX: 0 });
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const quickAddInputRef = useRef(null);
  const quickEditInputRef = useRef(null);
  const swipeThreshold = 50; // px needed to trigger edit

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // Determine which months to show based on year
  const getVisibleMonths = () => {
    if (year < currentYear) {
      // Past year: show all 12 months
      return 12;
    } else if (year === currentYear) {
      // Current year: show up to current month
      return currentMonth;
    } else {
      // Future year: should not happen (sidebar won't open)
      return 0;
    }
  };

  const visibleMonthCount = getVisibleMonths();
  const visibleMonths = months.slice(0, visibleMonthCount);

  // Get spesen for the selected year
  const yearSpesen = getSpesenForYear(year);

  // Calculate statistics
  const totalSpesen = yearSpesen.reduce((sum, s) => sum + s.amount, 0);
  const averageSpesen = yearSpesen.length > 0 ? totalSpesen / yearSpesen.length : 0;
  const monthsWithData = yearSpesen.length;

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Show swipe hint animation when sidebar opens
  useEffect(() => {
    if (isOpen && yearSpesen.length > 0) {
      // Delay the hint animation to let sidebar animation complete
      const timer = setTimeout(() => {
        setShowSwipeHint(true);
        // Hide the hint after animation completes
        setTimeout(() => setShowSwipeHint(false), 1100);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, yearSpesen.length]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get spesen for a specific month, or null if not exists
  const getSpesenForMonth = (month) => {
    return yearSpesen.find(s => s.month === month) || null;
  };

  // Handle quick add for empty months
  const handleQuickAddClick = (month) => {
    setQuickAddMonth(month);
    setQuickAddAmount('');
    // Focus input after state update
    setTimeout(() => {
      quickAddInputRef.current?.focus();
    }, 50);
  };

  const handleQuickAddBlur = () => {
    const amountNum = parseFloat(quickAddAmount);
    // Only save if user entered something (0 is valid, empty string is not)
    if (quickAddAmount.trim() !== '' && !isNaN(amountNum) && amountNum >= 0) {
      addMonthlyEmployerExpense({
        year,
        month: quickAddMonth,
        amount: amountNum,
        note: '',
        createdAt: new Date().toISOString()
      });
    }
    setQuickAddMonth(null);
    setQuickAddAmount('');
  };

  const handleQuickAddKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setQuickAddMonth(null);
      setQuickAddAmount('');
    }
  };

  // Quick edit handlers for existing entries (long press)
  const handleQuickEdit = (spesen) => {
    setQuickEditId(spesen.id);
    setQuickEditAmount(spesen.amount.toString());
    setTimeout(() => {
      quickEditInputRef.current?.focus();
      quickEditInputRef.current?.select();
    }, 50);
  };

  const handleQuickEditBlur = () => {
    const amountNum = parseFloat(quickEditAmount);
    // Delete only if empty string, 0 is a valid value
    if (quickEditAmount.trim() === '' || isNaN(amountNum)) {
      deleteMonthlyEmployerExpense(quickEditId);
    } else {
      // Update with new value (including 0)
      updateMonthlyEmployerExpense(quickEditId, {
        amount: amountNum >= 0 ? amountNum : 0,
        updatedAt: new Date().toISOString()
      });
    }
    setQuickEditId(null);
    setQuickEditAmount('');
  };

  const handleQuickEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setQuickEditId(null);
      setQuickEditAmount('');
    }
  };

  // Swipe handlers for editing existing entries
  const handleSwipeStart = (e, spesen) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setSwipeState({ id: spesen.id, startX: clientX, currentX: clientX });
  };

  const handleSwipeMove = (e) => {
    if (!swipeState.id) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setSwipeState(prev => ({ ...prev, currentX: clientX }));
  };

  const handleSwipeEnd = (spesen) => {
    if (!swipeState.id) return;
    const swipeDistance = swipeState.currentX - swipeState.startX;
    
    // If swiped left enough, trigger edit mode
    if (Math.abs(swipeDistance) >= swipeThreshold) {
      handleQuickEdit(spesen);
    }
    
    setSwipeState({ id: null, startX: 0, currentX: 0 });
  };

  const getSwipeOffset = (spesenId) => {
    if (swipeState.id !== spesenId) return 0;
    const offset = swipeState.currentX - swipeState.startX;
    // Limit the visual offset
    return Math.max(-80, Math.min(80, offset));
  };

  // Don't open for future years
  if (!isOpen || year > currentYear) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity animate-in fade-in duration-200"
        onClick={handleBackdropClick}
      >
        {/* Side Nav Panel */}
        <div 
          className="fixed left-0 top-0 bottom-0 w-[85%] min-w-[320px] max-w-[480px] bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden z-[70] animate-slideInLeft flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-border/50 bg-muted/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Monatliche Spesen</h2>
                <p className="text-[10px] text-muted-foreground">{year} • Arbeitgebererstattungen</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-5 overflow-y-auto flex-1">
            {/* Section: Jahresübersicht */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-foreground">Jahresübersicht</h3>
              </div>
              <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-border/30 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Gesamt</span>
                  <span className="text-lg font-bold text-amber-600">
                    {totalSpesen.toFixed(2)} €
                  </span>
                </div>
                <div className="h-px bg-border/50"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Durchschnitt</span>
                  <span className="text-sm font-semibold text-foreground">
                    {averageSpesen.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Erfasst</span>
                  <span className="text-sm font-semibold text-foreground">
                    {monthsWithData}/12 Monate
                  </span>
                </div>
              </div>
            </div>

            {/* Section: Monatliche Einträge */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-foreground">Monatliche Einträge</h3>
              </div>
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {(() => {
                  let firstSpesenFound = false;
                  return [...visibleMonths].reverse().map((monthName, index) => {
                    const month = visibleMonthCount - index;
                    const spesen = getSpesenForMonth(month);
                    const isQuickAdding = quickAddMonth === month;
                    const isQuickEditing = quickEditId === spesen?.id;
                    const swipeOffset = spesen ? getSwipeOffset(spesen.id) : 0;
                    
                    // Check if this is the first item with a value (for hint animation)
                    const isFirstWithValue = spesen && !firstSpesenFound;
                    if (spesen) firstSpesenFound = true;
                    const showHintOnThis = showSwipeHint && isFirstWithValue;

                    return (
                      <div
                        key={month}
                        onClick={() => !spesen && !isQuickAdding && handleQuickAddClick(month)}
                        onTouchStart={(e) => spesen && !isQuickEditing && handleSwipeStart(e, spesen)}
                        onTouchMove={handleSwipeMove}
                        onTouchEnd={() => spesen && handleSwipeEnd(spesen)}
                        onMouseDown={(e) => spesen && !isQuickEditing && handleSwipeStart(e, spesen)}
                        onMouseMove={handleSwipeMove}
                        onMouseUp={() => spesen && handleSwipeEnd(spesen)}
                        onMouseLeave={() => spesen && handleSwipeEnd(spesen)}
                        style={{ transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined }}
                        className={`p-3 rounded-xl select-none overflow-hidden ${
                          showHintOnThis ? 'animate-swipeHint' : 'transition-all'
                        } ${swipeOffset ? 'duration-0' : 'duration-200'} ${
                          spesen || isQuickAdding
                            ? 'bg-white/60 dark:bg-white/5' 
                          : 'bg-transparent border border-dashed border-border/50 hover:border-amber-400/50 cursor-pointer'
                      }`}
                    >
                      {isQuickAdding ? (
                        // Quick Add Mode - invisible input
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{monthName}</span>
                          <div className="relative">
                            <input
                              ref={quickAddInputRef}
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0"
                              value={quickAddAmount}
                              onChange={(e) => setQuickAddAmount(e.target.value)}
                              onBlur={handleQuickAddBlur}
                              onKeyDown={handleQuickAddKeyDown}
                              placeholder="0.00"
                              className="w-20 text-right text-sm font-bold text-amber-600 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none placeholder:text-amber-400/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none caret-amber-600"
                            />
                            <span className="text-sm font-bold text-amber-600 ml-1">€</span>
                          </div>
                        </div>
                      ) : isQuickEditing ? (
                        // Quick Edit Mode - same as quick add but for existing entries
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{monthName}</span>
                          <div className="relative">
                            <input
                              ref={quickEditInputRef}
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0"
                              value={quickEditAmount}
                              onChange={(e) => setQuickEditAmount(e.target.value)}
                              onBlur={handleQuickEditBlur}
                              onKeyDown={handleQuickEditKeyDown}
                              placeholder="0.00"
                              className="w-20 text-right text-sm font-bold text-amber-600 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none placeholder:text-amber-400/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none caret-amber-600"
                            />
                            <span className="text-sm font-bold text-amber-600 ml-1">€</span>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{monthName}</span>
                          {spesen ? (
                            <span className="text-sm font-bold text-amber-600">
                              {spesen.amount.toFixed(2)} €
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Tippen zum Hinzufügen</span>
                              <svg className="w-3.5 h-3.5 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}