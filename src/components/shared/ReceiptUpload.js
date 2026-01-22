'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { CameraSource } from '@capacitor/camera';

const PDFViewerComponent = lazy(() => import('./PDFViewer'));

// Convert base64 to Uint8Array for react-pdf
const base64ToUint8Array = (base64) => {
  const cleaned = base64.replace(/^data:application\/pdf;base64,/, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export default function ReceiptUpload({
  receipt,
  receiptType = 'image',
  onTakePicture,
  onPickFile,
  onRemove,
  accentColor = 'rose',
  label = 'Beleg (optional)',
  showLabel = true
}) {
  const [showViewer, setShowViewer] = useState(false);
  const [pdfData, setPdfData] = useState(null);

  // Lock body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = showViewer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showViewer]);

  // Convert PDF for react-pdf
  useEffect(() => {
    if (showViewer && receiptType === 'pdf' && receipt) {
      try {
        setPdfData(base64ToUint8Array(receipt));
      } catch (e) {
        console.error('PDF conversion failed:', e);
      }
    } else {
      setPdfData(null);
    }
  }, [showViewer, receiptType, receipt]);

  // Color themes
  const themes = {
    rose: { border: 'border-rose-500/50', bg: 'bg-rose-500/5', icon: 'text-rose-600', iconBg: 'bg-rose-500/10', btn: 'bg-rose-500/10 hover:bg-rose-500/20', pdf: 'from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30' },
    purple: { border: 'border-purple-500/50', bg: 'bg-purple-500/5', icon: 'text-purple-600', iconBg: 'bg-purple-500/10', btn: 'bg-purple-500/10 hover:bg-purple-500/20', pdf: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30' },
    blue: { border: 'border-blue-500/50', bg: 'bg-blue-500/5', icon: 'text-blue-600', iconBg: 'bg-blue-500/10', btn: 'bg-blue-500/10 hover:bg-blue-500/20', pdf: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30' },
    emerald: { border: 'border-emerald-500/50', bg: 'bg-emerald-500/5', icon: 'text-emerald-600', iconBg: 'bg-emerald-500/10', btn: 'bg-emerald-500/10 hover:bg-emerald-500/20', pdf: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30' },
  };
  const colors = themes[accentColor] || themes.rose;

  return (
    <div>
      {showLabel && (
        <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide block mb-1.5">
          {label}
        </label>
      )}

      {!receipt ? (
        <div className="grid grid-cols-2 gap-3">
          <UploadButton icon={<CameraIcon />} title="Kamera" subtitle="Foto aufnehmen" colors={colors} onClick={() => onTakePicture?.(CameraSource.Camera)} />
          <UploadButton icon={<FolderIcon />} title="Datei" subtitle="Aus Dateien wählen" colors={colors} onClick={() => onPickFile?.()} />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-2 rounded-xl border border-border/50 bg-white/60 dark:bg-white/5">
          <Thumbnail receipt={receipt} receiptType={receiptType} colors={colors} onClick={() => setShowViewer(true)} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{receiptType === 'pdf' ? 'PDF Dokument' : 'Bild'}</p>
            <p className="text-[10px] text-muted-foreground">Beleg hochgeladen</p>
          </div>
          <div className="flex gap-1.5">
            <ActionButton icon={<RefreshIcon />} colors={colors} onClick={() => onPickFile?.()} />
            <ActionButton icon={<TrashIcon />} danger onClick={onRemove} />
          </div>
        </div>
      )}

      {/* Fullscreen Viewer */}
      {showViewer && receipt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 99999 }} onClick={() => setShowViewer(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          {receiptType === 'pdf' ? (
            <Suspense fallback={<Spinner />}>
              {pdfData ? (
                <div className="relative w-[92vw] h-[92vh]" onClick={(e) => e.stopPropagation()}>
                  <PDFViewerComponent source={{ data: pdfData }} onClose={() => setShowViewer(false)} />
                </div>
              ) : (
                <LoadingState onCancel={() => setShowViewer(false)} />
              )}
            </Suspense>
          ) : (
            <ImageViewer src={`data:image/jpeg;base64,${receipt}`} onClose={() => setShowViewer(false)} />
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// Components
const UploadButton = ({ icon, title, subtitle, colors, onClick }) => (
  <button type="button" onClick={onClick} className={`p-3 rounded-xl border-2 border-dashed ${colors.border} ${colors.bg} flex flex-col items-center gap-2 group transition-all`}>
    <div className={`w-10 h-10 rounded-xl ${colors.iconBg} group-hover:opacity-80 flex items-center justify-center transition-opacity`}>
      <span className={colors.icon}>{icon}</span>
    </div>
    <div className="text-center">
      <span className="text-xs font-medium block">{title}</span>
      <span className="text-[10px] text-muted-foreground">{subtitle}</span>
    </div>
  </button>
);

const Thumbnail = ({ receipt, receiptType, colors, onClick }) => (
  <button type="button" onClick={onClick} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border/50 shrink-0 group">
    {receiptType === 'pdf' ? (
      <div className={`w-full h-full bg-gradient-to-br ${colors.pdf} flex items-center justify-center`}>
        <DocumentIcon className={colors.icon} />
      </div>
    ) : (
      <img src={`data:image/jpeg;base64,${receipt}`} alt="Beleg" className="w-full h-full object-cover" />
    )}
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <EyeIcon className="text-white" />
    </div>
  </button>
);

const ActionButton = ({ icon, colors, danger, onClick }) => (
  <button type="button" onClick={onClick} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${danger ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : `${colors?.btn} ${colors?.icon}`}`}>
    {icon}
  </button>
);

const ImageViewer = ({ src, onClose }) => (
  <div className="relative flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
    <img src={src} alt="Beleg" className="max-w-[92vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" style={{ touchAction: 'pinch-zoom' }} />
    {/* Floating Toolbar */}
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-black/60 backdrop-blur-md rounded-2xl text-white shadow-lg">
      <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
        <XIcon />
        <span className="text-sm font-medium">Schließen</span>
      </button>
    </div>
  </div>
);

const LoadingState = ({ onCancel }) => (
  <div className="flex flex-col items-center gap-4 text-white" onClick={(e) => e.stopPropagation()}>
    <Spinner />
    <p className="text-sm">PDF wird geladen...</p>
    <button onClick={onCancel} className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm">Abbrechen</button>
  </div>
);



const Spinner = () => <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />;

// Icons
const CameraIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const FolderIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const DocumentIcon = ({ className }) => <svg className={`w-6 h-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const EyeIcon = ({ className }) => <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const RefreshIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const XIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
