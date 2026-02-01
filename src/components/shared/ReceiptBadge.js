'use client';

/**
 * Receipt Badge Component
 * Small visual indicator showing that an entry has an attached receipt
 * Appears next to list item labels - uses same yellow color and receipt icon as receipt action button
 */
export default function ReceiptBadge() {
  return (
    <span 
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 shrink-0"
      title="Beleg vorhanden"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </span>
  );
}
