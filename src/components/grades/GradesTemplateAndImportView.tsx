import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { SUBJECT_LIST } from '../../constants/subjects';
import { SubjectKey } from '../../types';
import { Badge } from '../common/Badge';
import { ImportGradesModal } from './ImportGradesModal';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Layers,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck,
  Search,
  Eye,
  RefreshCw,
  FolderDown,
  Info,
} from 'lucide-react';

export const GradesTemplateAndImportView: React.FC = () => {
  const {
    students,
    schoolProfile,
    downloadGradesExcelTemplate,
    downloadMasterGradesWorkbook,
    showToast,
  } = useApp();

  type TabKey = 'templates' | 'import-center' | 'completeness';
  const [activeTab, setActiveTab] = useState<TabKey>('templates');
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<string>('master');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<'rapor' | 'us'>('rapor');
  const [modalSemester, setModalSemester] = useState<'s7' | 's8' | 's9' | 's10' | 's11' | 's12'>('s12');

  const [searchStudent, setSearchStudent] = useState('');

  const templateList = [
    {
      id: 'master',
      title: 'Master Workbook Nilai Lengkap',
      subtitle: 'Semua Sheet (S7 s.d S12 & US)',
      type: 'master',
      format: '.XLSX',
      description: 'Berkas komprehensif berisi seluruh lembar kerja nilai rapor Kelas 4, 5, 6 dan Ujian Sekolah dalam 1 file workbook.',
      color: 'emerald',
      action: () => downloadMasterGradesWorkbook(),
    },
    {
      id: 'us',
      title: 'Template Nilai Ujian Sekolah (N_US)',
      subtitle: 'Teori & Praktik (10 Mapel)',
      type: 'us',
      format: '.XLSX',
      description: 'Format ujian tertulis dan ujian praktik untuk PAB, BIN, IPA, SBdP, PJOK, dll. Lengkap dengan formula perhitungan US.',
      color: 'blue',
      action: () => downloadGradesExcelTemplate('us'),
    },
    {
      id: 's12',
      title: 'Template Rapor Semester 12',
      subtitle: 'Kelas VI Semester 2',
      type: 'rapor',
      semester: 's12' as const,
      format: '.XLSX',
      description: 'Format nilai rapor semester genap kelas 6 sebagai penentu akhir kelulusan SD.',
      color: 'teal',
      action: () => downloadGradesExcelTemplate('rapor', 's12'),
    },
    {
      id: 's11',
      title: 'Template Rapor Semester 11',
      subtitle: 'Kelas VI Semester 1',
      type: 'rapor',
      semester: 's11' as const,
      format: '.XLSX',
      description: 'Format nilai rapor semester ganjil kelas 6.',
      color: 'teal',
      action: () => downloadGradesExcelTemplate('rapor', 's11'),
    },
    {
      id: 's10',
      title: 'Template Rapor Semester 10',
      subtitle: 'Kelas V Semester 2',
      type: 'rapor',
      semester: 's10' as const,
      format: '.XLSX',
      description: 'Format nilai rapor semester genap kelas 5.',
      color: 'teal',
      action: () => downloadGradesExcelTemplate('rapor', 's10'),
    },
    {
      id: 's9',
      title: 'Template Rapor Semester 9',
      subtitle: 'Kelas V Semester 1',
      type: 'rapor',
      semester: 's9' as const,
      format: '.XLSX',
      description: 'Format nilai rapor semester ganjil kelas 5.',
      color: 'teal',
      action: () => downloadGradesExcelTemplate('rapor', 's9'),
    },
    {
      id: 's8',
      title: 'Template Rapor Semester 8',
      subtitle: 'Kelas IV Semester 2',
      type: 'rapor',
      semester: 's8' as const,
      format: '.XLSX',
      description: 'Format nilai rapor semester genap kelas 4.',
      color: 'teal',
      action: () => downloadGradesExcelTemplate('rapor', 's8'),
    },
    {
      id: 's7',
      title: 'Template Rapor Semester 7',
      subtitle: 'Kelas IV Semester 1',
      type: 'rapor',
      semester: 's7' as const,
      format: '.XLSX',
      description: 'Format nilai rapor semester ganjil kelas 4 dasar penilaian K13.',
      color: 'teal',
      action: () => downloadGradesExcelTemplate('rapor', 's7'),
    },
  ];

  // Helper to check completeness
  const checkStudentGradesCompleteness = (s: (typeof students)[0]) => {
    const sems: Array<'s7' | 's8' | 's9' | 's10' | 's11' | 's12'> = ['s7', 's8', 's9', 's10', 's11', 's12'];
    let completeSems = 0;
    sems.forEach((sem) => {
      const scores = s.rapor[sem] || {};
      const filled = SUBJECT_LIST.filter((sub) => (scores[sub.key] ?? 0) > 0).length;
      if (filled >= SUBJECT_LIST.length) completeSems++;
    });

    const usScores = s.us || {};
    const usFilled = SUBJECT_LIST.filter((sub) => (usScores[sub.key]?.akhir ?? 0) > 0).length;
    const usComplete = usFilled >= SUBJECT_LIST.length;

    const percentage = Math.round(((completeSems + (usComplete ? 1 : 0)) / 7) * 100);

    return {
      completeSems,
      usComplete,
      percentage,
      isFullyComplete: percentage === 100,
    };
  };

  const filteredStudents = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.noPeserta.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.nisn.includes(searchStudent)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Menu Template & Impor Nilai (.xlsx)
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Pusat unduhan blangko resmi Microsoft Excel (.xlsx) untuk nilai Rapor Semester 7 s.d. 12 dan Ujian Sekolah SDN 006 Sungai Buluh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setModalCategory('rapor');
              setModalSemester('s12');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
          >
            <Upload className="h-4 w-4" />
            Impor Berkas Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={downloadMasterGradesWorkbook}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
          >
            <FolderDown className="h-4 w-4" />
            Unduh Master Workbook Lengkap
          </button>
        </div>
      </div>

      {/* View Sub Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {[
          { key: 'templates', label: '1. Unduh Template Excel (.xlsx)', icon: Download },
          { key: 'import-center', label: '2. Cara Kerja & Impor Berkas', icon: Upload },
          { key: 'completeness', label: '3. Rekap Kelengkapan Nilai Siswa', icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. TAB: TEMPLATES GRID & PREVIEW */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Information Callout */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
              <p className="font-bold">
                Format Template Excel telah disinkronkan dengan Data Peserta Didik (DNT) SDN 006 Sungai Buluh.
              </p>
              <p className="text-emerald-800 dark:text-emerald-300">
                Kolom No Peserta, NISN, Nama Siswa, dan Ruang telah terisi otomatis. Anda dapat mendistribusikan file ini ke Bapak/Ibu Guru Mata Pelajaran atau Wali Kelas untuk pengisian nilai secara offline.
              </p>
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templateList.map((tpl) => (
              <div
                key={tpl.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {tpl.format}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {tpl.subtitle}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPreviewTemplate(tpl.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Lihat Kolom
                  </button>

                  <button
                    type="button"
                    onClick={tpl.action}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh .xlsx
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Table Preview of Template Structure */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-600" />
                  Pratinjau Struktur Kolom Template Excel ({selectedPreviewTemplate.toUpperCase()})
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Tampilan simulasi kolom dan data baris saat dibuka di Microsoft Excel
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-medium">Contoh 5 Siswa Pertama</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3">No Peserta</th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Ruang</th>
                    {selectedPreviewTemplate === 'us' ? (
                      <>
                        <th className="p-3 text-center bg-blue-50 dark:bg-blue-950/40">PAB_Tulis</th>
                        <th className="p-3 text-center bg-blue-50 dark:bg-blue-950/40">PAB_Praktik</th>
                        <th className="p-3 text-center bg-blue-50 dark:bg-blue-950/40">PPKn_Tulis</th>
                        <th className="p-3 text-center bg-blue-50 dark:bg-blue-950/40">BIN_Tulis</th>
                        <th className="p-3 text-center bg-blue-50 dark:bg-blue-950/40">BIN_Praktik</th>
                        <th className="p-3 text-center bg-blue-50 dark:bg-blue-950/40">MAT_Tulis</th>
                        <th className="p-3 text-center bg-blue-50 dark:bg-blue-950/40">IPA_Tulis</th>
                        <th className="p-3 text-center bg-blue-50 dark:bg-blue-950/40">IPA_Praktik</th>
                      </>
                    ) : (
                      SUBJECT_LIST.map((sub) => (
                        <th key={sub.key} className="p-3 text-center bg-emerald-50 dark:bg-emerald-950/30">
                          {sub.code}
                          <div className="text-[9px] font-normal text-zinc-400">KKM {sub.kkm}</div>
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                  {students.slice(0, 5).map((s, idx) => (
                    <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-3 text-center text-zinc-500 font-bold">{idx + 1}</td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-300 font-semibold">{s.noPeserta}</td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-400">{s.nisn}</td>
                      <td className="p-3 font-sans font-bold text-zinc-900 dark:text-zinc-100">{s.nama}</td>
                      <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">{s.ruang}</td>
                      {selectedPreviewTemplate === 'us' ? (
                        <>
                          <td className="p-3 text-center text-zinc-700 dark:text-zinc-300">{s.us.pab?.tulis ?? 85}</td>
                          <td className="p-3 text-center text-zinc-700 dark:text-zinc-300">{s.us.pab?.praktik ?? 85}</td>
                          <td className="p-3 text-center text-zinc-700 dark:text-zinc-300">{s.us.ppkn?.tulis ?? 85}</td>
                          <td className="p-3 text-center text-zinc-700 dark:text-zinc-300">{s.us.bin?.tulis ?? 85}</td>
                          <td className="p-3 text-center text-zinc-700 dark:text-zinc-300">{s.us.bin?.praktik ?? 85}</td>
                          <td className="p-3 text-center text-zinc-700 dark:text-zinc-300">{s.us.mat?.tulis ?? 85}</td>
                          <td className="p-3 text-center text-zinc-700 dark:text-zinc-300">{s.us.ipa?.tulis ?? 85}</td>
                          <td className="p-3 text-center text-zinc-700 dark:text-zinc-300">{s.us.ipa?.praktik ?? 85}</td>
                        </>
                      ) : (
                        SUBJECT_LIST.map((sub) => (
                          <td key={sub.key} className="p-3 text-center text-zinc-800 dark:text-zinc-200">
                            {s.rapor.s12?.[sub.key] ?? 85}
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: PANDUAN & IMPORT CENTER */}
      {activeTab === 'import-center' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black">
                  1
                </span>
                Langkah 1: Unduh Template
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Gunakan Template Resmi .xlsx
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Unduh template dari Tab 1 sesuai jenis nilai yang ingin diisi (Rapor per semester atau Ujian Sekolah). Jangan mengubah susunan kolom No Peserta & NISN.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Pilih Template Sekarang →
              </button>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black">
                  2
                </span>
                Langkah 2: Isi Nilai Siswa
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pengisian Offline di Excel
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Buka file di Microsoft Excel, WPS Office, atau Google Spreadsheet. Masukkan angka nilai 0 s.d. 100 untuk masing-masing siswa. Simpan perubahan file.
              </p>
              <div className="text-[11px] text-zinc-400">
                Rentang nilai valid: 0.0 - 100.0
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black">
                  3
                </span>
                Langkah 3: Unggah Berkas
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Sinkronisasi Otomatis
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Klik tombol "Mulai Impor Berkas" di bawah. Sistem akan memvalidasi kecocokan nama & no ujian, memeriksa rentang nilai, dan memperbarui seluruh rekap akhir.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Mulai Impor Berkas
              </button>
            </div>
          </div>

          {/* Interactive Direct Import Trigger Banner */}
          <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950/20 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 shadow-sm">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Siap Mengimpor Nilai Siswa ke Sistem?
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Anda dapat mengunggah berkas .xlsx, .xls, .csv atau menempelkan (paste) data sel langsung dari clipboard Microsoft Excel.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Buka Menu Impor Nilai (.xlsx)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: REKAP KELENGKAPAN NILAI SISWA */}
      {activeTab === 'completeness' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-600" />
                Matriks Kelengkapan Nilai Siswa (Data Readiness)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pantau kelengkapan nilai Rapor Semester 7 s.d. 12 dan Ujian Sekolah per peserta didik
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari Siswa..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">No. Peserta</th>
                  <th className="p-3 text-center">S7</th>
                  <th className="p-3 text-center">S8</th>
                  <th className="p-3 text-center">S9</th>
                  <th className="p-3 text-center">S10</th>
                  <th className="p-3 text-center">S11</th>
                  <th className="p-3 text-center">S12</th>
                  <th className="p-3 text-center">US</th>
                  <th className="p-3 text-center">Persentase</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredStudents.map((s, idx) => {
                  const check = checkStudentGradesCompleteness(s);
                  return (
                    <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-3 text-center font-bold text-zinc-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">{s.nama}</td>
                      <td className="p-3 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{s.noPeserta}</td>
                      
                      {/* S7 - S12 Checks */}
                      {(['s7', 's8', 's9', 's10', 's11', 's12'] as const).map((sem) => {
                        const scores = s.rapor[sem] || {};
                        const hasAll = SUBJECT_LIST.every((sub) => (scores[sub.key] ?? 0) > 0);
                        return (
                          <td key={sem} className="p-3 text-center">
                            {hasAll ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500 inline" />
                            )}
                          </td>
                        );
                      })}

                      {/* US Check */}
                      <td className="p-3 text-center">
                        {check.usComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500 inline" />
                        )}
                      </td>

                      {/* Percentage */}
                      <td className="p-3 text-center font-bold text-zinc-800 dark:text-zinc-200">
                        {check.percentage}%
                      </td>

                      {/* Badge Status */}
                      <td className="p-3 text-center">
                        <Badge
                          variant={check.isFullyComplete ? 'emerald' : 'warning'}
                          size="sm"
                        >
                          {check.isFullyComplete ? 'Lengkap 100%' : 'Sebagian'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Import Modal */}
      <ImportGradesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCategory={modalCategory}
        defaultSemester={modalSemester}
      />
    </div>
  );
};
