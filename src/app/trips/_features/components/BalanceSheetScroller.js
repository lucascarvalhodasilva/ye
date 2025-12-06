import React from 'react';
import { monthNames } from '../utils/tripCalculations';

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
    <div className="card-modern">
      <div className="space-y-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Bilanz</h2>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Jahresbilanz</span>
            <span className={`text-lg font-bold ${isYearlyPositive ? 'text-emerald-600' : 'text-destructive'}`}>
              {yearlyBalance > 0 ? '+' : ''}{yearlyBalance.toFixed(2)} €
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center px-3 py-2 bg-secondary/30 rounded-lg text-sm">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Pauschalen</span>
            <span className="font-medium text-emerald-600">+{totalIncome.toFixed(2)} €</span>
          </div>
          <div className="w-px h-8 bg-border/50 mx-2"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Spesen</span>
            <span className="font-medium text-destructive">-{totalExpenses.toFixed(2)} €</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-hide">
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
                // If handleClickWrapper expects a month index, pass it
                // If it expects an event, we might need to adjust. 
                // Based on previous code: handleClickWrapper(expense.month)
                // Now we pass 'month'
                if (handleClickWrapper) handleClickWrapper(month);
                else if (handleMonthClick) handleMonthClick(month);
              }}
              className="flex-none w-32 h-20 rounded-lg border p-3 flex flex-col justify-between transition-all duration-200 snap-start text-left shadow-sm group select-none bg-card hover:bg-secondary/50 border-border"
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {monthNames[month]}
                </span>
                {expenseAmount > 0 && (
                  <span className="text-[10px] font-medium text-destructive">
                    -{expenseAmount.toFixed(0)}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground">Bilanz</span>
                <span className={`text-lg font-bold ${isPositive ? 'text-emerald-600' : 'text-destructive'}`}>
                  {balance > 0 ? '+' : ''}{balance.toFixed(2)} €
                </span>
              </div>
            </button>
          );
        })}
        
        {sortedMonths.length === 0 && (
          <div className="text-sm text-muted-foreground p-4 italic">
            Keine Daten für dieses Jahr vorhanden.
          </div>
        )}
      </div>
    </div>
  );
}
