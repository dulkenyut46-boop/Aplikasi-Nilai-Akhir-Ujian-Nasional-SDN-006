import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Check,
  RotateCcw,
  Mail,
  FileSignature,
  Users,
  Scale,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Building,
  UserCheck,
} from 'lucide-react';
import {
  GraduationDocType,
  loadUndanganDocState,
  saveUndanganDocState,
  DEFAULT_UNDANGAN,
  UndanganDocState,
  loadBeritaAcaraDocState,
  saveBeritaAcaraDocState,
  DEFAULT_BERITA_ACARA,
  BeritaAcaraDocState,
  loadSKKelulusanState,
  saveSKKelulusanState,
  DEFAULT_SK_KELULUSAN,
  SKKelulusanState,
  loadGuruRapatList,
  saveGuruRapatList,
  GuruRapat,
  DEFAULT_GURU_RAPAT,
  loadHadirRapatMeta,
  saveHadirRapatMeta,
} from './graduationDocsState';
import { EditGuruRapatModal } from './EditGuruRapatModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDocType: GraduationDocType;
  onDocTypeChange?: (doc: GraduationDocType) => void;
  onDataSaved: () => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const EditGraduationDocModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentDocType,
  onDocTypeChange,
  onDataSaved,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<GraduationDocType>(
    currentDocType === 'semua' ? 'undangan' : currentDocType
  );

  // States
  const [undangan, setUndangan] = useState<UndanganDocState>(loadUndanganDocState);
  const [ba, setBa] = useState<BeritaAcaraDocState>(loadBeritaAcaraDocState);
  const [sk, setSk] = useState<SKKelulusanState>(loadSKKelulusanState);
  const [guruList, setGuruList] = useState<GuruRapat[]>(loadGuruRapatList);

  // Additional meeting fields for hadir-rapat
  const [rapatTanggal, setRapatTanggal] = useState('Sabtu, 30 Mei 2026');
  const [rapatJam, setRapatJam] = useState('11.00 WIB s.d. Selesai');
  const [rapatTempat, setRapatTempat] = useState('Ruang Guru SDN 006 Sungai Buluh');
  const [rapatPengesahanTanggal, setRapatPengesahanTanggal] = useState('Sungai Buluh, 30 Mei 2026');
  const [notulisNama, setNotulisNama] = useState('BUDI SANTOSO, S.Pd.SD');
  const [notulisNip, setNotulisNip] = useState('19851210 200903 1 005');

  const [isEditGuruModalOpen, setIsEditGuruModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentDocType && currentDocType !== 'semua') {
        setActiveTab(currentDocType);
      }
      setUndangan(loadUndanganDocState());
      setBa(loadBeritaAcaraDocState());
      setSk(loadSKKelulusanState());
      setGuruList(loadGuruRapatList());

      // Read stored hadir rapat metadata if available
      const hadirData = loadHadirRapatMeta();
      setRapatTanggal(hadirData.rapatTanggal);
      setRapatJam(hadirData.rapatJam);
      setRapatTempat(hadirData.rapatTempat);
      setRapatPengesahanTanggal(hadirData.rapatPengesahanTanggal);
      setNotulisNama(hadirData.notulisNama);
      setNotulisNip(hadirData.notulisNip);
    }
  }, [isOpen, currentDocType]);

  if (!isOpen) return null;

  const handleTabChange = (tab: GraduationDocType) => {
    setActiveTab(tab);
    onDocTypeChange?.(tab);
  };

  const handleSaveAll = () => {
    saveUndanganDocState(undangan);
    saveBeritaAcaraDocState(ba);
    saveSKKelulusanState(sk);
    saveGuruRapatList(guruList);
    saveHadirRapatMeta({
      rapatTanggal,
      rapatJam,
      rapatTempat,
      rapatPengesahanTanggal,
      notulisNama,
      notulisNip,
    });

    onDataSaved();
    if (showToast) {
      showToast(
        'Data Berhasil Disimpan',
        'Perubahan dokumen lembar kerja berhasil disimpan dan langsung diterapkan pada pratinjau cetak.',
        'success'
      );
    }
    onClose();
  };

  const handleResetCurrentTab = () => {
    if (activeTab === 'undangan') {
      setUndangan(DEFAULT_UNDANGAN);
    } else if (activeTab === 'ba-kelulusan') {
      setBa(DEFAULT_BERITA_ACARA);
    } else if (activeTab === 'hadir-rapat') {
      setRapatTanggal('Sabtu, 30 Mei 2026');
      setRapatJam('11.00 WIB s.d. Selesai');
      setRapatTempat('Ruang Guru SDN 006 Sungai Buluh');
      setRapatPengesahanTanggal('Sungai Buluh, 30 Mei 2026');
      setNotulisNama('BUDI SANTOSO, S.Pd.SD');
      setNotulisNip('19851210 200903 1 005');
      setGuruList(DEFAULT_GURU_RAPAT);
    } else if (activeTab === 'sk-kelulusan') {
      setSk(DEFAULT_SK_KELULUSAN);
    }
    if (showToast) {
      showToast('Reset Form', `Isian dokumen telah dikembalikan ke format default baku dinas.`, 'info');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="flex flex-col w-full max-w-4xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-zinc-900 dark:text-zinc-100">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm shrink-0">
                <Edit3 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span>Ubah / Edit Data Dokumen Lembar Kerja</span>
                  <span className="hidden sm:inline-block rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 px-2 py-0.5 text-[10px] font-bold">
                    Navigasi Lembar Kerja
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  Edit data nomor, tanggal, tempat, diktum dan susunan panitia/dewan guru secara langsung
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sub Navigation Bar for the 4 Worksheet Sheets */}
          <div className="flex overflow-x-auto gap-1.5 px-6 py-2.5 bg-zinc-100/80 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            {[
              { key: 'undangan', label: '1. Undangan Rapat', icon: Mail },
              { key: 'ba-kelulusan', label: '2. Berita Acara', icon: FileSignature },
              { key: 'hadir-rapat', label: '3. Daftar Hadir Rapat', icon: Users },
              { key: 'sk-kelulusan', label: '4. SK Kelulusan', icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key as GraduationDocType)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-500'
                      : 'bg-white text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body / Scrollable Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {/* ========================================================
                1. FORM UNDANGAN RAPAT
               ======================================================== */}
            {activeTab === 'undangan' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    Formulir Naskah Surat Undangan Rapat Dewan Guru & Tendik (Halaman 1 Navigasi Lembar Kerja)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nomor Surat Undangan:
                    </label>
                    <input
                      type="text"
                      value={undangan.nomor}
                      onChange={(e) => setUndangan({ ...undangan, nomor: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Sifat Surat:
                    </label>
                    <input
                      type="text"
                      value={undangan.sifat}
                      onChange={(e) => setUndangan({ ...undangan, sifat: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Lampiran:
                    </label>
                    <input
                      type="text"
                      value={undangan.lampiran}
                      onChange={(e) => setUndangan({ ...undangan, lampiran: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Perihal / Hal Surat:
                    </label>
                    <input
                      type="text"
                      value={undangan.hal}
                      onChange={(e) => setUndangan({ ...undangan, hal: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-semibold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tujuan Surat (Kepada Yth):
                    </label>
                    <input
                      type="text"
                      value={undangan.tujuan}
                      onChange={(e) => setUndangan({ ...undangan, tujuan: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-semibold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tempat Tujuan Surat:
                    </label>
                    <input
                      type="text"
                      value={undangan.tempatTujuan}
                      onChange={(e) => setUndangan({ ...undangan, tempatTujuan: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tempat Surat Dibuat:
                    </label>
                    <input
                      type="text"
                      value={undangan.tempatSurat}
                      onChange={(e) => setUndangan({ ...undangan, tempatSurat: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tanggal Surat Dikeluarkan:
                    </label>
                    <input
                      type="text"
                      value={undangan.tanggalSurat}
                      onChange={(e) => setUndangan({ ...undangan, tanggalSurat: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Hari / Tanggal Rapat:
                    </label>
                    <input
                      type="text"
                      value={undangan.hariTanggal}
                      onChange={(e) => setUndangan({ ...undangan, hariTanggal: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Waktu / Jam Pelaksanaan:
                    </label>
                    <input
                      type="text"
                      value={undangan.jam}
                      onChange={(e) => setUndangan({ ...undangan, jam: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tempat Rapat:
                    </label>
                    <input
                      type="text"
                      value={undangan.tempat}
                      onChange={(e) => setUndangan({ ...undangan, tempat: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Agenda Acara Rapat:
                  </label>
                  <input
                    type="text"
                    value={undangan.acara}
                    onChange={(e) => setUndangan({ ...undangan, acara: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-semibold text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Paragraf Pengantar:
                  </label>
                  <textarea
                    rows={2}
                    value={undangan.paragrafPengantar}
                    onChange={(e) => setUndangan({ ...undangan, paragrafPengantar: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Paragraf Penutup:
                  </label>
                  <textarea
                    rows={2}
                    value={undangan.paragrafPenutup}
                    onChange={(e) => setUndangan({ ...undangan, paragrafPenutup: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={undangan.showTembusan}
                      onChange={(e) => setUndangan({ ...undangan, showTembusan: e.target.checked })}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Sertakan Catatan Tembusan Surat di Bagian Bawah
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ========================================================
                2. FORM BERITA ACARA KELULUSAN
               ======================================================== */}
            {activeTab === 'ba-kelulusan' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    Formulir Berita Acara Rapat Musyawarah Dewan Guru (Halaman 2 Navigasi Lembar Kerja)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nomor Berita Acara:
                    </label>
                    <input
                      type="text"
                      value={ba.nomor}
                      onChange={(e) => setBa({ ...ba, nomor: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Judul Dokumen:
                    </label>
                    <input
                      type="text"
                      value={ba.judul}
                      onChange={(e) => setBa({ ...ba, judul: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Hari & Tanggal Rapat Terbilang:
                    </label>
                    <input
                      type="text"
                      value={ba.hariTanggalTerbilang}
                      onChange={(e) => setBa({ ...ba, hariTanggalTerbilang: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tahun Pelajaran (Terbilang):
                    </label>
                    <input
                      type="text"
                      value={ba.tahunPelajaranTeks}
                      onChange={(e) => setBa({ ...ba, tahunPelajaranTeks: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tempat Pelaksanaan Rapat:
                  </label>
                  <input
                    type="text"
                    value={ba.tempat}
                    onChange={(e) => setBa({ ...ba, tempat: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Total Peserta Kelas VI:
                    </label>
                    <input
                      type="number"
                      value={ba.totalPeserta}
                      onChange={(e) => setBa({ ...ba, totalPeserta: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Jumlah Peserta Lulus:
                    </label>
                    <input
                      type="number"
                      value={ba.pesertaLulus}
                      onChange={(e) => setBa({ ...ba, pesertaLulus: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold text-emerald-700 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Jumlah Tidak Lulus:
                    </label>
                    <input
                      type="number"
                      value={ba.pesertaTidakLulus}
                      onChange={(e) => setBa({ ...ba, pesertaTidakLulus: Number(e.target.value) })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold text-zinc-700 dark:text-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Dibuat di:
                    </label>
                    <input
                      type="text"
                      value={ba.dibuatDi}
                      onChange={(e) => setBa({ ...ba, dibuatDi: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Pada Tanggal:
                    </label>
                    <input
                      type="text"
                      value={ba.padaTanggal}
                      onChange={(e) => setBa({ ...ba, padaTanggal: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nama Notulis / Sekretaris:
                    </label>
                    <input
                      type="text"
                      value={ba.namaNotulis}
                      onChange={(e) => setBa({ ...ba, namaNotulis: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      NIP Notulis:
                    </label>
                    <input
                      type="text"
                      value={ba.nipNotulis}
                      onChange={(e) => setBa({ ...ba, nipNotulis: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Paragraf Pembuka:
                  </label>
                  <textarea
                    rows={2}
                    value={ba.paragrafPembuka}
                    onChange={(e) => setBa({ ...ba, paragrafPembuka: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Paragraf Penutup:
                  </label>
                  <textarea
                    rows={2}
                    value={ba.paragrafPenutup}
                    onChange={(e) => setBa({ ...ba, paragrafPenutup: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ba.showNotulis}
                      onChange={(e) => setBa({ ...ba, showNotulis: e.target.checked })}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Tampilkan Kolom Tanda Tangan Notulis / Sekretaris Rapat
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ========================================================
                3. FORM DAFTAR HADIR RAPAT
               ======================================================== */}
            {activeTab === 'hadir-rapat' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold text-[11px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>
                      Daftar Hadir Dewan Guru & Tenaga Kependidikan ({guruList.length} Guru/Tendik)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditGuruModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 text-xs shadow-xs transition-colors shrink-0"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Kelola Nama & NIP Guru
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Hari / Tanggal Rapat:
                    </label>
                    <input
                      type="text"
                      value={rapatTanggal}
                      onChange={(e) => setRapatTanggal(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Waktu / Jam Pelaksanaan:
                    </label>
                    <input
                      type="text"
                      value={rapatJam}
                      onChange={(e) => setRapatJam(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tempat Pelaksanaan:
                    </label>
                    <input
                      type="text"
                      value={rapatTempat}
                      onChange={(e) => setRapatTempat(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Titimangsa Pengesahan Tanggal:
                    </label>
                    <input
                      type="text"
                      value={rapatPengesahanTanggal}
                      onChange={(e) => setRapatPengesahanTanggal(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nama Notulis / Sekretaris Rapat:
                    </label>
                    <input
                      type="text"
                      value={notulisNama}
                      onChange={(e) => setNotulisNama(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      NIP Notulis:
                    </label>
                    <input
                      type="text"
                      value={notulisNip}
                      onChange={(e) => setNotulisNip(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Preview 5 Guru Teratas */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-850">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
                      Susunan Dewan Guru Terdaftar ({guruList.length} Orang):
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditGuruModalOpen(true)}
                      className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                    >
                      Buka Pengelola Seluruh Guru &rarr;
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {guruList.slice(0, 6).map((g, idx) => (
                      <div
                        key={g.id || idx}
                        className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      >
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {idx + 1}. {g.nama}
                        </span>
                        <span className="text-zinc-500 font-medium">{g.jabatan}</span>
                      </div>
                    ))}
                    {guruList.length > 6 && (
                      <p className="text-center text-[10px] text-zinc-400 font-semibold pt-1">
                        ... dan {guruList.length - 6} guru / staf lainnya
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                4. FORM SK KELULUSAN
               ======================================================== */}
            {activeTab === 'sk-kelulusan' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    Formulir Surat Keputusan (SK) Kelulusan Kepala Sekolah (Halaman 4 Navigasi Lembar Kerja)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nomor SK Kelulusan:
                    </label>
                    <input
                      type="text"
                      value={sk.nomor}
                      onChange={(e) => setSk({ ...sk, nomor: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tentang / Judul Penetapan SK:
                    </label>
                    <input
                      type="text"
                      value={sk.tentang}
                      onChange={(e) => setSk({ ...sk, tentang: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Menimbang (Butir a):
                    </label>
                    <textarea
                      rows={2}
                      value={sk.menimbangA}
                      onChange={(e) => setSk({ ...sk, menimbangA: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Menimbang (Butir b):
                    </label>
                    <textarea
                      rows={2}
                      value={sk.menimbangB}
                      onChange={(e) => setSk({ ...sk, menimbangB: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Diktum KESATU:
                    </label>
                    <textarea
                      rows={2}
                      value={sk.diktumKesatu}
                      onChange={(e) => setSk({ ...sk, diktumKesatu: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Diktum KEDUA:
                    </label>
                    <textarea
                      rows={2}
                      value={sk.diktumKedua}
                      onChange={(e) => setSk({ ...sk, diktumKedua: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Ditetapkan di:
                    </label>
                    <input
                      type="text"
                      value={sk.ditetapkanDi}
                      onChange={(e) => setSk({ ...sk, ditetapkanDi: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Pada Tanggal:
                    </label>
                    <input
                      type="text"
                      value={sk.padaTanggal}
                      onChange={(e) => setSk({ ...sk, padaTanggal: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sk.showTembusan}
                      onChange={(e) => setSk({ ...sk, showTembusan: e.target.checked })}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Tampilkan Tembusan Surat (Dinas, Korwil, Komite, Arsip)
                    </span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sk.showLampiran}
                      onChange={(e) => setSk({ ...sk, showLampiran: e.target.checked })}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Sertakan Lampiran Tabel 80 Siswa Lulus di Halaman Berikutnya
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
            <button
              type="button"
              onClick={handleResetCurrentTab}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750 font-semibold transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Default Dokumen Ini</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-md active:scale-95 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Simpan & Terapkan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit Dewan Guru Rapat */}
      <EditGuruRapatModal
        isOpen={isEditGuruModalOpen}
        onClose={() => {
          setIsEditGuruModalOpen(false);
          setGuruList(loadGuruRapatList());
        }}
        guruList={guruList}
        onSave={(newList) => {
          setGuruList(newList);
          saveGuruRapatList(newList);
          setIsEditGuruModalOpen(false);
        }}
        showToast={showToast}
      />
    </>
  );
};
