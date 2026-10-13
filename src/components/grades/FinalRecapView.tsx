import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  SUBJECT_LIST,
  calculateSubjectFinalScore,
  calculateStudentOverallFinalScore,
  calculateStudentTotalFinalScore,
  getGradePredicate,
  calculateSubjectRaporAverage,
  calculateSubjectUSScore,
} from '../../constants/subjects';
import { Badge } from '../common/Badge';
import { KopSurat } from '../common/KopSurat';
import { PrintPreviewModal } from '../common/PrintPreviewModal';
import {
  Award,
  Search,
  Download,
  Printer,
  ChevronDown,
  Trophy,
  Filter,
  Eye,
  FileSpreadsheet,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

export const FinalRecapView: React.FC = () => {
  const {
    students,
    schoolProfile,
    subjects,
    setSelectedStudentForSKHU,
    setActiveTab,
    exportToCSV,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [viewMode, setViewMode] = useState<'condensed' | 'detailed'>('condensed');

  // Print menu states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<'ledger' | 'top10' | 'per-ruang' | 'statistik'>('ledger');
  const [printRoom, setPrintRoom] = useState<string>('ALL');

  // Compute student rankings based on overall final score
  const rankedStudents = [...students]
    .map((s) => ({
      student: s,
      totalNA: calculateStudentTotalFinalScore(s, schoolProfile, subjects),
      avgNA: calculateStudentOverallFinalScore(s, schoolProfile, subjects),
    }))
    .sort((a, b) => b.totalNA - a.totalNA)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  const filteredRankedStudents = rankedStudents.filter((item) => {
    const s = item.student;
    const matchSearch =
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.noPeserta.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.includes(search);
    const matchRoom = selectedRoom === 'ALL' || s.ruang === selectedRoom;
    return matchSearch && matchRoom;
  });

  // Calculate subject statistical summaries
  const subjectStats = subjects.map((sub) => {
    const scores = students.map((s) => calculateSubjectFinalScore(s, sub.key, schoolProfile));
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const max = scores.length > 0 ? Math.max(...scores) : 0;
    const min = scores.length > 0 ? Math.min(...scores) : 0;
    return {
      sub,
      avg: Number(avg.toFixed(2)),
      max: Number(max.toFixed(2)),
      min: Number(min.toFixed(2)),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Rekapitulasi Nilai Akhir (K-13 / US) & Perangkingan
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Formula Penetapan Kelulusan: {schoolProfile.bobotRapor}% Rata-Rata Rapor + {schoolProfile.bobotUS}% Ujian Sekolah (SDN 006 Sungai Buluh)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl border border-zinc-200 p-0.5 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
            <button
              onClick={() => setViewMode('condensed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'condensed'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Ringkas (Nilai Akhir)
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Lengkap (Rapor + US + NA)
            </button>
          </div>

          <button
            onClick={() => setActiveTab('grades-template-import')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/70 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
            title="Buka menu template dan impor nilai Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            Template & Impor Nilai
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-colors"
            title="Buka menu cetak buku ledger rekapitulasi nilai akhir dan peringkat"
          >
            <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Menu Cetak Rekap Nilai
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            Unduh Excel/CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari Peserta Berdasarkan Nama / NISN / No UN..."
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
          <option value="ALL">Semua Ruang Ujian (R1 - R4)</option>
          <option value="RUANG 1">RUANG 1</option>
          <option value="RUANG 2">RUANG 2</option>
          <option value="RUANG 3">RUANG 3</option>
          <option value="RUANG 4">RUANG 4</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-200 font-bold">
              <tr>
                <th className="p-3 w-12 text-center sticky left-0 bg-zinc-50 dark:bg-zinc-800 z-10">Rank</th>
                <th className="p-3 min-w-[200px] sticky left-12 bg-zinc-50 dark:bg-zinc-800 z-10">Nama Peserta</th>
                <th className="p-3 text-center min-w-[70px]">Ruang</th>

                {subjects.map((sub) => (
                  <th key={sub.key} className="p-3 text-center min-w-[70px]" title={sub.name}>
                    <div>{sub.code}</div>
                  </th>
                ))}

                <th className="p-3 text-center min-w-[80px] bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
                  Total
                </th>
                <th className="p-3 text-center min-w-[85px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200">
                  Rata-Rata
                </th>
                <th className="p-3 text-center min-w-[70px]">Predikat</th>
                <th className="p-3 text-center min-w-[80px]">Status</th>
                <th className="p-3 text-right min-w-[90px] pr-4">Cetak SKHU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredRankedStudents.map((item) => {
                const s = item.student;
                const pred = getGradePredicate(item.avgNA);

                return (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Rank */}
                    <td className="p-3 text-center sticky left-0 bg-white dark:bg-zinc-900 z-10 font-bold">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                          item.rank === 1
                            ? 'bg-amber-400 text-amber-950'
                            : item.rank === 2
                            ? 'bg-zinc-300 text-zinc-900'
                            : item.rank === 3
                            ? 'bg-amber-600 text-white'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100 sticky left-12 bg-white dark:bg-zinc-900 z-10 truncate max-w-[220px]">
                      <div>{s.nama}</div>
                      <div className="text-[10px] font-mono text-zinc-400">{s.noPeserta}</div>
                    </td>

                    {/* Room */}
                    <td className="p-3 text-center text-zinc-600 dark:text-zinc-400 font-medium">
                      {s.ruang.replace('RUANG ', 'R')}
                    </td>

                    {/* Subject final scores */}
                    {subjects.map((sub) => {
                      const finalScore = calculateSubjectFinalScore(s, sub.key, schoolProfile);
                      const rAvg = calculateSubjectRaporAverage(s, sub.key);
                      const usVal = calculateSubjectUSScore(s, sub.key);

                      return (
                        <td key={sub.key} className="p-2.5 text-center font-mono">
                          {viewMode === 'condensed' ? (
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {finalScore.toFixed(2)}
                            </span>
                          ) : (
                            <div className="text-[11px] leading-tight">
                              <div className="font-bold text-emerald-700 dark:text-emerald-400">
                                {finalScore.toFixed(1)}
                              </div>
                              <div className="text-[9px] text-zinc-400">
                                R:{rAvg.toFixed(0)}|U:{usVal.toFixed(0)}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Total NA */}
                    <td className="p-3 text-center font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20">
                      {item.totalNA.toFixed(1)}
                    </td>

                    {/* Average NA */}
                    <td className="p-3 text-center font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {item.avgNA.toFixed(2)}
                    </td>

                    {/* Predikat */}
                    <td className="p-3 text-center">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{pred.grade}</span>
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      <Badge variant="emerald" size="sm">
                        {s.statusKelulusan}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td className="p-3 text-right pr-4">
                      <button
                        onClick={() => {
                          setSelectedStudentForSKHU(s);
                          setActiveTab('diploma');
                        }}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition-colors"
                        title="Buka Transkrip Nilai Siswa"
                      >
                        Transkrip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Statistical Summary Footer */}
            <tfoot className="border-t-2 border-zinc-300 bg-zinc-100/90 dark:border-zinc-700 dark:bg-zinc-800/90 font-bold text-zinc-800 dark:text-zinc-100 text-xs">
              <tr>
                <td colSpan={3} className="p-3 text-right uppercase tracking-wider">
                  Rata-Rata Nilai Sekolah:
                </td>
                {subjectStats.map((item) => (
                  <td key={item.sub.key} className="p-3 text-center font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                    {item.avg.toFixed(2)}
                  </td>
                ))}
                <td colSpan={5} className="p-3"></td>
              </tr>
              <tr>
                <td colSpan={3} className="p-2 text-right uppercase tracking-wider text-[11px] text-zinc-500">
                  Nilai Tertinggi (Maksimum):
                </td>
                {subjectStats.map((item) => (
                  <td key={item.sub.key} className="p-2 text-center font-mono text-zinc-700 dark:text-zinc-300 text-[11px]">
                    {item.max.toFixed(2)}
                  </td>
                ))}
                <td colSpan={5} className="p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================
          PRINT PREVIEW MODAL: MENU CETAK REKAP NILAI AKHIR & LEDGER
         ======================================================== */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Menu Cetak & Pratinjau: Rekap Nilai Akhir"
        subtitle={`SDN 006 Sungai Buluh • TP ${schoolProfile.tahunPelajaran} • ${rankedStudents.filter((it) => printRoom === 'ALL' || it.student.ruang === printRoom).length} Siswa (${printRoom === 'ALL' ? 'Semua Ruangan' : printRoom})`}
        defaultOrientation={printFormat === 'top10' || printFormat === 'statistik' ? 'portrait' : 'landscape'}
        toolbarExtra={
          <div className="flex flex-wrap items-center gap-2">
            {/* Format Selector */}
            <div className="flex items-center rounded-xl border border-zinc-700 bg-zinc-800 p-0.5 text-xs text-zinc-300">
              {[
                { key: 'ledger', label: 'Buku Ledger Nilai' },
                { key: 'top10', label: '10 Besar (Juara)' },
                { key: 'per-ruang', label: 'Rekap Ruangan' },
                { key: 'statistik', label: 'Statistik Mapel' },
              ].map((fmt) => (
                <button
                  key={fmt.key}
                  type="button"
                  onClick={() => setPrintFormat(fmt.key as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    printFormat === fmt.key
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            {/* Room Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 font-semibold hidden sm:inline">Ruang:</span>
              <select
                value={printRoom}
                onChange={(e) => setPrintRoom(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-bold text-zinc-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Ruangan</option>
                <option value="RUANG 1">Ruang 1</option>
                <option value="RUANG 2">Ruang 2</option>
                <option value="RUANG 3">Ruang 3</option>
                <option value="RUANG 4">Ruang 4</option>
              </select>
            </div>
          </div>
        }
      >
        <div className="space-y-5 text-xs text-black">
          {/* Kop Surat Resmi */}
          <KopSurat schoolProfile={schoolProfile} variant="compact" />

          {/* Judul Dokumen */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-extrabold uppercase tracking-wide underline text-black">
              {printFormat === 'top10' && 'PENGUMUMAN PERINGKAT 10 BESAR (JUARA UMUM KELULUSAN)'}
              {(printFormat === 'ledger' || printFormat === 'per-ruang') && 'BUKU LEDGER REKAPITULASI NILAI AKHIR & PERANGKINGAN KELULUSAN'}
              {printFormat === 'statistik' && 'REKAPITULASI STATISTIK & ANALISIS KETUNTASAN MATA PELAJARAN'}
            </h3>
            <p className="text-xs font-bold text-zinc-700">
              {schoolProfile.namaSekolah} • TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
              {printRoom !== 'ALL' && ` • ${printRoom}`}
            </p>
            <p className="text-[10px] text-zinc-600 font-medium">
              Formula Bobot: {schoolProfile.bobotRapor}% Rata-Rata Rapor + {schoolProfile.bobotUS}% Ujian Sekolah • KKM Kelulusan: {schoolProfile.kkmKelulusan}
            </p>
          </div>

          {/* 1. Format Ledger & Per-Ruangan */}
          {(printFormat === 'ledger' || printFormat === 'per-ruang') && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border border-black border-collapse">
                <thead>
                  <tr className="bg-zinc-100 font-bold border-b border-black text-black">
                    <th className="p-1.5 w-7 text-center border-r border-black">Rnk</th>
                    <th className="p-1.5 min-w-[130px] border-r border-black">Nama Lengkap Siswa</th>
                    <th className="p-1.5 min-w-[90px] border-r border-black">No. Peserta</th>
                    <th className="p-1.5 text-center w-8 border-r border-black">Ruang</th>
                    {subjects.map((sub) => (
                      <th key={sub.key} className="p-1 text-center min-w-[34px] border-r border-black">
                        {sub.code}
                      </th>
                    ))}
                    <th className="p-1.5 text-center min-w-[48px] border-r border-black font-black">
                      Total
                    </th>
                    <th className="p-1.5 text-center min-w-[48px] border-r border-black font-black">
                      Rata
                    </th>
                    <th className="p-1.5 text-center w-7 border-r border-black font-black">Pred</th>
                    <th className="p-1.5 text-center min-w-[50px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedStudents
                    .filter((item) => printRoom === 'ALL' || item.student.ruang === printRoom)
                    .map((item) => {
                      const pred = getGradePredicate(item.avgNA);
                      const isLulus = item.avgNA >= schoolProfile.kkmKelulusan;
                      return (
                        <tr key={item.student.id} className="border-b border-black break-inside-avoid h-6">
                          <td className="p-1 text-center font-bold border-r border-black">{item.rank}</td>
                          <td className="p-1 font-bold uppercase border-r border-black truncate">
                            {item.student.nama}
                          </td>
                          <td className="p-1 font-mono border-r border-black">{item.student.noPeserta}</td>
                          <td className="p-1 text-center font-semibold border-r border-black">
                            {item.student.ruang.replace('RUANG ', 'R-')}
                          </td>
                          {subjects.map((sub) => {
                            const score = calculateSubjectFinalScore(item.student, sub.key, schoolProfile);
                            return (
                              <td key={sub.key} className="p-1 text-center font-mono border-r border-black">
                                {score.toFixed(1)}
                              </td>
                            );
                          })}
                          <td className="p-1 text-center font-mono font-bold border-r border-black">
                            {item.totalNA.toFixed(1)}
                          </td>
                          <td className="p-1 text-center font-mono font-black border-r border-black">
                            {item.avgNA.toFixed(2)}
                          </td>
                          <td className="p-1 text-center font-black border-r border-black">{pred.grade}</td>
                          <td className="p-1 text-center font-bold">
                            {isLulus ? 'LULUS' : 'TIDAK'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Format Top 10 Juara Umum */}
          {printFormat === 'top10' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {rankedStudents.slice(0, 10).map((item) => (
                  <div
                    key={item.student.id}
                    className="rounded-lg border border-black p-3.5 flex items-center justify-between break-inside-avoid bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black bg-zinc-100 font-black text-black text-base">
                        #{item.rank}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold uppercase text-xs text-black truncate">
                          {item.student.nama}
                        </h4>
                        <p className="font-mono text-[11px] text-zinc-700">
                          {item.student.noPeserta} • {item.student.ruang}
                        </p>
                        <p className="text-[10px] text-zinc-600">NISN: {item.student.nisn}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-zinc-600 block uppercase">Nilai Rata-rata</span>
                      <span className="font-mono font-black text-base text-black">
                        {item.avgNA.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-700 block">
                        Total NA: {item.totalNA.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Format Statistik Mata Pelajaran */}
          {printFormat === 'statistik' && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead>
                  <tr className="bg-zinc-100 font-bold border-b border-black">
                    <th className="p-2 text-center w-10 border-r border-black">No</th>
                    <th className="p-2 min-w-[160px] border-r border-black">Mata Pelajaran</th>
                    <th className="p-2 text-center min-w-[70px] border-r border-black">KKM</th>
                    <th className="p-2 text-center min-w-[80px] border-r border-black">Rata-rata</th>
                    <th className="p-2 text-center min-w-[80px] border-r border-black">Tertinggi</th>
                    <th className="p-2 text-center min-w-[80px] border-r border-black">Terendah</th>
                    <th className="p-2 text-center min-w-[90px] border-r border-black">Tuntas</th>
                    <th className="p-2 text-center min-w-[90px]">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectStats.map((st, idx) => {
                    const passedCount = students.filter(
                      (s) => calculateSubjectFinalScore(s, st.sub.key, schoolProfile) >= st.sub.kkm
                    ).length;
                    const pct = students.length > 0 ? Math.round((passedCount / students.length) * 100) : 0;
                    return (
                      <tr key={st.sub.key} className="border-b border-black h-8 break-inside-avoid">
                        <td className="p-2 text-center font-bold border-r border-black">{idx + 1}</td>
                        <td className="p-2 font-bold border-r border-black">{st.sub.name} ({st.sub.code})</td>
                        <td className="p-2 text-center font-mono border-r border-black">{st.sub.kkm}</td>
                        <td className="p-2 text-center font-mono font-bold border-r border-black">{st.avg}</td>
                        <td className="p-2 text-center font-mono border-r border-black">{st.max}</td>
                        <td className="p-2 text-center font-mono border-r border-black">{st.min}</td>
                        <td className="p-2 text-center font-mono border-r border-black">{passedCount} siswa</td>
                        <td className="p-2 text-center font-mono font-bold">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Ringkasan Kelulusan */}
          <div className="flex items-center justify-between border-t border-black pt-3 text-xs">
            <div className="space-x-5 font-semibold">
              <span>Total Peserta: <b>{rankedStudents.filter((it) => printRoom === 'ALL' || it.student.ruang === printRoom).length} siswa</b></span>
              <span>Lulus: <b>{rankedStudents.filter((it) => (printRoom === 'ALL' || it.student.ruang === printRoom) && it.avgNA >= schoolProfile.kkmKelulusan).length} siswa</b></span>
              <span>Tidak Lulus: <b>{rankedStudents.filter((it) => (printRoom === 'ALL' || it.student.ruang === printRoom) && it.avgNA < schoolProfile.kkmKelulusan).length} siswa</b></span>
              <span>Persentase: <b>
                {rankedStudents.filter((it) => printRoom === 'ALL' || it.student.ruang === printRoom).length > 0
                  ? Math.round(
                      (rankedStudents.filter((it) => (printRoom === 'ALL' || it.student.ruang === printRoom) && it.avgNA >= schoolProfile.kkmKelulusan).length /
                        rankedStudents.filter((it) => printRoom === 'ALL' || it.student.ruang === printRoom).length) *
                        100
                    )
                  : 0}%
              </b></span>
            </div>
            <div className="text-[11px] text-zinc-500">
              Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Tanda Tangan Resmi */}
          <div className="grid grid-cols-2 pt-6 text-xs break-inside-avoid">
            <div>
              <p className="font-semibold text-zinc-800">Ketua Panitia Ujian,</p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase text-black">{schoolProfile.ketuaPanitia}</p>
              <p className="font-mono text-[11px] text-zinc-700">NIP. {schoolProfile.nipKetuaPanitia}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-700">{schoolProfile.tempatCetak || 'Sungai Buluh'}, {schoolProfile.tanggalKelulusan}</p>
              <p className="font-bold text-black">Kepala {schoolProfile.namaSekolah},</p>
              <div className="h-16"></div>
              <p className="font-bold underline uppercase text-black">{schoolProfile.kepalaSekolah}</p>
              <p className="font-mono text-[11px] text-zinc-700">NIP. {schoolProfile.nipKepalaSekolah}</p>
            </div>
          </div>
        </div>
      </PrintPreviewModal>
    </div>
  );
};
