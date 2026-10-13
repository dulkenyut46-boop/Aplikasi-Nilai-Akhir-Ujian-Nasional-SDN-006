import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolProfile, KopSuratConfig } from '../../types';
import { INITIAL_SCHOOL_PROFILE } from '../../data/initialData';
import { KopSurat } from '../common/KopSurat';
import {
  KOP_LOGO_PRESETS,
  getPresetLogoDataUrl,
} from '../../utils/kopSuratLogos';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  ShieldCheck,
  Building,
  School,
  Sliders,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Printer,
  Sparkles,
  Eye,
  Check,
  RefreshCw,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    schoolProfile,
    updateSchoolProfile,
    resetToDefaultData,
    exportToCSV,
    exportToJSON,
    importFromJSON,
    showToast,
  } = useApp();

  const [formData, setFormData] = useState<SchoolProfile>({
    ...INITIAL_SCHOOL_PROFILE,
    ...schoolProfile,
    kopSurat: {
      ...INITIAL_SCHOOL_PROFILE.kopSurat!,
      ...(schoolProfile.kopSurat || {}),
    },
  });

  const [activeSection, setActiveSection] = useState<'all' | 'kop' | 'identitas' | 'pejabat' | 'bobot' | 'backup'>('all');
  const [previewPaperTheme, setPreviewPaperTheme] = useState<'white' | 'dark'>('white');

  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);

  const currentKop: KopSuratConfig = formData.kopSurat || INITIAL_SCHOOL_PROFILE.kopSurat!;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          name === 'bobotRapor' || name === 'bobotUS' || name === 'kkmKelulusan'
            ? Number(value)
            : value,
      };

      // Also keep kopSurat namaSekolah/alamat in sync if matching
      if (name === 'namaSekolah' && prev.kopSurat) {
        updated.kopSurat = {
          ...prev.kopSurat,
          namaSekolah: value,
        };
      }
      return updated;
    });
  };

  const handleKopChange = (field: keyof KopSuratConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      kopSurat: {
        ...(prev.kopSurat || INITIAL_SCHOOL_PROFILE.kopSurat!),
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, position: 'kiri' | 'kanan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      showToast('Ukuran File Terlalu Besar', 'Maksimal ukuran file logo adalah 2.5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (position === 'kiri') {
          handleKopChange('logoKiri', dataUrl);
          handleKopChange('logoKiriPreset', 'custom');
          handleKopChange('showLogoKiri', true);
          showToast('Logo Kiri Diperbarui', 'Logo kustom kiri berhasil dimuat dan disimpan.', 'success');
        } else {
          handleKopChange('logoKanan', dataUrl);
          handleKopChange('logoKananPreset', 'custom');
          handleKopChange('showLogoKanan', true);
          showToast('Logo Kanan Diperbarui', 'Logo kustom kanan berhasil dimuat dan disimpan.', 'success');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetLogo = (position: 'kiri' | 'kanan', presetId: string) => {
    const url = getPresetLogoDataUrl(presetId);
    if (position === 'kiri') {
      handleKopChange('logoKiriPreset', presetId as any);
      handleKopChange('logoKiri', url);
      handleKopChange('showLogoKiri', true);
    } else {
      handleKopChange('logoKananPreset', presetId as any);
      handleKopChange('logoKanan', url);
      handleKopChange('showLogoKanan', true);
    }
    showToast('Preset Logo Dipilih', `Logo ${position} diubah ke ${presetId.replace('_', ' ').toUpperCase()}.`, 'info');
  };

  const resetKopToDefault = () => {
    if (window.confirm('Kembalikan format Kop Surat dan Logo ke standar resmi SDN 006 Sungai Buluh?')) {
      setFormData((prev) => ({
        ...prev,
        kopSurat: { ...INITIAL_SCHOOL_PROFILE.kopSurat! },
      }));
      showToast('Kop Surat Direset', 'Format kop surat telah dikembalikan ke standar awal.', 'info');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bobotRapor + formData.bobotUS !== 100) {
      showToast('Perhatian Bobot', 'Total persentase bobot Rapor + US harus bernilai 100%.', 'error');
      return;
    }
    updateSchoolProfile(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importFromJSON(content);
        if (success) {
          try {
            const parsed = JSON.parse(content);
            if (parsed.schoolProfile) {
              setFormData({
                ...INITIAL_SCHOOL_PROFILE,
                ...parsed.schoolProfile,
                kopSurat: {
                  ...INITIAL_SCHOOL_PROFILE.kopSurat!,
                  ...(parsed.schoolProfile.kopSurat || {}),
                },
              });
            }
          } catch (err) {}
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Pengaturan Identitas Sekolah & Kop Surat Resmi
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Kelola tata naskah dinas, logo kanan & kiri kop surat, pejabat penandatangan, dan formula kelulusan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-colors"
            title="Cetak format lembar naskah dinas saat ini"
          >
            <Printer className="h-4 w-4" />
            Pratinjau Cetak
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
          >
            <Save className="h-4 w-4" />
            Simpan Semua Pengaturan
          </button>
        </div>
      </div>

      {/* Navigation Quick Filter */}
      <div className="flex overflow-x-auto gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-semibold">
        {[
          { key: 'all', label: 'Semua Pengaturan' },
          { key: 'kop', label: '📄 Kop Surat & Edit Logo (Kiri & Kanan)', highlight: true },
          { key: 'identitas', label: 'Identitas Sekolah' },
          { key: 'pejabat', label: 'Pejabat Penandatangan' },
          { key: 'bobot', label: 'Formula Bobot Nilai' },
          { key: 'backup', label: 'Cadangan & Pemulihan' },
        ].map((sec) => (
          <button
            key={sec.key}
            type="button"
            onClick={() => setActiveSection(sec.key as any)}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 font-bold ${
              activeSection === sec.key
                ? 'bg-emerald-800 text-white shadow-xs'
                : sec.highlight
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ========================================================
            CARD 1: PENGATURAN KOP SURAT RESMI & EDIT LOGO KANAN-KIRI
           ======================================================== */}
        {(activeSection === 'all' || activeSection === 'kop') && (
          <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 shadow-sm dark:border-emerald-500/20 dark:bg-zinc-900 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                    Pengaturan Kop Surat Resmi & Edit Logo (Kanan & Kiri)
                    <span className="rounded-md bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-normal">
                      Standar Dinas
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Kop surat ini digunakan otomatis pada SKHU Sementara, SK Kelulusan, Kartu Peserta Ujian, dan Daftar Hadir
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetKopToDefault}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 px-3 py-1.5 text-[11px] font-bold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Format Default SDN 006
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-emerald-600" />
                  Pratinjau Langsung (Live Preview Kop Surat):
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-zinc-500">Latar Pratinjau:</span>
                  <button
                    type="button"
                    onClick={() => setPreviewPaperTheme('white')}
                    className={`px-2 py-0.5 rounded font-bold border ${
                      previewPaperTheme === 'white'
                        ? 'bg-white text-zinc-900 border-zinc-400 shadow-xs'
                        : 'text-zinc-500 border-transparent'
                    }`}
                  >
                    Kertas Putih (A4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPaperTheme('dark')}
                    className={`px-2 py-0.5 rounded font-bold border ${
                      previewPaperTheme === 'dark'
                        ? 'bg-zinc-800 text-white border-zinc-600 shadow-xs'
                        : 'text-zinc-500 border-transparent'
                    }`}
                  >
                    Gelap
                  </button>
                </div>
              </div>

              {/* Simulated Paper Frame */}
              <div
                className={`rounded-2xl border-2 p-5 sm:p-7 transition-colors shadow-inner ${
                  previewPaperTheme === 'white'
                    ? 'border-zinc-300 bg-white text-black'
                    : 'border-zinc-700 bg-zinc-950 text-white'
                }`}
              >
                <KopSurat config={currentKop} />
                <div className="mt-3 text-center">
                  <span className="text-[10px] text-zinc-400 italic">
                    ▲ Bagian atas dokumen resmi (SKHU / SK Kelulusan / Kartu Ujian / Berita Acara) ▲
                  </span>
                </div>
              </div>
            </div>

            {/* EDIT LOGO SECTION (LOGO KIRI & LOGO KANAN DUA KOLOM) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* =======================
                  LOGO KIRI CONFIGURATION
                 ======================= */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">
                      1
                    </span>
                    <h4 className="font-extrabold text-xs uppercase text-zinc-900 dark:text-zinc-100 tracking-wide">
                      Pengaturan Logo Kiri (Kop Surat)
                    </h4>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentKop.showLogoKiri}
                      onChange={(e) => handleKopChange('showLogoKiri', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      {currentKop.showLogoKiri ? 'Tampil' : 'Sembunyi'}
                    </span>
                  </label>
                </div>

                {/* Logo Kiri Thumbnail & Ukuran */}
                <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="h-18 w-18 shrink-0 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-1">
                    {currentKop.showLogoKiri && currentKop.logoKiri ? (
                      <img
                        src={currentKop.logoKiri}
                        alt="Logo Kiri"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-bold">Tidak Aktif</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Preset Terpilih:</span>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                        {currentKop.logoKiriPreset === 'custom'
                          ? '📁 Logo Kustom (Unggahan)'
                          : KOP_LOGO_PRESETS.find((p) => p.id === currentKop.logoKiriPreset)?.name || 'Lambang Daerah'}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        <span>Ukuran Logo:</span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {currentKop.logoKiriSize || 76} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={110}
                        step={2}
                        value={currentKop.logoKiriSize || 76}
                        onChange={(e) => handleKopChange('logoKiriSize', Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Pilihan Preset Logo Kiri */}
                <div className="space-y-1.5 text-xs">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
                    Pilih Logo Resmi Kiri:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {KOP_LOGO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPresetLogo('kiri', p.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all ${
                          currentKop.logoKiriPreset === p.id
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-emerald-300'
                        }`}
                      >
                        <img
                          src={p.dataUrl}
                          alt={p.name}
                          className="h-7 w-7 object-contain shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold leading-tight truncate">{p.name}</p>
                          <span className="text-[9px] text-zinc-400 block truncate">{p.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unggah Custom File Logo Kiri */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
                    Atau Unggah Logo Kiri Sendiri (PNG / JPG / SVG):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={leftLogoInputRef}
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      onChange={(e) => handleLogoUpload(e, 'kiri')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => leftLogoInputRef.current?.click()}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300 transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Unggah File Logo Kiri
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPresetLogo('kiri', 'pemda_kuansing')}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Kembalikan ke Lambang Pemkab Kuansing"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* =======================
                  LOGO KANAN CONFIGURATION
                 ======================= */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">
                      2
                    </span>
                    <h4 className="font-extrabold text-xs uppercase text-zinc-900 dark:text-zinc-100 tracking-wide">
                      Pengaturan Logo Kanan (Kop Surat)
                    </h4>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentKop.showLogoKanan}
                      onChange={(e) => handleKopChange('showLogoKanan', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      {currentKop.showLogoKanan ? 'Tampil' : 'Sembunyi'}
                    </span>
                  </label>
                </div>

                {/* Logo Kanan Thumbnail & Ukuran */}
                <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="h-18 w-18 shrink-0 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-1">
                    {currentKop.showLogoKanan && currentKop.logoKanan ? (
                      <img
                        src={currentKop.logoKanan}
                        alt="Logo Kanan"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-bold">Tidak Aktif</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Preset Terpilih:</span>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                        {currentKop.logoKananPreset === 'custom'
                          ? '📁 Logo Kustom (Unggahan)'
                          : KOP_LOGO_PRESETS.find((p) => p.id === currentKop.logoKananPreset)?.name || 'Tut Wuri Handayani'}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        <span>Ukuran Logo:</span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {currentKop.logoKananSize || 76} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={110}
                        step={2}
                        value={currentKop.logoKananSize || 76}
                        onChange={(e) => handleKopChange('logoKananSize', Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Pilihan Preset Logo Kanan */}
                <div className="space-y-1.5 text-xs">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
                    Pilih Logo Resmi Kanan:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {KOP_LOGO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPresetLogo('kanan', p.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all ${
                          currentKop.logoKananPreset === p.id
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-emerald-300'
                        }`}
                      >
                        <img
                          src={p.dataUrl}
                          alt={p.name}
                          className="h-7 w-7 object-contain shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold leading-tight truncate">{p.name}</p>
                          <span className="text-[9px] text-zinc-400 block truncate">{p.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unggah Custom File Logo Kanan */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
                    Atau Unggah Logo Kanan Sendiri (PNG / JPG / SVG):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={rightLogoInputRef}
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      onChange={(e) => handleLogoUpload(e, 'kanan')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => rightLogoInputRef.current?.click()}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300 transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Unggah File Logo Kanan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPresetLogo('kanan', 'tutwuri')}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Kembalikan ke Tut Wuri Handayani"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM TEKS & GARIS KOP SURAT */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">
                  3
                </span>
                <h4 className="font-extrabold text-xs uppercase text-zinc-900 dark:text-zinc-100 tracking-wide">
                  Teks Instansi, Alamat & Format Garis Pembatas Kop
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Instansi Induk Baris 1 (Pemerintah Daerah)
                  </label>
                  <input
                    type="text"
                    value={currentKop.instansiAtas}
                    onChange={(e) => handleKopChange('instansiAtas', e.target.value)}
                    placeholder="PEMERINTAH KABUPATEN KUANTAN SINGINGI"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 font-medium text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <span className="text-[10px] text-zinc-400">Contoh: PEMERINTAH KABUPATEN KUANTAN SINGINGI</span>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Instansi Baris 2 (Dinas Terkait)
                  </label>
                  <input
                    type="text"
                    value={currentKop.instansiTengah}
                    onChange={(e) => handleKopChange('instansiTengah', e.target.value)}
                    placeholder="DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 font-bold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <span className="text-[10px] text-zinc-400">Contoh: DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA</span>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Sub-Instansi / Korwil (Opsional)
                  </label>
                  <input
                    type="text"
                    value={currentKop.instansiBawah || ''}
                    onChange={(e) => handleKopChange('instansiBawah', e.target.value)}
                    placeholder="KOORDINATOR WILAYAH KECAMATAN SINGINGI HILIR"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <span className="text-[10px] text-zinc-400">Kosongkan jika tidak diperlukan</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Satuan Pendidikan pada Kop Surat (Huruf Tebal)
                  </label>
                  <input
                    type="text"
                    value={currentKop.namaSekolah}
                    onChange={(e) => handleKopChange('namaSekolah', e.target.value)}
                    placeholder="SEKOLAH DASAR NEGERI 006 SUNGAI BULUH"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 font-extrabold text-emerald-950 dark:text-emerald-300 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tipe Garis Pembatas Kop Surat
                  </label>
                  <select
                    value={currentKop.tipeGaris}
                    onChange={(e) => handleKopChange('tipeGaris', e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 font-bold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="ganda">Garis Ganda Resmi (Tebal Atas, Tipis Bawah - Standar Naskah Dinas)</option>
                    <option value="tebal">Garis Tebal Tunggal (3px Solid)</option>
                    <option value="klasik">Garis Ganda Klasik (Double 4px)</option>
                    <option value="modern">Garis Aksen Modern (Gradasi Emerald & Emas)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Alamat Lengkap Sekolah pada Kop Surat
                  </label>
                  <input
                    type="text"
                    value={currentKop.alamat}
                    onChange={(e) => handleKopChange('alamat', e.target.value)}
                    placeholder="Jl. Poros Desa Sungai Buluh, RT 04 / RW 02"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={currentKop.kodePos}
                    onChange={(e) => handleKopChange('kodePos', e.target.value)}
                    placeholder="29563"
                    className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Kontak / Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={currentKop.kontak || ''}
                    onChange={(e) => handleKopChange('kontak', e.target.value)}
                    placeholder="Telp: 0812-7654-3201"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Pos-el (Email Resmi Sekolah)
                  </label>
                  <input
                    type="email"
                    value={currentKop.email || ''}
                    onChange={(e) => handleKopChange('email', e.target.value)}
                    placeholder="sdn006sungaibuluh@gmail.com"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Laman Web (Website Sekolah)
                  </label>
                  <input
                    type="text"
                    value={currentKop.website || ''}
                    onChange={(e) => handleKopChange('website', e.target.value)}
                    placeholder="https://sdn006singingihilir.sch.id"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CARD 2: IDENTITAS SATUAN PENDIDIKAN
           ======================================================== */}
        {(activeSection === 'all' || activeSection === 'identitas') && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <Building className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Identitas Satuan Pendidikan & Data Sekolah
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Satuan Pendidikan
                </label>
                <input
                  type="text"
                  name="namaSekolah"
                  value={formData.namaSekolah}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  NPSN
                </label>
                <input
                  type="text"
                  name="npsn"
                  value={formData.npsn}
                  onChange={handleChange}
                  className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  NSS
                </label>
                <input
                  type="text"
                  name="nss"
                  value={formData.nss}
                  onChange={handleChange}
                  className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Akreditasi Sekolah
                </label>
                <input
                  type="text"
                  name="akreditasi"
                  value={formData.akreditasi}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  name="tahunPelajaran"
                  value={formData.tahunPelajaran}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Desa / Kelurahan
                </label>
                <input
                  type="text"
                  name="desa"
                  value={formData.desa}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Kabupaten
                </label>
                <input
                  type="text"
                  name="kabupaten"
                  value={formData.kabupaten}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tempat & Tanggal Kelulusan
                </label>
                <input
                  type="text"
                  name="tanggalKelulusan"
                  value={formData.tanggalKelulusan}
                  onChange={handleChange}
                  placeholder="10 Juni 2026"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CARD 3: PEJABAT PENANDATANGAN SKHU & IJAZAH
           ======================================================== */}
        {(activeSection === 'all' || activeSection === 'pejabat') && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <School className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Pejabat Penandatangan SKHU & Ijazah
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  name="kepalaSekolah"
                  value={formData.kepalaSekolah}
                  onChange={handleChange}
                  className="w-full font-bold rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  name="nipKepalaSekolah"
                  value={formData.nipKepalaSekolah}
                  onChange={handleChange}
                  className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Ketua Panitia Ujian
                </label>
                <input
                  type="text"
                  name="ketuaPanitia"
                  value={formData.ketuaPanitia}
                  onChange={handleChange}
                  className="w-full font-bold rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  NIP Ketua Panitia
                </label>
                <input
                  type="text"
                  name="nipKetuaPanitia"
                  value={formData.nipKetuaPanitia}
                  onChange={handleChange}
                  className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CARD 4: FORMULA PEMBOBOTAN NILAI AKHIR
           ======================================================== */}
        {(activeSection === 'all' || activeSection === 'bobot') && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <Sliders className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Formula Bobot Nilai Akhir & KKM Kelulusan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Bobot Rata-rata Rapor S7-S12 (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="bobotRapor"
                  value={formData.bobotRapor}
                  onChange={handleChange}
                  className="w-full font-mono font-bold rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <span className="text-[10px] text-zinc-500">Standar Nasional: 60%</span>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Bobot Nilai Ujian Sekolah / US (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  name="bobotUS"
                  value={formData.bobotUS}
                  onChange={handleChange}
                  className="w-full font-mono font-bold rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <span className="text-[10px] text-zinc-500">Standar Nasional: 40%</span>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Batas Minimal Kelulusan (KKM)
                </label>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  max={100}
                  name="kkmKelulusan"
                  value={formData.kkmKelulusan}
                  onChange={handleChange}
                  className="w-full font-mono font-bold rounded-xl border border-zinc-200 px-3.5 py-2 text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <span className="text-[10px] text-zinc-500">Nilai Akhir &ge; KKM dinyatakan Lulus</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CARD 5: CADANGAN & PEMULIHAN BASIS DATA
           ======================================================== */}
        {(activeSection === 'all' || activeSection === 'backup') && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Cadangan & Pemulihan Basis Data (Offline First & Sync)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Ekspor Cadangan (JSON)</h4>
                <p className="text-zinc-500 text-[11px]">
                  Simpan seluruh database peserta, nilai rapor, US, profil sekolah, dan format kop surat.
                </p>
                <button
                  type="button"
                  onClick={exportToJSON}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Unduh File Cadangan
                </button>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Pulihkan Data (JSON)</h4>
                <p className="text-zinc-500 text-[11px]">
                  Muat kembali file cadangan JSON yang pernah diunduh sebelumnya.
                </p>
                <label className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>Pilih Berkas JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 p-4 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                <h4 className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  Reset Data Pabrik
                </h4>
                <p className="text-zinc-500 text-[11px]">
                  Kembalikan seluruh data peserta, nilai rapor, dan pengaturan ke data standar SDN 006 Sungai Buluh.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi awal?')) {
                      resetToDefaultData();
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset ke Default
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
