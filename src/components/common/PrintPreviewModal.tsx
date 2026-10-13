import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  RotateCw,
  Sliders,
  Check,
  ChevronDown,
} from 'lucide-react';

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  defaultOrientation?: 'portrait' | 'landscape';
  paperSize?: 'A4' | 'F4';
  children: React.ReactNode;
  toolbarExtra?: React.ReactNode;
  onBeforePrint?: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  defaultOrientation = 'portrait',
  paperSize = 'A4',
  children,
  toolbarExtra,
  onBeforePrint,
}) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(defaultOrientation);
  const [zoom, setZoom] = useState<number>(100);

  // Sync default orientation & classes when opened
  useEffect(() => {
    if (isOpen) {
      setOrientation(defaultOrientation);
      setZoom(100);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('has-print-modal-open');
      if (defaultOrientation === 'landscape') {
        document.body.classList.add('print-landscape');
      } else {
        document.body.classList.remove('print-landscape');
      }
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('has-print-modal-open');
      document.body.classList.remove('print-landscape');
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('has-print-modal-open');
      document.body.classList.remove('print-landscape');
    };
  }, [isOpen, defaultOrientation]);

  // Handle ESC and Ctrl+P
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleOrientation = () => {
    const next = orientation === 'portrait' ? 'landscape' : 'portrait';
    setOrientation(next);
    if (next === 'landscape') {
      document.body.classList.add('print-landscape');
    } else {
      document.body.classList.remove('print-landscape');
    }
  };

  const handlePrint = () => {
    if (onBeforePrint) onBeforePrint();
    window.print();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-900/80 backdrop-blur-sm print-modal-overlay print-preview-portal">
      {/* Top Controls Toolbar (Hidden on Print) */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-700 bg-zinc-900 px-4 py-3 text-white shadow-md shrink-0 print:hidden z-10">
        {/* Title & Document Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shrink-0 shadow-xs">
            <Printer className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-zinc-100 truncate">{title}</h3>
              <span className="hidden sm:inline-block rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-300 border border-zinc-700">
                {paperSize} • {orientation === 'portrait' ? 'Tegak (Portrait)' : 'Mendatar (Landscape)'}
              </span>
            </div>
            {subtitle && <p className="text-[11px] text-zinc-400 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Toolbar Extras (Dropdowns, Filters) */}
        {toolbarExtra && <div className="flex items-center gap-2">{toolbarExtra}</div>}

        {/* Actions: Orientation, Zoom, Print & Close */}
        <div className="flex items-center gap-2">
          {/* Orientation switch */}
          <button
            type="button"
            onClick={handleToggleOrientation}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-750 hover:text-white transition-colors"
            title="Ubah Orientasi Kertas (Portrait / Landscape)"
          >
            <RotateCw className="h-3.5 w-3.5 text-emerald-400" />
            <span>{orientation === 'portrait' ? 'Portrait (Tegak)' : 'Landscape (Mendatar)'}</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden lg:flex items-center rounded-xl border border-zinc-700 bg-zinc-800 p-0.5 text-xs text-zinc-300">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(50, prev - 15))}
              className="p-1 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
              title="Perkecil Pratinjau"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono font-bold text-[11px] text-zinc-300 min-w-[42px] text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(150, prev + 15))}
              className="p-1 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
              title="Perbesar Pratinjau"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="px-2 py-0.5 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors text-[10px] font-bold border-l border-zinc-700"
              title="Reset Zoom ke 100%"
            >
              100%
            </button>
          </div>

          {/* Direct Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 active:scale-95 transition-all"
            title="Cetak Dokumen Sekarang (Ctrl+P)"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Dokumen (Ctrl+P)</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Tutup Pratinjau (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Canvas Workspace */}
      <main className="flex-1 overflow-auto bg-zinc-200/90 dark:bg-zinc-950 p-4 sm:p-8 flex justify-center items-start print-modal-dialog">
        {/* Printable Paper Sheet Container */}
        <div
          style={{
            zoom: zoom !== 100 ? `${zoom}%` : undefined,
          }}
          className={`relative bg-white text-zinc-900 shadow-2xl transition-all print-modal-sheet print:shadow-none print:m-0 print:border-none ${
            orientation === 'landscape'
              ? 'w-full max-w-[297mm] min-h-[210mm] p-6 sm:p-10 print-landscape-page'
              : 'w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10'
          }`}
        >
          {/* Subtle Screen Page Border Guideline (Hidden on Print) */}
          <div className="absolute top-2 right-3 text-[10px] font-mono text-zinc-400 uppercase select-none print:hidden flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Simulasi Kertas {paperSize} {orientation === 'landscape' ? 'Mendatar' : 'Tegak'}
          </div>

          {/* The Actual Document Content */}
          <div className="printable-document-content w-full">{children}</div>
        </div>
      </main>

      {/* Bottom Hint Bar (Hidden on Print) */}
      <footer className="border-t border-zinc-800 bg-zinc-900 px-4 py-2 text-center text-xs text-zinc-400 print:hidden shrink-0">
        <p>
          💡 <b>Tips Cetak:</b> Pastikan di dialog browser memilih <b>Paper size: A4</b> dan{' '}
          <b>Margins: Default / Minimal</b>, serta centang <b>Background graphics</b> agar kop surat & warna nilai tercetak jelas.
        </p>
      </footer>
    </div>,
    document.body
  );
};
