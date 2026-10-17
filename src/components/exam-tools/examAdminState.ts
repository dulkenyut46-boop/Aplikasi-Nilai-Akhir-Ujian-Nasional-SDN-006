// State and persistence management for Exam Administration (Berita Acara, Pengawas TPU VI, and Susunan Panitia)

export interface BeritaAcaraPelaksanaanState {
  tahunPelajaran: string;
  hari: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  waktuMulai: string;
  waktuSelesai: string;
  padaSekolah: string;
  ruang: string;
  jumlahPesertaSeharusnya: number;
  jumlahPesertaTidakHadir: number;
  jumlahPesertaHadir: number;
  mataPelajaran: string;
  lembarSoalEksamplar: number;
  lembarHasilKerjaEksamplar: number;
  catatan1: string;
  catatan2: string;
  catatan3: string;
  pengawas1Nama: string;
  pengawas1Nip: string;
  pengawas2Nama: string;
  pengawas2Nip: string;
}

export interface TpuLeaderState {
  namaKetuaTpu: string;
  nipKetuaTpu: string;
  jabatanTpu: string;
  kecamatanTpu: string;
}

export interface PanitiaMetaState {
  nomorSk: string;
  tanggalSk: string;
  tahunPelajaran: string;
  keteranganSk: string;
}

const STORAGE_KEYS = {
  BERITA_ACARA_PELAKSANAAN: 'sdn006_un_ba_pelaksanaan_pdf_v2',
  TPU_LEADER: 'sdn006_un_tpu_leader_v1',
  PANITIA_META: 'sdn006_un_panitia_meta_v1',
};

export const DEFAULT_BERITA_ACARA_PELAKSANAAN: BeritaAcaraPelaksanaanState = {
  tahunPelajaran: '2025/2026',
  hari: 'Senin',
  tanggal: '18',
  bulan: 'Mei',
  tahun: '2026',
  waktuMulai: '08.00',
  waktuSelesai: '10.00',
  padaSekolah: 'SD NEGERI 006 SUNGAI BULUH',
  ruang: 'RUANG 1',
  jumlahPesertaSeharusnya: 16,
  jumlahPesertaTidakHadir: 0,
  jumlahPesertaHadir: 16,
  mataPelajaran: 'Bahasa Indonesia',
  lembarSoalEksamplar: 16,
  lembarHasilKerjaEksamplar: 16,
  catatan1: 'Pelaksanaan Ujian Sekolah (US) berlangsung dengan tertib, aman, dan lancar.',
  catatan2: 'Seluruh peserta ujian mematuhi tata tertib dan hadir lengkap.',
  catatan3: 'Kondisi naskah soal dan lembar jawaban dalam keadaan baik dan tersegel.',
  pengawas1Nama: 'SUHARTINI, S.Pd',
  pengawas1Nip: '19750814 200212 2 003',
  pengawas2Nama: 'AHMAD RIDWAN, S.Pd.SD',
  pengawas2Nip: '19810315 200604 1 009',
};

export const DEFAULT_TPU_LEADER: TpuLeaderState = {
  namaKetuaTpu: 'SUPRIADI, M.Pd.',
  nipKetuaTpu: '19720412 199603 1 003',
  jabatanTpu: 'Ketua TPU VI Singingi Hilir',
  kecamatanTpu: 'Kecamatan Singingi Hilir',
};

export const DEFAULT_PANITIA_META: PanitiaMetaState = {
  nomorSk: '421.2/SDN-006/KP/2026',
  tanggalSk: '02 Mei 2026',
  tahunPelajaran: '2025/2026',
  keteranganSk: 'Keputusan Kepala Sekolah SDN 006 Sungai Buluh tentang Pembentukan Panitia Ujian Sekolah',
};

export function loadBeritaAcaraPelaksanaanState(): BeritaAcaraPelaksanaanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BERITA_ACARA_PELAKSANAAN);
    if (!raw) return DEFAULT_BERITA_ACARA_PELAKSANAAN;
    return { ...DEFAULT_BERITA_ACARA_PELAKSANAAN, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_BERITA_ACARA_PELAKSANAAN;
  }
}

export function saveBeritaAcaraPelaksanaanState(data: BeritaAcaraPelaksanaanState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BERITA_ACARA_PELAKSANAAN, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save Berita Acara state', e);
  }
}

export function loadTpuLeaderState(): TpuLeaderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TPU_LEADER);
    if (!raw) return DEFAULT_TPU_LEADER;
    return { ...DEFAULT_TPU_LEADER, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_TPU_LEADER;
  }
}

export function saveTpuLeaderState(data: TpuLeaderState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TPU_LEADER, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save TPU leader state', e);
  }
}

export function loadPanitiaMetaState(): PanitiaMetaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PANITIA_META);
    if (!raw) return DEFAULT_PANITIA_META;
    return { ...DEFAULT_PANITIA_META, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PANITIA_META;
  }
}

export function savePanitiaMetaState(data: PanitiaMetaState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PANITIA_META, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save Panitia meta state', e);
  }
}
