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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleBackdropClick}
      >
        {/* Side Nav Panel */}
        <div 
          className="fixed left-0 top-0 bottom-0 w-[80%] min-w-[320px] max-w-[500px] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto z-50 animate-slideInLeft"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-5 py-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">💶 Monatliche Spesen</h2>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">{year}</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Year Overview */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                📊 Jahresübersicht
              </h3>
              <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gesamt:</span>
                  <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                    {totalSpesen.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Durchschnitt:</span>
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    {averageSpesen.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Erfasst:</span>
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    {monthsWithData}/12
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Entries */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                📅 Monatliche Einträge
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {months.map((monthName, index) => {
                  const month = index + 1;
                  const spesen = getSpesenForMonth(month);
                  const isEditing = editingId === spesen?.id;

                  return (
                    <div
                      key={month}
                      className={`p-3 rounded-lg transition-colors ${
                        spesen 
                          ? 'bg-yellow-100 dark:bg-yellow-500/20 hover:bg-yellow-200 dark:hover:bg-yellow-500/30' 
                          : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {isEditing ? (
                        // Edit Mode
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{monthName}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20 rounded"
                                title="Speichern"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded"
                                title="Abbrechen"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 pr-8"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                          </div>
                          <input
                            type="text"
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Notiz (optional)"
                            maxLength={200}
                            className="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                          {error && (
                            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                          )}
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{monthName}</span>
                              {spesen ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                                    {spesen.amount.toFixed(2)} €
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEdit(spesen)}
                                      className="p-1 text-yellow-600 hover:bg-yellow-200 dark:hover:bg-yellow-500/30 rounded"
                                      title="Bearbeiten"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(spesen.id)}
                                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded"
                                      title="Löschen"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">−</span>
                              )}
                            </div>
                            {spesen?.note && !isEditing && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">{spesen.note}</p>
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
