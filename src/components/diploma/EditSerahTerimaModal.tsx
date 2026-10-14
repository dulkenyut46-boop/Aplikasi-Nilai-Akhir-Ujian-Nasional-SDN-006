import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Check,
  RotateCcw,
  Save,
  Search,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Users,
  Settings,
  ListOrdered,
  Sparkles,
} from 'lucide-react';
import { Student, SchoolProfile } from '../../types';
import {
  SerahTerimaMeta,
  loadSerahTerimaMeta,
  saveSerahTerimaMeta,
  getDefaultSerahTerimaMeta,
} from './diplomaExtraState';

interface EditSerahTerimaModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schoolProfile: SchoolProfile;
  onSaveStudents: (updates: Array<{ id: string; data: Partial<Student> }>) => void;
  onSaveMeta: (meta: SerahTerimaMeta) => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

interface StudentDeliveryRow {
  id: string;
  nama: string;
  nisn: string;
  namaAyah: string;
  namaIbu: string;
  noSeriIjazah: string;
  tanggalAmbilIjazah: string;
  penerimaIjazah: string;
}

export const EditSerahTerimaModal: React.FC<EditSerahTerimaModalProps> = ({
  isOpen,
  onClose,
  students,
  schoolProfile,
  onSaveStudents,
  onSaveMeta,
  showToast,
}) => {
  const [meta, setMeta] = useState<SerahTerimaMeta>(() => loadSerahTerimaMeta(schoolProfile));
  const [rows, setRows] = useState<StudentDeliveryRow[]>([]);
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'siswa' | 'naskah'>('siswa');

  // Batch tool states
  const [batchDate, setBatchDate] = useState('12 Juni 2026');
  const [batchRecipientType, setBatchRecipientType] = useState<'ayah' | 'ibu' | 'sendiri'>('ayah');

  useEffect(() => {
    if (isOpen) {
      setMeta(loadSerahTerimaMeta(schoolProfile));
      const initialRows: StudentDeliveryRow[] = students.map((s) => ({
        id: s.id,
        nama: s.nama,
        nisn: s.nisn,
        namaAyah: s.namaAyah || '',
        namaIbu: s.namaIbu || '',
        noSeriIjazah: s.noSeriIjazah || '',
        tanggalAmbilIjazah: s.tanggalAmbilIjazah || '12 Juni 2026',
        penerimaIjazah: s.penerimaIjazah || `${s.namaAyah || 'Orang Tua'} (Orang Tua)`,
      }));
      setRows(initialRows);
      setSearch('');
    }
  }, [isOpen, students, schoolProfile]);

  if (!isOpen) return null;

  const handleRowChange = (id: string, field: keyof StudentDeliveryRow, val: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleApplyBatchDate = () => {
    if (!batchDate.trim()) return;
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        tanggalAmbilIjazah: batchDate,
      }))
    );
    showToast?.(
      'Tanggal Diterapkan',
      `Tanggal penyerahan seluruh ${rows.length} siswa diseragamkan ke ${batchDate}.`,
      'info'
    );
  };

  const handleApplyBatchRecipient = () => {
    setRows((prev) =>
      prev.map((r) => {
        let recipient = '';
        if (batchRecipientType === 'ayah') {
          recipient = r.namaAyah ? `${r.namaAyah} (Ayah/Wali)` : 'Orang Tua / Wali';
        } else if (batchRecipientType === 'ibu') {
          recipient = r.namaIbu ? `${r.namaIbu} (Ibu/Wali)` : 'Orang Tua / Wali';
        } else {
          recipient = `${r.nama} (Siswa)`;
        }
        return {
          ...r,
          penerimaIjazah: recipient,
        };
      })
    );
    showToast?.(
      'Penerima Diperbarui',
      `Nama penerima ijazah disesuaikan berdasarkan data ${batchRecipientType.toUpperCase()}.`,
      'info'
    );
  };

  const handleMarkAllReceived = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        tanggalAmbilIjazah: r.tanggalAmbilIjazah || '12 Juni 2026',
        penerimaIjazah: r.penerimaIjazah || `${r.namaAyah || 'Orang Tua'} (Orang Tua)`,
      }))
    );
    showToast?.(
      'Semua Diserahkan',
      'Seluruh 80 siswa ditandai telah menerima ijazah dan transkrip.',
      'info'
    );
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan data Buku Serah Terima ke format standar awal?')) {
      const defMeta = getDefaultSerahTerimaMeta(schoolProfile);
      setMeta(defMeta);
      const resetRows: StudentDeliveryRow[] = students.map((s) => ({
        id: s.id,
        nama: s.nama,
        nisn: s.nisn,
        namaAyah: s.namaAyah || '',
        namaIbu: s.namaIbu || '',
        noSeriIjazah: s.noSeriIjazah || '',
        tanggalAmbilIjazah: '12 Juni 2026',
        penerimaIjazah: `${s.namaAyah || 'Orang Tua'} (Orang Tua)`,
      }));
      setRows(resetRows);
      showToast?.('Reset Berhasil', 'Data dikembalikan ke format bawaan dinas.', 'info');
    }
  };

  const handleSaveAndClose = () => {
    // 1. Save meta to storage
    saveSerahTerimaMeta(meta);
    onSaveMeta(meta);

    // 2. Save individual student updates
    const updates = rows.map((r) => ({
      id: r.id,
      data: {
        noSeriIjazah: r.noSeriIjazah,
        tanggalAmbilIjazah: r.tanggalAmbilIjazah,
        penerimaIjazah: r.penerimaIjazah,
      },
    }));
    onSaveStudents(updates);

    showToast?.(
      'Buku Serah Terima Disimpan',
      'Perubahan tanggal, nomor seri ijazah, penerima, dan naskah pengesahan berhasil disimpan.',
      'success'
    );
    onClose();
  };

  const filteredRows = rows.filter(
    (r) =>
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.nisn.includes(search) ||
      r.noSeriIjazah.toLowerCase().includes(search.toLowerCase()) ||
      r.penerimaIjazah.toLowerCase().includes(search.toLowerCase())
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
                <span>Ubah / Edit Data Buku Serah Terima Ijazah</span>
                <span className="rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 text-[10px] font-bold">
                  {rows.length} Siswa
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kelola tanggal pengambilan, nomor seri ijazah, nama penerima orang tua, serta naskah pengesahan
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
            onClick={() => setActiveSubTab('siswa')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'siswa'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Daftar Siswa & Penerima Ijazah ({rows.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('naskah')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'naskah'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Pengaturan Naskah & Pengesahan</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-zinc-900 dark:text-zinc-100">
          {activeSubTab === 'siswa' && (
            <div className="space-y-4">
              {/* Batch Actions Toolbar */}
              <div className="rounded-2xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-xs">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Aksi Cepat Pengisian Serentak (Batch Update)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Set Tanggal Serentak */}
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      Tgl Ambil:
                    </span>
                    <input
                      type="text"
                      value={batchDate}
                      onChange={(e) => setBatchDate(e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-2.5 py-1 text-xs"
                      placeholder="contoh: 12 Juni 2026"
                    />
                    <button
                      type="button"
                      onClick={handleApplyBatchDate}
                      className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 text-xs whitespace-nowrap transition-colors"
                    >
                      Terapkan Semua
                    </button>
                  </div>

                  {/* Set Penerima Berdasarkan Ayah / Ibu */}
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      Penerima:
                    </span>
                    <select
                      value={batchRecipientType}
                      onChange={(e) => setBatchRecipientType(e.target.value as any)}
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-2 py-1 text-xs font-semibold"
                    >
                      <option value="ayah">Nama Ayah (Orang Tua)</option>
                      <option value="ibu">Nama Ibu (Orang Tua)</option>
                      <option value="sendiri">Nama Siswa Sendiri</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleApplyBatchRecipient}
                      className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 text-xs whitespace-nowrap transition-colors"
                    >
                      Terapkan Semua
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleMarkAllReceived}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Tandai seluruh 80 siswa: Status Pengambilan Lengkap
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari siswa berdasarkan nama, NISN, no seri ijazah, atau nama penerima..."
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
                        <th className="p-2.5 min-w-[200px]">Nama Siswa & NISN</th>
                        <th className="p-2.5 min-w-[170px]">No. Seri Ijazah</th>
                        <th className="p-2.5 min-w-[140px]">Tgl Penyerahan</th>
                        <th className="p-2.5 min-w-[200px]">Nama Penerima (Wali / Ortu)</th>
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
                          <td className="p-2">
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">{r.nama}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">NISN: {r.nisn}</div>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={r.noSeriIjazah}
                              onChange={(e) => handleRowChange(r.id, 'noSeriIjazah', e.target.value)}
                              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-400"
                              placeholder="DN-04/D-SD/..."
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={r.tanggalAmbilIjazah}
                              onChange={(e) =>
                                handleRowChange(r.id, 'tanggalAmbilIjazah', e.target.value)
                              }
                              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 text-xs font-medium"
                              placeholder="12 Juni 2026"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={r.penerimaIjazah}
                              onChange={(e) =>
                                handleRowChange(r.id, 'penerimaIjazah', e.target.value)
                              }
                              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 text-xs font-medium"
                              placeholder="Nama Orang Tua / Siswa"
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

          {activeSubTab === 'naskah' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold text-[11px] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Pengaturan Judul Buku, Titimangsa Cetak, dan Pejabat Pengesah Penyerahan Ijazah
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Judul Buku Ekspedisi:
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
                    Sub Judul / Satuan Pendidikan:
                  </label>
                  <input
                    type="text"
                    value={meta.subJudul}
                    onChange={(e) => setMeta({ ...meta, subJudul: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
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
                    placeholder="12 Juni 2026"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Jabatan Penyerah:
                  </label>
                  <input
                    type="text"
                    value={meta.jabatanPenyerah}
                    onChange={(e) => setMeta({ ...meta, jabatanPenyerah: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Pejabat / Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    value={meta.namaPenyerah}
                    onChange={(e) => setMeta({ ...meta, namaPenyerah: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold uppercase text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    NIP Pejabat Penyerah:
                  </label>
                  <input
                    type="text"
                    value={meta.nipPenyerah}
                    onChange={(e) => setMeta({ ...meta, nipPenyerah: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Catatan Kaki Dokumen:
                </label>
                <textarea
                  rows={2}
                  value={meta.catatanKaki || ''}
                  onChange={(e) => setMeta({ ...meta, catatanKaki: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs"
                />
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
