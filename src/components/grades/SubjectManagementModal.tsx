import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectInfo } from '../../types';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  Hash,
  Award,
} from 'lucide-react';

interface SubjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'list' | 'add';
  editSubjectKey?: string | null;
}

export const SubjectManagementModal: React.FC<SubjectManagementModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'list',
  editSubjectKey = null,
}) => {
  const { subjects, addSubject, updateSubject, deleteSubject, resetSubjectsToDefault, students } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'add'>(initialMode);
  const [editingSubject, setEditingSubject] = useState<SubjectInfo | null>(() => {
    if (editSubjectKey) {
      return subjects.find((s) => s.key === editSubjectKey) || null;
    }
    return null;
  });
  const [deletingSubject, setDeletingSubject] = useState<SubjectInfo | null>(null);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newKkm, setNewKkm] = useState<number>(75);
  const [newDefaultScore, setNewDefaultScore] = useState<number>(80);
  const [addError, setAddError] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editKkm, setEditKkm] = useState<number>(75);
  const [editError, setEditError] = useState('');

  // Sync edit mode when opened with editSubjectKey
  React.useEffect(() => {
    if (editSubjectKey) {
      const sub = subjects.find((s) => s.key === editSubjectKey);
      if (sub) {
        startEditing(sub);
      }
    }
  }, [editSubjectKey, subjects]);

  const startEditing = (sub: SubjectInfo) => {
    setEditingSubject(sub);
    setEditName(sub.name);
    setEditCode(sub.code);
    setEditKkm(sub.kkm);
    setEditError('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!newName.trim()) {
      setAddError('Nama mata pelajaran wajib diisi.');
      return;
    }

    const code = newCode.trim() || newName.trim().slice(0, 5).toUpperCase();

    // Check duplicate code or name
    if (subjects.some((s) => s.code.toLowerCase() === code.toLowerCase())) {
      setAddError(`Kode mapel "${code}" sudah digunakan. Silakan gunakan singkatan lain.`);
      return;
    }

    addSubject({
      name: newName.trim(),
      code: code.toUpperCase(),
      kkm: Number(newKkm) || 75,
      defaultScore: Number(newDefaultScore) || 80,
    });

    // Reset and switch back to list
    setNewName('');
    setNewCode('');
    setNewKkm(75);
    setNewDefaultScore(80);
    setActiveTab('list');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    if (!editName.trim()) {
      setEditError('Nama mata pelajaran tidak boleh kosong.');
      return;
    }

    const code = editCode.trim() || editName.trim().slice(0, 5).toUpperCase();

    // Check duplicate code with other subjects
    if (
      subjects.some(
        (s) => s.key !== editingSubject.key && s.code.toLowerCase() === code.toLowerCase()
      )
    ) {
      setEditError(`Kode mapel "${code}" sudah digunakan oleh mata pelajaran lain.`);
      return;
    }

    updateSubject(editingSubject.key, {
      name: editName.trim(),
      code: code.toUpperCase(),
      kkm: Number(editKkm) || 75,
    });

    setEditingSubject(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingSubject) return;
    deleteSubject(deletingSubject.key);
    setDeletingSubject(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Mata Pelajaran Ujian Sekolah"
      subtitle="Tambah mapel, edit nama pelajaran & KKM, atau hapus mapel ujian kurikulum SDN 006"
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                setEditingSubject(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'list' && !editingSubject
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Daftar Mapel ({subjects.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('add');
                setEditingSubject(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'add'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              }`}
            >
              <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Tambah Mapel Baru
            </button>
          </div>

          <button
            type="button"
            onClick={resetSubjectsToDefault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:text-zinc-900 transition-colors"
            title="Kembalikan daftar mata pelajaran ke 10 mata pelajaran standar kurikulum"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
            Reset ke Standar (10 Mapel)
          </button>
        </div>

        {/* TAB 1: LIST OF SUBJECTS */}
        {activeTab === 'list' && !editingSubject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <p>
                Daftar mata pelajaran yang digunakan dalam penilaian Ujian Sekolah, Kartu Ujian, Rekap Nilai, dan SKHU.
              </p>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {subjects.length} Mata Pelajaran Aktif
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/80 font-bold text-zinc-700 dark:text-zinc-200">
                    <tr>
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3 w-24">Kode</th>
                      <th className="p-3 min-w-[240px]">Nama Mata Pelajaran</th>
                      <th className="p-3 text-center w-24">KKM</th>
                      <th className="p-3 text-center w-36">Kelengkapan Nilai</th>
                      <th className="p-3 text-right w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {subjects.map((sub, idx) => {
                      const gradedCount = students.filter(
                        (s) => s.us[sub.key] && (s.us[sub.key].tulis > 0 || s.us[sub.key].akhir > 0)
                      ).length;

                      return (
                        <tr
                          key={sub.key}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="p-3 text-center font-bold text-zinc-400">
                            {idx + 1}
                          </td>
                          <td className="p-3">
                            <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-extrabold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                              {sub.code}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">
                              {sub.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              Key ID: {sub.key}
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {sub.kkm}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                              <Check className="h-3 w-3" />
                              {gradedCount}/{students.length} Siswa
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => startEditing(sub)}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1.5 text-[11px] font-bold text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 transition-colors"
                                title="Edit Nama & KKM Mapel"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingSubject(sub)}
                                disabled={subjects.length <= 1}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1.5 text-[11px] font-bold text-rose-800 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
                                title={
                                  subjects.length <= 1
                                    ? 'Tidak dapat menghapus satu-satunya mapel'
                                    : 'Hapus Mata Pelajaran'
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 flex items-start gap-2.5">
              <HelpCircle className="h-4 w-4 shrink-0 text-blue-700 dark:text-blue-400 mt-0.5" />
              <div>
                <strong>Informasi Sinkronisasi:</strong> Setiap perubahan nama, penambahan mapel, maupun penghapusan mapel akan langsung tersinkronisasi di menu{' '}
                <strong>Nilai Ujian Sekolah</strong>, <strong>Rekap Nilai Rapor</strong>,{' '}
                <strong>Transkrip Nilai / SKHU</strong>, serta format impor/ekspor Excel (.xlsx).
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TAMBAH MAPEL BARU */}
        {activeTab === 'add' && !editingSubject && (
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                Formulir Tambah Mata Pelajaran Baru
              </h3>
              <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300">
                Mata pelajaran baru akan otomatis dibuatkan kolom ujian teori dan praktik, serta diinisialisasi untuk seluruh {students.length} peserta ujian.
              </p>
            </div>

            {addError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {addError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                  Nama Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bahasa Arab, Pendidikan Lingkungan Hidup, Informatika..."
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newCode) {
                      const words = e.target.value.trim().split(/\s+/);
                      if (words.length > 1) {
                        setNewCode(words.map((w) => w[0]).join('').slice(0, 6).toUpperCase());
                      } else {
                        setNewCode(e.target.value.trim().slice(0, 5).toUpperCase());
                      }
                    }
                  }}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-emerald-600" />
                  Kode Singkat / Singkatan Mapel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Contoh: ARB, PLH, INF, TIK..."
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 font-mono text-xs font-bold uppercase text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Digunakan untuk header kolom tabel dan kartu ujian (maksimal 10 karakter).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-emerald-600" />
                  KKM (Kriteria Ketuntasan Minimal)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newKkm}
                  onChange={(e) => setNewKkm(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 font-mono text-xs font-bold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Standar ketuntasan kelulusan (biasanya antara 70 - 75).
                </p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Nilai Standar Awal untuk Seluruh Siswa Aktif
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newDefaultScore}
                  onChange={(e) => setNewDefaultScore(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 font-mono text-xs font-bold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Nilai ini akan diisi secara otomatis untuk seluruh siswa agar tidak ada nilai kosong. Nilai dapat diedit kapan saja melalui menu nilai.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Simpan & Tambahkan Mapel
              </button>
            </div>
          </form>
        )}

        {/* EDIT MODAL / INLINE VIEW */}
        {editingSubject && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  <h3 className="font-bold text-sm text-blue-950 dark:text-blue-200">
                    Edit Nama & Data Mata Pelajaran
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-blue-800/80 dark:text-blue-300">
                Mengubah informasi untuk mata pelajaran ID: <span className="font-mono font-bold">{editingSubject.key}</span>
              </p>
            </div>

            {editError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {editError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Nama Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Kode / Singkatan Mapel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 font-mono text-xs font-bold uppercase text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  KKM (Kriteria Ketuntasan Minimal)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editKkm}
                  onChange={(e) => setEditKkm(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 font-mono text-xs font-bold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition-colors"
              >
                <Check className="h-4 w-4" />
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}

        {/* DELETE CONFIRMATION DIALOG */}
        {deletingSubject && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-rose-300 bg-white p-5 shadow-2xl dark:border-rose-900 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Hapus Mata Pelajaran?
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Konfirmasi tindakan penghapusan mapel
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900 dark:border-rose-950 dark:bg-rose-950/40 dark:text-rose-200">
                Anda akan menghapus mata pelajaran{' '}
                <strong className="font-bold text-rose-950 dark:text-rose-100">
                  "{deletingSubject.name}" ({deletingSubject.code})
                </strong>
                . Nilai mata pelajaran ini tidak akan lagi tampil di rekapitulasi ujian sekolah.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingSubject(null)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Ya, Hapus Mapel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
