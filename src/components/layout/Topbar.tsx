import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Moon,
  Sun,
  Download,
  Printer,
  Search,
  Bell,
  ShieldCheck,
  UserCheck,
  Building,
  CheckCircle2,
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
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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
      className={`sticky top-0 z-30 flex h-18 items-center justify-between border-b border-sky-200/80 bg-white/75 px-4 backdrop-blur-md transition-all dark:border-sky-900/60 dark:bg-slate-900/85 lg:px-6 print:hidden`}
    >
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-sky-100/70 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              SDN 006 SUNGAI BULUH
            </span>
            <span className="text-sky-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Building className="h-3 w-3" />
              Kec. Singingi Hilir
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 leading-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <div className="relative hidden md:block max-w-xs w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500/80" />
          <input
            type="text"
            placeholder="Cari Peserta (Nama, NISN, No UN)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full rounded-xl border border-sky-200/90 bg-sky-50/70 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-sky-800/70 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:border-sky-500"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && filteredSearchStudents.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-sky-200 bg-white/95 backdrop-blur-md p-2 shadow-xl dark:border-sky-800 dark:bg-slate-800 z-50">
            <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Hasil Pencarian Peserta</div>
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
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{std.nama}</div>
                  <div className="text-[11px] text-slate-500 font-mono">No: {std.noPeserta} | {std.ruang}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudentForSKHU(std);
                    setActiveTab('diploma');
                    setShowSearchResults(false);
                  }}
                  className="px-2 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 rounded text-[10px] font-bold"
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
            className="flex items-center gap-1.5 rounded-xl border border-sky-200/90 bg-sky-50/80 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-100/80 dark:border-sky-800/70 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Ekspor Data Rekap"
          >
            <Download className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Ekspor Data</span>
          </button>

          {showExportMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-sky-200 bg-white/95 backdrop-blur-md p-2 shadow-xl dark:border-sky-800 dark:bg-slate-800 z-50 animate-in fade-in"
              onMouseLeave={() => setShowExportMenu(false)}
            >
              <button
                onClick={() => {
                  downloadStudentCSVTemplate();
                  setShowExportMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4 text-amber-600" />
                <span>Unduh Template Siswa (CSV)</span>
              </button>
              <button
                onClick={() => {
                  exportToCSV();
                  setShowExportMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4 text-sky-600" />
                <span>Download Excel/CSV Rekap</span>
              </button>
              <button
                onClick={() => {
                  exportToJSON();
                  setShowExportMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ShieldCheck className="h-4 w-4 text-blue-600" />
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
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-600/20 hover:from-sky-700 hover:to-blue-700 transition-all"
          title="Cetak Berkas Ijazah & SKHU"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden md:inline">Cetak Dokumen</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl border border-sky-200/90 bg-sky-50/80 p-2 text-slate-700 hover:bg-sky-100/80 dark:border-sky-800/70 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-sky-700" />}
        </button>

        {/* Operator Badge */}
        <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-sky-200 dark:border-sky-800/70">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800 font-bold text-xs">
            OP
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
              Panitia Ujian
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              TP {schoolProfile.tahunPelajaran}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
