import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  SUBJECT_LIST,
  calculateSubjectFinalScore,
  calculateStudentOverallFinalScore,
  calculateStudentTotalFinalScore,
} from '../../constants/subjects';
import { Badge } from '../common/Badge';
import { KopSurat } from '../common/KopSurat';
import { PrintPreviewModal } from '../common/PrintPreviewModal';
import {
  GraduationCap,
  Printer,
  FileText,
  BookMarked,
  CheckCircle,
  Search,
  Building,
  School,
  Award,
  Download,
  Users,
} from 'lucide-react';

export const DiplomaManagementView: React.FC = () => {
  const {
    students,
    schoolProfile,
    subjects,
    diplomaRecords,
    updateDiplomaRecord,
    selectedStudentForSKHU,
    setSelectedStudentForSKHU,
    updateStudent,
    showToast,
  } = useApp();

  type TabKey = 'skhu' | 'sk-kelulusan' | 'blangko' | 'serah-terima' | 'register' | 'perpisahan';
  const [activeTab, setActiveTab] = useState<TabKey>('skhu');
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    selectedStudentForSKHU?.id || students[0]?.id || ''
  );
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printSelectedDoc, setPrintSelectedDoc] = useState<TabKey>('skhu');

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handlePrintDocument = (docToPrint?: TabKey) => {
    setPrintSelectedDoc(docToPrint || activeTab);
    setIsPrintModalOpen(true);
  };

  const handleDeliveryUpdate = (id: string, date: string, recipient: string) => {
    updateStudent(id, {
      tanggalAmbilIjazah: date,
      penerimaIjazah: recipient,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Penerbitan Transkrip Nilai, SK Kelulusan & Pengelolaan Ijazah
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Cetak format resmi Transkrip Nilai, SK Kelulusan, Laporan Blangko, dan Buku Serah Terima
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePrintDocument(activeTab)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Cetak Dokumen Terpilih
          </button>
        </div>
      </div>

      {/* Navigation Sub Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 print:hidden">
        {[
          { key: 'skhu', label: 'Transkrip Nilai', icon: FileText },
          { key: 'sk-kelulusan', label: 'Surat Keputusan (SK) Kelulusan', icon: Award },
          { key: 'blangko', label: 'Laporan Blangko Ijazah', icon: BookMarked },
          { key: 'serah-terima', label: 'Buku Serah Terima Ijazah', icon: CheckCircle },
          { key: 'register', label: 'Register No. Ijazah & Surat', icon: BookMarked },
          { key: 'perpisahan', label: 'Daftar Hadir Perpisahan', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. CETAK TRANSKRIP NILAI RESMI */}
      {activeTab === 'skhu' && (
        <div className="space-y-6">
          {/* Student Selector Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 print:hidden">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                Pilih Peserta Didik:
              </span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full sm:w-80 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.noPeserta} - {s.nama} ({s.ruang})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-500 font-medium hidden md:block">
                Format Resmi Transkrip Nilai Siswa SDN 006 Sungai Buluh
              </div>
              <button
                onClick={() => handlePrintDocument('skhu')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors shrink-0"
              >
                <Printer className="h-4 w-4" />
                Cetak Transkrip Ini
              </button>
            </div>
          </div>

          {/* Official Printable Transkrip Nilai / SKHU Sheet */}
          <div className="mx-auto max-w-4xl rounded-2xl border-2 border-zinc-300 bg-white p-8 sm:p-12 shadow-md dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full">
            {/* Kop Surat Resmi */}
            <KopSurat schoolProfile={schoolProfile} />

            {/* Document Title */}
            <div className="text-center my-6">
              <h3 className="text-base font-extrabold uppercase underline tracking-wider">
                TRANSKRIP NILAI
              </h3>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-0.5">
                Nomor: {currentStudent.noSuratTranskrip || `421.2 / SDN-006 / TRANSKRIP / ${schoolProfile.tahunPelajaran.replace('/', '-')} / ${currentStudent.noMeja.toString().padStart(3, '0')}`}
              </p>
            </div>

            {/* Student & School Identity Form */}
            <div className="rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 p-4 border border-zinc-200 dark:border-zinc-700 text-xs mb-6">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-700/50">
                  <tr>
                    <td className="w-56 sm:w-64 py-1.5 text-zinc-600 dark:text-zinc-400 font-medium">Satuan Pendidikan</td>
                    <td className="w-4 py-1.5">:</td>
                    <td className="py-1.5 font-bold text-zinc-950 dark:text-zinc-50 uppercase">{schoolProfile.namaSekolah}</td>
                  </tr>
                  <tr>
                    <td className="w-56 sm:w-64 py-1.5 text-zinc-600 dark:text-zinc-400 font-medium">Nomor Pokok Sekolah Nasional</td>
                    <td className="w-4 py-1.5">:</td>
                    <td className="py-1.5 font-mono font-medium">{schoolProfile.npsn}</td>
                  </tr>
                  <tr>
                    <td className="w-56 sm:w-64 py-1.5 text-zinc-600 dark:text-zinc-400 font-medium">Nama Siswa</td>
                    <td className="w-4 py-1.5">:</td>
                    <td className="py-1.5 font-extrabold uppercase text-zinc-950 dark:text-zinc-50">{currentStudent.nama}</td>
                  </tr>
                  <tr>
                    <td className="w-56 sm:w-64 py-1.5 text-zinc-600 dark:text-zinc-400 font-medium">Tempat Tanggal Lahir</td>
                    <td className="w-4 py-1.5">:</td>
                    <td className="py-1.5 font-medium">{currentStudent.tempatLahir}, {currentStudent.tanggalLahir}</td>
                  </tr>
                  <tr>
                    <td className="w-56 sm:w-64 py-1.5 text-zinc-600 dark:text-zinc-400 font-medium">Nomor Induk Siswa Nasional</td>
                    <td className="w-4 py-1.5">:</td>
                    <td className="py-1.5 font-mono font-medium">{currentStudent.nisn}</td>
                  </tr>
                  <tr>
                    <td className="w-56 sm:w-64 py-1.5 text-zinc-600 dark:text-zinc-400 font-medium">Nomor Ijazah</td>
                    <td className="w-4 py-1.5">:</td>
                    <td className="py-1.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">{currentStudent.noSeriIjazah || '-'}</td>
                  </tr>
                  <tr>
                    <td className="w-56 sm:w-64 py-1.5 text-zinc-600 dark:text-zinc-400 font-medium">Tanggal kelulusan</td>
                    <td className="w-4 py-1.5">:</td>
                    <td className="py-1.5 font-medium">{schoolProfile.tanggalKelulusan}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table of Grades */}
            <div className="overflow-x-auto rounded-xl border border-zinc-300 dark:border-zinc-700 mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border-b border-zinc-300 dark:border-zinc-700">
                  <tr>
                    <th className="p-2.5 w-12 text-center border-r border-zinc-300 dark:border-zinc-700">No</th>
                    <th className="p-2.5 min-w-[240px] border-r border-zinc-300 dark:border-zinc-700">
                      Mata Pelajaran (Kurikulum 2013)
                    </th>
                    <th className="p-2.5 text-center w-28">
                      Nilai
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {subjects.map((sub, idx) => {
                    const na = calculateSubjectFinalScore(currentStudent, sub.key, schoolProfile);

                    return (
                      <tr key={sub.key} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-2.5 text-center font-medium border-r border-zinc-200 dark:border-zinc-700">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-700">
                          {sub.name}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-800 dark:text-emerald-400">
                          {na.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 font-bold">
                  <tr>
                    <td colSpan={2} className="p-2.5 text-right uppercase border-r border-zinc-300 dark:border-zinc-700">
                      Jumlah / Total Nilai :
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {calculateStudentTotalFinalScore(currentStudent, schoolProfile, subjects).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-2.5 text-right uppercase border-r border-zinc-300 dark:border-zinc-700">
                      Rata-Rata Nilai :
                    </td>
                    <td className="p-2.5 text-center font-mono font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                      {calculateStudentOverallFinalScore(currentStudent, schoolProfile, subjects).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Tanda Tangan Kepala Sekolah */}
            <div className="flex justify-end pt-6 text-xs break-inside-avoid">
              <div className="w-72 text-right space-y-1">
                <p>Sungai Buluh, {schoolProfile.tanggalKelulusan}</p>
                <p className="font-semibold">Kepala Sekolah SDN 006 Sungai Buluh,</p>
                <div className="h-16"></div>
                <p className="font-extrabold underline text-sm uppercase">
                  {schoolProfile.kepalaSekolah}
                </p>
                <p className="pt-0.5 text-zinc-700 dark:text-zinc-300 font-normal">
                  NIP. {schoolProfile.nipKepalaSekolah}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SURAT KEPUTUSAN KELULUSAN RESMI */}
      {activeTab === 'sk-kelulusan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 print:hidden">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Pratinjau Surat Keputusan (SK) Kelulusan</h4>
              <p className="text-xs text-zinc-500">Format resmi Keputusan Kepala Sekolah & Lampiran Rekapitulasi Nilai Akhir</p>
            </div>
            <button
              onClick={() => handlePrintDocument('sk-kelulusan')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Cetak SK Kelulusan
            </button>
          </div>

          <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-md dark:border-zinc-800 dark:bg-zinc-900 space-y-6 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed font-serif print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full">
            {/* Kop Surat Resmi SK Kelulusan */}
            <KopSurat schoolProfile={schoolProfile} />

          <div className="text-center space-y-1 pt-2 pb-2">
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-zinc-900 dark:text-zinc-50">
              K E P U T U S A N
            </h3>
            <h4 className="text-xs sm:text-sm font-bold uppercase text-zinc-900 dark:text-zinc-100">
              KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH
            </h4>
            <p className="font-mono font-bold text-xs text-zinc-600 dark:text-zinc-400">
              NOMOR : 422/KPTS/SDN-006/SB/VI/2026/041
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-widest">T E N T A N G</p>
              <p className="text-xs sm:text-sm font-extrabold uppercase text-emerald-900 dark:text-emerald-400 max-w-xl mx-auto">
                PENETAPAN KELULUSAN PESERTA DIDIK KELAS VI TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
              </p>
            </div>
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wide">
                DENGAN RAHMAT TUHAN YANG MAHA ESA
              </p>
              <p className="text-xs font-bold uppercase">
                KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH,
              </p>
            </div>
          </div>

          {/* Konsideran SK Kelulusan */}
          <div className="space-y-3 leading-relaxed text-justify">
            <div className="flex items-start">
              <div className="w-28 sm:w-32 shrink-0 font-bold">Menimbang</div>
              <div className="w-4 shrink-0 font-bold">:</div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start">
                  <span className="w-5 shrink-0">a.</span>
                  <span className="flex-1">
                    Bahwa dalam rangka mengakhiri proses pembelajaran dan pelaksanaan ujian sekolah bagi peserta didik kelas VI SD Negeri 006 Sungai Buluh Tahun Pelajaran {schoolProfile.tahunPelajaran}, perlu ditetapkan kelulusan peserta didik;
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 shrink-0">b.</span>
                  <span className="flex-1">
                    Bahwa peserta didik yang dinyatakan lulus telah memenuhi kriteria dan persyaratan kelulusan yang telah ditentukan oleh satuan pendidikan sesuai dengan ketentuan peraturan perundang-undangan yang berlaku;
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 shrink-0">c.</span>
                  <span className="flex-1">
                    Bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan huruf b di atas, perlu menetapkan Keputusan Kepala Sekolah tentang Penetapan Kelulusan Peserta Didik Kelas VI SD Negeri 006 Sungai Buluh Tahun Pelajaran {schoolProfile.tahunPelajaran}.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-28 sm:w-32 shrink-0 font-bold">Mengingat</div>
              <div className="w-4 shrink-0 font-bold">:</div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start">
                  <span className="w-5 shrink-0">1.</span>
                  <span className="flex-1">
                    Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional (Lembaran Negara Republik Indonesia Tahun 2003 Nomor 78, Tambahan Lembaran Negara Republik Indonesia Nomor 4301);
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 shrink-0">2.</span>
                  <span className="flex-1">
                    Peraturan Pemerintah Nomor 19 Tahun 2005 tentang Standar Nasional Pendidikan, sebagaimana telah diubah beberapa kali terakhir dengan Peraturan Pemerintah Nomor 4 Tahun 2022;
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 shrink-0">3.</span>
                  <span className="flex-1">
                    Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 9 Tahun 2022 tentang Evaluasi Sistem Pendidikan oleh Pemerintah Pusat dan Pemerintah Daerah terhadap Pendidikan Anak Usia Dini, Pendidikan Dasar, dan Pendidikan Menengah;
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 shrink-0">4.</span>
                  <span className="flex-1">
                    Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 21 Tahun 2022 tentang Standar Penilaian Pendidikan pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah (Berita Negara Republik Indonesia Tahun 2022 Nomor 460).
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-28 sm:w-32 shrink-0 font-bold">Memperhatikan</div>
              <div className="w-4 shrink-0 font-bold">:</div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start">
                  <span className="w-5 shrink-0">1.</span>
                  <span className="flex-1">
                    Kriteria Kelulusan Peserta Didik Kelas VI SD Negeri 006 Sungai Buluh Tahun Pelajaran {schoolProfile.tahunPelajaran};
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 shrink-0">2.</span>
                  <span className="flex-1">
                    Hasil Rapat Dewan Guru SD Negeri 006 Sungai Buluh tanggal {schoolProfile.tanggalKelulusan} tentang Penetapan Kelulusan Peserta Didik Kelas VI Tahun Pelajaran {schoolProfile.tahunPelajaran}.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Diktum MEMUTUSKAN */}
          <div className="text-center font-bold pt-2 pb-1 tracking-widest text-xs sm:text-sm">
            M E M U T U S K A N :
          </div>

          <div className="space-y-2">
            <div className="flex items-start">
              <div className="w-28 sm:w-32 shrink-0 font-bold">Menetapkan</div>
              <div className="w-4 shrink-0 font-bold">:</div>
              <div className="flex-1 font-bold uppercase">
                KEPUTUSAN KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH TENTANG PENETAPAN KELULUSAN PESERTA DIDIK KELAS VI TAHUN PELAJARAN {schoolProfile.tahunPelajaran}.
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-28 sm:w-32 shrink-0 font-bold">KESATU</div>
              <div className="w-4 shrink-0 font-bold">:</div>
              <div className="flex-1">
                Nama-nama peserta didik Kelas VI Tahun Pelajaran {schoolProfile.tahunPelajaran} yang berjumlah {students.length} orang, sebagaimana tercantum dalam Lampiran Surat Keputusan ini berdasarkan hasil Rekapitulasi Nilai Akhir ({schoolProfile.bobotRapor}% Rapor + {schoolProfile.bobotUS}% Ujian Sekolah), dinyatakan <b>LULUS (100%)</b> dari SD Negeri 006 Sungai Buluh;
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-28 sm:w-32 shrink-0 font-bold">KEDUA</div>
              <div className="w-4 shrink-0 font-bold">:</div>
              <div className="flex-1">
                Peserta didik yang dinyatakan lulus sebagaimana dimaksud dalam Diktum KESATU berhak memperoleh Surat Keterangan Lulus (SKL) / SKHU Sementara dan Ijazah sesuai dengan ketentuan perundang-undangan yang berlaku;
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-28 sm:w-32 shrink-0 font-bold">KETIGA</div>
              <div className="w-4 shrink-0 font-bold">:</div>
              <div className="flex-1">
                Segala biaya yang timbul akibat diterbitkannya Keputusan ini dibebankan pada anggaran yang sesuai;
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-28 sm:w-32 shrink-0 font-bold">KEEMPAT</div>
              <div className="w-4 shrink-0 font-bold">:</div>
              <div className="flex-1">
                Keputusan ini mulai berlaku sejak tanggal ditetapkan, dengan ketentuan apabila di kemudian hari terdapat kekeliruan dalam keputusan ini akan diadakan perbaikan sebagaimana mestinya.
              </div>
            </div>
          </div>

          {/* Titimangsa & Tanda Tangan */}
          <div className="flex justify-end pt-6 break-inside-avoid">
            <div className="w-72 space-y-1 text-xs">
              <div className="grid grid-cols-5">
                <span className="col-span-2">Ditetapkan di</span>
                <span className="col-span-3">: {schoolProfile.tempatCetak || 'Sungai Buluh'}</span>
              </div>
              <div className="grid grid-cols-5">
                <span className="col-span-2">Pada Tanggal</span>
                <span className="col-span-3">: {schoolProfile.tanggalKelulusan}</span>
              </div>
              <div className="pt-2 font-bold">Kepala SD Negeri 006 Sungai Buluh,</div>
              <div className="h-20"></div>
              <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
              <div className="pt-0.5 text-zinc-900 dark:text-zinc-200 tracking-normal font-normal">
                NIP. {schoolProfile.nipKepalaSekolah}
              </div>
            </div>
          </div>

          {/* Tembusan Resmi SK */}
          <div className="pt-6 border-t border-zinc-300 dark:border-zinc-700 mt-6 text-[11px] break-inside-avoid">
            <div className="font-bold mb-1">Tembusan disampaikan kepada Yth :</div>
            <ol className="list-decimal pl-5 space-y-0.5 text-zinc-800 dark:text-zinc-300">
              <li>Kepala Dinas Pendidikan Kepemudaan dan Olahraga Kab. Kuantan Singingi;</li>
              <li>Koordinator Wilayah Bidang Pendidikan Kec. Singingi Hilir;</li>
              <li>Ketua Komite SD Negeri 006 Sungai Buluh;</li>
              <li>Yang bersangkutan untuk diketahui;</li>
              <li>Arsip Sekolah.</li>
            </ol>
          </div>

          {/* LAMPIRAN RESMI SK KELULUSAN DENGAN REKAPITULASI NILAI AKHIR */}
          <div className="pt-8 border-t-2 border-black dark:border-zinc-300 mt-8 space-y-3 break-before-page">
            <div className="text-center space-y-1">
              <p className="text-[11px] font-bold uppercase">
                LAMPIRAN KEPUTUSAN KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH
              </p>
              <p className="font-mono text-[10px]">
                NOMOR : 422/KPTS/SDN-006/SB/VI/2026/041
              </p>
              <p className="text-xs font-extrabold uppercase">
                DAFTAR PESERTA DIDIK KELAS VI YANG DINYATAKAN LULUS & REKAP NILAI AKHIR
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Tahun Pelajaran {schoolProfile.tahunPelajaran} • Kriteria Kelulusan Nilai Minimal: {schoolProfile.kkmKelulusan}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-black dark:border-zinc-600 border-collapse">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800 font-bold border-b border-black dark:border-zinc-600">
                    <th className="p-1.5 w-8 text-center border-r border-black dark:border-zinc-600">No</th>
                    <th className="p-1.5 min-w-[100px] border-r border-black dark:border-zinc-600">No. Peserta</th>
                    <th className="p-1.5 min-w-[80px] border-r border-black dark:border-zinc-600">NISN</th>
                    <th className="p-1.5 min-w-[170px] border-r border-black dark:border-zinc-600">Nama Lengkap</th>
                    <th className="p-1.5 text-center w-8 border-r border-black dark:border-zinc-600">L/P</th>
                    <th className="p-1.5 text-center w-16 border-r border-black dark:border-zinc-600">Total NA</th>
                    <th className="p-1.5 text-center w-16 border-r border-black dark:border-zinc-600">Rata NA</th>
                    <th className="p-1.5 text-center min-w-[80px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => {
                    const totalNA = calculateStudentTotalFinalScore(s, schoolProfile, subjects);
                    const avgNA = calculateStudentOverallFinalScore(s, schoolProfile, subjects);
                    return (
                      <tr key={s.id} className="border-b border-black dark:border-zinc-700 h-6 break-inside-avoid">
                        <td className="p-1 text-center font-bold border-r border-black dark:border-zinc-600">{idx + 1}</td>
                        <td className="p-1 font-mono border-r border-black dark:border-zinc-600">{s.noPeserta}</td>
                        <td className="p-1 font-mono border-r border-black dark:border-zinc-600">{s.nisn}</td>
                        <td className="p-1 font-bold uppercase border-r border-black dark:border-zinc-600">{s.nama}</td>
                        <td className="p-1 text-center border-r border-black dark:border-zinc-600">{s.jenisKelamin}</td>
                        <td className="p-1 text-center font-mono font-bold border-r border-black dark:border-zinc-600">{totalNA.toFixed(1)}</td>
                        <td className="p-1 text-center font-mono font-bold text-emerald-800 dark:text-emerald-400 border-r border-black dark:border-zinc-600">{avgNA.toFixed(2)}</td>
                        <td className="p-1 text-center font-bold text-emerald-800 dark:text-emerald-400">LULUS</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Titimangsa Lampiran */}
            <div className="flex justify-end pt-4 break-inside-avoid">
              <div className="w-64 space-y-1 text-xs">
                <div>Sungai Buluh, {schoolProfile.tanggalKelulusan}</div>
                <div className="font-bold">Kepala SD Negeri 006 Sungai Buluh,</div>
                <div className="h-16"></div>
                <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                <div className="pt-0.5 text-zinc-900 dark:text-zinc-200 tracking-normal font-normal">
                  NIP. {schoolProfile.nipKepalaSekolah}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 3. LAPORAN PENGGUNAAN BLANGKO IJAZAH */}
      {activeTab === 'blangko' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Laporan Penggunaan Blangko Ijazah SDN 006 Sungai Buluh
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pencatatan nomor seri blangko ijazah yang diterima dari Dinas Pendidikan Kab. Kuantan Singingi
              </p>
            </div>
            <button
              onClick={() => handlePrintDocument('blangko')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Cetak Laporan Ini
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-700">
              <thead className="bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                <tr>
                  <th className="p-3">Tahun Pelajaran</th>
                  <th className="p-3 text-center">Jumlah Diterima</th>
                  <th className="p-3 text-center">Terpakai</th>
                  <th className="p-3 text-center">Rusak</th>
                  <th className="p-3 text-center">Sisa</th>
                  <th className="p-3">Nomor Seri Awal s.d. Akhir</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {diplomaRecords.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="p-3 font-bold text-emerald-800 dark:text-emerald-400">
                      {rec.tahunPelajaran}
                    </td>
                    <td className="p-3 text-center font-mono font-bold">{rec.jumlahDiterima} lbr</td>
                    <td className="p-3 text-center font-mono text-green-600 font-bold">{rec.terpakai} lbr</td>
                    <td className="p-3 text-center font-mono text-rose-600 font-bold">{rec.rusak} lbr</td>
                    <td className="p-3 text-center font-mono text-amber-600 font-bold">{rec.sisa} lbr</td>
                    <td className="p-3 font-mono text-zinc-700 dark:text-zinc-300">
                      <div>{rec.seriAwal}</div>
                      <div className="text-zinc-400">s.d. {rec.seriAkhir}</div>
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{rec.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BUKU SERAH TERIMA IJAZAH & SKHU */}
      {activeTab === 'serah-terima' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Buku Ekspedisi Serah Terima Ijazah & SKHU
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Tanda bukti penerimaan fisik ijazah asli oleh orang tua / wali murid
              </p>
            </div>
            <button
              onClick={() => handlePrintDocument('serah-terima')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Cetak Buku Serah Terima
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-700">
              <thead className="bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">No. Seri Ijazah</th>
                  <th className="p-3">Tanggal Penyerahan</th>
                  <th className="p-3">Penerima (Orang Tua/Wali)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {students.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="p-3 text-center font-bold text-zinc-500">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{s.nama}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">NISN: {s.nisn}</div>
                    </td>
                    <td className="p-3 font-mono font-semibold text-emerald-800 dark:text-emerald-400">
                      {s.noSeriIjazah || '-'}
                    </td>
                    <td className="p-3 font-medium text-zinc-700 dark:text-zinc-300">
                      {s.tanggalAmbilIjazah || 'Belum Diambil'}
                    </td>
                    <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200">
                      {s.penerimaIjazah || `${s.namaAyah} (Orang Tua)`}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="emerald" size="sm">
                        Sudah Diserahkan
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. BUKU REGISTER NOMOR IJAZAH & SURAT RESMI */}
      {activeTab === 'register' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Buku Register Nomor Ijazah, SK Kelulusan & Transkrip SKHU
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Buku kendali penomoran dokumen resmi kelulusan siswa kelas VI SDN 006 Sungai Buluh
              </p>
            </div>
            <button
              onClick={() => handlePrintDocument('register')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Cetak Buku Register
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">No. Peserta</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3">No. Ijazah</th>
                  <th className="p-3">No. Surat Kelulusan (SKL)</th>
                  <th className="p-3">No. Surat Transkrip Nilai (SKHU)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {students.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="p-3 text-center font-bold text-zinc-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">{s.nama}</td>
                    <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">{s.noPeserta}</td>
                    <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">{s.nisn}</td>
                    <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {s.noSeriIjazah || '-'}
                    </td>
                    <td className="p-3 font-mono text-zinc-700 dark:text-zinc-300">
                      {s.noSuratKelulusan || '-'}
                    </td>
                    <td className="p-3 font-mono text-zinc-700 dark:text-zinc-300">
                      {s.noSuratTranskrip || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="emerald" size="sm">
                        {s.statusKelulusan}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. DAFTAR HADIR ACARA PERPISAHAN SISWA KELAS 6 */}
      {activeTab === 'perpisahan' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
            <div>
              <h3 className="text-base font-extrabold uppercase text-zinc-900 dark:text-zinc-50">
                DAFTAR HADIR ACARA PERPISAHAN SISWA SISWI KELAS VI
              </h3>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                SDN 006 SUNGAI BULUH • TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
              </p>
            </div>
            <button
              onClick={() => handlePrintDocument('perpisahan')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Cetak Daftar Hadir Ini
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-300 dark:border-zinc-700">
              <thead className="bg-zinc-100 dark:bg-zinc-800 font-bold border-b border-zinc-300 dark:border-zinc-700">
                <tr>
                  <th className="p-2.5 w-10 text-center border-r border-zinc-300">No</th>
                  <th className="p-2.5 min-w-[200px] border-r border-zinc-300">Nama Siswa</th>
                  <th className="p-2.5 min-w-[180px] border-r border-zinc-300">Nama Orang Tua / Wali</th>
                  <th className="p-2.5 text-center w-28 border-r border-zinc-300">Tanda Tangan Siswa</th>
                  <th className="p-2.5 text-center w-28 border-r border-zinc-300">Tanda Tangan Wali</th>
                  <th className="p-2.5 text-center w-16">Ket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {students.map((s, idx) => (
                  <tr key={s.id} className="h-10">
                    <td className="p-2 text-center font-bold border-r border-zinc-200">{idx + 1}</td>
                    <td className="p-2 font-bold uppercase border-r border-zinc-200">{s.nama}</td>
                    <td className="p-2 text-zinc-700 dark:text-zinc-300 border-r border-zinc-200">{s.namaAyah}</td>
                    <td className="p-2 border-r border-zinc-200 text-center text-[10px] text-zinc-400">
                      {idx + 1}. .........
                    </td>
                    <td className="p-2 border-r border-zinc-200 text-center text-[10px] text-zinc-400">
                      {idx + 1}. .........
                    </td>
                    <td className="p-2 text-center font-bold text-emerald-700 text-[10px]">Hadir</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          PRINT PREVIEW MODAL: DOKUMEN IJAZAH & KELULUSAN TERPILIH
         ======================================================== */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={
          printSelectedDoc === 'skhu'
            ? `Transkrip Nilai Siswa - ${currentStudent?.nama || ''}`
            : printSelectedDoc === 'sk-kelulusan'
            ? `Surat Keputusan (SK) Kelulusan TP ${schoolProfile.tahunPelajaran}`
            : printSelectedDoc === 'blangko'
            ? `Laporan Penggunaan Blangko Ijazah`
            : printSelectedDoc === 'serah-terima'
            ? `Buku Ekspedisi Serah Terima Ijazah & SKHU`
            : printSelectedDoc === 'register'
            ? `Buku Register Nomor Ijazah & SKL`
            : `Daftar Hadir Acara Perpisahan Siswa Kelas VI`
        }
        subtitle={`SDN 006 Sungai Buluh • Singingi Hilir • TP ${schoolProfile.tahunPelajaran}`}
        defaultOrientation={['blangko', 'serah-terima', 'register'].includes(printSelectedDoc) ? 'landscape' : 'portrait'}
        toolbarExtra={
          <div className="flex flex-wrap items-center gap-2">
            {/* Pilihan Dokumen */}
            <select
              value={printSelectedDoc}
              onChange={(e) => setPrintSelectedDoc(e.target.value as TabKey)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="skhu">📄 Transkrip Nilai (SKHU Siswa)</option>
              <option value="sk-kelulusan">⚖️ SK Kelulusan & Lampiran Rekap Nilai</option>
              <option value="blangko">📑 Laporan Blangko Ijazah</option>
              <option value="serah-terima">✍️ Buku Serah Terima Ijazah</option>
              <option value="register">📚 Register Nomor Ijazah & SKL</option>
              <option value="perpisahan">👥 Daftar Hadir Perpisahan</option>
            </select>

            {/* Pilihan Siswa bila Dokumen Transkrip Nilai dipilih */}
            {printSelectedDoc === 'skhu' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400 font-semibold hidden sm:inline">Peserta:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-200 focus:border-emerald-500 focus:outline-none max-w-[200px] truncate"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.noPeserta} - {s.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-6 text-xs text-black">
          {/* 1. PRINTABLE TRANSKRIP NILAI */}
          {printSelectedDoc === 'skhu' && (
            <div className="space-y-5">
              <KopSurat schoolProfile={schoolProfile} />

              <div className="text-center my-4">
                <h3 className="text-base font-extrabold uppercase underline tracking-wider">
                  TRANSKRIP NILAI
                </h3>
                <p className="text-xs font-bold text-zinc-700 mt-0.5">
                  Nomor: {currentStudent.noSuratTranskrip || `421.2 / SDN-006 / TRANSKRIP / ${schoolProfile.tahunPelajaran.replace('/', '-')} / ${currentStudent.noMeja.toString().padStart(3, '0')}`}
                </p>
              </div>

              {/* Formulir Identitas */}
              <div className="rounded-lg border border-black p-3.5 text-xs bg-white mb-5">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-zinc-200">
                    <tr>
                      <td className="w-56 py-1 font-medium">Satuan Pendidikan</td>
                      <td className="w-4 py-1">:</td>
                      <td className="py-1 font-bold uppercase">{schoolProfile.namaSekolah}</td>
                    </tr>
                    <tr>
                      <td className="w-56 py-1 font-medium">Nomor Pokok Sekolah Nasional</td>
                      <td className="w-4 py-1">:</td>
                      <td className="py-1 font-mono font-medium">{schoolProfile.npsn}</td>
                    </tr>
                    <tr>
                      <td className="w-56 py-1 font-medium">Nama Siswa</td>
                      <td className="w-4 py-1">:</td>
                      <td className="py-1 font-extrabold uppercase">{currentStudent.nama}</td>
                    </tr>
                    <tr>
                      <td className="w-56 py-1 font-medium">Tempat Tanggal Lahir</td>
                      <td className="w-4 py-1">:</td>
                      <td className="py-1 font-medium">{currentStudent.tempatLahir}, {currentStudent.tanggalLahir}</td>
                    </tr>
                    <tr>
                      <td className="w-56 py-1 font-medium">Nomor Induk Siswa Nasional</td>
                      <td className="w-4 py-1">:</td>
                      <td className="py-1 font-mono font-medium">{currentStudent.nisn}</td>
                    </tr>
                    <tr>
                      <td className="w-56 py-1 font-medium">Nomor Ijazah</td>
                      <td className="w-4 py-1">:</td>
                      <td className="py-1 font-mono font-bold">{currentStudent.noSeriIjazah || '-'}</td>
                    </tr>
                    <tr>
                      <td className="w-56 py-1 font-medium">Tanggal kelulusan</td>
                      <td className="w-4 py-1">:</td>
                      <td className="py-1 font-medium">{schoolProfile.tanggalKelulusan}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tabel Nilai */}
              <div className="border border-black rounded-sm overflow-hidden mb-5">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-100 font-bold border-b border-black">
                    <tr>
                      <th className="p-2 w-12 text-center border-r border-black">No</th>
                      <th className="p-2 border-r border-black">Mata Pelajaran (Kurikulum 2013)</th>
                      <th className="p-2 text-center w-28">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub, idx) => {
                      const na = calculateSubjectFinalScore(currentStudent, sub.key, schoolProfile);
                      return (
                        <tr key={sub.key} className="border-b border-zinc-200">
                          <td className="p-2 text-center font-medium border-r border-black">{idx + 1}</td>
                          <td className="p-2 font-medium border-r border-black">{sub.name}</td>
                          <td className="p-2 text-center font-mono font-bold">{na.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-black bg-zinc-50 font-bold">
                    <tr>
                      <td colSpan={2} className="p-2 text-right uppercase border-r border-black">Jumlah / Total Nilai :</td>
                      <td className="p-2 text-center font-mono font-bold">
                        {calculateStudentTotalFinalScore(currentStudent, schoolProfile, subjects).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="p-2 text-right uppercase border-r border-black">Rata-Rata Nilai :</td>
                      <td className="p-2 text-center font-mono font-extrabold text-sm">
                        {calculateStudentOverallFinalScore(currentStudent, schoolProfile, subjects).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tanda Tangan */}
              <div className="flex justify-end pt-4 break-inside-avoid text-xs">
                <div className="w-72 text-right space-y-1">
                  <p>Sungai Buluh, {schoolProfile.tanggalKelulusan}</p>
                  <p className="font-semibold">Kepala Sekolah SDN 006 Sungai Buluh,</p>
                  <div className="h-16"></div>
                  <p className="font-extrabold underline text-sm uppercase">{schoolProfile.kepalaSekolah}</p>
                  <p className="pt-0.5 text-zinc-800 font-normal">NIP. {schoolProfile.nipKepalaSekolah}</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRINTABLE SK KELULUSAN & LAMPIRAN */}
          {printSelectedDoc === 'sk-kelulusan' && (
            <div className="space-y-5 font-serif text-black leading-relaxed">
              <KopSurat schoolProfile={schoolProfile} />

              <div className="text-center space-y-1 pt-1 pb-1 leading-snug">
                <h3 className="text-sm font-extrabold uppercase tracking-widest">K E P U T U S A N</h3>
                <h4 className="text-xs font-bold uppercase">KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH</h4>
                <p className="font-mono font-bold text-xs">NOMOR : 422/KPTS/SDN-006/SB/VI/2026/041</p>
                <div className="pt-1.5">
                  <p className="text-xs font-bold uppercase tracking-widest">T E N T A N G</p>
                  <p className="text-xs font-extrabold uppercase max-w-xl mx-auto">
                    PENETAPAN KELULUSAN PESERTA DIDIK KELAS VI TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
                  </p>
                </div>
                <div className="pt-1.5">
                  <p className="text-xs font-bold uppercase tracking-wide">DENGAN RAHMAT TUHAN YANG MAHA ESA</p>
                  <p className="text-xs font-bold uppercase">KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH,</p>
                </div>
              </div>

              <div className="space-y-2 text-justify text-xs">
                <div className="flex items-start">
                  <div className="w-28 shrink-0 font-bold">Menimbang</div>
                  <div className="w-4 shrink-0 font-bold">:</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">a.</span>
                      <span className="flex-1">
                        Bahwa dalam rangka mengakhiri kegiatan proses pembelajaran bagi peserta didik Kelas VI Tahun Pelajaran {schoolProfile.tahunPelajaran}, perlu menetapkan kelulusan peserta didik;
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">b.</span>
                      <span className="flex-1">
                        Bahwa peserta didik telah mengikuti seluruh proses pembelajaran dan Ujian Sekolah serta memenuhi kriteria kelulusan yang telah ditetapkan;
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">c.</span>
                      <span className="flex-1">
                        Bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan huruf b, perlu menetapkan Keputusan Kepala Sekolah tentang Penetapan Kelulusan.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-28 shrink-0 font-bold">Mengingat</div>
                  <div className="w-4 shrink-0 font-bold">:</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start"><span className="w-5 shrink-0">1.</span><span className="flex-1">UU No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional;</span></div>
                    <div className="flex items-start"><span className="w-5 shrink-0">2.</span><span className="flex-1">PP No. 4 Tahun 2022 tentang Standar Nasional Pendidikan;</span></div>
                    <div className="flex items-start"><span className="w-5 shrink-0">3.</span><span className="flex-1">Permendikbudristek No. 21 Tahun 2022 tentang Standar Penilaian Pendidikan.</span></div>
                  </div>
                </div>
              </div>

              <div className="text-center font-bold pt-2 tracking-widest text-xs">M E M U T U S K A N :</div>

              <div className="space-y-1.5 text-xs text-justify">
                <div className="flex items-start">
                  <div className="w-28 shrink-0 font-bold">Menetapkan</div>
                  <div className="w-4 shrink-0 font-bold">:</div>
                  <div className="flex-1 font-bold uppercase">
                    KEPUTUSAN KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH TENTANG PENETAPAN KELULUSAN PESERTA DIDIK KELAS VI TAHUN PELAJARAN {schoolProfile.tahunPelajaran}.
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-28 shrink-0 font-bold">KESATU</div>
                  <div className="w-4 shrink-0 font-bold">:</div>
                  <div className="flex-1">
                    Nama-nama peserta didik Kelas VI Tahun Pelajaran {schoolProfile.tahunPelajaran} yang berjumlah {students.length} orang dinyatakan <b>LULUS (100%)</b> dari SD Negeri 006 Sungai Buluh;
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-28 shrink-0 font-bold">KEDUA</div>
                  <div className="w-4 shrink-0 font-bold">:</div>
                  <div className="flex-1">
                    Peserta didik yang dinyatakan lulus berhak memperoleh Surat Keterangan Lulus (SKL) / Transkrip Nilai dan Ijazah;
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 break-inside-avoid text-xs">
                <div className="w-64 space-y-0.5">
                  <div>Ditetapkan di : {schoolProfile.tempatCetak || 'Sungai Buluh'}</div>
                  <div>Pada Tanggal : {schoolProfile.tanggalKelulusan}</div>
                  <div className="pt-1 font-bold">Kepala SD Negeri 006 Sungai Buluh,</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                  <div>NIP. {schoolProfile.nipKepalaSekolah}</div>
                </div>
              </div>

              {/* Lampiran Rekap Nilai */}
              <div className="pt-6 border-t-2 border-black mt-6 space-y-3 break-before-page font-sans">
                <div className="text-center space-y-0.5">
                  <p className="text-[11px] font-bold uppercase">LAMPIRAN KEPUTUSAN KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH</p>
                  <p className="font-mono text-[10px]">NOMOR : 422/KPTS/SDN-006/SB/VI/2026/041</p>
                  <p className="text-xs font-bold uppercase">DAFTAR PESERTA DIDIK YANG DINYATAKAN LULUS & REKAP NILAI AKHIR</p>
                </div>
                <table className="w-full text-left text-[11px] border border-black border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 font-bold border-b border-black">
                      <th className="p-1 w-8 text-center border-r border-black">No</th>
                      <th className="p-1 border-r border-black">No. Peserta</th>
                      <th className="p-1 border-r border-black">NISN</th>
                      <th className="p-1 border-r border-black">Nama Lengkap</th>
                      <th className="p-1 text-center w-8 border-r border-black">L/P</th>
                      <th className="p-1 text-center w-16 border-r border-black">Total NA</th>
                      <th className="p-1 text-center w-16 border-r border-black">Rata NA</th>
                      <th className="p-1 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => {
                      const totalNA = calculateStudentTotalFinalScore(s, schoolProfile, subjects);
                      const avgNA = calculateStudentOverallFinalScore(s, schoolProfile, subjects);
                      return (
                        <tr key={s.id} className="border-b border-zinc-300 break-inside-avoid">
                          <td className="p-1 text-center font-bold border-r border-black">{idx + 1}</td>
                          <td className="p-1 font-mono border-r border-black">{s.noPeserta}</td>
                          <td className="p-1 font-mono border-r border-black">{s.nisn}</td>
                          <td className="p-1 font-bold uppercase border-r border-black">{s.nama}</td>
                          <td className="p-1 text-center border-r border-black">{s.jenisKelamin}</td>
                          <td className="p-1 text-center font-mono font-bold border-r border-black">{totalNA.toFixed(1)}</td>
                          <td className="p-1 text-center font-mono font-bold border-r border-black">{avgNA.toFixed(2)}</td>
                          <td className="p-1 text-center font-bold">LULUS</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. PRINTABLE LAPORAN BLANGKO */}
          {printSelectedDoc === 'blangko' && (
            <div className="space-y-4">
              <KopSurat schoolProfile={schoolProfile} />
              <div className="text-center my-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wide underline">
                  LAPORAN PENGGUNAAN BLANGKO IJAZAH
                </h3>
                <p className="text-xs font-bold text-zinc-700">
                  SDN 006 SUNGAI BULUH • TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
                </p>
              </div>
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead className="bg-zinc-100 font-bold border-b border-black">
                  <tr>
                    <th className="p-2 border-r border-black">Tahun Pelajaran</th>
                    <th className="p-2 text-center border-r border-black">Diterima</th>
                    <th className="p-2 text-center border-r border-black">Terpakai</th>
                    <th className="p-2 text-center border-r border-black">Rusak</th>
                    <th className="p-2 text-center border-r border-black">Sisa</th>
                    <th className="p-2 border-r border-black">Nomor Seri</th>
                    <th className="p-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {diplomaRecords.map((rec, idx) => (
                    <tr key={idx} className="border-b border-zinc-300">
                      <td className="p-2 font-bold border-r border-black">{rec.tahunPelajaran}</td>
                      <td className="p-2 text-center font-mono border-r border-black">{rec.jumlahDiterima} lbr</td>
                      <td className="p-2 text-center font-mono font-bold border-r border-black">{rec.terpakai} lbr</td>
                      <td className="p-2 text-center font-mono border-r border-black">{rec.rusak} lbr</td>
                      <td className="p-2 text-center font-mono font-bold border-r border-black">{rec.sisa} lbr</td>
                      <td className="p-2 font-mono border-r border-black">{rec.seriAwal} s.d. {rec.seriAkhir}</td>
                      <td className="p-2">{rec.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end pt-6 break-inside-avoid text-xs">
                <div className="w-64 space-y-1 text-center">
                  <div>Sungai Buluh, {schoolProfile.tanggalKelulusan}</div>
                  <div className="font-bold">Kepala SD Negeri 006 Sungai Buluh</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                  <div>NIP. {schoolProfile.nipKepalaSekolah}</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRINTABLE BUKU SERAH TERIMA */}
          {printSelectedDoc === 'serah-terima' && (
            <div className="space-y-4">
              <KopSurat schoolProfile={schoolProfile} />
              <div className="text-center my-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wide underline">
                  BUKU EKSPEDISI SERAH TERIMA IJAZAH & TRANSKRIP NILAI
                </h3>
                <p className="text-xs font-bold text-zinc-700">
                  SDN 006 SUNGAI BULUH • TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
                </p>
              </div>
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead className="bg-zinc-100 font-bold border-b border-black">
                  <tr>
                    <th className="p-1.5 w-10 text-center border-r border-black">No</th>
                    <th className="p-1.5 border-r border-black">Nama Siswa</th>
                    <th className="p-1.5 border-r border-black">NISN</th>
                    <th className="p-1.5 border-r border-black">No. Seri Ijazah</th>
                    <th className="p-1.5 border-r border-black">Tgl Penyerahan</th>
                    <th className="p-1.5 border-r border-black">Nama Penerima</th>
                    <th className="p-1.5 text-center w-28">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id} className="border-b border-zinc-300 break-inside-avoid h-8">
                      <td className="p-1.5 text-center font-bold border-r border-black">{idx + 1}</td>
                      <td className="p-1.5 font-bold uppercase border-r border-black">{s.nama}</td>
                      <td className="p-1.5 font-mono border-r border-black">{s.nisn}</td>
                      <td className="p-1.5 font-mono border-r border-black">{s.noSeriIjazah || '-'}</td>
                      <td className="p-1.5 border-r border-black">{s.tanggalAmbilIjazah || '-'}</td>
                      <td className="p-1.5 border-r border-black">{s.penerimaIjazah || `${s.namaAyah} (Orang Tua)`}</td>
                      <td className="p-1.5 text-center text-[10px] text-zinc-500">{idx + 1}. .........</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end pt-6 break-inside-avoid text-xs">
                <div className="w-64 space-y-1 text-center">
                  <div>Sungai Buluh, {schoolProfile.tanggalKelulusan}</div>
                  <div className="font-bold">Kepala SD Negeri 006 Sungai Buluh</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                  <div>NIP. {schoolProfile.nipKepalaSekolah}</div>
                </div>
              </div>
            </div>
          )}

          {/* 5. PRINTABLE BUKU REGISTER */}
          {printSelectedDoc === 'register' && (
            <div className="space-y-4">
              <KopSurat schoolProfile={schoolProfile} />
              <div className="text-center my-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wide underline">
                  BUKU REGISTER NOMOR IJAZAH, SKL & TRANSKRIP NILAI
                </h3>
                <p className="text-xs font-bold text-zinc-700">
                  SDN 006 SUNGAI BULUH • TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
                </p>
              </div>
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead className="bg-zinc-100 font-bold border-b border-black">
                  <tr>
                    <th className="p-1.5 w-10 text-center border-r border-black">No</th>
                    <th className="p-1.5 border-r border-black">Nama Siswa</th>
                    <th className="p-1.5 border-r border-black">No. Peserta</th>
                    <th className="p-1.5 border-r border-black">NISN</th>
                    <th className="p-1.5 border-r border-black">No. Seri Ijazah</th>
                    <th className="p-1.5 border-r border-black">No. Surat Kelulusan (SKL)</th>
                    <th className="p-1.5 border-r border-black">No. Transkrip Nilai</th>
                    <th className="p-1.5 text-center w-20">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id} className="border-b border-zinc-300 break-inside-avoid">
                      <td className="p-1.5 text-center font-bold border-r border-black">{idx + 1}</td>
                      <td className="p-1.5 font-bold uppercase border-r border-black">{s.nama}</td>
                      <td className="p-1.5 font-mono border-r border-black">{s.noPeserta}</td>
                      <td className="p-1.5 font-mono border-r border-black">{s.nisn}</td>
                      <td className="p-1.5 font-mono font-bold border-r border-black">{s.noSeriIjazah || '-'}</td>
                      <td className="p-1.5 font-mono border-r border-black">{s.noSuratKelulusan || '-'}</td>
                      <td className="p-1.5 font-mono border-r border-black">{s.noSuratTranskrip || '-'}</td>
                      <td className="p-1.5 text-center font-bold">{s.statusKelulusan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end pt-6 break-inside-avoid text-xs">
                <div className="w-64 space-y-1 text-center">
                  <div>Sungai Buluh, {schoolProfile.tanggalKelulusan}</div>
                  <div className="font-bold">Kepala SD Negeri 006 Sungai Buluh</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                  <div>NIP. {schoolProfile.nipKepalaSekolah}</div>
                </div>
              </div>
            </div>
          )}

          {/* 6. PRINTABLE DAFTAR HADIR PERPISAHAN */}
          {printSelectedDoc === 'perpisahan' && (
            <div className="space-y-4">
              <KopSurat schoolProfile={schoolProfile} />
              <div className="text-center my-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wide underline">
                  DAFTAR HADIR ACARA PERPISAHAN SISWA SISWI KELAS VI
                </h3>
                <p className="text-xs font-bold text-zinc-700">
                  SDN 006 SUNGAI BULUH • TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
                </p>
              </div>
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead className="bg-zinc-100 font-bold border-b border-black">
                  <tr>
                    <th className="p-2 w-10 text-center border-r border-black">No</th>
                    <th className="p-2 border-r border-black">Nama Siswa</th>
                    <th className="p-2 border-r border-black">Nama Orang Tua / Wali</th>
                    <th className="p-2 text-center w-28 border-r border-black">Tanda Tangan Siswa</th>
                    <th className="p-2 text-center w-28 border-r border-black">Tanda Tangan Wali</th>
                    <th className="p-2 text-center w-16">Ket</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id} className="border-b border-zinc-300 break-inside-avoid h-9">
                      <td className="p-2 text-center font-bold border-r border-black">{idx + 1}</td>
                      <td className="p-2 font-bold uppercase border-r border-black">{s.nama}</td>
                      <td className="p-2 border-r border-black">{s.namaAyah}</td>
                      <td className="p-2 border-r border-black text-center text-[10px] text-zinc-500">{idx + 1}. .........</td>
                      <td className="p-2 border-r border-black text-center text-[10px] text-zinc-500">{idx + 1}. .........</td>
                      <td className="p-2 text-center font-bold">Hadir</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end pt-6 break-inside-avoid text-xs">
                <div className="w-64 space-y-1 text-center">
                  <div>Sungai Buluh, {schoolProfile.tanggalKelulusan}</div>
                  <div className="font-bold">Kepala SD Negeri 006 Sungai Buluh</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                  <div>NIP. {schoolProfile.nipKepalaSekolah}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PrintPreviewModal>
    </div>
  );
};
