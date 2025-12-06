"use client";
import { useDashboard } from './_features/hooks/useDashboard';
import DashboardKPIs from './_features/components/DashboardKPIs';
import RecentActivities from './_features/components/RecentActivities';

export default function Dashboard() {
  const {
    selectedYear,
    grandTotal,
    totalMeals,
    totalMileage,
    totalEquipment,
    totalEmployerReimbursement,
    totalExpenses,
    netTotal,
    recentActivities
  } = useDashboard();

  return (
    <div className="space-y-4 py-4 md:space-y-6 md:py-6 container-custom">
      <div className="flex justify-between items-center">
        <p className="text-sm md:text-base text-muted-foreground">Übersicht Ihrer steuerlichen Absetzungen für {selectedYear}.</p>
      </div>

      <DashboardKPIs 
        selectedYear={selectedYear}
        grandTotal={grandTotal}
        totalMeals={totalMeals}
        totalMileage={totalMileage}
        totalEquipment={totalEquipment}
        totalEmployerReimbursement={totalEmployerReimbursement}
        totalExpenses={totalExpenses}
        netTotal={netTotal}
      />

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <RecentActivities recentActivities={recentActivities} />
      </div>
    </div>
  );
}
