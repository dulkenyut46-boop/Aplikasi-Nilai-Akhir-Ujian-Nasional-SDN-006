export type SubjectKey = string;

export interface SubjectInfo {
  key: SubjectKey;
  name: string;
  code: string;
  kkm: number;
}

export interface StudentScores {
  s7: Record<SubjectKey, number>;
  s8: Record<SubjectKey, number>;
  s9: Record<SubjectKey, number>;
  s10: Record<SubjectKey, number>;
  s11: Record<SubjectKey, number>;
  s12: Record<SubjectKey, number>;
}

export interface ExamScoreDetail {
  tulis: number;
  praktik?: number;
  akhir: number; // calculated or direct US
}

export interface Student {
  id: string;
  noPeserta: string; // contoh: 04-006-001-8
  nisn: string;
  nis: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  namaAyah: string;
  namaIbu: string;
  pekerjaanOrtu: string;
  alamat: string;
  ruang: 'RUANG 1' | 'RUANG 2' | 'RUANG 3' | 'RUANG 4';
  noMeja: number;
  foto?: string;
  
  // Nilai
  rapor: StudentScores;
  us: Record<SubjectKey, ExamScoreDetail>;
  
  // Ijazah & Dokumen Kelulusan
  statusKelulusan: 'LULUS' | 'TIDAK LULUS' | 'DITUNDA';
  noSeriIjazah?: string; // No. Ijazah
  noSuratKelulusan?: string; // No. Surat Kelulusan
  noSuratTranskrip?: string; // No. Surat Transkrip Nilai / SKHU
  tanggalAmbilIjazah?: string;
  penerimaIjazah?: string;
  lanjutSekolahKe?: string;
  catatan?: string;
}

export interface KopSuratConfig {
  instansiAtas: string;        // contoh: PEMERINTAH KABUPATEN KUANTAN SINGINGI
  instansiTengah: string;      // contoh: DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA
  instansiBawah?: string;      // contoh: KOORDINATOR WILAYAH KECAMATAN SINGINGI HILIR
  namaSekolah: string;         // contoh: SEKOLAH DASAR NEGERI 006 SUNGAI BULUH
  alamat: string;              // contoh: Jl. Poros Desa Sungai Buluh, RT 04 / RW 02
  desa?: string;               // contoh: Sungai Buluh
  kecamatan?: string;          // contoh: Singingi Hilir
  kabupaten?: string;          // contoh: Kuantan Singingi
  provinsi?: string;           // contoh: Riau
  kodePos: string;             // contoh: 29563
  kontak?: string;             // contoh: Telp/WA: 0812-7654-3201
  email?: string;              // contoh: sdn006sungaibuluh@gmail.com
  website?: string;            // contoh: https://sdn006singingihilir.sch.id
  tipeGaris: 'ganda' | 'tebal' | 'klasik' | 'modern';

  // Logo Kiri
  showLogoKiri: boolean;
  logoKiri: string;            // SVG data URL or custom uploaded base64 data URL
  logoKiriPreset: 'pemda_kuansing' | 'tutwuri' | 'garuda' | 'sd_nasional' | 'custom';
  logoKiriSize: number;        // in px, e.g. 72

  // Logo Kanan
  showLogoKanan: boolean;
  logoKanan: string;           // SVG data URL or custom uploaded base64 data URL
  logoKananPreset: 'tutwuri' | 'sd_nasional' | 'pemda_kuansing' | 'garuda' | 'custom' | 'none';
  logoKananSize: number;       // in px, e.g. 72
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  nss: string;
  akreditasi: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  ketuaPanitia: string;
  nipKetuaPanitia: string;
  tahunPelajaran: string;
  tanggalKelulusan: string;
  tempatCetak: string;
  bobotRapor: number; // e.g. 60
  bobotUS: number;    // e.g. 40
  kkmKelulusan: number; // e.g. 70.0

  // Kop Surat Configuration
  kopSurat?: KopSuratConfig;
}

export interface Supervisor {
  id: string;
  nama: string;
  nip: string;
  asalSekolah: string;
  ruangTugas: string;
  kontak: string;
}

export interface CommitteeMember {
  id: string;
  jabatan: string;
  nama: string;
  nip: string;
  tugas: string;
}

export interface DiplomaRecord {
  tahunPelajaran: string;
  jumlahDiterima: number;
  terpakai: number;
  rusak: number;
  sisa: number;
  seriAwal: string;
  seriAkhir: string;
  keterangan: string;
}
