import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateStudentOverallFinalScore, getGradePredicate } from '../../constants/subjects';
import { Badge } from '../common/Badge';
import {
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  FileText,
  Printer,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { ExamScoreBarChart } from './ExamScoreBarChart';
import { ExamScorePieChart } from './ExamScorePieChart';

export const DashboardView: React.FC = () => {
  const { students, schoolProfile, setActiveTab, setSelectedStudentForSKHU } = useApp();

  // Metrics
  const totalStudents = students.length;
  const lulusCount = students.filter((s) => s.statusKelulusan === 'LULUS').length;
  const graduationRate = totalStudents > 0 ? ((lulusCount / totalStudents) * 100).toFixed(1) : '0';

  // Overall Scores
  const studentScores = students.map((s) => ({
    student: s,
    overallScore: calculateStudentOverallFinalScore(s, schoolProfile),
  }));

  const avgSchoolScore =
    studentScores.length > 0
      ? (studentScores.reduce((acc, curr) => acc + curr.overallScore, 0) / studentScores.length).toFixed(2)
      : '0.00';

  const highestScore =
    studentScores.length > 0
      ? Math.max(...studentScores.map((s) => s.overallScore)).toFixed(2)
      : '0.00';

  const lowestScore =
    studentScores.length > 0
      ? Math.min(...studentScores.map((s) => s.overallScore)).toFixed(2)
      : '0.00';

  // Sort top 5 students for Leaderboard
  const topStudents = [...studentScores]
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Biru Muda Bernuansa */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-300/90 bg-gradient-to-br from-sky-100 via-blue-100/95 to-cyan-100/95 p-6 text-slate-950 shadow-lg shadow-sky-900/5 dark:border-sky-800/70 dark:from-sky-950 dark:via-blue-950 dark:to-slate-900 dark:text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-sky-950 border border-sky-300 shadow-2xs dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-400/30">
                <Sparkles className="h-3.5 w-3.5 text-sky-800 dark:text-amber-300" />
                Tahun Ajaran {schoolProfile.tahunPelajaran}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-sky-200">Resmi Terverifikasi</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl text-slate-950 dark:text-white">
              Sistem Rekapitulasi Nilai Akhir & SKHU
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-800 dark:text-sky-100/90 max-w-2xl">
              Pengadministrasian terpadu nilai rapor S7-S12, nilai Ujian Sekolah (US), transkrip kelulusan, dan tata kelola ruang ujian SDN 006 Sungai Buluh, Singingi Hilir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('final-rekap')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-700 to-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-700/20 hover:from-sky-800 hover:to-blue-800 transition-all"
            >
              <Award className="h-4 w-4" />
              Lihat Rekap Lengkap
            </button>
            <button
              onClick={() => setActiveTab('diploma')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-xs font-bold text-sky-950 backdrop-blur-xs hover:bg-white transition-colors border border-sky-300 shadow-xs dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20"
            >
              <Printer className="h-4 w-4 text-sky-800 dark:text-sky-300" />
              Cetak SKHU Massal
            </button>
          </div>
        </div>

        {/* Ambient nuanced light-blue ornaments */}
        <div className="absolute -right-10 -bottom-12 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl pointer-events-none dark:bg-sky-500/15" />
        <div className="absolute right-1/3 -top-12 h-48 w-48 rounded-full bg-cyan-300/25 blur-2xl pointer-events-none dark:bg-cyan-500/10" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peserta */}
        <div className="rounded-2xl border border-sky-200/90 bg-white/95 backdrop-blur-sm p-5 shadow-xs dark:border-sky-900/60 dark:bg-slate-900/90 transition-all hover:border-sky-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Peserta UN/US</span>
            <div className="rounded-xl bg-sky-100 p-2 text-sky-900 dark:bg-sky-950/70 dark:text-sky-300">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950 dark:text-slate-50">{totalStudents}</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Siswa Terdaftar</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 border-t border-sky-100 dark:border-slate-800 pt-2">
            <span>Terbagi dalam 4 Ruang Ujian</span>
            <span className="font-bold text-sky-900 dark:text-sky-300">
              {totalStudents > 0 ? '100% Hadir' : 'Belum Ada Data'}
            </span>
          </div>
        </div>

        {/* Tingkat Kelulusan */}
        <div className="rounded-2xl border border-sky-200/90 bg-white/95 backdrop-blur-sm p-5 shadow-xs dark:border-sky-900/60 dark:bg-slate-900/90 transition-all hover:border-sky-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tingkat Kelulusan</span>
            <div className="rounded-xl bg-blue-100 p-2 text-blue-900 dark:bg-blue-950/70 dark:text-blue-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-800 dark:text-blue-400">{graduationRate}%</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">({lulusCount} dari {totalStudents})</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 border-t border-sky-100 dark:border-slate-800 pt-2">
            <span>Kriteria KKM: {schoolProfile.kkmKelulusan}</span>
            <span className="font-bold text-emerald-800 dark:text-emerald-400">
              {totalStudents > 0 ? (lulusCount === totalStudents ? 'Semua Lulus' : `${lulusCount} Lulus`) : 'Belum Ada Peserta'}
            </span>
          </div>
        </div>

        {/* Rata-Rata Nilai Akhir */}
        <div className="rounded-2xl border border-sky-200/90 bg-white/95 backdrop-blur-sm p-5 shadow-xs dark:border-sky-900/60 dark:bg-slate-900/90 transition-all hover:border-sky-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rata-rata Nilai Sekolah</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-950 dark:text-slate-50">{avgSchoolScore}</span>
            <Badge variant="info" size="sm">
              {totalStudents > 0 ? getGradePredicate(Number(avgSchoolScore)).label : 'Belum Dinilai'}
            </Badge>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 border-t border-sky-100 dark:border-slate-800 pt-2">
            <span>Tertinggi: <b className="text-sky-900 dark:text-sky-300 font-mono">{highestScore}</b></span>
            <span>Terendah: <b className="text-slate-900 dark:text-slate-200 font-mono">{lowestScore}</b></span>
          </div>
        </div>

        {/* Kelengkapan Administrasi */}
        <div className="rounded-2xl border border-sky-200/90 bg-white/95 backdrop-blur-sm p-5 shadow-xs dark:border-sky-900/60 dark:bg-slate-900/90 transition-all hover:border-sky-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Kelengkapan Data Nilai</span>
            <div className="rounded-xl bg-cyan-100 p-2 text-cyan-900 dark:bg-cyan-950/70 dark:text-cyan-300">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-800 dark:text-sky-400">
              {totalStudents > 0 ? '100%' : '0%'}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {totalStudents > 0 ? 'Lengkap' : 'Data Kosong'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 border-t border-sky-100 dark:border-slate-800 pt-2">
            <span>Rapor S7-S12 & US</span>
            <span className="font-bold text-sky-900 dark:text-sky-300">
              {totalStudents > 0 ? 'Terverifikasi' : 'Menunggu Input'}
            </span>
          </div>
        </div>
      </div>

      {/* Visualisasi Data: Grafik Batang & Diagram Lingkaran Nilai Ujian Siswa */}
      <div className="space-y-6">
        {/* 1. Grafik Batang Ringkasan Nilai Ujian Siswa */}
        <ExamScoreBarChart students={students} schoolProfile={schoolProfile} />

        {/* 2. Diagram Lingkaran Distribusi Predikat & Ruang Ujian */}
        <ExamScorePieChart students={students} schoolProfile={schoolProfile} />
      </div>

      {/* Top 5 Siswa Berprestasi (Leaderboard) */}
      <div className="rounded-2xl border border-sky-200/90 bg-white/95 backdrop-blur-sm p-6 shadow-xs dark:border-sky-900/60 dark:bg-slate-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-extrabold text-slate-950 dark:text-slate-50">
                5 Siswa Peraih Nilai Akhir Tertinggi SDN 006
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              Peringkat kehormatan berdasarkan kalkulasi nilai akhir Ujian Nasional / Sekolah
            </p>
          </div>
          <button
            onClick={() => setActiveTab('final-rekap')}
            className="text-xs font-bold text-sky-900 dark:text-sky-300 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Lihat Seluruh Peringkat Siswa <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sky-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">
                <th className="pb-3 font-bold w-14">Rank</th>
                <th className="pb-3 font-bold">Nama Peserta</th>
                <th className="pb-3 font-bold">No Peserta / NISN</th>
                <th className="pb-3 font-bold">Ruang</th>
                <th className="pb-3 font-bold text-center">Nilai Akhir (NA)</th>
                <th className="pb-3 font-bold text-center">Predikat</th>
                <th className="pb-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800">
              {topStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Users className="h-8 w-8 text-sky-700/60 dark:text-sky-400/60" />
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Belum Ada Data Peserta pada TP {schoolProfile.tahunPelajaran}
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-400 max-w-md">
                        Tahun Pelajaran ini masih kosong. Tambahkan peserta baru atau impor data siswa melalui menu Data Peserta (PD).
                      </p>
                      <button
                        onClick={() => setActiveTab('students')}
                        className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-800 transition-colors"
                      >
                        Buka Data Peserta (PD)
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                topStudents.map((item, index) => {
                  const s = item.student;
                  const pred = getGradePredicate(item.overallScore);
                  const rankBadges = [
                    'bg-amber-400 text-amber-950',
                    'bg-slate-300 text-slate-900',
                    'bg-amber-700 text-white',
                    'bg-sky-100 text-sky-950 dark:bg-slate-800 dark:text-slate-200',
                    'bg-sky-100 text-sky-950 dark:bg-slate-800 dark:text-slate-200',
                  ];

                  return (
                    <tr key={s.id} className="hover:bg-sky-50/80 dark:hover:bg-sky-950/30 transition-colors">
                      <td className="py-3">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${
                            rankBadges[index]
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-slate-950 dark:text-slate-100">{s.nama}</div>
                        <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">TTL: {s.tempatLahir}, {s.tanggalLahir}</div>
                      </td>
                      <td className="py-3 font-mono text-slate-800 dark:text-slate-300">
                        <div className="font-semibold">{s.noPeserta}</div>
                        <div className="text-[10px] font-medium text-slate-700 dark:text-slate-400">NISN: {s.nisn}</div>
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-slate-900 dark:text-slate-200">{s.ruang}</span>
                        <div className="text-[10px] font-medium text-slate-700 dark:text-slate-400">Meja #{s.noMeja}</div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-mono text-sm font-black text-sky-900 dark:text-sky-300">
                          {item.overallScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant="info" size="sm">
                          {pred.label}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentForSKHU(s);
                            setActiveTab('diploma');
                          }}
                          className="rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-950 hover:bg-sky-200 border border-sky-300/80 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800 transition-colors"
                        >
                          Cetak SKHU
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
