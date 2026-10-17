import React, { useState, useMemo } from 'react';
import { Student, SchoolProfile } from '../../types';
import {
  calculateStudentOverallFinalScore,
  getGradePredicate,
  SUBJECT_LIST,
  calculateSubjectFinalScore,
} from '../../constants/subjects';
import { PieChart, Users, Award, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  students: Student[];
  schoolProfile: SchoolProfile;
}

type PieMetric = 'predicate' | 'room' | 'mastery';

interface SliceData {
  id: string;
  label: string;
  subLabel: string;
  value: number;
  percentage: number;
  color: string;
  accentBg: string;
  borderClass: string;
  textColor: string;
}

export const ExamScorePieChart: React.FC<Props> = ({ students, schoolProfile }) => {
  const [metric, setMetric] = useState<PieMetric>('predicate');
  const [hoveredSlice, setHoveredSlice] = useState<SliceData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL');

  // Filter students based on room if applicable
  const filteredStudents = useMemo(() => {
    if (selectedRoom === 'ALL' || metric === 'room') return students;
    return students.filter((s) => s.ruang === selectedRoom);
  }, [students, selectedRoom, metric]);

  // Overall student scores for predicate analysis
  const studentScores = useMemo(() => {
    return filteredStudents.map((s) => ({
      student: s,
      overallScore: calculateStudentOverallFinalScore(s, schoolProfile),
    }));
  }, [filteredStudents, schoolProfile]);

  // Slices configuration based on metric
  const slices: SliceData[] = useMemo(() => {
    const total = filteredStudents.length;
    if (total === 0) return [];

    if (metric === 'predicate') {
      // Predicate counts (A, B, C, D)
      const counts = { A: 0, B: 0, C: 0, D: 0 };
      studentScores.forEach((item) => {
        const pred = getGradePredicate(item.overallScore);
        if (pred.grade === 'A') counts.A++;
        else if (pred.grade === 'B') counts.B++;
        else if (pred.grade === 'C') counts.C++;
        else counts.D++;
      });

      return [
        {
          id: 'A',
          label: 'Predikat A (Sangat Baik)',
          subLabel: 'Nilai Akhir ≥ 90.00',
          value: counts.A,
          percentage: Number(((counts.A / total) * 100).toFixed(1)),
          color: '#059669', // emerald-600
          accentBg: 'bg-emerald-500',
          borderClass: 'border-emerald-500',
          textColor: 'text-emerald-700 dark:text-emerald-400',
        },
        {
          id: 'B',
          label: 'Predikat B (Baik)',
          subLabel: 'Nilai Akhir 80.00 - 89.99',
          value: counts.B,
          percentage: Number(((counts.B / total) * 100).toFixed(1)),
          color: '#0284c7', // sky-600
          accentBg: 'bg-sky-500',
          borderClass: 'border-sky-500',
          textColor: 'text-sky-700 dark:text-sky-400',
        },
        {
          id: 'C',
          label: 'Predikat C (Cukup)',
          subLabel: 'Nilai Akhir 70.00 - 79.99',
          value: counts.C,
          percentage: Number(((counts.C / total) * 100).toFixed(1)),
          color: '#d97706', // amber-600
          accentBg: 'bg-amber-500',
          borderClass: 'border-amber-500',
          textColor: 'text-amber-700 dark:text-amber-400',
        },
        {
          id: 'D',
          label: 'Predikat D (Kurang)',
          subLabel: 'Nilai Akhir < 70.00',
          value: counts.D,
          percentage: Number(((counts.D / total) * 100).toFixed(1)),
          color: '#e11d48', // rose-600
          accentBg: 'bg-rose-500',
          borderClass: 'border-rose-500',
          textColor: 'text-rose-700 dark:text-rose-400',
        },
      ];
    } else if (metric === 'room') {
      // Room counts
      const roomCounts: Record<string, number> = {
        'RUANG 1': students.filter((s) => s.ruang === 'RUANG 1').length,
        'RUANG 2': students.filter((s) => s.ruang === 'RUANG 2').length,
        'RUANG 3': students.filter((s) => s.ruang === 'RUANG 3').length,
        'RUANG 4': students.filter((s) => s.ruang === 'RUANG 4').length,
      };

      const roomColors = [
        { id: 'RUANG 1', color: '#0d9488', bg: 'bg-teal-500', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-500' },
        { id: 'RUANG 2', color: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-500' },
        { id: 'RUANG 3', color: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500' },
        { id: 'RUANG 4', color: '#8b5cf6', bg: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500' },
      ];

      return roomColors.map((rc) => {
        const val = roomCounts[rc.id] || 0;
        return {
          id: rc.id,
          label: `${rc.id}`,
          subLabel: 'Kapasitas 8 Peserta Didik',
          value: val,
          percentage: Number(((val / students.length) * 100).toFixed(1)),
          color: rc.color,
          accentBg: rc.bg,
          borderClass: rc.border,
          textColor: rc.text,
        };
      });
    } else {
      // Ketuntasan KKM
      let allPass = 0;
      let partialPass = 0;
      let needRemedial = 0;

      filteredStudents.forEach((s) => {
        let passedSubjects = 0;
        SUBJECT_LIST.forEach((sub) => {
          const score = calculateSubjectFinalScore(s, sub.key, schoolProfile);
          if (score >= sub.kkm) passedSubjects++;
        });

        if (passedSubjects === SUBJECT_LIST.length) {
          allPass++;
        } else if (passedSubjects >= SUBJECT_LIST.length * 0.8) {
          partialPass++;
        } else {
          needRemedial++;
        }
      });

      return [
        {
          id: 'TUNTAS_PENUH',
          label: 'Tuntas Semua Mapel (100%)',
          subLabel: 'Seluruh 10 Mapel Melampaui KKM',
          value: allPass,
          percentage: Number(((allPass / total) * 100).toFixed(1)),
          color: '#059669',
          accentBg: 'bg-emerald-500',
          borderClass: 'border-emerald-500',
          textColor: 'text-emerald-700 dark:text-emerald-400',
        },
        {
          id: 'TUNTAS_SEBAGIAN',
          label: 'Tuntas Mayoritas (≥80%)',
          subLabel: '8-9 Mapel Melampaui KKM',
          value: partialPass,
          percentage: Number(((partialPass / total) * 100).toFixed(1)),
          color: '#0284c7',
          accentBg: 'bg-sky-500',
          borderClass: 'border-sky-500',
          textColor: 'text-sky-700 dark:text-sky-400',
        },
        {
          id: 'REMEDIAL',
          label: 'Perlu Pendampingan',
          subLabel: 'Beberapa Mapel di Bawah KKM',
          value: needRemedial,
          percentage: Number(((needRemedial / total) * 100).toFixed(1)),
          color: '#e11d48',
          accentBg: 'bg-rose-500',
          borderClass: 'border-rose-500',
          textColor: 'text-rose-700 dark:text-rose-400',
        },
      ];
    }
  }, [filteredStudents, students, studentScores, metric, schoolProfile]);

  // Donut chart geometry calculations
  const radius = 68;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;
  const totalValue = slices.reduce((acc, s) => acc + s.value, 0);

  // Calculate SVG stroke offset cumulative
  let accumulatedPercent = 0;
  const renderedSlices = slices.map((slice) => {
    const fraction = totalValue > 0 ? slice.value / totalValue : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;

    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSlice = hoveredSlice || slices.find((s) => s.value > 0) || slices[0];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <PieChart className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Diagram Lingkaran: Proporsi & Distribusi Mutu
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sebaran klasifikasi predikat kelulusan dan kapasitas kelas
            </p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMetric('predicate')}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                metric === 'predicate'
                  ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Predikat (A/B/C/D)
            </button>
            <button
              type="button"
              onClick={() => setMetric('room')}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                metric === 'room'
                  ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Ruang Ujian
            </button>
            <button
              type="button"
              onClick={() => setMetric('mastery')}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                metric === 'mastery'
                  ? 'bg-white text-zinc-900 dark:bg-zinc-700 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Ketuntasan KKM
            </button>
          </div>

          {/* Room Filter for Predicate/Mastery */}
          {metric !== 'room' && (
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Ruang</option>
              <option value="RUANG 1">Ruang 1</option>
              <option value="RUANG 2">Ruang 2</option>
              <option value="RUANG 3">Ruang 3</option>
              <option value="RUANG 4">Ruang 4</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Visual Content (Donut Chart & Detailed Legend) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: SVG Donut Chart with Center Callout (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 180 180"
            >
              {/* Background Track Circle */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {/* Slices */}
              {renderedSlices.map((slice) => {
                const isHovered = hoveredSlice?.id === slice.id;
                if (slice.value === 0) return null;

                return (
                  <circle
                    key={slice.id}
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    strokeLinecap="butt"
                    fill="transparent"
                    onMouseEnter={() => setHoveredSlice(slice)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    style={{
                      filter: isHovered ? 'drop-shadow(0px 2px 8px rgba(0,0,0,0.25))' : 'none',
                    }}
                  />
                );
              })}
            </svg>

            {/* Central Callout Text Inside the Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              {activeSlice ? (
                <div className="animate-in fade-in duration-150">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                    {activeSlice.id.replace('RUANG ', 'R-')}
                  </span>
                  <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono leading-none my-0.5">
                    {activeSlice.percentage}%
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block">
                    {activeSlice.value} Siswa
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                    {filteredStudents.length}
                  </span>
                  <span className="text-xs text-zinc-500 block">Total Siswa</span>
                </div>
              )}
            </div>
          </div>

          <span className="text-[11px] text-zinc-400 italic mt-1 text-center">
            Arahkan kursor pada diagram untuk melihat rincian
          </span>
        </div>

        {/* Right: Interactive Slice Breakdown & Legend (7 cols) */}
        <div className="md:col-span-7 space-y-2.5">
          {slices.map((slice) => {
            const isHovered = hoveredSlice?.id === slice.id;
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'border-emerald-400 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/30 shadow-xs scale-[1.01]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>{slice.label}</span>
                      {slice.value > 0 && isHovered && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 font-mono">
                          Fokus
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {slice.subLabel}
                    </div>
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {/* Mini Progress Bar */}
                  <div className="w-20 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${slice.percentage}%`,
                        backgroundColor: slice.color,
                      }}
                    />
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {slice.value}
                    </span>
                    <span className="text-xs text-zinc-400 ml-1">
                      ({slice.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Context Footnote */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Total sampel data: <b>{filteredStudents.length} siswa</b> • Standar SKHU SDN 006 Sungai Buluh
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
