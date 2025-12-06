"use client";
import { useState } from 'react';
import { useTripForm } from './_features/hooks/useTripForm';
import { useTripList } from './_features/hooks/useTripList';
import { useMonthlyExpenses } from './_features/hooks/useMonthlyExpenses';
import TripForm from './_features/components/TripForm';
import TripList from './_features/components/TripList';
import BalanceSheetScroller from './_features/components/BalanceSheetScroller';
import MonthlyExpenseModal from './_features/components/MonthlyExpenseModal';
import FullScreenTableView from './_features/components/FullScreenTableView';

export default function TripsPage() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const currentMonth = new Date().getMonth();

  const { 
    formData, 
    setFormData, 
    handleSubmit, 
    autoAddStationTrips, 
    setAutoAddStationTrips,
    submitError
  } = useTripForm();

  const handleFormSubmit = (e) => {
    handleSubmit(e, (newId) => {
      setHighlightId(newId);
      // Clear highlight after animation
      setTimeout(() => setHighlightId(null), 2000);
    });
  };

  const { 
    filteredMealEntries, 
    mileageEntries, 
    handleDeleteEntry, 
    selectedYear 
  } = useTripList();

  const {
    showExpenseModal,
    setShowExpenseModal,
    expenseMonth,
    expenseAmount,
    setExpenseAmount,
    filteredMonthlyExpenses,
    handleClickWrapper,
    handleMonthClick,
    saveMonthlyExpense
  } = useMonthlyExpenses();

  const monthlyDeductible = expenseMonth ? (() => {
    const monthIdx = expenseMonth.month;
    const year = parseInt(selectedYear);
    
    const mealSum = filteredMealEntries
      .filter(m => {
        const d = new Date(m.date);
        return d.getMonth() === monthIdx && d.getFullYear() === year;
      })
      .reduce((sum, m) => sum + (m.deductible || 0), 0);
      
    const mileageSum = mileageEntries
      .filter(m => {
        const d = new Date(m.date);
        return d.getMonth() === monthIdx && d.getFullYear() === year;
      })
      .reduce((sum, m) => sum + (m.allowance || 0), 0);
      
    return mealSum + mileageSum;
  })() : 0;

  return (
    <div className="space-y-8 py-8 container-custom">
      <p className="text-muted-foreground">Tragen Sie Ihre Abwesenheitszeiten ein – Verpflegungspauschalen und Fahrtkosten werden automatisch ermittelt.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="space-y-6 lg:col-span-1">
          <TripForm 
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleFormSubmit}
            submitError={submitError}
          />
        </div>

        {/* Right Column: List & Stats */}
        <div className="space-y-6 lg:col-span-2">
          <BalanceSheetScroller 
            filteredMonthlyExpenses={filteredMonthlyExpenses}
            filteredMealEntries={filteredMealEntries}
            mileageEntries={mileageEntries}
            selectedYear={selectedYear}
            handleClickWrapper={handleClickWrapper}
            handleMonthClick={handleMonthClick}
          />

          <TripList 
            filteredMealEntries={filteredMealEntries}
            mileageEntries={mileageEntries}
            handleDeleteEntry={handleDeleteEntry}
            selectedYear={selectedYear}
            setIsFullScreen={setIsFullScreen}
            highlightId={highlightId}
          />
        </div>
      </div>

      <MonthlyExpenseModal 
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        selectedMonth={expenseMonth?.month}
        expenseAmount={expenseAmount}
        setExpenseAmount={setExpenseAmount}
        handleSaveExpense={saveMonthlyExpense}
        monthlyDeductible={monthlyDeductible}
      />

      <FullScreenTableView 
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        filteredMealEntries={filteredMealEntries}
        mileageEntries={mileageEntries}
        selectedYear={selectedYear}
      />
    </div>
  );
}
