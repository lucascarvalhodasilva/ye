"use client";

export default function NativeTimeInput({ value, onChange, className = "", ...props }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className={`flex-1 truncate pointer-events-none ${!value ? 'text-muted-foreground' : ''}`}>
        {value || "--:--"}
      </div>
      <input
        type="time"
        value={value}
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
        {...props}
      />
      <svg className="w-4 h-4 text-muted-foreground pointer-events-none ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}
