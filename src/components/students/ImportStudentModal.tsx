import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Student, SubjectKey } from '../../types';
import { SUBJECT_LIST } from '../../constants/subjects';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
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
} from 'lucide-react';

interface ImportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RowValidationResult {
  student: Student;
  rowIndex: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const ImportStudentModal: React.FC<ImportStudentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { downloadStudentExcelTemplate, downloadStudentCSVTemplate, importStudentsList, showToast } = useApp();

  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'xlsx' | 'csv' | ''>('');
  const [validationResults, setValidationResults] = useState<RowValidationResult[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'invalid'>('all');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isLoading, setIsLoading] = useState(false);

  // Normalize header strings
  const normalizeKey = (key: string) => {
    return String(key || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  };

  // Robust row validator
  const validateAndBuildStudent = (
    rowMap: Record<string, any>,
    rowIndex: number
  ): RowValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Helper to fetch value from rowMap by multiple possible aliases
    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        const normalized = normalizeKey(k);
        for (const [rowKey, val] of Object.entries(rowMap)) {
          if (normalizeKey(rowKey) === normalized && val !== undefined && val !== null) {
            return String(val).trim();
          }
        }
      }
      return '';
    };

    // 1. Nama Siswa (Wajib)
    const rawNama = getVal('namapeserta', 'nama', 'namalengkap', 'namasiswa');
    if (!rawNama) {
      errors.push('Nama siswa tidak boleh kosong.');
    } else if (rawNama.length < 2) {
      errors.push('Nama siswa terlalu pendek (minimal 2 huruf).');
    }
    const nama = rawNama.toUpperCase();

    // 2. No Peserta Ujian
    let noPeserta = getVal('nopeserta', 'nomorpeserta', 'nopes', 'nomorun');
    if (!noPeserta) {
      noPeserta = `04-006-${String(rowIndex).padStart(3, '0')}-1`;
      warnings.push(`No Peserta tidak terisi, dibuatkan otomatis: ${noPeserta}`);
    }

    // 3. NISN
    let rawNisn = getVal('nisn', 'nomorinduksiswanasional');
    if (!rawNisn) {
      rawNisn = `0123456${String(rowIndex).padStart(3, '0')}`;
      warnings.push(`NISN tidak terisi, dibuatkan otomatis: ${rawNisn}`);
    } else {
      // Validate NISN format (10 digit angka)
      const digitsOnly = rawNisn.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        warnings.push(`NISN (${rawNisn}) sebaiknya berjumlah 10 digit.`);
      }
    }
    const nisn = rawNisn;

    // 4. NIS
    const nis = getVal('nis', 'nomorinduk', 'induk') || `2019${String(rowIndex).padStart(3, '0')}`;

    // 5. Jenis Kelamin (L / P)
    const rawGender = getVal('jeniskelamin', 'gender', 'jk', 'lp').toUpperCase();
    let jenisKelamin: 'L' | 'P' = 'L';
    if (rawGender.startsWith('P') || rawGender.includes('PEREMPUAN') || rawGender.includes('WANITA')) {
      jenisKelamin = 'P';
    } else if (rawGender.startsWith('L') || rawGender.includes('LAKI') || rawGender.includes('PRIA')) {
      jenisKelamin = 'L';
    } else {
      warnings.push(`Jenis kelamin tidak jelas (${rawGender || 'kosong'}), diset ke Laki-laki (L).`);
    }

    // 6. Tempat & Tanggal Lahir
    const tempatLahir = getVal('tempatlahir', 'tempat', 'ttl') || 'Sungai Buluh';
    let tanggalLahir = getVal('tanggallahir', 'tgl', 'tgllahir') || '2013-05-10';
    // If Excel serial number date, convert it
    if (/^\d{5}$/.test(tanggalLahir)) {
      try {
        const parsedDate = new Date(Math.round((Number(tanggalLahir) - 25569) * 86400 * 1000));
        tanggalLahir = parsedDate.toISOString().split('T')[0];
      } catch (e) {}
    }

    // 7. Orang Tua & Alamat
    const namaAyah = getVal('namaayah', 'ayah', 'wali') || 'Nama Ayah';
    const namaIbu = getVal('namaibu', 'ibu') || 'Nama Ibu';
    const pekerjaanOrtu = getVal('pekerjaanortu', 'pekerjaan', 'pekerjaanwali') || 'Wiraswasta';
    const alamat = getVal('alamat', 'alamatsiswa', 'domisili') || 'Desa Sungai Buluh';

    // 8. Ruang Ujian
    const rawRuang = getVal('ruangujian', 'ruang', 'ruangan').toUpperCase();
    let ruang: 'RUANG 1' | 'RUANG 2' | 'RUANG 3' | 'RUANG 4' = 'RUANG 1';
    if (rawRuang.includes('2')) ruang = 'RUANG 2';
    else if (rawRuang.includes('3')) ruang = 'RUANG 3';
    else if (rawRuang.includes('4')) ruang = 'RUANG 4';

    // 9. Nomor Meja
    const rawMeja = parseInt(getVal('nomormeja', 'nomeja', 'meja'), 10);
    const noMeja = !isNaN(rawMeja) && rawMeja > 0 ? rawMeja : ((rowIndex % 8) || 8);

    // 10. No Ijazah, No Surat Kelulusan, No Surat Transkrip Nilai
    let noSeriIjazah = getVal('noijazah', 'ijazah', 'noseriijazah', 'seriijazah');
    if (!noSeriIjazah) {
      noSeriIjazah = `DN-09/D-SD/26/0014${String(rowIndex + 50).padStart(3, '0')}`;
    }

    let noSuratKelulusan = getVal('nosuratkelulusan', 'noskl', 'skkelulusan', 'skl');
    if (!noSuratKelulusan) {
      noSuratKelulusan = `421.2/SDN-06/SK-LULUS/2026/${String(rowIndex).padStart(3, '0')}`;
    }

    let noSuratTranskrip = getVal('nosurattranskrip', 'nosurattranskripnilai', 'noskhu', 'skhu', 'transkrip');
    if (!noSuratTranskrip) {
      noSuratTranskrip = `421.2/SDN-06/SKHU/2026/${String(rowIndex).padStart(3, '0')}`;
    }

    // Default grade matrix initialization
    const s7: Record<SubjectKey, number> = {} as any;
    const s8: Record<SubjectKey, number> = {} as any;
    const s9: Record<SubjectKey, number> = {} as any;
    const s10: Record<SubjectKey, number> = {} as any;
    const s11: Record<SubjectKey, number> = {} as any;
    const s12: Record<SubjectKey, number> = {} as any;
    const us: Record<SubjectKey, { tulis: number; praktik?: number; akhir: number }> = {} as any;

    SUBJECT_LIST.forEach((s) => {
      s7[s.key] = 85;
      s8[s.key] = 85;
      s9[s.key] = 85;
      s10[s.key] = 85;
      s11[s.key] = 85;
      s12[s.key] = 85;
      us[s.key] = { tulis: 85, akhir: 85 };
    });

    const student: Student = {
      id: `std-imp-${Date.now()}-${rowIndex}`,
      noPeserta,
      nisn,
      nis,
      nama,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      namaAyah,
      namaIbu,
      pekerjaanOrtu,
      alamat,
      ruang,
      noMeja,
      rapor: { s7, s8, s9, s10, s11, s12 },
      us,
      statusKelulusan: 'LULUS',
      noSeriIjazah,
      noSuratKelulusan,
      noSuratTranskrip,
      tanggalAmbilIjazah: '15 Juni 2026',
      penerimaIjazah: `${namaAyah} (Orang Tua)`,
      catatan: 'Hasil Impor Berkas Excel/CSV',
    };

    return {
      student,
      rowIndex,
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  // Process rows array (from SheetJS or CSV parser)
  const processRawRowObjects = (rowObjects: Record<string, any>[]) => {
    const results: RowValidationResult[] = [];
    rowObjects.forEach((row, idx) => {
      // Skip completely empty rows
      const hasValues = Object.values(row).some((val) => val !== null && val !== undefined && String(val).trim().length > 0);
      if (!hasValues) return;

      const res = validateAndBuildStudent(row, idx + 1);
      results.push(res);
    });

    setValidationResults(results);
  };

  // Handle Excel file upload via SheetJS
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    setFileType(isXlsx ? 'xlsx' : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: 'array' });
        // Use first worksheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse into array of row objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, {
          defval: '',
          raw: false,
        });

        if (rawJson.length === 0) {
          showToast('Berkas Kosong', 'Tidak ada baris data yang ditemukan pada lembar kerja Excel.', 'error');
          setValidationResults([]);
          setIsLoading(false);
          return;
        }

        processRawRowObjects(rawJson);
        showToast('Berkas Terbaca', `${rawJson.length} baris data berhasil dibaca dari file Excel.`, 'info');
      } catch (err: any) {
        showToast('Gagal Membaca File', 'Terjadi kesalahan saat memproses berkas Excel: ' + (err.message || 'Format tidak valid'), 'error');
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle direct CSV Paste
  const handlePasteChange = (val: string) => {
    setPastedText(val);
    if (!val.trim()) {
      setValidationResults([]);
      return;
    }

    try {
      const workbook = XLSX.read(val, { type: 'string' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
        raw: false,
      });
      processRawRowObjects(rawJson);
    } catch (e) {
      setValidationResults([]);
    }
  };

  // Commit valid students to state
  const handleExecuteImport = () => {
    const validStudents = validationResults.filter((r) => r.isValid).map((r) => r.student);

    if (validStudents.length === 0) {
      showToast('Tidak Ada Data Valid', 'Semua baris memiliki kesalahan data. Perbaiki terlebih dahulu.', 'error');
      return;
    }

    importStudentsList(validStudents, importMode);
    onClose();
    // Reset state
    setValidationResults([]);
    setPastedText('');
    setFileName('');
  };

  // Calculations
  const totalRows = validationResults.length;
  const validCount = validationResults.filter((r) => r.isValid).length;
  const invalidCount = totalRows - validCount;

  const filteredResults = validationResults.filter((r) => {
    if (filterTab === 'valid') return r.isValid;
    if (filterTab === 'invalid') return !r.isValid;
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Impor Data Siswa (Excel .xlsx / CSV)"
      subtitle="Unggah lembar kerja Excel untuk pemrosesan dan verifikasi data rombel siswa secara instan"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Step 1: Download Templates Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/70 p-4.5 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-700 p-2.5 text-white shadow-xs shrink-0">
              <FileSpreadsheet className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                1. Unduh Template Berkas Contoh
                <span className="text-[10px] bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-200 font-bold px-2 py-0.5 rounded-full">
                  Resmi SDN 006
                </span>
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                Pilih format <b>.xlsx (Excel)</b> atau <b>.csv</b> lengkap dengan baris contoh dan petunjuk pengisian validasi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={downloadStudentExcelTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
              title="Unduh berkas Excel .xlsx"
            >
              <FileSpreadsheet className="h-4 w-4 text-amber-300" />
              <span>Template Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={downloadStudentCSVTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors"
              title="Unduh berkas .csv"
            >
              <Download className="h-3.5 w-3.5" />
              <span>CSV (.csv)</span>
            </button>
          </div>
        </div>

        {/* Step 2: Upload Area / Direct Paste */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              2. Pilih / Masukkan Berkas Excel
            </h4>
            <div className="flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  inputMode === 'upload'
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Upload File (.xlsx/.csv)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('paste')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  inputMode === 'paste'
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <ClipboardPaste className="h-3.5 w-3.5" /> Tempel Data (Paste)
              </button>
            </div>
          </div>

          {inputMode === 'upload' ? (
            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all group">
              <div className="rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 p-3 text-emerald-700 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                <Upload className="h-7 w-7" />
              </div>
              <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                {fileName ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                    Berkas Terpilih: {fileName}
                  </span>
                ) : (
                  'Klik atau seret berkas Excel (.xlsx / .xls) / CSV ke area ini'
                )}
              </span>
              <span className="text-xs text-zinc-500 mt-1 max-w-sm">
                Sistem akan memvalidasi kolom No Peserta, NISN, Nama, Gender, Tempat/Tanggal Lahir, Ruang & Meja.
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <textarea
              rows={5}
              value={pastedText}
              onChange={(e) => handlePasteChange(e.target.value)}
              placeholder={`Salin data tabel dari Excel lalu tempel di sini...\nNo Peserta\tNISN\tNIS\tNama Peserta\tL/P\tTempat Lahir\tTanggal Lahir\tNama Ayah\tNama Ibu\tPekerjaan Ortu\tAlamat\tRuang Ujian\tNomor Meja\tMelanjutkan Ke`}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3.5 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-emerald-600 focus:outline-none"
            />
          )}
        </div>

        {/* Step 3: Validation Overview & Live Preview Table */}
        {validationResults.length > 0 && (
          <div className="space-y-4">
            {/* Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 bg-zinc-50/70 dark:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Hasil Validasi:
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {validCount} Baris Valid
                </span>
                {invalidCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-md">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {invalidCount} Perlu Perbaikan
                  </span>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-200/60 dark:border-zinc-700 dark:bg-zinc-700/60 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold ${
                    filterTab === 'all'
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Semua ({totalRows})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('valid')}
                  className={`px-2.5 py-1 rounded-md font-semibold ${
                    filterTab === 'valid'
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Valid ({validCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('invalid')}
                  className={`px-2.5 py-1 rounded-md font-semibold ${
                    filterTab === 'invalid'
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Bermasalah ({invalidCount})
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-700 z-10">
                  <tr>
                    <th className="p-2.5 text-center w-10">No</th>
                    <th className="p-2.5">Status Validasi</th>
                    <th className="p-2.5">Nama Siswa</th>
                    <th className="p-2.5">No. Peserta</th>
                    <th className="p-2.5">NISN</th>
                    <th className="p-2.5 text-center">L/P</th>
                    <th className="p-2.5">Tempat, Tgl Lahir</th>
                    <th className="p-2.5">Ruang & Meja</th>
                    <th className="p-2.5">No. Ijazah</th>
                    <th className="p-2.5">No. SKL</th>
                    <th className="p-2.5">No. Transkrip</th>
                    <th className="p-2.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredResults.map((res) => {
                    const s = res.student;
                    return (
                      <tr
                        key={res.rowIndex}
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                          !res.isValid ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="p-2.5 text-center font-bold text-zinc-500">{res.rowIndex}</td>
                        <td className="p-2.5">
                          {res.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                              <AlertCircle className="h-3.5 w-3.5" /> Tidak Valid
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-zinc-900 dark:text-zinc-100">{s.nama || '-'}</td>
                        <td className="p-2.5 font-mono text-emerald-800 dark:text-emerald-300">{s.noPeserta}</td>
                        <td className="p-2.5 font-mono text-zinc-600 dark:text-zinc-400">{s.nisn}</td>
                        <td className="p-2.5 text-center font-bold">{s.jenisKelamin}</td>
                        <td className="p-2.5 text-zinc-600 dark:text-zinc-400">
                          {s.tempatLahir}, {s.tanggalLahir}
                        </td>
                        <td className="p-2.5 font-semibold text-zinc-800 dark:text-zinc-200">
                          {s.ruang} (#{s.noMeja})
                        </td>
                        <td className="p-2.5 font-mono text-zinc-800 dark:text-zinc-200 font-semibold text-[11px]">
                          {s.noSeriIjazah || '-'}
                        </td>
                        <td className="p-2.5 font-mono text-zinc-700 dark:text-zinc-300 text-[11px]">
                          {s.noSuratKelulusan || '-'}
                        </td>
                        <td className="p-2.5 font-mono text-zinc-700 dark:text-zinc-300 text-[11px]">
                          {s.noSuratTranskrip || '-'}
                        </td>
                        <td className="p-2.5 text-[11px]">
                          {res.errors.length > 0 && (
                            <span className="text-rose-600 dark:text-rose-400 font-medium">
                              {res.errors.join(', ')}
                            </span>
                          )}
                          {res.warnings.length > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 italic block">
                              {res.warnings.join(', ')}
                            </span>
                          )}
                          {res.errors.length === 0 && res.warnings.length === 0 && (
                            <span className="text-zinc-400">Lengkap</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mode Penambahan */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Pilih Mode Penyimpanan State:
              </span>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-emerald-600"
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Tambahkan ke Data Saat Ini (Append)
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-emerald-600"
                  />
                  <span className="font-semibold text-rose-700 dark:text-rose-400">
                    Gantikan Seluruh Data Siswa (Replace)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={validCount === 0 || isLoading}
            onClick={handleExecuteImport}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Proses Impor ({validCount} Siswa Valid)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
