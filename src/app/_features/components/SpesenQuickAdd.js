import React, { useState, useEffect } from 'react';

/**
 * Quick-add form for monthly employer reimbursements (Spesen)
 * Pre-filled with the next available month for the selected year
 * 
 * @param {Object} props
 * @param {number} props.year - Selected year
 * @param {Function} props.onAdd - Callback when spesen is added
 * @param {Array} props.existingSpesen - Array of existing spesen for the year
 * @returns {JSX.Element}
 */
export default function SpesenQuickAdd({ year, onAdd, existingSpesen }) {
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // Pre-select the next available month when component mounts or existing spesen changes
  useEffect(() => {
    const existingMonths = new Set(existingSpesen.map(s => s.month));
    // Find the first month without data
    for (let month = 1; month <= 12; month++) {
      if (!existingMonths.has(month)) {
        setSelectedMonth(month);
        return;
      }
    }
    // If all months have data, default to current month
    const currentMonth = new Date().getMonth() + 1;
    setSelectedMonth(currentMonth);
  }, [existingSpesen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum < 0) {
      setError('Bitte geben Sie einen gültigen Betrag ein (≥ 0)');
      return;
    }

    if (note && note.length > 200) {
      setError('Notiz darf maximal 200 Zeichen haben');
      return;
    }

    // Check for duplicate month/year
    const isDuplicate = existingSpesen.some(s => s.month === selectedMonth && s.year === year);
    if (isDuplicate) {
      setError(`${months[selectedMonth - 1]} ${year} ist bereits erfasst`);
      return;
    }

    // Create entry
    const entry = {
      month: selectedMonth,
      year,
      amount: amountNum,
      note: note.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAdd(entry);
    
    // Reset form
    setAmount('');
    setNote('');
    setError('');
    
    // Select next available month
    const existingMonths = new Set([...existingSpesen.map(s => s.month), selectedMonth]);
    for (let month = 1; month <= 12; month++) {
      if (!existingMonths.has(month)) {
        setSelectedMonth(month);
        return;
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Schnell hinzufügen
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Month Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Monat</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-shadow"
          >
            {months.map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month} {year}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Betrag</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 pr-10 transition-shadow"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">€</span>
          </div>
        </div>

        {/* Note Input (Optional) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Notiz <span className="text-xs text-gray-400">(optional, max 200 Zeichen)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="z.B. Monatspauschale"
            maxLength={200}
            className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-shadow"
          />
          {note && (
            <p className="text-xs text-gray-400 mt-1.5">{note.length}/200</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          Hinzufügen
        </button>
      </form>
    </div>
  );
}
