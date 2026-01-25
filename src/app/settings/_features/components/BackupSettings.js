import { useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import JSZip from 'jszip';
import { LoadingButton } from '@/components/shared/skeletons';

export default function BackupSettings() {
  const {
    tripEntries,
    mileageEntries,
    equipmentEntries,
    expenseEntries,
    monthlyEmployerExpenses,
    defaultCommute,
    taxRates,
    selectedYear,
    importData
  } = useAppContext();

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState(null); // 'success' | 'error'
  
  const [isExportingReceipts, setIsExportingReceipts] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // { type: 'success' | 'error', message }

  // Restore state
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedName, setSelectedName] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setBackupStatus(null);

    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        mealEntries: tripEntries,
        mileageEntries,
        equipmentEntries,
        expenseEntries,
        monthlyEmployerExpenses,
        defaultCommute,
        taxRates,
        selectedYear
      }
    };

    try {
      if (!Capacitor.isNativePlatform()) {
        // Web-Fallback: ZIP erzeugen und Download/Save-Dialog anbieten
        const zip = new JSZip();
        zip.file('backup.json', JSON.stringify(backupData, null, 2));
        const blob = await zip.generateAsync({ type: 'blob' });

        if (window.showSaveFilePicker) {
          const handle = await window.showSaveFilePicker({
            suggestedName: `backup_full_${Date.now()}.zip`,
            types: [{
              description: 'Backup ZIP',
              accept: { 'application/zip': ['.zip'] }
            }]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } else if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === 'function') {
          // Legacy Edge/IE Save Dialog
          window.navigator.msSaveOrOpenBlob(blob, `backup_full_${Date.now()}.zip`);
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup_full_${Date.now()}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        setBackupStatus('success'); 
        setTimeout(() => setBackupStatus(null), 3000);
      } else {
        const timestamp = Date.now();
        const zip = new JSZip();
        let sharedSuccessfully = false;

        // Backup JSON hinzufügen
        zip.file('backup.json', JSON.stringify(backupData, null, 2));

        // Belege aus receipts hinzufügen (falls vorhanden)
        try {
          const dir = await Filesystem.readdir({
            path: 'receipts',
            directory: Directory.Documents
          });
          const files = dir.files || dir;
          if (files && files.length > 0) {
            for (const f of files) {
              const name = f.name || f;
              if (!name) continue;
              try {
                const file = await Filesystem.readFile({
                  path: `receipts/${name}`,
                  directory: Directory.Documents
                });
                zip.file(`receipts/${name}`, file.data, { base64: true });
              } catch (readErr) {
                console.warn(`Beleg ${name} konnte nicht ins Backup aufgenommen werden:`, readErr);
              }
            }
          }
        } catch (dirErr) {
          // Ordner existiert evtl. nicht – ignorieren
        }

        const zipBase64 = await zip.generateAsync({ type: 'base64' });
        const zipPath = `backup_full_${timestamp}.zip`;

        // Datei nur temporär (Cache) ablegen, damit Nutzer den Zielort über Share wählt
        const zipResult = await Filesystem.writeFile({
          path: zipPath,
          data: zipBase64,
          directory: Directory.Cache,
          recursive: true
        });

        // Share-Sheet öffnen, damit Nutzer Ziel wählen kann; danach temporäre Datei entfernen
        try {
          const uriResult = await Filesystem.getUri({
            path: zipPath,
            directory: Directory.Cache
          });
          const shareResult = await Share.share({
            title: 'Backup speichern',
            text: 'Backup-Archiv teilen oder extern ablegen.',
            url: uriResult.uri
          });
          if (shareResult && shareResult.activityType) {
            sharedSuccessfully = true;
          }
        } catch (shareErr) {
          console.warn('Share nicht möglich, temporäres Backup im Cache abgelegt:', shareErr);
        } finally {
          try {
            await Filesystem.deleteFile({
              path: zipPath,
              directory: Directory.Cache
            });
          } catch (deleteErr) {
            console.warn('Temporäre Backup-Datei konnte nicht gelöscht werden:', deleteErr);
          }
        }
        
        if (sharedSuccessfully) {
          setBackupStatus('success');
          setTimeout(() => setBackupStatus(null), 3000);
        } else {
          setBackupStatus(null);
        }
      }
    } catch (error) {
      console.error('Backup failed:', error);
      setBackupStatus('error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const exportReceipts = async () => {
    setIsExportingReceipts(true);
    setExportStatus(null);

    const year = Number(selectedYear);
    if (Number.isNaN(year)) {
      setExportStatus({ type: 'error', message: 'Ungültiges Jahr ausgewählt.' });
      setIsExportingReceipts(false);
      setTimeout(() => setExportStatus(null), 4000);
      return;
    }
    const rows = [["Typ", "Beschreibung", "Datum", "Betrag", "Datei"]];
    const zip = new JSZip();
    let added = 0;

    const addRow = (type, description, date, amount, fileName) => {
      rows.push([
        type,
        description || '',
        date || '',
        typeof amount === 'number' && !Number.isNaN(amount) ? amount.toFixed(2) : '',
        fileName || ''
      ]);
    };

    try {
      // Sammle alle Belege mit Jahr-Filter
      equipmentEntries
        .filter(e => e.receiptFileName && new Date(e.date).getFullYear() === year)
        .forEach(e => addRow('Betriebsmittel', e.name, e.date, e.price, e.receiptFileName));

      expenseEntries
        .filter(e => e.receiptFileName && new Date(e.date).getFullYear() === year)
        .forEach(e => addRow('Ausgabe', e.description, e.date, e.amount, e.receiptFileName));

      mileageEntries
        .filter(m => m.receiptFileName && m.vehicleType === 'public_transport' && new Date(m.date).getFullYear() === year)
        .forEach(m => addRow('Andere', m.purpose || 'ÖPNV', m.date, m.allowance, m.receiptFileName));

      if (rows.length <= 1) {
        setExportStatus({ type: 'error', message: 'Keine Belege für dieses Jahr gefunden.' });
        setIsExportingReceipts(false);
        setTimeout(() => setExportStatus(null), 4000);
        return;
      }

      // Dateien ins ZIP legen
      for (let i = 1; i < rows.length; i++) {
        const fileName = rows[i][4];
        if (!fileName) continue;
        try {
          const file = await Filesystem.readFile({
            path: `receipts/${fileName}`,
            directory: Directory.Documents
          });
          zip.file(fileName, file.data, { base64: true });
          added += 1;
        } catch (e) {
          console.warn(`Beleg ${fileName} konnte nicht exportiert werden:`, e);
        }
      }

      const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
      zip.file('index.csv', csv);

      if (Capacitor.isNativePlatform()) {
        const zipBase64 = await zip.generateAsync({ type: 'base64' });
        const zipPath = `receipts_export_${year}.zip`;
        const result = await Filesystem.writeFile({
          path: zipPath,
          data: zipBase64,
          directory: Directory.Documents,
          recursive: true
        });

        // Share-Sheet, damit Nutzer Ziel wählen kann
        let sharedSuccessfully = false;
        try {
          const shareResult = await Share.share({
            title: `Belege ${year}`,
            text: `Exportierte Belege für ${year}`,
            url: result.uri,
            dialogTitle: 'Belege teilen/speichern'
          });
          if (Capacitor.getPlatform() === 'ios') {
            sharedSuccessfully = !!shareResult?.activityType;
          } else {
            // Android liefert meist keine activityType; Share-Aufruf ohne Fehler werten wir als Erfolg
            sharedSuccessfully = true;
          }
        } catch (shareErr) {
          console.warn('Share nicht möglich, Datei liegt in Documents:', shareErr);
        }

        if (sharedSuccessfully) {
          setExportStatus({
            type: 'success',
            message: `Export fertig: ${added} Belege in ${zipPath} gespeichert.`
          });
        } else {
          setExportStatus(null); // Abbruch: keine Erfolgsmeldung
        }
      } else {
        // Web Fallback
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipts_export_${year}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExportStatus({
          type: 'success',
          message: `Export (${added} Belege) wurde heruntergeladen.`
        });
      }
    } catch (e) {
      console.error('Export failed', e);
      setExportStatus({ type: 'error', message: 'Export fehlgeschlagen. Bitte erneut versuchen.' });
    } finally {
      setIsExportingReceipts(false);
      setTimeout(() => setExportStatus(null), 4000);
    }
  };

  // Restore Logic
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setSelectedName(file ? file.name : '');
    setRestoreStatus(null);
  };

  const parseBackupFromJsonString = (jsonString) => {
    const parsed = JSON.parse(jsonString);
    return parsed.data || parsed;
  };

  const writeReceiptsIfAny = async (zipInstance) => {
    if (!Capacitor.isNativePlatform() || !zipInstance) return { restored: 0, total: 0 };

    const entries = Object.values(zipInstance.files || {}).filter(
      (file) => file.name.startsWith('receipts/') && !file.dir
    );

    if (entries.length === 0) return { restored: 0, total: 0 };

    try {
      await Filesystem.mkdir({
        path: 'receipts',
        directory: Directory.Documents,
        recursive: true
      });
    } catch (e) {
      // ignore if it already exists
    }

    let restored = 0;
    for (const entry of entries) {
      try {
        const base64 = await entry.async('string'); // stored as base64 string
        const name = entry.name.replace(/^receipts\//, '');
        
        // Validate filename for security: prevent path traversal attacks
        if (name.includes('/') || name.includes('\\') || name.includes('..')) {
          console.warn(`Invalid filename in backup (path traversal attempt): ${entry.name}`);
          continue;
        }
        
        // Validate filename pattern: only allow safe characters and valid extensions
        if (!/^[\w\-]+\.(jpg|jpeg|png|pdf|gif|webp)$/i.test(name)) {
          console.warn(`Invalid filename pattern in backup: ${name}`);
          continue;
        }
        
        await Filesystem.writeFile({
          path: `receipts/${name}`,
          data: base64,
          directory: Directory.Documents,
          recursive: true
        });
        restored += 1;
      } catch (err) {
        console.warn(`Receipt ${entry.name} konnte nicht wiederhergestellt werden:`, err);
      }
    }

    return { restored, total: entries.length };
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setRestoreStatus({ type: 'error', message: 'Bitte zuerst eine Backup-Datei auswählen (ZIP oder backup.json).' });
      return;
    }

    setIsRestoring(true);
    setRestoreStatus(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const fileNameLower = selectedFile.name.toLowerCase();
      let backupData = null;
      let receiptsInfo = { restored: 0, total: 0 };

      if (fileNameLower.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const backupFile = zip.file('backup.json');
        if (!backupFile) {
          throw new Error('In der ZIP wurde keine backup.json gefunden.');
        }
        const backupString = await backupFile.async('string');
        backupData = parseBackupFromJsonString(backupString);
        receiptsInfo = await writeReceiptsIfAny(zip);
      } else {
        const backupString = new TextDecoder().decode(arrayBuffer);
        backupData = parseBackupFromJsonString(backupString);
      }

      if (!backupData) {
        throw new Error('Backup enthält keine Daten.');
      }

      const success = importData(backupData);
      if (!success) {
        throw new Error('Import fehlgeschlagen.');
      }

      const receiptNote =
        receiptsInfo.total > 0
          ? `Belege wiederhergestellt: ${receiptsInfo.restored}/${receiptsInfo.total}.`
          : 'Keine Belege im Backup gefunden.';

      setRestoreStatus({
        type: 'success',
        message: `Backup geladen. ${receiptNote}`
      });
    } catch (e) {
      console.error('Restore failed:', e);
      const message = e?.message || 'Wiederherstellung fehlgeschlagen.';
      setRestoreStatus({ type: 'error', message });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="card-modern flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Datensicherung</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Erstellen Sie ein Backup als ZIP (inkl. Daten und Belegen) und wählen Sie den Speicherort über das Share-Menü.
          </p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div className="flex items-center space-x-4">
          <LoadingButton
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            isLoading={isBackingUp}
            className="btn-secondary min-w-[200px] flex items-center justify-center"
          >
            {isBackingUp ? 'Sicherung läuft...' : 'Backup erstellen'}
          </LoadingButton>

          {backupStatus === 'success' && (
            <span className="text-green-500 text-sm font-medium animate-in fade-in slide-in-from-left-2">
              ✓ Backup erfolgreich erstellt
            </span>
          )}
          
          {backupStatus === 'error' && (
            <span className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-left-2">
              ⚠ Fehler beim Erstellen
            </span>
          )}
        </div>

        <div className="pt-6 border-t border-border space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-1">
            <h3 className="text-base font-medium text-foreground">Backup wiederherstellen</h3>
            <p className="text-sm text-muted-foreground">
              Wählen Sie ein Backup aus Ihren Dateien (ZIP mit backup.json oder die entpackte backup.json). Die Daten werden sofort überschrieben.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <input
              type="file"
              accept=".zip,.json,application/zip,application/json"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />

            <div className="flex items-center space-x-4">
              <LoadingButton
                onClick={() => {
                  if (selectedFile) {
                    handleRestore();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={isRestoring}
                isLoading={isRestoring}
                className="btn-secondary min-w-[200px] flex items-center justify-center"
              >
                {isRestoring ? (
                  'Wird wiederhergestellt...'
                ) : selectedFile ? (
                  'Backup laden'
                ) : (
                  'Datei wählen'
                )}
              </LoadingButton>

              {selectedFile && !isRestoring && !restoreStatus && (
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedName('');
                    setRestoreStatus(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground px-2"
                  title="Auswahl aufheben"
                >
                  ✕
                </button>
              )}

              {restoreStatus && (
                <span
                  className={`${restoreStatus.type === 'success' ? 'text-green-500' : 'text-destructive'} text-sm font-medium animate-in fade-in slide-in-from-left-2`}
                >
                  {restoreStatus.message}
                </span>
              )}
            </div>

            {selectedFile && !restoreStatus && (
               <p className="text-xs text-muted-foreground pl-1">
                 Datei: {selectedName}
               </p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-border space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-1">
            <h3 className="text-base font-medium text-foreground">Belege exportieren</h3>
            <p className="text-sm text-muted-foreground">
              Laden Sie Kopien aller Belege für das ausgewählte Jahr als ZIP-Archiv herunter.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <LoadingButton
              onClick={exportReceipts}
              disabled={isExportingReceipts}
              isLoading={isExportingReceipts}
              className="btn-secondary min-w-[200px] flex items-center justify-center"
            >
              {isExportingReceipts ? 'Export läuft...' : `Export ${selectedYear}`}
            </LoadingButton>

            {exportStatus && (
              <span className={`${exportStatus.type === 'success' ? 'text-green-500' : 'text-destructive'} text-sm font-medium animate-in fade-in slide-in-from-left-2`}>
                {exportStatus.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
