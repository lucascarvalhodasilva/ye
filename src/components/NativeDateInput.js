"use client";
import { useMemo } from 'react';

export default function NativeDateInput({ value, onChange, className = "", ...props }) {
  const displayValue = useMemo(() => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }, [value]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className={`flex-1 truncate pointer-events-none ${!value ? 'text-muted-foreground' : ''}`}>
        {displayValue || "TT.MM.JJJJ"}
      </div>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
        {...props}
      />
      <svg className="w-4 h-4 text-muted-foreground pointer-events-none ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
}
