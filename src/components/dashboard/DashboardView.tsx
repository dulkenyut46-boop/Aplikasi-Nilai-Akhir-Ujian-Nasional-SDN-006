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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-zinc-900 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Tahun Ajaran {schoolProfile.tahunPelajaran}
              </span>
              <span className="text-xs text-zinc-300">Resmi Terverifikasi</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              Sistem Rekapitulasi Nilai Akhir & SKHU
            </h2>
            <p className="mt-1 text-sm text-emerald-100/90 max-w-2xl">
              Pengadministrasian terpadu nilai rapor S7-S12, nilai Ujian Sekolah (US), transkrip kelulusan, dan tata kelola ruang ujian SDN 006 Sungai Buluh, Singingi Hilir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('final-rekap')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md hover:bg-amber-300 transition-colors"
            >
              <Award className="h-4 w-4" />
              Lihat Rekap Lengkap
            </button>
            <button
              onClick={() => setActiveTab('diploma')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition-colors border border-white/20"
            >
              <Printer className="h-4 w-4" />
              Cetak SKHU Massal
            </button>
          </div>
        </div>

        {/* Ambient background ornament */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peserta */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-hover hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Peserta UN/US</span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{totalStudents}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Siswa Terdaftar</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2">
            <span>Terbagi dalam 4 Ruang Ujian</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% Hadir</span>
          </div>
        </div>

        {/* Tingkat Kelulusan */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-hover hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tingkat Kelulusan</span>
            <div className="rounded-xl bg-green-100 p-2 text-green-700 dark:bg-green-950/70 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{graduationRate}%</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">({lulusCount} dari {totalStudents})</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2">
            <span>Kriteria KKM: {schoolProfile.kkmKelulusan}</span>
            <span className="font-semibold text-green-600">Semua Lulus</span>
          </div>
        </div>

        {/* Rata-Rata Nilai Akhir */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-hover hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Rata-rata Nilai Sekolah</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{avgSchoolScore}</span>
            <Badge variant="emerald" size="sm">Predikat B</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2">
            <span>Tertinggi: <b className="text-emerald-600 font-mono">{highestScore}</b></span>
            <span>Terendah: <b className="text-zinc-700 dark:text-zinc-300 font-mono">{lowestScore}</b></span>
          </div>
        </div>

        {/* Kelengkapan Administrasi */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-hover hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Kelengkapan Data Nilai</span>
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-950/70 dark:text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">100%</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Lengkap</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2">
            <span>Rapor S7-S12 & US</span>
            <span className="font-semibold text-sky-600">Terverifikasi</span>
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
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                5 Siswa Peraih Nilai Akhir Tertinggi SDN 006
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Peringkat kehormatan berdasarkan kalkulasi nilai akhir Ujian Nasional / Sekolah
            </p>
          </div>
          <button
            onClick={() => setActiveTab('final-rekap')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Lihat Seluruh Peringkat Siswa <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                <th className="pb-3 font-semibold w-14">Rank</th>
                <th className="pb-3 font-semibold">Nama Peserta</th>
                <th className="pb-3 font-semibold">No Peserta / NISN</th>
                <th className="pb-3 font-semibold">Ruang</th>
                <th className="pb-3 font-semibold text-center">Nilai Akhir (NA)</th>
                <th className="pb-3 font-semibold text-center">Predikat</th>
                <th className="pb-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {topStudents.map((item, index) => {
                const s = item.student;
                const pred = getGradePredicate(item.overallScore);
                const rankBadges = [
                  'bg-amber-400 text-amber-950',
                  'bg-zinc-300 text-zinc-800',
                  'bg-amber-600 text-white',
                  'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                  'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                ];

                return (
                  <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
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
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{s.nama}</div>
                      <div className="text-[11px] text-zinc-500">TTL: {s.tempatLahir}, {s.tanggalLahir}</div>
                    </td>
                    <td className="py-3 font-mono text-zinc-600 dark:text-zinc-400">
                      <div>{s.noPeserta}</div>
                      <div className="text-[10px] text-zinc-400">NISN: {s.nisn}</div>
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{s.ruang}</span>
                      <div className="text-[10px] text-zinc-500">Meja #{s.noMeja}</div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-mono text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                        {item.overallScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant="emerald" size="sm">
                        {pred.label}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudentForSKHU(s);
                          setActiveTab('diploma');
                        }}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition-colors"
                      >
                        Cetak SKHU
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
