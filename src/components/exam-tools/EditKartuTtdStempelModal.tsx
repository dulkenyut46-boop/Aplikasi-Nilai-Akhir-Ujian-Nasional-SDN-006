import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  PenTool,
  Stamp,
  Sliders,
  RotateCcw,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Move,
  ZoomIn,
  Type,
  FileSignature,
  Eraser,
  Sparkles,
  Info,
} from 'lucide-react';
import { SchoolProfile } from '../../types';
import {
  KartuTtdStempelConfig,
  SignatureType,
  StampType,
  StampPosition,
  DigitalSignatureStyle,
  STAMP_PRESET_COLORS,
  getDefaultKartuTtdStempel,
  optimizeTransparentImage,
} from './kartuTtdStempelState';
import {
  OfficialStampSvg,
  renderBarcodeSvg,
} from './KartuUjianCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schoolProfile: SchoolProfile;
  initialConfig: KartuTtdStempelConfig;
  onSave: (config: KartuTtdStempelConfig) => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const EditKartuTtdStempelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  schoolProfile,
  initialConfig,
  onSave,
  showToast,
}) => {
  const [config, setConfig] = useState<KartuTtdStempelConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'ttd' | 'stempel' | 'naskah'>('ttd');

  // Drawing Pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnStroke, setHasDrawnStroke] = useState(false);
  const [drawPenColor, setDrawPenColor] = useState('#002b80'); // Biru pulpen dinas
  const [drawPenWidth, setDrawPenWidth] = useState(2.5);

  const fileInputTtdRef = useRef<HTMLInputElement | null>(null);
  const fileInputStampRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig({ ...initialConfig });
      setHasDrawnStroke(false);
    }
  }, [isOpen, initialConfig]);

  // Set up drawing canvas when switching to canvas drawing
  useEffect(() => {
    if (isOpen && activeTab === 'ttd' && config.signatureType === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas resolution
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = drawPenColor;
      ctx.lineWidth = drawPenWidth;

      // If there's an existing drawn signature, draw it onto canvas
      if (config.drawnSignatureImage && !hasDrawnStroke) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasDrawnStroke(true);
        };
        img.src = config.drawnSignatureImage;
      }
    }
  }, [isOpen, activeTab, config.signatureType, drawPenColor, drawPenWidth]);

  if (!isOpen) return null;

  // === Canvas Drawing Handlers ===
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = drawPenColor;
    ctx.lineWidth = drawPenWidth;
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnStroke(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setConfig((prev) => ({
      ...prev,
      drawnSignatureImage: dataUrl,
    }));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnStroke(false);
    setConfig((prev) => ({
      ...prev,
      drawnSignatureImage: undefined,
    }));
    if (showToast) {
      showToast('Kanvas Dibersihkan', 'Goresan tanda tangan telah dikosongkan.', 'info');
    }
  };

  // === File Upload Handlers ===
  const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await optimizeTransparentImage(file, 450);
      setConfig((prev) => ({
        ...prev,
        signatureType: 'upload',
        uploadedSignatureImage: dataUrl,
      }));
      if (showToast) {
        showToast('Tanda Tangan Diunggah', 'Gambar tanda tangan berhasil dimuat ke kartu ujian.', 'success');
      }
    } catch (err: any) {
      if (showToast) {
        showToast('Gagal Unggah', err.message || 'Gagal membaca berkas gambar tanda tangan.', 'error');
      }
    }
  };

  const handleUploadStamp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await optimizeTransparentImage(file, 450);
      setConfig((prev) => ({
        ...prev,
        stampType: 'upload',
        uploadedStampImage: dataUrl,
      }));
      if (showToast) {
        showToast('Stempel Diunggah', 'Gambar cap stempel sekolah berhasil dimuat.', 'success');
      }
    } catch (err: any) {
      if (showToast) {
        showToast('Gagal Unggah', err.message || 'Gagal membaca berkas cap stempel.', 'error');
      }
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan format Tanda Tangan dan Stempel ke standar resmi awal?')) {
      const def = getDefaultKartuTtdStempel(schoolProfile);
      setConfig(def);
      if (showToast) {
        showToast('Reset Berhasil', 'Format tanda tangan dan stempel dikembalikan ke standar.', 'info');
      }
    }
  };

  const handleSave = () => {
    onSave(config);
    if (showToast) {
      showToast('Pengaturan Disimpan', 'Tanda tangan dan stempel kartu ujian telah diperbarui.', 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* ========================================================
            HEADER MODAL
           ======================================================== */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white shadow-xs">
              <FileSignature className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>Edit & Unggah Tanda Tangan & Stempel Kartu Ujian</span>
                <span className="rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 px-2 py-0.5 text-[10px] font-bold">
                  Standar DNT Resmi
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Atur format tanda tangan digital / basah, stempel lingkaran kedinasan, atau unggah gambar berkas asli
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ========================================================
            TAB NAVIGASI
           ======================================================== */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-850/50 px-5 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('ttd')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'ttd'
                ? 'bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-400 border-sky-600 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <PenTool className="h-4 w-4" />
            <span>Tanda Tangan Pengesahan</span>
            {config.showSignature ? (
              <span className="h-2 w-2 rounded-full bg-sky-500" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stempel')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'stempel'
                ? 'bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-400 border-indigo-600 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Stamp className="h-4 w-4" />
            <span>Cap Stempel Sekolah</span>
            {config.showStamp ? (
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('naskah')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'naskah'
                ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 border-amber-600 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Type className="h-4 w-4" />
            <span>Teks Jabatan & Nama Penandatangan</span>
          </button>
        </div>

        {/* ========================================================
            MODAL CONTENT BODY
           ======================================================== */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* ========================================================
              TAB 1: TANDA TANGAN
             ======================================================== */}
          {activeTab === 'ttd' && (
            <div className="space-y-5">
              {/* Toggle Aktif / Nonaktif */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${config.showSignature ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700'}`}>
                    {config.showSignature ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      Tampilkan Tanda Tangan Pada Kartu
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Aktifkan untuk menampilkan tanda tangan digital / gambar, atau nonaktifkan untuk kartu blanko penandatanganan manual
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, showSignature: !config.showSignature })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    config.showSignature
                      ? 'bg-sky-700 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {config.showSignature ? '✓ Ditampilkan' : '✗ Disembunyikan'}
                </button>
              </div>

              {/* Pilihan Metode Tanda Tangan */}
              <div>
                <label className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2">
                  Pilih Sumber / Jenis Tanda Tangan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* 1. Unggah Gambar */}
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, signatureType: 'upload' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      config.signatureType === 'upload'
                        ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Upload className="h-4 w-4 text-sky-600" />
                      {config.signatureType === 'upload' && <Check className="h-3.5 w-3.5 text-sky-600" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-extrabold text-xs block">Unggah Gambar</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Berkas PNG/JPG TTD Asli</span>
                    </div>
                  </button>

                  {/* 2. Gores Langsung (Canvas) */}
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, signatureType: 'draw' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      config.signatureType === 'draw'
                        ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <PenTool className="h-4 w-4 text-blue-600" />
                      {config.signatureType === 'draw' && <Check className="h-3.5 w-3.5 text-sky-600" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-extrabold text-xs block">Gores / Gambar</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Tanda tangan di layar</span>
                    </div>
                  </button>

                  {/* 3. Vektor Otomatis */}
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, signatureType: 'digital' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      config.signatureType === 'digital'
                        ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      {config.signatureType === 'digital' && <Check className="h-3.5 w-3.5 text-sky-600" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-extrabold text-xs block">Standar Vektor</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Gaya dinamis resmi</span>
                    </div>
                  </button>

                  {/* 4. Manual Blanko */}
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, signatureType: 'manual' })}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      config.signatureType === 'manual'
                        ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <FileSignature className="h-4 w-4 text-zinc-600" />
                      {config.signatureType === 'manual' && <Check className="h-3.5 w-3.5 text-sky-600" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-extrabold text-xs block">Kosongkan (Manual)</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Pulpen basah di kertas</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Panel Konten Spesifik Metode TTD */}
              {config.signatureType === 'upload' && (
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-sky-600" />
                      <span>Unggah Berkas Gambar Tanda Tangan (PNG / JPG)</span>
                    </span>
                    <input
                      ref={fileInputTtdRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleUploadSignature}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputTtdRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{config.uploadedSignatureImage ? 'Ganti Berkas TTD' : 'Pilih Berkas TTD'}</span>
                    </button>
                  </div>

                  {config.uploadedSignatureImage ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="h-16 w-32 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg flex items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-900/70 overflow-hidden">
                        <img
                          src={config.uploadedSignatureImage}
                          alt="Tanda Tangan Terunggah"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 text-xs">
                        <span className="font-bold text-sky-700 dark:text-sky-400 block">
                          ✓ Gambar Tanda Tangan Aktif
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-0.5">
                          Telah dioptimalkan dan siap dicetak tajam pada kartu peserta ujian.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, uploadedSignatureImage: undefined })}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Hapus gambar tanda tangan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputTtdRef.current?.click()}
                      className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-5 text-center cursor-pointer hover:border-sky-500 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                        Klik di sini untuk mengunggah scan tanda tangan
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Disarankan file format PNG dengan latar belakang transparan
                      </span>
                    </div>
                  )}
                </div>
              )}

              {config.signatureType === 'draw' && (
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <PenTool className="h-4 w-4 text-blue-600" />
                      <span>Kanvas Goresan Tanda Tangan Digital</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
                        <button
                          type="button"
                          onClick={() => setDrawPenColor('#002b80')}
                          className={`w-5 h-5 rounded-md border ${
                            drawPenColor === '#002b80' ? 'ring-2 ring-sky-500 scale-105' : ''
                          }`}
                          style={{ backgroundColor: '#002b80' }}
                          title="Biru Tinta Dinas"
                        />
                        <button
                          type="button"
                          onClick={() => setDrawPenColor('#111827')}
                          className={`w-5 h-5 rounded-md border ${
                            drawPenColor === '#111827' ? 'ring-2 ring-sky-500 scale-105' : ''
                          }`}
                          style={{ backgroundColor: '#111827' }}
                          title="Hitam Tinta Basah"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <Eraser className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Hapus Goresan</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative border-2 border-zinc-300 dark:border-zinc-700 rounded-xl bg-white overflow-hidden shadow-inner cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={drawMove}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={drawMove}
                      onTouchEnd={stopDrawing}
                      className="w-full h-36 touch-none"
                    />
                    <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] text-zinc-400 font-mono">
                      Goreskan tanda tangan menggunakan mouse / layar sentuh
                    </div>
                  </div>
                </div>
              )}

              {config.signatureType === 'digital' && (
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/60 space-y-3">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Pilih Model Goresan Vektor Kedinasan:</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, digitalSignatureStyle: 'formal' })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        config.digitalSignatureStyle === 'formal'
                          ? 'border-sky-600 bg-white dark:bg-zinc-800 text-sky-900 dark:text-sky-300 font-bold shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="h-9 flex items-center justify-center">
                        <svg viewBox="0 0 120 40" className="w-16 h-7 text-blue-900">
                          <path d="M 10 28 C 22 15, 30 8, 38 22 C 45 35, 52 10, 65 18 C 75 25, 88 12, 105 24 M 32 20 Q 70 32 108 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="block mt-1">Formal Dinamis</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, digitalSignatureStyle: 'flowing' })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        config.digitalSignatureStyle === 'flowing'
                          ? 'border-sky-600 bg-white dark:bg-zinc-800 text-sky-900 dark:text-sky-300 font-bold shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="h-9 flex items-center justify-center">
                        <svg viewBox="0 0 120 40" className="w-16 h-7 text-blue-900">
                          <path d="M 12 30 C 20 8, 32 6, 40 28 C 48 38, 56 14, 70 12 C 84 10, 95 30, 110 18 M 15 24 L 98 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="block mt-1">Goresan Berkelok</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, digitalSignatureStyle: 'script' })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        config.digitalSignatureStyle === 'script'
                          ? 'border-sky-600 bg-white dark:bg-zinc-800 text-sky-900 dark:text-sky-300 font-bold shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="h-9 flex items-center justify-center">
                        <svg viewBox="0 0 120 40" className="w-16 h-7 text-blue-900">
                          <path d="M 8 22 Q 25 12 42 26 Q 58 8 72 20 T 112 16 M 22 28 Q 65 38 102 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="block mt-1">Eksekutif Tegas</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Slider Penyesuaian Ukuran & Posisi TTD */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/60 space-y-3">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-sky-600" />
                  <span>Penyesuaian Skala Ukuran & Posisi Tanda Tangan:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Skala Ukuran */}
                  <div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Ukuran / Skala</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{config.signatureScale}%</span>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={140}
                      step={5}
                      value={config.signatureScale}
                      onChange={(e) => setConfig({ ...config, signatureScale: Number(e.target.value) })}
                      className="w-full accent-sky-600"
                    />
                  </div>

                  {/* Offset X */}
                  <div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Geser Kiri/Kanan (X)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{config.signatureOffsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      step={2}
                      value={config.signatureOffsetX}
                      onChange={(e) => setConfig({ ...config, signatureOffsetX: Number(e.target.value) })}
                      className="w-full accent-sky-600"
                    />
                  </div>

                  {/* Offset Y */}
                  <div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Geser Atas/Bawah (Y)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{config.signatureOffsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      step={2}
                      value={config.signatureOffsetY}
                      onChange={(e) => setConfig({ ...config, signatureOffsetY: Number(e.target.value) })}
                      className="w-full accent-sky-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: STEMPEL DINAS
             ======================================================== */}
          {activeTab === 'stempel' && (
            <div className="space-y-5">
              {/* Toggle Aktif / Nonaktif */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${config.showStamp ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700'}`}>
                    <Stamp className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      Tampilkan Cap Stempel Sekolah
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Stempel resmi melingkar dinas untuk verifikasi dan autentikasi fisik kartu peserta
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, showStamp: !config.showStamp })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    config.showStamp
                      ? 'bg-indigo-700 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {config.showStamp ? '✓ Stempel Aktif' : '✗ Sembunyikan Stempel'}
                </button>
              </div>

              {/* Pilihan Sumber Stempel */}
              <div>
                <label className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 block mb-2">
                  Pilih Format Cap Stempel:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Stempel Kedinasan Lingkaran Otomatis */}
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, stampType: 'auto-svg' })}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                      config.stampType === 'auto-svg'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-700">
                      <Stamp className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs block">Stempel Vektor Resmi (Auto-SVG)</span>
                        {config.stampType === 'auto-svg' && <Check className="h-4 w-4 text-indigo-600" />}
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                        Format lingkaran standar Permendikbud dengan teks instansi, bintang, dan nama sekolah
                      </span>
                    </div>
                  </button>

                  {/* Unggah Gambar Cap Asli */}
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, stampType: 'upload' })}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                      config.stampType === 'upload'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-700">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs block">Unggah Gambar Cap Asli (PNG)</span>
                        {config.stampType === 'upload' && <Check className="h-4 w-4 text-indigo-600" />}
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                        Gunakan hasil scan cap basah stempel asli sekolah (latar transparan)
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Pengaturan Stempel Vektor Otomatis */}
              {config.stampType === 'auto-svg' && (
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/60 space-y-4">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Type className="h-4 w-4 text-indigo-600" />
                    <span>Sesuaikan Teks Pada Lingkaran Stempel:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Teks Melingkar Atas (Instansi/Pemkab):
                      </label>
                      <input
                        type="text"
                        value={config.stampTextTop}
                        onChange={(e) => setConfig({ ...config, stampTextTop: e.target.value })}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-semibold text-zinc-900 dark:text-zinc-100"
                        placeholder="PEMERINTAH KAB. KUANTAN SINGINGI"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Teks Melingkar Bawah (Kecamatan/Korwil):
                      </label>
                      <input
                        type="text"
                        value={config.stampTextBottom}
                        onChange={(e) => setConfig({ ...config, stampTextBottom: e.target.value })}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-semibold text-zinc-900 dark:text-zinc-100"
                        placeholder="KORWIL KEC. SINGINGI HILIR"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Teks Tengah Baris 1 (Nama Satuan Pendidikan):
                      </label>
                      <input
                        type="text"
                        value={config.stampTextCenter1}
                        onChange={(e) => setConfig({ ...config, stampTextCenter1: e.target.value })}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-semibold text-zinc-900 dark:text-zinc-100"
                        placeholder="SDN 006 SUNGAI BULUH"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                        Teks Tengah Baris 2 (Jenis Cap):
                      </label>
                      <input
                        type="text"
                        value={config.stampTextCenter2}
                        onChange={(e) => setConfig({ ...config, stampTextCenter2: e.target.value })}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-semibold text-zinc-900 dark:text-zinc-100"
                        placeholder="CAP SEKOLAH"
                      />
                    </div>
                  </div>

                  {/* Pilihan Warna Tinta Cap */}
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                      Pilihan Warna Tinta Cap Stempel:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {STAMP_PRESET_COLORS.map((clr) => (
                        <button
                          key={clr.value}
                          type="button"
                          onClick={() => setConfig({ ...config, stampColor: clr.value })}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            config.stampColor === clr.value
                              ? 'border-zinc-800 dark:border-zinc-200 bg-white dark:bg-zinc-800 shadow-xs ring-2 ring-indigo-500'
                              : 'border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 hover:bg-white'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: clr.value }}
                          />
                          <span>{clr.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Panel Unggah Gambar Stempel */}
              {config.stampType === 'upload' && (
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-indigo-600" />
                      <span>Unggah Gambar Stempel Cap Asli (PNG)</span>
                    </span>
                    <input
                      ref={fileInputStampRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleUploadStamp}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputStampRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{config.uploadedStampImage ? 'Ganti Berkas Cap' : 'Pilih Berkas Cap'}</span>
                    </button>
                  </div>

                  {config.uploadedStampImage ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="h-16 w-16 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg flex items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-900/70 overflow-hidden">
                        <img
                          src={config.uploadedStampImage}
                          alt="Cap Stempel Terunggah"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 text-xs">
                        <span className="font-bold text-indigo-700 dark:text-indigo-400 block">
                          ✓ Gambar Cap Stempel Aktif
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-0.5">
                          Akan otomatis ditempelkan melingkar pada tanda tangan kartu ujian.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, uploadedStampImage: undefined })}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Hapus gambar stempel"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputStampRef.current?.click()}
                      className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-5 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                    >
                      <Stamp className="h-8 w-8 text-zinc-400 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                        Klik di sini untuk mengunggah scan cap stempel
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Gunakan gambar format PNG dengan latar belakang transparan
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Posisi & Penempatan Stempel */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/60 space-y-3">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Move className="h-4 w-4 text-indigo-600" />
                  <span>Letak & Efek Cap Stempel Pada Kartu:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, stampPosition: 'ttd' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      config.stampPosition === 'ttd'
                        ? 'border-indigo-600 bg-white dark:bg-zinc-800 text-indigo-950 dark:text-indigo-200 font-bold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="block font-bold">1. Di Tanda Tangan Saja</span>
                    <span className="text-[10px] text-zinc-500 block">Menimpa TTD & nama Kepsek</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, stampPosition: 'foto' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      config.stampPosition === 'foto'
                        ? 'border-indigo-600 bg-white dark:bg-zinc-800 text-indigo-950 dark:text-indigo-200 font-bold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="block font-bold">2. Di Pojok Foto 2x3 Saja</span>
                    <span className="text-[10px] text-zinc-500 block">Autentikasi foto peserta ujian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, stampPosition: 'both' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      config.stampPosition === 'both'
                        ? 'border-indigo-600 bg-white dark:bg-zinc-800 text-indigo-950 dark:text-indigo-200 font-bold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="block font-bold">3. Keduanya (Foto & TTD)</span>
                    <span className="text-[10px] text-zinc-500 block">Standar keamanan ganda dinas</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2">
                  {/* Skala Ukuran */}
                  <div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Ukuran Stempel</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{config.stampScale}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      step={5}
                      value={config.stampScale}
                      onChange={(e) => setConfig({ ...config, stampScale: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Rotasi / Kemiringan */}
                  <div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Kemiringan Cap</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{config.stampRotation}°</span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      step={1}
                      value={config.stampRotation}
                      onChange={(e) => setConfig({ ...config, stampRotation: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Opasitas Tinta */}
                  <div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Transparansi Tinta</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{config.stampOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      step={5}
                      value={config.stampOpacity}
                      onChange={(e) => setConfig({ ...config, stampOpacity: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  {/* Geser Posisi X */}
                  <div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mb-1">
                      <span>Geser Posisi (X)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{config.stampOffsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      step={2}
                      value={config.stampOffsetX}
                      onChange={(e) => setConfig({ ...config, stampOffsetX: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: NASKAH PENGESAHAN & PEJABAT
             ======================================================== */}
          {activeTab === 'naskah' && (
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/60 space-y-4">
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Type className="h-4 w-4 text-amber-600" />
                <span>Ubah Keterangan Teks Titimangsa & Pejabat Penandatangan Kartu:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Tempat Penetapan Titimangsa:
                  </label>
                  <input
                    type="text"
                    value={config.titimangsaTempat}
                    onChange={(e) => setConfig({ ...config, titimangsaTempat: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-semibold text-zinc-900 dark:text-zinc-100"
                    placeholder="Sungai Buluh"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Tanggal Titimangsa Kartu Ujian:
                  </label>
                  <input
                    type="text"
                    value={config.titimangsaTanggal}
                    onChange={(e) => setConfig({ ...config, titimangsaTanggal: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-semibold text-zinc-900 dark:text-zinc-100"
                    placeholder="12 Mei 2026"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Jabatan Penandatangan:
                  </label>
                  <input
                    type="text"
                    value={config.jabatanPenandatangan}
                    onChange={(e) => setConfig({ ...config, jabatanPenandatangan: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-semibold text-zinc-900 dark:text-zinc-100"
                    placeholder="Kepala Sekolah,"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Nama Lengkap & Gelar Penandatangan:
                  </label>
                  <input
                    type="text"
                    value={config.namaPenandatangan}
                    onChange={(e) => setConfig({ ...config, namaPenandatangan: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-semibold text-zinc-900 dark:text-zinc-100 uppercase"
                    placeholder="H. SUPRIADI, S.Pd., M.Pd."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    NIP Penandatangan (Nomor Induk Pegawai):
                  </label>
                  <input
                    type="text"
                    value={config.nipPenandatangan}
                    onChange={(e) => setConfig({ ...config, nipPenandatangan: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                    placeholder="19720412 199603 1 003"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              LIVE PREVIEW BOX (PRATINJAU LANGSUNG)
             ======================================================== */}
          <div className="rounded-2xl border-2 border-sky-600/70 bg-sky-50/40 dark:bg-sky-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>Pratinjau Langsung Hasil Pengesahan Kartu Ujian</span>
              </span>
              <span className="text-[10px] text-sky-700 dark:text-sky-400 font-mono">
                Live Interactive Preview
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 shadow-xs flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
              {/* Simulasi Pas Foto & Stempel Overlap */}
              <div className="flex items-center gap-3">
                <div className="relative h-24 w-18 rounded border-2 border-zinc-800 bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <span className="text-2xl">👦</span>
                  <div className="absolute top-0.5 left-0.5 bg-black/60 rounded px-1 text-[6.5px] font-bold text-amber-300">
                    2x3
                  </div>

                  {/* Stempel Overlap di Foto jika diaktifkan */}
                  {config.showStamp && (config.stampPosition === 'foto' || config.stampPosition === 'both') && (
                    <div
                      className="absolute -bottom-6 -right-6 pointer-events-none select-none z-20"
                      style={{
                        transform: `scale(${(config.stampScale / 100) * 0.75}) rotate(${config.stampRotation}deg) translate(${config.stampOffsetX}px, ${config.stampOffsetY}px)`,
                        opacity: config.stampOpacity / 100,
                      }}
                    >
                      {config.stampType === 'upload' && config.uploadedStampImage ? (
                        <img
                          src={config.uploadedStampImage}
                          alt="Stempel"
                          className="w-24 h-24 object-contain"
                        />
                      ) : (
                        <OfficialStampSvg
                          namaSekolah={config.stampTextCenter1}
                          kabupaten={config.stampTextTop}
                          kecamatan={config.stampTextBottom}
                          className="w-24 h-24"
                        />
                      )}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-zinc-500 max-w-[160px] leading-tight">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    Sudut Pas Foto 2x3
                  </span>
                  {config.showStamp && (config.stampPosition === 'foto' || config.stampPosition === 'both') ? (
                    <span className="text-sky-700 font-semibold text-[10px]">
                      ✓ Dilengkapi cap autentikasi basah
                    </span>
                  ) : (
                    <span className="text-zinc-400 text-[10px]">
                      Tanpa stempel di foto
                    </span>
                  )}
                </div>
              </div>

              {/* Simulasi Titimangsa & TTD */}
              <div className="relative text-right min-w-[200px] space-y-0.5 text-xs">
                <div className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                  {config.titimangsaTempat}, {config.titimangsaTanggal}
                </div>
                <div className="font-bold text-zinc-800 dark:text-zinc-200 text-[11.5px]">
                  {config.jabatanPenandatangan}
                </div>

                {/* Area Goresan TTD & Stempel */}
                <div className="relative h-12 flex items-center justify-end">
                  {/* Stempel Overlap di TTD */}
                  {config.showStamp && (config.stampPosition === 'ttd' || config.stampPosition === 'both') && (
                    <div
                      className="absolute right-12 top-[-10px] pointer-events-none select-none z-10"
                      style={{
                        transform: `scale(${config.stampScale / 100 * 0.7}) rotate(${config.stampRotation}deg) translate(${config.stampOffsetX}px, ${config.stampOffsetY}px)`,
                        opacity: config.stampOpacity / 100,
                      }}
                    >
                      {config.stampType === 'upload' && config.uploadedStampImage ? (
                        <img
                          src={config.uploadedStampImage}
                          alt="Stempel"
                          className="w-24 h-24 object-contain"
                        />
                      ) : (
                        <OfficialStampSvg
                          namaSekolah={config.stampTextCenter1}
                          kabupaten={config.stampTextTop}
                          kecamatan={config.stampTextBottom}
                          className="w-24 h-24"
                        />
                      )}
                    </div>
                  )}

                  {/* Render Tanda Tangan */}
                  {config.showSignature && (
                    <div
                      className="relative z-20 flex items-center justify-end"
                      style={{
                        transform: `scale(${config.signatureScale / 100}) translate(${config.signatureOffsetX}px, ${config.signatureOffsetY}px)`,
                      }}
                    >
                      {config.signatureType === 'upload' && config.uploadedSignatureImage ? (
                        <img
                          src={config.uploadedSignatureImage}
                          alt="TTD"
                          className="h-10 max-w-[130px] object-contain"
                        />
                      ) : config.signatureType === 'draw' && config.drawnSignatureImage ? (
                        <img
                          src={config.drawnSignatureImage}
                          alt="TTD Kanvas"
                          className="h-10 max-w-[130px] object-contain"
                        />
                      ) : config.signatureType === 'digital' ? (
                        <svg viewBox="0 0 120 40" className="w-24 h-9 text-blue-900">
                          {config.digitalSignatureStyle === 'flowing' ? (
                            <path d="M 12 30 C 20 8, 32 6, 40 28 C 48 38, 56 14, 70 12 C 84 10, 95 30, 110 18 M 15 24 L 98 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          ) : config.digitalSignatureStyle === 'script' ? (
                            <path d="M 8 22 Q 25 12 42 26 Q 58 8 72 20 T 112 16 M 22 28 Q 65 38 102 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          ) : (
                            <path d="M 10 28 C 22 15, 30 8, 38 22 C 45 35, 52 10, 65 18 C 75 25, 88 12, 105 24 M 32 20 Q 70 32 108 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          )}
                        </svg>
                      ) : (
                        <div className="h-9 w-28 border-b border-dashed border-zinc-400" />
                      )}
                    </div>
                  )}

                  {!config.showSignature && (
                    <div className="h-9 w-28 border-b border-dashed border-zinc-300" />
                  )}
                </div>

                <div className="font-extrabold uppercase text-zinc-950 dark:text-zinc-50 underline text-[11px] tracking-tight">
                  {config.namaPenandatangan}
                </div>
                <div className="font-mono text-zinc-600 dark:text-zinc-400 text-[9.5px]">
                  NIP. {config.nipPenandatangan}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            MODAL ACTIONS FOOTER
           ======================================================== */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-850/80">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
            <span>Reset Standar Awal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 active:scale-95 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Simpan & Terapkan ke Seluruh Kartu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
