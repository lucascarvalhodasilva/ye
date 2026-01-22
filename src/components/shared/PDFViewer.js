'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Use local worker file from /public folder
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function PDFViewer({ source, onError, onClose }) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [width, setWidth] = useState(null);

  useEffect(() => {
    const update = () => setWidth(Math.min(window.innerWidth - 32, 800));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleLoad = useCallback((pdf) => {
    setNumPages(pdf.numPages);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback((err) => {
    setIsLoading(false);
    setError(err?.message || 'PDF konnte nicht geladen werden');
    onError?.(err);
  }, [onError]);

  const goTo = useCallback((p) => setCurrentPage(Math.max(1, Math.min(p, numPages))), [numPages]);
  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.25, 3)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.25, 0.5)), []);

  const options = useMemo(() => ({
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 text-white px-6">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="text-center max-w-xs">
          <p className="text-base font-medium mb-2">Dokument nicht verfügbar</p>
          <p className="text-sm text-white/70 leading-relaxed">
            Das Dokument konnte nicht geladen werden. Bitte stelle sicher, dass die Datei lokal auf deinem Gerät gespeichert ist und nicht nur in der Cloud (z.B. Google Drive).
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all">
            <XIcon />
            Schließen
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Floating Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-black/60 backdrop-blur-md rounded-2xl text-white z-10 shadow-lg">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all">
            <ChevronLeft />
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">{currentPage} / {numPages}</span>
          <button onClick={() => goTo(currentPage + 1)} disabled={currentPage >= numPages} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all">
            <ChevronRight />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/20" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button onClick={zoomOut} disabled={scale <= 0.5} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all text-lg font-medium">
            −
          </button>
          <span className="text-sm font-medium min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= 3} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all text-lg font-medium">
            +
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/20" />

        {/* Close Button */}
        {onClose && (
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
            <XIcon />
            <span className="text-sm font-medium">Schließen</span>
          </button>
        )}
      </div>

      {/* PDF Content - Centered */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {isLoading && <Spinner />}
        <Document file={source} onLoadSuccess={handleLoad} onLoadError={handleError} options={options} loading={null} error={null}>
          {!isLoading && numPages > 0 && (
            <Page
              pageNumber={currentPage}
              scale={scale}
              width={width ? width * scale : undefined}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={<Spinner />}
              className="shadow-2xl rounded-lg"
            />
          )}
        </Document>
      </div>
    </div>
  );
}

const Spinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

const XIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const ChevronLeft = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
