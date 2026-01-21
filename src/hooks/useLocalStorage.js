/**
 * useLocalStorage Hook
 * Persist state to localStorage with automatic sync
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage state persistence
 * @param {string} key - LocalStorage key
 * @param {*} initialValue - Initial value if no stored value exists
 * @returns {[*, Function]} State value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
