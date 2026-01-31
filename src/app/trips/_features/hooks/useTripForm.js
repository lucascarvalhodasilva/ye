import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { calculateAllowance } from '../utils/tripCalculations';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { validateFile } from '@/utils/fileValidation';

/**
 * Default commute configuration
 */
const DEFAULT_COMMUTE = {
  car: { active: true, distance: 0 },
  motorcycle: { active: false, distance: 0 },
  bike: { active: false, distance: 0 },
  public_transport: { active: false, cost: '' }
};

/**
 * Hook to manage trip form state and submission logic.
 */
export const useTripForm = () => {
  const { 
    tripEntries,
    addTripEntry, 
    addMileageEntry, 
    deleteTripEntry,
    deleteMileageEntry,
    mileageEntries,
    taxRates, 
    getMileageRate, 
    defaultCommute 
  } = useAppContext();

  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    employerExpenses: 0,
    commute: DEFAULT_COMMUTE
  });

  const [autoAddStationTrips, setAutoAddStationTrips] = useState(true);
  const [tempPublicTransportReceipt, setTempPublicTransportReceipt] = useState(null);
  const [tempPublicTransportReceiptPath, setTempPublicTransportReceiptPath] = useState(null);
  const [tempPublicTransportReceiptType, setTempPublicTransportReceiptType] = useState('image'); // 'image' or 'pdf'
  const [editingId, setEditingId] = useState(null);
  const [initialEditData, setInitialEditData] = useState(null);
  const [initialReceiptPath, setInitialReceiptPath] = useState(null);

  const sanitizeCommute = (commute = {}) => {
    const next = { ...DEFAULT_COMMUTE, ...commute };

    ['car', 'motorcycle', 'bike'].forEach((mode) => {
      const rawDistance = parseFloat(commute[mode]?.distance);
      const distance = Number.isFinite(rawDistance) && rawDistance > 0 ? rawDistance : 0;
      next[mode] = {
        ...DEFAULT_COMMUTE[mode],
        ...commute[mode],
        distance,
        active: distance > 0 && !!commute[mode]?.active
      };
    });

    const rawCost = parseFloat(commute.public_transport?.cost);
    const cost = Number.isFinite(rawCost) && rawCost > 0 ? rawCost : 0;
    const ptActive = cost > 0 && !!commute.public_transport?.active;
    next.public_transport = {
      ...DEFAULT_COMMUTE.public_transport,
      ...commute.public_transport,
      cost: ptActive ? cost : '',
      active: ptActive
    };

    return next;
  };

  // Load saved form data from local storage (excluding dates - they should start empty)
  useEffect(() => {
    const savedData = localStorage.getItem('TRIPS_FORM_DATA');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Exclude commute and dates from loaded data - dates should start empty for new entries
        const { commute, date, endDate, startTime, endTime, ...rest } = parsed;
        setFormData(prev => ({ ...prev, ...rest }));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }, []);

  // Sync commute with default settings
  useEffect(() => {
    if (defaultCommute) {
      setFormData(prev => ({ ...prev, commute: defaultCommute }));
    }
  }, [defaultCommute]);

  // Save form data to local storage whenever it changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Don't save commute settings to persistence
      const { commute, ...dataToSave } = formData;
      localStorage.setItem('TRIPS_FORM_DATA', JSON.stringify(dataToSave));
    }, 500);

    return () => clearTimeout(timer);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const takePublicTransportPicture = async (source) => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source
      });

      // 1. Save to Cache temporarily
      const timestamp = Date.now();
      const tempFileName = `tmp_receipt_${timestamp}.jpg`;
      const tempPath = `temp/transport/${tempFileName}`;

      await Filesystem.writeFile({
        path: tempPath,
        data: image.base64String,
        directory: Directory.Cache,
        recursive: true
      });

      // 2. Use for preview and store path
      setTempPublicTransportReceipt(image.base64String);
      setTempPublicTransportReceiptPath(tempPath);
      setTempPublicTransportReceiptType('image');
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  // Pick file from file system (including cloud storage on Android)
  const pickPublicTransportFile = () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,.pdf';
      input.style.display = 'none';
      
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        // Validate file size and type
        const validation = validateFile(file);
        if (!validation.valid) {
          alert(validation.error);
          resolve(null);
          return;
        }

        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64 = event.target.result.split(',')[1]; // Remove data URL prefix
            
            // Save to Cache temporarily
            const timestamp = Date.now();
            const tempFileName = `tmp_receipt_${timestamp}.${validation.extension}`;
            const tempPath = `temp/transport/${tempFileName}`;

            await Filesystem.writeFile({
              path: tempPath,
              data: base64,
              directory: Directory.Cache,
              recursive: true
            });

            setTempPublicTransportReceipt(base64);
            setTempPublicTransportReceiptPath(tempPath);
            setTempPublicTransportReceiptType(validation.extension === 'pdf' ? 'pdf' : 'image');
            resolve(base64);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('File picker error:', error);
          resolve(null);
        }
        
        document.body.removeChild(input);
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(null);
      };

      document.body.appendChild(input);
      input.click();
    });
  };

  const removePublicTransportReceipt = async () => {
    if (tempPublicTransportReceiptPath) {
      try {
        await Filesystem.deleteFile({
          path: tempPublicTransportReceiptPath,
          directory: Directory.Cache
        });
      } catch (e) {
        console.warn('Failed to delete temp file on remove:', e);
      }
    }
    setTempPublicTransportReceipt(null);
    setTempPublicTransportReceiptPath(null);
    setTempPublicTransportReceiptType('image');
  };

  const savePublicTransportReceiptFinal = async (tripId, dateStr) => {
    if (!tempPublicTransportReceiptPath) return null;

    try {
      // Read from Cache
      const file = await Filesystem.readFile({
        path: tempPublicTransportReceiptPath,
        directory: Directory.Cache
      });

      // Format Timestamp: yyyymmddHHMM
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const HH = String(now.getHours()).padStart(2, '0');
      const MM = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${yyyy}${mm}${dd}${HH}${MM}`;

      // Define filenames with correct extension
      const extension = tempPublicTransportReceiptType === 'pdf' ? 'pdf' : 'jpg';
      const fileNameInternal = `transport_${tripId}_${timeStr}.${extension}`;

      // Write to Directory.Documents
      await Filesystem.writeFile({
        path: `receipts/${fileNameInternal}`,
        data: file.data,
        directory: Directory.Documents,
        recursive: true
      });

      // Cleanup Cache
      await Filesystem.deleteFile({
        path: tempPublicTransportReceiptPath,
        directory: Directory.Cache
      });

      return fileNameInternal;
    } catch (e) {
      console.error('Error saving receipt final:', e);
      return null;
    }
  };

  const handleSubmit = async (e, onSuccess) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const startDate = formData.date;
      const endDateInput = formData.endDate || formData.date;
      const startTime = formData.startTime;
      const endTime = formData.endTime;
      const isOngoing = !endTime;

      const hasOtherOngoing = tripEntries.some(entry => entry.isOngoing && (!editingId || entry.id !== editingId));
      if (!editingId && hasOtherOngoing) {
        setSubmitError('Es läuft bereits eine Reise. Bitte beende diese, bevor du eine neue startest.');
        setIsSubmitting(false);
        return;
      }

      if (!startDate || !startTime) {
        setSubmitError("Bitte Startdatum und Startzeit angeben.");
        setIsSubmitting(false);
        return;
      }

      // Validation for completed trips
      let finalEndDate = endDateInput;
      if (!isOngoing) {
        if (finalEndDate < startDate) {
          setSubmitError("Bitte Start- und Endzeitraum vollständig und gültig angeben.");
          setIsSubmitting(false);
          return;
        }

        if (startDate === finalEndDate && endTime <= startTime) {
          setSubmitError("Die Endzeit muss nach der Startzeit liegen.");
          setIsSubmitting(false);
          return;
        }

        // Auto-detect overnight if end time is before start time on same day
        if (startTime > endTime && (!formData.endDate || formData.endDate === formData.date)) {
          const d = new Date(formData.date);
          d.setDate(d.getDate() + 1);
          finalEndDate = d.toISOString().split('T')[0];
        }
      }

      // Check for overlapping trips (only when we have an end time)
      if (!isOngoing) {
        const newStart = new Date(`${formData.date}T${startTime}`);
        const newEnd = new Date(`${finalEndDate}T${endTime}`);

        const hasOverlap = tripEntries.some(entry => {
          if (editingId && entry.id === editingId) return false;
          const entryEndDate = entry.endDate || entry.date;
          const entryStart = new Date(`${entry.date}T${entry.startTime}`);
          const entryEnd = new Date(`${entryEndDate}T${entry.endTime}`);

          return newStart < entryEnd && newEnd > entryStart;
        });

        if (hasOverlap) {
          setSubmitError('Fehler: Diese Reise überschneidet sich mit einem bereits existierenden Eintrag.');
          setIsSubmitting(false);
          return;
        }
      }

      // Validation: Minimum 8 hours duration for allowance eligibility (only for completed trips)
      let duration = null;
      let rate = 0;
      let deductible = 0;
      let ticketCost = null;

      if (!isOngoing) {
        const tripStart = new Date(`${startDate}T${startTime}`);
        const tripEnd = new Date(`${finalEndDate}T${endTime}`);
        const durationInHours = (tripEnd - tripStart) / (1000 * 60 * 60);
        if (durationInHours < 8) {
          duration = durationInHours;
          rate = 0;
          deductible = 0;
        } else {
          const allowance = calculateAllowance(formData.date, startTime, finalEndDate, endTime, taxRates);
          duration = allowance.duration;
          rate = allowance.rate;
          deductible = Math.max(0, rate - parseFloat(formData.employerExpenses));
        }
      }

      const hasPublicTransportReceipt = !!tempPublicTransportReceiptPath;

      // Validation: If a receipt was uploaded for public transport, require a cost
      if (formData.commute.public_transport.active && hasPublicTransportReceipt) {
        ticketCost = parseFloat(formData.commute.public_transport.cost);
        if (!Number.isFinite(ticketCost) || ticketCost <= 0) {
          setSubmitError("Bitte Betrag für Öffi-Kosten eingeben.");
          setIsSubmitting(false);
          return;
        }
      } else if (formData.commute.public_transport.active) {
        ticketCost = parseFloat(formData.commute.public_transport.cost);
      }

      // Receipt is optional; only validate cost if a receipt was provided

      const sanitizedCommute = sanitizeCommute(formData.commute);
      const tripId = editingId || Date.now();

    // If editing: remove existing trip + related mileage entries first
    if (editingId) {
      deleteTripEntry(editingId);
      mileageEntries
        .filter(m => m.relatedTripId === editingId || m.date === formData.date || m.date === formData.endDate)
        .forEach(m => deleteMileageEntry(m.id));
    }

    addTripEntry({
      ...formData,
      id: tripId,
      endDate: isOngoing ? '' : finalEndDate,
      endTime: isOngoing ? '' : formData.endTime,
      duration,
      rate,
      deductible: parseFloat(deductible.toFixed(2)),
      isOngoing,
      commute: sanitizedCommute
    });

    // Auto-add station trips for active modes (only for completed trips)
    if (!isOngoing && autoAddStationTrips) {
      const modes = ['car', 'motorcycle', 'bike'];
      
      modes.forEach(mode => {
        if (sanitizedCommute[mode].active) {
          const dist = sanitizedCommute[mode].distance;
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
              relatedTripId: tripId
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
              relatedTripId: tripId
            });
          }
        }
      });
    }

    // Add Public Transport / Ticket Entry (only for completed trips)
    if (!isOngoing && sanitizedCommute.public_transport.active) {
      if (ticketCost > 0) {
        let receiptFileName = null;
        if (tempPublicTransportReceiptPath) {
          receiptFileName = await savePublicTransportReceiptFinal(tripId, formData.date);
        }

        addMileageEntry({
          date: formData.date,
          startLocation: 'Start',
          endLocation: 'Ziel',
          distance: 0,
          totalKm: 0,
          allowance: ticketCost,
          vehicleType: 'public_transport',
          purpose: 'Fahrtkosten (Tickets/Öffis)',
          relatedTripId: tripId,
          receiptFileName
        });
      }
    }

    // Reset form
    setFormData({
      destination: '',
      date: '',
      endDate: '',
      startTime: '',
      endTime: '',
      employerExpenses: 0,
      commute: defaultCommute || DEFAULT_COMMUTE
    });
    
    setTempPublicTransportReceipt(null);
    setTempPublicTransportReceiptPath(null);
    setEditingId(null);
    setInitialEditData(null);
    setInitialReceiptPath(null);
    setIsSubmitting(false);

    if (onSuccess) onSuccess(tripId);
  } catch (error) {
    console.error('Error submitting trip:', error);
    setSubmitError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    setIsSubmitting(false);
  }
};

  const startEdit = async (entry) => {
    const editData = {
      destination: entry.destination || '',
      date: entry.date || '',
      endDate: entry.endDate || entry.date || '',
      startTime: entry.startTime || '',
      endTime: entry.endTime || '',
      employerExpenses: entry.employerExpenses || 0,
      commute: entry.commute || defaultCommute || DEFAULT_COMMUTE
    };
    // Restore receipt if exists
    const relatedMileage = mileageEntries.filter(m => m.relatedTripId === entry.id);
    const transportEntry = relatedMileage.find(m => m.vehicleType === 'public_transport' && m.receiptFileName);
    
    let loadedReceipt = null;
    let loadedPath = null;
    let loadedReceiptType = 'image';

    if (transportEntry && transportEntry.receiptFileName) {
      // Determine file type from filename
      const isPdf = transportEntry.receiptFileName.toLowerCase().endsWith('.pdf');
      loadedReceiptType = isPdf ? 'pdf' : 'image';
      const extension = isPdf ? 'pdf' : 'jpg';

      try {
        // Try reading from Documents/receipts/ (where we save it)
        let fileData;
        try {
          const file = await Filesystem.readFile({
            path: `receipts/${transportEntry.receiptFileName}`,
            directory: Directory.Documents
          });
          fileData = file.data;
        } catch (e) {
          // Fallback to Data/receipts/ just in case
          try {
            const file = await Filesystem.readFile({
              path: `receipts/${transportEntry.receiptFileName}`,
              directory: Directory.Data
            });
            fileData = file.data;
          } catch (e2) {
            console.warn("Could not find receipt file", e2);
          }
        }

        if (fileData) {
          // Write to temp cache with correct extension
          const tempFileName = `restored_${Date.now()}.${extension}`;
          const tempPath = `temp/transport/${tempFileName}`;
          
          await Filesystem.writeFile({
            path: tempPath,
            data: fileData,
            directory: Directory.Cache,
            recursive: true
          });

          loadedReceipt = fileData;
          loadedPath = tempPath;
        }
      } catch (e) {
        console.error("Error restoring receipt for edit", e);
      }
    }

    setFormData(editData);
    setInitialEditData(editData);
    setTempPublicTransportReceipt(loadedReceipt);
    setTempPublicTransportReceiptPath(loadedPath);
    setTempPublicTransportReceiptType(loadedReceiptType);
    setInitialReceiptPath(loadedPath);
    setEditingId(entry.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInitialEditData(null);
    setInitialReceiptPath(null);
    setSubmitError(null);
    setTempPublicTransportReceipt(null);
    setTempPublicTransportReceiptPath(null);
    
    // Reset to defaults for new entry
    setFormData({
      destination: '',
      date: '',
      endDate: '',
      startTime: '',
      endTime: '',
      employerExpenses: 0,
      commute: defaultCommute || DEFAULT_COMMUTE
    });
  };

  return { 
    formData, 
    setFormData, 
    handleSubmit, 
    autoAddStationTrips, 
    setAutoAddStationTrips,
    submitError,
    isSubmitting,
    tempPublicTransportReceipt,
    tempPublicTransportReceiptType,
    takePublicTransportPicture,
    pickPublicTransportFile,
    removePublicTransportReceipt,
    editingId,
    startEdit,
    cancelEdit,
    hasChanges: editingId ? (() => {
      const normalizeForm = (form) => ({
        ...form,
        commute: sanitizeCommute(form?.commute)
      });
      const current = normalizeForm(formData);
      const initial = normalizeForm(initialEditData || {});
      return (
        JSON.stringify(current) !== JSON.stringify(initial) ||
        tempPublicTransportReceiptPath !== initialReceiptPath
      );
    })() : true
  };
}; 
