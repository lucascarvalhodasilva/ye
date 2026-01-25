import React, { useState } from 'react';

export default function DepreciationScheduleView({ item, schedule, selectedYear }) {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!schedule) return null;

  const isGWG = schedule.type === 'GWG';
  const purchaseDate = new Date(item.date);
  const monthName = purchaseDate.toLocaleDateString('de-DE', { month: 'long' });
  const monthShort = purchaseDate.toLocaleDateString('de-DE', { month: 'short' });
  
  // Calculate progress percentage
  const completedMonths = schedule.years
    .filter(y => y.year < selectedYear)
    .reduce((sum, y) => sum + y.months, 0) +
    (schedule.years.find(y => y.year === selectedYear)?.months || 0);
  const totalMonths = isGWG ? 12 : schedule.totalMonths;
  const progressPercent = Math.min(100, Math.round((completedMonths / totalMonths) * 100));

  return (
    <div className="mt-3 pt-3 border-t border-border/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs font-semibold text-foreground">
            {isGWG ? 'GWG (Sofortabzug)' : `Abschreibungsplan (${schedule.years.length} Jahre)`}
          </span>
        </div>
      </div>

      {/* Year-by-Year Breakdown Table */}
      <div className="bg-muted/20 rounded-xl overflow-hidden mb-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Jahr</th>
              <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Monate</th>
              {!isGWG && (
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Monatl.</th>
              )}
              <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Abzug</th>
            </tr>
          </thead>
          <tbody>
            {schedule.years.map((yearData, index) => (
              <tr 
                key={yearData.year}
                className={`${yearData.isCurrentYear ? 'bg-blue-500/10' : ''} ${index !== schedule.years.length - 1 ? 'border-b border-border/20' : ''}`}
              >
                <td className="py-2 px-3 font-medium text-foreground">
                  {yearData.year}
                  {yearData.isCurrentYear && (
                    <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-blue-500 text-white font-semibold">
                      AKTUELL
                    </span>
                  )}
                </td>
                <td className="text-center py-2 px-2 text-muted-foreground">
                  {yearData.months}/12
                </td>
                {!isGWG && (
                  <td className="text-right py-2 px-2 text-muted-foreground font-mono">
                    €{yearData.monthlyRate.toFixed(2)}
                  </td>
                )}
                <td className="text-right py-2 px-3 font-semibold text-blue-600">
                  €{yearData.deduction.toFixed(2)}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-blue-500/5 border-t-2 border-blue-500/30">
              <td className="py-2 px-3 font-bold text-foreground">Gesamt</td>
              <td className="text-center py-2 px-2 text-muted-foreground font-medium">
                {isGWG ? '12/12' : `${totalMonths}/${totalMonths}`}
              </td>
              {!isGWG && (
                <td className="text-right py-2 px-2"></td>
              )}
              <td className="text-right py-2 px-3 font-bold text-blue-700">
                €{schedule.total.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground font-medium">Fortschritt</span>
          <span className="text-[10px] font-semibold text-blue-600">
            {progressPercent}% ({completedMonths} von {totalMonths} Monaten)
          </span>
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Book Value */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-muted/20 rounded-lg p-2">
          <div className="text-[9px] text-muted-foreground uppercase mb-0.5">Original</div>
          <div className="text-xs font-bold text-foreground">€{parseFloat(item.price).toFixed(2)}</div>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <div className="text-[9px] text-muted-foreground uppercase mb-0.5">Abgeschrieben</div>
          <div className="text-xs font-bold text-blue-600">
            €{(parseFloat(item.price) - schedule.bookValue).toFixed(2)}
          </div>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <div className="text-[9px] text-muted-foreground uppercase mb-0.5">Restwert</div>
          <div className="text-xs font-bold text-amber-600">€{schedule.bookValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Collapsible Calculation Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <svg 
          className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-90' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {showDetails ? 'Details ausblenden' : 'Berechnungsdetails anzeigen'}
      </button>

      {/* Calculation Details */}
      {showDetails && (
        <div className="mt-2 p-3 bg-muted/10 rounded-lg space-y-1.5">
          <div className="flex items-start gap-2">
            <svg className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              {isGWG ? (
                <>
                  <strong className="text-foreground">GWG-Regelung:</strong> Arbeitsmittel bis €952 
                  können im Jahr der Anschaffung vollständig abgesetzt werden.
                </>
              ) : (
                <>
                  <strong className="text-foreground">Abschreibung über 3 Jahre:</strong> 
                  <br />
                  • Monatliche Abschreibung: €{parseFloat(item.price).toFixed(2)} ÷ 36 Monate = €{schedule.monthlyRate.toFixed(2)}
                  <br />
                  • Anschaffung: {monthName} {purchaseDate.getFullYear()} 
                  ({monthShort}-Dez = {12 - purchaseDate.getMonth()} Monate)
                  <br />
                  • Restliche: {totalMonths - (12 - purchaseDate.getMonth())} Monate über {schedule.years.length - 1} Jahre verteilt
                  <br />
                  • Letztes Jahr: {purchaseDate.getMonth()} Monate (Jan-{monthShort})
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
