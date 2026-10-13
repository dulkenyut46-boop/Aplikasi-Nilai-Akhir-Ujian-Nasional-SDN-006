import { Student, SchoolProfile, Supervisor, CommitteeMember, DiplomaRecord, SubjectKey } from '../types';
import { generateStudentPhotoSvg } from '../utils/studentAvatars';
import { getPresetLogoDataUrl } from '../utils/kopSuratLogos';

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  namaSekolah: 'SD NEGERI 006 SUNGAI BULUH',
  npsn: '10403871',
  nss: '101090600006',
  akreditasi: 'A (Unggul)',
  alamat: 'Jln. Pendidikan No. 01 Desa Sungai Buluh',
  desa: 'Sungai Buluh',
  kecamatan: 'Singingi Hilir',
  kabupaten: 'Kuantan Singingi',
  provinsi: 'Riau',
  kodePos: '29563',
  kepalaSekolah: 'WINARNI, S.Pd.SD',
  nipKepalaSekolah: '19790301 200801 2 015',
  ketuaPanitia: 'HENRI SAPUTRA, S.Pd',
  nipKetuaPanitia: '19820415 200801 1 008',
  tahunPelajaran: '2025/2026',
  tanggalKelulusan: '30 Mei 2026',
  tempatCetak: 'Sungai Buluh',
  bobotRapor: 60,
  bobotUS: 40,
  kkmKelulusan: 70.0,
  kopSurat: {
    instansiAtas: 'PEMERINTAH KABUPATEN KUANTAN SINGINGI',
    instansiTengah: 'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA',
    instansiBawah: 'KOORDINATOR WILAYAH KECAMATAN SINGINGI HILIR',
    namaSekolah: 'SEKOLAH DASAR NEGERI 006 SUNGAI BULUH',
    alamat: 'Jln. Pendidikan No. 01 Desa Sungai Buluh',
    desa: 'Sungai Buluh',
    kecamatan: 'Singingi Hilir',
    kabupaten: 'Kuantan Singingi',
    provinsi: 'Riau',
    kodePos: '29563',
    kontak: 'Telp: 0812-7654-3201',
    email: 'sdn006sungaibuluh@gmail.com',
    website: 'https://sdn006singingihilir.sch.id',
    tipeGaris: 'ganda',
    showLogoKiri: true,
    logoKiri: getPresetLogoDataUrl('pemda_kuansing'),
    logoKiriPreset: 'pemda_kuansing',
    logoKiriSize: 76,
    showLogoKanan: true,
    logoKanan: getPresetLogoDataUrl('tutwuri'),
    logoKananPreset: 'tutwuri',
    logoKananSize: 76,
  },
};

export const INITIAL_DIPLOMA_RECORDS: DiplomaRecord[] = [
  {
    tahunPelajaran: '2025/2026',
    jumlahDiterima: 35,
    terpakai: 32,
    rusak: 0,
    sisa: 3,
    seriAwal: 'DN-09/D-SD/26/0014501',
    seriAkhir: 'DN-09/D-SD/26/0014535',
    keterangan: 'Blangko Kurikulum 2013 / Merdeka Kondisi Baik',
  },
  {
    tahunPelajaran: '2024/2025',
    jumlahDiterima: 30,
    terpakai: 29,
    rusak: 1,
    sisa: 0,
    seriAwal: 'DN-09/D-SD/25/0012210',
    seriAkhir: 'DN-09/D-SD/25/0012239',
    keterangan: '1 Lembar rusak salah penulisan nama, dibuatkan berita acara penggantian',
  },
];

export const INITIAL_SUPERVISORS: Supervisor[] = [
  {
    id: 'sup-1',
    nama: 'MASRIANTO, S.Pd',
    nip: '19750810 200212 1 002',
    asalSekolah: 'SDN 002 Koto Baru (TPU VI Singingi Hilir)',
    ruangTugas: 'RUANG 1',
    kontak: '0812-7654-3201',
  },
  {
    id: 'sup-2',
    nama: 'NURHAYATI, S.Pd.SD',
    nip: '19810314 200604 2 011',
    asalSekolah: 'SDN 004 Simpang Raya (TPU VI Singingi Hilir)',
    ruangTugas: 'RUANG 1',
    kontak: '0813-8890-4412',
  },
  {
    id: 'sup-3',
    nama: 'DARMANSYAH, S.Pd',
    nip: '19790622 200501 1 007',
    asalSekolah: 'SDN 001 Muara Bahan (TPU VI Singingi Hilir)',
    ruangTugas: 'RUANG 2',
    kontak: '0852-6543-9801',
  },
  {
    id: 'sup-4',
    nama: 'SITI AMINAH, S.Pd',
    nip: '19841103 200902 2 005',
    asalSekolah: 'SDN 005 Sukamaju (TPU VI Singingi Hilir)',
    ruangTugas: 'RUANG 2',
    kontak: '0821-7711-2345',
  },
  {
    id: 'sup-5',
    nama: 'HERIYANTO, S.Pd.SD',
    nip: '19800918 200701 1 014',
    asalSekolah: 'SDN 003 Sungai Buluh Mandiri (TPU VI Singingi Hilir)',
    ruangTugas: 'RUANG 3',
    kontak: '0812-9988-7766',
  },
  {
    id: 'sup-6',
    nama: 'YULIANA, S.Pd',
    nip: '19860228 201001 2 018',
    asalSekolah: 'SDN 007 Petai (TPU VI Singingi Hilir)',
    ruangTugas: 'RUANG 3',
    kontak: '0853-4455-6677',
  },
  {
    id: 'sup-7',
    nama: 'SUPARMAN, S.Pd',
    nip: '19770512 200312 1 006',
    asalSekolah: 'SDN 008 Bumi Mulya (TPU VI Singingi Hilir)',
    ruangTugas: 'RUANG 4',
    kontak: '0813-1122-3344',
  },
  {
    id: 'sup-8',
    nama: 'ERNAWATI, S.Pd.SD',
    nip: '19830704 200804 2 009',
    asalSekolah: 'SDN 006 Sungai Buluh (Pengawas Cadangan TPU VI)',
    ruangTugas: 'RUANG 4',
    kontak: '0822-6677-8899',
  },
];

export const INITIAL_COMMITTEE: CommitteeMember[] = [
  {
    id: 'com-1',
    jabatan: 'Penanggung Jawab',
    nama: 'ZULKIFLI, S.Pd.SD',
    nip: '19680512 199303 1 004',
    tugas: 'Mengkoordinasikan seluruh penyelenggaraan Ujian Sekolah & Keabsahan SKHU/Ijazah',
  },
  {
    id: 'com-2',
    jabatan: 'Ketua Pelaksana',
    nama: 'HENRI SAPUTRA, S.Pd',
    nip: '19820415 200801 1 008',
    tugas: 'Memimpin teknis pelaksanaan, jadwal, dan distribusi perangkat ujian',
  },
  {
    id: 'com-3',
    jabatan: 'Sekretaris',
    nama: 'FITRI YANTI, S.Pd',
    nip: '19870921 201101 2 006',
    tugas: 'Administrasi data peserta, absensi, berita acara, dan pengarsipan naskah',
  },
  {
    id: 'com-4',
    jabatan: 'Bendahara',
    nama: 'SRI WAHYUNI, A.Ma.Pd',
    nip: '19741005 199803 2 002',
    tugas: 'Pengelolaan anggaran operasional dan logistik pelaksanaan ujian',
  },
  {
    id: 'com-5',
    jabatan: 'Seksi Naskah & Pengolahan Nilai',
    nama: 'BUDI SANTOSO, S.Pd.SD',
    nip: '19851210 200903 1 005',
    tugas: 'Entri dan validasi rekapitulasi nilai rapor S7-S12 serta nilai ujian sekolah',
  },
  {
    id: 'com-6',
    jabatan: 'Seksi Perlengkapan & Ruang',
    nama: 'AGUS SALIM, S.Pd',
    nip: '19900318 201402 1 001',
    tugas: 'Penataan denah ruang 1-4, nomor meja, dan protokol kelengkapan ujian',
  },
];

// Helper to generate consistent student data
function createStudent(
  index: number,
  noUrut: number,
  nisn: string,
  nis: string,
  nama: string,
  tempat: string,
  tgl: string,
  gender: 'L' | 'P',
  ayah: string,
  ibu: string,
  pekerjaan: string,
  alamat: string,
  ruangNum: 1 | 2 | 3 | 4,
  noMeja: number,
  baseScore: number,
  lanjut: string
): Student {
  const ruang = `RUANG ${ruangNum}` as 'RUANG 1' | 'RUANG 2' | 'RUANG 3' | 'RUANG 4';
  const noPes = `04-006-${String(noUrut).padStart(3, '0')}-${(noUrut % 9) + 1}`;
  
  // Random variance within bounds for realism
  const getSubScore = (base: number, offset: number) => {
    const val = base + offset;
    return Math.min(98, Math.max(70, Math.round(val * 10) / 10));
  };

  const subjects: SubjectKey[] = ['pab', 'ppkn', 'bin', 'mat', 'ipa', 'ips', 'sbdp', 'pjok', 'mulok', 'bing'];

  const s7: Record<SubjectKey, number> = {} as any;
  const s8: Record<SubjectKey, number> = {} as any;
  const s9: Record<SubjectKey, number> = {} as any;
  const s10: Record<SubjectKey, number> = {} as any;
  const s11: Record<SubjectKey, number> = {} as any;
  const s12: Record<SubjectKey, number> = {} as any;
  const us: Record<SubjectKey, { tulis: number; praktik?: number; akhir: number }> = {} as any;

  subjects.forEach((k, idx) => {
    const diff = ((idx % 5) - 2) * 1.5;
    s7[k] = getSubScore(baseScore - 2, diff);
    s8[k] = getSubScore(baseScore - 1, diff + 0.5);
    s9[k] = getSubScore(baseScore, diff);
    s10[k] = getSubScore(baseScore + 1, diff - 0.5);
    s11[k] = getSubScore(baseScore + 1.5, diff + 1);
    s12[k] = getSubScore(baseScore + 2, diff + 0.5);

    const tulis = getSubScore(baseScore + 1, diff);
    const hasPraktik = ['pab', 'ipa', 'sbdp', 'pjok', 'bin'].includes(k);
    const praktik = hasPraktik ? getSubScore(baseScore + 3, diff) : undefined;
    const akhir = hasPraktik ? Math.round(((tulis * 0.5) + ((praktik || 0) * 0.5)) * 10) / 10 : tulis;

    us[k] = { tulis, praktik, akhir };
  });

  const seriIjazah = `DN-09/D-SD/26/00145${String(noUrut).padStart(2, '0')}`;
  const noSKL = `421.2/SDN-06/SK-LULUS/2026/${String(noUrut).padStart(3, '0')}`;
  const noTranskrip = `421.2/SDN-06/SKHU/2026/${String(noUrut).padStart(3, '0')}`;

  return {
    id: `std-${index + 1}`,
    noPeserta: noPes,
    nisn,
    nis,
    nama,
    tempatLahir: tempat,
    tanggalLahir: tgl,
    jenisKelamin: gender,
    namaAyah: ayah,
    namaIbu: ibu,
    pekerjaanOrtu: pekerjaan,
    alamat,
    ruang,
    noMeja,
    rapor: {
      s7,
      s8,
      s9,
      s10,
      s11,
      s12,
    },
    us,
    statusKelulusan: 'LULUS',
    noSeriIjazah: seriIjazah,
    noSuratKelulusan: noSKL,
    noSuratTranskrip: noTranskrip,
    foto: generateStudentPhotoSvg(nama, gender, noUrut),
    tanggalAmbilIjazah: '15 Juni 2026',
    penerimaIjazah: `${ayah} (Orang Tua)`,
    catatan: 'Berkas ijazah, SKL, transkrip nilai SKHU lengkap 100%',
  };
}

export const INITIAL_STUDENTS: Student[] = [
  // RUANG 1 (Meja 1 - 8)
  createStudent(0, 1, '0123456781', '2019001', 'ADITYA PRATAMA', 'Sungai Buluh', '2013-04-12', 'L', 'Bambang Irawan', 'Siti Rahma', 'Petani Sawit', 'RT 01 RW 01 Sungai Buluh', 1, 1, 88.5, 'SMPN 1 Singingi Hilir'),
  createStudent(1, 2, '0123456782', '2019002', 'AISYAH PUTRI SALSABILA', 'Koto Baru', '2013-08-25', 'P', 'Syamsudin', 'Nuraini', 'Wiraswasta', 'RT 02 RW 01 Sungai Buluh', 1, 2, 92.0, 'MTs Nurul Ikhlas Singingi Hilir'),
  createStudent(2, 3, '0123456783', '2019003', 'ALDI SAPUTRA', 'Sungai Buluh', '2013-01-19', 'L', 'Ridwan', 'Kasmarni', 'Karyawan Swasta', 'RT 03 RW 01 Sungai Buluh', 1, 3, 84.0, 'SMPN 1 Singingi Hilir'),
  createStudent(3, 4, '0123456784', '2019004', 'AMELIA DWI LESTARI', 'Muara Bahan', '2013-05-30', 'P', 'Joko Susilo', 'Endang Lestari', 'PNS', 'RT 01 RW 02 Sungai Buluh', 1, 4, 89.5, 'SMPN 3 Singingi Hilir'),
  createStudent(4, 5, '0123456785', '2019005', 'ANUGRAH RAMADHAN', 'Sungai Buluh', '2013-07-14', 'L', 'Ramli', 'Mariani', 'Pedagang', 'RT 02 RW 02 Sungai Buluh', 1, 5, 83.5, 'SMP Swasta Bhakti Mandiri'),
  createStudent(5, 6, '0123456786', '2019006', 'AQILA ZAHRA', 'Sungai Buluh', '2013-11-03', 'P', 'Hasbi', 'Rukmini', 'Petani', 'RT 03 RW 02 Sungai Buluh', 1, 6, 94.0, 'SMPN 1 Singingi Hilir'),
  createStudent(6, 7, '0123456787', '2019007', 'BAYU PRASETYO', 'Simpang Raya', '2013-03-22', 'L', 'Sugianto', 'Sumiyati', 'Wiraswasta', 'RT 04 RW 02 Sungai Buluh', 1, 7, 81.0, 'SMPN 3 Singingi Hilir'),
  createStudent(7, 8, '0123456788', '2019008', 'CINTA AULIA RAHMADHANI', 'Sungai Buluh', '2013-09-17', 'P', 'Zainal Abidin', 'Mardiana', 'PNS', 'RT 04 RW 02 Sungai Buluh', 1, 8, 91.5, 'Ponpes Al-Hidayah Singingi'),

  // RUANG 2 (Meja 1 - 8)
  createStudent(8, 9, '0123456789', '2019009', 'DIMAS FEBRIANTO', 'Sungai Buluh', '2013-02-10', 'L', 'Subandi', 'Wartini', 'Petani Sawit', 'RT 05 RW 03 Sungai Buluh', 2, 1, 85.0, 'SMPN 1 Singingi Hilir'),
  createStudent(9, 10, '0123456790', '2019010', 'DINA MARLIANA', 'Koto Baru', '2013-06-15', 'P', 'Marzuki', 'Lismawati', 'Pedagang', 'RT 05 RW 03 Sungai Buluh', 2, 2, 87.5, 'MTs Nurul Ikhlas Singingi Hilir'),
  createStudent(10, 11, '0123456791', '2019011', 'FACHRI AL BUKHORI', 'Sungai Buluh', '2013-10-08', 'L', 'Mukhtar', 'Jubaidah', 'Wiraswasta', 'RT 06 RW 03 Sungai Buluh', 2, 3, 86.0, 'SMPN 1 Singingi Hilir'),
  createStudent(11, 12, '0123456792', '2019012', 'FANI APRILIA', 'Sungai Buluh', '2013-04-05', 'P', 'Baharudin', 'Rostina', 'Petani', 'RT 06 RW 03 Sungai Buluh', 2, 4, 88.0, 'SMPN 3 Singingi Hilir'),
  createStudent(12, 13, '0123456793', '2019013', 'GILANG RADITYA', 'Muara Bahan', '2013-12-21', 'L', 'Sutrisno', 'Pujiastuti', 'PNS', 'RT 07 RW 03 Sungai Buluh', 2, 5, 83.0, 'SMP Swasta Bhakti Mandiri'),
  createStudent(13, 14, '0123456794', '2019014', 'HANIFAH AZZAHRA', 'Sungai Buluh', '2013-03-01', 'P', 'Zulfikar', 'Nurhasanah', 'Pedagang', 'RT 07 RW 03 Sungai Buluh', 2, 6, 93.5, 'SMPN 1 Singingi Hilir'),
  createStudent(14, 15, '0123456795', '2019015', 'IKHSAN MAULANA', 'Sungai Buluh', '2013-07-28', 'L', 'Usman', 'Salbiah', 'Petani Sawit', 'RT 08 RW 04 Sungai Buluh', 2, 7, 79.5, 'SMPN 1 Singingi Hilir'),
  createStudent(15, 16, '0123456796', '2019016', 'INDAH PERMATASARI', 'Simpang Raya', '2013-09-09', 'P', 'Samsir', 'Maimunah', 'Wiraswasta', 'RT 08 RW 04 Sungai Buluh', 2, 8, 90.0, 'MTs Nurul Ikhlas Singingi Hilir'),

  // RUANG 3 (Meja 1 - 8)
  createStudent(16, 17, '0123456797', '2019017', 'JUAN ARDIANSYAH', 'Sungai Buluh', '2013-05-18', 'L', 'Hendra', 'Kurniawati', 'Petani', 'RT 09 RW 04 Sungai Buluh', 3, 1, 82.5, 'SMPN 3 Singingi Hilir'),
  createStudent(17, 18, '0123456798', '2019018', 'KHAIRUNNISA AZ-ZAHRA', 'Koto Baru', '2013-10-31', 'P', 'Syafrianto', 'Ermawati', 'PNS', 'RT 09 RW 04 Sungai Buluh', 3, 2, 95.0, 'SMPN 1 Singingi Hilir'),
  createStudent(18, 19, '0123456799', '2019019', 'LUTHFI HAKIM', 'Sungai Buluh', '2013-01-04', 'L', 'Lukman Hakim', 'Suryani', 'Wiraswasta', 'RT 10 RW 05 Sungai Buluh', 3, 3, 87.0, 'Ponpes Al-Hidayah Singingi'),
  createStudent(19, 20, '0123456800', '2019020', 'MEISYA ADELIA', 'Sungai Buluh', '2013-08-12', 'P', 'Afrizal', 'Deliana', 'Pedagang', 'RT 10 RW 05 Sungai Buluh', 3, 4, 89.0, 'SMPN 1 Singingi Hilir'),
  createStudent(20, 21, '0123456801', '2019021', 'MUHAMMAD RIZKY', 'Sungai Buluh', '2013-11-20', 'L', 'Zulkarnain', 'Fatmawati', 'Petani Sawit', 'RT 11 RW 05 Sungai Buluh', 3, 5, 86.5, 'SMPN 1 Singingi Hilir'),
  createStudent(21, 22, '0123456802', '2019022', 'NADIA SAFITRI', 'Muara Bahan', '2013-03-14', 'P', 'Syahrial', 'Yulinar', 'Wiraswasta', 'RT 11 RW 05 Sungai Buluh', 3, 6, 88.5, 'MTs Nurul Ikhlas Singingi Hilir'),
  createStudent(22, 23, '0123456803', '2019023', 'NAUFAL GHANI', 'Sungai Buluh', '2013-06-27', 'L', 'Ghazali', 'Roslinda', 'PNS', 'RT 12 RW 06 Sungai Buluh', 3, 7, 84.5, 'SMPN 3 Singingi Hilir'),
  createStudent(23, 24, '0123456804', '2019024', 'NURUL HIDAYAH', 'Sungai Buluh', '2013-12-05', 'P', 'Taufik Hidayat', 'Nurleli', 'Petani', 'RT 12 RW 06 Sungai Buluh', 3, 8, 92.5, 'SMPN 1 Singingi Hilir'),

  // RUANG 4 (Meja 1 - 8)
  createStudent(24, 25, '0123456805', '2019025', 'PUTRA ALAMSYAH', 'Sungai Buluh', '2013-04-16', 'L', 'Amiruddin', 'Nurhasmi', 'Petani Sawit', 'RT 13 RW 06 Sungai Buluh', 4, 1, 80.5, 'SMP Swasta Bhakti Mandiri'),
  createStudent(25, 26, '0123456806', '2019026', 'RAFAEL KURNIAWAN', 'Simpang Raya', '2013-07-07', 'L', 'Kurnia Sandi', 'Desi Ratnasari', 'Wiraswasta', 'RT 13 RW 06 Sungai Buluh', 4, 2, 85.5, 'SMPN 1 Singingi Hilir'),
  createStudent(26, 27, '0123456807', '2019027', 'RESTI FAUZIAH', 'Sungai Buluh', '2013-02-23', 'P', 'Fauzan', 'Yusnidar', 'PNS', 'RT 14 RW 07 Sungai Buluh', 4, 3, 90.5, 'SMPN 1 Singingi Hilir'),
  createStudent(27, 28, '0123456808', '2019028', 'RIZKI RAMADHAN', 'Koto Baru', '2013-09-01', 'L', 'Samsuri', 'Rohani', 'Pedagang', 'RT 14 RW 07 Sungai Buluh', 4, 4, 83.0, 'SMPN 3 Singingi Hilir'),
  createStudent(28, 29, '0123456809', '2019029', 'SALWA SALSABILA', 'Sungai Buluh', '2013-10-15', 'P', 'Ilyas', 'Halimah', 'Petani', 'RT 15 RW 07 Sungai Buluh', 4, 5, 91.0, 'MTs Nurul Ikhlas Singingi Hilir'),
  createStudent(29, 30, '0123456810', '2019030', 'TEGAR PRASETYA', 'Sungai Buluh', '2013-05-09', 'L', 'Prasetyo Wibowo', 'Widayati', 'Wiraswasta', 'RT 15 RW 07 Sungai Buluh', 4, 6, 82.0, 'SMP Swasta Bhakti Mandiri'),
  createStudent(30, 31, '0123456811', '2019031', 'TIARA ANDINI', 'Muara Bahan', '2013-11-28', 'P', 'Sudirman', 'Marlina', 'PNS', 'RT 16 RW 08 Sungai Buluh', 4, 7, 93.0, 'SMPN 1 Singingi Hilir'),
  createStudent(31, 32, '0123456812', '2019032', 'WAHYU HIDAYATULLAH', 'Sungai Buluh', '2013-08-04', 'L', 'Hidayat', 'Nuraini', 'Petani Sawit', 'RT 16 RW 08 Sungai Buluh', 4, 8, 86.0, 'Ponpes Al-Hidayah Singingi'),
];
