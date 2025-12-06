import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';

export const useExpenses = () => {
  const { expenseEntries, addExpenseEntry, deleteExpenseEntry, selectedYear } = useAppContext();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    date: '',
    amount: ''
  });

  const handleSubmit = (e, onSuccess) => {
    e.preventDefault();
    const newId = Date.now();
    addExpenseEntry({
      ...formData,
      id: newId,
      amount: parseFloat(formData.amount)
    });

    setFormData({
      description: '',
      date: '',
      amount: ''
    });

    if (onSuccess) {
      onSuccess(newId);
    }
  };

  const filteredEntries = useMemo(() => (expenseEntries || [])
    .filter(entry => new Date(entry.date).getFullYear() === parseInt(selectedYear))
    .sort((a, b) => new Date(b.date) - new Date(a.date)), 
  [expenseEntries, selectedYear]);

  const monthlyExpenses = useMemo(() => {
    const months = {};
    filteredEntries.forEach(entry => {
      const month = new Date(entry.date).getMonth();
      if (!months[month]) months[month] = 0;
      months[month] += entry.amount;
    });
    
    return Object.entries(months)
      .map(([month, amount]) => ({ month: parseInt(month), amount }))
      .sort((a, b) => b.month - a.month);
  }, [filteredEntries]);

  return {
    formData,
    setFormData,
    handleSubmit,
    filteredEntries,
    monthlyExpenses,
    deleteExpenseEntry,
    selectedYear,
    isFullScreen,
    setIsFullScreen
  };
};
