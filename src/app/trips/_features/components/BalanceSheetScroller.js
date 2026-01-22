import React from 'react';
import { monthNames } from '../utils/tripCalculations';

/**
 * @typedef {Object} MealEntry
 * @property {string|Date} date - Date of the meal entry
 * @property {number} deductible - Deductible amount in euros
 */

/**
 * @typedef {Object} MileageEntry
 * @property {string|Date} date - Date of the mileage entry
 * @property {number} [allowance] - Mileage allowance amount in euros
 */

/**
 * @typedef {Object} MonthlyExpense
 * @property {number} month - Month index (0-11)
 * @property {string|number} year - Year of the expense
 * @property {number} amount - Expense amount in euros
 */

/**
 * @typedef {Object} BalanceSheetScrollerProps
 * @property {MonthlyExpense[]} filteredMonthlyExpenses - Filtered monthly expenses for the selected year
 * @property {MealEntry[]} filteredMealEntries - Filtered meal entries for the selected year
 * @property {MileageEntry[]} mileageEntries - All mileage entries
 * @property {string|number} selectedYear - Currently selected year
 * @property {Function} [handleClickWrapper] - Click handler for month selection
 * @property {Function} [handleMonthClick] - Alternative click handler for month selection
 */

/**
 * Horizontal scrollable balance sheet showing yearly and monthly financial summaries.
 * Displays income from allowances vs expenses, with monthly breakdown cards.
 * 
 * @param {BalanceSheetScrollerProps} props - Component props
 * @returns {JSX.Element} The rendered balance sheet scroller
 * 
 * @example
 * <BalanceSheetScroller
 *   filteredMonthlyExpenses={expenses}
 *   filteredMealEntries={meals}
 *   mileageEntries={mileage}
 *   selectedYear={2025}
 *   handleMonthClick={(month) => console.log(month)}
 * />
 */
export default function BalanceSheetScroller({ 
  filteredMonthlyExpenses, 
  filteredMealEntries, 
  mileageEntries, 
  selectedYear, 
  handleClickWrapper, 
  handleMonthClick
}) {
  // Calculate Yearly Totals
  const totalIncome = filteredMealEntries.reduce((sum, m) => sum + m.deductible, 0) + 
    mileageEntries
      .filter(m => new Date(m.date).getFullYear() === parseInt(selectedYear))
      .reduce((sum, m) => sum + (m.allowance || 0), 0);

  const totalExpenses = filteredMonthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const yearlyBalance = totalIncome - totalExpenses;
  const isYearlyPositive = yearlyBalance >= 0;

  // Calculate months with activity (trips or expenses)
  const activeMonths = new Set();
  
  filteredMealEntries.forEach(m => {
    const d = new Date(m.date);
    if (d.getFullYear() === parseInt(selectedYear)) {
      activeMonths.add(d.getMonth());
    }
  });

  mileageEntries.forEach(m => {
    const d = new Date(m.date);
    if (d.getFullYear() === parseInt(selectedYear)) {
      activeMonths.add(d.getMonth());
    }
  });

  filteredMonthlyExpenses.forEach(e => {
    if (e.year === selectedYear) {
      activeMonths.add(e.month);
    }
  });

  const sortedMonths = Array.from(activeMonths).sort((a, b) => b - a);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Bilanz</h2>
              <p className="text-[10px] text-muted-foreground">Übersicht {selectedYear}</p>
            </div>
          </div>
          
          {/* Yearly Balance Badge */}
          <div className={`px-3 py-2 rounded-xl ${
            isYearlyPositive 
              ? 'bg-emerald-50 dark:bg-emerald-500/10' 
              : 'bg-red-50 dark:bg-red-500/10'
          }`}>
            <span className="text-[10px] text-muted-foreground block text-right">Jahresbilanz</span>
            <span className={`text-lg font-bold ${
              isYearlyPositive 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {yearlyBalance > 0 ? '+' : ''}{yearlyBalance.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Income vs Expenses Summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-300/40 dark:bg-gray/5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Pauschalen</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{totalIncome.toFixed(2)} €</span>
          </div>
          
          <div className="w-px h-10 bg-border/50"></div>
          
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Spesen</span>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
            </div>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">-{totalExpenses.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Monthly Cards Scroller */}
      <div className="p-4">
        <div 
          className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar" 
          style={{ marginLeft: '-1rem', marginRight: '-1rem', paddingLeft: '1rem', paddingRight: '1rem' }}
        >
          {sortedMonths.map(month => {
            const expense = filteredMonthlyExpenses.find(e => e.month === month);
            const expenseAmount = expense ? expense.amount : 0;
            
            // Calculate Monthly Income (Deductible + Mileage)
            const monthlyMeals = filteredMealEntries
              .filter(m => new Date(m.date).getMonth() === month)
              .reduce((sum, m) => sum + m.deductible, 0);
              
            const monthlyMileage = mileageEntries
              .filter(m => {
                 const d = new Date(m.date);
                 return d.getFullYear() === parseInt(selectedYear) && d.getMonth() === month;
              })
              .reduce((sum, m) => sum + (m.allowance || 0), 0);
              
            const monthlyIncome = monthlyMeals + monthlyMileage;
            const balance = monthlyIncome - expenseAmount;
            const isPositive = balance >= 0;

            // Only show if there is income (trips) or expenses
            if (monthlyIncome === 0 && expenseAmount === 0) return null;

            return (
              <button 
                key={month}
                onClick={(e) => {
                  e.preventDefault();
                  if (handleClickWrapper) handleClickWrapper(month);
                  else if (handleMonthClick) handleMonthClick(month);
                }}
                className={`flex-none w-36 rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 snap-start text-left select-none group border-2 border-dashed ${
                  isPositive 
                    ? 'bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/50 hover:border-emerald-500/70 hover:bg-emerald-500/10' 
                    : 'bg-red-500/5 dark:bg-red-500/5 border-red-500/50 hover:border-red-500/70 hover:bg-red-500/10'
                } hover:shadow-md`}
              >
                {/* Month Header */}
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    {monthNames[month]}
                  </span>
                  {expenseAmount > 0 && (
                    <span className="text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 px-1.5 py-0.5 rounded-full">
                      -{expenseAmount.toFixed(0)}€
                    </span>
                  )}
                </div>

                {/* Income & Balance */}
                <div className="space-y-2">
                  {monthlyIncome > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] text-muted-foreground">+{monthlyIncome.toFixed(0)}€</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Bilanz</span>
                    <span className={`text-xl font-bold ${
                      isPositive 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {balance > 0 ? '+' : ''}{balance.toFixed(2)}€
                    </span>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="h-0.5 w-0 group-hover:w-full bg-primary/50 rounded-full transition-all duration-300"></div>
              </button>
            );
          })}
          
          {sortedMonths.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 w-full text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Keine Daten vorhanden</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Fügen Sie Reisen hinzu, um die Bilanz zu sehen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
