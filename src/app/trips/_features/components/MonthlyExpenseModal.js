import React from 'react';
import { monthNames } from '../utils/tripCalculations';

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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Spesen im {monthNames[selectedMonth]}
        </h3>
        
        <div className="space-y-4">
          <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Absetzbare Pauschalen:</span>
              <span className="font-medium text-emerald-600">+{monthlyDeductible.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fleet Spesen:</span>
              <span className="font-medium text-destructive">-{currentExpense.toFixed(2)} €</span>
            </div>
            <div className="border-t border-border/50 pt-2 flex justify-between text-sm font-semibold">
              <span>Monatsbilanz:</span>
              <span className={isPositive ? 'text-emerald-600' : 'text-destructive'}>
                {isPositive ? '+' : ''}{balance.toFixed(2)} €
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Betrag (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="w-full p-3 rounded-lg bg-secondary/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-lg font-medium"
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveExpense}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors text-sm shadow-sm"
            >
              Speichern
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 text-sm transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
