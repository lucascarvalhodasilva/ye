import { useState, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';

/**
 * Hook to manage monthly expenses logic.
 */
export const useMonthlyExpenses = () => {
  const { 
    monthlyEmployerExpenses, 
    addMonthlyEmployerExpense, 
    deleteMonthlyEmployerExpense,
    selectedYear 
  } = useAppContext();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseMonth, setExpenseMonth] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState('');

  const filteredMonthlyExpenses = useMemo(() => (monthlyEmployerExpenses || [])
    .filter(e => e && e.year === selectedYear)
    .sort((a, b) => (b?.month || 0) - (a?.month || 0)), [monthlyEmployerExpenses, selectedYear]);

  const handleClickWrapper = (month) => {
    handleMonthClick(month);
  };

  const handleMonthClick = (monthIndex) => {
    const existing = filteredMonthlyExpenses.find(e => e.month === monthIndex);
    setExpenseMonth({ year: selectedYear, month: monthIndex });
    setExpenseAmount(existing ? existing.amount : '');
    setShowExpenseModal(true);
  };

  const saveMonthlyExpense = (e) => {
    e.preventDefault();
    if (!expenseMonth) return;
    
    addMonthlyEmployerExpense({
      year: expenseMonth.year,
      month: expenseMonth.month,
      amount: parseFloat(expenseAmount) || 0
    });
    setShowExpenseModal(false);
  };

  return {
    showExpenseModal,
    setShowExpenseModal,
    expenseMonth,
    expenseAmount,
    setExpenseAmount,
    filteredMonthlyExpenses,
    handleClickWrapper,
    handleMonthClick,
    saveMonthlyExpense
  };
};
