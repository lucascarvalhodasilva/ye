import { useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { getMimeType, getFileType, base64ToUint8Array } from '@/utils/fileHelpers';

/**
 * Hook to manage trip list data and operations.
 */
export const useTripList = () => {
  const { 
    tripEntries, 
    deleteTripEntry, 
    mileageEntries, 
    deleteMileageEntry, 
    selectedYear 
  } = useAppContext();

  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const loadReceipt = async (fileName) => {
    try {
      const file = await Filesystem.readFile({
        path: `receipts/${fileName}`,
        directory: Directory.Documents
      });
      
      const fileType = getFileType(fileName);
      const mimeType = getMimeType(fileName);
      
      if (fileType === 'pdf') {
        // For PDFs, return Uint8Array format for react-pdf
        return {
          data: { data: base64ToUint8Array(file.data) },
          type: 'pdf'
        };
      } else {
        // For images, return data URI
        return {
          data: `data:${mimeType};base64,${file.data}`,
          type: 'image'
        };
      }
    } catch (e) {
      console.error('Error loading receipt:', e);
      return null;
    }
  };

  const handleViewReceipt = async (fileName) => {
    const receipt = await loadReceipt(fileName);
    if (receipt) {
      setViewingReceipt(receipt);
    } else {
      alert('Beleg konnte nicht geladen werden.');
    }
  };

  const tripEntriesSorted = useMemo(() => 
    [...tripEntries].sort((a, b) => {
      if (a.isOngoing && !b.isOngoing) return -1;
      if (!a.isOngoing && b.isOngoing) return 1;
      return new Date(b.date) - new Date(a.date);
    }), 
  [tripEntries]);

  const handleDeleteEntry = (entryId, entryDate, entryEndDate) => {
    deleteTripEntry(entryId);
    
    // Delete by relatedTripId
    const relatedMileage = mileageEntries.filter(m => m.relatedTripId === entryId);
    if (relatedMileage.length > 0) {
      relatedMileage.forEach(m => deleteMileageEntry(m.id));
    } else {
      // Fallback for legacy entries
      const legacyMileage = mileageEntries.filter(m => 
        !m.relatedTripId && 
        (m.date === entryDate || (entryEndDate && m.date === entryEndDate))
      );
      legacyMileage.forEach(m => deleteMileageEntry(m.id));
    }
  };

  return {
    tripEntries: tripEntriesSorted,
    mileageEntries,
    handleDeleteEntry,
    selectedYear,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt,
    isFullScreen,
    setIsFullScreen
  };
};
