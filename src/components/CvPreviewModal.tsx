import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure Mozilla PDF.js local worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface CvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvUrl?: string;
  cvFileName?: string;
  isDarkMode: boolean;
  selectedLang?: 'ID' | 'EN';
}

interface PageCanvasProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
}

const PageCanvas: React.FC<PageCanvasProps> = ({ pdfDoc, pageNumber, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderStatus, setRenderStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    let isCancelled = false;
    let renderTask: any = null;

    const renderPage = async () => {
      try {
        setRenderStatus('loading');
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Support Retina / High-DPI screens for crystal clear text
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);

        renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport
        });

        await renderTask.promise;
        if (!isCancelled) {
          setRenderStatus('done');
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering PDF page ${pageNumber}:`, err);
          if (!isCancelled) setRenderStatus('error');
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  return (
    <div className="relative flex flex-col items-center select-none shadow-2xl rounded-xl overflow-hidden bg-white border border-slate-300/40">
      <canvas ref={canvasRef} className="block max-w-full h-auto bg-white" />
      {renderStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs min-h-[300px]">
          <Loader2 className="w-8 h-8 text-[#00c2ff] animate-spin" />
        </div>
      )}
      {renderStatus === 'error' && (
        <div className="p-8 text-center text-red-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs font-bold">Gagal memuat halaman {pageNumber}</p>
        </div>
      )}
    </div>
  );
};

export default function CvPreviewModal({
  isOpen,
  onClose,
  cvUrl,
  cvFileName = 'Fikri_Yandi_CV.pdf',
  isDarkMode,
  selectedLang = 'ID'
}: CvPreviewModalProps) {
  const resolvedUrl = cvUrl || '/Fikri_Yandi_CV.pdf';
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.2);

  // Responsive scale initialization
  useEffect(() => {
    const updateDefaultScale = () => {
      if (window.innerWidth < 640) {
        setScale(Math.max(0.65, (window.innerWidth - 32) / 600));
      } else if (window.innerWidth < 1024) {
        setScale(1.05);
      } else {
        setScale(1.25);
      }
    };
    updateDefaultScale();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load PDF Document via PDF.js (works with both URL and base64 data)
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);

    const loadPdf = async () => {
      try {
        let loadingTask: any;

        if (resolvedUrl.startsWith('data:application/pdf') || resolvedUrl.startsWith('data:;base64,')) {
          // Decode Base64 to Uint8Array for PDF.js
          const rawBase64 = resolvedUrl.includes(',') ? resolvedUrl.split(',')[1] : resolvedUrl;
          const binaryString = window.atob(rawBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else {
          // Normal file path URL
          loadingTask = pdfjsLib.getDocument({ url: resolvedUrl });
        }

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load PDF in PDF.js:', err);
        if (!isCancelled) {
          setLoadError(err?.message || 'Gagal memproses berkas PDF.');
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, resolvedUrl]);

  // Convert data URL to Blob URL if needed for opening in new tab
  const getShareableUrl = (): string => {
    if (resolvedUrl.startsWith('data:')) {
      try {
        const parts = resolvedUrl.split(';base64,');
        const contentType = parts[0].split(':')[1] || 'application/pdf';
        const raw = window.atob(parts[1]);
        const uInt8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType });
        return URL.createObjectURL(blob);
      } catch (e) {
        return resolvedUrl;
      }
    }
    return resolvedUrl;
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = getShareableUrl();
    a.download = cvFileName || 'Fikri_Yandi_CV.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    const shareableUrl = getShareableUrl();
    window.open(shareableUrl, '_blank', 'noopener,noreferrer');
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.15, 2.2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.15, 0.5));
  const resetZoom = () => {
    if (window.innerWidth < 640) {
      setScale(Math.max(0.65, (window.innerWidth - 32) / 600));
    } else {
      setScale(1.25);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-5xl h-[94vh] sm:h-[90vh] rounded-[24px] sm:rounded-[32px] border flex flex-col overflow-hidden shadow-2xl z-10 ${
              isDarkMode 
                ? 'bg-[#101722] border-[#2e3b4e] text-white shadow-black/90' 
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/40'
            }`}
          >
            {/* Header bar */}
            <div className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-3 shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-[#141d2b]' : 'border-slate-150 bg-slate-50'
            }`}>
              {/* Left Title and status badge */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base truncate tracking-tight">
                      {selectedLang === 'ID' ? 'Curriculum Vitae (CV)' : 'Curriculum Vitae'}
                    </h3>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00c2ff]/10 text-[#00c2ff] border border-[#00c2ff]/25">
                      {numPages > 0 ? `${numPages} Halaman` : 'PDF'}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 truncate">
                    {cvFileName || 'Fikri_Yandi_CV.pdf'}
                  </p>
                </div>
              </div>

              {/* Right Action & Zoom buttons */}
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-xl border ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
                }`}>
                  <button
                    type="button"
                    onClick={zoomOut}
                    className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Perkecil"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold px-1 min-w-[42px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={zoomIn}
                    className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Perbesar"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={resetZoom}
                    className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white cursor-pointer transition-colors"
                    title="Reset Ukuran"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {/* Open in New Tab Button */}
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  title={selectedLang === 'ID' ? 'Buka di tab baru' : 'Open in new tab'}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#00c2ff]" />
                  <span>{selectedLang === 'ID' ? 'Buka Penuh' : 'Full Window'}</span>
                </button>

                {/* Download button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  title={selectedLang === 'ID' ? 'Unduh salinan PDF' : 'Download copy'}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">{selectedLang === 'ID' ? 'Unduh Salinan' : 'Download'}</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400' 
                      : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500'
                  }`}
                  title={selectedLang === 'ID' ? 'Tutup (Esc)' : 'Close (Esc)'}
                  aria-label="Close"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Document Viewer Frame - Pure HTML5 Canvas rendering of all PDF pages with smooth vertical scrolling */}
            <div className={`relative flex-1 w-full h-full overflow-y-auto overflow-x-auto p-4 sm:p-6 md:p-8 flex flex-col items-center gap-8 ${
              isDarkMode ? 'bg-[#151b26]' : 'bg-[#e9eff7]'
            }`}>
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center my-auto py-16 text-center space-y-3">
                  <Loader2 className="w-10 h-10 text-[#00c2ff] animate-spin" />
                  <p className="text-sm font-bold text-slate-400">
                    {selectedLang === 'ID' ? 'Mempersiapkan dokumen CV...' : 'Rendering CV document...'}
                  </p>
                </div>
              )}

              {/* Error State */}
              {loadError && (
                <div className={`p-8 text-center max-w-md my-auto rounded-2xl border ${
                  isDarkMode ? 'bg-red-950/20 border-red-800/40 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
                  <h4 className="font-black text-sm mb-1">
                    {selectedLang === 'ID' ? 'Gagal Membaca Berkas PDF' : 'Failed to Load PDF'}
                  </h4>
                  <p className="text-xs opacity-80 mb-4">{loadError}</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenNewTab}
                      className="px-4 py-2 rounded-xl bg-[#00c2ff] text-slate-950 font-bold text-xs shadow-md"
                    >
                      {selectedLang === 'ID' ? 'Buka di Tab Baru' : 'Open in New Tab'}
                    </button>
                  </div>
                </div>
              )}

              {/* All Rendered Pages Stacked Vertically with Scrolling */}
              {!isLoading && !loadError && pdfDoc && (
                <div className="flex flex-col items-center gap-6 w-fit mx-auto pb-8">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                    <div key={pageNum} className="flex flex-col items-center gap-2">
                      {/* Page Label Indicator */}
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isDarkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-white/80 text-slate-600 shadow-xs'
                      }`}>
                        {selectedLang === 'ID' ? `Halaman ${pageNum} dari ${numPages}` : `Page ${pageNum} of ${numPages}`}
                      </span>

                      {/* Pure HTML5 Canvas Page */}
                      <PageCanvas
                        pdfDoc={pdfDoc}
                        pageNumber={pageNum}
                        scale={scale}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Footer Helper Info */}
            <div className={`py-2 px-4 border-t text-[11px] flex items-center justify-between font-semibold shrink-0 ${
              isDarkMode ? 'bg-[#101722] text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              <span className="flex items-center gap-1.5">
                <span>💡</span>
                <span>
                  {selectedLang === 'ID' 
                    ? 'Scroll ke bawah untuk membaca seluruh halaman secara lengkap tanpa batas.' 
                    : 'Scroll down to read all pages seamlessly without restrictions.'}
                </span>
              </span>
              <span className="text-[10px] font-mono text-[#00c2ff]">
                Fikri Yandi Portfolio Engine
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
