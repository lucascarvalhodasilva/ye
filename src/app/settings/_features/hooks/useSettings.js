import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export const useSettings = () => {
  const { 
    defaultCommute,
    setDefaultCommute,
    taxRates,
    setTaxRates
  } = useAppContext();

  // Local state for manual saving
  const [localDefaultCommute, setLocalDefaultCommute] = useState(defaultCommute || {
    car: { active: true, distance: 0 },
    motorcycle: { active: false, distance: 0 },
    bike: { active: false, distance: 0 },
    public_transport: { active: false, cost: '' }
  });
  const [localTaxRates, setLocalTaxRates] = useState(taxRates);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with context on mount or when context updates (if no local changes)
  useEffect(() => {
    if (!hasChanges) {
      setLocalDefaultCommute(defaultCommute || {
        car: { active: true, distance: 0 },
        motorcycle: { active: false, distance: 0 },
        bike: { active: false, distance: 0 },
        public_transport: { active: false, cost: '' }
      });
      setLocalTaxRates(taxRates);
    }
  }, [defaultCommute, taxRates, hasChanges]);

  const handleTaxRateChange = (e) => {
    const { name, value } = e.target;
    setLocalTaxRates(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setDefaultCommute(localDefaultCommute);
      setTaxRates(localTaxRates);
      setHasChanges(false);
      setIsSaving(false);
    }, 1300);
  };

  return {
    localDefaultCommute,
    setLocalDefaultCommute,
    localTaxRates,
    handleTaxRateChange,
    hasChanges,
    setHasChanges,
    isSaving,
    handleSave,
    taxRates // Needed for displaying current values
  };
};
