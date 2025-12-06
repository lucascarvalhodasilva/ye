import React from 'react';

export default function DashboardKPIs({ 
  selectedYear, 
  grandTotal, 
  totalMeals, 
  totalMileage, 
  totalEquipment, 
  totalEmployerReimbursement, 
  totalExpenses, 
  netTotal 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card-modern bg-primary/10 border-primary/20 p-4 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-xs font-medium text-primary uppercase tracking-wider">Gesamt Absetzbar</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{grandTotal.toFixed(2)} €</span>
          </div>
          <p className="text-[10px] text-primary/70">Steuerjahr {selectedYear}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-primary/20">
          <div>
            <p className="text-[10px] text-primary/70 uppercase font-medium">Verpflegung</p>
            <p className="text-sm font-bold text-primary">{totalMeals.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-[10px] text-primary/70 uppercase font-medium">Fahrtkosten</p>
            <p className="text-sm font-bold text-primary">{totalMileage.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-[10px] text-primary/70 uppercase font-medium">Arbeitsmittel</p>
            <p className="text-sm font-bold text-primary">{totalEquipment.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-[10px] text-destructive/70 uppercase font-medium">Spesen</p>
            <p className="text-sm font-bold text-destructive">-{totalEmployerReimbursement.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      <div className="card-modern bg-secondary/20 border-border/50 p-4 flex flex-col justify-between gap-4 opacity-80 hover:opacity-100 transition-opacity">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Private Bilanz</h3>
          <p className="text-[10px] text-muted-foreground/60 mb-3">Optionale Übersicht (Nicht steuerlich relevant)</p>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Private Ausgaben</span>
              <span className="text-sm font-medium text-muted-foreground">-{totalExpenses.toFixed(2)} €</span>
            </div>
            
            <div className="border-t border-border/30"></div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-medium text-foreground">Gesamtbilanz</span>
              <span className={`text-lg font-bold ${netTotal >= 0 ? 'text-emerald-600/70' : 'text-red-600/70'}`}>
                {netTotal >= 0 ? '+' : ''}{netTotal.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/40 text-center">Nur für Ihre persönliche Übersicht</p>
      </div>
    </div>
  );
}
