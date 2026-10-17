import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Student, Supervisor } from '../../types';
import { Badge } from '../common/Badge';
import { KopSurat } from '../common/KopSurat';
import { PrintPreviewModal } from '../common/PrintPreviewModal';
import { getPresetLogoDataUrl } from '../../utils/kopSuratLogos';
import {
  getGradePredicate,
  calculateStudentTotalFinalScore,
  calculateStudentOverallFinalScore,
} from '../../constants/subjects';
import {
  Layers,
  Printer,
  Grid3X3,
  Users,
  ShieldCheck,
  FileCheck2,
  Calendar,
  Phone,
  Clock,
  CheckCircle2,
  UserCheck,
  MapPin,
  Camera,
  FileSpreadsheet,
  Edit3,
  Check,
  Download,
  Award,
  Sparkles,
  RotateCcw,
  Tag,
  X,
  Mail,
  FileText,
  FileSignature,
  Scale,
  Type,
} from 'lucide-react';
import { GraduationDocsView, INITIAL_GURU_RAPAT, GraduationDocType } from './GraduationDocsView';
import { EditGraduationDocModal } from './EditGraduationDocModal';
import { EditPengawasModal } from './EditPengawasModal';
import { EditPanitiaModal } from './EditPanitiaModal';
import { EditBeritaAcaraPelaksanaanModal } from './EditBeritaAcaraPelaksanaanModal';
import {
  BeritaAcaraPelaksanaanState,
  TpuLeaderState,
  PanitiaMetaState,
  loadBeritaAcaraPelaksanaanState,
  saveBeritaAcaraPelaksanaanState,
  loadTpuLeaderState,
  saveTpuLeaderState,
  loadPanitiaMetaState,
  savePanitiaMetaState,
} from './examAdminState';
import {
  loadGuruRapatList,
  loadSKKelulusanState,
  saveSKKelulusanState,
  loadUndanganDocState,
  loadBeritaAcaraDocState,
  loadHadirRapatMeta,
  getFontCssFamily,
  formatSignatureDots,
  FONT_OPTIONS,
  DocFontFamily,
} from './graduationDocsState';

export const ExamToolsView: React.FC = () => {
  const {
    students,
    schoolProfile,
    supervisors,
    committee,
    subjects,
    updateStudentUSScore,
    showToast,
    setActiveTab,
    setSupervisorsList,
    resetSupervisorsToDefault,
    updateCommitteeMember,
    addCommitteeMember,
    deleteCommitteeMember,
    setCommitteeList,
    resetCommitteeToDefault,
  } = useApp();

  type ToolTab =
    | 'denah'
    | 'label-meja'
    | 'kartu'
    | 'hadir'
    | 'nilai'
    | 'pengawas'
    | 'panitia'
    | 'berita'
    | 'perangkat-kelulusan'
    | 'undangan'
    | 'ba-kelulusan'
    | 'hadir-rapat'
    | 'sk-kelulusan'
    | 'semua';
  const [activeSubTab, setActiveSubTab] = useState<ToolTab>('denah');
  const [activeGraduationDoc, setActiveGraduationDoc] = useState<GraduationDocType>('undangan');
  const [selectedRoom, setSelectedRoom] = useState<'RUANG 1' | 'RUANG 2' | 'RUANG 3' | 'RUANG 4'>('RUANG 1');
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [printDoc, setPrintDoc] = useState<ToolTab>('nilai');
  const [isEditGradModalOpen, setIsEditGradModalOpen] = useState(false);
  const [gradModalDocType, setGradModalDocType] = useState<GraduationDocType>('undangan');
  const [, setLastUpdateTrigger] = useState<number>(Date.now());

  // Edit Modals State for Pengawas, Panitia, and Berita Acara
  const [isEditPengawasOpen, setIsEditPengawasOpen] = useState(false);
  const [isEditPanitiaOpen, setIsEditPanitiaOpen] = useState(false);
  const [isEditBeritaPelaksanaanOpen, setIsEditBeritaPelaksanaanOpen] = useState(false);

  const [tpuLeader, setTpuLeader] = useState<TpuLeaderState>(loadTpuLeaderState);
  const [panitiaMeta, setPanitiaMeta] = useState<PanitiaMetaState>(loadPanitiaMetaState);
  const [beritaAcaraState, setBeritaAcaraState] = useState<BeritaAcaraPelaksanaanState>(loadBeritaAcaraPelaksanaanState);

  const handleSaveTpuLeader = (newLeader: TpuLeaderState) => {
    setTpuLeader(newLeader);
    saveTpuLeaderState(newLeader);
  };

  const handleSavePanitiaMeta = (newMeta: PanitiaMetaState) => {
    setPanitiaMeta(newMeta);
    savePanitiaMetaState(newMeta);
  };

  const handleSaveBeritaAcaraState = (newState: BeritaAcaraPelaksanaanState) => {
    setBeritaAcaraState(newState);
    saveBeritaAcaraPelaksanaanState(newState);
  };

  // State untuk Daftar Nilai Per Ruangan
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>(subjects[0]?.key || 'bin');
  const [namaPengoreksi1, setNamaPengoreksi1] = useState<string>('BUDI SANTOSO, S.Pd.SD');
  const [nipPengoreksi1, setNipPengoreksi1] = useState<string>('19851210 200903 1 005');
  const [namaPengoreksi2, setNamaPengoreksi2] = useState<string>('HERIYANTO, S.Pd.SD');
  const [nipPengoreksi2, setNipPengoreksi2] = useState<string>('19800918 200701 1 014');
  const [hariTanggal, setHariTanggal] = useState<string>('Senin, 18 Mei 2026');
  const [isEditingScores, setIsEditingScores] = useState<boolean>(false);

  const openPrintPreview = (tab?: ToolTab) => {
    if (tab) {
      if (tab === 'perangkat-kelulusan') {
        setPrintDoc(activeGraduationDoc || 'undangan');
      } else {
        setPrintDoc(tab);
      }
    } else {
      if (activeSubTab === 'perangkat-kelulusan') {
        setPrintDoc(activeGraduationDoc || 'undangan');
      } else {
        setPrintDoc(activeSubTab);
      }
    }
    setIsPrintMenuOpen(true);
  };

  const roomStudents = students.filter((s) => s.ruang === selectedRoom).sort((a, b) => a.noMeja - b.noMeja);
  const roomSupervisors = supervisors.filter((sup) => sup.ruangTugas === selectedRoom);

  const currentSubject = subjects.find((s) => s.key === selectedSubjectKey) || subjects[0] || {
    key: 'bin',
    name: 'Bahasa Indonesia',
    code: 'BIN',
    kkm: 72,
  };

  const handlePrint = (title: string) => {
    window.print();
  };

  // Helper untuk mengubah Nilai Asli atau Nilai Jadi siswa
  const handleScoreChange = (studentId: string, field: 'tulis' | 'akhir', value: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    updateStudentUSScore(studentId, selectedSubjectKey, {
      [field]: clamped,
    });
  };

  // Salin Nilai Asli ke Nilai Jadi untuk semua siswa di ruangan ini
  const handleCopyRawToFinal = () => {
    roomStudents.forEach((s) => {
      const currentRaw = s.us[selectedSubjectKey]?.tulis || 0;
      updateStudentUSScore(s.id, selectedSubjectKey, {
        akhir: currentRaw,
      });
    });
    showToast('Nilai Disinkronkan', `Seluruh Nilai Asli berhasil disalin ke Nilai Jadi untuk ${selectedRoom}.`, 'success');
  };

  // Ekspor Excel untuk Daftar Nilai Ruangan
  const handleExportExcel = () => {
    const data: any[][] = [
      [schoolProfile.kopSurat?.instansiAtas || 'PEMERINTAH KABUPATEN KUANTAN SINGINGI'],
      [schoolProfile.kopSurat?.instansiTengah || 'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA'],
      [schoolProfile.namaSekolah],
      ['DAFTAR NILAI HASIL KOREKSI UJIAN SEKOLAH / UJIAN NASIONAL'],
      [`TAHUN PELAJARAN ${schoolProfile.tahunPelajaran}`],
      [],
      ['Mata Pelajaran:', currentSubject.name, '', 'Nama Pengoreksi I:', namaPengoreksi1],
      ['Ruang Ujian:', selectedRoom, '', 'NIP Pengoreksi I:', nipPengoreksi1],
      ['Hari / Tanggal:', hariTanggal, '', 'Nama Pengoreksi II:', namaPengoreksi2],
      ['Batas KKM:', currentSubject.kkm, '', 'NIP Pengoreksi II:', nipPengoreksi2],
      [],
      ['No', 'No. Peserta', 'NISN', 'NIS', 'Nama Siswa', 'L/P', 'Nilai Asli', 'Nilai Jadi', 'Predikat', 'Status Kelulusan', 'Paraf Pengoreksi'],
      ...roomStudents.map((s, idx) => {
        const usDetail = s.us[selectedSubjectKey] || { tulis: 0, akhir: 0 };
        const pred = getGradePredicate(usDetail.akhir);
        const isPassed = usDetail.akhir >= currentSubject.kkm;
        return [
          idx + 1,
          s.noPeserta,
          s.nisn,
          s.nis,
          s.nama,
          s.jenisKelamin,
          usDetail.tulis,
          usDetail.akhir,
          pred.grade,
          isPassed ? 'TUNTAS' : 'BELUM TUNTAS',
          '',
        ];
      }),
      [],
      ['Rata-Rata Nilai Asli:', avgTulis],
      ['Rata-Rata Nilai Jadi:', avgAkhir],
      ['Nilai Tertinggi (Maks):', maxAkhir],
      ['Nilai Terendah (Min):', minAkhir],
      ['Jumlah Siswa Tuntas:', `${passedCount} dari ${roomStudents.length} siswa (${passedPercentage}%)`],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Nilai_${selectedRoom.replace(' ', '_')}`);
    XLSX.writeFile(
      wb,
      `Daftar_Nilai_${selectedRoom.replace(' ', '_')}_${currentSubject.code}_TP_${schoolProfile.tahunPelajaran.replace('/', '-')}.xlsx`
    );
    showToast('Ekspor Berhasil', `File Excel Daftar Nilai ${selectedRoom} mapel ${currentSubject.name} berhasil diunduh.`, 'success');
  };

  // Statistik nilai ruangan
  const rawScores = roomStudents.map((s) => s.us[selectedSubjectKey]?.tulis || 0);
  const finalScores = roomStudents.map((s) => s.us[selectedSubjectKey]?.akhir || 0);

  const avgTulis = rawScores.length > 0 ? Number((rawScores.reduce((a, b) => a + b, 0) / rawScores.length).toFixed(2)) : 0;
  const avgAkhir = finalScores.length > 0 ? Number((finalScores.reduce((a, b) => a + b, 0) / finalScores.length).toFixed(2)) : 0;
  const maxAkhir = finalScores.length > 0 ? Math.max(...finalScores) : 0;
  const minAkhir = finalScores.length > 0 ? Math.min(...finalScores) : 0;
  const passedCount = finalScores.filter((sc) => sc >= currentSubject.kkm).length;
  const passedPercentage = roomStudents.length > 0 ? Math.round((passedCount / roomStudents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Perangkat Ujian, Denah Ruang & Panitia Pengawas
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Kelengkapan teknis operasional ujian nasional/sekolah SDN 006 Sungai Buluh (TPU VI Singingi Hilir)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('student-photos')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 transition-colors"
          >
            <Camera className="h-4 w-4" />
            Kelola Foto Siswa
          </button>
          <button
            onClick={() => openPrintPreview()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-colors"
            title="Buka menu cetak seluruh dokumen perangkat & ruang ujian"
          >
            <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Menu Cetak Perangkat & Ruang
          </button>
          <button
            onClick={() => openPrintPreview(activeSubTab === 'perangkat-kelulusan' ? activeGraduationDoc : activeSubTab)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Cetak Dokumen Terpilih ({
              activeSubTab === 'perangkat-kelulusan'
                ? (activeGraduationDoc === 'undangan'
                    ? 'UNDANGAN'
                    : activeGraduationDoc === 'ba-kelulusan'
                    ? 'BERITA ACARA'
                    : activeGraduationDoc === 'hadir-rapat'
                    ? 'DAFTAR HADIR'
                    : 'SK KELULUSAN')
                : activeSubTab.toUpperCase()
            })
          </button>
        </div>
      </div>

      {/* Navigasi Menu Cetak & Edit Dokumen Ujian (5 Dokumen Utama) */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4.5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs print:hidden space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-800 dark:text-zinc-200">
              Navigasi Menu Cetak & Edit Dokumen Ujian
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              5 Dokumen Pokok
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mr-1">
              Menu Edit Cepat:
            </span>
            <button
              type="button"
              onClick={() => setIsEditPengawasOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Buka menu edit Pengawas TPU VI"
            >
              <Edit3 className="h-3 w-3 text-amber-700 dark:text-amber-300" />
              Pengawas TPU VI
            </button>
            <button
              type="button"
              onClick={() => setIsEditPanitiaOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Buka menu edit Susunan Panitia"
            >
              <Edit3 className="h-3 w-3 text-amber-700 dark:text-amber-300" />
              Susunan Panitia
            </button>
            <button
              type="button"
              onClick={() => setIsEditBeritaPelaksanaanOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Buka menu edit Berita Acara Pelaksanaan"
            >
              <Edit3 className="h-3 w-3 text-amber-700 dark:text-amber-300" />
              Berita Acara
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            {
              key: 'denah' as ToolTab,
              title: 'Denah Ruang Ujian',
              subtitle: 'Ruang 1 s.d. 4 (Tempat Duduk)',
              icon: Grid3X3,
              format: 'A4 Landscape',
              canEdit: false,
            },
            {
              key: 'hadir' as ToolTab,
              title: 'Daftar Hadir Ujian',
              subtitle: 'Presensi Siswa Ganjil/Genap',
              icon: FileCheck2,
              format: 'A4 Portrait',
              canEdit: false,
            },
            {
              key: 'pengawas' as ToolTab,
              title: 'Pengawas TPU VI',
              subtitle: 'Pengawasan Silang Antar-SD',
              icon: ShieldCheck,
              format: 'A4 Portrait',
              canEdit: true,
              editAction: () => setIsEditPengawasOpen(true),
              editTitle: 'Edit Pengawas TPU VI',
            },
            {
              key: 'panitia' as ToolTab,
              title: 'Susunan Panitia',
              subtitle: 'SK Panitia Pelaksana US',
              icon: UserCheck,
              format: 'A4 Portrait',
              canEdit: true,
              editAction: () => setIsEditPanitiaOpen(true),
              editTitle: 'Edit Susunan Panitia',
            },
            {
              key: 'berita' as ToolTab,
              title: 'Berita Acara',
              subtitle: 'Pelaksanaan Ujian Resmi',
              icon: FileCheck2,
              format: 'A4 Portrait',
              canEdit: true,
              editAction: () => setIsEditBeritaPelaksanaanOpen(true),
              editTitle: 'Edit Berita Acara Pelaksanaan',
            },
          ].map((item) => {
            const Icon = item.icon;
            const isTabActive = activeSubTab === item.key;
            return (
              <div
                key={item.key}
                onClick={() => setActiveSubTab(item.key)}
                className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isTabActive
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500/30 dark:bg-emerald-950/30 dark:border-emerald-500'
                    : 'border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                        isTabActive
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-zinc-200/80 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-200/80 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                      {item.format}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {item.canEdit ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          item.editAction?.();
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                        title={item.editTitle}
                      >
                        <Edit3 className="h-3 w-3 text-amber-700 dark:text-amber-300" />
                        Edit
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-400">
                        {isTabActive ? '● Aktif' : 'Pilih'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSubTab(item.key);
                      openPrintPreview(item.key);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer"
                    title={`Buka Menu Cetak ${item.title}`}
                  >
                    <Printer className="h-3 w-3" />
                    Cetak
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 print:hidden">
        {(
          [
            { key: 'denah', label: 'Denah Ruang Ujian', icon: Grid3X3 },
            { key: 'label-meja', label: 'Label Meja Peserta', icon: Tag },
            { key: 'kartu', label: 'Kartu Peserta UN', icon: Users },
            { key: 'hadir', label: 'Daftar Hadir Ujian', icon: FileCheck2 },
            { key: 'nilai', label: 'Daftar Nilai (Per Ruangan)', icon: FileSpreadsheet },
            { key: 'pengawas', label: 'Pengawas TPU VI', icon: ShieldCheck, hasEdit: true },
            { key: 'panitia', label: 'Susunan Panitia', icon: UserCheck, hasEdit: true },
            { key: 'berita', label: 'Berita Acara Pelaksanaan', icon: FileCheck2, hasEdit: true },
            // Perangkat Kelulusan (Tersusun 1 tab saja: Undangan Rapat diganti Perangkat Kelulusan)
            {
              key: 'perangkat-kelulusan',
              label: 'Perangkat Kelulusan',
              altLabel: 'Perangkat Kelululusan',
              icon: Mail,
            },
          ] as { key: ToolTab; label: string; altLabel?: string; icon: React.ElementType; badge?: string; hasEdit?: boolean }[]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <div
              key={tab.key}
              className={`inline-flex items-center rounded-xl transition-all shrink-0 border ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-500 border-emerald-600'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border-transparent'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveSubTab(tab.key)}
                className="flex items-center gap-2 pl-3 py-2 pr-1.5 text-xs font-bold transition-all"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.altLabel && <span className="sr-only">{tab.altLabel}</span>}
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>

              {/* Menu Edit pada Tab Navigasi untuk Pengawas, Panitia, dan Berita Acara */}
              {tab.key === 'pengawas' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditPengawasOpen(true);
                  }}
                  className={`p-1 rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300'
                      : 'text-amber-600 hover:text-amber-700 hover:bg-white dark:hover:bg-zinc-700'
                  }`}
                  title="Menu Edit Pengawas TPU VI"
                  aria-label="Menu Edit Pengawas TPU VI"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}
              {tab.key === 'panitia' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditPanitiaOpen(true);
                  }}
                  className={`p-1 rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300'
                      : 'text-amber-600 hover:text-amber-700 hover:bg-white dark:hover:bg-zinc-700'
                  }`}
                  title="Menu Edit Susunan Panitia"
                  aria-label="Menu Edit Susunan Panitia"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}
              {tab.key === 'berita' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditBeritaPelaksanaanOpen(true);
                  }}
                  className={`p-1 rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300'
                      : 'text-amber-600 hover:text-amber-700 hover:bg-white dark:hover:bg-zinc-700'
                  }`}
                  title="Menu Edit Berita Acara Pelaksanaan"
                  aria-label="Menu Edit Berita Acara Pelaksanaan"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Menu Cetak pada Tab Navigasi */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSubTab(tab.key);
                  openPrintPreview(tab.key === 'perangkat-kelulusan' ? activeGraduationDoc : tab.key);
                }}
                className={`mr-1.5 p-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-emerald-700 hover:bg-white dark:hover:bg-zinc-700 dark:hover:text-emerald-300'
                }`}
                title={`Cetak ${tab.label}`}
                aria-label={`Menu Cetak ${tab.label}`}
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Room Selector if viewing Denah, Label Meja, Kartu, Hadir, Nilai, or Berita */}
      {['denah', 'label-meja', 'kartu', 'hadir', 'nilai', 'berita'].includes(activeSubTab) && (
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Pilih Ruangan:</span>
            {(['RUANG 1', 'RUANG 2', 'RUANG 3', 'RUANG 4'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRoom(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedRoom === r
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-500 font-medium">
            {roomStudents.length} Peserta Terdaftar di {selectedRoom}
          </div>
        </div>
      )}

      {/* 1. DENAH RUANG INTERAKTIF */}
      {activeSubTab === 'denah' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          {/* Action Toolbar Menu Cetak */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                <Grid3X3 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                  Denah Ruang Ujian ({selectedRoom})
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  {roomStudents.length} peserta terdaftar di {selectedRoom} • Siap cetak lembar format A4 landscape
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openPrintPreview('denah')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer w-full sm:w-auto"
                title={`Cetak Denah ${selectedRoom} Format A4 Landscape`}
              >
                <Printer className="h-4 w-4" />
                Cetak Denah Ruang ({selectedRoom})
              </button>
              <button
                type="button"
                onClick={() => openPrintPreview()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer w-full sm:w-auto"
                title="Buka menu cetak seluruh dokumen ujian"
              >
                <Printer className="h-3.5 w-3.5 text-emerald-600" />
                Menu Cetak Lengkap
              </button>
            </div>
          </div>

          <KopSurat schoolProfile={schoolProfile} variant="compact" />
          <div className="text-center border-b pb-4 border-zinc-200 dark:border-zinc-800">
            <h3 className="text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-50">
              DENAH PENATAAN TEMPAT DUDUK PESERTA UJIAN NASIONAL
            </h3>
            <p className="text-xs text-zinc-500 font-semibold mt-1">
              {selectedRoom} • {schoolProfile.namaSekolah} • TP {schoolProfile.tahunPelajaran}
            </p>
          </div>

          {/* Front / Board Teacher Table */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md rounded-xl bg-emerald-950 p-3 text-center text-white shadow-md border border-emerald-700">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                PAPAN TULIS & MEJA PENGAWAS UJIAN
              </span>
              <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-emerald-200">
                {roomSupervisors.map((sup, idx) => (
                  <span key={sup.id}>
                    Pengawas {idx + 1}: <b>{sup.nama}</b>
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold mt-1.5 uppercase">
              ▲ BAGIAN DEPAN RUANGAN ▲
            </span>
          </div>

          {/* Grid of Student Desks (4 rows x 2 cols or 2 rows x 4 cols) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            {roomStudents.map((s) => (
              <div
                key={s.id}
                className="flex flex-col justify-between rounded-xl border-2 border-emerald-600/60 bg-emerald-50/40 p-3 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/20 text-center hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-1.5 mb-2">
                  <span className="text-[10px] font-bold text-zinc-500">MEJA #{s.noMeja}</span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      s.jenisKelamin === 'L'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                    }`}
                  >
                    {s.jenisKelamin}
                  </span>
                </div>

                <div className="my-2 flex flex-col items-center">
                  <div className="h-12 w-9 rounded-lg overflow-hidden border border-emerald-700/60 shadow-2xs mb-1.5 bg-white dark:bg-zinc-800 flex items-center justify-center">
                    {s.foto ? (
                      <img src={s.foto} alt={s.nama} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">{s.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                    )}
                  </div>
                  <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 uppercase truncate max-w-[140px]" title={s.nama}>
                    {s.nama}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
                    {s.noPeserta}
                  </div>
                  <div className="text-[9px] text-zinc-400">NISN: {s.nisn}</div>
                </div>

                <div className="border-t border-emerald-200 dark:border-emerald-800 pt-1 text-[9px] text-zinc-500 font-medium">
                  SDN 006 Sungai Buluh
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center text-[10px] text-zinc-400 font-bold uppercase pt-2">
            ▼ PINTU MASUK / KELUAR RUANGAN ▼
          </div>
        </div>
      )}

      {/* 1.5 LABEL MEJA PESERTA UJIAN (SIAP TEMPEL) */}
      {activeSubTab === 'label-meja' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 print:hidden">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase">
                Label Nomor Meja Peserta Ujian ({selectedRoom})
              </h3>
              <p className="text-xs text-zinc-500">
                Format stiker/kartu meja peserta siap cetak dan tempel di atas meja ujian
              </p>
            </div>
            <button
              onClick={() => handlePrint(`Label Meja ${selectedRoom}`)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak Semua Label Meja {selectedRoom}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-2 print:gap-6">
            {roomStudents.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border-2 border-dashed border-emerald-800 bg-white p-3.5 shadow-xs dark:bg-zinc-900 dark:border-emerald-600 flex flex-col justify-between text-center relative overflow-hidden"
              >
                {/* Header Kop Mini */}
                <div className="border-b border-zinc-300 dark:border-zinc-700 pb-1.5 mb-2">
                  <div className="text-[8.5px] font-bold uppercase text-zinc-500">
                    {schoolProfile.namaSekolah} • TP {schoolProfile.tahunPelajaran}
                  </div>
                  <div className="text-[10px] font-black uppercase text-emerald-950 dark:text-emerald-400">
                    LABEL MEJA UJIAN RESMI
                  </div>
                </div>

                {/* Big Desk Number Badge */}
                <div className="my-1 py-1 rounded-lg bg-emerald-900 text-white font-black text-xl tracking-wider">
                  MEJA #{s.noMeja.toString().padStart(2, '0')}
                </div>

                {/* Student Photo & Details */}
                <div className="flex items-center gap-2.5 text-left my-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="h-14 w-11 shrink-0 overflow-hidden rounded border border-zinc-400 bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                    {s.foto ? (
                      <img src={s.foto} alt={s.nama} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">{s.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                    )}
                  </div>
                  <div className="min-w-0 text-[10px] leading-tight space-y-0.5">
                    <p className="font-extrabold uppercase text-zinc-900 dark:text-zinc-50 truncate">{s.nama}</p>
                    <p className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{s.noPeserta}</p>
                    <p className="text-zinc-500">NISN: {s.nisn}</p>
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">{s.ruang}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-zinc-300 dark:border-zinc-700 pt-1 text-[8px] text-zinc-400">
                  *Gunting sesuai garis putus-putus & tempel di meja
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. KARTU PESERTA UJIAN SIAP CETAK */}
      {activeSubTab === 'kartu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs text-zinc-500">
              Format Kartu Ujian Resmi: Standar DNT Dinas Pendidikan Kab. Kuantan Singingi
            </span>
            <button
              onClick={() => handlePrint('Kartu Peserta')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak Kartu {selectedRoom}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
            {roomStudents.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border-2 border-emerald-900/80 bg-white p-4 shadow-sm dark:bg-zinc-900 dark:border-emerald-600 space-y-3"
              >
                {/* Header Kop Kartu */}
                <div className="flex items-center gap-2 border-b-2 border-emerald-900 pb-2 dark:border-emerald-500">
                  {/* Logo Kiri Kartu */}
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center">
                    <img
                      src={
                        schoolProfile.kopSurat?.logoKiri ||
                        getPresetLogoDataUrl('pemda_kuansing')
                      }
                      alt="Logo Daerah"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center px-1">
                    <div className="text-[9px] font-bold tracking-wider text-zinc-700 dark:text-zinc-300 uppercase leading-tight">
                      {schoolProfile.kopSurat?.instansiAtas || 'PEMERINTAH KABUPATEN KUANTAN SINGINGI'}
                    </div>
                    <div className="text-[11px] font-black text-emerald-950 dark:text-emerald-400 uppercase leading-tight">
                      KARTU PESERTA UJIAN NASIONAL / US
                    </div>
                    <div className="text-[8.5px] font-semibold text-zinc-600 dark:text-zinc-400 leading-tight">
                      {schoolProfile.namaSekolah} • TP {schoolProfile.tahunPelajaran}
                    </div>
                  </div>
                  {/* Logo Kanan Kartu */}
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center">
                    <img
                      src={
                        schoolProfile.kopSurat?.logoKanan ||
                        getPresetLogoDataUrl('tutwuri')
                      }
                      alt="Logo Tut Wuri"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                </div>

                {/* Body Kartu */}
                <div className="flex gap-3 text-xs">
                  {/* Photo Frame */}
                  <div className="relative flex flex-col items-center justify-center h-28 w-22 rounded-lg border-2 border-zinc-700 bg-zinc-100 p-0.5 text-center shrink-0 overflow-hidden shadow-xs dark:bg-zinc-800 dark:border-zinc-700">
                    {s.foto ? (
                      <>
                        <img
                          src={s.foto}
                          alt={s.nama}
                          className="h-full w-full object-cover rounded"
                        />
                        <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[7px] font-bold text-amber-300">
                          2x3 RESMI
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">{s.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                        <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">
                          PAS FOTO 2x3
                        </span>
                        <span className="text-[7px] text-zinc-400">RESMI</span>
                      </>
                    )}
                  </div>

                  {/* Biodata */}
                  <div className="flex-1 space-y-1 text-[11px]">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-zinc-500">No. Peserta:</span>
                      <span className="col-span-2 font-mono font-extrabold text-zinc-900 dark:text-zinc-100">
                        {s.noPeserta}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-zinc-500">Nama:</span>
                      <span className="col-span-2 font-bold uppercase text-zinc-900 dark:text-zinc-100">
                        {s.nama}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-zinc-500">NISN / NIS:</span>
                      <span className="col-span-2 font-mono text-zinc-700 dark:text-zinc-300">
                        {s.nisn} / {s.nis}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-zinc-500">TTL:</span>
                      <span className="col-span-2 text-zinc-700 dark:text-zinc-300">
                        {s.tempatLahir}, {s.tanggalLahir}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-zinc-500">Ruang / Meja:</span>
                      <span className="col-span-2 font-bold text-emerald-800 dark:text-emerald-300">
                        {s.ruang} (Meja #{s.noMeja})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Sign */}
                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2 text-[9px]">
                  <div className="text-zinc-400">
                    *Wajib dibawa saat ujian berlangsung
                  </div>
                  <div className="text-right">
                    <div className="text-zinc-500">Kepala Sekolah,</div>
                    <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-4 underline">
                      {schoolProfile.kepalaSekolah}
                    </div>
                    <div className="pt-0.5 text-zinc-500 font-normal">NIP. {schoolProfile.nipKepalaSekolah}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DAFTAR HADIR PESERTA UJIAN */}
      {activeSubTab === 'hadir' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          {/* Action Toolbar Menu Cetak */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                  Daftar Hadir Peserta Ujian ({selectedRoom})
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  {roomStudents.length} peserta terdaftar di {selectedRoom} • Format presensi resmi kolom tanda tangan ganjil/genap
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openPrintPreview('hadir')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer w-full sm:w-auto"
                title={`Cetak Daftar Hadir ${selectedRoom} Format A4 Portrait`}
              >
                <Printer className="h-4 w-4" />
                Cetak Daftar Hadir ({selectedRoom})
              </button>
              <button
                type="button"
                onClick={() => openPrintPreview()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer w-full sm:w-auto"
                title="Buka menu cetak seluruh dokumen ujian"
              >
                <Printer className="h-3.5 w-3.5 text-emerald-600" />
                Menu Cetak Lengkap
              </button>
            </div>
          </div>

          <KopSurat schoolProfile={schoolProfile} variant="compact" />

          <div className="text-center pb-2">
            <h3 className="text-sm font-extrabold uppercase text-zinc-900 dark:text-zinc-50">
              DAFTAR HADIR PESERTA UJIAN NASIONAL / SEKOLAH
            </h3>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5">
              {schoolProfile.namaSekolah} • {selectedRoom} • KECAMATAN SINGINGI HILIR • TP {schoolProfile.tahunPelajaran}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-300 dark:border-zinc-700">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-300 dark:border-zinc-700">
                <tr>
                  <th className="p-2.5 w-10 text-center border-r border-zinc-300 dark:border-zinc-700">No</th>
                  <th className="p-2.5 min-w-[120px] border-r border-zinc-300 dark:border-zinc-700">No. Peserta</th>
                  <th className="p-2.5 min-w-[180px] border-r border-zinc-300 dark:border-zinc-700">Nama Peserta</th>
                  <th className="p-2.5 text-center w-16 border-r border-zinc-300 dark:border-zinc-700">L/P</th>
                  <th className="p-2.5 text-center w-28 border-r border-zinc-300 dark:border-zinc-700">Tanda Tangan (Ganjil)</th>
                  <th className="p-2.5 text-center w-28 border-r border-zinc-300 dark:border-zinc-700">Tanda Tangan (Genap)</th>
                  <th className="p-2.5 text-center w-20">Ket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {roomStudents.map((s, idx) => (
                  <tr key={s.id} className="h-12">
                    <td className="p-2 text-center font-bold border-r border-zinc-200 dark:border-zinc-800">
                      {idx + 1}
                    </td>
                    <td className="p-2 font-mono font-semibold border-r border-zinc-200 dark:border-zinc-800">
                      {s.noPeserta}
                    </td>
                    <td className="p-2 font-bold uppercase border-r border-zinc-200 dark:border-zinc-800">
                      {s.nama}
                    </td>
                    <td className="p-2 text-center border-r border-zinc-200 dark:border-zinc-800">
                      {s.jenisKelamin}
                    </td>
                    <td className="p-2 border-r border-zinc-200 dark:border-zinc-800">
                      {idx % 2 === 0 ? <span className="text-[10px] text-zinc-400">{idx + 1}. .........</span> : ''}
                    </td>
                    <td className="p-2 border-r border-zinc-200 dark:border-zinc-800">
                      {idx % 2 !== 0 ? <span className="text-[10px] text-zinc-400">{idx + 1}. .........</span> : ''}
                    </td>
                    <td className="p-2 text-center text-[10px] text-emerald-700 font-bold">
                      Hadir
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pengawas Signature Section */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-xs">
            <div>
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">Pengawas 1,</p>
              <div className="h-14"></div>
              <p className="font-bold underline text-zinc-900 dark:text-zinc-100">
                {roomSupervisors[0]?.nama || '.....................................'}
              </p>
              <p className="font-mono text-zinc-500">NIP. {roomSupervisors[0]?.nip || '.......................'}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">Pengawas 2,</p>
              <div className="h-14"></div>
              <p className="font-bold underline text-zinc-900 dark:text-zinc-100">
                {roomSupervisors[1]?.nama || '.....................................'}
              </p>
              <p className="font-mono text-zinc-500">NIP. {roomSupervisors[1]?.nip || '.......................'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. DAFTAR NILAI UJIAN PER RUANGAN (HASIL KOREKSI) */}
      {activeSubTab === 'nilai' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar (Print Hidden) */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                    Format Isian Daftar Nilai Per Ruangan ({selectedRoom})
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Rekapitulasi hasil koreksi lembar ujian (Nilai Asli & Nilai Jadi) siap cetak dan tandatangan
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingScores(!isEditingScores)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    isEditingScores
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  {isEditingScores ? 'Selesai Edit Nilai' : 'Edit Nilai Langsung'}
                </button>

                <button
                  type="button"
                  onClick={handleCopyRawToFinal}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                  title="Salin semua Nilai Asli ke Nilai Jadi di ruangan ini"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Salin Nilai Asli &rarr; Jadi
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Ekspor Excel (.xlsx)
                </button>

                <button
                  type="button"
                  onClick={() => openPrintPreview('nilai')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Pratinjau & Cetak Lembar Nilai Ruangan
                </button>
              </div>
            </div>

            {/* Input Form Metadata: Mata Pelajaran, Hari/Tanggal, Pengoreksi I & II */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mata Pelajaran:
                </label>
                <select
                  value={selectedSubjectKey}
                  onChange={(e) => setSelectedSubjectKey(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 font-bold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {subjects.map((sub) => (
                    <option key={sub.key} value={sub.key}>
                      {sub.name} (KKM: {sub.kkm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Hari / Tanggal Ujian:
                </label>
                <input
                  type="text"
                  value={hariTanggal}
                  onChange={(e) => setHariTanggal(e.target.value)}
                  placeholder="Senin, 18 Mei 2026"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 font-medium text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Pengoreksi I:
                </label>
                <input
                  type="text"
                  value={namaPengoreksi1}
                  onChange={(e) => setNamaPengoreksi1(e.target.value)}
                  placeholder="Nama Pengoreksi I"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <input
                  type="text"
                  value={nipPengoreksi1}
                  onChange={(e) => setNipPengoreksi1(e.target.value)}
                  placeholder="NIP Pengoreksi I"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1 font-mono text-[11px] text-zinc-600 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Pengoreksi II (Pendamping):
                </label>
                <input
                  type="text"
                  value={namaPengoreksi2}
                  onChange={(e) => setNamaPengoreksi2(e.target.value)}
                  placeholder="Nama Pengoreksi II"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <input
                  type="text"
                  value={nipPengoreksi2}
                  onChange={(e) => setNipPengoreksi2(e.target.value)}
                  placeholder="NIP Pengoreksi II"
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-1 font-mono text-[11px] text-zinc-600 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                />
              </div>
            </div>
          </div>

          {/* OFFICIAL PRINTABLE PAPER SHEET */}
          <div className="mx-auto max-w-5xl rounded-2xl border-2 border-zinc-300 bg-white p-6 sm:p-10 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 space-y-6 text-xs text-zinc-900 dark:text-zinc-100 print:border-none print:shadow-none print:p-0 print:m-0">
            {/* Kop Surat Resmi */}
            <KopSurat schoolProfile={schoolProfile} variant="compact" />

            {/* Judul Dokumen */}
            <div className="text-center space-y-1 pt-1">
              <h3 className="text-base font-extrabold uppercase tracking-wide text-zinc-950 dark:text-zinc-50 underline">
                DAFTAR NILAI HASIL KOREKSI UJIAN SEKOLAH / UJIAN NASIONAL
              </h3>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
              </p>
            </div>

            {/* Identitas Lembar Ujian (Meta Info Box) */}
            <div className="rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 p-4 border border-zinc-200 dark:border-zinc-700 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <div className="space-y-1.5">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">Mata Pelajaran</span>
                    <span className="col-span-2 font-extrabold uppercase text-zinc-950 dark:text-zinc-50">
                      : {currentSubject.name} ({currentSubject.code})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">Hari / Tanggal</span>
                    <span className="col-span-2 font-medium">
                      : {hariTanggal}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">Ruang Ujian</span>
                    <span className="col-span-2 font-extrabold text-emerald-800 dark:text-emerald-400">
                      : {selectedRoom}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">Nama Pengoreksi I</span>
                    <span className="col-span-2 font-bold uppercase">
                      : {namaPengoreksi1}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">Nama Pengoreksi II</span>
                    <span className="col-span-2 font-bold uppercase">
                      : {namaPengoreksi2}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">Standar KKM</span>
                    <span className="col-span-2 font-mono font-bold text-amber-700 dark:text-amber-400">
                      : {currentSubject.kkm} (Minimal Tuntas)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABEL DAFTAR SISWA & NILAI PER RUANGAN */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-zinc-300 dark:border-zinc-700 border-collapse">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border-b border-zinc-300 dark:border-zinc-700">
                  <tr>
                    <th className="p-2 w-10 text-center border-r border-zinc-300 dark:border-zinc-700">No</th>
                    <th className="p-2 min-w-[125px] border-r border-zinc-300 dark:border-zinc-700">No. Peserta</th>
                    <th className="p-2 min-w-[100px] border-r border-zinc-300 dark:border-zinc-700">NISN / NIS</th>
                    <th className="p-2 min-w-[180px] border-r border-zinc-300 dark:border-zinc-700">Nama Peserta Didik</th>
                    <th className="p-2 text-center w-12 border-r border-zinc-300 dark:border-zinc-700">L/P</th>
                    <th className="p-2 text-center min-w-[105px] border-r border-zinc-300 dark:border-zinc-700 bg-zinc-200/60 dark:bg-zinc-700/60">
                      Nilai Asli
                    </th>
                    <th className="p-2 text-center min-w-[105px] border-r border-zinc-300 dark:border-zinc-700 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200">
                      Nilai Jadi
                    </th>
                    <th className="p-2 text-center w-16 border-r border-zinc-300 dark:border-zinc-700">Pred</th>
                    <th className="p-2 text-center w-24 border-r border-zinc-300 dark:border-zinc-700">Status</th>
                    <th className="p-2 text-center min-w-[100px]">Paraf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {roomStudents.map((s, idx) => {
                    const usDetail = s.us[selectedSubjectKey] || { tulis: 0, akhir: 0 };
                    const rawVal = usDetail.tulis;
                    const finalVal = usDetail.akhir;
                    const pred = getGradePredicate(finalVal);
                    const isPassed = finalVal >= currentSubject.kkm;

                    return (
                      <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 h-10">
                        <td className="p-2 text-center font-bold text-zinc-500 border-r border-zinc-200 dark:border-zinc-800">
                          {idx + 1}
                        </td>
                        <td className="p-2 font-mono font-medium border-r border-zinc-200 dark:border-zinc-800">
                          {s.noPeserta}
                        </td>
                        <td className="p-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800">
                          {s.nisn} / {s.nis}
                        </td>
                        <td className="p-2 font-extrabold uppercase border-r border-zinc-200 dark:border-zinc-800">
                          {s.nama}
                        </td>
                        <td className="p-2 text-center font-medium border-r border-zinc-200 dark:border-zinc-800">
                          {s.jenisKelamin}
                        </td>

                        {/* Nilai Asli (Raw Score) */}
                        <td className="p-1.5 text-center border-r border-zinc-200 dark:border-zinc-800">
                          {isEditingScores ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={rawVal}
                              onChange={(e) => handleScoreChange(s.id, 'tulis', parseFloat(e.target.value))}
                              className="w-20 rounded-lg border border-zinc-300 px-2 py-1 text-center font-mono font-bold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                          ) : (
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {rawVal.toFixed(1)}
                            </span>
                          )}
                        </td>

                        {/* Nilai Jadi (Final Converted Score) */}
                        <td className="p-1.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20 border-r border-zinc-200 dark:border-zinc-800">
                          {isEditingScores ? (
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.1}
                              value={finalVal}
                              onChange={(e) => handleScoreChange(s.id, 'akhir', parseFloat(e.target.value))}
                              className="w-20 rounded-lg border border-emerald-400 bg-emerald-50 px-2 py-1 text-center font-mono font-extrabold text-emerald-900 focus:border-emerald-600 focus:outline-none dark:border-emerald-700 dark:bg-zinc-800 dark:text-emerald-300"
                            />
                          ) : (
                            <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-300 text-sm">
                              {finalVal.toFixed(1)}
                            </span>
                          )}
                        </td>

                        {/* Predikat */}
                        <td className="p-2 text-center border-r border-zinc-200 dark:border-zinc-800">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black border ${pred.color}`}>
                            {pred.grade}
                          </span>
                        </td>

                        {/* Status Kelulusan / Ketuntasan */}
                        <td className="p-2 text-center border-r border-zinc-200 dark:border-zinc-800">
                          {isPassed ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                              TUNTAS
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                              BELUM
                            </span>
                          )}
                        </td>

                        {/* Paraf Pengoreksi */}
                        <td className="p-2 text-center border-zinc-200 dark:border-zinc-800">
                          <span className="text-[10px] text-zinc-300 dark:text-zinc-600">
                            ..........
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* RINGKASAN STATISTIK NILAI RUANGAN */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/40">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Rata-rata Nilai Asli</span>
                <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">{avgTulis}</span>
              </div>
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/30">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">Rata-rata Nilai Jadi</span>
                <span className="text-sm font-mono font-black text-emerald-900 dark:text-emerald-200">{avgAkhir}</span>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/40">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Nilai Tertinggi (Maks)</span>
                <span className="text-sm font-mono font-bold text-blue-700 dark:text-blue-400">{maxAkhir}</span>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800/40">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Nilai Terendah (Min)</span>
                <span className="text-sm font-mono font-bold text-amber-700 dark:text-amber-400">{minAkhir}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-xl border border-emerald-300 bg-emerald-50/60 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/30">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">Ketuntasan Ruangan</span>
                <span className="text-sm font-mono font-extrabold text-emerald-900 dark:text-emerald-200">
                  {passedPercentage}% ({passedCount}/{roomStudents.length})
                </span>
              </div>
            </div>

            {/* TANDA TANGAN PENGOREKSI & KEPALA SEKOLAH (3 KOLOM RESMI) */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-xs text-center border-t border-zinc-200 dark:border-zinc-700">
              <div>
                <p className="font-semibold text-zinc-600 dark:text-zinc-400">Pengoreksi II (Pendamping),</p>
                <div className="h-16"></div>
                <p className="font-bold underline uppercase text-zinc-900 dark:text-zinc-100">
                  {namaPengoreksi2 || '.....................................'}
                </p>
                <p className="font-mono text-[11px] text-zinc-500">
                  NIP. {nipPengoreksi2 || '.....................................'}
                </p>
              </div>

              <div>
                <p className="font-semibold text-zinc-600 dark:text-zinc-400">Mengetahui,</p>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">Kepala {schoolProfile.namaSekolah},</p>
                <div className="h-12"></div>
                <p className="font-bold underline uppercase text-zinc-900 dark:text-zinc-100">
                  {schoolProfile.kepalaSekolah}
                </p>
                <p className="font-mono text-[11px] text-zinc-500">
                  NIP. {schoolProfile.nipKepalaSekolah}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">{schoolProfile.tempatCetak || 'Sungai Buluh'}, {hariTanggal}</p>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">Pengoreksi I (Guru Mapel),</p>
                <div className="h-12"></div>
                <p className="font-bold underline uppercase text-zinc-900 dark:text-zinc-100">
                  {namaPengoreksi1 || '.....................................'}
                </p>
                <p className="font-mono text-[11px] text-zinc-500">
                  NIP. {nipPengoreksi1 || '.....................................'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. DAFTAR NAMA PENGAWAS TPU VI */}
      {activeSubTab === 'pengawas' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Daftar Pengawas Ruang TPU VI Singingi Hilir
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Sistem pengawasan silang antar-sekolah dasar se-Kecamatan Singingi Hilir ({supervisors.length} Pengawas)
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsEditPengawasOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
                title="Buka menu edit pengawas ruang TPU VI dan identitas Ketua TPU"
              >
                <Edit3 className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                Edit Pengawas TPU VI
              </button>
              <button
                type="button"
                onClick={() => openPrintPreview('pengawas')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer w-full sm:w-auto"
                title="Cetak Daftar Pengawas TPU VI Format A4 Portrait"
              >
                <Printer className="h-4 w-4" />
                Cetak Pengawas TPU VI
              </button>
              <button
                type="button"
                onClick={() => openPrintPreview()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer w-full sm:w-auto"
                title="Buka menu cetak seluruh dokumen ujian"
              >
                <Printer className="h-3.5 w-3.5 text-emerald-600" />
                Menu Cetak Lengkap
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Nama Lengkap Pengawas</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Asal Sekolah</th>
                  <th className="p-3 text-center">Ruang Tugas</th>
                  <th className="p-3">Kontak / Telepon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {supervisors.map((sup, idx) => (
                  <tr key={sup.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="p-3 text-center font-bold text-zinc-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">{sup.nama}</td>
                    <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">{sup.nip}</td>
                    <td className="p-3 text-zinc-700 dark:text-zinc-300">{sup.asalSekolah}</td>
                    <td className="p-3 text-center">
                      <Badge variant="emerald" size="sm">
                        {sup.ruangTugas}
                      </Badge>
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400 font-mono">{sup.kontak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Pengesahan Ketua TPU VI */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                  {tpuLeader.jabatanTpu}: {tpuLeader.namaKetuaTpu}
                </span>
                <span className="font-mono text-zinc-500 text-[11px]">
                  NIP. {tpuLeader.nipKetuaTpu} • Wilayah {tpuLeader.kecamatanTpu}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditPengawasOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Data Pengawas & Ketua TPU
            </button>
          </div>
        </div>
      )}

      {/* 5. SUSUNAN PANITIA UJIAN */}
      {activeSubTab === 'panitia' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Susunan Panitia Ujian Sekolah SDN 006 Sungai Buluh
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Berdasarkan {panitiaMeta.keteranganSk} No. {panitiaMeta.nomorSk} tanggal {panitiaMeta.tanggalSk} ({committee.length} Panitia)
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsEditPanitiaOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
                title="Buka menu edit susunan panitia ujian dan dasar SK penetapan"
              >
                <Edit3 className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                Edit Susunan Panitia
              </button>
              <button
                type="button"
                onClick={() => openPrintPreview('panitia')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer w-full sm:w-auto"
                title="Cetak Susunan Panitia Ujian Format A4 Portrait"
              >
                <Printer className="h-4 w-4" />
                Cetak Susunan Panitia
              </button>
              <button
                type="button"
                onClick={() => openPrintPreview()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer w-full sm:w-auto"
                title="Buka menu cetak seluruh dokumen ujian"
              >
                <Printer className="h-3.5 w-3.5 text-emerald-600" />
                Menu Cetak Lengkap
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {committee.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="emerald" size="sm">
                    {c.jabatan}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{c.nama}</h4>
                  <p className="font-mono text-xs text-zinc-500">NIP. {c.nip}</p>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 pt-2">
                  <b>Tugas:</b> {c.tugas}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. BERITA ACARA PELAKSANAAN */}
      {activeSubTab === 'berita' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Action Toolbar Menu Cetak & Edit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                  Berita Acara Pelaksanaan Ujian Nasional / Sekolah
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Dokumen naskah resmi pelaksanaan ujian berkop sekolah dan pengesahan pimpinan
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsEditBeritaPelaksanaanOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
                title="Buka menu edit isi berita acara pelaksanaan ujian"
              >
                <Edit3 className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                Edit Berita Acara
              </button>
              <button
                type="button"
                onClick={() => openPrintPreview('berita')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer w-full sm:w-auto"
                title="Cetak Berita Acara Pelaksanaan Format A4 Portrait"
              >
                <Printer className="h-4 w-4" />
                Cetak Berita Acara Pelaksanaan
              </button>
              <button
                type="button"
                onClick={() => openPrintPreview()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer w-full sm:w-auto"
                title="Buka menu cetak seluruh dokumen ujian"
              >
                <Printer className="h-3.5 w-3.5 text-emerald-600" />
                Menu Cetak Lengkap
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            <KopSurat schoolProfile={schoolProfile} />

            <div className="text-center space-y-0.5">
              <h3 className="text-base font-extrabold uppercase tracking-wide text-zinc-900 dark:text-zinc-50">
                BERITA ACARA
              </h3>
              <h4 className="text-sm font-extrabold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
                PELAKSANAAN UJIAN SEKOLAH (US)
              </h4>
              <h4 className="text-sm font-extrabold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
                TAHUN PELAJARAN {beritaAcaraState.tahunPelajaran || schoolProfile.tahunPelajaran}
              </h4>
            </div>

            <div className="pt-2 space-y-4 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
              <p>
                Pada hari ini <span className="font-bold underline px-1">{beritaAcaraState.hari || '...................'}</span>{' '}
                tanggal <span className="font-bold underline px-1">{beritaAcaraState.tanggal || '..........'}</span>{' '}
                bulan <span className="font-bold underline px-1">{beritaAcaraState.bulan || '...................'}</span>{' '}
                tahun <span className="font-bold underline px-1">{beritaAcaraState.tahun || '...................'}</span>
              </p>

              <div className="space-y-3 pl-0 sm:pl-1">
                {/* Poin a */}
                <div className="flex items-start">
                  <span className="font-bold mr-2 shrink-0">a.</span>
                  <div className="flex-1 space-y-1.5">
                    <p>
                      Telah diselenggarakan Ujian Sekolah (US) pada pukul{' '}
                      <span className="font-mono font-bold underline px-1">{beritaAcaraState.waktuMulai || '..........'}</span> s/d{' '}
                      <span className="font-mono font-bold underline px-1">{beritaAcaraState.waktuSelesai || '..........'}</span>
                    </p>

                    <div className="pl-4 space-y-1 text-xs">
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5 sm:col-span-4 text-zinc-600 dark:text-zinc-400">Pada Sekolah</span>
                        <span className="col-span-7 sm:col-span-8 font-bold">: {beritaAcaraState.padaSekolah || schoolProfile.namaSekolah}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5 sm:col-span-4 text-zinc-600 dark:text-zinc-400">Ruang</span>
                        <span className="col-span-7 sm:col-span-8 font-bold">: {selectedRoom || beritaAcaraState.ruang || 'RUANG 1'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5 sm:col-span-4 text-zinc-600 dark:text-zinc-400">Jumlah Peserta seharusnya</span>
                        <span className="col-span-7 sm:col-span-8 font-bold">: {roomStudents.length || beritaAcaraState.jumlahPesertaSeharusnya} orang</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5 sm:col-span-4 text-zinc-600 dark:text-zinc-400">Jumlah Peserta yang tidak hadir</span>
                        <span className="col-span-7 sm:col-span-8 font-bold">: {beritaAcaraState.jumlahPesertaTidakHadir || 0} orang</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5 sm:col-span-4 text-zinc-600 dark:text-zinc-400">Jumlah Peserta yang hadir</span>
                        <span className="col-span-7 sm:col-span-8 font-bold">: {Math.max(0, (roomStudents.length || beritaAcaraState.jumlahPesertaSeharusnya) - (beritaAcaraState.jumlahPesertaTidakHadir || 0))} orang</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Poin b */}
                <div className="flex items-start pt-1">
                  <span className="font-bold mr-2 shrink-0">b.</span>
                  <div className="flex-1 space-y-1.5">
                    <p>
                      Telah dibuka sampul soal Ujian Sekolah (US) untuk mata pelajaran
                    </p>
                    <p className="font-bold text-center underline uppercase py-1 tracking-wide text-zinc-900 dark:text-zinc-100">
                      {currentSubject?.name || beritaAcaraState.mataPelajaran || 'Bahasa Indonesia'}
                    </p>
                    <p>
                      Di ruang kelas dengan saksi oleh para peserta Ujian Sekolah (US) dan berisi lembar soal{' '}
                      <span className="font-bold underline px-1">{beritaAcaraState.lembarSoalEksamplar || roomStudents.length}</span> eksamplar,
                      lembar hasil kerja sebanyak{' '}
                      <span className="font-bold underline px-1">{beritaAcaraState.lembarHasilKerjaEksamplar || roomStudents.length}</span> eksamplar.
                    </p>
                  </div>
                </div>

                {/* Poin c */}
                <div className="flex items-start pt-1">
                  <span className="font-bold mr-2 shrink-0">c.</span>
                  <div className="flex-1 space-y-1.5">
                    <p>Catatan selama Ujian Sekolah (US) berlangsung :</p>
                    <div className="pl-4 space-y-1.5 font-medium">
                      <p className="border-b border-dotted border-zinc-400 dark:border-zinc-600 pb-0.5">
                        {beritaAcaraState.catatan1 || 'Pelaksanaan Ujian Sekolah (US) berlangsung dengan tertib, aman, dan lancar.'}
                      </p>
                      <p className="border-b border-dotted border-zinc-400 dark:border-zinc-600 pb-0.5">
                        {beritaAcaraState.catatan2 || 'Seluruh peserta ujian mematuhi tata tertib dan hadir lengkap.'}
                      </p>
                      {beritaAcaraState.catatan3 && (
                        <p className="border-b border-dotted border-zinc-400 dark:border-zinc-600 pb-0.5">
                          {beritaAcaraState.catatan3}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="pt-2">
                Berita acara ini di buat dengan sesungguhnya.
              </p>
            </div>

            {/* Tanda Tangan Sesuai Dokumen Berita Acara PDF */}
            <div className="pt-6 text-xs border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-center">
                <div className="w-full max-w-md mx-auto space-y-2">
                  <p className="text-center font-semibold text-zinc-800 dark:text-zinc-200">
                    Yang membuat berita acara :
                  </p>
                  <div className="flex justify-between items-center font-bold px-2 pt-1 text-zinc-900 dark:text-zinc-100">
                    <span>Pengawas</span>
                    <span className="pr-12">TTD</span>
                  </div>

                  {/* 1. Pengawas 1 */}
                  <div className="pt-3 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="flex">
                        <span className="w-16 text-zinc-500">1. Nama</span>
                        <span className="font-bold uppercase text-zinc-900 dark:text-zinc-100">
                          : {roomSupervisors[0]?.nama || beritaAcaraState.pengawas1Nama || '.....................................'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-16 pl-4 text-zinc-500">NIP</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300">
                          : {roomSupervisors[0]?.nip || beritaAcaraState.pengawas1Nip || '.....................................'}
                        </span>
                      </div>
                    </div>
                    <div className="w-36 text-right pr-6 font-mono text-zinc-400">
                      .........................
                    </div>
                  </div>

                  {/* 2. Pengawas 2 */}
                  <div className="pt-4 flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="flex">
                        <span className="w-16 text-zinc-500">2. Nama</span>
                        <span className="font-bold uppercase text-zinc-900 dark:text-zinc-100">
                          : {roomSupervisors[1]?.nama || beritaAcaraState.pengawas2Nama || '.....................................'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-16 pl-4 text-zinc-500">NIP</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300">
                          : {roomSupervisors[1]?.nip || beritaAcaraState.pengawas2Nip || '.....................................'}
                        </span>
                      </div>
                    </div>
                    <div className="w-36 text-right pr-6 font-mono text-zinc-400">
                      .........................
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. ADMINISTRASI & SK KELULUSAN KELAS 6 (PERANGKAT KELULUSAN) */}
      {['perangkat-kelulusan', 'undangan', 'ba-kelulusan', 'hadir-rapat', 'sk-kelulusan'].includes(activeSubTab) && (
        <GraduationDocsView
          schoolProfile={schoolProfile}
          students={students}
          initialDoc={
            (['undangan', 'ba-kelulusan', 'hadir-rapat', 'sk-kelulusan'].includes(activeSubTab)
              ? (activeSubTab as GraduationDocType)
              : activeGraduationDoc || 'undangan')
          }
          onActiveDocChange={(doc) => setActiveGraduationDoc(doc)}
          onOpenPrintPreview={(doc) => openPrintPreview(doc as ToolTab)}
          showToast={showToast}
        />
      )}

      {/* ========================================================
          PRINT PREVIEW MODAL: MENU CETAK PERANGKAT & RUANG UJIAN
         ======================================================== */}
      <PrintPreviewModal
        isOpen={isPrintMenuOpen}
        onClose={() => setIsPrintMenuOpen(false)}
        title={`Menu Cetak & Pratinjau: ${
          printDoc === 'nilai'
            ? 'Daftar Nilai Ujian'
            : printDoc === 'hadir'
            ? 'Daftar Hadir Peserta'
            : printDoc === 'kartu'
            ? 'Kartu Peserta Ujian'
            : printDoc === 'denah'
            ? 'Denah Ruang Ujian'
            : printDoc === 'label-meja'
            ? 'Label Meja Peserta'
            : printDoc === 'berita'
            ? 'Berita Acara Pelaksanaan'
            : printDoc === 'pengawas'
            ? 'Daftar Pengawas TPU VI'
            : printDoc === 'panitia'
            ? 'Susunan Panitia'
            : printDoc === 'undangan'
            ? 'Surat Undangan Rapat'
            : printDoc === 'ba-kelulusan'
            ? 'Berita Acara Kelulusan'
            : printDoc === 'hadir-rapat'
            ? 'Daftar Hadir Rapat'
            : printDoc === 'sk-kelulusan'
            ? 'SK Kelulusan Siswa'
            : 'Dokumen Kelulusan'
        }`}
        subtitle={`SDN 006 Sungai Buluh • TPU VI Singingi Hilir • TP ${schoolProfile.tahunPelajaran}${
          ['denah', 'label-meja', 'kartu', 'hadir', 'nilai', 'berita'].includes(printDoc) ? ` • ${selectedRoom}` : ''
        }`}
        defaultOrientation={printDoc === 'denah' ? 'landscape' : 'portrait'}
        toolbarExtra={
          <div className="flex flex-wrap items-center gap-2">
            {/* Document Selector */}
            <select
              value={printDoc}
              onChange={(e) => setPrintDoc(e.target.value as any)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-100 focus:border-emerald-500 focus:outline-none"
            >
              <optgroup label="Perangkat Operasional Ujian">
                <option value="nilai">📄 Daftar Nilai Hasil Koreksi</option>
                <option value="hadir">📋 Daftar Hadir Peserta</option>
                <option value="kartu">🪪 Kartu Peserta Ujian</option>
                <option value="denah">📐 Denah Ruang Ujian</option>
                <option value="label-meja">🏷️ Label Meja Peserta</option>
                <option value="berita">📜 Berita Acara Pelaksanaan</option>
                <option value="pengawas">🛡️ Daftar Pengawas TPU VI</option>
                <option value="panitia">👥 Susunan Panitia</option>
              </optgroup>
              <optgroup label="Administrasi Rapat & Kelulusan (Navigasi Lembar Kerja)">
                <option value="undangan">✉️ Hal 1: Undangan Rapat (Kop Surat)</option>
                <option value="ba-kelulusan">📜 Hal 2: Berita Acara (Kop Surat)</option>
                <option value="hadir-rapat">📋 Hal 3: Daftar Hadir Rapat (Kop Surat)</option>
                <option value="sk-kelulusan">⚖️ Hal 4: SK Kelulusan (Kop Surat)</option>
              </optgroup>
            </select>

            {/* Room Selector */}
            {['denah', 'label-meja', 'kartu', 'hadir', 'nilai', 'berita'].includes(printDoc) && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400 font-semibold hidden sm:inline">Ruang:</span>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value as any)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="RUANG 1">Ruang 1</option>
                  <option value="RUANG 2">Ruang 2</option>
                  <option value="RUANG 3">Ruang 3</option>
                  <option value="RUANG 4">Ruang 4</option>
                </select>
              </div>
            )}

            {/* Subject Selector when viewing Daftar Nilai */}
            {printDoc === 'nilai' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400 font-semibold hidden md:inline">Mapel:</span>
                <select
                  value={selectedSubjectKey}
                  onChange={(e) => setSelectedSubjectKey(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-200 focus:border-emerald-500 focus:outline-none max-w-[150px] truncate"
                >
                  {subjects.map((sub) => (
                    <option key={sub.key} value={sub.key}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Font Selector for SK Kelulusan */}
            {printDoc === 'sk-kelulusan' && (() => {
              const currentSK = loadSKKelulusanState();
              return (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-zinc-400 font-semibold hidden sm:inline flex items-center gap-1">
                    <Type className="h-3.5 w-3.5 text-emerald-400" />
                    Font:
                  </span>
                  <select
                    value={currentSK.fontFamily || 'times'}
                    onChange={(e) => {
                      const next = e.target.value as DocFontFamily;
                      saveSKKelulusanState({ ...currentSK, fontFamily: next });
                      setLastUpdateTrigger(Date.now());
                    }}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-200 focus:border-emerald-500 focus:outline-none"
                    aria-label="Pilih Jenis Font SK Kelulusan"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}

            {/* Menu Ubah/Edit Data Dokumen Lembar Kerja */}
            <button
              type="button"
              onClick={() => {
                if (printDoc === 'pengawas') {
                  setIsEditPengawasOpen(true);
                } else if (printDoc === 'panitia') {
                  setIsEditPanitiaOpen(true);
                } else if (printDoc === 'berita') {
                  setIsEditBeritaPelaksanaanOpen(true);
                } else {
                  const targetDoc = ['undangan', 'ba-kelulusan', 'hadir-rapat', 'sk-kelulusan'].includes(printDoc)
                    ? (printDoc as GraduationDocType)
                    : 'undangan';
                  setGradModalDocType(targetDoc);
                  setIsEditGradModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold px-3 py-1.5 text-xs shadow-md transition-all cursor-pointer shrink-0"
              title="Buka menu lengkap ubah/edit data dokumen ini"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>
                {printDoc === 'pengawas'
                  ? 'Edit Pengawas TPU VI'
                  : printDoc === 'panitia'
                  ? 'Edit Susunan Panitia'
                  : printDoc === 'berita'
                  ? 'Edit Berita Acara'
                  : 'Ubah / Edit Data'}
              </span>
            </button>
          </div>
        }
      >
        <div className="space-y-6 text-xs text-black">
          {/* ========================================================
              1. PRINTABLE DAFTAR NILAI UJIAN PER RUANGAN
             ======================================================== */}
          {printDoc === 'nilai' && (
            <div className="space-y-5">
              {/* Kop Surat Resmi */}
              <KopSurat schoolProfile={schoolProfile} variant="compact" />

              {/* Judul Dokumen */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold uppercase tracking-wide underline text-black">
                  DAFTAR NILAI HASIL KOREKSI UJIAN SEKOLAH / UJIAN NASIONAL
                </h3>
                <p className="text-xs font-bold text-zinc-700">
                  TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
                </p>
              </div>

              {/* Identitas Lembar Ujian */}
              <div className="rounded-lg border border-black p-3.5 text-xs bg-zinc-50/60">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="font-bold text-zinc-700">Mata Pelajaran</span>
                      <span className="col-span-2 font-extrabold uppercase text-black">
                        : {currentSubject.name} ({currentSubject.code})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="font-bold text-zinc-700">Hari / Tanggal</span>
                      <span className="col-span-2 font-medium">
                        : {hariTanggal}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="font-bold text-zinc-700">Ruang Ujian</span>
                      <span className="col-span-2 font-extrabold text-black">
                        : {selectedRoom}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="font-bold text-zinc-700">Nama Pengoreksi I</span>
                      <span className="col-span-2 font-bold uppercase">
                        : {namaPengoreksi1}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="font-bold text-zinc-700">Nama Pengoreksi II</span>
                      <span className="col-span-2 font-bold uppercase">
                        : {namaPengoreksi2}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="font-bold text-zinc-700">Standar KKM</span>
                      <span className="col-span-2 font-mono font-bold">
                        : {currentSubject.kkm} (Batas Minimal Tuntas)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabel Siswa & Nilai */}
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead>
                  <tr className="bg-zinc-100 font-bold border-b border-black text-black">
                    <th className="p-2 w-8 text-center border-r border-black">No</th>
                    <th className="p-2 min-w-[110px] border-r border-black">No. Peserta</th>
                    <th className="p-2 min-w-[90px] border-r border-black">NISN / NIS</th>
                    <th className="p-2 min-w-[170px] border-r border-black">Nama Peserta Didik</th>
                    <th className="p-2 text-center w-10 border-r border-black">L/P</th>
                    <th className="p-2 text-center min-w-[80px] border-r border-black font-bold">
                      Nilai Asli
                    </th>
                    <th className="p-2 text-center min-w-[80px] border-r border-black font-black">
                      Nilai Jadi
                    </th>
                    <th className="p-2 text-center w-12 border-r border-black">Pred</th>
                    <th className="p-2 text-center min-w-[70px] border-r border-black">Status</th>
                    <th className="p-2 text-center min-w-[80px]">Paraf</th>
                  </tr>
                </thead>
                <tbody>
                  {roomStudents.map((s, idx) => {
                    const usDetail = s.us[selectedSubjectKey] || { tulis: 0, akhir: 0 };
                    const rawVal = usDetail.tulis;
                    const finalVal = usDetail.akhir;
                    const pred = getGradePredicate(finalVal);
                    const isPassed = finalVal >= currentSubject.kkm;

                    return (
                      <tr key={s.id} className="border-b border-black break-inside-avoid h-8">
                        <td className="p-1.5 text-center font-bold border-r border-black">{idx + 1}</td>
                        <td className="p-1.5 font-mono border-r border-black">{s.noPeserta}</td>
                        <td className="p-1.5 font-mono text-[11px] border-r border-black">{s.nisn}</td>
                        <td className="p-1.5 font-bold uppercase border-r border-black">{s.nama}</td>
                        <td className="p-1.5 text-center border-r border-black">{s.jenisKelamin}</td>
                        <td className="p-1.5 text-center font-mono border-r border-black font-semibold">
                          {rawVal.toFixed(1)}
                        </td>
                        <td className="p-1.5 text-center font-mono font-black border-r border-black">
                          {finalVal.toFixed(1)}
                        </td>
                        <td className="p-1.5 text-center font-bold border-r border-black">{pred.grade}</td>
                        <td className="p-1.5 text-center font-bold border-r border-black text-[10px]">
                          {isPassed ? 'TUNTAS' : 'BELUM'}
                        </td>
                        <td className="p-1.5 text-center text-zinc-400 text-[10px]">
                          ..........
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Ringkasan Statistik */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="border border-black p-2 rounded">
                  <span className="text-[10px] text-zinc-600 uppercase block font-semibold">Rata-rata Nilai Asli</span>
                  <span className="font-mono font-bold text-black">{avgTulis}</span>
                </div>
                <div className="border border-black p-2 rounded bg-zinc-50">
                  <span className="text-[10px] text-zinc-700 uppercase block font-bold">Rata-rata Nilai Jadi</span>
                  <span className="font-mono font-black text-black">{avgAkhir}</span>
                </div>
                <div className="border border-black p-2 rounded">
                  <span className="text-[10px] text-zinc-600 uppercase block font-semibold">Nilai Tertinggi</span>
                  <span className="font-mono font-bold text-black">{maxAkhir}</span>
                </div>
                <div className="border border-black p-2 rounded">
                  <span className="text-[10px] text-zinc-600 uppercase block font-semibold">Nilai Terendah</span>
                  <span className="font-mono font-bold text-black">{minAkhir}</span>
                </div>
                <div className="border border-black p-2 rounded bg-zinc-50">
                  <span className="text-[10px] text-zinc-700 uppercase block font-bold">Ketuntasan Ruang</span>
                  <span className="font-mono font-black text-black">{passedPercentage}% ({passedCount}/{roomStudents.length})</span>
                </div>
              </div>

              {/* Tanda Tangan 3 Kolom Resmi */}
              <div className="grid grid-cols-3 gap-4 pt-6 text-xs text-center break-inside-avoid">
                <div>
                  <p className="font-semibold text-zinc-800">Pengoreksi II (Pendamping),</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase text-black">{namaPengoreksi2 || '.....................................'}</p>
                  <p className="font-mono text-[11px] text-zinc-700">NIP. {nipPengoreksi2 || '.....................................'}</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-800">Mengetahui,</p>
                  <p className="font-bold text-black">Kepala {schoolProfile.namaSekolah},</p>
                  <div className="h-12"></div>
                  <p className="font-bold underline uppercase text-black">{schoolProfile.kepalaSekolah}</p>
                  <p className="font-mono text-[11px] text-zinc-700">NIP. {schoolProfile.nipKepalaSekolah}</p>
                </div>
                <div>
                  <p className="text-zinc-700">{schoolProfile.tempatCetak || 'Sungai Buluh'}, {hariTanggal}</p>
                  <p className="font-bold text-black">Pengoreksi I (Guru Mapel),</p>
                  <div className="h-12"></div>
                  <p className="font-bold underline uppercase text-black">{namaPengoreksi1 || '.....................................'}</p>
                  <p className="font-mono text-[11px] text-zinc-700">NIP. {nipPengoreksi1 || '.....................................'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              2. PRINTABLE DAFTAR HADIR
             ======================================================== */}
          {printDoc === 'hadir' && (
            <div className="space-y-5">
              <KopSurat schoolProfile={schoolProfile} variant="compact" />
              <div className="text-center space-y-0.5">
                <h3 className="text-base font-extrabold uppercase underline text-black">
                  DAFTAR HADIR PESERTA UJIAN NASIONAL / SEKOLAH
                </h3>
                <p className="text-xs font-bold text-zinc-700">
                  {schoolProfile.namaSekolah} • {selectedRoom} • TP {schoolProfile.tahunPelajaran}
                </p>
              </div>

              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead>
                  <tr className="bg-zinc-100 font-bold border-b border-black">
                    <th className="p-2 w-8 text-center border-r border-black">No</th>
                    <th className="p-2 min-w-[120px] border-r border-black">No. Peserta</th>
                    <th className="p-2 min-w-[180px] border-r border-black">Nama Peserta</th>
                    <th className="p-2 text-center w-12 border-r border-black">L/P</th>
                    <th className="p-2 text-center min-w-[130px] border-r border-black">Tanda Tangan (Ganjil)</th>
                    <th className="p-2 text-center min-w-[130px] border-r border-black">Tanda Tangan (Genap)</th>
                    <th className="p-2 text-center min-w-[70px]">Ket</th>
                  </tr>
                </thead>
                <tbody>
                  {roomStudents.map((s, idx) => (
                    <tr key={s.id} className="h-11 border-b border-black break-inside-avoid">
                      <td className="p-2 text-center font-bold border-r border-black">{idx + 1}</td>
                      <td className="p-2 font-mono border-r border-black">{s.noPeserta}</td>
                      <td className="p-2 font-bold uppercase border-r border-black">{s.nama}</td>
                      <td className="p-2 text-center border-r border-black">{s.jenisKelamin}</td>
                      <td className="p-2 border-r border-black">
                        {idx % 2 === 0 ? <span className="text-[10px] text-zinc-500">{idx + 1}. ....................</span> : ''}
                      </td>
                      <td className="p-2 border-r border-black">
                        {idx % 2 !== 0 ? <span className="text-[10px] text-zinc-500">{idx + 1}. ....................</span> : ''}
                      </td>
                      <td className="p-2 text-center font-bold text-[10px]">Hadir</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 pt-6 text-xs break-inside-avoid">
                <div>
                  <p className="font-semibold text-zinc-800">Pengawas 1,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-black">{roomSupervisors[0]?.nama || '.....................................'}</p>
                  <p className="font-mono text-zinc-600">NIP. {roomSupervisors[0]?.nip || '.......................'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-zinc-800">Pengawas 2,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-black">{roomSupervisors[1]?.nama || '.....................................'}</p>
                  <p className="font-mono text-zinc-600">NIP. {roomSupervisors[1]?.nip || '.......................'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              3. PRINTABLE KARTU PESERTA
             ======================================================== */}
          {printDoc === 'kartu' && (
            <div className="space-y-5">
              <div className="text-center pb-2 border-b border-black">
                <h3 className="text-sm font-extrabold uppercase text-black">
                  LEMBAR CETAK KARTU PESERTA UJIAN NASIONAL ({selectedRoom})
                </h3>
                <p className="text-[11px] text-zinc-600">
                  {schoolProfile.namaSekolah} • Cetak 2 Kartu Per Baris Siap Potong & Dilaminating
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {roomStudents.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border-2 border-black p-3.5 space-y-2 bg-white break-inside-avoid"
                  >
                    {/* Kop Kartu */}
                    <div className="flex items-center gap-2 border-b border-black pb-2">
                      <img
                        src={schoolProfile.kopSurat?.logoKiri || getPresetLogoDataUrl('kuansing')}
                        alt="Logo"
                        className="h-10 w-10 object-contain"
                      />
                      <div className="flex-1 text-center">
                        <div className="text-[8px] font-bold uppercase text-zinc-700 leading-tight">
                          {schoolProfile.kopSurat?.instansiAtas || 'PEMERINTAH KABUPATEN KUANTAN SINGINGI'}
                        </div>
                        <div className="text-[9px] font-extrabold uppercase leading-tight text-black">
                          {schoolProfile.namaSekolah}
                        </div>
                        <div className="text-[8px] font-bold text-zinc-800">
                          KARTU PESERTA UJIAN • TP {schoolProfile.tahunPelajaran}
                        </div>
                      </div>
                      <img
                        src={schoolProfile.kopSurat?.logoKanan || getPresetLogoDataUrl('tutwuri')}
                        alt="Logo"
                        className="h-10 w-10 object-contain"
                      />
                    </div>

                    {/* Badan Kartu */}
                    <div className="flex gap-3 items-center pt-1 text-[11px]">
                      <div className="h-24 w-18 shrink-0 overflow-hidden rounded border border-black bg-zinc-100 flex items-center justify-center">
                        {s.foto ? (
                          <img src={s.foto} alt={s.nama} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl">{s.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <div>
                          <span className="text-[9px] text-zinc-600 block">Nama Lengkap:</span>
                          <span className="font-extrabold uppercase text-black truncate block">{s.nama}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          <div>
                            <span className="text-zinc-600 block">No. Peserta:</span>
                            <span className="font-mono font-bold text-black">{s.noPeserta}</span>
                          </div>
                          <div>
                            <span className="text-zinc-600 block">NISN:</span>
                            <span className="font-mono font-bold text-black">{s.nisn}</span>
                          </div>
                        </div>
                        <div className="text-[10px]">
                          <span className="text-zinc-600">Ruang / Meja: </span>
                          <span className="font-bold text-black">{s.ruang} • Meja #{s.noMeja}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Kartu */}
                    <div className="flex items-center justify-between border-t border-black pt-1.5 text-[8px]">
                      <span className="text-zinc-500">*Wajib dibawa saat ujian</span>
                      <div className="text-right">
                        <span>Kepala Sekolah,</span>
                        <div className="font-bold text-black underline">{schoolProfile.kepalaSekolah}</div>
                        <div className="pt-0.5 text-zinc-700 font-normal">NIP. {schoolProfile.nipKepalaSekolah}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              4. PRINTABLE DENAH RUANG
             ======================================================== */}
          {printDoc === 'denah' && (
            <div className="space-y-5">
              <KopSurat schoolProfile={schoolProfile} variant="compact" />
              <div className="text-center space-y-0.5">
                <h3 className="text-base font-extrabold uppercase underline text-black">
                  DENAH PENATAAN TEMPAT DUDUK PESERTA UJIAN NASIONAL
                </h3>
                <p className="text-xs font-bold text-zinc-700">
                  {schoolProfile.namaSekolah} • {selectedRoom} • KAPASITAS 20 PESERTA
                </p>
              </div>

              {/* Meja Pengawas */}
              <div className="mx-auto max-w-sm rounded border-2 border-black bg-zinc-100 p-2 text-center font-bold text-xs">
                MEJA PENGAWAS RUANG (DEPAN)
              </div>

              {/* Grid Tempat Duduk */}
              <div className="grid grid-cols-4 gap-3 pt-3">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((seatNum) => {
                  const studentOnSeat = roomStudents.find((s) => s.noMeja === seatNum);
                  return (
                    <div
                      key={seatNum}
                      className="rounded border-2 border-black p-2.5 text-center min-h-[75px] flex flex-col justify-between break-inside-avoid bg-white"
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold border-b border-black pb-1">
                        <span>MEJA #{seatNum}</span>
                        <span className="font-mono">{studentOnSeat?.noPeserta.slice(-4) || '-'}</span>
                      </div>
                      <div className="py-1">
                        {studentOnSeat ? (
                          <div className="font-extrabold uppercase text-[11px] truncate">
                            {studentOnSeat.nama}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[10px]">Meja Kosong</span>
                        )}
                      </div>
                      <div className="text-[9px] font-mono text-zinc-600">
                        {studentOnSeat ? `NISN: ${studentOnSeat.nisn}` : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 pt-6 text-xs break-inside-avoid">
                <div>
                  <p className="font-semibold text-zinc-800">Pengawas 1,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-black">{roomSupervisors[0]?.nama || '.....................................'}</p>
                  <p className="font-mono text-zinc-600">NIP. {roomSupervisors[0]?.nip || '.......................'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-zinc-800">Pengawas 2,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-black">{roomSupervisors[1]?.nama || '.....................................'}</p>
                  <p className="font-mono text-zinc-600">NIP. {roomSupervisors[1]?.nip || '.......................'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              5. PRINTABLE LABEL MEJA
             ======================================================== */}
          {printDoc === 'label-meja' && (
            <div className="space-y-4">
              <div className="text-center pb-2 border-b border-black">
                <h3 className="text-sm font-extrabold uppercase text-black">
                  LABEL MEJA PESERTA UJIAN ({selectedRoom})
                </h3>
                <p className="text-[11px] text-zinc-600">
                  Potong sesuai garis putus-putus dan tempel di sudut kanan meja ujian
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {roomStudents.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border-2 border-dashed border-black p-3 space-y-2 bg-white break-inside-avoid text-center"
                  >
                    <div className="text-[9px] font-extrabold uppercase tracking-wide border-b border-black pb-1">
                      {schoolProfile.namaSekolah} • {s.ruang}
                    </div>
                    <div className="flex items-center justify-around py-1">
                      <div className="text-3xl font-black text-black">
                        #{s.noMeja}
                      </div>
                      <div className="h-14 w-12 rounded border border-black overflow-hidden bg-zinc-100 flex items-center justify-center">
                        {s.foto ? (
                          <img src={s.foto} alt={s.nama} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg">{s.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-extrabold uppercase text-[11px] truncate text-black">{s.nama}</div>
                      <div className="font-mono text-[10px] font-bold text-zinc-800">{s.noPeserta}</div>
                      <div className="font-mono text-[9px] text-zinc-600">NISN: {s.nisn}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              6. PRINTABLE BERITA ACARA (SESUAI FILE BERITA ACARA.PDF)
             ======================================================== */}
          {printDoc === 'berita' && (
            <div className="space-y-5 text-black">
              <KopSurat schoolProfile={schoolProfile} />

              <div className="text-center space-y-0.5 pt-1">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-black">
                  BERITA ACARA
                </h3>
                <h4 className="text-sm font-extrabold uppercase tracking-wide text-black">
                  PELAKSANAAN UJIAN SEKOLAH (US)
                </h4>
                <h4 className="text-sm font-extrabold uppercase tracking-wide text-black">
                  TAHUN PELAJARAN {beritaAcaraState.tahunPelajaran || schoolProfile.tahunPelajaran}
                </h4>
              </div>

              <div className="pt-3 space-y-3.5 text-xs leading-relaxed text-black">
                <p>
                  Pada hari ini <span className="font-bold underline px-1">{beritaAcaraState.hari || '...................'}</span>{' '}
                  tanggal <span className="font-bold underline px-1">{beritaAcaraState.tanggal || '..........'}</span>{' '}
                  bulan <span className="font-bold underline px-1">{beritaAcaraState.bulan || '...................'}</span>{' '}
                  tahun <span className="font-bold underline px-1">{beritaAcaraState.tahun || '...................'}</span>
                </p>

                <div className="space-y-3">
                  {/* Poin a */}
                  <div className="flex items-start">
                    <span className="font-bold mr-2 shrink-0">a.</span>
                    <div className="flex-1 space-y-1.5">
                      <p>
                        Telah diselenggarakan Ujian Sekolah (US) pada pukul{' '}
                        <span className="font-mono font-bold underline px-1">{beritaAcaraState.waktuMulai || '..........'}</span> s/d{' '}
                        <span className="font-mono font-bold underline px-1">{beritaAcaraState.waktuSelesai || '..........'}</span>
                      </p>

                      <div className="pl-4 space-y-1 text-xs">
                        <div className="grid grid-cols-12 gap-1">
                          <span className="col-span-5 sm:col-span-4">Pada Sekolah</span>
                          <span className="col-span-7 sm:col-span-8 font-bold">: {beritaAcaraState.padaSekolah || schoolProfile.namaSekolah}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1">
                          <span className="col-span-5 sm:col-span-4">Ruang</span>
                          <span className="col-span-7 sm:col-span-8 font-bold">: {selectedRoom || beritaAcaraState.ruang || 'RUANG 1'}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1">
                          <span className="col-span-5 sm:col-span-4">Jumlah Peserta seharusnya</span>
                          <span className="col-span-7 sm:col-span-8 font-bold">: {roomStudents.length || beritaAcaraState.jumlahPesertaSeharusnya} orang</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1">
                          <span className="col-span-5 sm:col-span-4">Jumlah Peserta yang tidak hadir</span>
                          <span className="col-span-7 sm:col-span-8 font-bold">: {beritaAcaraState.jumlahPesertaTidakHadir || 0} orang</span>
                        </div>
                        <div className="grid grid-cols-12 gap-1">
                          <span className="col-span-5 sm:col-span-4">Jumlah Peserta yang hadir</span>
                          <span className="col-span-7 sm:col-span-8 font-bold">: {Math.max(0, (roomStudents.length || beritaAcaraState.jumlahPesertaSeharusnya) - (beritaAcaraState.jumlahPesertaTidakHadir || 0))} orang</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Poin b */}
                  <div className="flex items-start pt-1">
                    <span className="font-bold mr-2 shrink-0">b.</span>
                    <div className="flex-1 space-y-1.5">
                      <p>
                        Telah dibuka sampul soal Ujian Sekolah (US) untuk mata pelajaran
                      </p>
                      <p className="font-bold text-center underline uppercase py-1 tracking-wide text-black">
                        {currentSubject?.name || beritaAcaraState.mataPelajaran || 'Bahasa Indonesia'}
                      </p>
                      <p>
                        Di ruang kelas dengan saksi oleh para peserta Ujian Sekolah (US) dan berisi lembar soal{' '}
                        <span className="font-bold underline px-1">{beritaAcaraState.lembarSoalEksamplar || roomStudents.length}</span> eksamplar,
                        lembar hasil kerja sebanyak{' '}
                        <span className="font-bold underline px-1">{beritaAcaraState.lembarHasilKerjaEksamplar || roomStudents.length}</span> eksamplar.
                      </p>
                    </div>
                  </div>

                  {/* Poin c */}
                  <div className="flex items-start pt-1">
                    <span className="font-bold mr-2 shrink-0">c.</span>
                    <div className="flex-1 space-y-1.5">
                      <p>Catatan selama Ujian Sekolah (US) berlangsung :</p>
                      <div className="pl-4 space-y-1.5 font-medium">
                        <p className="border-b border-dotted border-black pb-0.5">
                          {beritaAcaraState.catatan1 || 'Pelaksanaan Ujian Sekolah (US) berlangsung dengan tertib, aman, dan lancar.'}
                        </p>
                        <p className="border-b border-dotted border-black pb-0.5">
                          {beritaAcaraState.catatan2 || 'Seluruh peserta ujian mematuhi tata tertib dan hadir lengkap.'}
                        </p>
                        {beritaAcaraState.catatan3 && (
                          <p className="border-b border-dotted border-black pb-0.5">
                            {beritaAcaraState.catatan3}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="pt-2">
                  Berita acara ini di buat dengan sesungguhnya.
                </p>
              </div>

              {/* Tanda Tangan Sesuai Dokumen Berita Acara PDF */}
              <div className="pt-8 text-xs break-inside-avoid">
                <div className="flex justify-center">
                  <div className="w-full max-w-md mx-auto space-y-2">
                    <p className="text-center font-semibold text-black">
                      Yang membuat berita acara :
                    </p>
                    <div className="flex justify-between items-center font-bold px-2 pt-1 text-black">
                      <span>Pengawas</span>
                      <span className="pr-12">TTD</span>
                    </div>

                    {/* 1. Pengawas 1 */}
                    <div className="pt-4 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="flex">
                          <span className="w-16">1. Nama</span>
                          <span className="font-bold uppercase text-black">
                            : {roomSupervisors[0]?.nama || beritaAcaraState.pengawas1Nama || '.....................................'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-16 pl-4">NIP</span>
                          <span className="font-mono text-zinc-800">
                            : {roomSupervisors[0]?.nip || beritaAcaraState.pengawas1Nip || '.....................................'}
                          </span>
                        </div>
                      </div>
                      <div className="w-36 text-right pr-6 font-mono text-zinc-500">
                        .........................
                      </div>
                    </div>

                    {/* 2. Pengawas 2 */}
                    <div className="pt-5 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="flex">
                          <span className="w-16">2. Nama</span>
                          <span className="font-bold uppercase text-black">
                            : {roomSupervisors[1]?.nama || beritaAcaraState.pengawas2Nama || '.....................................'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-16 pl-4">NIP</span>
                          <span className="font-mono text-zinc-800">
                            : {roomSupervisors[1]?.nip || beritaAcaraState.pengawas2Nip || '.....................................'}
                          </span>
                        </div>
                      </div>
                      <div className="w-36 text-right pr-6 font-mono text-zinc-500">
                        .........................
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              7. PRINTABLE DAFTAR PENGAWAS
             ======================================================== */}
          {printDoc === 'pengawas' && (
            <div className="space-y-5">
              <KopSurat schoolProfile={schoolProfile} variant="compact" />
              <div className="text-center space-y-0.5">
                <h3 className="text-base font-extrabold uppercase underline text-black">
                  DAFTAR PENGAWAS RUANG TPU VI SINGINGI HILIR
                </h3>
                <p className="text-xs font-bold text-zinc-700">
                  Sistem Pengawasan Silang Antar-SD Se-Kecamatan Singingi Hilir • TP {schoolProfile.tahunPelajaran}
                </p>
              </div>

              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead>
                  <tr className="bg-zinc-100 font-bold border-b border-black">
                    <th className="p-2 w-8 text-center border-r border-black">No</th>
                    <th className="p-2 min-w-[170px] border-r border-black">Nama Lengkap Pengawas</th>
                    <th className="p-2 min-w-[120px] border-r border-black">NIP</th>
                    <th className="p-2 min-w-[140px] border-r border-black">Asal Sekolah</th>
                    <th className="p-2 text-center min-w-[90px] border-r border-black">Ruang Tugas</th>
                    <th className="p-2 min-w-[100px]">Kontak / HP</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors.map((sup, idx) => (
                    <tr key={sup.id} className="border-b border-black h-8 break-inside-avoid">
                      <td className="p-2 text-center font-bold border-r border-black">{idx + 1}</td>
                      <td className="p-2 font-bold uppercase border-r border-black">{sup.nama}</td>
                      <td className="p-2 font-mono border-r border-black">{sup.nip}</td>
                      <td className="p-2 border-r border-black">{sup.asalSekolah}</td>
                      <td className="p-2 text-center font-bold border-r border-black">{sup.ruangTugas}</td>
                      <td className="p-2 font-mono">{sup.kontak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 pt-6 text-xs break-inside-avoid">
                <div>
                  <p className="font-semibold text-zinc-800">{tpuLeader.jabatanTpu},</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-black">{tpuLeader.namaKetuaTpu}</p>
                  <p className="pt-0.5 text-zinc-700 font-normal">NIP. {tpuLeader.nipKetuaTpu}</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-700">{schoolProfile.tempatCetak || 'Sungai Buluh'}, {schoolProfile.tanggalKelulusan}</p>
                  <p className="font-bold text-black">Kepala {schoolProfile.namaSekolah},</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-black">{schoolProfile.kepalaSekolah}</p>
                  <p className="pt-0.5 text-zinc-700 font-normal">NIP. {schoolProfile.nipKepalaSekolah}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              8. PRINTABLE SUSUNAN PANITIA
             ======================================================== */}
          {printDoc === 'panitia' && (
            <div className="space-y-5">
              <KopSurat schoolProfile={schoolProfile} variant="compact" />
              <div className="text-center space-y-0.5">
                <h3 className="text-base font-extrabold uppercase underline text-black">
                  SUSUNAN PANITIA UJIAN SEKOLAH / UJIAN NASIONAL
                </h3>
                <p className="text-xs font-bold text-zinc-700">
                  {schoolProfile.namaSekolah} • Berdasarkan {panitiaMeta.keteranganSk} No. {panitiaMeta.nomorSk}
                </p>
              </div>

              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead>
                  <tr className="bg-zinc-100 font-bold border-b border-black">
                    <th className="p-2 w-8 text-center border-r border-black">No</th>
                    <th className="p-2 min-w-[120px] border-r border-black">Jabatan Kepanitiaan</th>
                    <th className="p-2 min-w-[180px] border-r border-black">Nama Lengkap</th>
                    <th className="p-2 min-w-[130px] border-r border-black">NIP</th>
                    <th className="p-2 min-w-[160px]">Uraian Tugas Pokok</th>
                  </tr>
                </thead>
                <tbody>
                  {committee.map((c, idx) => (
                    <tr key={c.id} className="border-b border-black h-9 break-inside-avoid">
                      <td className="p-2 text-center font-bold border-r border-black">{idx + 1}</td>
                      <td className="p-2 font-bold border-r border-black">{c.jabatan}</td>
                      <td className="p-2 font-extrabold uppercase border-r border-black">{c.nama}</td>
                      <td className="p-2 font-mono border-r border-black">{c.nip}</td>
                      <td className="p-2 text-[11px]">{c.tugas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 pt-6 text-xs break-inside-avoid">
                <div>
                  <p className="font-semibold text-zinc-800">Ketua Panitia Ujian,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-black">
                    {committee.find((c) => c.jabatan.toLowerCase().includes('ketua'))?.nama || schoolProfile.ketuaPanitia}
                  </p>
                  <p className="pt-0.5 text-zinc-700 font-normal">
                    NIP. {committee.find((c) => c.jabatan.toLowerCase().includes('ketua'))?.nip || schoolProfile.nipKetuaPanitia}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-700">{schoolProfile.tempatCetak || 'Sungai Buluh'}, {panitiaMeta.tanggalSk || schoolProfile.tanggalKelulusan}</p>
                  <p className="font-bold text-black">Kepala {schoolProfile.namaSekolah},</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-black">{schoolProfile.kepalaSekolah}</p>
                  <p className="pt-0.5 text-zinc-700 font-normal">NIP. {schoolProfile.nipKepalaSekolah}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              9. PRINTABLE SURAT UNDANGAN RAPAT KELULUSAN (PDF HAL 1)
             ======================================================== */}
          {printDoc === 'undangan' && (() => {
            const currentUndangan = loadUndanganDocState();
            return (
              <div
                className="space-y-4 text-black"
                style={{
                  fontFamily: getFontCssFamily(currentUndangan.fontFamily),
                  fontSize: currentUndangan.fontSize,
                  lineHeight: currentUndangan.lineSpacing,
                }}
              >
                <KopSurat schoolProfile={schoolProfile} />
                <div className="text-right pt-2 pb-1">
                  {currentUndangan.tempatSurat}, {currentUndangan.tanggalSurat}
                </div>
                <div className="grid grid-cols-12 gap-y-1 items-start">
                  <div className="col-span-7 space-y-1">
                    <div className="grid grid-cols-6">
                      <span className="col-span-2">Nomor</span>
                      <span className="col-span-4 font-mono font-bold">: {currentUndangan.nomor}</span>
                    </div>
                    <div className="grid grid-cols-6">
                      <span className="col-span-2">Sifat</span>
                      <span className="col-span-4">: {currentUndangan.sifat}</span>
                    </div>
                    <div className="grid grid-cols-6">
                      <span className="col-span-2">Lampiran</span>
                      <span className="col-span-4">: {currentUndangan.lampiran}</span>
                    </div>
                    <div className="grid grid-cols-6">
                      <span className="col-span-2">Hal</span>
                      <span className="col-span-4 font-bold">: {currentUndangan.hal}</span>
                    </div>
                  </div>
                  <div className="col-span-5 pl-4 space-y-1">
                    <div>Kepada Yth :</div>
                    <div className="font-bold">{currentUndangan.tujuan}</div>
                    <div>{schoolProfile.namaSekolah}</div>
                    <div>{currentUndangan.tempatTujuan}</div>
                  </div>
                </div>

                <div className="pt-4 italic">
                  {currentUndangan.salamPembuka}
                </div>

                <div className="text-justify" style={{ textIndent: '1.25cm' }}>
                  {currentUndangan.paragrafPengantar}
                </div>

                <div className="pl-10 space-y-1.5 py-1">
                  <div className="grid grid-cols-12">
                    <span className="col-span-3">Hari / Tanggal</span>
                    <span className="col-span-9 font-bold">: {currentUndangan.hariTanggal}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-3">Waktu / Pukul</span>
                    <span className="col-span-9">: {currentUndangan.jam}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-3">Tempat</span>
                    <span className="col-span-9">: {currentUndangan.tempat}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-3">Acara</span>
                    <span className="col-span-9 font-bold">: {currentUndangan.acara}</span>
                  </div>
                </div>

                <div className="text-justify pt-2" style={{ textIndent: '1.25cm' }}>
                  {currentUndangan.paragrafPenutup}
                </div>

                <div className="flex justify-end pt-10 break-inside-avoid">
                  <div className="text-left w-64 space-y-1">
                    <div>Kepala Sekolah,</div>
                    <div className="h-20"></div>
                    <div className="font-bold underline uppercase tracking-wide">{schoolProfile.kepalaSekolah}</div>
                    <div className="pt-0.5 text-zinc-800 font-normal">NIP. {schoolProfile.nipKepalaSekolah}</div>
                  </div>
                </div>

                {currentUndangan.showTembusan && currentUndangan.tembusan.length > 0 && (
                  <div className="pt-8 border-t border-zinc-300 mt-8 text-[11px] break-inside-avoid">
                    <div className="font-bold mb-1">Tembusan disampaikan kepada Yth :</div>
                    <ol className="list-decimal pl-5 space-y-0.5 text-zinc-800">
                      {currentUndangan.tembusan.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================
              10. PRINTABLE BERITA ACARA PENGUMUMAN KELULUSAN (PDF HAL 2)
             ======================================================== */}
          {printDoc === 'ba-kelulusan' && (() => {
            const currentBA = loadBeritaAcaraDocState();
            return (
              <div
                className="space-y-5 text-black"
                style={{
                  fontFamily: getFontCssFamily(currentBA.fontFamily),
                  fontSize: currentBA.fontSize,
                  lineHeight: currentBA.lineSpacing,
                }}
              >
                <KopSurat schoolProfile={schoolProfile} />

                <div className="text-center pt-2 pb-2 space-y-1 leading-snug">
                  <h2 className="text-base sm:text-lg font-black tracking-widest uppercase underline underline-offset-4">
                    {currentBA.judul}
                  </h2>
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase">
                    {currentBA.subJudul.split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx === 0 && <br />}
                      </React.Fragment>
                    ))}
                  </h3>
                  <p className="text-xs font-mono font-bold pt-1">
                    Nomor : {currentBA.nomor}
                  </p>
                </div>

                <div className="text-justify" style={{ textIndent: '1.25cm' }}>
                  Pada hari ini, <b>{currentBA.hariTanggalTerbilang}</b>, bertempat di <b>{currentBA.tempat}</b>, telah diselenggarakan Rapat Musyawarah Dewan Guru yang dipimpin langsung oleh Kepala Sekolah dan dihadiri oleh seluruh Dewan Guru serta Tenaga Kependidikan untuk menentukan kelulusan peserta didik kelas VI (enam) Tahun Pelajaran {currentBA.tahunPelajaranTeks}.
                </div>

                <div className="space-y-2 text-justify pl-6">
                  <p className="font-bold">
                    Berdasarkan hasil musyawarah dan evaluasi menyeluruh terhadap kriteria kelulusan peserta didik, rapat memutuskan dan menetapkan hasil sebagai berikut:
                  </p>
                  <div className="pl-4 space-y-1.5">
                    <div className="grid grid-cols-12">
                      <span className="col-span-1 font-bold">1.</span>
                      <span className="col-span-7">Jumlah Peserta Didik Kelas VI Terdaftar</span>
                      <span className="col-span-4 font-bold">: {currentBA.totalPeserta} (delapan puluh) orang</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-1 font-bold">2.</span>
                      <span className="col-span-7">Jumlah Peserta Didik Mengikuti Ujian Sekolah</span>
                      <span className="col-span-4 font-bold">: {currentBA.totalPeserta} (delapan puluh) orang</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-1 font-bold">3.</span>
                      <span className="col-span-7">Jumlah Peserta Didik Dinyatakan LULUS</span>
                      <span className="col-span-4 font-black text-emerald-900">: {currentBA.pesertaLulus} (delapan puluh) orang (100%)</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-1 font-bold">4.</span>
                      <span className="col-span-7">Jumlah Peserta Didik Dinyatakan TIDAK LULUS</span>
                      <span className="col-span-4 font-bold">: {currentBA.pesertaTidakLulus} (nol) orang (0%)</span>
                    </div>
                    <div className="grid grid-cols-12">
                      <span className="col-span-1 font-bold">5.</span>
                      <span className="col-span-11">
                        Daftar nama-nama peserta didik yang dinyatakan LULUS tercantum dalam lampiran yang merupakan satu kesatuan tidak terpisahkan dari Berita Acara ini.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-justify pt-1" style={{ textIndent: '1.25cm' }}>
                  {currentBA.paragrafPenutup}
                </div>

                <div className="grid grid-cols-2 pt-10 break-inside-avoid">
                  <div>
                    {currentBA.showNotulis && (
                      <div className="text-left w-64 space-y-1">
                        <div>Notulis / Sekretaris Rapat,</div>
                        <div className="h-20"></div>
                        <div className="font-bold underline uppercase">{currentBA.namaNotulis}</div>
                        <div className="pt-0.5 text-zinc-800 font-normal">NIP. {currentBA.nipNotulis}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <div className="text-left w-64 space-y-1">
                      <div>Dibuat di : {currentBA.dibuatDi}</div>
                      <div>Pada Tanggal : {currentBA.padaTanggal}</div>
                      <div className="pt-1 font-bold">Kepala SD Negeri 006 Sungai Buluh,</div>
                      <div className="h-16"></div>
                      <div className="font-bold underline uppercase tracking-wide">
                        {schoolProfile.kepalaSekolah}
                      </div>
                      <div className="pt-0.5 text-zinc-800 font-normal">
                        NIP. {schoolProfile.nipKepalaSekolah}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================
              11. PRINTABLE DAFTAR HADIR RAPAT KELULUSAN (PDF HAL 3)
             ======================================================== */}
          {printDoc === 'hadir-rapat' && (() => {
            const currentGuruList = loadGuruRapatList();
            const hadirMeta = loadHadirRapatMeta();
            return (
              <div className="space-y-4 text-xs font-sans text-black">
                <KopSurat schoolProfile={schoolProfile} />
                <div className="text-center pb-2 space-y-1 border-b border-black pb-2 pt-1">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide underline underline-offset-4 text-black">
                    DAFTAR HADIR RAPAT KELULUSAN KELAS VI
                  </h3>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-black">
                    DEWAN GURU & TENAGA KEPENDIDIKAN SD NEGERI 006 SUNGAI BULUH
                  </h4>
                  <p className="text-xs font-bold text-zinc-700">
                    TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
                  </p>
                </div>

                <div className="grid grid-cols-12 text-[11px] font-medium py-1 px-1 gap-y-1 border-b border-zinc-300 pb-2">
                  <div className="col-span-6 space-y-0.5">
                    <div>Hari / Tanggal : <b>{hadirMeta.rapatTanggal}</b></div>
                    <div>Waktu / Pukul : <b>{hadirMeta.rapatJam}</b></div>
                  </div>
                  <div className="col-span-6 space-y-0.5 text-right">
                    <div>Tempat : <b>{hadirMeta.rapatTempat}</b></div>
                    <div>Jumlah Hadir : <b>{currentGuruList.length} Orang (Lengkap)</b></div>
                  </div>
                </div>

                <table className="w-full text-left text-xs border border-black border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black font-bold text-center bg-zinc-100">
                      <th className="p-2 w-12 border-r border-black">NO</th>
                      <th className="p-2 border-r border-black text-left">NAMA LENGKAP & GELAR</th>
                      <th className="p-2 w-[28%] border-r border-black text-left">JABATAN</th>
                      <th className="p-2 w-[32%] text-center">TANDA TANGAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGuruList.map((g, idx) => {
                      const isOdd = (idx + 1) % 2 !== 0;
                      return (
                        <tr key={g.id || g.no} className="border-b border-black h-8 break-inside-avoid">
                          <td className="p-1.5 text-center font-bold border-r border-black">{idx + 1}.</td>
                          <td className="p-1.5 border-r border-black font-bold uppercase">{g.nama}</td>
                          <td className="p-1.5 border-r border-black text-zinc-800">{g.jabatan}</td>
                          <td className="p-1.5 align-middle overflow-hidden">
                            <div className="grid grid-cols-2 gap-1 items-center h-full px-1 overflow-hidden">
                              <div className="text-left overflow-hidden whitespace-nowrap">
                                {isOdd && (
                                  <span className="font-mono text-[11px] font-bold text-zinc-800">
                                    {formatSignatureDots(idx + 1)}
                                  </span>
                                )}
                              </div>
                              <div className="text-left overflow-hidden whitespace-nowrap pl-1.5">
                                {!isOdd && (
                                  <span className="font-mono text-[11px] font-bold text-zinc-800">
                                    {formatSignatureDots(idx + 1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="flex justify-between pt-6 break-inside-avoid text-xs">
                  <div className="text-left w-56 space-y-1">
                    <div>Notulis / Sekretaris Rapat,</div>
                    <div className="h-16"></div>
                    <div className="font-bold underline uppercase">{hadirMeta.notulisNama}</div>
                    <div className="pt-0.5 text-zinc-700 font-normal">NIP. {hadirMeta.notulisNip}</div>
                  </div>
                  <div className="text-center w-64 space-y-1">
                    <div>{hadirMeta.rapatPengesahanTanggal}</div>
                    <div className="font-bold">Kepala SDN 006 Sungai Buluh</div>
                    <div className="h-16"></div>
                    <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                    <div className="pt-0.5 text-zinc-700 font-normal">NIP. {schoolProfile.nipKepalaSekolah}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================
              12. PRINTABLE SK KELULUSAN KEPALA SEKOLAH (FORMAT KETIKAN WORD)
             ======================================================== */}
          {printDoc === 'sk-kelulusan' && (() => {
            const currentSK = loadSKKelulusanState();
            return (
              <div className="space-y-4 text-xs sm:text-[13px] font-serif text-black leading-relaxed">
                {/* Kop Surat Resmi */}
                <KopSurat schoolProfile={schoolProfile} />

                {/* Judul Keputusan (Word Style) */}
                <div className="text-center pt-1 pb-3 space-y-0.5 leading-snug">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-widest">
                    K E P U T U S A N
                  </h3>
                  <h4 className="text-xs sm:text-sm font-bold uppercase">
                    KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH
                  </h4>
                  <p className="text-xs font-mono font-bold">
                    NOMOR : {currentSK.nomor}
                  </p>
                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-widest">T E N T A N G</p>
                    <p className="text-xs sm:text-sm font-bold uppercase max-w-xl mx-auto">
                      {currentSK.tentang}
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-wide">
                      DENGAN RAHMAT TUHAN YANG MAHA ESA
                    </p>
                    <p className="text-xs font-bold uppercase">
                      KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH,
                    </p>
                  </div>
                </div>

                {/* Konsideran Tabulasi Word */}
                <div className="space-y-3 leading-relaxed text-justify text-xs sm:text-[12px]">
                  <div className="flex items-start">
                    <div className="w-28 sm:w-32 shrink-0 font-bold">Menimbang</div>
                    <div className="w-4 shrink-0 font-bold">:</div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">a.</span>
                        <span className="flex-1">{currentSK.menimbangA}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">b.</span>
                        <span className="flex-1">{currentSK.menimbangB}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">c.</span>
                        <span className="flex-1">{currentSK.menimbangC}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-28 sm:w-32 shrink-0 font-bold">Mengingat</div>
                    <div className="w-4 shrink-0 font-bold">:</div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">1.</span>
                        <span className="flex-1">{currentSK.mengingat1}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">2.</span>
                        <span className="flex-1">{currentSK.mengingat2}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">3.</span>
                        <span className="flex-1">{currentSK.mengingat3}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">4.</span>
                        <span className="flex-1">{currentSK.mengingat4}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-28 sm:w-32 shrink-0 font-bold">Memperhatikan</div>
                    <div className="w-4 shrink-0 font-bold">:</div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">1.</span>
                        <span className="flex-1">{currentSK.memperhatikan1}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-5 shrink-0">2.</span>
                        <span className="flex-1">{currentSK.memperhatikan2}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center font-bold pt-2 pb-1 tracking-widest text-xs sm:text-sm">
                    M E M U T U S K A N :
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="w-28 sm:w-32 shrink-0 font-bold">Menetapkan</div>
                      <div className="w-4 shrink-0 font-bold">:</div>
                      <div className="flex-1 font-bold uppercase">
                        KEPUTUSAN KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH TENTANG {currentSK.tentang}.
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-28 sm:w-32 shrink-0 font-bold">KESATU</div>
                      <div className="w-4 shrink-0 font-bold">:</div>
                      <div className="flex-1">{currentSK.diktumKesatu}</div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-28 sm:w-32 shrink-0 font-bold">KEDUA</div>
                      <div className="w-4 shrink-0 font-bold">:</div>
                      <div className="flex-1">{currentSK.diktumKedua}</div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-28 sm:w-32 shrink-0 font-bold">KETIGA</div>
                      <div className="w-4 shrink-0 font-bold">:</div>
                      <div className="flex-1">{currentSK.diktumKetiga}</div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-28 sm:w-32 shrink-0 font-bold">KEEMPAT</div>
                      <div className="w-4 shrink-0 font-bold">:</div>
                      <div className="flex-1">{currentSK.diktumKeempat}</div>
                    </div>
                  </div>
                </div>

                {currentSK.showTandaTangan !== false && (
                  <div className="flex justify-end pt-8 break-inside-avoid print:break-inside-avoid">
                    <div className="w-72 space-y-1 text-xs sm:text-[12px]">
                      <div className="grid grid-cols-5">
                        <span className="col-span-2">Ditetapkan di</span>
                        <span className="col-span-3">: {currentSK.ditetapkanDi || schoolProfile.tempatCetak || 'Sungai Buluh'}</span>
                      </div>
                      <div className="grid grid-cols-5">
                        <span className="col-span-2">Pada Tanggal</span>
                        <span className="col-span-3">: {currentSK.padaTanggal || schoolProfile.tanggalKelulusan || '30 Mei 2026'}</span>
                      </div>
                      <div className="pt-2 font-bold">{currentSK.jabatanKepalaSekolah || 'Kepala SD Negeri 006 Sungai Buluh,'}</div>
                      <div className="h-20"></div>
                      <div className="font-bold underline uppercase">
                        {currentSK.namaKepalaSekolah || schoolProfile.kepalaSekolah || 'WINARNI, S.Pd.SD'}
                      </div>
                      <div className="pt-0.5 font-mono text-zinc-900 font-normal">
                        NIP. {currentSK.nipKepalaSekolah || schoolProfile.nipKepalaSekolah || '19790301 200801 2 015'}
                      </div>
                    </div>
                  </div>
                )}

                {currentSK.showTembusan && (
                  <div className="pt-6 border-t border-zinc-300 mt-6 text-[11px] break-inside-avoid">
                    <div className="font-bold mb-1">Tembusan disampaikan kepada Yth :</div>
                    <ol className="list-decimal pl-5 space-y-0.5 text-zinc-800">
                      <li>Kepala Dinas Pendidikan Kepemudaan dan Olahraga Kab. Kuantan Singingi;</li>
                      <li>Koordinator Wilayah Bidang Pendidikan Kec. Singingi Hilir;</li>
                      <li>Ketua Komite SD Negeri 006 Sungai Buluh;</li>
                      <li>Yang bersangkutan untuk diketahui;</li>
                      <li>Arsip Sekolah.</li>
                    </ol>
                  </div>
                )}

                {/* Lampiran Rekap Nilai jika diaktifkan */}
                {currentSK.showLampiran && (
                  <div className="pt-8 border-t-2 border-black mt-8 space-y-3 break-before-page font-sans">
                    <div className="text-center space-y-1">
                      <p className="text-[11px] font-bold uppercase">
                        LAMPIRAN KEPUTUSAN KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH
                      </p>
                      <p className="font-mono text-[10px]">NOMOR : {currentSK.nomor}</p>
                      <p className="text-xs font-extrabold uppercase">
                        DAFTAR PESERTA DIDIK KELAS VI YANG DINYATAKAN LULUS & REKAPITULASI NILAI AKHIR
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        Tahun Pelajaran {schoolProfile.tahunPelajaran} • Bobot: {schoolProfile.bobotRapor}% Rata Rapor + {schoolProfile.bobotUS}% Ujian Sekolah • KKM: {schoolProfile.kkmKelulusan}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border border-black border-collapse">
                        <thead>
                          <tr className="bg-zinc-100 font-bold border-b border-black">
                            <th className="p-1.5 w-8 text-center border-r border-black">No</th>
                            <th className="p-1.5 min-w-[100px] border-r border-black">No. Peserta</th>
                            <th className="p-1.5 min-w-[80px] border-r border-black">NISN</th>
                            <th className="p-1.5 min-w-[170px] border-r border-black">Nama Lengkap</th>
                            <th className="p-1.5 text-center w-8 border-r border-black">L/P</th>
                            <th className="p-1.5 text-center w-16 border-r border-black">Total NA</th>
                            <th className="p-1.5 text-center w-16 border-r border-black">Rata NA</th>
                            <th className="p-1.5 text-center w-16">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s, idx) => {
                            const totalNA = calculateStudentTotalFinalScore(s, schoolProfile, subjects);
                            const avgNA = calculateStudentOverallFinalScore(s, schoolProfile, subjects);
                            return (
                              <tr key={s.id} className="border-b border-zinc-300 break-inside-avoid">
                                <td className="p-1 text-center font-bold border-r border-black">{idx + 1}</td>
                                <td className="p-1 font-mono border-r border-black">{s.noPeserta}</td>
                                <td className="p-1 font-mono border-r border-black">{s.nisn}</td>
                                <td className="p-1 font-bold uppercase border-r border-black">{s.nama}</td>
                                <td className="p-1 text-center border-r border-black">{s.jenisKelamin}</td>
                                <td className="p-1 text-center font-mono font-bold border-r border-black">{totalNA.toFixed(1)}</td>
                                <td className="p-1 text-center font-mono font-bold text-emerald-800 border-r border-black">{avgNA.toFixed(2)}</td>
                                <td className="p-1 text-center font-bold text-emerald-800">LULUS</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pengesahan Titimangsa & Penandatangan Kepala Sekolah pada Lampiran */}
                    <div className="flex justify-end pt-6 break-inside-avoid print:break-inside-avoid text-xs">
                      <div className="w-64 space-y-1 text-center">
                        <div>Sungai Buluh, {currentSK.padaTanggal || schoolProfile.tanggalKelulusan || '30 Mei 2026'}</div>
                        <div className="font-bold">{currentSK.jabatanKepalaSekolah || 'Kepala SD Negeri 006 Sungai Buluh'}</div>
                        <div className="h-16"></div>
                        <div className="font-bold underline uppercase">{currentSK.namaKepalaSekolah || schoolProfile.kepalaSekolah || 'WINARNI, S.Pd.SD'}</div>
                        <div className="pt-0.5 font-mono text-zinc-900 tracking-normal font-normal">
                          NIP. {currentSK.nipKepalaSekolah || schoolProfile.nipKepalaSekolah || '19790301 200801 2 015'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </PrintPreviewModal>

      {/* Modal Ubah/Edit Data Dokumen Kelulusan (Navigasi Lembar Kerja) */}
      <EditGraduationDocModal
        isOpen={isEditGradModalOpen}
        onClose={() => setIsEditGradModalOpen(false)}
        currentDocType={gradModalDocType}
        onDocTypeChange={(doc) => {
          setGradModalDocType(doc);
          if (['undangan', 'ba-kelulusan', 'hadir-rapat', 'sk-kelulusan'].includes(printDoc)) {
            setPrintDoc(doc as any);
          }
        }}
        onDataSaved={() => {
          setLastUpdateTrigger(Date.now());
          if (showToast) {
            showToast(
              'Data Dokumen Diperbarui',
              'Perubahan naskah dokumen kelulusan berhasil disimpan dan diterapkan pada lembar cetak.',
              'success'
            );
          }
        }}
        showToast={showToast}
      />

      {/* Modal Edit Pengawas TPU VI */}
      <EditPengawasModal
        isOpen={isEditPengawasOpen}
        onClose={() => setIsEditPengawasOpen(false)}
        supervisors={supervisors}
        onSave={(updatedList) => {
          setSupervisorsList(updatedList);
          setLastUpdateTrigger(Date.now());
        }}
        tpuLeader={tpuLeader}
        onSaveLeader={handleSaveTpuLeader}
        onResetDefault={resetSupervisorsToDefault}
        showToast={showToast}
      />

      {/* Modal Edit Susunan Panitia */}
      <EditPanitiaModal
        isOpen={isEditPanitiaOpen}
        onClose={() => setIsEditPanitiaOpen(false)}
        committee={committee}
        onSave={(updatedList) => {
          setCommitteeList(updatedList);
          setLastUpdateTrigger(Date.now());
        }}
        panitiaMeta={panitiaMeta}
        onSaveMeta={handleSavePanitiaMeta}
        onResetDefault={resetCommitteeToDefault}
        showToast={showToast}
      />

      {/* Modal Edit Berita Acara Pelaksanaan Ujian */}
      <EditBeritaAcaraPelaksanaanModal
        isOpen={isEditBeritaPelaksanaanOpen}
        onClose={() => setIsEditBeritaPelaksanaanOpen(false)}
        data={beritaAcaraState}
        onSave={(updated) => {
          handleSaveBeritaAcaraState(updated);
          setLastUpdateTrigger(Date.now());
        }}
        currentRoom={selectedRoom}
        roomStudentsCount={roomStudents.length}
        schoolName={schoolProfile.namaSekolah}
        roomSupervisors={roomSupervisors}
        subjectsList={subjects}
        showToast={showToast}
      />
    </div>
  );
};
