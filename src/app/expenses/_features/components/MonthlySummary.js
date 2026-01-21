import React from 'react';

export default function MonthlySummary({ monthlyExpenses, monthNames }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Monatliche Übersicht</h2>
      <div className="flex gap-4 pb-2 overflow-x-auto snap-x scrollbar-hide">
        {monthlyExpenses.length === 0 ? (
          <div className="p-2 text-sm text-gray-500">Keine Ausgaben in diesem Jahr.</div>
        ) : (
          monthlyExpenses.map(({ month, amount }) => (
            <div 
              key={month}
              className="flex flex-col flex-none justify-between w-32 h-20 p-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm snap-start"
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                {monthNames[month]}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {amount.toFixed(2)} €
              </span>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
