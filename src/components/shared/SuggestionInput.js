"use client";
import { useState, useRef, useEffect } from 'react';

export default function SuggestionInput({ 
  value, 
  onChange, 
  suggestions = [], 
  placeholder = "", 
  className = "",
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Check if current value matches a suggestion exactly
  const isChip = suggestions.includes(value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion) => {
    onChange({ target: { value: suggestion } });
    setIsOpen(false);
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange({ target: { value: "" } });
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes((value || "").toLowerCase()) && s !== value
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className={`relative flex items-center min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={() => {
          if (!isChip && inputRef.current) inputRef.current.focus();
          setIsOpen(true);
        }}
      >
        {isChip ? (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium animate-in zoom-in-95 duration-200">
            <span>{value}</span>
            <button 
              type="button"
              onClick={clearSelection}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none min-w-0"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(true);
            }}
            required={required}
          />
        )}
        
        {/* Chevron Icon */}
        <div className="ml-auto pl-2 text-muted-foreground">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (filteredSuggestions.length > 0 || (!value && suggestions.length > 0)) && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border border-border shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="p-1 max-h-60 overflow-auto">
            {(value ? filteredSuggestions : suggestions).map((suggestion) => (
              <div
                key={suggestion}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                onClick={() => handleSelect(suggestion)}
              >
                {suggestion}
              </div>
            ))}
            {filteredSuggestions.length === 0 && value && !isChip && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground italic">
                "{value}" wird als neuer Wert übernommen
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
