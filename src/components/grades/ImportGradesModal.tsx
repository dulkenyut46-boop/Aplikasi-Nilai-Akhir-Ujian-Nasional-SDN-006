import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { SUBJECT_LIST } from '../../constants/subjects';
import { SubjectKey } from '../../types';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  Layers,
  ArrowRight,
  ClipboardPaste,
  Filter,
  RefreshCw,
  Info,
} from 'lucide-react';

interface ImportGradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'rapor' | 'us';
  defaultSemester?: 's7' | 's8' | 's9' | 's10' | 's11' | 's12';
}

interface ParsedGradeRow {
  rowIndex: number;
  rawIdentifier: string;
  matchedStudentName?: string;
  matchedStudentId?: string;
  matchedStudentNoPes?: string;
  isMatched: boolean;
  scores: Record<string, number>;
  errors: string[];
  warnings: string[];
}

export const ImportGradesModal: React.FC<ImportGradesModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'rapor',
  defaultSemester = 's12',
}) => {
  const {
    students,
    downloadGradesExcelTemplate,
    downloadMasterGradesWorkbook,
    importGradesBatch,
    importMultiSheetGrades,
    showToast,
  } = useApp();

  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [category, setCategory] = useState<'rapor' | 'us' | 'multisheet'>('rapor');
  const [semester, setSemester] = useState<'s7' | 's8' | 's9' | 's10' | 's11' | 's12'>(defaultSemester);
  const [fileName, setFileName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedGradeRow[]>([]);
  const [multiSheetData, setMultiSheetData] = useState<Record<string, Array<{ identifier: string; scores: Record<string, any> }>> | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  // Sync default category if provided
  React.useEffect(() => {
    if (defaultCategory) setCategory(defaultCategory);
    if (defaultSemester) setSemester(defaultSemester);
  }, [defaultCategory, defaultSemester]);

  // Clean and normalize strings
  const cleanStr = (val: any) =>
    String(val || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');

  // Subject aliases mapping
  const subjectAliases: Record<SubjectKey, string[]> = {
    pab: ['pab', 'pai', 'agama', 'pendidikanagama', 'agamadidanbudipekerti'],
    ppkn: ['ppkn', 'pkn', 'pancasila', 'pendidikankewarganegaraan'],
    bin: ['bin', 'bind', 'ind', 'bahasaindonesia', 'indonesia'],
    mat: ['mat', 'mtk', 'matematika'],
    ipa: ['ipa', 'sains', 'ilpupengetahuanalam', 'ilmpengetahuanalam', 'ilmapengetahuanalam'],
    ips: ['ips', 'sosial', 'ilmupengetahuansosial'],
    sbdp: ['sbdp', 'sbk', 'senibudaya', 'senibudayadanprakarya', 'prakarya'],
    pjok: ['pjok', 'penjas', 'olahraga', 'penjaskes', 'jasmani'],
    mulok: ['mulok', 'bdaerah', 'bahasadaerah', 'muatanlokal', 'bmelayu', 'bdaerahmelayu'],
    bing: ['bing', 'ing', 'inggris', 'bahasainggris', 'english'],
  };

  const mapHeaderToSubjectField = (headerName: string): { subject: SubjectKey; type: 'tulis' | 'praktik' | 'single' } | null => {
    const raw = headerName.toLowerCase().trim();
    const isPraktik = raw.includes('praktik') || raw.includes('praktek') || raw.endsWith('_p') || raw.endsWith('_prk');
    const isTulis = raw.includes('tulis') || raw.includes('teori') || raw.endsWith('_t') || raw.endsWith('_tls');

    const clean = cleanStr(headerName).replace(/praktik|praktek|tulis|teori/g, '');

    for (const [key, aliases] of Object.entries(subjectAliases)) {
      for (const alias of aliases) {
        if (clean === alias || clean.startsWith(alias) || raw.includes(alias)) {
          return {
            subject: key as SubjectKey,
            type: isPraktik ? 'praktik' : isTulis ? 'tulis' : 'single',
          };
        }
      }
    }
    return null;
  };

  // Process rows array
  const processRawRows = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      setParsedRows([]);
      return;
    }

    // Find header row (usually first non-empty row)
    let headerRowIdx = -1;
    let headers: string[] = [];

    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const row = rows[i];
      const rowVals = Array.isArray(row) ? row : Object.values(row);
      const rowStr = rowVals.map((v) => cleanStr(v)).join(' ');

      if (
        rowStr.includes('nama') ||
        rowStr.includes('peserta') ||
        rowStr.includes('nisn') ||
        rowStr.includes('bin') ||
        rowStr.includes('mat') ||
        rowStr.includes('ipa')
      ) {
        headerRowIdx = i;
        headers = Array.isArray(row)
          ? row.map((h) => String(h || '').trim())
          : Object.keys(row);
        break;
      }
    }

    if (headerRowIdx === -1 && rows.length > 0) {
      headerRowIdx = 0;
      headers = Array.isArray(rows[0])
        ? rows[0].map((h, idx) => `Kolom_${idx + 1}`)
        : Object.keys(rows[0]);
    }

    const dataRows = Array.isArray(rows[headerRowIdx])
      ? rows.slice(headerRowIdx + 1)
      : rows;

    const parsed: ParsedGradeRow[] = [];

    dataRows.forEach((row, idx) => {
      // Build row map
      const rowMap: Record<string, any> = {};
      if (Array.isArray(row)) {
        headers.forEach((h, hIdx) => {
          if (h && row[hIdx] !== undefined) {
            rowMap[h] = row[hIdx];
          }
        });
      } else if (typeof row === 'object' && row !== null) {
        Object.assign(rowMap, row);
      }

      // Check if this row is empty or summary row
      const valuesJoined = Object.values(rowMap).map((v) => String(v || '').trim()).join('');
      if (!valuesJoined || valuesJoined.length === 0) return;

      const lowerJoined = Object.values(rowMap).map((v) => cleanStr(v)).join(' ');
      if (
        lowerJoined.includes('ratarata') ||
        lowerJoined.includes('jumlah') ||
        lowerJoined.includes('keterangan') ||
        lowerJoined.includes('petunjuk')
      ) {
        return;
      }

      // Find student identifier (No Peserta, NISN, Nama)
      let identifier = '';
      for (const [k, v] of Object.entries(rowMap)) {
        const ck = cleanStr(k);
        if (
          ck.includes('nopeserta') ||
          ck.includes('nomorpeserta') ||
          ck.includes('nopes') ||
          ck.includes('nisn') ||
          ck.includes('namapeserta') ||
          ck.includes('namasiswa') ||
          ck === 'nama'
        ) {
          if (v && String(v).trim().length > 0) {
            identifier = String(v).trim();
            break;
          }
        }
      }

      // If still empty, grab first column that looks like student identifier
      if (!identifier) {
        const firstVals = Object.values(rowMap).slice(0, 4);
        for (const v of firstVals) {
          const str = String(v || '').trim();
          if (str.length >= 3 && !/^\d+$/.test(str) && isNaN(Number(str))) {
            identifier = str;
            break;
          }
        }
      }

      if (!identifier) return;

      // Match student in state
      const cleanId = cleanStr(identifier);
      const matched = students.find((s) => {
        return (
          cleanStr(s.noPeserta) === cleanId ||
          cleanStr(s.nisn) === cleanId ||
          cleanStr(s.nama) === cleanId ||
          cleanStr(s.nama).includes(cleanId) ||
          cleanId.includes(cleanStr(s.nama))
        );
      });

      const errors: string[] = [];
      const warnings: string[] = [];
      const scores: Record<string, number> = {};

      if (!matched) {
        warnings.push(`Siswa "${identifier}" tidak ditemukan pada daftar peserta aktif.`);
      }

      // Extract subject scores
      for (const [k, v] of Object.entries(rowMap)) {
        const mapped = mapHeaderToSubjectField(k);
        if (mapped && v !== undefined && v !== null && v !== '') {
          const num = Number(v);
          if (isNaN(num)) {
            warnings.push(`Nilai untuk ${k} bukan angka (${v}).`);
          } else {
            const clamped = Math.min(100, Math.max(0, num));
            if (num < 0 || num > 100) {
              warnings.push(`Nilai ${k} (${num}) disesuaikan ke rentang 0-100 (${clamped}).`);
            }

            if (mapped.type === 'praktik') {
              scores[`${mapped.subject}_praktik`] = clamped;
            } else if (mapped.type === 'tulis') {
              scores[`${mapped.subject}_tulis`] = clamped;
            } else {
              scores[mapped.subject] = clamped;
              scores[`${mapped.subject}_tulis`] = clamped;
            }
          }
        }
      }

      parsed.push({
        rowIndex: idx + 1,
        rawIdentifier: identifier,
        matchedStudentName: matched?.nama,
        matchedStudentId: matched?.id,
        matchedStudentNoPes: matched?.noPeserta,
        isMatched: !!matched,
        scores,
        errors,
        warnings,
      });
    });

    setParsedRows(parsed);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        setAvailableSheets(wb.SheetNames);
        const firstSheetName = wb.SheetNames[0];
        setSelectedSheet(firstSheetName);

        // Check if multi-sheet master file
        const hasMultipleDataSheets = wb.SheetNames.filter(
          (name) => !name.toLowerCase().includes('petunjuk')
        ).length > 1;

        if (hasMultipleDataSheets && wb.SheetNames.some((n) => n.toLowerCase().includes('rapor') || n.toLowerCase().includes('us'))) {
          // Prepare multi-sheet payload
          const multiMap: Record<string, Array<{ identifier: string; scores: Record<string, any> }>> = {};
          wb.SheetNames.forEach((sheetName) => {
            if (sheetName.toLowerCase().includes('petunjuk')) return;
            const ws = wb.Sheets[sheetName];
            const data: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
            // parse
            const rowsForSheet = parseSheetToRows(data);
            if (rowsForSheet.length > 0) {
              multiMap[sheetName] = rowsForSheet;
            }
          });
          setMultiSheetData(multiMap);
        } else {
          setMultiSheetData(null);
        }

        // Auto-detect category from sheet name
        const normSheet = firstSheetName.toLowerCase();
        if (normSheet.includes('us') || normSheet.includes('ujian')) {
          setCategory('us');
        } else if (normSheet.includes('s7')) {
          setCategory('rapor');
          setSemester('s7');
        } else if (normSheet.includes('s8')) {
          setCategory('rapor');
          setSemester('s8');
        } else if (normSheet.includes('s9')) {
          setCategory('rapor');
          setSemester('s9');
        } else if (normSheet.includes('s10')) {
          setCategory('rapor');
          setSemester('s10');
        } else if (normSheet.includes('s11')) {
          setCategory('rapor');
          setSemester('s11');
        } else if (normSheet.includes('s12')) {
          setCategory('rapor');
          setSemester('s12');
        }

        const ws = wb.Sheets[firstSheetName];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        processRawRows(data);
      } catch (err) {
        showToast('Gagal Membaca File', 'Berkas Excel tidak dapat diproses. Pastikan format valid.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Helper for multi-sheet
  const parseSheetToRows = (rawRows: any[]): Array<{ identifier: string; scores: Record<string, any> }> => {
    // simplified parser
    const results: Array<{ identifier: string; scores: Record<string, any> }> = [];
    if (!rawRows || rawRows.length < 2) return results;

    let headers: string[] = [];
    let startIdx = 0;
    for (let i = 0; i < Math.min(6, rawRows.length); i++) {
      const r = rawRows[i];
      if (Array.isArray(r) && r.some((c) => String(c).toLowerCase().includes('nama') || String(c).toLowerCase().includes('peserta'))) {
        headers = r.map((c) => String(c || '').trim());
        startIdx = i + 1;
        break;
      }
    }
    if (headers.length === 0 && Array.isArray(rawRows[0])) {
      headers = rawRows[0].map((c) => String(c || '').trim());
      startIdx = 1;
    }

    for (let i = startIdx; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!Array.isArray(row)) continue;
      const rowMap: Record<string, any> = {};
      headers.forEach((h, hIdx) => {
        rowMap[h] = row[hIdx];
      });

      let id = '';
      for (const [k, v] of Object.entries(rowMap)) {
        const ck = cleanStr(k);
        if (ck.includes('nopes') || ck.includes('nisn') || ck.includes('nama')) {
          if (v) {
            id = String(v).trim();
            break;
          }
        }
      }
      if (!id) continue;

      const scores: Record<string, any> = {};
      for (const [k, v] of Object.entries(rowMap)) {
        const mapped = mapHeaderToSubjectField(k);
        if (mapped && v !== undefined && v !== '' && !isNaN(Number(v))) {
          const val = Math.min(100, Math.max(0, Number(v)));
          if (mapped.type === 'praktik') scores[`${mapped.subject}_praktik`] = val;
          else if (mapped.type === 'tulis') scores[`${mapped.subject}_tulis`] = val;
          else {
            scores[mapped.subject] = val;
            scores[`${mapped.subject}_tulis`] = val;
          }
        }
      }
      results.push({ identifier: id, scores });
    }
    return results;
  };

  // Handle Sheet Change when user picks another sheet in the file
  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheet(sheetName);
    // Re-read file if available or auto switch
    const norm = sheetName.toLowerCase();
    if (norm.includes('us') || norm.includes('ujian')) setCategory('us');
    else if (norm.includes('s7')) { setCategory('rapor'); setSemester('s7'); }
    else if (norm.includes('s8')) { setCategory('rapor'); setSemester('s8'); }
    else if (norm.includes('s9')) { setCategory('rapor'); setSemester('s9'); }
    else if (norm.includes('s10')) { setCategory('rapor'); setSemester('s10'); }
    else if (norm.includes('s11')) { setCategory('rapor'); setSemester('s11'); }
    else if (norm.includes('s12')) { setCategory('rapor'); setSemester('s12'); }
  };

  // Handle Clipboard Paste
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      showToast('Data Kosong', 'Tempelkan (paste) teks tabular dari Excel terlebih dahulu.', 'info');
      return;
    }

    const lines = pastedText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const rows = lines.map((line) => line.split('\t'));
    setFileName('Teks_Clipboard_Excel.tsv');
    processRawRows(rows);
  };

  // Execute Import
  const handleExecuteImport = () => {
    if (category === 'multisheet' && multiSheetData) {
      const res = importMultiSheetGrades(multiSheetData);
      onClose();
      return;
    }

    if (parsedRows.length === 0) {
      showToast('Tidak Ada Data', 'Tidak ada data nilai yang siap diimpor.', 'info');
      return;
    }

    const payload = parsedRows.map((r) => ({
      identifier: r.matchedStudentNoPes || r.rawIdentifier,
      scores: r.scores,
    }));

    const result = importGradesBatch(category === 'multisheet' ? 'rapor' : category, semester, payload);
    if (result.matched > 0) {
      onClose();
    }
  };

  // Filter preview rows
  const filteredRows = parsedRows.filter((r) => {
    if (filterTab === 'matched') return r.isMatched;
    if (filterTab === 'unmatched') return !r.isMatched;
    return true;
  });

  const matchedCount = parsedRows.filter((r) => r.isMatched).length;
  const unmatchedCount = parsedRows.length - matchedCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Template & Impor Nilai (.xlsx)"
      subtitle="Unduh template resmi format Excel atau unggah berkas nilai untuk sinkronisasi nilai Rapor & Ujian Sekolah"
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Top Control Bar: Category Selector & Template Actions */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-800/80 dark:bg-emerald-950/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                Pilihan Jenis Nilai & Template
              </h4>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                Tentukan target nilai yang akan diimpor atau unduh template Excel sesuai kebutuhan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadGradesExcelTemplate(category === 'us' ? 'us' : 'rapor', semester)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-zinc-900 dark:text-emerald-300 dark:hover:bg-zinc-800 transition-colors shadow-xs"
                title="Unduh template Excel spesifik untuk semester / jenis nilai ini"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh Template Ini (.xlsx)
              </button>
              <button
                type="button"
                onClick={downloadMasterGradesWorkbook}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
                title="Unduh 1 berkas Excel lengkap berisi seluruh Sheet S7 s.d S12 dan US"
              >
                <Layers className="h-3.5 w-3.5" />
                Master Workbook (Semua Sheet)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
            {/* Target Category */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Kategori Nilai:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-zinc-200 bg-white py-1.5 px-3 text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="rapor">Nilai Rapor K-13 (Per Semester)</option>
                <option value="us">Nilai Ujian Sekolah (N_US Teori & Praktik)</option>
                {multiSheetData && (
                  <option value="multisheet">Multi-Sheet Otomatis ({Object.keys(multiSheetData).length} Lembar)</option>
                )}
              </select>
            </div>

            {/* Target Semester (if Rapor) */}
            {category === 'rapor' && (
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pilih Semester Rapor:
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-1.5 px-3 text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="s7">Semester 7 (Kelas 4 Sem 1)</option>
                  <option value="s8">Semester 8 (Kelas 4 Sem 2)</option>
                  <option value="s9">Semester 9 (Kelas 5 Sem 1)</option>
                  <option value="s10">Semester 10 (Kelas 5 Sem 2)</option>
                  <option value="s11">Semester 11 (Kelas 6 Sem 1)</option>
                  <option value="s12">Semester 12 (Kelas 6 Sem 2)</option>
                </select>
              </div>
            )}

            {/* Available Sheets Switcher if workbook has multiple */}
            {availableSheets.length > 1 && (
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Lembar Kerja (Sheet) Terdeteksi:
                </label>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetSelect(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-1.5 px-3 text-xs font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {availableSheets.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Input Mode Selector: Upload File vs Paste Clipboard */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              inputMode === 'upload'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Upload className="h-4 w-4" />
            Unggah Berkas (.xlsx / .xls / .csv)
          </button>
          <button
            type="button"
            onClick={() => setInputMode('paste')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              inputMode === 'paste'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <ClipboardPaste className="h-4 w-4" />
            Salin & Tempel (Paste) dari Excel
          </button>
        </div>

        {/* Upload Mode Area */}
        {inputMode === 'upload' && (
          <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-zinc-700 dark:bg-zinc-800/40 transition-colors">
            <input
              type="file"
              id="grade-excel-upload"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="grade-excel-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {fileName ? fileName : 'Klik di sini atau Seret file Excel (.xlsx / .csv)'}
              </span>
              <span className="text-[11px] text-zinc-500 max-w-sm">
                Mendukung template resmi atau format Excel dari guru mapel / wali kelas. Sistem otomatis mencocokkan Nama & No Peserta.
              </span>
            </label>
          </div>
        )}

        {/* Paste Mode Area */}
        {inputMode === 'paste' && (
          <div className="space-y-3">
            <textarea
              rows={5}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Sorot baris tabel nilai di Microsoft Excel atau Google Sheets, tekan Ctrl+C (Copy), lalu klik di sini dan tekan Ctrl+V (Paste)..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            />
            <button
              type="button"
              onClick={handleProcessPastedText}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Proses Teks Tabular
            </button>
          </div>
        )}

        {/* Live Preview Table & Validation Summary */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-100 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Hasil Pemindaian:
                </span>
                <Badge variant="emerald" size="sm">
                  {matchedCount} Siswa Cocok
                </Badge>
                {unmatchedCount > 0 && (
                  <Badge variant="warning" size="sm">
                    {unmatchedCount} Tidak Cocok
                  </Badge>
                )}
                <span className="text-xs text-zinc-500">
                  Total {parsedRows.length} baris
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                    filterTab === 'all'
                      ? 'bg-emerald-700 text-white'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Semua ({parsedRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('matched')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                    filterTab === 'matched'
                      ? 'bg-emerald-700 text-white'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Cocok ({matchedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('unmatched')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                    filterTab === 'unmatched'
                      ? 'bg-amber-600 text-white'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Belum Cocok ({unmatchedCount})
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                  <tr>
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5">Identitas pada Berkas</th>
                    <th className="p-2.5">Status Siswa</th>
                    <th className="p-2.5">Jumlah Mapel</th>
                    <th className="p-2.5">Ringkasan Nilai Terdeteksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredRows.map((r, i) => (
                    <tr
                      key={r.rowIndex}
                      className={
                        r.isMatched
                          ? 'hover:bg-zinc-50 dark:hover:bg-zinc-850'
                          : 'bg-amber-50/50 dark:bg-amber-950/20'
                      }
                    >
                      <td className="p-2.5 text-center text-zinc-400 font-bold">
                        {i + 1}
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                          {r.rawIdentifier}
                        </div>
                      </td>
                      <td className="p-2.5">
                        {r.isMatched ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{r.matchedStudentName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px]">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Tidak ditemukan di DNT</span>
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 font-semibold text-zinc-700 dark:text-zinc-300">
                        {Object.keys(r.scores).length} mapel
                      </td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(r.scores).slice(0, 6).map(([sub, val]) => (
                            <span
                              key={sub}
                              className="inline-block px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-[10px] font-mono font-medium text-zinc-800 dark:text-zinc-200"
                            >
                              {sub.toUpperCase()}: {val}
                            </span>
                          ))}
                          {Object.entries(r.scores).length > 6 && (
                            <span className="text-[10px] text-zinc-400 self-center">
                              +{Object.entries(r.scores).length - 6} lainnya
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || matchedCount === 0}
            onClick={handleExecuteImport}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all ${
              parsedRows.length === 0 || matchedCount === 0
                ? 'bg-zinc-400 cursor-not-allowed opacity-60'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Terapkan & Simpan {matchedCount} Nilai Siswa
          </button>
        </div>
      </div>
    </Modal>
  );
};
