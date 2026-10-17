import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  ShieldCheck,
  UserCheck,
  Phone,
  School,
  Save,
  Search,
} from 'lucide-react';
import { Supervisor } from '../../types';
import { TpuLeaderState, DEFAULT_TPU_LEADER } from './examAdminState';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supervisors: Supervisor[];
  onSave: (updatedList: Supervisor[]) => void;
  tpuLeader: TpuLeaderState;
  onSaveLeader: (leader: TpuLeaderState) => void;
  onResetDefault: () => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const EditPengawasModal: React.FC<Props> = ({
  isOpen,
  onClose,
  supervisors,
  onSave,
  tpuLeader,
  onSaveLeader,
  onResetDefault,
  showToast,
}) => {
  const [items, setItems] = useState<Supervisor[]>(supervisors);
  const [leader, setLeader] = useState<TpuLeaderState>(tpuLeader);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'daftar' | 'ketua'>('daftar');

  useEffect(() => {
    if (isOpen) {
      setItems(supervisors);
      setLeader(tpuLeader);
      setSearchQuery('');
    }
  }, [isOpen, supervisors, tpuLeader]);

  if (!isOpen) return null;

  const handleItemChange = (id: string, field: keyof Supervisor, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddNew = () => {
    const newId = `sup-${Date.now()}`;
    const nextRoomNum = ((items.length % 4) + 1);
    const newItem: Supervisor = {
      id: newId,
      nama: '',
      nip: '-',
      asalSekolah: 'SDN di TPU VI Singingi Hilir',
      ruangTugas: `RUANG ${nextRoomNum}`,
      kontak: '0812-',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDelete = (id: string) => {
    if (items.length <= 1) {
      alert('Minimal harus ada 1 pengawas ruang.');
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
    if (window.confirm('Kembalikan daftar pengawas dan Ketua TPU VI ke susunan asli?')) {
      onResetDefault();
      setLeader(DEFAULT_TPU_LEADER);
      onSaveLeader(DEFAULT_TPU_LEADER);
      if (showToast) {
        showToast('Reset Pengawas Berhasil', 'Data dikembalikan ke standar awal pengawas TPU VI.', 'info');
      }
      onClose();
    }
  };

  const handleSaveAll = () => {
    // Validate empty names
    const cleaned = items.map((item, idx) => ({
      ...item,
      nama: item.nama.trim() || `Pengawas Ruang ${idx + 1}`,
      nip: item.nip.trim() || '-',
      asalSekolah: item.asalSekolah.trim() || 'SDN TPU VI Singingi Hilir',
      ruangTugas: item.ruangTugas.trim() || 'RUANG 1',
    }));

    onSave(cleaned);
    onSaveLeader(leader);
    if (showToast) {
      showToast('Pengawas Disimpan', `${cleaned.length} data pengawas dan Ketua TPU VI berhasil diperbarui.`, 'success');
    }
    onClose();
  };

  const filteredItems = items.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.asalSekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ruangTugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nip.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                  Edit Data Pengawas Ruang TPU VI Singingi Hilir
                </h3>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {items.length} Pengawas
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Kelola daftar nama pengawas silang antar-sekolah dasar dan identitas Ketua TPU VI
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
              onClick={() => setActiveSection('daftar')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                activeSection === 'daftar'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Daftar Pengawas ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('ketua')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                activeSection === 'ketua'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Ketua TPU VI Singingi Hilir
            </button>
          </div>

          {activeSection === 'daftar' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari pengawas / sekolah..."
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
                Tambah Pengawas
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeSection === 'daftar' ? (
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-sm">
                  Tidak ada pengawas yang cocok dengan pencarian.
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
                            Pengawas #{originalIndex + 1}
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
                            title="Hapus pengawas"
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer ml-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        <div className="sm:col-span-5 space-y-1">
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                            Nama Lengkap & Gelar
                          </label>
                          <input
                            type="text"
                            value={item.nama}
                            onChange={(e) => handleItemChange(item.id, 'nama', e.target.value)}
                            placeholder="Contoh: SUPARMAN, S.Pd"
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-4 space-y-1">
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                            NIP (18 Digit / -)
                          </label>
                          <input
                            type="text"
                            value={item.nip}
                            onChange={(e) => handleItemChange(item.id, 'nip', e.target.value)}
                            placeholder="19800101 200501 1 001"
                            className="w-full font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                            Ruang Tugas
                          </label>
                          <select
                            value={item.ruangTugas}
                            onChange={(e) => handleItemChange(item.id, 'ruangTugas', e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                          >
                            <option value="RUANG 1">RUANG 1</option>
                            <option value="RUANG 2">RUANG 2</option>
                            <option value="RUANG 3">RUANG 3</option>
                            <option value="RUANG 4">RUANG 4</option>
                            <option value="Pengawas Cadangan">Pengawas Cadangan</option>
                          </select>
                        </div>

                        <div className="sm:col-span-8 space-y-1">
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                            <School className="h-3 w-3" /> Asal Sekolah Pengawas (TPU VI Singingi Hilir)
                          </label>
                          <input
                            type="text"
                            value={item.asalSekolah}
                            onChange={(e) => handleItemChange(item.id, 'asalSekolah', e.target.value)}
                            placeholder="Contoh: SDN 002 Sumber Datar (TPU VI Singingi Hilir)"
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-4 space-y-1">
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> No. Kontak / WhatsApp
                          </label>
                          <input
                            type="text"
                            value={item.kontak}
                            onChange={(e) => handleItemChange(item.id, 'kontak', e.target.value)}
                            placeholder="0812-xxxx-xxxx"
                            className="w-full font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Tab Ketua TPU VI */
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-4 max-w-xl mx-auto">
              <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-700 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                    Penanggung Jawab / Ketua TPU VI Singingi Hilir
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Nama dan NIP ini dicetak pada pengesahan kolom kiri lembar daftar pengawas
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    Nama Lengkap & Gelar Ketua TPU VI
                  </label>
                  <input
                    type="text"
                    value={leader.namaKetuaTpu}
                    onChange={(e) => setLeader({ ...leader, namaKetuaTpu: e.target.value })}
                    placeholder="Contoh: SUPRIADI, M.Pd."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    NIP Ketua TPU VI
                  </label>
                  <input
                    type="text"
                    value={leader.nipKetuaTpu}
                    onChange={(e) => setLeader({ ...leader, nipKetuaTpu: e.target.value })}
                    placeholder="Contoh: 19720412 199603 1 003"
                    className="w-full font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                    Jabatan Pengesahan
                  </label>
                  <input
                    type="text"
                    value={leader.jabatanTpu}
                    onChange={(e) => setLeader({ ...leader, jabatanTpu: e.target.value })}
                    placeholder="Ketua TPU VI Singingi Hilir"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
