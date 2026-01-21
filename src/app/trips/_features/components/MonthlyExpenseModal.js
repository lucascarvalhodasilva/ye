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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm border-2 border-blue-500 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            Spesen im {monthNames[selectedMonth]}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-4 space-y-4">
          <div className="border-2 border-blue-400 rounded-lg p-4 bg-blue-50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Absetzbare Pauschalen:</span>
              <span className="font-medium text-green-600">+{monthlyDeductible.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fleet Spesen:</span>
              <span className="font-medium text-red-600">-{currentExpense.toFixed(2)} €</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between text-sm font-semibold">
              <span className="text-gray-700">Monatsbilanz:</span>
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {isPositive ? '+' : ''}{balance.toFixed(2)} €
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1 font-medium">
              Betrag (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-medium"
              placeholder="0.00"
              autoFocus
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSaveExpense}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm shadow-sm"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
