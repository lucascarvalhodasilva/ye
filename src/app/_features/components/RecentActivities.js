import React from 'react';
import { formatDate } from '@/utils/dateFormatter';

/**
 * Icon mapping for different activity types
 * @param {string} type - The activity type
 * @returns {JSX.Element} The corresponding icon
 */
const getActivityIcon = (type) => {
  const iconClass = "w-4 h-4";
  
  switch (type?.toLowerCase()) {
    case 'fahrt':
    case 'fahrtkosten':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case 'verpflegung':
    case 'mahlzeit':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'arbeitsmittel':
    case 'equipment':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
  }
};

/**
 * @typedef {Object} Activity
 * @property {string|number} id - Unique identifier for the activity
 * @property {string} type - Type of activity (e.g., 'Fahrt', 'Verpflegung', 'Arbeitsmittel')
 * @property {string|Date} date - Date of the activity
 * @property {number} amount - Amount in euros
 */

/**
 * @typedef {Object} RecentActivitiesProps
 * @property {Activity[]} recentActivities - Array of recent activity entries
 */

/**
 * Component displaying a list of recent activities with type, date, and amount.
 * Shows an empty state when no activities are available.
 * 
 * @param {RecentActivitiesProps} props - Component props
 * @returns {JSX.Element} The rendered recent activities list
 * 
 * @example
 * <RecentActivities
 *   recentActivities={[
 *     { id: 1, type: 'Fahrt', date: '2025-01-15', amount: 45.50 },
 *     { id: 2, type: 'Verpflegung', date: '2025-01-14', amount: 28.00 },
 *   ]}
 * />
 */
export default function RecentActivities({ recentActivities }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/20">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Letzte Aktivitäten</h3>
          <p className="text-[10px] text-muted-foreground">Ihre neuesten Einträge</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Keine Einträge vorhanden</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Aktivitäten werden hier angezeigt</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((entry, index) => (
              <div 
                key={`${entry.id}-${index}`} 
                className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all group"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
                  {getActivityIcon(entry.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{entry.type}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDate(entry.date)}</p>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +{entry.amount.toFixed(2)} €
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
