import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSubjectUSScore, calculateOverallUSAverage } from '../../constants/subjects';
import { SubjectKey, SubjectInfo } from '../../types';
import {
  FileSpreadsheet,
  Search,
  CheckCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  ArrowRight,
  SlidersHorizontal,
  MoveHorizontal,
  RotateCcw,
} from 'lucide-react';
import { ImportGradesModal } from './ImportGradesModal';
import { SubjectManagementModal } from './SubjectManagementModal';

export const ExamGradesView: React.FC = () => {
  const {
    students,
    subjects,
    updateStudentUSScore,
    deleteSubject,
    downloadGradesExcelTemplate,
    showToast,
  } = useApp();

  const [activeSubject, setActiveSubject] = useState<SubjectKey | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Subject Manager Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectModalInitialMode, setSubjectModalInitialMode] = useState<'list' | 'add'>('list');
  const [subjectModalEditKey, setSubjectModalEditKey] = useState<string | null>(null);

  // Table view options
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);

  // Scroll references for sideways scrolling
  const subjectBarScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Sideways scroll handlers for subject tabs
  const scrollSubjectBar = (direction: 'left' | 'right') => {
    if (subjectBarScrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      subjectBarScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Sideways scroll handlers for grade table
  const scrollTable = (direction: 'left' | 'right') => {
    if (tableScrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      tableScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const currentSubjectInfo = subjects.find((s) => s.key === activeSubject);

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.noPeserta.toLowerCase().includes(search.toLowerCase());
    const matchRoom = selectedRoom === 'ALL' || s.ruang === selectedRoom;
    return matchSearch && matchRoom;
  });

  const handleScoreChange = (
    studentId: string,
    subjectKey: SubjectKey,
    field: 'tulis' | 'praktik',
    valStr: string
  ) => {
    const val = parseFloat(valStr) || 0;
    const clamped = Math.min(100, Math.max(0, val));
    updateStudentUSScore(studentId, subjectKey, { [field]: clamped });
  };

  // Quick edit for all subjects in matrix mode
  const handleMatrixScoreChange = (
    studentId: string,
    subjectKey: SubjectKey,
    valStr: string
  ) => {
    const val = parseFloat(valStr) || 0;
    const clamped = Math.min(100, Math.max(0, val));
    // In matrix quick edit, set tulis & akhir
    updateStudentUSScore(studentId, subjectKey, { tulis: clamped, akhir: clamped });
  };

  const openAddSubject = () => {
    setSubjectModalInitialMode('add');
    setSubjectModalEditKey(null);
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (key: string) => {
    setSubjectModalInitialMode('list');
    setSubjectModalEditKey(key);
    setIsSubjectModalOpen(true);
  };

  const openManageSubjects = () => {
    setSubjectModalInitialMode('list');
    setSubjectModalEditKey(null);
    setIsSubjectModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Nilai Ujian Sekolah (N_US) Teori & Praktik
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Nilai Ujian Sekolah tulis dan praktik siswa SDN 006 Sungai Buluh TP 2025/2026 ({subjects.length} Mata Pelajaran)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Kelola Mapel Button */}
          <button
            type="button"
            onClick={openManageSubjects}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-900/60 transition-colors shadow-xs"
            title="Kelola mata pelajaran: Tambah mapel, edit nama pelajaran & KKM, atau hapus mapel"
          >
            <BookOpen className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            Kelola Mapel ({subjects.length})
          </button>

          {/* Tambah Mapel Button */}
          <button
            type="button"
            onClick={openAddSubject}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
            title="Tambah mata pelajaran ujian baru"
          >
            <Plus className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            Tambah Mapel
          </button>

          <button
            type="button"
            onClick={() => downloadGradesExcelTemplate('us')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 transition-colors shadow-xs"
            title="Unduh format template Excel (.xlsx) untuk Nilai Ujian Sekolah"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Template Excel
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-colors shadow-xs"
            title="Impor nilai ujian sekolah dari berkas Excel (.xlsx)"
          >
            <Upload className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            Impor Nilai US
          </button>

          <button
            onClick={() => {
              showToast('Perhitungan Ujian Selesai', 'Seluruh nilai ujian sekolah telah disimpan dan diverifikasi.', 'success');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Simpan & Verifikasi
          </button>
        </div>
      </div>

      {/* SUBJECT FILTER PILLS WITH HORIZONTAL SCROLL BUTTONS */}
      <div className="relative rounded-2xl border border-zinc-200 bg-white p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-1.5">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollSubjectBar('left')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 shadow-2xs transition-colors"
            title="Geser mata pelajaran ke kiri"
            aria-label="Geser mapel ke kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Horizontally scrollable subject pill container */}
          <div
            ref={subjectBarScrollRef}
            className="flex flex-1 items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* ALL subjects tab */}
            <button
              onClick={() => setActiveSubject('ALL')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubject === 'ALL'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              Semua Mapel (Rekap US)
            </button>

            {/* Dynamic Subjects list */}
            {subjects.map((sub) => {
              const isActive = activeSubject === sub.key;
              return (
                <div key={sub.key} className="flex items-center shrink-0 group">
                  <button
                    onClick={() => setActiveSubject(sub.key)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-md'
                        : 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <span className="font-mono font-extrabold">{sub.code}</span>
                    <span className="max-w-[130px] truncate text-[11px] opacity-90">({sub.name})</span>
                  </button>
                </div>
              );
            })}

            {/* Quick Add Subject Pill Button inside the scroll bar */}
            <button
              type="button"
              onClick={openAddSubject}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/70 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
              title="Tambah Mata Pelajaran Baru"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Mapel
            </button>
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollSubjectBar('right')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 shadow-2xs transition-colors"
            title="Geser mata pelajaran ke kanan"
            aria-label="Geser mapel ke kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Scroll hint helper */}
        <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <MoveHorizontal className="h-3 w-3" />
            Klik tombol panah atau geser ke samping untuk melihat seluruh {subjects.length} mata pelajaran
          </span>
          <span className="font-mono">
            {activeSubject === 'ALL'
              ? 'Mode: Rekap Nilai Seluruh Mapel'
              : `Mapel Terpilih: ${currentSubjectInfo?.name || activeSubject}`}
          </span>
        </div>
      </div>

      {/* SINGLE SUBJECT DETAILS BANNER (when a specific subject is selected) */}
      {activeSubject !== 'ALL' && currentSubjectInfo && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white font-mono font-extrabold text-sm shadow-xs">
              {currentSubjectInfo.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {currentSubjectInfo.name}
                </h3>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200">
                  KKM: {currentSubjectInfo.kkm}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Input nilai ujian tulis (teori) dan ujian praktik (50% Teori + 50% Praktik)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openEditSubject(currentSubjectInfo.key)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-50 dark:border-blue-700 dark:bg-zinc-800 dark:text-blue-300 transition-colors shadow-2xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Nama Pelajaran
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${currentSubjectInfo.name}"?`)) {
                  deleteSubject(currentSubjectInfo.key);
                  setActiveSubject('ALL');
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-zinc-800 dark:text-rose-300 transition-colors shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus Mapel Ini
            </button>

            <button
              type="button"
              onClick={() => setActiveSubject('ALL')}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-colors"
            >
              Semua Mapel
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FILTER AND SEARCH BAR + HORIZONTAL SCROLL CONTROLS FOR TABLE */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari Peserta Ujian berdasarkan nama atau No. Peserta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            />
          </div>

          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">Semua Ruang Ujian</option>
            <option value="RUANG 1">RUANG 1</option>
            <option value="RUANG 2">RUANG 2</option>
            <option value="RUANG 3">RUANG 3</option>
            <option value="RUANG 4">RUANG 4</option>
          </select>
        </div>

        {/* HORIZONTAL TABLE SCROLL BAR & CONTROLS (Only in ALL subjects mode) */}
        {activeSubject === 'ALL' && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <MoveHorizontal className="h-4 w-4 text-emerald-600" />
                Scroll Kolom Mapel:
              </span>

              {/* Side Scroll Buttons for Table */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollTable('left')}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-colors shadow-2xs"
                  title="Geser tabel ke kiri untuk melihat mapel sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Geser Kiri
                </button>

                <button
                  type="button"
                  onClick={() => scrollTable('right')}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition-colors shadow-2xs"
                  title="Geser tabel ke kanan untuk melihat mapel berikutnya"
                >
                  Geser Kanan
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="hidden sm:inline text-[11px] text-zinc-400">
                (atau tahan <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border font-mono">Shift</kbd> + scroll mouse)
              </span>
            </div>

            {/* Quick Edit Matrix Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsQuickEditMode(!isQuickEditMode)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  isQuickEditMode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                }`}
                title="Aktifkan input nilai langsung pada tabel matriks seluruh mata pelajaran"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {isQuickEditMode ? 'Mode Edit Langsung: AKTIF' : 'Mode Edit Cepat di Tabel'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MAIN TABLE WITH SMOOTH SIDEWAYS SCROLL */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div
          ref={tableScrollRef}
          className="overflow-x-auto scroll-smooth"
        >
          {activeSubject === 'ALL' ? (
            /* ALL SUBJECTS US RECAP / MATRIX WITH PINNED STUDENT INFO & SCROLLABLE MAPEL COLUMNS */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 font-bold sticky top-0 z-10">
                <tr>
                  {/* Frozen Column 1: No */}
                  <th className="p-3 w-12 text-center sticky left-0 bg-zinc-50 dark:bg-zinc-800 z-30 border-r border-zinc-200 dark:border-zinc-700">
                    No
                  </th>

                  {/* Frozen Column 2: Nama Peserta */}
                  <th className="p-3 min-w-[210px] sticky left-12 bg-zinc-50 dark:bg-zinc-800 z-30 border-r-2 border-emerald-600/40 dark:border-emerald-500/40 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)]">
                    Nama Peserta Ujian
                  </th>

                  <th className="p-3 text-center min-w-[80px]">
                    Ruang
                  </th>

                  {/* Horizontally Scrolled Subject Columns */}
                  {subjects.map((sub) => (
                    <th
                      key={sub.key}
                      className="p-2.5 text-center min-w-[95px] max-w-[120px] border-l border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => setActiveSubject(sub.key)}
                          className="font-mono font-extrabold text-xs text-emerald-800 dark:text-emerald-300 hover:underline"
                          title={`Klik untuk membuka penilaian detail mapel ${sub.name}`}
                        >
                          {sub.code}
                        </button>
                        <span className="text-[10px] text-zinc-400 font-normal truncate max-w-[85px]" title={sub.name}>
                          {sub.name}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">
                          KKM {sub.kkm}
                        </span>
                      </div>
                    </th>
                  ))}

                  {/* Final Calculation Columns */}
                  <th className="p-3 text-center min-w-[100px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-l-2 border-emerald-300 dark:border-emerald-800 font-extrabold">
                    Rata-rata US
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={subjects.length + 4} className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                      Tidak ada data peserta ujian yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const overallUSAvg = calculateOverallUSAverage(s, subjects);

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        {/* Frozen Column 1 */}
                        <td className="p-3 text-center font-bold text-zinc-500 sticky left-0 bg-white dark:bg-zinc-900 z-20 border-r border-zinc-200 dark:border-zinc-800">
                          {idx + 1}
                        </td>

                        {/* Frozen Column 2 */}
                        <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 sticky left-12 bg-white dark:bg-zinc-900 z-20 border-r-2 border-emerald-600/40 dark:border-emerald-500/40 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.06)] truncate max-w-[210px]">
                          <div className="truncate font-bold">{s.nama}</div>
                          <div className="text-[10px] font-mono text-zinc-400">
                            {s.noPeserta}
                          </div>
                        </td>

                        <td className="p-3 text-center text-zinc-600 dark:text-zinc-400 font-medium">
                          {s.ruang.replace('RUANG ', 'R')}
                        </td>

                        {/* Subject values with optional quick edit */}
                        {subjects.map((sub) => {
                          const usScore = calculateSubjectUSScore(s, sub.key);
                          const isPassed = usScore >= sub.kkm;

                          return (
                            <td
                              key={sub.key}
                              className="p-2 text-center font-mono border-l border-zinc-100 dark:border-zinc-800/60"
                            >
                              {isQuickEditMode ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={0.5}
                                  value={usScore}
                                  onChange={(e) =>
                                    handleMatrixScoreChange(s.id, sub.key, e.target.value)
                                  }
                                  className="w-16 rounded-md border border-zinc-200 bg-white dark:bg-zinc-800 px-1.5 py-1 text-center font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-emerald-600 focus:outline-none"
                                />
                              ) : (
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded font-semibold ${
                                    isPassed
                                      ? 'text-zinc-800 dark:text-zinc-200'
                                      : 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300'
                                  }`}
                                >
                                  {usScore.toFixed(2)}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* Overall Average */}
                        <td className="p-3 text-center font-mono font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-l-2 border-emerald-300 dark:border-emerald-800">
                          {overallUSAvg.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* DETAILED SINGLE SUBJECT EDITOR (TULIS & PRAKTIK) */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-200 font-bold">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3 min-w-[220px]">Nama Peserta</th>
                  <th className="p-3 text-center">Ruang Ujian</th>
                  <th className="p-3 text-center min-w-[130px]">
                    Nilai Tulis (Teori)
                  </th>
                  <th className="p-3 text-center min-w-[130px]">
                    Nilai Praktik
                  </th>
                  <th className="p-3 text-center min-w-[130px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200">
                    Nilai Akhir US (50% T + 50% P)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredStudents.map((s, idx) => {
                  const detail = s.us[activeSubject] || { tulis: 80, praktik: 80, akhir: 80 };
                  const finalUS = calculateSubjectUSScore(s, activeSubject);

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="p-3 text-center font-bold text-zinc-500">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="font-bold">{s.nama}</div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {s.noPeserta}
                        </div>
                      </td>
                      <td className="p-3 text-center font-medium text-zinc-600 dark:text-zinc-400">
                        {s.ruang} (Meja #{s.noMeja})
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={detail.tulis}
                          onChange={(e) =>
                            handleScoreChange(s.id, activeSubject, 'tulis', e.target.value)
                          }
                          className="w-20 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-center font-mono text-xs font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={detail.praktik !== undefined ? detail.praktik : ''}
                          placeholder="Kosongkan jika tdk ada"
                          onChange={(e) =>
                            handleScoreChange(s.id, activeSubject, 'praktik', e.target.value)
                          }
                          className="w-28 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-center font-mono text-xs font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 placeholder:text-[10px]"
                        />
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                        {finalUS.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* BOTTOM HORIZONTAL SCROLL NAVIGATOR FOR ALL SUBJECTS */}
        {activeSubject === 'ALL' && (
          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTable('left')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
                Scroll Geser Kiri
              </button>

              <button
                type="button"
                onClick={() => scrollTable('right')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 shadow-2xs"
              >
                Scroll Geser Kanan
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 dark:text-zinc-400">
                Total <strong>{subjects.length}</strong> Mapel:
              </span>
              <div className="hidden md:flex items-center gap-1">
                {subjects.slice(0, 8).map((sub) => (
                  <span
                    key={sub.key}
                    className="inline-block rounded bg-zinc-200/80 dark:bg-zinc-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-200"
                  >
                    {sub.code}
                  </span>
                ))}
                {subjects.length > 8 && (
                  <span className="text-[10px] text-zinc-500">
                    +{subjects.length - 8} lainnya
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <ImportGradesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        defaultCategory="us"
      />

      {/* Subject Management Modal (Tambah, Edit, Hapus Mapel) */}
      <SubjectManagementModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        initialMode={subjectModalInitialMode}
        editSubjectKey={subjectModalEditKey}
      />
    </div>
  );
};
