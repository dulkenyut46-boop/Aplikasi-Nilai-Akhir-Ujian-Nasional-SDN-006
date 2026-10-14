import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Check,
  RotateCcw,
  Save,
  Search,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Settings,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Student, SchoolProfile } from '../../types';
import {
  PerpisahanMeta,
  PerpisahanAttendance,
  loadPerpisahanMeta,
  savePerpisahanMeta,
  getDefaultPerpisahanMeta,
} from './diplomaExtraState';

interface EditPerpisahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schoolProfile: SchoolProfile;
  onSaveMeta: (meta: PerpisahanMeta) => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

interface StudentAttendanceRow {
  id: string;
  nama: string;
  namaAyah: string;
  namaWali: string;
  kehadiranSiswa: 'Hadir' | 'Izin' | 'Sakit' | 'Tidak Hadir';
  kehadiranWali: 'Hadir' | 'Izin' | 'Sakit' | 'Tidak Hadir';
  keterangan: string;
}

export const EditPerpisahanModal: React.FC<EditPerpisahanModalProps> = ({
  isOpen,
  onClose,
  students,
  schoolProfile,
  onSaveMeta,
  showToast,
}) => {
  const [meta, setMeta] = useState<PerpisahanMeta>(() => loadPerpisahanMeta(schoolProfile));
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'kehadiran' | 'acara'>('kehadiran');

  useEffect(() => {
    if (isOpen) {
      const loadedMeta = loadPerpisahanMeta(schoolProfile);
      setMeta(loadedMeta);

      const initialRows: StudentAttendanceRow[] = students.map((s) => {
        const stored = loadedMeta.attendanceMap[s.id] || {};
        return {
          id: s.id,
          nama: s.nama,
          namaAyah: s.namaAyah || '',
          namaWali: stored.namaWali !== undefined ? stored.namaWali : s.namaAyah || 'Orang Tua / Wali',
          kehadiranSiswa: stored.kehadiranSiswa || 'Hadir',
          kehadiranWali: stored.kehadiranWali || 'Hadir',
          keterangan: stored.keterangan || 'Hadir Lengkap',
        };
      });
      setRows(initialRows);
      setSearch('');
    }
  }, [isOpen, students, schoolProfile]);

  if (!isOpen) return null;

  const handleRowChange = (id: string, field: keyof StudentAttendanceRow, val: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleMarkAllPresent = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        kehadiranSiswa: 'Hadir',
        kehadiranWali: 'Hadir',
        keterangan: 'Hadir Lengkap',
      }))
    );
    showToast?.(
      'Kehadiran Diperbarui',
      'Seluruh 80 siswa dan orang tua ditandai HADIR pada acara perpisahan.',
      'info'
    );
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan data Daftar Hadir Perpisahan ke format standar bawaan?')) {
      const defMeta = getDefaultPerpisahanMeta(schoolProfile);
      setMeta(defMeta);
      const resetRows: StudentAttendanceRow[] = students.map((s) => ({
        id: s.id,
        nama: s.nama,
        namaAyah: s.namaAyah || '',
        namaWali: s.namaAyah || 'Orang Tua / Wali',
        kehadiranSiswa: 'Hadir',
        kehadiranWali: 'Hadir',
        keterangan: 'Hadir Lengkap',
      }));
      setRows(resetRows);
      showToast?.('Reset Berhasil', 'Isian dikembalikan ke pengaturan awal.', 'info');
    }
  };

  const handleSaveAndClose = () => {
    // Map rows to attendanceMap
    const attendanceMap: Record<string, PerpisahanAttendance> = {};
    rows.forEach((r) => {
      attendanceMap[r.id] = {
        namaWali: r.namaWali,
        kehadiranSiswa: r.kehadiranSiswa,
        kehadiranWali: r.kehadiranWali,
        keterangan: r.keterangan,
      };
    });

    const updatedMeta: PerpisahanMeta = {
      ...meta,
      attendanceMap,
    };

    savePerpisahanMeta(updatedMeta);
    onSaveMeta(updatedMeta);

    showToast?.(
      'Daftar Hadir Perpisahan Disimpan',
      'Perubahan tanggal acara, tempat, nama wali, dan status presensi berhasil disimpan.',
      'success'
    );
    onClose();
  };

  const filteredRows = rows.filter(
    (r) =>
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.namaWali.toLowerCase().includes(search.toLowerCase()) ||
      r.keterangan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-5xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 shadow-md shrink-0">
              <Edit3 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>Ubah / Edit Data Daftar Hadir Perpisahan</span>
                <span className="rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 text-[10px] font-bold">
                  {rows.length} Siswa & Wali
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sesuaikan jadwal acara perpisahan, nama wali murid, serta presensi kehadiran siswa & orang tua
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100/80 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('kehadiran')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'kehadiran'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Presensi Siswa & Orang Tua / Wali ({rows.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('acara')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'acara'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Jadwal Acara & Lembar Pengesahan</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-zinc-900 dark:text-zinc-100">
          {activeSubTab === 'kehadiran' && (
            <div className="space-y-4">
              {/* Quick Actions & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    Aksi Presensi Cepat:
                  </span>
                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 shadow-xs transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Tandai Semua Siswa & Wali Hadir
                  </button>
                </div>

                <div className="text-zinc-500 dark:text-zinc-400 font-semibold text-[11px]">
                  💡 Format titik tanda tangan (1. ......., 2. .......) otomatis terisi saat dicetak
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari siswa atau nama wali murid..."
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2 pl-9 pr-4 text-xs dark:text-zinc-100"
                />
              </div>

              {/* Interactive Table */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                <div className="max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-700 z-10">
                      <tr>
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5 min-w-[180px]">Nama Siswa</th>
                        <th className="p-2.5 min-w-[190px]">Nama Orang Tua / Wali</th>
                        <th className="p-2.5 w-32 text-center">Presensi Siswa</th>
                        <th className="p-2.5 w-32 text-center">Presensi Wali</th>
                        <th className="p-2.5 min-w-[130px]">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {filteredRows.map((r, idx) => (
                        <tr
                          key={r.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="p-2 text-center font-bold font-mono text-zinc-500">
                            {idx + 1}
                          </td>
                          <td className="p-2 font-bold uppercase text-zinc-900 dark:text-zinc-100">
                            {r.nama}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={r.namaWali}
                              onChange={(e) => handleRowChange(r.id, 'namaWali', e.target.value)}
                              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 text-xs font-medium"
                              placeholder="Nama Orang Tua / Wali"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <select
                              value={r.kehadiranSiswa}
                              onChange={(e) =>
                                handleRowChange(r.id, 'kehadiranSiswa', e.target.value)
                              }
                              className={`rounded-lg border px-2 py-1 text-xs font-bold ${
                                r.kehadiranSiswa === 'Hadir'
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                              }`}
                            >
                              <option value="Hadir">Hadir</option>
                              <option value="Izin">Izin</option>
                              <option value="Sakit">Sakit</option>
                              <option value="Tidak Hadir">Tidak Hadir</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            <select
                              value={r.kehadiranWali}
                              onChange={(e) =>
                                handleRowChange(r.id, 'kehadiranWali', e.target.value)
                              }
                              className={`rounded-lg border px-2 py-1 text-xs font-bold ${
                                r.kehadiranWali === 'Hadir'
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                              }`}
                            >
                              <option value="Hadir">Hadir</option>
                              <option value="Izin">Izin</option>
                              <option value="Sakit">Sakit</option>
                              <option value="Tidak Hadir">Tidak Hadir</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={r.keterangan}
                              onChange={(e) => handleRowChange(r.id, 'keterangan', e.target.value)}
                              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 text-xs"
                              placeholder="Keterangan..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'acara' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold text-[11px] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Informasi Jadwal Acara Perpisahan, Tempat, dan Titimangsa Lembar Presensi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Judul Naskah Dokumen:
                  </label>
                  <input
                    type="text"
                    value={meta.judul}
                    onChange={(e) => setMeta({ ...meta, judul: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold uppercase text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Sub Judul / Keterangan:
                  </label>
                  <input
                    type="text"
                    value={meta.subJudul}
                    onChange={(e) => setMeta({ ...meta, subJudul: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Hari & Tanggal Pelaksanaan:
                  </label>
                  <input
                    type="text"
                    value={meta.hariTanggal}
                    onChange={(e) => setMeta({ ...meta, hariTanggal: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs font-semibold"
                    placeholder="Sabtu, 13 Juni 2026"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Waktu / Jam Pelaksanaan:
                  </label>
                  <input
                    type="text"
                    value={meta.waktu}
                    onChange={(e) => setMeta({ ...meta, waktu: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs"
                    placeholder="08.00 WIB s.d. Selesai"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tempat Acara:
                  </label>
                  <input
                    type="text"
                    value={meta.tempat}
                    onChange={(e) => setMeta({ ...meta, tempat: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs"
                    placeholder="Halaman SDN 006 Sungai Buluh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tempat Titimangsa:
                  </label>
                  <input
                    type="text"
                    value={meta.titimangsaTempat}
                    onChange={(e) => setMeta({ ...meta, titimangsaTempat: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs"
                    placeholder="Sungai Buluh"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tanggal Titimangsa Pengesahan:
                  </label>
                  <input
                    type="text"
                    value={meta.titimangsaTanggal}
                    onChange={(e) => setMeta({ ...meta, titimangsaTanggal: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs"
                    placeholder="13 Juni 2026"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    value={meta.kepalaSekolah}
                    onChange={(e) => setMeta({ ...meta, kepalaSekolah: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold uppercase text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    NIP Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    value={meta.nipKepalaSekolah}
                    onChange={(e) => setMeta({ ...meta, nipKepalaSekolah: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Default
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 px-5 py-2 text-xs font-bold text-white shadow-md transition-all"
            >
              <Save className="h-4 w-4" />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
