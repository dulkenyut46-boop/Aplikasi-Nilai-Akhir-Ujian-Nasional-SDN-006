import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Moon,
  Sun,
  Download,
  Printer,
  Search,
  ShieldCheck,
  Building,
  Calendar,
  Lock,
  Unlock,
  ChevronDown,
  Plus,
  Check,
} from 'lucide-react';

interface TopbarProps {
  onToggleMobile: () => void;
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobile, collapsed }) => {
  const {
    activeTab,
    setActiveTab,
    darkMode,
    toggleDarkMode,
    schoolProfile,
    students,
    exportToCSV,
    exportToJSON,
    downloadStudentCSVTemplate,
    setSelectedStudentForSKHU,
    tpArchives,
    isCurrentTpLocked,
    switchTahunPelajaran,
    toggleTpLock,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTpMenu, setShowTpMenu] = useState(false);
  const [newTpInput, setNewTpInput] = useState('');

  // Compute suggested next TP from current TP (e.g. 2025/2026 -> 2026/2027)
  const suggestedNextTp = (() => {
    const match = schoolProfile.tahunPelajaran.match(/^(\d{4})\/(\d{4})$/);
    if (match) {
      return `${Number(match[1]) + 1}/${Number(match[2]) + 1}`;
    }
    return '2026/2027';
  })();

  const handleCreateOrSwitchTp = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTpInput.trim();
    if (!trimmed) return;
    switchTahunPelajaran(trimmed);
    setNewTpInput('');
    setShowTpMenu(false);
  };

  // Module titles
  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Rekapitulasi Nilai Akhir',
      subtitle: 'Monitoring kelengkapan data, rata-rata nilai US & Rapor, dan statistik kelulusan',
    },
    students: {
      title: 'Data Pokok Peserta Ujian (Data PD)',
      subtitle: 'Pengelolaan biodata peserta, penomoran peserta ujian, dan pembagian ruang',
    },
    'student-photos': {
      title: 'Foto Peserta Siswa (Denah, Kartu & Ijazah)',
      subtitle: 'Kelola pas foto resmi 2x3 dan 3x4 untuk denah ruang ujian, kartu peserta, dan SKHU',
    },
    rapor: {
      title: 'Rekap Nilai Rapor Semester 7 s.d. 12',
      subtitle: 'Nilai per semester Kelas IV, V, VI dan kalkulasi otomatis rata-rata rapor K13',
    },
    exam: {
      title: 'Nilai Ujian Sekolah (N_US)',
      subtitle: 'Input dan rekapitulasi nilai teori (tulis) serta praktik per mata pelajaran',
    },
    'final-rekap': {
      title: 'Rekap Nilai Akhir (K-13 / Kurikulum Nasional)',
      subtitle: 'Penggabungan 60% Rata-rata Rapor + 40% Ujian Sekolah dan perangkingan',
    },
    'grades-template-import': {
      title: 'Template Input Nilai (.xlsx) & Impor Nilai',
      subtitle: 'Unduh format blangko Excel nilai rapor/US dan sinkronisasi nilai otomatis',
    },
    'exam-tools': {
      title: 'Perangkat Ujian & Denah Ruang',
      subtitle: 'Denah Ruang 1-4, Kartu Peserta UN, Daftar Hadir, dan Panitia Pengawas TPU VI',
    },
    diploma: {
      title: 'Penerbitan SKHU & Buku Ijazah',
      subtitle: 'Cetak Surat Keterangan Hasil Ujian resmi, SK Kelulusan, dan Buku Serah Terima',
    },
    settings: {
      title: 'Pengaturan Sekolah & Formula Bobot',
      subtitle: 'Konfigurasi identitas sekolah, Kepala Sekolah, NIP, bobot persentase, dan KKM',
    },
  };

  const currentInfo = titles[activeTab] || titles.dashboard;

  const filteredSearchStudents = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.noPeserta.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nisn.includes(searchQuery)
      ).slice(0, 5)
    : [];

  return (
    <header
      className={`sticky top-0 z-30 flex h-18 items-center justify-between border-b border-sky-300/80 bg-white/90 px-4 backdrop-blur-md transition-all dark:border-sky-900/60 dark:bg-slate-900/90 lg:px-6 print:hidden`}
    >
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-800 hover:bg-sky-100/80 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-400">
              SDN 006 SUNGAI BULUH
            </span>
            <span className="text-sky-400 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <Building className="h-3 w-3" />
              Kec. Singingi Hilir
            </span>
          </div>
          <h1 className="text-base font-extrabold text-slate-950 dark:text-slate-50 leading-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <div className="relative hidden md:block max-w-xs w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-800 dark:text-sky-400" />
          <input
            type="text"
            placeholder="Cari Peserta (Nama, NISN, No UN)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full rounded-xl border border-sky-300 bg-sky-50/80 py-2 pl-9 pr-4 text-xs font-medium text-slate-950 placeholder-slate-600 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600/20 dark:border-sky-800/70 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-sky-500"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && filteredSearchStudents.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-sky-300 bg-white p-2 shadow-xl dark:border-sky-800 dark:bg-slate-800 z-50">
            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase px-2 py-1">Hasil Pencarian Peserta</div>
            {filteredSearchStudents.map((std) => (
              <div
                key={std.id}
                onClick={() => {
                  setActiveTab('students');
                  setShowSearchResults(false);
                  setSearchQuery('');
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/40 cursor-pointer text-xs"
              >
                <div>
                  <div className="font-bold text-slate-950 dark:text-slate-100">{std.nama}</div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 font-mono">No: {std.noPeserta} | {std.ruang}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudentForSKHU(std);
                    setActiveTab('diploma');
                    setShowSearchResults(false);
                  }}
                  className="px-2 py-1 bg-sky-100 text-sky-950 dark:bg-sky-900/60 dark:text-sky-200 rounded text-[10px] font-bold"
                >
                  Lihat SKHU
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50/90 px-3 py-2 text-xs font-bold text-slate-900 hover:bg-sky-100 dark:border-sky-800/70 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Ekspor Data Rekap"
          >
            <Download className="h-4 w-4 text-sky-800 dark:text-sky-400" />
            <span className="hidden sm:inline">Ekspor Data</span>
          </button>

          {showExportMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-sky-300 bg-white p-2 shadow-xl dark:border-sky-800 dark:bg-slate-800 z-50 animate-in fade-in"
              onMouseLeave={() => setShowExportMenu(false)}
            >
              <button
                onClick={() => {
                  downloadStudentCSVTemplate();
                  setShowExportMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-900 hover:bg-sky-50 hover:text-sky-950 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <span>Unduh Template Siswa (CSV)</span>
              </button>
              <button
                onClick={() => {
                  exportToCSV();
                  setShowExportMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-900 hover:bg-sky-50 hover:text-sky-950 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4 text-sky-800 dark:text-sky-400" />
                <span>Download Excel/CSV Rekap</span>
              </button>
              <button
                onClick={() => {
                  exportToJSON();
                  setShowExportMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-900 hover:bg-sky-50 hover:text-sky-950 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <ShieldCheck className="h-4 w-4 text-blue-800 dark:text-blue-400" />
                <span>Backup Basis Data (JSON)</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Print Button */}
        <button
          onClick={() => {
            setActiveTab('diploma');
          }}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-700 to-blue-700 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-sky-700/20 hover:from-sky-800 hover:to-blue-800 transition-all"
          title="Cetak Berkas Ijazah & SKHU"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden md:inline">Cetak Dokumen</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl border border-sky-300 bg-sky-50/90 p-2 text-slate-900 hover:bg-sky-100 dark:border-sky-800/70 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
          title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-sky-900" />}
        </button>

        {/* Tahun Pelajaran (TP) Switcher & Lock Indicator */}
        <div className="relative pl-1 sm:pl-2 sm:border-l border-sky-300 dark:border-sky-800/70">
          <button
            type="button"
            onClick={() => setShowTpMenu((prev) => !prev)}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-all cursor-pointer ${
              isCurrentTpLocked
                ? 'border-amber-400 bg-amber-50/90 text-amber-950 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200'
                : 'border-sky-300 bg-sky-50/95 text-slate-950 hover:bg-sky-100 dark:border-sky-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Ganti Tahun Pelajaran (TP) atau kelola kunci arsip data"
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg font-extrabold text-xs ${
                isCurrentTpLocked
                  ? 'bg-amber-200/80 text-amber-950 dark:bg-amber-900/70 dark:text-amber-200'
                  : 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300'
              }`}
            >
              {isCurrentTpLocked ? <Lock className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 leading-none">
                {isCurrentTpLocked ? 'Arsip Terkunci' : 'Tahun Pelajaran'}
              </span>
              <span className="text-xs font-extrabold text-slate-950 dark:text-white leading-tight mt-0.5 flex items-center gap-1">
                TP {schoolProfile.tahunPelajaran}
                <ChevronDown className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
              </span>
            </div>
          </button>

          {showTpMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowTpMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-2xl border border-sky-300 bg-white p-3.5 shadow-2xl dark:border-sky-800 dark:bg-slate-900 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">
                      Pilih Tahun Pelajaran (TP)
                    </h4>
                    <p className="text-[11px] text-slate-700 dark:text-slate-400">
                      Data tiap TP tersimpan &amp; terkunci terpisah
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleTpLock()}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border transition-colors cursor-pointer ${
                      isCurrentTpLocked
                        ? 'border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200'
                        : 'border-sky-300 bg-sky-50 text-sky-950 hover:bg-sky-100 dark:border-sky-800 dark:bg-slate-800 dark:text-sky-300'
                    }`}
                    title={isCurrentTpLocked ? 'Buka kunci edit TP ini' : 'Kunci data TP ini'}
                  >
                    {isCurrentTpLocked ? (
                      <>
                        <Unlock className="h-3 w-3" />
                        Buka Kunci
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        Kunci TP Ini
                      </>
                    )}
                  </button>
                </div>

                {/* Daftar Arsip TP */}
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-0.5">
                  {tpArchives.map((item) => {
                    const isActive = item.tahunPelajaran === schoolProfile.tahunPelajaran;
                    return (
                      <div
                        key={item.tahunPelajaran}
                        className={`flex items-center justify-between gap-2 rounded-xl border p-2 transition-colors ${
                          isActive
                            ? 'border-sky-500 bg-sky-50/90 dark:border-sky-600 dark:bg-sky-950/50'
                            : 'border-slate-200 bg-white hover:bg-sky-50/60 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            switchTahunPelajaran(item.tahunPelajaran);
                            setShowTpMenu(false);
                          }}
                          className="flex-1 text-left flex items-center gap-2 cursor-pointer min-w-0"
                        >
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              isActive
                                ? 'bg-sky-700 text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {isActive ? <Check className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-slate-950 dark:text-white">
                                TP {item.tahunPelajaran}
                              </span>
                              {isActive && (
                                <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-sky-700 text-white">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate">
                              {item.studentCount > 0
                                ? `${item.studentCount} Peserta • ${item.locked ? 'Terkunci' : 'Siap Edit'}`
                                : 'Data Kosong (TP Baru)'}
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleTpLock(item.tahunPelajaran)}
                          className={`shrink-0 rounded-lg p-1.5 border text-[10px] font-bold transition-colors cursor-pointer ${
                            item.locked
                              ? 'border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                          title={item.locked ? 'Terkunci (Klik untuk buka kunci)' : 'Terbuka (Klik untuk kunci)'}
                        >
                          {item.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Buat / Pindah ke TP Baru */}
                <div className="border-t border-sky-100 dark:border-slate-800 pt-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200">
                      Pindah / Buat TP Baru (Data Kosong):
                    </span>
                    {!tpArchives.some((a) => a.tahunPelajaran === suggestedNextTp) && (
                      <button
                        type="button"
                        onClick={() => {
                          switchTahunPelajaran(suggestedNextTp);
                          setShowTpMenu(false);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-900 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        {suggestedNextTp}
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleCreateOrSwitchTp} className="flex gap-1.5">
                    <input
                      type="text"
                      value={newTpInput}
                      onChange={(e) => setNewTpInput(e.target.value)}
                      placeholder="Contoh: 2026/2027"
                      className="flex-1 rounded-xl border border-sky-300 bg-sky-50/60 px-2.5 py-1.5 text-xs font-semibold text-slate-950 placeholder-slate-600 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-xl bg-sky-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-800 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ganti
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
