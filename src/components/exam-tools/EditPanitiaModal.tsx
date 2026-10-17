import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  UserCheck,
  FileText,
  Save,
  Search,
  Briefcase,
  Users,
} from 'lucide-react';
import { CommitteeMember } from '../../types';
import { PanitiaMetaState, DEFAULT_PANITIA_META } from './examAdminState';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  committee: CommitteeMember[];
  onSave: (updatedList: CommitteeMember[]) => void;
  panitiaMeta: PanitiaMetaState;
  onSaveMeta: (meta: PanitiaMetaState) => void;
  onResetDefault: () => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

const COMMON_JABATAN_PRESETS = [
  'Penanggung Jawab',
  'Ketua Pelaksana',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Seksi Naskah & Pengolahan Nilai',
  'Seksi Perlengkapan & Ruang',
  'Seksi Konsumsi',
  'Seksi Keamanan & Ketertiban',
  'Seksi Dokumentasi & Publikasi',
  'Anggota Panitia',
];

export const EditPanitiaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  committee,
  onSave,
  panitiaMeta,
  onSaveMeta,
  onResetDefault,
  showToast,
}) => {
  const [items, setItems] = useState<CommitteeMember[]>(committee);
  const [meta, setMeta] = useState<PanitiaMetaState>(panitiaMeta);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'anggota' | 'sk'>('anggota');

  useEffect(() => {
    if (isOpen) {
      setItems(committee);
      setMeta(panitiaMeta);
      setSearchQuery('');
    }
  }, [isOpen, committee, panitiaMeta]);

  if (!isOpen) return null;

  const handleItemChange = (id: string, field: keyof CommitteeMember, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddNew = () => {
    const newId = `com-${Date.now()}`;
    const newItem: CommitteeMember = {
      id: newId,
      jabatan: 'Anggota Panitia',
      nama: '',
      nip: '-',
      tugas: 'Membantu kelancaran operasional pelaksanaan ujian',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDelete = (id: string) => {
    if (items.length <= 1) {
      alert('Minimal harus ada 1 anggota panitia.');
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...items];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    setItems(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const copy = [...items];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    setItems(copy);
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan susunan panitia dan nomor SK ke susunan awal?')) {
      onResetDefault();
      setMeta(DEFAULT_PANITIA_META);
      onSaveMeta(DEFAULT_PANITIA_META);
      if (showToast) {
        showToast('Reset Panitia Berhasil', 'Susunan panitia dikembalikan ke SK asli.', 'info');
      }
      onClose();
    }
  };

  const handleSaveAll = () => {
    const cleaned = items.map((item, idx) => ({
      ...item,
      jabatan: item.jabatan.trim() || `Jabatan ${idx + 1}`,
      nama: item.nama.trim() || `Panitia ${idx + 1}`,
      nip: item.nip.trim() || '-',
      tugas: item.tugas.trim() || 'Melaksanakan tugas kepanitiaan ujian',
    }));

    onSave(cleaned);
    onSaveMeta(meta);
    if (showToast) {
      showToast('Panitia Disimpan', `${cleaned.length} anggota panitia ujian berhasil diperbarui.`, 'success');
    }
    onClose();
  };

  const filteredItems = items.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nip.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                  Edit Susunan Panitia Ujian Sekolah
                </h3>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {items.length} Panitia
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Kelola struktur kepanitiaan ujian, pembagian tugas jabatan, dan dasar hukum SK Keputusan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('anggota')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                activeSection === 'anggota'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Anggota Panitia ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('sk')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                activeSection === 'sk'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Dasar SK Penetapan Panitia
            </button>
          </div>

          {activeSection === 'anggota' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari nama / jabatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 sm:w-56 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddNew}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Panitia
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeSection === 'anggota' ? (
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-sm">
                  Tidak ada anggota panitia yang cocok dengan pencarian.
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const originalIndex = items.findIndex((i) => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-700/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                            {originalIndex + 1}
                          </span>
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            {item.jabatan || `Panitia #${originalIndex + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(originalIndex)}
                            disabled={originalIndex === 0}
                            title="Geser ke atas"
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(originalIndex)}
                            disabled={originalIndex === items.length - 1}
                            title="Geser ke bawah"
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Hapus panitia"
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer ml-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        <div className="sm:col-span-4 space-y-1">
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> Jabatan Kepanitiaan
                          </label>
                          <input
                            type="text"
                            list="jabatan-suggestions"
                            value={item.jabatan}
                            onChange={(e) => handleItemChange(item.id, 'jabatan', e.target.value)}
                            placeholder="Contoh: Ketua Pelaksana"
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-5 space-y-1">
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                            Nama Lengkap & Gelar
                          </label>
                          <input
                            type="text"
                            value={item.nama}
                            onChange={(e) => handleItemChange(item.id, 'nama', e.target.value)}
                            placeholder="Contoh: HENRI SAPUTRA, S.Pd"
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                            NIP (18 Digit / -)
                          </label>
                          <input
                            type="text"
                            value={item.nip}
                            onChange={(e) => handleItemChange(item.id, 'nip', e.target.value)}
                            placeholder="19820415 200801 1 008"
                            className="w-full font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-12 space-y-1">
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                            Uraian Tugas & Tanggung Jawab
                          </label>
                          <textarea
                            rows={2}
                            value={item.tugas}
                            onChange={(e) => handleItemChange(item.id, 'tugas', e.target.value)}
                            placeholder="Jelaskan ruang lingkup tugas panitia bersangkutan..."
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <datalist id="jabatan-suggestions">
                {COMMON_JABATAN_PRESETS.map((j) => (
                  <option key={j} value={j} />
                ))}
              </datalist>
            </div>
          ) : (
            /* Tab Dasar SK */
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-4 max-w-xl mx-auto">
              <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-700 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                    Dasar Surat Keputusan (SK) Panitia
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Nomor dan tanggal penetapan SK Keputusan Kepala Sekolah untuk Ujian Sekolah
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    Nomor SK Penetapan Panitia
                  </label>
                  <input
                    type="text"
                    value={meta.nomorSk}
                    onChange={(e) => setMeta({ ...meta, nomorSk: e.target.value })}
                    placeholder="Contoh: 421.2/SDN-006/KP/2026"
                    className="w-full font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    Tanggal Penetapan SK
                  </label>
                  <input
                    type="text"
                    value={meta.tanggalSk}
                    onChange={(e) => setMeta({ ...meta, tanggalSk: e.target.value })}
                    placeholder="Contoh: 02 Mei 2026"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    Tahun Pelajaran
                  </label>
                  <input
                    type="text"
                    value={meta.tahunPelajaran}
                    onChange={(e) => setMeta({ ...meta, tahunPelajaran: e.target.value })}
                    placeholder="2025/2026"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    Keterangan Perihal SK
                  </label>
                  <textarea
                    rows={2}
                    value={meta.keteranganSk}
                    onChange={(e) => setMeta({ ...meta, keteranganSk: e.target.value })}
                    placeholder="Keputusan Kepala Sekolah tentang Pembentukan Panitia Ujian Sekolah..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer w-full sm:w-auto justify-center"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Kembalikan ke Default
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
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
