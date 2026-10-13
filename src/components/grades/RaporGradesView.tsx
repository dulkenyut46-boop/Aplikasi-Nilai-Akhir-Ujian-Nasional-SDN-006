import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSubjectRaporAverage, calculateOverallRaporAverage } from '../../constants/subjects';
import { SubjectKey } from '../../types';
import { BookOpen, Search, Save, Check, RefreshCw, Calculator, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { ImportGradesModal } from './ImportGradesModal';

export const RaporGradesView: React.FC = () => {
  const { students, subjects, updateStudentRaporScore, downloadGradesExcelTemplate, showToast } = useApp();

  type SemesterKey = 's7' | 's8' | 's9' | 's10' | 's11' | 's12' | 'summary';
  const [selectedSemester, setSelectedSemester] = useState<SemesterKey>('summary');
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const semesters = [
    { key: 'summary', label: 'Rata-Rata Rapor (S7 - S12)', desc: 'SRERATA K-13' },
    { key: 's7', label: 'Semester 7', desc: 'Kelas IV Sem 1' },
    { key: 's8', label: 'Semester 8', desc: 'Kelas IV Sem 2' },
    { key: 's9', label: 'Semester 9', desc: 'Kelas V Sem 1' },
    { key: 's10', label: 'Semester 10', desc: 'Kelas V Sem 2' },
    { key: 's11', label: 'Semester 11', desc: 'Kelas VI Sem 1' },
    { key: 's12', label: 'Semester 12', desc: 'Kelas VI Sem 2' },
  ];

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.noPeserta.toLowerCase().includes(search.toLowerCase());
    const matchRoom = selectedRoom === 'ALL' || s.ruang === selectedRoom;
    return matchSearch && matchRoom;
  });

  const handleScoreChange = (
    studentId: string,
    sem: 's7' | 's8' | 's9' | 's10' | 's11' | 's12',
    subject: SubjectKey,
    valStr: string
  ) => {
    const val = parseFloat(valStr) || 0;
    const clamped = Math.min(100, Math.max(0, val));
    updateStudentRaporScore(studentId, sem, subject, clamped);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Pengolahan Nilai Rapor Semester 7 s.d. 12 (K13)
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Nilai rapor semester Kelas 4, 5, dan 6 dengan formula rata-rata otomatis untuk syarat kelulusan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              downloadGradesExcelTemplate(
                'rapor',
                selectedSemester === 'summary' ? 's12' : selectedSemester
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 transition-colors shadow-xs"
            title="Unduh format template Excel (.xlsx) untuk semester ini"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Template Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
            title="Impor nilai rapor dari berkas Excel (.xlsx)"
          >
            <Upload className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            Impor Nilai Rapor
          </button>

          <button
            onClick={() => {
              showToast('Kalkulasi Selesai', 'Rata-rata seluruh rapor telah disinkronkan ke rekap.', 'success');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
          >
            <Calculator className="h-4 w-4" />
            Sinkronkan Rata-Rata
          </button>
        </div>
      </div>

      {/* Semester Selector Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {semesters.map((sem) => {
          const isActive = selectedSemester === sem.key;
          return (
            <button
              key={sem.key}
              onClick={() => setSelectedSemester(sem.key as SemesterKey)}
              className={`flex flex-col shrink-0 px-4 py-2.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-emerald-600 bg-emerald-800 text-white shadow-md'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="text-xs font-bold leading-tight">{sem.label}</span>
              <span
                className={`text-[10px] ${
                  isActive ? 'text-emerald-200' : 'text-zinc-400'
                }`}
              >
                {sem.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari Nama Peserta atau No Ujian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          />
        </div>

        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <option value="ALL">Semua Ruang Ujian</option>
          <option value="RUANG 1">RUANG 1</option>
          <option value="RUANG 2">RUANG 2</option>
          <option value="RUANG 3">RUANG 3</option>
          <option value="RUANG 4">RUANG 4</option>
        </select>
      </div>

      {/* Main Grades Matrix Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-200 font-bold">
              <tr>
                <th className="p-3 w-12 text-center sticky left-0 bg-zinc-50 dark:bg-zinc-800 z-10">No</th>
                <th className="p-3 min-w-[200px] sticky left-12 bg-zinc-50 dark:bg-zinc-800 z-10">Nama Peserta</th>
                <th className="p-3 text-center min-w-[70px]">Ruang</th>
                {subjects.map((sub) => (
                  <th key={sub.key} className="p-3 text-center min-w-[75px]" title={sub.name}>
                    <div>{sub.code}</div>
                    <div className="text-[10px] text-zinc-400 font-normal">KKM {sub.kkm}</div>
                  </th>
                ))}
                <th className="p-3 text-center min-w-[90px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200">
                  Rata-Rata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredStudents.map((s, idx) => {
                const overallRaporAvg = calculateOverallRaporAverage(s, subjects);

                return (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 text-center font-bold text-zinc-500 sticky left-0 bg-white dark:bg-zinc-900 z-10">
                      {idx + 1}
                    </td>
                    <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 sticky left-12 bg-white dark:bg-zinc-900 z-10 truncate max-w-[220px]">
                      <div>{s.nama}</div>
                      <div className="text-[10px] font-mono text-zinc-400">{s.noPeserta}</div>
                    </td>
                    <td className="p-3 text-center text-zinc-600 dark:text-zinc-400 font-medium">
                      {s.ruang.replace('RUANG ', 'R')}
                    </td>

                    {/* Subjects Scores */}
                    {subjects.map((sub) => {
                      if (selectedSemester === 'summary') {
                        // Display 6-semester average
                        const avgScore = calculateSubjectRaporAverage(s, sub.key);
                        return (
                          <td key={sub.key} className="p-2.5 text-center font-mono font-medium text-zinc-800 dark:text-zinc-200">
                            {avgScore.toFixed(2)}
                          </td>
                        );
                      } else {
                        // Direct semester score editor
                        const semVal = s.rapor[selectedSemester][sub.key] || 0;
                        return (
                          <td key={sub.key} className="p-1.5 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={1}
                              value={semVal}
                              onChange={(e) =>
                                handleScoreChange(
                                  s.id,
                                  selectedSemester,
                                  sub.key,
                                  e.target.value
                                )
                              }
                              className="w-16 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-center font-mono text-xs font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                          </td>
                        );
                      }
                    })}

                    {/* Row Average */}
                    <td className="p-3 text-center font-mono font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {overallRaporAvg.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      <ImportGradesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        defaultCategory="rapor"
        defaultSemester={selectedSemester === 'summary' ? 's12' : selectedSemester}
      />
    </div>
  );
};
