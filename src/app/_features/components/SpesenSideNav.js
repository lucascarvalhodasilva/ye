"use client";
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import SpesenQuickAdd from './SpesenQuickAdd';

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
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const [error, setError] = useState('');

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

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
      // Prevent body scroll when side nav is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAdd = (entry) => {
    addMonthlyEmployerExpense(entry);
  };

  const handleEdit = (spesen) => {
    setEditingId(spesen.id);
    setEditAmount(spesen.amount.toString());
    setEditNote(spesen.note || '');
    setError('');
  };

  const handleSaveEdit = () => {
    setError('');
    
    const amountNum = parseFloat(editAmount);
    if (!editAmount || isNaN(amountNum) || amountNum < 0) {
      setError('Bitte geben Sie einen gültigen Betrag ein (≥ 0)');
      return;
    }

    if (editNote && editNote.length > 200) {
      setError('Notiz darf maximal 200 Zeichen haben');
      return;
    }

    updateMonthlyEmployerExpense(editingId, {
      amount: amountNum,
      note: editNote.trim(),
      updatedAt: new Date().toISOString()
    });

    setEditingId(null);
    setEditAmount('');
    setEditNote('');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setEditNote('');
    setError('');
  };

  const handleDelete = (id) => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      deleteMonthlyEmployerExpense(id);
    }
  };

  // Get spesen for a specific month, or null if not exists
  const getSpesenForMonth = (month) => {
    return yearSpesen.find(s => s.month === month) || null;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
        onClick={handleBackdropClick}
      >
        {/* Side Nav Panel */}
        <div 
          className="fixed left-0 top-0 bottom-0 w-[80%] min-w-[320px] max-w-[500px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-y-auto z-[70] animate-slideInLeft"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-5 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Monatliche Spesen</h2>
                  <span className="text-xs text-gray-500 font-medium">{year}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Year Overview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Jahresübersicht
                </h3>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Gesamt</span>
                  <span className="text-xl font-bold text-yellow-700">
                    {totalSpesen.toFixed(2)} €
                  </span>
                </div>
                <div className="h-px bg-yellow-200/50"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Durchschnitt</span>
                  <span className="text-base font-semibold text-yellow-600">
                    {averageSpesen.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Erfasst</span>
                  <span className="text-base font-semibold text-yellow-600">
                    {monthsWithData}/12
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Entries */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Monatliche Einträge
                </h3>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {months.map((monthName, index) => {
                  const month = index + 1;
                  const spesen = getSpesenForMonth(month);
                  const isEditing = editingId === spesen?.id;

                  return (
                    <div
                      key={month}
                      className={`p-4 rounded-xl transition-all duration-200 border ${
                        spesen 
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:shadow-md hover:border-yellow-300' 
                          : 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {isEditing ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">{monthName}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Speichern"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Abbrechen"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 pr-8 transition-shadow"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">€</span>
                          </div>
                          <input
                            type="text"
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Notiz (optional)"
                            maxLength={200}
                            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-shadow"
                          />
                          {error && (
                            <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg">{error}</p>
                          )}
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-900">{monthName}</span>
                              {spesen ? (
                                <div className="flex items-center gap-3">
                                  <span className="text-base font-bold text-yellow-700">
                                    {spesen.amount.toFixed(2)} €
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEdit(spesen)}
                                      className="p-1.5 hover:bg-yellow-100 rounded-lg transition-colors"
                                      title="Bearbeiten"
                                    >
                                      <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(spesen.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Löschen"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 font-medium">−</span>
                              )}
                            </div>
                            {spesen?.note && !isEditing && (
                              <p className="text-xs text-gray-500 mt-2 truncate italic">{spesen.note}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Form */}
            <SpesenQuickAdd
              year={year}
              onAdd={handleAdd}
              existingSpesen={yearSpesen}
            />
          </div>
        </div>
      </div>
    </>
  );
}
