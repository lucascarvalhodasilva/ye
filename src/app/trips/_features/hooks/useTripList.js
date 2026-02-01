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

  const handleDeleteEntry = (entryId) => {
    // Transport records are nested within the trip entry
    // deleteTripEntry will handle deletion of receipt files from transportRecords
    deleteTripEntry(entryId);
  };

  return {
    tripEntries: tripEntriesSorted,
    handleDeleteEntry,
    selectedYear,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt,
    isFullScreen,
    setIsFullScreen
  };
};
