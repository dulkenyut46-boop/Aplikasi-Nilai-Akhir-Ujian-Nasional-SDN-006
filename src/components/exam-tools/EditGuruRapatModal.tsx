import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Search,
  UserCheck,
  Copy,
  Users,
  Sparkles,
} from 'lucide-react';
import { GuruRapat, DEFAULT_GURU_RAPAT } from './graduationDocsState';

interface EditGuruRapatModalProps {
  isOpen: boolean;
  onClose: () => void;
  guruList: GuruRapat[];
  onSave: (updatedList: GuruRapat[]) => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const EditGuruRapatModal: React.FC<EditGuruRapatModalProps> = ({
  isOpen,
  onClose,
  guruList,
  onSave,
  showToast,
}) => {
  const [items, setItems] = useState<GuruRapat[]>(guruList);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  // Sync state if modal reopens with different data
  React.useEffect(() => {
    if (isOpen) {
      setItems(guruList);
      setSearchQuery('');
    }
  }, [isOpen, guruList]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof GuruRapat, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddNew = () => {
    const newNo = items.length + 1;
    const newItem: GuruRapat = {
      id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      no: newNo,
      nama: '',
      jabatan: 'Guru Mata Pelajaran',
      nip: '-',
      kehadiran: 'hadir',
    };
    const updated = [...items, newItem].map((item, idx) => ({ ...item, no: idx + 1 }));
    setItems(updated);
  };

  const handleDelete = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, no: idx + 1 }));
    setItems(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setItems(updated.map((item, idx) => ({ ...item, no: idx + 1 })));
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setItems(updated.map((item, idx) => ({ ...item, no: idx + 1 })));
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan ke daftar asli 23 Dewan Guru SDN 006 Sungai Buluh?')) {
      setItems(DEFAULT_GURU_RAPAT);
      if (showToast) {
        showToast('Reset Default', 'Daftar nama telah dikembalikan ke 23 Dewan Guru asli.', 'info');
      }
    }
  };

  const handleSaveAndClose = () => {
    // Validate empty names
    const cleaned = items.map((item, idx) => ({
      ...item,
      no: idx + 1,
      nama: item.nama.trim() || `Guru / Pegawai ${idx + 1}`,
      jabatan: item.jabatan.trim() || 'Anggota Dewan Guru',
    }));
    onSave(cleaned);
    if (showToast) {
      showToast('Perubahan Disimpan', `Berhasil memperbarui ${cleaned.length} nama peserta rapat.`, 'success');
    }
    onClose();
  };

  const handleCopyAll = () => {
    const text = items.map((g) => `${g.no}. ${g.nama} - ${g.jabatan}`).join('\n');
    navigator.clipboard.writeText(text);
    if (showToast) {
      showToast('Teks Disalin', 'Daftar nama peserta rapat berhasil disalin ke clipboard.', 'success');
    }
  };

  const filteredItems = items.filter(
    (g) =>
      g.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5">
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-linear-to-r from-emerald-50 via-teal-50/50 to-white px-6 py-4 dark:border-zinc-800 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                Menu Edit & Kelola Nama Peserta Rapat
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                  {items.length} Peserta
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ubah nama, gelar, jabatan dinas, atau urutan tanda tangan untuk lembar presensi rapat kelulusan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nama atau jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Baris Nama
            </button>
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
              title="Salin semua nama ke clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
              Salin Daftar
            </button>
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
              title="Kembalikan susunan 23 guru asli"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset 23 Guru
            </button>
          </div>
        </div>

        {/* Content Table / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
              <Users className="h-10 w-10 stroke-1 mb-2 opacity-50" />
              <p className="text-sm font-medium">Tidak ada data nama yang cocok dengan "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                // Find actual index in original items array
                const realIndex = items.findIndex((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="group flex flex-col sm:flex-row sm:items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50/20 dark:border-zinc-800 dark:bg-zinc-800/80 dark:hover:border-zinc-700 transition-all shadow-2xs"
                  >
                    {/* Index & Reorder Controls */}
                    <div className="flex items-center gap-1 min-w-[70px]">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                        #{realIndex + 1}
                      </span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={realIndex === 0}
                          onClick={() => handleMoveUp(realIndex)}
                          className="text-zinc-400 hover:text-emerald-600 disabled:opacity-20 p-0.5"
                          title="Pindahkan ke atas"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={realIndex === items.length - 1}
                          onClick={() => handleMoveDown(realIndex)}
                          className="text-zinc-400 hover:text-emerald-600 disabled:opacity-20 p-0.5"
                          title="Pindahkan ke bawah"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Nama Input */}
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                        Nama Lengkap & Gelar
                      </label>
                      <input
                        type="text"
                        value={item.nama}
                        onChange={(e) => handleItemChange(realIndex, 'nama', e.target.value)}
                        placeholder="Contoh: HENRI SAPUTRA, S.Pd"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold uppercase text-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    {/* Jabatan Input */}
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                        Jabatan / Peran Rapat
                      </label>
                      <input
                        type="text"
                        value={item.jabatan}
                        onChange={(e) => handleItemChange(realIndex, 'jabatan', e.target.value)}
                        placeholder="Contoh: Guru Kelas 6A / Anggota"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      />
                    </div>

                    {/* Delete button */}
                    <div className="flex items-center justify-end sm:pt-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(realIndex)}
                        className="rounded-xl p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Total {items.length} guru & staf kependidikan terdaftar
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-all active:scale-95"
            >
              <Check className="h-4 w-4" />
              Simpan & Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
