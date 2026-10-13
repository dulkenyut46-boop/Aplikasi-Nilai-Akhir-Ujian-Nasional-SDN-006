import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  calculateOverallRaporAverage,
  calculateOverallUSAverage,
  calculateStudentOverallFinalScore,
  getGradePredicate,
  SUBJECT_LIST,
  calculateSubjectFinalScore,
} from '../../constants/subjects';
import {
  User,
  GraduationCap,
  Calendar,
  MapPin,
  Home,
  Printer,
  Award,
  Layers,
  FileText,
} from 'lucide-react';

export const StudentDetailModal: React.FC = () => {
  const {
    selectedStudentForDetail,
    setSelectedStudentForDetail,
    schoolProfile,
    subjects,
    setSelectedStudentForSKHU,
    setActiveTab,
  } = useApp();

  if (!selectedStudentForDetail) return null;

  const s = selectedStudentForDetail;
  const avgRapor = calculateOverallRaporAverage(s);
  const avgUS = calculateOverallUSAverage(s);
  const naScore = calculateStudentOverallFinalScore(s, schoolProfile);
  const pred = getGradePredicate(naScore);

  return (
    <Modal
      isOpen={!!selectedStudentForDetail}
      onClose={() => setSelectedStudentForDetail(null)}
      title="Profil Lengkap Peserta Ujian"
      subtitle={`${s.nama} • ${s.noPeserta}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-emerald-900 to-zinc-900 p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-18 w-14 items-center justify-center rounded-xl bg-emerald-800/80 text-white font-bold border-2 border-emerald-400/50 shadow-md overflow-hidden shrink-0">
              {s.foto ? (
                <img src={s.foto} alt={s.nama} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl">{s.jenisKelamin === 'L' ? '👦' : '👧'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">{s.nama}</h3>
                <span className="rounded-md bg-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                  {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-emerald-200/90 font-mono">
                <span>No. UN: {s.noPeserta}</span>
                <span>•</span>
                <span>NISN: {s.nisn}</span>
                <span>•</span>
                <span>NIS: {s.nis}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2 text-right">
            <div className="text-xs text-zinc-300">Nilai Akhir (NA)</div>
            <div className="font-mono text-3xl font-extrabold text-amber-300">
              {naScore.toFixed(2)}
            </div>
            <Badge variant="emerald" size="sm">
              Status: {s.statusKelulusan}
            </Badge>
          </div>
        </div>

        {/* Biodata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2.5">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-sm border-b pb-2 border-zinc-200 dark:border-zinc-700">
              <User className="h-4 w-4 text-emerald-600" />
              Biodata & Informasi Keluarga
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">Tempat, Tgl Lahir:</span>
              <span className="col-span-2 font-medium text-zinc-800 dark:text-zinc-200">
                {s.tempatLahir}, {s.tanggalLahir}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">Nama Ayah:</span>
              <span className="col-span-2 font-medium text-zinc-800 dark:text-zinc-200">{s.namaAyah}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">Nama Ibu:</span>
              <span className="col-span-2 font-medium text-zinc-800 dark:text-zinc-200">{s.namaIbu}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">Pekerjaan Orang Tua:</span>
              <span className="col-span-2 font-medium text-zinc-800 dark:text-zinc-200">{s.pekerjaanOrtu}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">Alamat Tempat Tinggal:</span>
              <span className="col-span-2 font-medium text-zinc-800 dark:text-zinc-200">{s.alamat}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2.5">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-sm border-b pb-2 border-zinc-200 dark:border-zinc-700">
              <Layers className="h-4 w-4 text-emerald-600" />
              Penempatan Ujian & Ijazah
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">Ruang Ujian:</span>
              <span className="col-span-2 font-bold text-emerald-700 dark:text-emerald-400">
                {s.ruang} (Meja #{s.noMeja})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">No. Ijazah:</span>
              <span className="col-span-2 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {s.noSeriIjazah || '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">No. SK Kelulusan:</span>
              <span className="col-span-2 font-mono font-medium text-emerald-800 dark:text-emerald-300">
                {s.noSuratKelulusan || '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">No. SKHU / Transkrip:</span>
              <span className="col-span-2 font-mono font-medium text-emerald-800 dark:text-emerald-300">
                {s.noSuratTranskrip || '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">Pengambilan Ijazah:</span>
              <span className="col-span-2 font-medium text-zinc-800 dark:text-zinc-200">
                {s.tanggalAmbilIjazah ? `${s.tanggalAmbilIjazah} (Oleh: ${s.penerimaIjazah})` : 'Belum Diambil'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-zinc-500">Predikat Mutu:</span>
              <span className="col-span-2 font-medium text-zinc-800 dark:text-zinc-200">
                {pred.grade} ({pred.label})
              </span>
            </div>
          </div>
        </div>

        {/* Nilai Mata Pelajaran Summary Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Rekapitulasi Nilai per Mata Pelajaran
            </h4>
            <div className="text-xs text-zinc-500">
              Formula: {schoolProfile.bobotRapor}% Rata Rapor + {schoolProfile.bobotUS}% US
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300">
                <tr>
                  <th className="p-2.5 font-bold">Mata Pelajaran</th>
                  <th className="p-2.5 text-center font-bold">Rata Rapor (S7-S12)</th>
                  <th className="p-2.5 text-center font-bold">Ujian Sekolah (US)</th>
                  <th className="p-2.5 text-center font-bold">Nilai Akhir (NA)</th>
                  <th className="p-2.5 text-center font-bold">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {subjects.map((sub) => {
                  const rAvg = (
                    ((s.rapor.s7[sub.key] || 0) +
                      (s.rapor.s8[sub.key] || 0) +
                      (s.rapor.s9[sub.key] || 0) +
                      (s.rapor.s10[sub.key] || 0) +
                      (s.rapor.s11[sub.key] || 0) +
                      (s.rapor.s12[sub.key] || 0)) /
                    6
                  ).toFixed(2);
                  const usScore = (s.us[sub.key]?.akhir || 0).toFixed(2);
                  const na = calculateSubjectFinalScore(s, sub.key, schoolProfile).toFixed(2);
                  const subPred = getGradePredicate(Number(na));

                  return (
                    <tr key={sub.key} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                        {sub.name} <span className="text-zinc-400">({sub.code})</span>
                      </td>
                      <td className="p-2.5 text-center font-mono">{rAvg}</td>
                      <td className="p-2.5 text-center font-mono">{usScore}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {na}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{subPred.grade}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setSelectedStudentForDetail(null)}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Tutup
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedStudentForSKHU(s);
                setSelectedStudentForDetail(null);
                setActiveTab('diploma');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Cetak SKHU Siswa Ini
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
