"use client";
import React from 'react';

export default function NumberInput({ value, onChange, name, className, placeholder, step, required, min, max, autoFocus }) {
  return (
    <input
      type="number"
      name={name}
      className={className}
      placeholder={placeholder}
      value={value === undefined || value === null ? '' : value}
      onChange={onChange}
      step={step}
      required={required}
      min={min}
      max={max}
      autoFocus={autoFocus}
      autoComplete="off"
      onWheel={(e) => e.target.blur()} // Prevent scroll changing value
    />
  );
}
