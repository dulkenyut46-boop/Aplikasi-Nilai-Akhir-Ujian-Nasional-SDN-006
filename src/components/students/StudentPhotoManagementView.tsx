import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { generateStudentPhotoSvg } from '../../utils/studentAvatars';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Layers,
  Sparkles,
  Printer,
  Grid,
  List,
  FileCheck2,
  Users,
  X,
  ExternalLink,
} from 'lucide-react';

export const StudentPhotoManagementView: React.FC = () => {
  const {
    students,
    updateStudentPhoto,
    batchUpdateStudentPhotos,
    applyDefaultOfficialAvatars,
    clearAllStudentPhotos,
    setActiveTab,
    schoolProfile,
    showToast,
  } = useApp();

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<'ALL' | 'RUANG 1' | 'RUANG 2' | 'RUANG 3' | 'RUANG 4'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WITH_PHOTO' | 'NO_PHOTO'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [singleUploadStudent, setSingleUploadStudent] = useState<Student | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);

  // Stats
  const totalStudents = students.length;
  const studentsWithPhoto = students.filter((s) => Boolean(s.foto)).length;
  const studentsWithoutPhoto = totalStudents - studentsWithPhoto;
  const photoPercent = totalStudents > 0 ? Math.round((studentsWithPhoto / totalStudents) * 100) : 0;

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      !search.trim() ||
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.noPeserta.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.includes(search) ||
      s.nis.includes(search);

    const matchRoom = selectedRoom === 'ALL' || s.ruang === selectedRoom;
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'WITH_PHOTO' && Boolean(s.foto)) ||
      (statusFilter === 'NO_PHOTO' && !s.foto);
    const matchGender = genderFilter === 'ALL' || s.jenisKelamin === genderFilter;

    return matchSearch && matchRoom && matchStatus && matchGender;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Menu Tambah & Kelola Pas Foto Siswa
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Format pas foto resmi (2x3 & 3x4) terintegrasi otomatis untuk Denah Meja Ujian, Kartu Peserta UN, dan SKHU/Ijazah SDN 006 Sungai Buluh
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBatchModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Unggah Foto Massal (Batch)
          </button>

          <button
            type="button"
            onClick={applyDefaultOfficialAvatars}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
            title="Pasang pas foto avatar resmi seragam SD otomatis untuk seluruh siswa"
          >
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Pasang Avatar Resmi Otomatis
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin menghapus seluruh foto siswa? Siswa akan kembali ke mode tanpa foto.')) {
                clearAllStudentPhotos();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus Semua
          </button>
        </div>
      </div>

      {/* 2. Key Stats & Destination Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total & Progress */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase">Kelengkapan Foto</span>
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
              {photoPercent}%
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {studentsWithPhoto}
              </span>
              <span className="text-xs text-zinc-400 font-semibold">/ {totalStudents} Siswa</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${photoPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Integration Card 1: Denah Ruang */}
        <div
          onClick={() => setActiveTab('exam-tools')}
          className="cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs hover:border-emerald-400 dark:border-emerald-800/60 dark:bg-emerald-950/20 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Denah Ruang Ujian
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-emerald-600 opacity-60 group-hover:opacity-100" />
          </div>
          <p className="mt-2 text-xs font-medium text-emerald-950 dark:text-emerald-200">
            Foto siswa otomatis tampil di meja peserta Ruang 1 s.d 4
          </p>
          <div className="mt-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            Buka Denah Ruang →
          </div>
        </div>

        {/* Integration Card 2: Kartu Peserta UN */}
        <div
          onClick={() => setActiveTab('exam-tools')}
          className="cursor-pointer rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs hover:border-blue-400 dark:border-blue-800/60 dark:bg-blue-950/20 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Kartu Peserta UN
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-blue-600 opacity-60 group-hover:opacity-100" />
          </div>
          <p className="mt-2 text-xs font-medium text-blue-950 dark:text-blue-200">
            Pas foto resmi 2x3 tercetak di kartu ujian standar DNT dinas
          </p>
          <div className="mt-2 text-[11px] font-bold text-blue-700 dark:text-blue-400">
            Buka Kartu Ujian →
          </div>
        </div>

        {/* Integration Card 3: Ijazah & SKHU */}
        <div
          onClick={() => setActiveTab('diploma')}
          className="cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs hover:border-amber-400 dark:border-amber-800/60 dark:bg-amber-950/20 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5" />
              SKHU & Buku Ijazah
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-amber-600 opacity-60 group-hover:opacity-100" />
          </div>
          <p className="mt-2 text-xs font-medium text-amber-950 dark:text-amber-200">
            Pas foto 3x4 resmi dengan stempel cap tiga jari pada transkrip
          </p>
          <div className="mt-2 text-[11px] font-bold text-amber-700 dark:text-amber-400">
            Buka Lembar SKHU →
          </div>
        </div>
      </div>

      {/* 3. Search & Filtering Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nama, NISN, no peserta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Ruang Filter */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value as any)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">Semua Ruangan</option>
            <option value="RUANG 1">Ruang 1</option>
            <option value="RUANG 2">Ruang 2</option>
            <option value="RUANG 3">Ruang 3</option>
            <option value="RUANG 4">Ruang 4</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">Semua Status Foto</option>
            <option value="WITH_PHOTO">Sudah Ada Foto ({studentsWithPhoto})</option>
            <option value="NO_PHOTO">Belum Ada Foto ({studentsWithoutPhoto})</option>
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <option value="ALL">Semua Jenis Kelamin</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-end md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
            title="Tampilan Galeri Pas Foto"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-zinc-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
            title="Tampilan Tabel Ringkas"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4. Main Gallery / Table Display */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Camera className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Tidak ada data siswa ditemukan
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Coba sesuaikan kata kunci pencarian atau filter ruangan/status foto Anda.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: PAS FOTO CARDS */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredStudents.map((s) => {
            const hasPhoto = Boolean(s.foto);
            return (
              <div
                key={s.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-3 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                    {s.ruang.replace('RUANG ', 'R')} • M{s.noMeja}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      s.jenisKelamin === 'L'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                        : 'bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200'
                    }`}
                  >
                    {s.jenisKelamin}
                  </span>
                </div>

                {/* Photo Frame Container (2x3 or 3x4 ratio) */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  {hasPhoto ? (
                    <>
                      <img
                        src={s.foto}
                        alt={s.nama}
                        className="h-full w-full object-cover"
                      />
                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        <button
                          type="button"
                          onClick={() => setPreviewStudent(s)}
                          className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-zinc-900 hover:bg-white transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          Pratinjau
                        </button>
                        <button
                          type="button"
                          onClick={() => setSingleUploadStudent(s)}
                          className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 transition-colors"
                        >
                          <Camera className="h-3 w-3" />
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStudentPhoto(s.id, null)}
                          className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600/90 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-700 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          Hapus
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Empty Placeholder Frame */
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <div className="text-2xl mb-1">{s.jenisKelamin === 'L' ? '👦' : '👧'}</div>
                      <span className="text-[9px] font-extrabold uppercase text-zinc-400">
                        PAS FOTO
                      </span>
                      <span className="text-[8px] text-zinc-400">2x3 / 3x4</span>
                      <button
                        type="button"
                        onClick={() => setSingleUploadStudent(s)}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-800 transition-colors"
                      >
                        <Camera className="h-3 w-3" />
                        Tambah
                      </button>
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="mt-2 text-center">
                  <div className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase truncate" title={s.nama}>
                    {s.nama}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-400 truncate">
                    {s.noPeserta}
                  </div>
                  <div className="text-[9px] text-zinc-400">NISN: {s.nisn}</div>
                </div>

                {/* Footer Quick Status Button */}
                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px]">
                  {hasPhoto ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Ada Foto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3" />
                      Belum
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSingleUploadStudent(s)}
                    className="font-bold text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3 text-center w-12">No</th>
                  <th className="p-3 w-20 text-center">Pas Foto</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3 font-mono">No. Peserta UN</th>
                  <th className="p-3 font-mono">NISN / NIS</th>
                  <th className="p-3 text-center">Ruang & Meja</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredStudents.map((s, idx) => {
                  const hasPhoto = Boolean(s.foto);
                  return (
                    <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-3 text-center text-zinc-400 font-medium">{idx + 1}</td>
                      <td className="p-3 text-center">
                        <div className="mx-auto h-12 w-9 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          {hasPhoto ? (
                            <img src={s.foto} alt={s.nama} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-base">{s.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold uppercase text-zinc-900 dark:text-zinc-100">
                          {s.nama}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        {s.noPeserta}
                      </td>
                      <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">
                        {s.nisn} / {s.nis}
                      </td>
                      <td className="p-3 text-center font-bold text-zinc-700 dark:text-zinc-300">
                        {s.ruang} • Meja {s.noMeja}
                      </td>
                      <td className="p-3 text-center">
                        {hasPhoto ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Ada Foto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <AlertCircle className="h-3 w-3" />
                            Belum Ada
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSingleUploadStudent(s)}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                          >
                            {hasPhoto ? 'Ganti' : 'Unggah'}
                          </button>
                          {hasPhoto && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPreviewStudent(s)}
                                className="rounded-lg bg-zinc-100 p-1 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                                title="Pratinjau"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStudentPhoto(s.id, null)}
                                className="rounded-lg bg-rose-50 p-1 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                                title="Hapus Foto"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SINGLE STUDENT PHOTO UPLOAD MODAL */}
      {singleUploadStudent && (
        <SinglePhotoModal
          student={singleUploadStudent}
          onClose={() => setSingleUploadStudent(null)}
          onSave={(foto) => {
            updateStudentPhoto(singleUploadStudent.id, foto);
            setSingleUploadStudent(null);
          }}
        />
      )}

      {/* 6. BATCH MULTI-PHOTO UPLOAD MODAL */}
      {isBatchModalOpen && (
        <BatchPhotoModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          students={students}
          onApply={(updates) => {
            batchUpdateStudentPhotos(updates);
            setIsBatchModalOpen(false);
          }}
        />
      )}

      {/* 7. LIVE SIMULATED PREVIEW MODAL (KARTU & DENAH) */}
      {previewStudent && (
        <StudentCardPreviewModal
          student={previewStudent}
          schoolProfile={schoolProfile}
          onClose={() => setPreviewStudent(null)}
          onEditPhoto={() => {
            const target = previewStudent;
            setPreviewStudent(null);
            setSingleUploadStudent(target);
          }}
        />
      )}
    </div>
  );
};

// ==========================================
// Subcomponent 1: Single Student Photo Modal
// ==========================================
interface SinglePhotoModalProps {
  student: Student;
  onClose: () => void;
  onSave: (foto: string | null) => void;
}

const SinglePhotoModal: React.FC<SinglePhotoModalProps> = ({
  student,
  onClose,
  onSave,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>(student.foto || '');
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Pas Foto Peserta Ujian"
      subtitle={`${student.nama} • ${student.noPeserta} (${student.ruang})`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 pb-2">
          {[
            { id: 'upload', label: 'Unggah Berkas Gambar', icon: Upload },
            { id: 'preset', label: 'Avatar Resmi SD', icon: Sparkles },
            { id: 'url', label: 'Tautan URL Gambar', icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  active
                    ? 'bg-emerald-800 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
          {/* Left: Preview Frame */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
              Pratinjau Pas Foto (3x4)
            </span>
            <div className="relative aspect-[3/4] w-32 overflow-hidden rounded-xl border-2 border-emerald-600 shadow-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={student.nama}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center p-3">
                  <span className="text-3xl">{student.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                  <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase">Belum Ada Foto</p>
                </div>
              )}
            </div>
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoUrl('')}
                className="mt-2 text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Hapus Foto Ini
              </button>
            )}
          </div>

          {/* Right: Controls based on tab */}
          <div className="sm:col-span-2 space-y-3">
            {activeTab === 'upload' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/30 p-6 text-center hover:bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20 transition-colors"
              >
                <Upload className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Klik untuk memilih foto atau seret berkas ke sini
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Mendukung format JPG, PNG, atau WebP (disarankan rasio pas foto 2x3 atau 3x4)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {activeTab === 'preset' && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  Pilih gaya pas foto avatar resmi SDN 006 Sungai Buluh (berdasarkan standar seragam putih merah & jilbab):
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((v) => {
                    const presetSvg = generateStudentPhotoSvg(student.nama, student.jenisKelamin, v);
                    return (
                      <div
                        key={v}
                        onClick={() => setPhotoUrl(presetSvg)}
                        className={`cursor-pointer rounded-xl border-2 p-1 overflow-hidden transition-all text-center ${
                          photoUrl === presetSvg
                            ? 'border-emerald-600 ring-2 ring-emerald-500/40'
                            : 'border-zinc-200 hover:border-emerald-400 dark:border-zinc-700'
                        }`}
                      >
                        <img
                          src={presetSvg}
                          alt={`Preset ${v}`}
                          className="h-16 w-full object-cover rounded-lg"
                        />
                        <span className="text-[9px] font-bold text-zinc-500 block mt-1">
                          Varian {v}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'url' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Tautan / Link URL Foto:
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/foto-siswa.jpg"
                  value={photoUrl.startsWith('data:') ? '' : photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <p className="text-[10px] text-zinc-400">
                  Masukkan link gambar daring langsung jika tidak ingin mengunggah berkas lokal.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onSave(photoUrl || null)}
            className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
          >
            Simpan Foto Siswa
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ==========================================
// Subcomponent 2: Batch Multi-Photo Modal
// ==========================================
interface BatchPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onApply: (updates: Array<{ id: string; foto: string }>) => void;
}

interface MatchedItem {
  file: File;
  previewUrl: string;
  matchedStudent: Student | null;
  matchReason: string;
}

const BatchPhotoModal: React.FC<BatchPhotoModalProps> = ({
  isOpen,
  onClose,
  students,
  onApply,
}) => {
  const [matchedList, setMatchedList] = useState<MatchedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to match filename with student
  const findMatchingStudent = (fileName: string): { student: Student | null; reason: string } => {
    // Strip extension & special chars
    const cleanName = fileName.replace(/\.[^/.]+$/, '').trim().toLowerCase();

    // 1. Check exact NISN
    const byNisn = students.find((s) => cleanName.includes(s.nisn));
    if (byNisn) return { student: byNisn, reason: `NISN (${byNisn.nisn})` };

    // 2. Check exact No Peserta (with or without dashes)
    const byNoPes = students.find((s) => {
      const pesFormatted = s.noPeserta.toLowerCase();
      const pesNoDash = s.noPeserta.replace(/-/g, '').toLowerCase();
      return cleanName.includes(pesFormatted) || cleanName.includes(pesNoDash);
    });
    if (byNoPes) return { student: byNoPes, reason: `No. Peserta (${byNoPes.noPeserta})` };

    // 3. Check exact NIS
    const byNis = students.find((s) => cleanName.includes(s.nis));
    if (byNis) return { student: byNis, reason: `NIS (${byNis.nis})` };

    // 4. Check Student Name (contains full or first 2 words)
    const byNama = students.find((s) => {
      const sName = s.nama.toLowerCase();
      return cleanName === sName || cleanName.includes(sName) || sName.includes(cleanName);
    });
    if (byNama) return { student: byNama, reason: `Nama (${byNama.nama})` };

    return { student: null, reason: 'Tidak Ditemukan' };
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const items: MatchedItem[] = [];
    const readPromises: Promise<void>[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const p = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewUrl = e.target?.result as string;
          const { student, reason } = findMatchingStudent(file.name);
          items.push({
            file,
            previewUrl,
            matchedStudent: student,
            matchReason: reason,
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
      readPromises.push(p);
    });

    Promise.all(readPromises).then(() => {
      setMatchedList((prev) => [...prev, ...items]);
      setIsProcessing(false);
    });
  };

  const handleApply = () => {
    const validUpdates = matchedList
      .filter((m) => m.matchedStudent !== null)
      .map((m) => ({
        id: m.matchedStudent!.id,
        foto: m.previewUrl,
      }));

    if (validUpdates.length === 0) {
      alert('Tidak ada foto yang cocok dengan data siswa.');
      return;
    }

    onApply(validUpdates);
  };

  const validMatchesCount = matchedList.filter((m) => m.matchedStudent !== null).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unggah Pas Foto Siswa Massal (Batch Auto-Match)"
      subtitle="Pilih banyak foto sekaligus. Sistem akan otomatis mencocokkan nama berkas dengan NISN, No. Peserta, atau Nama siswa."
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/40 p-6 text-center hover:bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/20 transition-colors"
        >
          <Upload className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          <h4 className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Pilih atau Seret Sekaligus Seluruh Foto Siswa ke Sini
          </h4>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            💡 Tips penamaan berkas agar otomatis cocok: <br />
            <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">[NISN].jpg</code> (contoh: <code>0123456781.jpg</code>), atau <br />
            <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">[No_Peserta].jpg</code> (contoh: <code>04-006-001-8.jpg</code>), atau <br />
            <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">[Nama_Siswa].jpg</code> (contoh: <code>ADITYA PRATAMA.jpg</code>)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Results Preview */}
        {matchedList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-700 dark:text-zinc-300">
                Berkas Terpilih: {matchedList.length} Foto ({validMatchesCount} Otomatis Cocok)
              </span>
              <button
                type="button"
                onClick={() => setMatchedList([])}
                className="text-rose-600 hover:underline"
              >
                Kosongkan Daftar
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
              {matchedList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="h-10 w-8 object-cover rounded border border-zinc-300 dark:border-zinc-700"
                    />
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                        {item.file.name}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Ukuran: {(item.file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  {/* Matching Info */}
                  <div className="flex items-center gap-2">
                    {item.matchedStudent ? (
                      <div className="text-right">
                        <div className="font-extrabold text-emerald-800 dark:text-emerald-400 uppercase">
                          {item.matchedStudent.nama}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Cocok via {item.matchReason}
                        </span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <AlertCircle className="h-3 w-3" />
                          Belum Cocok
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setMatchedList((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-zinc-400 hover:text-rose-600 p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={validMatchesCount === 0}
            onClick={handleApply}
            className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50 transition-colors"
          >
            Terapkan {validMatchesCount} Foto Siswa
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ==========================================
// Subcomponent 3: Student Card / Denah Live Preview Modal
// ==========================================
interface StudentCardPreviewModalProps {
  student: Student;
  schoolProfile: any;
  onClose: () => void;
  onEditPhoto: () => void;
}

const StudentCardPreviewModal: React.FC<StudentCardPreviewModalProps> = ({
  student,
  schoolProfile,
  onClose,
  onEditPhoto,
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Pratinjau Integrasi Pas Foto Resmi"
      subtitle={`${student.nama} • ${student.noPeserta}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Berikut adalah simulasi bagaimana pas foto siswa ini langsung terpasang pada <b>Kartu Peserta Ujian Nasional</b> dan <b>Denah Meja Ruangan</b>.
        </p>

        {/* 1. Simulasi Kartu Ujian */}
        <div className="rounded-2xl border-2 border-emerald-900/80 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-emerald-600 space-y-3">
          <div className="flex items-center gap-3 border-b-2 border-emerald-900 pb-2 dark:border-emerald-500">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-amber-300 font-bold text-lg">
              SD
            </div>
            <div className="flex-1 text-center">
              <div className="text-[10px] font-bold tracking-wider text-zinc-700 dark:text-zinc-300 uppercase">
                PEMERINTAH KABUPATEN KUANTAN SINGINGI
              </div>
              <div className="text-xs font-extrabold text-emerald-950 dark:text-emerald-400 uppercase">
                KARTU PESERTA UJIAN NASIONAL / US
              </div>
              <div className="text-[9px] font-semibold text-zinc-500">
                SDN 006 SUNGAI BULUH • TP {schoolProfile.tahunPelajaran}
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-xs items-center">
            {/* Foto Frame Resmi */}
            <div className="relative flex flex-col items-center justify-center h-28 w-22 rounded-lg border-2 border-zinc-800 bg-zinc-100 p-0.5 text-center shrink-0 overflow-hidden shadow-xs dark:bg-zinc-800">
              {student.foto ? (
                <img
                  src={student.foto}
                  alt={student.nama}
                  className="h-full w-full object-cover rounded"
                />
              ) : (
                <div className="p-1">
                  <span className="text-2xl">{student.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                  <span className="text-[7px] font-bold text-zinc-400 block mt-1">PAS FOTO 2x3</span>
                </div>
              )}
            </div>

            {/* Biodata */}
            <div className="flex-1 space-y-1.5 text-xs">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-zinc-500 font-semibold">No. Peserta:</span>
                <span className="col-span-2 font-mono font-black text-zinc-900 dark:text-zinc-100">
                  {student.noPeserta}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-zinc-500 font-semibold">Nama Siswa:</span>
                <span className="col-span-2 font-extrabold uppercase text-zinc-900 dark:text-zinc-100">
                  {student.nama}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-zinc-500 font-semibold">NISN / NIS:</span>
                <span className="col-span-2 font-mono text-zinc-700 dark:text-zinc-300">
                  {student.nisn} / {student.nis}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-zinc-500 font-semibold">Ruang & Meja:</span>
                <span className="col-span-2 font-bold text-emerald-800 dark:text-emerald-400">
                  {student.ruang} • Meja #{student.noMeja}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Simulasi Meja Denah */}
        <div>
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
            Simulasi Kartu Meja Pada Denah Ruang:
          </span>
          <div className="flex flex-col items-center justify-between rounded-xl border-2 border-emerald-600 bg-emerald-50/50 p-4 text-center max-w-xs mx-auto shadow-xs dark:bg-emerald-950/20">
            <div className="flex items-center justify-between w-full border-b border-emerald-200 dark:border-emerald-800 pb-1 mb-2">
              <span className="text-[10px] font-bold text-zinc-500">MEJA #{student.noMeja}</span>
              <span className="text-[9px] font-bold text-emerald-700">{student.ruang}</span>
            </div>

            <div className="my-1 flex flex-col items-center">
              <div className="h-16 w-14 rounded-lg overflow-hidden border-2 border-emerald-700 shadow-xs mb-1.5 bg-white">
                {student.foto ? (
                  <img src={student.foto} alt={student.nama} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-xl">
                    {student.jenisKelamin === 'L' ? '👦' : '👧'}
                  </div>
                )}
              </div>
              <div className="font-black text-xs text-zinc-900 dark:text-zinc-100 uppercase">
                {student.nama}
              </div>
              <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                {student.noPeserta}
              </div>
            </div>

            <div className="border-t border-emerald-200 dark:border-emerald-800 pt-1 text-[9px] text-zinc-500 font-medium w-full">
              SDN 006 SUNGAI BULUH
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <button
            type="button"
            onClick={onEditPhoto}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
          >
            <Camera className="h-3.5 w-3.5" />
            Ganti Foto Siswa Ini
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-5 py-2 text-xs font-bold text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </Modal>
  );
};
