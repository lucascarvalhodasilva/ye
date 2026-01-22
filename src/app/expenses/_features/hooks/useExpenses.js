import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const useExpenses = () => {
  const { expenseEntries, addExpenseEntry, deleteExpenseEntry, selectedYear } = useAppContext();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    date: '',
    amount: ''
  });
  const [submitError, setSubmitError] = useState(null);

  // Receipt State
  const [tempExpenseReceipt, setTempExpenseReceipt] = useState(null);
  const [tempExpenseReceiptPath, setTempExpenseReceiptPath] = useState(null);
  const [tempExpenseReceiptType, setTempExpenseReceiptType] = useState('image'); // 'image' or 'pdf'
  const [showExpenseCameraOptions, setShowExpenseCameraOptions] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [initialEditData, setInitialEditData] = useState(null);
  const [initialReceiptPath, setInitialReceiptPath] = useState(null);

  const takeExpensePicture = async (source) => {
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
      const tempPath = `temp/expenses/${tempFileName}`;

      await Filesystem.writeFile({
        path: tempPath,
        data: image.base64String,
        directory: Directory.Cache,
        recursive: true
      });

      // 2. Use for preview and store path
      setTempExpenseReceipt(image.base64String);
      setTempExpenseReceiptPath(tempPath);
      setTempExpenseReceiptType('image');
      setShowExpenseCameraOptions(false);
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  // Pick file from file system (including cloud storage on Android)
  const pickExpenseFile = () => {
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

        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64 = event.target.result.split(',')[1]; // Remove data URL prefix
            
            // Save to Cache temporarily
            const timestamp = Date.now();
            const extension = file.name.split('.').pop() || 'jpg';
            const tempFileName = `tmp_receipt_${timestamp}.${extension}`;
            const tempPath = `temp/expenses/${tempFileName}`;

            await Filesystem.writeFile({
              path: tempPath,
              data: base64,
              directory: Directory.Cache,
              recursive: true
            });

            setTempExpenseReceipt(base64);
            setTempExpenseReceiptPath(tempPath);
            setTempExpenseReceiptType(extension.toLowerCase() === 'pdf' ? 'pdf' : 'image');
            setShowExpenseCameraOptions(false);
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

  const removeExpenseReceipt = async () => {
    if (tempExpenseReceiptPath) {
      try {
        await Filesystem.deleteFile({
          path: tempExpenseReceiptPath,
          directory: Directory.Cache
        });
      } catch (e) {
        console.warn('Failed to delete temp file on remove:', e);
      }
    }
    setTempExpenseReceipt(null);
    setTempExpenseReceiptPath(null);
    setTempExpenseReceiptType('image');
  };

  const saveExpenseReceiptFinal = async (entryId, dateStr) => {
    if (!tempExpenseReceiptPath) return null;

    try {
      // Read from Cache
      const file = await Filesystem.readFile({
        path: tempExpenseReceiptPath,
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

      // Define filenames
      const fileNameInternal = `expense_${entryId}_${timeStr}.jpg`;
      const fileNameUser = `ausgabe_${entryId}_${timeStr}.jpg`;

      // Write to Directory.Documents
      await Filesystem.writeFile({
        path: `receipts/${fileNameInternal}`,
        data: file.data,
        directory: Directory.Documents,
        recursive: true
      });

      // Cleanup Cache
      await Filesystem.deleteFile({
        path: tempExpenseReceiptPath,
        directory: Directory.Cache
      });

      return fileNameInternal;
    } catch (e) {
      console.error('Error saving receipt final:', e);
      return null;
    }
  };

  const loadReceipt = async (fileName) => {
    try {
      const file = await Filesystem.readFile({
        path: `receipts/${fileName}`,
        directory: Directory.Documents
      });
      return file.data;
    } catch (e) {
      console.error('Error loading receipt:', e);
      return null;
    }
  };

  const handleViewReceipt = async (entry) => {
    if (entry.receiptFileName) {
      const base64Data = await loadReceipt(entry.receiptFileName);
      if (base64Data) {
        setViewingReceipt(base64Data);
      }
    }
  };

  const handleSubmit = async (e, onSuccess) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.description.trim()) {
      setSubmitError("Bitte eine Beschreibung eingeben.");
      return;
    }

    if (!formData.date) {
      setSubmitError("Bitte ein Datum auswählen.");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      setSubmitError("Bitte einen gültigen Betrag (> 0) eingeben.");
      return;
    }

    const newId = editingId || Date.now();
    let receiptFileName = null;

    // If editing, check if we need to update receipt
    if (editingId) {
      // If path changed or removed
      if (tempExpenseReceiptPath !== initialReceiptPath) {
        if (tempExpenseReceiptPath) {
           receiptFileName = await saveExpenseReceiptFinal(newId, formData.date);
        } else {
           receiptFileName = null; // Receipt removed
        }
      } else {
        // Keep existing receipt if not changed
        const existingEntry = expenseEntries.find(e => e.id === editingId);
        receiptFileName = existingEntry ? existingEntry.receiptFileName : null;
      }
      
      // Remove old entry first
      deleteExpenseEntry(editingId);
    } else {
      // New Entry
      if (tempExpenseReceiptPath) {
        receiptFileName = await saveExpenseReceiptFinal(newId, formData.date);
      }
    }

    addExpenseEntry({
      ...formData,
      id: newId,
      amount: amount,
      receiptFileName
    });

    setFormData({
      description: '',
      date: '',
      amount: ''
    });
    setTempExpenseReceipt(null);
    setTempExpenseReceiptPath(null);
    setEditingId(null);
    setInitialEditData(null);
    setInitialReceiptPath(null);

    if (onSuccess) {
      onSuccess(newId);
    }
  };

  const startEdit = async (entry) => {
    const editData = {
      description: entry.description,
      date: entry.date,
      amount: entry.amount
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
          const tempFileName = `restored_expense_${Date.now()}.jpg`;
          const tempPath = `temp/expenses/${tempFileName}`;
          
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
    setTempExpenseReceipt(loadedReceipt);
    setTempExpenseReceiptPath(loadedPath);
    setInitialReceiptPath(loadedPath);
    setEditingId(entry.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInitialEditData(null);
    setInitialReceiptPath(null);
    setSubmitError(null);
    setTempExpenseReceipt(null);
    setTempExpenseReceiptPath(null);
    
    setFormData({
      description: '',
      date: '',
      amount: ''
    });
  };

  const filteredEntries = useMemo(() => (expenseEntries || [])
    .filter(entry => new Date(entry.date).getFullYear() === parseInt(selectedYear))
    .sort((a, b) => new Date(b.date) - new Date(a.date)), 
  [expenseEntries, selectedYear]);

  const monthlyExpenses = useMemo(() => {
    const months = {};
    filteredEntries.forEach(entry => {
      const month = new Date(entry.date).getMonth();
      if (!months[month]) months[month] = 0;
      months[month] += entry.amount;
    });
    
    return Object.entries(months)
      .map(([month, amount]) => ({ month: parseInt(month), amount }))
      .sort((a, b) => b.month - a.month);
  }, [filteredEntries]);

  return {
    formData,
    setFormData,
    handleSubmit,
    filteredEntries,
    monthlyExpenses,
    deleteExpenseEntry,
    selectedYear,
    isFullScreen,
    setIsFullScreen,
    submitError,
    // Receipt props
    tempExpenseReceipt,
    tempExpenseReceiptType,
    showExpenseCameraOptions,
    setShowExpenseCameraOptions,
    takeExpensePicture,
    pickExpenseFile,
    removeExpenseReceipt,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt,
    editingId,
    startEdit,
    cancelEdit,
    hasChanges: editingId ? (
      JSON.stringify(formData) !== JSON.stringify(initialEditData) || 
      tempExpenseReceiptPath !== initialReceiptPath
    ) : true
  };
};
