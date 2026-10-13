import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { StudentModal } from './StudentModal';
import { StudentDetailModal } from './StudentDetailModal';
import { ImportStudentModal } from './ImportStudentModal';
import { Badge } from '../common/Badge';
import { KopSurat } from '../common/KopSurat';
import { PrintPreviewModal } from '../common/PrintPreviewModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Camera,
  FileText,
  X,
  CheckCircle,
} from 'lucide-react';
import { calculateStudentOverallFinalScore } from '../../constants/subjects';

export const StudentManagementView: React.FC = () => {
  const {
    students,
    deleteStudent,
    setSelectedStudentForDetail,
    setSelectedStudentForSKHU,
    setActiveTab,
    schoolProfile,
    exportToCSV,
    downloadStudentExcelTemplate,
    downloadStudentCSVTemplate,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'meja' | 'nama' | 'nilai'>('meja');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Print menu state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<'dnt' | 'biodata' | 'presensi' | 'rekap'>('dnt');
  const [printRoom, setPrintRoom] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter students for UI table
  const filteredStudents = students
    .filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        s.noPeserta.toLowerCase().includes(search.toLowerCase()) ||
        s.nisn.includes(search);
      const matchRoom = selectedRoom === 'ALL' || s.ruang === selectedRoom;
      const matchGender = selectedGender === 'ALL' || s.jenisKelamin === selectedGender;
      return matchSearch && matchRoom && matchGender;
    })
    .sort((a, b) => {
      if (sortBy === 'meja') {
        if (a.ruang !== b.ruang) return a.ruang.localeCompare(b.ruang);
        return a.noMeja - b.noMeja;
      }
      if (sortBy === 'nama') {
        return a.nama.localeCompare(b.nama);
      }
      if (sortBy === 'nilai') {
        const scoreA = calculateStudentOverallFinalScore(a, schoolProfile);
        const scoreB = calculateStudentOverallFinalScore(b, schoolProfile);
        return scoreB - scoreA;
      }
      return 0;
    });

  // Students for printing
  const printStudents = students
    .filter((s) => printRoom === 'ALL' || s.ruang === printRoom)
    .sort((a, b) => {
      if (a.ruang !== b.ruang) return a.ruang.localeCompare(b.ruang);
      return a.noMeja - b.noMeja;
    });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (s: Student) => {
    setStudentToEdit(s);
    setIsModalOpen(true);
  };

  const handleDelete = (s: Student) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data peserta "${s.nama}"?`)) {
      deleteStudent(s.id);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Data Pokok Peserta Ujian Nasional (Data PD)
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Total {students.length} peserta terdaftar di SDN 006 Sungai Buluh, Singingi Hilir
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('student-photos')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
            title="Kelola pas foto resmi siswa untuk denah, kartu ujian, dan ijazah"
          >
            <Camera className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            Foto Siswa ({students.filter((s) => Boolean(s.foto)).length}/{students.length})
          </button>
          <button
            onClick={downloadStudentExcelTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 transition-colors"
            title="Unduh format template Excel (.xlsx) untuk data siswa"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Template Excel (.xlsx)
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
            title="Impor data siswa dari berkas Excel (.xlsx) / CSV"
          >
            <Upload className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            Impor Data Siswa
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-colors"
            title="Buka menu cetak daftar peserta ujian (DNT, Biodata, Presensi)"
          >
            <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Menu Cetak Peserta
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 transition-colors"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            Ekspor CSV
          </button>
          <button
            onClick={() => {
              setStudentToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Peserta Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari Nama / NISN / No Ujian..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          />
        </div>

        {/* Room Filter */}
        <div className="relative">
          <select
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs font-semibold text-zinc-800 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">Semua Ruang (R1 - R4)</option>
            <option value="RUANG 1">RUANG 1</option>
            <option value="RUANG 2">RUANG 2</option>
            <option value="RUANG 3">RUANG 3</option>
            <option value="RUANG 4">RUANG 4</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div className="relative">
          <select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs font-semibold text-zinc-800 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">Semua Jenis Kelamin</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs font-semibold text-zinc-800 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="meja">Urutkan: Ruang & Nomor Meja</option>
            <option value="nama">Urutkan: Nama Siswa (A - Z)</option>
            <option value="nilai">Urutkan: Nilai Akhir Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Nama Peserta Ujian</th>
                <th className="p-3.5">No. Peserta / NISN</th>
                <th className="p-3.5">L/P</th>
                <th className="p-3.5">Tempat & Tanggal Lahir</th>
                <th className="p-3.5">Ruang & Meja</th>
                <th className="p-3.5">No. Ijazah</th>
                <th className="p-3.5">No. Surat Kelulusan</th>
                <th className="p-3.5">No. Surat Transkrip Nilai</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-zinc-500">
                    Tidak ada data siswa yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, idx) => {
                  const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="p-3.5 text-center font-bold text-zinc-500">{globalIdx}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                            {s.foto ? (
                              <img src={s.foto} alt={s.nama} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs">{s.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                            )}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForDetail(s)}
                              className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-400 text-left transition-colors"
                            >
                              {s.nama}
                            </button>
                            <div className="text-[11px] text-zinc-500">{s.alamat}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-zinc-700 dark:text-zinc-300">
                        <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                          {s.noPeserta}
                        </div>
                        <div className="text-[10px] text-zinc-400">NISN: {s.nisn}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            s.jenisKelamin === 'L'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                          }`}
                        >
                          {s.jenisKelamin}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-700 dark:text-zinc-300">
                        <div>{s.tempatLahir}</div>
                        <div className="text-[11px] text-zinc-400">{s.tanggalLahir}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{s.ruang}</div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          Meja #{s.noMeja}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                        {s.noSeriIjazah || '-'}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-700 dark:text-zinc-300">
                        {s.noSuratKelulusan || '-'}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-700 dark:text-zinc-300">
                        {s.noSuratTranskrip || '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge variant="emerald" size="sm">
                          {s.statusKelulusan}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDetail(s)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-emerald-700 dark:hover:bg-zinc-800 dark:hover:text-emerald-400 transition-colors"
                            title="Lihat Profil Lengkap"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(s)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400 transition-colors"
                            title="Edit Biodata"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-zinc-800 dark:hover:text-rose-400 transition-colors"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} peserta
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
            </button>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 px-2">
              Hal {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Berikutnya <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentToEdit={studentToEdit}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal />

      {/* Import Student Modal */}
      <ImportStudentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* ========================================================
          PRINT PREVIEW MODAL: MENU CETAK DATA PESERTA UJIAN
         ======================================================== */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Menu Cetak & Pratinjau: Data Peserta Ujian"
        subtitle={`SDN 006 Sungai Buluh • ${printStudents.length} Peserta (${printRoom === 'ALL' ? 'Semua Ruangan' : printRoom})`}
        defaultOrientation={printFormat === 'dnt' ? 'landscape' : 'portrait'}
        toolbarExtra={
          <div className="flex flex-wrap items-center gap-2">
            {/* Format Selector */}
            <div className="flex items-center rounded-xl border border-zinc-700 bg-zinc-800 p-0.5 text-xs text-zinc-300">
              {[
                { key: 'dnt', label: 'DNT Resmi' },
                { key: 'biodata', label: 'Biodata & Foto' },
                { key: 'presensi', label: 'Presensi Peserta' },
                { key: 'rekap', label: 'Rekap Ruangan' },
              ].map((fmt) => (
                <button
                  key={fmt.key}
                  type="button"
                  onClick={() => setPrintFormat(fmt.key as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    printFormat === fmt.key
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            {/* Room Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 font-semibold hidden sm:inline">Ruang:</span>
              <select
                value={printRoom}
                onChange={(e) => setPrintRoom(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Ruangan</option>
                <option value="RUANG 1">Ruang 1</option>
                <option value="RUANG 2">Ruang 2</option>
                <option value="RUANG 3">Ruang 3</option>
                <option value="RUANG 4">Ruang 4</option>
              </select>
            </div>
          </div>
        }
      >
        <div className="space-y-5 text-xs text-black">
          {/* Kop Surat Resmi */}
          <KopSurat schoolProfile={schoolProfile} variant="compact" />

          {/* Judul Dokumen */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-extrabold uppercase tracking-wide underline text-black">
              {printFormat === 'dnt' && 'DAFTAR NOMINASI TETAP (DNT) PESERTA UJIAN SEKOLAH / UJIAN NASIONAL'}
              {printFormat === 'biodata' && 'LEMBAR BIODATA DAN PAS FOTO RESMI PESERTA UJIAN'}
              {printFormat === 'presensi' && 'DAFTAR HADIR & VERIFIKASI PESERTA UJIAN NASIONAL'}
              {printFormat === 'rekap' && 'REKAPITULASI JUMLAH PESERTA UJIAN PER RUANGAN'}
            </h3>
            <p className="text-xs font-bold text-zinc-700">
              {schoolProfile.namaSekolah} • TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
              {printRoom !== 'ALL' && ` • ${printRoom}`}
            </p>
          </div>

          {/* 1. Format DNT (Tabel Lengkap) */}
          {printFormat === 'dnt' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-black text-black font-bold">
                    <th className="p-2 w-8 text-center border-r border-black">No</th>
                    <th className="p-2 min-w-[110px] border-r border-black">No. Peserta</th>
                    <th className="p-2 min-w-[85px] border-r border-black">NISN / NIS</th>
                    <th className="p-2 min-w-[160px] border-r border-black">Nama Lengkap Siswa</th>
                    <th className="p-2 text-center w-10 border-r border-black">L/P</th>
                    <th className="p-2 min-w-[130px] border-r border-black">Tempat, Tgl Lahir</th>
                    <th className="p-2 min-w-[110px] border-r border-black">Nama Orang Tua</th>
                    <th className="p-2 text-center min-w-[85px]">Ruang (Meja)</th>
                  </tr>
                </thead>
                <tbody>
                  {printStudents.map((s, idx) => (
                    <tr key={s.id} className="border-b border-black break-inside-avoid h-8">
                      <td className="p-1.5 text-center font-bold border-r border-black">{idx + 1}</td>
                      <td className="p-1.5 font-mono font-bold border-r border-black">{s.noPeserta}</td>
                      <td className="p-1.5 font-mono text-[11px] border-r border-black">{s.nisn}</td>
                      <td className="p-1.5 font-bold uppercase border-r border-black">{s.nama}</td>
                      <td className="p-1.5 text-center font-semibold border-r border-black">{s.jenisKelamin}</td>
                      <td className="p-1.5 border-r border-black text-[11px]">{s.tempatLahir}, {s.tanggalLahir}</td>
                      <td className="p-1.5 border-r border-black text-[11px]">{s.namaAyah}</td>
                      <td className="p-1.5 text-center font-bold">{s.ruang} (#{s.noMeja})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Format Biodata & Pas Foto */}
          {printFormat === 'biodata' && (
            <div className="grid grid-cols-2 gap-3.5">
              {printStudents.map((s, idx) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-black p-3 flex gap-3 items-center break-inside-avoid bg-white"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded border border-black bg-zinc-100 flex items-center justify-center">
                    {s.foto ? (
                      <img src={s.foto} alt={s.nama} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl">{s.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5 text-[11px] min-w-0">
                    <div className="font-extrabold uppercase text-black truncate">{s.nama}</div>
                    <div className="font-mono text-zinc-800 font-bold">{s.noPeserta}</div>
                    <div className="text-zinc-700">NISN: {s.nisn} • {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                    <div className="text-zinc-600 truncate">{s.tempatLahir}, {s.tanggalLahir}</div>
                    <div className="text-zinc-600 truncate">Ortu: {s.namaAyah}</div>
                    <div className="font-bold text-black">{s.ruang} • No. Meja #{s.noMeja}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Format Presensi & Ceklis */}
          {printFormat === 'presensi' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead>
                  <tr className="bg-zinc-100 font-bold border-b border-black">
                    <th className="p-2 w-8 text-center border-r border-black">No</th>
                    <th className="p-2 min-w-[110px] border-r border-black">No. Peserta</th>
                    <th className="p-2 min-w-[180px] border-r border-black">Nama Peserta Didik</th>
                    <th className="p-2 text-center w-12 border-r border-black">L/P</th>
                    <th className="p-2 text-center min-w-[130px] border-r border-black">Tanda Tangan Ganjil</th>
                    <th className="p-2 text-center min-w-[130px] border-r border-black">Tanda Tangan Genap</th>
                    <th className="p-2 text-center min-w-[80px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {printStudents.map((s, idx) => (
                    <tr key={s.id} className="h-11 border-b border-black break-inside-avoid">
                      <td className="p-2 text-center font-bold border-r border-black">{idx + 1}</td>
                      <td className="p-2 font-mono font-semibold border-r border-black">{s.noPeserta}</td>
                      <td className="p-2 font-bold uppercase border-r border-black">{s.nama}</td>
                      <td className="p-2 text-center border-r border-black">{s.jenisKelamin}</td>
                      <td className="p-2 border-r border-black">
                        {idx % 2 === 0 ? <span className="text-[10px] text-zinc-500">{idx + 1}. ....................</span> : ''}
                      </td>
                      <td className="p-2 border-r border-black">
                        {idx % 2 !== 0 ? <span className="text-[10px] text-zinc-500">{idx + 1}. ....................</span> : ''}
                      </td>
                      <td className="p-2 text-center font-bold text-[10px]">HADIR</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Format Rekapitulasi Jumlah Ruangan */}
          {printFormat === 'rekap' && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead>
                  <tr className="bg-zinc-100 font-bold border-b border-black">
                    <th className="p-2.5 text-center w-12 border-r border-black">No</th>
                    <th className="p-2.5 min-w-[140px] border-r border-black">Ruangan Ujian</th>
                    <th className="p-2.5 text-center min-w-[100px] border-r border-black">Laki-laki (L)</th>
                    <th className="p-2.5 text-center min-w-[100px] border-r border-black">Perempuan (P)</th>
                    <th className="p-2.5 text-center min-w-[110px] border-r border-black">Total Siswa</th>
                    <th className="p-2.5 min-w-[140px]">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {(['RUANG 1', 'RUANG 2', 'RUANG 3', 'RUANG 4'] as const).map((r, idx) => {
                    const rStudents = students.filter((s) => s.ruang === r);
                    const lCount = rStudents.filter((s) => s.jenisKelamin === 'L').length;
                    const pCount = rStudents.filter((s) => s.jenisKelamin === 'P').length;
                    return (
                      <tr key={r} className="border-b border-black h-9 break-inside-avoid">
                        <td className="p-2 text-center font-bold border-r border-black">{idx + 1}</td>
                        <td className="p-2 font-bold border-r border-black">{r}</td>
                        <td className="p-2 text-center font-mono border-r border-black">{lCount} siswa</td>
                        <td className="p-2 text-center font-mono border-r border-black">{pCount} siswa</td>
                        <td className="p-2 text-center font-mono font-bold border-r border-black">{rStudents.length} siswa</td>
                        <td className="p-2 text-xs">Kapasitas Maksimal 20 Meja</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-zinc-100 font-black border-t-2 border-black">
                    <td colSpan={2} className="p-2.5 text-center border-r border-black uppercase">
                      Total Seluruh Ruangan
                    </td>
                    <td className="p-2.5 text-center font-mono border-r border-black">
                      {students.filter((s) => s.jenisKelamin === 'L').length} siswa
                    </td>
                    <td className="p-2.5 text-center font-mono border-r border-black">
                      {students.filter((s) => s.jenisKelamin === 'P').length} siswa
                    </td>
                    <td className="p-2.5 text-center font-mono font-black border-r border-black">
                      {students.length} siswa
                    </td>
                    <td className="p-2.5 text-xs">Status: Lengkap & Siap Ujian</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Rekapitulasi Ringkasan */}
          <div className="flex items-center justify-between border-t border-black pt-3 text-xs">
            <div className="space-x-5 font-medium">
              <span>Laki-laki (L): <b>{printStudents.filter((s) => s.jenisKelamin === 'L').length}</b></span>
              <span>Perempuan (P): <b>{printStudents.filter((s) => s.jenisKelamin === 'P').length}</b></span>
              <span>Total Peserta: <b>{printStudents.length} siswa</b></span>
            </div>
            <div className="text-[11px] text-zinc-500">
              Dicetak tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Tanda Tangan Resmi (Ketua Panitia & Kepala Sekolah) */}
          <div className="grid grid-cols-2 pt-6 text-xs break-inside-avoid">
            <div>
              <p className="font-semibold text-zinc-800">Ketua Panitia Ujian,</p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase text-black">{schoolProfile.ketuaPanitia}</p>
              <p className="font-mono text-[11px] text-zinc-700">NIP. {schoolProfile.nipKetuaPanitia}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-700">{schoolProfile.tempatCetak || 'Sungai Buluh'}, {schoolProfile.tanggalKelulusan}</p>
              <p className="font-bold text-black">Kepala {schoolProfile.namaSekolah},</p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase text-black">{schoolProfile.kepalaSekolah}</p>
              <p className="font-mono text-[11px] text-zinc-700">NIP. {schoolProfile.nipKepalaSekolah}</p>
            </div>
          </div>
        </div>
      </PrintPreviewModal>
    </div>
  );
};
