import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { validateFile } from '@/utils/fileValidation';

export const useEquipmentForm = () => {
  const { addEquipmentEntry, updateEquipmentEntry, equipmentEntries, deleteEquipmentEntry, taxRates } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    price: ''
  });
  const [tempReceipt, setTempReceipt] = useState(null); // Base64 string for preview
  const [tempReceiptPath, setTempReceiptPath] = useState(null); // Path to temp file in Cache
  const [tempReceiptType, setTempReceiptType] = useState('image'); // 'image' or 'pdf'
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [initialEditData, setInitialEditData] = useState(null);
  const [initialReceiptPath, setInitialReceiptPath] = useState(null);

  const nameSuggestions = [
    "Laptop", "Smartphone", "Monitor", "Tastatur", "Maus", "Headset", 
    "Drucker", "Scanner", "Bürostuhl", "Schreibtisch", "Lampe", 
    "Fachbuch", "Software-Lizenz", "Tablet", "Kamera"
  ];

  const takePicture = async (source) => {
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
      const tempPath = `temp/equipment/${tempFileName}`;

      await Filesystem.writeFile({
        path: tempPath,
        data: image.base64String,
        directory: Directory.Cache,
        recursive: true
      });

      // 2. Use for preview and store path
      setTempReceipt(image.base64String);
      setTempReceiptPath(tempPath);
      setTempReceiptType('image');
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  // Pick file from file system (including cloud storage on Android)
  const pickFile = () => {
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
            const tempPath = `temp/equipment/${tempFileName}`;

            await Filesystem.writeFile({
              path: tempPath,
              data: base64,
              directory: Directory.Cache,
              recursive: true
            });

            setTempReceipt(base64);
            setTempReceiptPath(tempPath);
            setTempReceiptType(validation.extension === 'pdf' ? 'pdf' : 'image');
            resolve(base64);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('File picker error:', error);
          resolve(null);
        }
      };

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    });
  };

  const saveReceiptFinal = async (entryId, dateStr) => {
    if (!tempReceiptPath) return null;

    try {
      // Read from Cache
      const file = await Filesystem.readFile({
        path: tempReceiptPath,
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
      const extension = tempReceiptType === 'pdf' ? 'pdf' : 'jpg';
      const fileNameInternal = `equipment_${entryId}_${timeStr}.${extension}`;

      // Write to Directory.Documents
      await Filesystem.writeFile({
        path: `receipts/${fileNameInternal}`,
        data: file.data,
        directory: Directory.Documents,
        recursive: true
      });

      // Cleanup Cache
      await Filesystem.deleteFile({
        path: tempReceiptPath,
        directory: Directory.Cache
      });

      return fileNameInternal;
    } catch (e) {
      console.error('Error saving receipt final:', e);
      return null;
    }
  };

  const removeReceipt = async () => {
    if (tempReceiptPath) {
      try {
        await Filesystem.deleteFile({
          path: tempReceiptPath,
          directory: Directory.Cache
        });
      } catch (e) {
        console.warn('Failed to delete temp file on remove:', e);
      }
    }
    setTempReceipt(null);
    setTempReceiptPath(null);
    setTempReceiptType('image');
  };

  const startEdit = async (entry) => {
    const editData = {
      name: entry.name,
      date: entry.date,
      price: entry.price
    };

    let loadedReceipt = null;
    let loadedPath = null;

    if (entry.receiptFileName) {
      try {
        // Try reading from Documents/receipts/
        let fileData;
        try {
          const file = await Filesystem.readFile({
            path: `receipts/${entry.receiptFileName}`,
            directory: Directory.Documents
          });
          fileData = file.data;
        } catch (e) {
          // Fallback to Data/receipts/
          try {
            const file = await Filesystem.readFile({
              path: `receipts/${entry.receiptFileName}`,
              directory: Directory.Data
            });
            fileData = file.data;
          } catch (e2) {
            console.warn("Could not find receipt file", e2);
          }
        }

        if (fileData) {
          // Write to temp cache
          const tempFileName = `restored_equipment_${Date.now()}.jpg`;
          const tempPath = `temp/equipment/${tempFileName}`;
          
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
    setTempReceipt(loadedReceipt);
    setTempReceiptPath(loadedPath);
    setInitialReceiptPath(loadedPath);
    setEditingId(entry.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInitialEditData(null);
    setInitialReceiptPath(null);
    setSubmitError(null);
    setTempReceipt(null);
    setTempReceiptPath(null);
    
    setFormData({
      name: '',
      date: '',
      price: ''
    });
  };

  const handleSubmit = async (e, onSuccess) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        setSubmitError("Bitte eine Bezeichnung eingeben.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.date) {
        setSubmitError("Bitte ein Kaufdatum auswählen.");
        setIsSubmitting(false);
        return;
      }

      const price = parseFloat(formData.price);
      if (!formData.price || isNaN(price) || price <= 0) {
        setSubmitError("Bitte einen gültigen Preis (> 0) eingeben.");
        setIsSubmitting(false);
        return;
      }

      const gwgLimit = taxRates?.gwgLimit || 952;
      const isDeductibleImmediately = price <= gwgLimit; 
      
      let deductibleAmount = 0;
      let status = '';

      if (isDeductibleImmediately) {
        deductibleAmount = price;
        status = 'Sofort absetzbar (GWG)';
      } else {
        const usefulLifeYears = 3;
        const purchaseDate = new Date(formData.date);
        const purchaseMonth = purchaseDate.getMonth(); 
        const monthsInYear = 12 - purchaseMonth;
        
        const monthlyDepreciation = price / (usefulLifeYears * 12);
        deductibleAmount = monthlyDepreciation * monthsInYear;
        
        status = `Abschreibung (3 Jahre) - ${monthsInYear} Monate anteilig`;
      }

      const newId = editingId || Date.now();
      let receiptFileName = null;
      
      // If editing, check if we need to update receipt
      if (editingId) {
        // If path changed or removed
        if (tempReceiptPath !== initialReceiptPath) {
          if (tempReceiptPath) {
             receiptFileName = await saveReceiptFinal(newId, formData.date);
          } else {
             receiptFileName = null; // Receipt removed
          }
        } else {
          // Keep existing receipt if not changed
          const existingEntry = equipmentEntries.find(e => e.id === editingId);
          receiptFileName = existingEntry ? existingEntry.receiptFileName : null;
        }
      } else {
        // New Entry
        if (tempReceiptPath) {
          receiptFileName = await saveReceiptFinal(newId, formData.date);
        }
      }

      const entryData = {
        ...formData,
        id: newId,
        price,
        deductibleAmount,
        status,
        receiptFileName
      };

      if (editingId) {
        updateEquipmentEntry(entryData);
      } else {
        addEquipmentEntry(entryData);
      }

      setFormData({
        name: '',
        date: '',
        price: ''
      });
      setTempReceipt(null);
      setTempReceiptPath(null);
      setEditingId(null);
      setInitialEditData(null);
      setInitialReceiptPath(null);
      setIsSubmitting(false);

      if (onSuccess) {
        onSuccess(newId);
      }
    } catch (error) {
      console.error('Error submitting equipment:', error);
      setSubmitError('Ein Fehler ist aufgetreten beim Speichern.');
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    tempReceipt,
    tempReceiptType,
    removeReceipt,
    nameSuggestions,
    takePicture,
    pickFile,
    handleSubmit,
    submitError,
    isSubmitting,
    editingId,
    startEdit,
    cancelEdit,
    hasChanges: editingId ? (
      JSON.stringify(formData) !== JSON.stringify(initialEditData) || 
      tempReceiptPath !== initialReceiptPath
    ) : true
  };
};
