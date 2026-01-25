import React from 'react';
import { monthNames } from '../utils/tripCalculations';

/**
 * @typedef {Object} MonthlyExpenseModalProps
 * @property {boolean} isOpen - Whether the modal is open
 * @property {Function} onClose - Function to close the modal
 * @property {number|null} selectedMonth - Selected month index (0-11)
 * @property {string} expenseAmount - Current expense amount as string
 * @property {Function} setExpenseAmount - Function to update expense amount
 * @property {Function} handleSaveExpense - Function to save the expense
 * @property {number} [monthlyDeductible=0] - Total deductible amount for the month
 */

/**
 * Modal for viewing and editing monthly Fleet expenses.
 * Shows a breakdown of deductible amounts vs expenses with balance calculation.
 * 
 * @param {MonthlyExpenseModalProps} props - Component props
 * @returns {JSX.Element|null} The rendered modal or null if not open
 */
export default function MonthlyExpenseModal({ 
  isOpen, 
  onClose, 
  selectedMonth, 
  expenseAmount, 
  setExpenseAmount, 
  handleSaveExpense, 
  monthlyDeductible = 0
}) {
  if (!isOpen || selectedMonth === null) return null;

  const currentExpense = parseFloat(expenseAmount) || 0;
  const balance = monthlyDeductible - currentExpense;
  const isPositive = balance >= 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-sm border border-border/50 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Spesen {monthNames[selectedMonth]}
              </h3>
              <p className="text-[10px] text-muted-foreground">Monatliche Abrechnung</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {/* Balance Overview */}
          <div className="rounded-xl bg-muted/30 border border-border/50 overflow-hidden">
            {/* Deductible Row */}
            <div className="flex justify-between items-center p-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground">Absetzbare Pauschalen</span>
              </div>
              <span className="text-sm font-semibold text-emerald-600">+{monthlyDeductible.toFixed(2)} €</span>
            </div>
            
            {/* Expense Row */}
            <div className="flex justify-between items-center p-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground">Fleet Spesen</span>
              </div>
              <span className="text-sm font-semibold text-rose-600">-{currentExpense.toFixed(2)} €</span>
            </div>
            
            {/* Balance Row */}
            <div className={`flex justify-between items-center p-3 ${isPositive ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  <svg className={`w-3 h-3 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-foreground">Monatsbilanz</span>
              </div>
              <span className={`text-base font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? '+' : ''}{balance.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Fleet Spesen Betrag
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 dark:bg-white/5 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-base font-semibold text-foreground placeholder:text-muted-foreground/50 transition-all"
                placeholder="0.00"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">€</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-4 border-t border-border/50 bg-muted/20">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-border/50 text-foreground font-medium hover:bg-white dark:hover:bg-white/10 transition-all text-sm"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSaveExpense}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary !text-white font-medium hover:bg-primary/90 transition-all text-sm shadow-sm"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
