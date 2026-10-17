import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck2,
  Calendar,
  Clock,
  MapPin,
  Users,
  RotateCcw,
  Save,
  Sparkles,
  UserCheck,
  FileText,
  Layers,
} from 'lucide-react';
import {
  BeritaAcaraPelaksanaanState,
  DEFAULT_BERITA_ACARA_PELAKSANAAN,
} from './examAdminState';
import { Supervisor } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: BeritaAcaraPelaksanaanState;
  onSave: (updated: BeritaAcaraPelaksanaanState) => void;
  currentRoom: string;
  roomStudentsCount: number;
  schoolName: string;
  roomSupervisors: Supervisor[];
  subjectsList: { key: string; name: string }[];
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const EditBeritaAcaraPelaksanaanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  onSave,
  currentRoom,
  roomStudentsCount,
  schoolName,
  roomSupervisors,
  subjectsList,
  showToast,
}) => {
  const [formData, setFormData] = useState<BeritaAcaraPelaksanaanState>(data);

  useEffect(() => {
    if (isOpen) {
      setFormData(data);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleChange = (field: keyof BeritaAcaraPelaksanaanState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSyncWithRoom = () => {
    setFormData((prev) => ({
      ...prev,
      ruang: currentRoom,
      jumlahPesertaSeharusnya: roomStudentsCount || 16,
      jumlahPesertaHadir: roomStudentsCount || 16,
      jumlahPesertaTidakHadir: 0,
      lembarSoalEksamplar: roomStudentsCount || 16,
      lembarHasilKerjaEksamplar: roomStudentsCount || 16,
      pengawas1Nama: roomSupervisors[0]?.nama || prev.pengawas1Nama,
      pengawas1Nip: roomSupervisors[0]?.nip || prev.pengawas1Nip,
      pengawas2Nama: roomSupervisors[1]?.nama || prev.pengawas2Nama,
      pengawas2Nip: roomSupervisors[1]?.nip || prev.pengawas2Nip,
    }));

    if (showToast) {
      showToast(
        'Disinkronkan dengan Ruangan',
        `Data berita acara berhasil diselaraskan dengan ${currentRoom} (${roomStudentsCount} siswa & pengawas ruang).`,
        'success'
      );
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan naskah Berita Acara ke format persis file berita acara.pdf?')) {
      const resetState: BeritaAcaraPelaksanaanState = {
        ...DEFAULT_BERITA_ACARA_PELAKSANAAN,
        padaSekolah: schoolName || DEFAULT_BERITA_ACARA_PELAKSANAAN.padaSekolah,
        ruang: currentRoom || DEFAULT_BERITA_ACARA_PELAKSANAAN.ruang,
        jumlahPesertaSeharusnya: roomStudentsCount || DEFAULT_BERITA_ACARA_PELAKSANAAN.jumlahPesertaSeharusnya,
        jumlahPesertaHadir: roomStudentsCount || DEFAULT_BERITA_ACARA_PELAKSANAAN.jumlahPesertaHadir,
        lembarSoalEksamplar: roomStudentsCount || DEFAULT_BERITA_ACARA_PELAKSANAAN.lembarSoalEksamplar,
        lembarHasilKerjaEksamplar: roomStudentsCount || DEFAULT_BERITA_ACARA_PELAKSANAAN.lembarHasilKerjaEksamplar,
        pengawas1Nama: roomSupervisors[0]?.nama || DEFAULT_BERITA_ACARA_PELAKSANAAN.pengawas1Nama,
        pengawas1Nip: roomSupervisors[0]?.nip || DEFAULT_BERITA_ACARA_PELAKSANAAN.pengawas1Nip,
        pengawas2Nama: roomSupervisors[1]?.nama || DEFAULT_BERITA_ACARA_PELAKSANAAN.pengawas2Nama,
        pengawas2Nip: roomSupervisors[1]?.nip || DEFAULT_BERITA_ACARA_PELAKSANAAN.pengawas2Nip,
      };
      setFormData(resetState);
      if (showToast) {
        showToast('Reset Default', 'Naskah Berita Acara dikembalikan ke format standar PDF.', 'info');
      }
    }
  };

  const handleSave = () => {
    onSave(formData);
    if (showToast) {
      showToast('Berita Acara Disimpan', 'Perubahan susunan kata Berita Acara berhasil disimpan.', 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="flex flex-col w-full max-w-3xl max-h-[92vh] rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                  Edit Berita Acara Pelaksanaan Ujian Sekolah (US)
                </h3>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  Format Sesuai PDF
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Susunan kata-kata, poin a (waktu & peserta), poin b (sampul & naskah), poin c (catatan), dan TTD pengawas
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

        {/* Action Quick Sync */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="text-zinc-600 dark:text-zinc-400">
            Ruangan Saat Ini: <b className="text-emerald-700 dark:text-emerald-400">{currentRoom}</b> ({roomStudentsCount} Siswa)
          </div>
          <button
            type="button"
            onClick={handleSyncWithRoom}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Isi Otomatis dari {currentRoom}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Judul & Tanggal Pembuka */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Paragraf Pembuka: Pada hari ini ... tanggal ... bulan ... tahun ...
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Hari
                </label>
                <input
                  type="text"
                  value={formData.hari}
                  onChange={(e) => handleChange('hari', e.target.value)}
                  placeholder="Senin"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Tanggal
                </label>
                <input
                  type="text"
                  value={formData.tanggal}
                  onChange={(e) => handleChange('tanggal', e.target.value)}
                  placeholder="18"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Bulan
                </label>
                <input
                  type="text"
                  value={formData.bulan}
                  onChange={(e) => handleChange('bulan', e.target.value)}
                  placeholder="Mei"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Tahun
                </label>
                <input
                  type="text"
                  value={formData.tahun}
                  onChange={(e) => handleChange('tahun', e.target.value)}
                  placeholder="2026"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  value={formData.tahunPelajaran}
                  onChange={(e) => handleChange('tahunPelajaran', e.target.value)}
                  placeholder="2025/2026"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Poin a: Ujian Sekolah (US) pada pukul & Data Sekolah / Ruang */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              Poin a. Penyelenggaraan Ujian Sekolah (US)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-6 space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Waktu Pelaksanaan (pukul ..... s/d .....)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.waktuMulai}
                    onChange={(e) => handleChange('waktuMulai', e.target.value)}
                    placeholder="08.00"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                  />
                  <span className="font-bold text-zinc-500">s/d</span>
                  <input
                    type="text"
                    value={formData.waktuSelesai}
                    onChange={(e) => handleChange('waktuSelesai', e.target.value)}
                    placeholder="10.00"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                  />
                </div>
              </div>

              <div className="sm:col-span-6 space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Pada Sekolah
                </label>
                <input
                  type="text"
                  value={formData.padaSekolah}
                  onChange={(e) => handleChange('padaSekolah', e.target.value)}
                  placeholder="SD NEGERI 006 SUNGAI BULUH"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Ruang
                </label>
                <input
                  type="text"
                  value={formData.ruang}
                  onChange={(e) => handleChange('ruang', e.target.value)}
                  placeholder="RUANG 1"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Jumlah Peserta seharusnya
                </label>
                <input
                  type="number"
                  value={formData.jumlahPesertaSeharusnya}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      jumlahPesertaSeharusnya: val,
                      jumlahPesertaHadir: Math.max(0, val - prev.jumlahPesertaTidakHadir),
                    }));
                  }}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Jumlah Peserta tidak hadir
                </label>
                <input
                  type="number"
                  value={formData.jumlahPesertaTidakHadir}
                  onChange={(e) => {
                    const thadir = Number(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      jumlahPesertaTidakHadir: thadir,
                      jumlahPesertaHadir: Math.max(0, prev.jumlahPesertaSeharusnya - thadir),
                    }));
                  }}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Jumlah Peserta yang hadir
                </label>
                <input
                  type="number"
                  value={formData.jumlahPesertaHadir}
                  onChange={(e) => handleChange('jumlahPesertaHadir', Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Poin b: Pembukaan Sampul Soal & Eksamplar */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              Poin b. Pembukaan Sampul Soal & Lembar Kerja
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-6 space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Untuk Mata Pelajaran
                </label>
                <input
                  type="text"
                  list="mapel-options"
                  value={formData.mataPelajaran}
                  onChange={(e) => handleChange('mataPelajaran', e.target.value)}
                  placeholder="Bahasa Indonesia"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <datalist id="mapel-options">
                  {subjectsList.map((s) => (
                    <option key={s.key} value={s.name} />
                  ))}
                </datalist>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Lembar Soal (eksamplar)
                </label>
                <input
                  type="number"
                  value={formData.lembarSoalEksamplar}
                  onChange={(e) => handleChange('lembarSoalEksamplar', Number(e.target.value))}
                  placeholder="16"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Lembar Hasil Kerja (eksamplar)
                </label>
                <input
                  type="number"
                  value={formData.lembarHasilKerjaEksamplar}
                  onChange={(e) => handleChange('lembarHasilKerjaEksamplar', Number(e.target.value))}
                  placeholder="16"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-12 text-[11px] text-zinc-500 italic bg-white dark:bg-zinc-800/80 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                Bunyi Naskah: "Di ruang kelas dengan saksi oleh para peserta Ujian Sekolah (US) dan berisi lembar soal <b>{formData.lembarSoalEksamplar}</b> eksamplar, lembar hasil kerja sebanyak <b>{formData.lembarHasilKerjaEksamplar}</b> eksamplar."
              </div>
            </div>
          </div>

          {/* Poin c: Catatan selama Ujian Sekolah (US) berlangsung */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Poin c. Catatan selama Ujian Sekolah (US) berlangsung
            </h4>

            <div className="space-y-2 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 text-[11px] block">
                  Baris Catatan 1
                </label>
                <input
                  type="text"
                  value={formData.catatan1}
                  onChange={(e) => handleChange('catatan1', e.target.value)}
                  placeholder="Pelaksanaan Ujian Sekolah (US) berlangsung dengan tertib, aman, dan lancar."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 text-[11px] block">
                  Baris Catatan 2
                </label>
                <input
                  type="text"
                  value={formData.catatan2}
                  onChange={(e) => handleChange('catatan2', e.target.value)}
                  placeholder="Seluruh peserta ujian mematuhi tata tertib dan hadir lengkap."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 text-[11px] block">
                  Baris Catatan 3
                </label>
                <input
                  type="text"
                  value={formData.catatan3}
                  onChange={(e) => handleChange('catatan3', e.target.value)}
                  placeholder="Kondisi naskah soal dan lembar jawaban dalam keadaan baik dan tersegel."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Yang membuat berita acara : Pengawas (1 & 2) */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              Yang membuat berita acara : Pengawas (Ruang Ujian)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Pengawas 1 */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-800 space-y-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs block">
                  1. Pengawas 1
                </span>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 block">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    value={formData.pengawas1Nama}
                    onChange={(e) => handleChange('pengawas1Nama', e.target.value)}
                    placeholder="Contoh: SUHARTINI, S.Pd"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 block">
                    NIP (18 Digit / -)
                  </label>
                  <input
                    type="text"
                    value={formData.pengawas1Nip}
                    onChange={(e) => handleChange('pengawas1Nip', e.target.value)}
                    placeholder="19750814 200212 2 003"
                    className="w-full font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Pengawas 2 */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-800 space-y-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs block">
                  2. Pengawas 2
                </span>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 block">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    value={formData.pengawas2Nama}
                    onChange={(e) => handleChange('pengawas2Nama', e.target.value)}
                    placeholder="Contoh: AHMAD RIDWAN, S.Pd.SD"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500 block">
                    NIP (18 Digit / -)
                  </label>
                  <input
                    type="text"
                    value={formData.pengawas2Nip}
                    onChange={(e) => handleChange('pengawas2Nip', e.target.value)}
                    placeholder="19810315 200604 1 009"
                    className="w-full font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer w-full sm:w-auto justify-center"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Kembalikan ke Format Asli PDF
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
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Simpan Berita Acara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
