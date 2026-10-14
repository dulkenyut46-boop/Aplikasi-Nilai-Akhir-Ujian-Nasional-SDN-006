import { SchoolProfile } from '../../types';

export interface SerahTerimaMeta {
  judul: string;
  subJudul: string;
  titimangsaTempat: string;
  titimangsaTanggal: string;
  namaPenyerah: string;
  nipPenyerah: string;
  jabatanPenyerah: string;
  catatanKaki?: string;
}

export interface PerpisahanAttendance {
  namaWali?: string;
  kehadiranSiswa?: 'Hadir' | 'Izin' | 'Sakit' | 'Tidak Hadir';
  kehadiranWali?: 'Hadir' | 'Izin' | 'Sakit' | 'Tidak Hadir';
  keterangan?: string;
}

export interface PerpisahanMeta {
  judul: string;
  subJudul: string;
  hariTanggal: string;
  waktu: string;
  tempat: string;
  titimangsaTempat: string;
  titimangsaTanggal: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  attendanceMap: Record<string, PerpisahanAttendance>;
}

const SERAH_TERIMA_KEY = 'sdn006_un_serah_terima_meta_v1';
const PERPISAHAN_KEY = 'sdn006_un_perpisahan_meta_v1';

export function getDefaultSerahTerimaMeta(profile?: SchoolProfile): SerahTerimaMeta {
  const tp = profile?.tahunPelajaran || '2025/2026';
  const tglKelulusan = profile?.tanggalKelulusan || '12 Juni 2026';
  const ks = profile?.kepalaSekolah || 'WINARNI, S.Pd.SD';
  const nipKs = profile?.nipKepalaSekolah || '19790301 200801 2 015';

  return {
    judul: 'BUKU EKSPEDISI SERAH TERIMA IJAZAH & TRANSKRIP NILAI',
    subJudul: `SDN 006 SUNGAI BULUH • TAHUN PELAJARAN ${tp}`,
    titimangsaTempat: 'Sungai Buluh',
    titimangsaTanggal: tglKelulusan,
    namaPenyerah: ks,
    nipPenyerah: nipKs,
    jabatanPenyerah: 'Kepala SD Negeri 006 Sungai Buluh',
    catatanKaki:
      'Ijazah dan Transkrip Nilai telah diterima dalam keadaan baik, lengkap dengan cap stempel dan foto siswa.',
  };
}

export function loadSerahTerimaMeta(profile?: SchoolProfile): SerahTerimaMeta {
  try {
    const raw = localStorage.getItem(SERAH_TERIMA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...getDefaultSerahTerimaMeta(profile), ...parsed };
    }
  } catch (e) {
    console.error('Error loading serah terima meta', e);
  }
  return getDefaultSerahTerimaMeta(profile);
}

export function saveSerahTerimaMeta(meta: SerahTerimaMeta): void {
  try {
    localStorage.setItem(SERAH_TERIMA_KEY, JSON.stringify(meta));
  } catch (e) {
    console.error('Error saving serah terima meta', e);
  }
}

export function getDefaultPerpisahanMeta(profile?: SchoolProfile): PerpisahanMeta {
  const tp = profile?.tahunPelajaran || '2025/2026';
  const ks = profile?.kepalaSekolah || 'WINARNI, S.Pd.SD';
  const nipKs = profile?.nipKepalaSekolah || '19790301 200801 2 015';

  return {
    judul: 'DAFTAR HADIR ACARA PERPISAHAN SISWA SISWI KELAS VI',
    subJudul: `SDN 006 SUNGAI BULUH • TAHUN PELAJARAN ${tp}`,
    hariTanggal: 'Sabtu, 13 Juni 2026',
    waktu: '08.00 WIB s.d. Selesai',
    tempat: 'Halaman & Gedung Utama SD Negeri 006 Sungai Buluh',
    titimangsaTempat: 'Sungai Buluh',
    titimangsaTanggal: '13 Juni 2026',
    kepalaSekolah: ks,
    nipKepalaSekolah: nipKs,
    attendanceMap: {},
  };
}

export function loadPerpisahanMeta(profile?: SchoolProfile): PerpisahanMeta {
  try {
    const raw = localStorage.getItem(PERPISAHAN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...getDefaultPerpisahanMeta(profile), ...parsed };
    }
  } catch (e) {
    console.error('Error loading perpisahan meta', e);
  }
  return getDefaultPerpisahanMeta(profile);
}

export function savePerpisahanMeta(meta: PerpisahanMeta): void {
  try {
    localStorage.setItem(PERPISAHAN_KEY, JSON.stringify(meta));
  } catch (e) {
    console.error('Error saving perpisahan meta', e);
  }
}
