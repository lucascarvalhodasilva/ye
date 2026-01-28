import React, { useMemo, useState } from 'react';
import { formatDate } from '@/utils/dateFormatter';

const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export default function FullScreenTableView({
  isOpen,
  onClose,
  entries,
  selectedYear,
  onAddEquipment,
  onViewReceipt,
  onEdit,
  onDelete,
  onSchedule
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedMonths, setCollapsedMonths] = useState({});

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;
    return entries.filter((entry) =>
      (entry.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.status || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  const entriesByMonth = useMemo(() => {
    const grouped = filteredEntries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const month = date.getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(entry);
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => Number(a) - Number(b))
      .map((month) => ({ month: Number(month), entries: grouped[month] }));
  }, [filteredEntries]);

  const monthlyTotals = useMemo(() => {
    return entriesByMonth.reduce((acc, group) => {
      const deductible = group.entries.reduce((sum, entry) => sum + (Number(entry.deductibleAmount) || 0), 0);
      const price = group.entries.reduce((sum, entry) => sum + (Number(entry.price) || 0), 0);
      acc[group.month] = { deductible, price };
      return acc;
    }, {});
  }, [entriesByMonth]);

  const totalPrice = filteredEntries.reduce((sum, entry) => sum + (Number(entry.price) || 0), 0);
  const totalDeductible = filteredEntries.reduce((sum, entry) => sum + (Number(entry.deductibleAmount) || 0), 0);

  if (!isOpen) return null;

  const toggleMonth = (month) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  return (
    <div className="fixed inset-0 bg-background z-9999 flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-card border-b border-border">
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Arbeitsmittel {selectedYear}</h2>
                <p className="text-xs text-muted-foreground">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'Eintrag' : 'Einträge'} · {totalDeductible.toFixed(2)}€ abzugsfähig
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-[10px] text-muted-foreground">EINTRÄGE</p>
              <p className="text-lg font-semibold">{filteredEntries.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-[10px] text-muted-foreground">GESAMT</p>
              <p className="text-lg font-semibold">{totalPrice.toFixed(2)}€</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10">
              <p className="text-[10px] text-blue-600 font-medium">ABZUGSFÄHIG</p>
              <p className="text-lg font-semibold text-blue-600">{totalDeductible.toFixed(2)}€</p>
            </div>
          </div>

          <div className="h-1" />
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto pb-[env(safe-area-inset-bottom)] px-4 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <table className="w-full text-sm border-collapse min-w-[780px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-muted text-muted-foreground">
              <th className="border border-border px-3 py-2 text-left font-semibold text-xs w-10">#</th>
              <th className="border border-border px-3 py-2 text-left font-semibold text-xs">Datum</th>
              <th className="border border-border px-3 py-2 text-left font-semibold text-xs">Bezeichnung</th>
              <th className="border border-border px-3 py-2 text-left font-semibold text-xs">Status</th>
              <th className="border border-border px-3 py-2 text-right font-semibold text-xs">Preis (€)</th>
              <th className="border border-border px-3 py-2 text-right font-semibold text-xs">Abzugsfähig (€)</th>
              <th className="border border-border px-3 py-2 text-center font-semibold text-xs">Beleg</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="border border-border px-3 py-8 text-center text-muted-foreground">
                  Keine Arbeitsmittel für {selectedYear}
                </td>
              </tr>
            ) : (
              entriesByMonth.map((group) => {
                const isCollapsed = collapsedMonths[group.month];
                const monthKey = group.month;
                const monthTotals = monthlyTotals[monthKey] || { deductible: 0, price: 0 };

                return (
                  <React.Fragment key={monthKey}>
                    <tr
                      className="bg-primary/10 cursor-pointer hover:bg-primary/15 transition-colors"
                      onClick={() => toggleMonth(monthKey)}
                    >
                      <td className="border border-border px-3 py-2">
                        <svg
                          className={`w-4 h-4 text-primary transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </td>
                      <td colSpan={3} className="border border-border px-3 py-2 font-semibold text-foreground">
                        {monthNames[monthKey]} <span className="font-normal text-muted-foreground text-xs">({group.entries.length})</span>
                      </td>
                      <td className="border border-border px-3 py-2 text-right font-semibold text-muted-foreground tabular-nums">
                        {monthTotals.price.toFixed(2)}
                      </td>
                      <td className="border border-border px-3 py-2 text-right font-semibold text-blue-600 tabular-nums">
                        {monthTotals.deductible.toFixed(2)}
                      </td>
                      <td className="border border-border px-3 py-2 text-center text-muted-foreground">–</td>
                    </tr>

                    {!isCollapsed && group.entries.map((entry, idx) => {
                      const hasReceipt = !!entry.receiptFileName;
                      return (
                        <tr key={entry.id || idx} className="hover:bg-muted/30 transition-colors">
                          <td className="border border-border px-3 py-2 text-muted-foreground text-xs">
                            {idx + 1}
                          </td>
                          <td className="border border-border px-3 py-2 text-foreground whitespace-nowrap">
                            {formatDate(entry.date)}
                          </td>
                          <td className="border border-border px-3 py-2 text-foreground">
                            {entry.name || 'Arbeitsmittel'}
                          </td>
                          <td className="border border-border px-3 py-2 text-xs text-muted-foreground">
                            {entry.status || '–'}
                          </td>
                          <td className="border border-border px-3 py-2 text-right tabular-nums">
                            {(Number(entry.price) || 0).toFixed(2)}
                          </td>
                          <td className="border border-border px-3 py-2 text-right font-semibold text-blue-600 tabular-nums">
                            {(Number(entry.deductibleAmount) || 0).toFixed(2)}
                          </td>
                          <td className="border border-border px-3 py-2 text-center">
                            {hasReceipt ? (
                              <button
                                onClick={() => onViewReceipt && onViewReceipt(entry.receiptFileName)}
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                              >
                                Beleg
                              </button>
                            ) : (
                              <span className="text-muted-foreground text-xs">–</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer pinned to bottom of the overlay */}
      <div className="shrink-0 border-t border-border bg-card/95 backdrop-blur-sm px-4 py-3 pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between text-sm text-foreground tabular-nums">
          <span className="font-semibold">Gesamtsumme {selectedYear}</span>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] text-muted-foreground">Preis</span>
              <span className="text-base font-semibold text-muted-foreground">{totalPrice.toFixed(2)} €</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] text-muted-foreground">Abzugsfähig</span>
              <span className="text-base font-semibold text-blue-600">{totalDeductible.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
