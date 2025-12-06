import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { calculateAllowance } from '../utils/tripCalculations';

/**
 * Hook to manage trip form state and submission logic.
 */
export const useTripForm = () => {
  const { 
    mealEntries,
    addMealEntry, 
    addMileageEntry, 
    taxRates, 
    getMileageRate, 
    defaultCommute 
  } = useAppContext();

  const [formData, setFormData] = useState({
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    employerExpenses: 0,
    commute: {
      car: { active: true, distance: 0 },
      motorcycle: { active: false, distance: 0 },
      bike: { active: false, distance: 0 },
      public_transport: { active: false, cost: '' }
    }
  });

  const [autoAddStationTrips, setAutoAddStationTrips] = useState(true);

  // Load saved form data from local storage
  useEffect(() => {
    const savedData = localStorage.getItem('MEALS_FORM_DATA');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }, []);

  // Save form data to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('MEALS_FORM_DATA', JSON.stringify(formData));
  }, [formData]);

  // Sync with default commute settings
  useEffect(() => {
    if (defaultCommute) {
      setAutoAddStationTrips(true);
      setFormData(prev => ({
        ...prev,
        commute: {
          ...prev.commute,
          car: { 
            active: defaultCommute.car.active, 
            distance: prev.commute.car.distance || defaultCommute.car.distance 
          },
          motorcycle: { 
            active: defaultCommute.motorcycle.active, 
            distance: prev.commute.motorcycle.distance || defaultCommute.motorcycle.distance 
          },
          bike: { 
            active: defaultCommute.bike.active, 
            distance: prev.commute.bike.distance || defaultCommute.bike.distance 
          },
          public_transport: { 
            active: defaultCommute.public_transport.active, 
            cost: prev.commute.public_transport.cost || defaultCommute.public_transport.cost 
          }
        }
      }));
    }
  }, [defaultCommute]);

  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = (e, onSuccess) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Auto-detect overnight if end time is before start time on same day
    let finalEndDate = formData.endDate || formData.date;
    if (formData.startTime > formData.endTime && (!formData.endDate || formData.endDate === formData.date)) {
       const d = new Date(formData.date);
       d.setDate(d.getDate() + 1);
       finalEndDate = d.toISOString().split('T')[0];
    }

    // Check for overlapping trips
    const newStart = new Date(`${formData.date}T${formData.startTime}`);
    const newEnd = new Date(`${finalEndDate}T${formData.endTime}`);

    const hasOverlap = mealEntries.some(entry => {
      const entryEndDate = entry.endDate || entry.date;
      const entryStart = new Date(`${entry.date}T${entry.startTime}`);
      const entryEnd = new Date(`${entryEndDate}T${entry.endTime}`);

      return newStart < entryEnd && newEnd > entryStart;
    });

    if (hasOverlap) {
      setSubmitError('Fehler: Diese Reise überschneidet sich mit einem bereits existierenden Eintrag.');
      return;
    }

    const { duration, rate } = calculateAllowance(formData.date, formData.startTime, finalEndDate, formData.endTime, taxRates);
    const deductible = Math.max(0, rate - parseFloat(formData.employerExpenses));

    const mealId = Date.now();

    addMealEntry({
      ...formData,
      id: mealId,
      endDate: finalEndDate,
      duration,
      rate,
      deductible: parseFloat(deductible.toFixed(2))
    });

    // Auto-add station trips for active modes
    if (autoAddStationTrips) {
      const modes = ['car', 'motorcycle', 'bike'];
      
      modes.forEach(mode => {
        if (formData.commute[mode].active) {
          const dist = formData.commute[mode].distance;
          if (dist > 0) {
            const ratePerKm = getMileageRate(mode);
            const allowance = parseFloat((dist * ratePerKm).toFixed(2));
            
            // Trip to station (Start Date)
            addMileageEntry({
              date: formData.date,
              startLocation: 'Zuhause',
              endLocation: 'Bahnhof',
              distance: dist,
              totalKm: dist,
              allowance: allowance,
              vehicleType: mode,
              purpose: 'Fahrt zum Bahnhof (Dienstreise Beginn)',
              relatedMealId: mealId
            });

            // Trip from station (End Date)
            addMileageEntry({
              date: formData.endDate || formData.date,
              startLocation: 'Bahnhof',
              endLocation: 'Zuhause',
              distance: dist,
              totalKm: dist,
              allowance: allowance,
              vehicleType: mode,
              purpose: 'Fahrt vom Bahnhof (Dienstreise Ende)',
              relatedMealId: mealId
            });
          }
        }
      });
    }

    // Add Public Transport / Ticket Entry
    if (formData.commute.public_transport.active) {
      const ticketCost = parseFloat(formData.commute.public_transport.cost);
      if (ticketCost > 0) {
        addMileageEntry({
          date: formData.date,
          startLocation: 'Start',
          endLocation: 'Ziel',
          distance: 0,
          totalKm: 0,
          allowance: ticketCost,
          vehicleType: 'public_transport',
          purpose: 'Fahrtkosten (Tickets/Öffis)',
          relatedMealId: mealId
        });
      }
    }

    // Reset form
    setFormData({ 
      ...formData, 
      startTime: '', 
      endTime: '', 
      endDate: '', 
      employerExpenses: 0,
      commute: {
        ...formData.commute,
        public_transport: { ...formData.commute.public_transport, cost: '' }
      }
    });

    if (onSuccess) onSuccess(mealId);
  };

  return { 
    formData, 
    setFormData, 
    handleSubmit, 
    autoAddStationTrips, 
    setAutoAddStationTrips,
    submitError
  };
};
