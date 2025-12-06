import React from 'react';
import NumberInput from '@/components/NumberInput';
import CustomDatePicker from '@/components/CustomDatePicker';

export default function ExpenseForm({ formData, setFormData, handleSubmit }) {
  return (
    <div className="card-modern">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Neue Ausgabe erfassen</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Beschreibung</label>
          <input
            type="text"
            required
            placeholder="z.B. Mittagessen, Kaffee"
            className="input-modern text-sm"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Datum</label>
          <CustomDatePicker
            required
            className="input-modern text-sm"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Betrag (Brutto €)</label>
          <NumberInput
            step="0.01"
            required
            className="input-modern text-sm"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
          />
        </div>
        
        <button type="submit" className="w-full btn-primary py-3 mt-4 shadow-lg shadow-primary/20">
          Hinzufügen
        </button>
      </form>
    </div>
  );
}
