import React from 'react';
import { formatDate } from '@/utils/dateFormatter';

export default function RecentActivities({ recentActivities }) {
  return (
    <div className="card-modern p-4">
      <h3 className="text-base font-semibold mb-3 text-foreground">Letzte Aktivitäten</h3>
      {recentActivities.length === 0 ? (
        <p className="text-muted-foreground text-sm">Keine Einträge vorhanden.</p>
      ) : (
        <div className="space-y-4">
          {recentActivities.map((entry, index) => (
            <div key={`${entry.id}-${index}`} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-foreground">{entry.type}</p>
                <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
              </div>
              <span className="text-sm font-medium text-primary">+{entry.amount.toFixed(2)} €</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
