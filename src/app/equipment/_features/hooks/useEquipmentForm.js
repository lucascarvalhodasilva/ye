import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const useEquipmentForm = () => {
  const { addEquipmentEntry, taxRates } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    price: ''
  });
  const [tempReceipt, setTempReceipt] = useState(null); // Base64 string for preview
  const [showCameraOptions, setShowCameraOptions] = useState(false);

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
      setTempReceipt(image.base64String);
      setShowCameraOptions(false);
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const saveReceiptToDisk = async (base64Data) => {
    try {
      const fileName = `receipt_${Date.now()}.jpg`;
      await Filesystem.writeFile({
        path: `receipts/${fileName}`,
        data: base64Data,
        directory: Directory.Data,
        recursive: true
      });
      return fileName;
    } catch (e) {
      console.error('Error saving receipt:', e);
      return null;
    }
  };

  const handleSubmit = async (e, onSuccess) => {
    e.preventDefault();
    const price = parseFloat(formData.price);
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

    let receiptFileName = null;
    if (tempReceipt) {
      receiptFileName = await saveReceiptToDisk(tempReceipt);
    }

    const newId = Date.now();
    addEquipmentEntry({
      ...formData,
      id: newId,
      price,
      deductibleAmount,
      status,
      receiptFileName
    });

    setFormData({
      name: '',
      date: '',
      price: ''
    });
    setTempReceipt(null);

    if (onSuccess) {
      onSuccess(newId);
    }
  };

  return {
    formData,
    setFormData,
    tempReceipt,
    setTempReceipt,
    showCameraOptions,
    setShowCameraOptions,
    nameSuggestions,
    takePicture,
    handleSubmit
  };
};
