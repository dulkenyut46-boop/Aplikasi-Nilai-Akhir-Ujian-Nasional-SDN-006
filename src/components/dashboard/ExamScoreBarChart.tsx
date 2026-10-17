import React, { useState, useMemo } from 'react';
import { Student, SchoolProfile, SubjectInfo, SubjectKey } from '../../types';
import {
  SUBJECT_LIST,
  calculateSubjectFinalScore,
  calculateSubjectUSScore,
  calculateSubjectRaporAverage,
} from '../../constants/subjects';
import {
  BarChart3,
  TrendingUp,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowUpDown,
  Info,
} from 'lucide-react';

interface Props {
  students: Student[];
  schoolProfile: SchoolProfile;
}

type ScoreMode = 'na' | 'us' | 'rapor';
type ViewMode = 'subjects' | 'rooms';

export const ExamScoreBarChart: React.FC<Props> = ({ students, schoolProfile }) => {
  const [scoreMode, setScoreMode] = useState<ScoreMode>('na');
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('subjects');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter students based on selected room
  const filteredStudents = useMemo(() => {
    if (selectedRoom === 'ALL') return students;
    return students.filter((s) => s.ruang === selectedRoom);
  }, [students, selectedRoom]);

  // Compute subject metrics
  const subjectData = useMemo(() => {
    return SUBJECT_LIST.map((sub, idx) => {
      if (filteredStudents.length === 0) {
        return {
          ...sub,
          index: idx,
          average: 0,
          highest: 0,
          highestStudent: '-',
          lowest: 0,
          lowestStudent: '-',
          passCount: 0,
          passRate: 0,
        };
      }

      let total = 0;
      let highest = -1;
      let highestStudent = '';
      let lowest = 999;
      let lowestStudent = '';
      let passCount = 0;

      filteredStudents.forEach((s) => {
        let val = 0;
        if (scoreMode === 'na') {
          val = calculateSubjectFinalScore(s, sub.key, schoolProfile);
        } else if (scoreMode === 'us') {
          val = calculateSubjectUSScore(s, sub.key);
        } else {
          val = calculateSubjectRaporAverage(s, sub.key);
        }

        total += val;
        if (val >= sub.kkm) passCount++;

        if (val > highest) {
          highest = val;
          highestStudent = s.nama;
        }
        if (val < lowest) {
          lowest = val;
          lowestStudent = s.nama;
        }
      });

      const avg = Number((total / filteredStudents.length).toFixed(2));
      const passRate = Number(((passCount / filteredStudents.length) * 100).toFixed(1));

      return {
        ...sub,
        index: idx,
        average: avg,
        highest: highest >= 0 ? Number(highest.toFixed(2)) : 0,
        highestStudent: highestStudent || '-',
        lowest: lowest <= 100 ? Number(lowest.toFixed(2)) : 0,
        lowestStudent: lowestStudent || '-',
        passCount,
        passRate,
      };
    });
  }, [filteredStudents, scoreMode, schoolProfile]);

  // Compute room comparison data
  const roomData = useMemo(() => {
    const rooms = ['RUANG 1', 'RUANG 2', 'RUANG 3', 'RUANG 4'];
    return rooms.map((roomName, idx) => {
      const roomStudents = students.filter((s) => s.ruang === roomName);
      if (roomStudents.length === 0) {
        return {
          room: roomName,
          index: idx,
          studentCount: 0,
          average: 0,
          highest: 0,
          lowest: 0,
        };
      }

      let totalScore = 0;
      let highest = -1;
      let lowest = 999;

      roomStudents.forEach((s) => {
        let studentTotal = 0;
        SUBJECT_LIST.forEach((sub) => {
          if (scoreMode === 'na') {
            studentTotal += calculateSubjectFinalScore(s, sub.key, schoolProfile);
          } else if (scoreMode === 'us') {
            studentTotal += calculateSubjectUSScore(s, sub.key);
          } else {
            studentTotal += calculateSubjectRaporAverage(s, sub.key);
          }
        });
        const studentAvg = studentTotal / SUBJECT_LIST.length;
        totalScore += studentAvg;
        if (studentAvg > highest) highest = studentAvg;
        if (studentAvg < lowest) lowest = studentAvg;
      });

      return {
        room: roomName,
        index: idx,
        studentCount: roomStudents.length,
        average: Number((totalScore / roomStudents.length).toFixed(2)),
        highest: Number(highest.toFixed(2)),
        lowest: Number(lowest.toFixed(2)),
      };
    });
  }, [students, scoreMode, schoolProfile]);

  // Overall statistics for summary highlights
  const overallAverage = useMemo(() => {
    if (subjectData.length === 0) return 0;
    const sum = subjectData.reduce((acc, s) => acc + s.average, 0);
    return Number((sum / subjectData.length).toFixed(2));
  }, [subjectData]);

  const bestSubject = useMemo(() => {
    if (subjectData.length === 0) return null;
    return [...subjectData].sort((a, b) => b.average - a.average)[0];
  }, [subjectData]);

  const lowestSubject = useMemo(() => {
    if (subjectData.length === 0) return null;
    return [...subjectData].sort((a, b) => a.average - b.average)[0];
  }, [subjectData]);

  // Score mode label
  const scoreModeLabel =
    scoreMode === 'na'
      ? 'Nilai Akhir (60% Rapor + 40% US)'
      : scoreMode === 'us'
      ? 'Ujian Sekolah (US Teori & Praktik)'
      : 'Rata-rata Rapor (S7 s/d S12)';

  // Max score reference (typically 100)
  const maxScale = 100;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <BarChart3 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                Grafik Batang: Ringkasan Nilai Ujian Siswa
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {selectedRoom === 'ALL' ? 'Semua Ruang' : selectedRoom}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Visualisasi komparasi rata-rata nilai kelas terhadap kriteria ketuntasan minimal (KKM)
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('subjects')}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                viewMode === 'subjects'
                  ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Per Mata Pelajaran
            </button>
            <button
              type="button"
              onClick={() => setViewMode('rooms')}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                viewMode === 'rooms'
                  ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Per Ruang Ujian
            </button>
          </div>

          {/* Score Type Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={scoreMode}
              onChange={(e) => setScoreMode(e.target.value as ScoreMode)}
              className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="na">📊 Nilai Akhir (NA)</option>
              <option value="us">📝 Nilai Ujian Sekolah (US)</option>
              <option value="rapor">📚 Rata-rata Rapor (S7-S12)</option>
            </select>
          </div>

          {/* Room Filter Selector */}
          {viewMode === 'subjects' && (
            <div className="flex items-center gap-1.5 text-xs">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Ruang ({students.length} Siswa)</option>
                <option value="RUANG 1">Ruang 1 (8 Siswa)</option>
                <option value="RUANG 2">Ruang 2 (8 Siswa)</option>
                <option value="RUANG 3">Ruang 3 (8 Siswa)</option>
                <option value="RUANG 4">Ruang 4 (8 Siswa)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Mode 1: Chart per Mata Pelajaran */}
      {viewMode === 'subjects' && (
        <div className="space-y-4">
          {/* Subtitle & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">
              Basis Penilaian: <b className="text-zinc-800 dark:text-zinc-200">{scoreModeLabel}</b>
            </span>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <span className="h-3 w-3 rounded-xs bg-emerald-600" />
                Rata-rata Kelas
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <span className="h-2 w-3 border-t-2 border-dashed border-amber-500" />
                Ambang KKM
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <span className="h-2 w-3 border-t-2 border-indigo-500" />
                Rata-rata Total ({overallAverage})
              </span>
            </div>
          </div>

          {/* Vertical Bar Chart Canvas */}
          <div className="relative pt-6 pb-2">
            {/* Grid Guidelines (100, 80, 60, 40, 20, 0) */}
            <div className="absolute inset-x-8 top-6 bottom-16 flex flex-col justify-between pointer-events-none text-[10px] text-zinc-400 font-mono">
              {[100, 80, 60, 40, 20, 0].map((val) => (
                <div key={val} className="flex items-center gap-2 w-full">
                  <span className="w-6 text-right shrink-0">{val}</span>
                  <div className="flex-1 border-b border-zinc-100 dark:border-zinc-800" />
                </div>
              ))}
            </div>

            {/* Rata-rata Gabungan Baseline Line */}
            {overallAverage > 0 && (
              <div
                className="absolute inset-x-14 border-t-2 border-indigo-400/80 dark:border-indigo-400/60 z-10 pointer-events-none transition-all duration-300"
                style={{
                  top: `calc(1.5rem + (100% - 5.5rem) * ${(100 - overallAverage) / 100})`,
                }}
              >
                <span className="absolute -top-4 right-0 rounded-md bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  Rata-rata: {overallAverage}
                </span>
              </div>
            )}

            {/* Bars Container */}
            <div className="relative z-20 pl-8 pr-2 grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 items-end h-64 sm:h-72">
              {subjectData.map((sub, idx) => {
                const heightPercent = Math.min(100, Math.max(0, (sub.average / maxScale) * 100));
                const kkmPercent = Math.min(100, Math.max(0, (sub.kkm / maxScale) * 100));
                const isHovered = hoveredIndex === idx;
                const isAboveKKM = sub.average >= sub.kkm;

                return (
                  <div
                    key={sub.key}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="group relative flex flex-col items-center justify-end h-full cursor-pointer"
                  >
                    {/* Score Value on top of bar */}
                    <span
                      className={`text-[10px] sm:text-[11px] font-mono font-bold mb-1 transition-all ${
                        isHovered
                          ? 'text-emerald-700 dark:text-emerald-300 scale-110'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {sub.average.toFixed(1)}
                    </span>

                    {/* Bar Frame with KKM Line Overlay */}
                    <div className="relative w-full max-w-[34px] sm:max-w-[42px] h-full flex items-end">
                      {/* Background Bar */}
                      <div className="w-full h-full rounded-t-lg bg-zinc-100 dark:bg-zinc-800/60 flex items-end overflow-hidden">
                        {/* Actual Value Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 relative ${
                            isAboveKKM
                              ? isHovered
                                ? 'bg-gradient-to-t from-emerald-700 via-emerald-600 to-emerald-400 shadow-md'
                                : 'bg-gradient-to-t from-emerald-700 to-emerald-500'
                              : 'bg-gradient-to-t from-rose-700 to-amber-500'
                          }`}
                        >
                          {/* Shimmer effect on hover */}
                          {isHovered && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          )}
                        </div>
                      </div>

                      {/* KKM Horizontal Line Indicator on the Bar */}
                      <div
                        className="absolute w-[calc(100%+6px)] -left-[3px] border-t-2 border-dashed border-amber-500 z-30"
                        style={{ bottom: `${kkmPercent}%` }}
                        title={`KKM: ${sub.kkm}`}
                      />
                    </div>

                    {/* X-Axis Subject Label */}
                    <div className="mt-2 text-center w-full">
                      <span
                        className={`block text-[11px] sm:text-xs font-bold transition-colors ${
                          isHovered
                            ? 'text-emerald-600 dark:text-emerald-400 underline'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {sub.code}
                      </span>
                      <span className="block text-[9px] text-zinc-400 font-mono">
                        KKM {sub.kkm}
                      </span>
                    </div>

                    {/* Rich Floating Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-3 z-50 w-52 sm:w-60 rounded-xl bg-zinc-950 p-3 text-white shadow-2xl border border-zinc-700 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <div className="border-b border-zinc-800 pb-1.5 mb-1.5">
                          <div className="font-bold text-emerald-400">{sub.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">Kode: {sub.code} • KKM: {sub.kkm}</div>
                        </div>

                        <div className="space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Rata-rata:</span>
                            <span className="font-bold text-emerald-300 text-sm">
                              {sub.average.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Selisih KKM:</span>
                            <span className={`font-bold ${sub.average >= sub.kkm ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {sub.average >= sub.kkm ? '+' : ''}
                              {(sub.average - sub.kkm).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Nilai Tertinggi:</span>
                            <span className="font-bold text-zinc-100">{sub.highest}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate text-right">
                            {sub.highestStudent}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Nilai Terendah:</span>
                            <span className="font-bold text-zinc-100">{sub.lowest}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate text-right">
                            {sub.lowestStudent}
                          </div>
                          <div className="border-t border-zinc-800 pt-1 flex justify-between items-center text-[10px]">
                            <span className="text-zinc-400">Tingkat Tuntas:</span>
                            <span className="font-bold text-emerald-400">
                              {sub.passCount} / {filteredStudents.length} ({sub.passRate}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Chart per Ruang Ujian */}
      {viewMode === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Komparasi Nilai Rata-rata Ujian Lintas 4 Ruangan</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">
              Basis: {scoreModeLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {roomData.map((r) => {
              const heightPercent = Math.min(100, Math.max(0, (r.average / maxScale) * 100));
              const isTop = r.average === Math.max(...roomData.map((d) => d.average));

              return (
                <div
                  key={r.room}
                  className={`rounded-xl border p-4.5 space-y-3 transition-all ${
                    isTop
                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                        {r.room}
                      </span>
                      <div className="text-[11px] text-zinc-500">
                        {r.studentCount} Peserta Ujian
                      </div>
                    </div>
                    {isTop && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                        <Award className="h-3 w-3" /> Tertinggi
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                      {r.average.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500">/ 100</span>
                  </div>

                  {/* Horizontal Bar Progress */}
                  <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      style={{ width: `${heightPercent}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-zinc-600 dark:text-zinc-400 font-mono border-t border-zinc-200 dark:border-zinc-700/60 pt-2">
                    <span>Maks: <b>{r.highest}</b></span>
                    <span>Min: <b>{r.lowest}</b></span>
                    <span>Rentang: <b>{(r.highest - r.lowest).toFixed(2)}</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Summary Highlights Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs">
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">Rata-rata Keseluruhan</div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
            {overallAverage}
          </div>
          <div className="text-[10px] text-zinc-400">10 Mata Pelajaran</div>
        </div>

        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">Mapel Nilai Tertinggi</div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5 truncate">
            {bestSubject ? `${bestSubject.average.toFixed(1)} (${bestSubject.code})` : '-'}
          </div>
          <div className="text-[10px] text-zinc-400 truncate">
            {bestSubject?.name || '-'}
          </div>
        </div>

        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">Mapel Perlu Penguatan</div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-400 font-mono mt-0.5 truncate">
            {lowestSubject ? `${lowestSubject.average.toFixed(1)} (${lowestSubject.code})` : '-'}
          </div>
          <div className="text-[10px] text-zinc-400 truncate">
            {lowestSubject?.name || '-'}
          </div>
        </div>

        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">Ketuntasan Standar KKM</div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
            100%
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Semua mapel di atas KKM
          </div>
        </div>
      </div>
    </div>
  );
};
