import { SchoolProfile, Student } from '../../types';

export type GraduationDocType = 'undangan' | 'ba-kelulusan' | 'hadir-rapat' | 'sk-kelulusan' | 'semua';

export interface GuruRapat {
  id: string;
  no: number;
  nama: string;
  jabatan: string;
  nip?: string;
  kehadiran?: 'hadir' | 'izin' | 'sakit';
}

export const DEFAULT_GURU_RAPAT: GuruRapat[] = [
  { id: 'g-1', no: 1, nama: 'WINARNI, S.Pd.SD', jabatan: 'Kepala Sekolah', nip: '19790301 200801 2 015', kehadiran: 'hadir' },
  { id: 'g-2', no: 2, nama: 'HENRI SAPUTRA, S.Pd', jabatan: 'Ketua Panitia / Guru Kelas 6A', nip: '19820512 201001 1 021', kehadiran: 'hadir' },
  { id: 'g-3', no: 3, nama: 'BUDI SANTOSO, S.Pd.SD', jabatan: 'Sekretaris / Guru Kelas 6B', nip: '19851210 200903 1 005', kehadiran: 'hadir' },
  { id: 'g-4', no: 4, nama: 'HERIYANTO, S.Pd.SD', jabatan: 'Bendahara / Guru Kelas 6C', nip: '19800918 200701 1 014', kehadiran: 'hadir' },
  { id: 'g-5', no: 5, nama: 'SITI RAHAYU, S.Pd', jabatan: 'Anggota / Guru Kelas 6D', nip: '19870425 201101 2 018', kehadiran: 'hadir' },
  { id: 'g-6', no: 6, nama: 'AHMAD FAUZI, S.Pd.I', jabatan: 'Guru Pend. Agama Islam', nip: '19830814 200801 1 012', kehadiran: 'hadir' },
  { id: 'g-7', no: 7, nama: 'NURUL HIDAYATI, S.Pd.I', jabatan: 'Guru Pend. Agama Islam', nip: '19860309 201001 2 025', kehadiran: 'hadir' },
  { id: 'g-8', no: 8, nama: 'JOKO PRASETYO, S.Pd', jabatan: 'Guru PJOK', nip: '19880719 201402 1 003', kehadiran: 'hadir' },
  { id: 'g-9', no: 9, nama: 'EKO WAHYUDI, S.Pd', jabatan: 'Guru PJOK', nip: '19900105 201503 1 006', kehadiran: 'hadir' },
  { id: 'g-10', no: 10, nama: 'DEWI LESTARI, S.Pd', jabatan: 'Guru Seni Budaya & Prakarya', nip: '19841122 200902 2 011', kehadiran: 'hadir' },
  { id: 'g-11', no: 11, nama: 'RATNA SARI, S.Pd', jabatan: 'Guru Bahasa Inggris', nip: '19890630 201201 2 019', kehadiran: 'hadir' },
  { id: 'g-12', no: 12, nama: 'SITI AMINAH, S.Pd.SD', jabatan: 'Guru Kelas 5A', nip: '19810217 200604 2 009', kehadiran: 'hadir' },
  { id: 'g-13', no: 13, nama: 'RAHMAT HIDAYAT, S.Pd.SD', jabatan: 'Guru Kelas 5B', nip: '19860911 201001 1 017', kehadiran: 'hadir' },
  { id: 'g-14', no: 14, nama: 'TRI WAHYUNI, S.Pd.SD', jabatan: 'Guru Kelas 4A', nip: '19840315 200801 2 016', kehadiran: 'hadir' },
  { id: 'g-15', no: 15, nama: 'BAMBANG IRAWAN, S.Pd.SD', jabatan: 'Guru Kelas 4B', nip: '19830528 200903 1 008', kehadiran: 'hadir' },
  { id: 'g-16', no: 16, nama: 'ENDANG LESTARI, S.Pd.SD', jabatan: 'Guru Kelas 3A', nip: '19850720 201101 2 014', kehadiran: 'hadir' },
  { id: 'g-17', no: 17, nama: 'SURYATI, S.Pd.SD', jabatan: 'Guru Kelas 3B', nip: '19871004 201202 2 007', kehadiran: 'hadir' },
  { id: 'g-18', no: 18, nama: 'FITRIANI, S.Pd.SD', jabatan: 'Guru Kelas 2', nip: '19910416 201503 2 010', kehadiran: 'hadir' },
  { id: 'g-19', no: 19, nama: 'MARLINA, S.Pd.SD', jabatan: 'Guru Kelas 1', nip: '19881208 201402 2 015', kehadiran: 'hadir' },
  { id: 'g-20', no: 20, nama: 'M. RIDWAN, S.Kom', jabatan: 'Operator Sekolah / Dapodik', nip: '19920822 201903 1 009', kehadiran: 'hadir' },
  { id: 'g-21', no: 21, nama: 'RINA AGUSTINA, S.E', jabatan: 'Tenaga Administrasi / Bendahara BOS', nip: '19901115 201701 2 013', kehadiran: 'hadir' },
  { id: 'g-22', no: 22, nama: 'AGUS SETIAWAN', jabatan: 'Tenaga Perpustakaan', nip: '-', kehadiran: 'hadir' },
  { id: 'g-23', no: 23, nama: 'SUTRISNO', jabatan: 'Penjaga Sekolah / Keamanan', nip: '-', kehadiran: 'hadir' },
];

export type DocFontFamily = 'times' | 'calibri' | 'arial' | 'bookman' | 'georgia';
export type DocFontSize = '10pt' | '11pt' | '12pt' | '13pt' | '14pt';
export type DocLineSpacing = '1.0' | '1.15' | '1.35' | '1.5' | '2.0';

export interface FontOption {
  value: DocFontFamily;
  label: string;
  cssFamily: string;
  wordFont: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    value: 'times',
    label: 'Times New Roman (Baku Kedinasan)',
    cssFamily: "'Times New Roman', Times, 'Liberation Serif', serif",
    wordFont: "'Times New Roman', Times, serif",
  },
  {
    value: 'calibri',
    label: 'Calibri (Default Microsoft Word)',
    cssFamily: "Calibri, 'Candara', 'Segoe UI', system-ui, sans-serif",
    wordFont: "Calibri, sans-serif",
  },
  {
    value: 'arial',
    label: 'Arial (Modern Sans-Serif)',
    cssFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
    wordFont: "Arial, Helvetica, sans-serif",
  },
  {
    value: 'bookman',
    label: 'Bookman Old Style (Klasik Formal)',
    cssFamily: "'Bookman Old Style', 'Bookman', 'URW Bookman', serif",
    wordFont: "'Bookman Old Style', 'Bookman', serif",
  },
  {
    value: 'georgia',
    label: 'Georgia (Serif Elegan)',
    cssFamily: "Georgia, 'Cambria', serif",
    wordFont: "Georgia, serif",
  },
];

export const FONT_SIZE_OPTIONS: { value: DocFontSize; label: string }[] = [
  { value: '10pt', label: '10 pt (Kecil Padat)' },
  { value: '11pt', label: '11 pt (Standar Word Baru)' },
  { value: '12pt', label: '12 pt (Standar Baku Surat Dinas)' },
  { value: '13pt', label: '13 pt (Agak Besar)' },
  { value: '14pt', label: '14 pt (Besar / Jelas)' },
];

export const LINE_SPACING_OPTIONS: { value: DocLineSpacing; label: string }[] = [
  { value: '1.0', label: '1.0 (Single / Spasi Tunggal)' },
  { value: '1.15', label: '1.15 (Standar Microsoft Word)' },
  { value: '1.35', label: '1.35 (Proporsional Rapi)' },
  { value: '1.5', label: '1.5 (Satu Setengah Spasi Baku)' },
  { value: '2.0', label: '2.0 (Double / Spasi Ganda)' },
];

export function getFontCssFamily(font: DocFontFamily): string {
  const found = FONT_OPTIONS.find((f) => f.value === font);
  return found ? found.cssFamily : "'Times New Roman', Times, serif";
}

// 1. UNDANGAN RAPAT STATE
export interface UndanganDocState {
  nomor: string;
  sifat: string;
  lampiran: string;
  hal: string;
  tujuan: string;
  tempatTujuan: string;
  salamPembuka: string;
  paragrafPengantar: string;
  hariTanggal: string;
  jam: string;
  tempat: string;
  acara: string;
  paragrafPenutup: string;
  tempatSurat: string;
  tanggalSurat: string;
  showTembusan: boolean;
  tembusan: string[];
  fontFamily: DocFontFamily;
  fontSize: DocFontSize;
  lineSpacing: DocLineSpacing;
}

export const DEFAULT_UNDANGAN: UndanganDocState = {
  nomor: '422/SDN-006/SB/V/2026/040',
  sifat: 'Penting',
  lampiran: '-',
  hal: 'Undangan Rapat Penentuan Kelulusan Siswa Kelas VI',
  tujuan: 'Bpk / Ibu Dewan Guru dan Tenaga Kependidikan',
  tempatTujuan: 'di - Tempat',
  salamPembuka: 'Assalamu’alaikum Warahmatullahi Wabarakatuh,',
  paragrafPengantar:
    'Sehubungan dengan telah berakhirnya seluruh rangkaian kegiatan pembelajaran dan pelaksanaan Ujian Sekolah Peserta Didik Kelas VI Tahun Pelajaran 2025/2026, bersama ini Kepala Sekolah Dasar Negeri 006 Sungai Buluh mengharapkan kehadiran Bapak/Ibu Dewan Guru dan Tenaga Kependidikan pada Rapat Musyawarah yang akan diselenggarakan pada:',
  hariTanggal: 'Sabtu, 30 Mei 2026',
  jam: '11.00 WIB s.d. Selesai',
  tempat: 'Ruang Guru SD Negeri 006 Sungai Buluh',
  acara:
    'Penentuan Keputusan Kelulusan dan Persiapan Pelepasan Siswa Kelas VI Tahun Pelajaran 2025/2026',
  paragrafPenutup:
    'Mengingat sangat pentingnya agenda rapat ini, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan. Atas perhatian, kerja sama yang baik, serta kehadirannya diucapkan terima kasih.',
  tempatSurat: 'Sungai Buluh',
  tanggalSurat: '27 Mei 2026',
  showTembusan: false,
  tembusan: [
    'Koordinator Wilayah Bidang Pendidikan Kec. Singingi Hilir',
    'Ketua Komite SDN 006 Sungai Buluh',
    'Arsip Sekolah',
  ],
  fontFamily: 'times',
  fontSize: '12pt',
  lineSpacing: '1.35',
};

// 2. BERITA ACARA STATE
export interface BeritaAcaraDocState {
  nomor: string;
  judul: string;
  subJudul: string;
  hariTanggalTerbilang: string;
  tempat: string;
  tahunPelajaranTeks: string;
  totalPeserta: number;
  pesertaLulus: number;
  pesertaTidakLulus: number;
  paragrafPembuka: string;
  paragrafHasil: string;
  paragrafPenutup: string;
  dibuatDi: string;
  padaTanggal: string;
  namaNotulis: string;
  nipNotulis: string;
  showNotulis: boolean;
  showKop: boolean;
  fontFamily: DocFontFamily;
  fontSize: DocFontSize;
  lineSpacing: DocLineSpacing;
}

export const DEFAULT_BERITA_ACARA: BeritaAcaraDocState = {
  nomor: '422/BA/SDN-006/SB/V/2026/040',
  judul: 'BERITA ACARA',
  subJudul:
    'RAPAT PENENTUAN KELULUSAN PESERTA DIDIK KELAS VI\nTAHUN PELAJARAN 2025/2026',
  hariTanggalTerbilang:
    'Sabtu tanggal Tiga Puluh bulan Mei tahun Dua Ribu Dua Puluh Enam',
  tempat:
    'Ruang Guru SD Negeri 006 Sungai Buluh, Kecamatan Singingi Hilir, Kabupaten Kuantan Singingi',
  tahunPelajaranTeks:
    'Dua Ribu Dua Puluh Lima / Dua Ribu Dua Puluh Enam (2025/2026)',
  totalPeserta: 80,
  pesertaLulus: 80,
  pesertaTidakLulus: 0,
  paragrafPembuka:
    'Pada hari ini, Sabtu tanggal Tiga Puluh bulan Mei tahun Dua Ribu Dua Puluh Enam, bertempat di Ruang Guru SD Negeri 006 Sungai Buluh, Kecamatan Singingi Hilir, Kabupaten Kuantan Singingi, telah diselenggarakan Rapat Musyawarah Dewan Guru yang dipimpin langsung oleh Kepala Sekolah dan dihadiri oleh seluruh Dewan Guru serta Tenaga Kependidikan untuk menentukan kelulusan peserta didik kelas VI (enam) Tahun Pelajaran 2025/2026.',
  paragrafHasil:
    'Berdasarkan hasil musyawarah dan evaluasi menyeluruh terhadap kriteria kelulusan sesuai ketentuan perundang-undangan dan peraturan yang berlaku, rapat menetapkan bahwa seluruh peserta didik kelas VI yang berjumlah 80 (delapan puluh) orang dinyatakan LULUS (100%).',
  paragrafPenutup:
    'Demikian Berita Acara Rapat Penentuan Kelulusan ini dibuat dengan sebenarnya dan penuh rasa tanggung jawab agar dapat dipergunakan dan dipedomani sebagaimana mestinya.',
  dibuatDi: 'Sungai Buluh',
  padaTanggal: '30 Mei 2026',
  namaNotulis: 'BUDI SANTOSO, S.Pd.SD',
  nipNotulis: '19851210 200903 1 005',
  showNotulis: true,
  showKop: true,
  fontFamily: 'times',
  fontSize: '12pt',
  lineSpacing: '1.35',
};

// 3. SK KELULUSAN STATE
export interface SKKelulusanState {
  nomor: string;
  tentang: string;
  menimbangA: string;
  menimbangB: string;
  menimbangC: string;
  mengingat1: string;
  mengingat2: string;
  mengingat3: string;
  mengingat4: string;
  memperhatikan1: string;
  memperhatikan2: string;
  diktumKesatu: string;
  diktumKedua: string;
  diktumKetiga: string;
  diktumKeempat: string;
  ditetapkanDi: string;
  padaTanggal: string;
  showTembusan: boolean;
  showLampiran: boolean;
  showTandaTangan?: boolean;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  jabatanKepalaSekolah?: string;
  fontFamily: DocFontFamily;
  fontSize: DocFontSize;
  lineSpacing: DocLineSpacing;
  // Optional Surat Keterangan Kelulusan (SKL) specific fields
  pembukaText?: string;
  dasarHukumText?: string;
  penutupText?: string;
  tahunPelajaran?: string;
  nomorSKPenetapan?: string;
  tanggalSKPenetapan?: string;
  tempatCetak?: string;
  tanggalCetak?: string;
}

export const DEFAULT_SK_KELULUSAN: SKKelulusanState = {
  nomor: '422/KPTS/SDN-006/SB/VI/2026/041',
  tentang: 'PENETAPAN KELULUSAN PESERTA DIDIK KELAS VI TAHUN PELAJARAN 2025-2026',
  menimbangA:
    'Bahwa dalam rangka mengakhiri proses pembelajaran dan pelaksanaan ujian sekolah bagi peserta didik kelas VI SD Negeri 006 Sungai Buluh Tahun Pelajaran 2025/2026, perlu ditetapkan kelulusan peserta didik;',
  menimbangB:
    'Bahwa peserta didik yang dinyatakan lulus telah memenuhi kriteria dan persyaratan kelulusan yang telah ditentukan oleh satuan pendidikan sesuai dengan ketentuan peraturan perundang-undangan yang berlaku;',
  menimbangC:
    'Bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan huruf b di atas, perlu menetapkan Keputusan Kepala Sekolah tentang Penetapan Kelulusan Peserta Didik Kelas VI SD Negeri 006 Sungai Buluh Tahun Pelajaran 2025/2026.',
  mengingat1:
    'Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional (Lembaran Negara Republik Indonesia Tahun 2003 Nomor 78, Tambahan Lembaran Negara Republik Indonesia Nomor 4301);',
  mengingat2:
    'Peraturan Pemerintah Nomor 19 Tahun 2005 tentang Standar Nasional Pendidikan, sebagaimana telah diubah beberapa kali terakhir dengan Peraturan Pemerintah Nomor 4 Tahun 2022;',
  mengingat3:
    'Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 9 Tahun 2022 tentang Evaluasi Sistem Pendidikan oleh Pemerintah Pusat dan Pemerintah Daerah terhadap Pendidikan Anak Usia Dini, Pendidikan Dasar, dan Pendidikan Menengah;',
  mengingat4:
    'Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 21 Tahun 2022 tentang Standar Penilaian Pendidikan pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah (Berita Negara Republik Indonesia Tahun 2022 Nomor 460).',
  memperhatikan1:
    'Kriteria Kelulusan Peserta Didik Kelas VI SD Negeri 006 Sungai Buluh Tahun Pelajaran 2025/2026;',
  memperhatikan2:
    'Hasil Rapat Dewan Guru SD Negeri 006 Sungai Buluh tanggal 30 Mei 2026 tentang Penetapan Kelulusan Peserta Didik Kelas VI Tahun Pelajaran 2025/2026.',
  diktumKesatu:
    'Nama-nama peserta didik Kelas VI Tahun Pelajaran 2025/2026, sebagaimana tercantum dalam Lampiran Surat Keputusan ini, dinyatakan LULUS dari SD Negeri 006 Sungai Buluh;',
  diktumKedua:
    'Peserta didik yang dinyatakan lulus sebagaimana dimaksud dalam Diktum KESATU berhak memperoleh Surat Keterangan Lulus (SKL) dan Ijazah sesuai dengan ketentuan perundang-undangan yang berlaku;',
  diktumKetiga:
    'Segala biaya yang timbul akibat diterbitkannya Keputusan ini dibebankan pada anggaran yang sesuai;',
  diktumKeempat:
    'Keputusan ini mulai berlaku sejak tanggal ditetapkan, dengan ketentuan apabila di kemudian hari terdapat kekeliruan dalam keputusan ini akan diadakan perbaikan sebagaimana mestinya.',
  ditetapkanDi: 'Sungai Buluh',
  padaTanggal: '30 Mei 2026',
  showTembusan: true,
  showLampiran: false,
  showTandaTangan: true,
  namaKepalaSekolah: 'WINARNI, S.Pd.SD',
  nipKepalaSekolah: '19790301 200801 2 015',
  jabatanKepalaSekolah: 'Kepala SD Negeri 006 Sungai Buluh',
  fontFamily: 'times',
  fontSize: '12pt',
  lineSpacing: '1.35',
};

export interface HadirRapatMeta {
  rapatTanggal: string;
  rapatJam: string;
  rapatTempat: string;
  rapatPengesahanTanggal: string;
  notulisNama: string;
  notulisNip: string;
}

export const DEFAULT_HADIR_RAPAT_META: HadirRapatMeta = {
  rapatTanggal: 'Sabtu, 30 Mei 2026',
  rapatJam: '11.00 WIB s.d. Selesai',
  rapatTempat: 'Ruang Guru SDN 006 Sungai Buluh',
  rapatPengesahanTanggal: 'Sungai Buluh, 30 Mei 2026',
  notulisNama: 'BUDI SANTOSO, S.Pd.SD',
  notulisNip: '19851210 200903 1 005',
};

const GURU_STORAGE_KEY = 'sdn006_rapat_guru_list_v2';
const SK_STORAGE_KEY = 'sdn006_sk_kelulusan_state_v3';
const UNDANGAN_STORAGE_KEY = 'sdn006_undangan_state_v1';
const BA_STORAGE_KEY = 'sdn006_ba_state_v1';
const HADIR_RAPAT_META_KEY = 'sdn006_hadir_rapat_meta';

export function loadHadirRapatMeta(): HadirRapatMeta {
  try {
    const raw = localStorage.getItem(HADIR_RAPAT_META_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_HADIR_RAPAT_META, ...parsed };
    }
  } catch (err) {
    console.error('Error loading hadir rapat meta from localStorage', err);
  }
  return DEFAULT_HADIR_RAPAT_META;
}

export function saveHadirRapatMeta(meta: HadirRapatMeta): void {
  try {
    localStorage.setItem(HADIR_RAPAT_META_KEY, JSON.stringify(meta));
  } catch (err) {
    console.error('Error saving hadir rapat meta to localStorage', err);
  }
}

export function loadGuruRapatList(): GuruRapat[] {
  try {
    const raw = localStorage.getItem(GURU_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading guru list from localStorage', err);
  }
  return DEFAULT_GURU_RAPAT;
}

export function saveGuruRapatList(list: GuruRapat[]): void {
  try {
    localStorage.setItem(GURU_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving guru list to localStorage', err);
  }
}

export function loadUndanganDocState(): UndanganDocState {
  try {
    const raw = localStorage.getItem(UNDANGAN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_UNDANGAN, ...parsed };
    }
  } catch (err) {
    console.error('Error loading Undangan state from localStorage', err);
  }
  return DEFAULT_UNDANGAN;
}

export function saveUndanganDocState(state: UndanganDocState): void {
  try {
    localStorage.setItem(UNDANGAN_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving Undangan state to localStorage', err);
  }
}

export function loadBeritaAcaraDocState(): BeritaAcaraDocState {
  try {
    const raw = localStorage.getItem(BA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_BERITA_ACARA, ...parsed };
    }
  } catch (err) {
    console.error('Error loading Berita Acara state from localStorage', err);
  }
  return DEFAULT_BERITA_ACARA;
}

export function saveBeritaAcaraDocState(state: BeritaAcaraDocState): void {
  try {
    localStorage.setItem(BA_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving Berita Acara state to localStorage', err);
  }
}

export function loadSKKelulusanState(): SKKelulusanState {
  try {
    const raw = localStorage.getItem(SK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SK_KELULUSAN, ...parsed };
    }
  } catch (err) {
    console.error('Error loading SK state from localStorage', err);
  }
  return DEFAULT_SK_KELULUSAN;
}

export function saveSKKelulusanState(state: SKKelulusanState): void {
  try {
    localStorage.setItem(SK_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving SK state to localStorage', err);
  }
}

/**
 * Format titik-titik tanda tangan zig-zag resmi kedinasan
 */
export function formatSignatureDots(no: number): string {
  return no < 10 ? `${no}. .........` : `${no}. ........`;
}

/**
 * Ekspor dokumen HTML ke format file Word (.doc) yang kompatibel secara natif
 */
export function downloadAsWordDoc(
  htmlBodyContent: string,
  filename: string,
  options?: {
    fontFamily?: DocFontFamily;
    fontSize?: DocFontSize;
    lineSpacing?: DocLineSpacing;
  }
): void {
  const fontCss = options?.fontFamily ? getFontCssFamily(options.fontFamily) : "'Times New Roman', Times, serif";
  const fontSize = options?.fontSize || '12pt';
  const lineSpacing = options?.lineSpacing || '1.35';

  const header = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${filename}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm;
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
      mso-header-margin: 1.25cm;
      mso-footer-margin: 1.25cm;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: ${fontCss};
      font-size: ${fontSize};
      line-height: ${lineSpacing};
      color: #000;
    }
    p { margin: 0 0 6pt 0; text-align: justify; text-indent: 1.25cm; }
    .no-indent { text-indent: 0 !important; }
    table { border-collapse: collapse; width: 100%; margin-top: 6pt; margin-bottom: 6pt; }
    th, td { padding: 3pt 5pt; vertical-align: top; }
    .border-table th, .border-table td { border: 1px solid black; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="Section1">
    ${htmlBodyContent}
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff' + header], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

