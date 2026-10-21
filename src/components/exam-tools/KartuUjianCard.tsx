import React from 'react';
import { Student, SchoolProfile } from '../../types';
import { getPresetLogoDataUrl } from '../../utils/kopSuratLogos';

export type KartuTheme = 'emerald' | 'blue' | 'gold' | 'monochrome';

export interface KartuUjianCardProps {
  student: Student;
  schoolProfile: SchoolProfile;
  theme?: KartuTheme;
  showStamp?: boolean;
  showBarcode?: boolean;
  showWatermark?: boolean;
  isPrintVersion?: boolean;
}

// Helper to generate crisp Code-128/39 simulated vector barcode
export const renderBarcodeSvg = (code: string) => {
  const cleanCode = (code || '00-000-000-0').replace(/[^a-zA-Z0-9]/g, '');
  const pattern: number[] = [2, 1, 1, 2]; // Start guard

  for (let i = 0; i < cleanCode.length; i++) {
    const n = cleanCode.charCodeAt(i);
    pattern.push((n % 3) + 1, (n % 2) + 1, ((n >> 1) % 3) + 1, 1);
  }
  pattern.push(2, 1, 2, 1, 2); // Stop guard

  let currentX = 2;
  const rects: React.ReactNode[] = [];
  for (let i = 0; i < pattern.length; i++) {
    const w = pattern[i];
    if (i % 2 === 0) {
      rects.push(
        <rect
          key={i}
          x={currentX}
          y={0}
          width={w}
          height={24}
          fill="currentColor"
        />
      );
    }
    currentX += w;
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${currentX + 2} 24`}
        className="h-5 w-32 text-zinc-900 print:text-black"
        preserveAspectRatio="none"
      >
        {rects}
      </svg>
      <span className="font-mono text-[7px] tracking-widest text-zinc-600 print:text-black font-semibold mt-0.5">
        *{code}*
      </span>
    </div>
  );
};

// Authentic Indonesian School Circular Stamp SVG
export const OfficialStampSvg: React.FC<{
  namaSekolah: string;
  kabupaten: string;
  kecamatan?: string;
  className?: string;
}> = ({ namaSekolah, kabupaten, kecamatan = 'SINGINGI HILIR', className = '' }) => {
  return (
    <div
      className={`pointer-events-none select-none relative ${className}`}
      style={{ transform: 'rotate(-10deg)' }}
    >
      <svg viewBox="0 0 160 160" className="w-24 h-24 text-indigo-700/85 print:text-indigo-900/90 drop-shadow-xs">
        {/* Outer and Inner Double Circle */}
        <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,1.5" />
        <circle cx="80" cy="80" r="48" fill="none" stroke="currentColor" strokeWidth="1.2" />

        {/* Curved Text Path Top: DINAS PENDIDIKAN / PEMKAB */}
        <path
          id="stampArcTop"
          d="M 18,80 A 62,62 0 1,1 142,80"
          fill="none"
        />
        <text className="text-[7.8px] font-black tracking-[0.2em] uppercase" fill="currentColor">
          <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">
            PEMERINTAH KAB. {kabupaten.replace('KABUPATEN', '').trim() || 'KUANTAN SINGINGI'}
          </textPath>
        </text>

        {/* Curved Text Path Bottom: KECAMATAN */}
        <path
          id="stampArcBottom"
          d="M 142,80 A 62,62 0 0,1 18,80"
          fill="none"
        />
        <text className="text-[7.8px] font-black tracking-[0.2em] uppercase" fill="currentColor">
          <textPath href="#stampArcBottom" startOffset="50%" textAnchor="middle">
            KORWIL KEC. {kecamatan}
          </textPath>
        </text>

        {/* Left & Right Star Badges */}
        <text x="18" y="83" className="text-[10px] font-bold" fill="currentColor" textAnchor="middle">★</text>
        <text x="142" y="83" className="text-[10px] font-bold" fill="currentColor" textAnchor="middle">★</text>

        {/* Center Text */}
        <g textAnchor="middle" className="uppercase font-black">
          <line x1="52" y1="67" x2="108" y2="67" stroke="currentColor" strokeWidth="1" />
          <text x="80" y="78" className="text-[8.5px] font-extrabold" fill="currentColor">
            {namaSekolah.replace('SEKOLAH DASAR NEGERI', 'SDN').replace('SD NEGERI', 'SDN')}
          </text>
          <text x="80" y="90" className="text-[7.5px] font-bold tracking-wider" fill="currentColor">
            CAP SEKOLAH
          </text>
          <line x1="52" y1="94" x2="108" y2="94" stroke="currentColor" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};

// Signature Simulation Graphic
export const SignatureGraphic: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 40" className={`w-20 h-8 text-blue-900/90 print:text-black ${className}`}>
    <path
      d="M 10 28 C 22 15, 30 8, 38 22 C 45 35, 52 10, 65 18 C 75 25, 88 12, 105 24 M 32 20 Q 70 32 108 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const KartuUjianCard: React.FC<KartuUjianCardProps> = ({
  student,
  schoolProfile,
  theme = 'emerald',
  showStamp = true,
  showBarcode = true,
  showWatermark = true,
  isPrintVersion = false,
}) => {
  // Theme color styles
  const getThemeClasses = () => {
    switch (theme) {
      case 'blue':
        return {
          cardBorder: 'border-blue-900/80 dark:border-blue-700 print:border-black',
          headerBg: 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white print:bg-none print:text-black',
          ribbonBg: 'bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 text-slate-950 print:bg-zinc-200 print:text-black',
          accentText: 'text-blue-900 dark:text-blue-400 print:text-black',
          subtleBadge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800 print:bg-zinc-100 print:border-black print:text-black',
          innerBorder: 'border-blue-200/80 dark:border-blue-900/50 print:border-zinc-300',
          sealColor: 'text-blue-900/85',
        };
      case 'gold':
        return {
          cardBorder: 'border-amber-800/80 dark:border-amber-700 print:border-black',
          headerBg: 'bg-gradient-to-r from-red-950 via-amber-950 to-red-950 text-white print:bg-none print:text-black',
          ribbonBg: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 print:bg-zinc-200 print:text-black',
          accentText: 'text-amber-900 dark:text-amber-400 print:text-black',
          subtleBadge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 print:bg-zinc-100 print:border-black print:text-black',
          innerBorder: 'border-amber-200/80 dark:border-amber-900/50 print:border-zinc-300',
          sealColor: 'text-amber-900/85',
        };
      case 'monochrome':
        return {
          cardBorder: 'border-2 border-black print:border-black',
          headerBg: 'bg-zinc-100 text-black border-b-2 border-black print:bg-zinc-100 print:text-black',
          ribbonBg: 'bg-zinc-200 text-black border-y border-black font-black',
          accentText: 'text-black print:text-black',
          subtleBadge: 'bg-zinc-100 text-black border-black print:bg-zinc-100 print:border-black print:text-black',
          innerBorder: 'border-black print:border-black',
          sealColor: 'text-black',
        };
      case 'emerald':
      default:
        return {
          cardBorder: 'border-emerald-800/90 dark:border-emerald-700 print:border-black',
          headerBg: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-white print:bg-none print:text-black',
          ribbonBg: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-zinc-950 print:bg-zinc-200 print:text-black',
          accentText: 'text-emerald-900 dark:text-emerald-400 print:text-black',
          subtleBadge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 print:bg-zinc-100 print:border-black print:text-black',
          innerBorder: 'border-emerald-200/80 dark:border-emerald-900/50 print:border-zinc-300',
          sealColor: 'text-emerald-900/85',
        };
    }
  };

  const colors = getThemeClasses();
  const logoKiri = schoolProfile.kopSurat?.logoKiri || getPresetLogoDataUrl('pemda_kuansing');
  const logoKanan = schoolProfile.kopSurat?.logoKanan || getPresetLogoDataUrl('tutwuri');

  return (
    <div
      className={`relative rounded-2xl border-2 ${colors.cardBorder} bg-white dark:bg-zinc-900 shadow-sm overflow-hidden break-inside-avoid print:shadow-none print:bg-white text-zinc-900 dark:text-zinc-100 flex flex-col justify-between select-none transition-all`}
      style={{ minHeight: '345px' }}
    >
      {/* Background Watermark (Authentic Security Paper Look) */}
      {showWatermark && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] dark:opacity-[0.06] print:opacity-[0.04] overflow-hidden z-0">
          <img
            src={logoKanan}
            alt="Watermark"
            className="w-56 h-56 object-contain transform -rotate-12 scale-125 grayscale"
          />
        </div>
      )}

      {/* Outer Guilloche Security Frame Accent */}
      <div className={`absolute inset-1 rounded-xl border border-dashed ${colors.innerBorder} pointer-events-none z-0 print:border-zinc-300`} />

      <div className="relative z-10">
        {/* ========================================================
            1. HEADER KOP KARTU
           ======================================================== */}
        <div className={`${colors.headerBg} p-2.5 sm:p-3 border-b-2 ${theme === 'monochrome' ? 'border-black' : 'border-amber-400/90 print:border-black'}`}>
          <div className="flex items-center gap-2">
            {/* Logo Kiri (Pemda) */}
            <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-white/95 rounded-lg p-0.5 shadow-xs print:bg-transparent print:shadow-none">
              <img
                src={logoKiri}
                alt="Logo Daerah"
                className="h-9 w-9 object-contain"
              />
            </div>

            {/* Title / Heading */}
            <div className="flex-1 text-center px-0.5 min-w-0">
              <div className="text-[7.5px] sm:text-[8px] font-bold tracking-widest uppercase opacity-95 leading-tight truncate">
                {schoolProfile.kopSurat?.instansiAtas || 'PEMERINTAH KABUPATEN KUANTAN SINGINGI'}
              </div>
              <div className="text-[7px] sm:text-[7.5px] font-semibold tracking-wider uppercase opacity-85 leading-tight truncate">
                {schoolProfile.kopSurat?.instansiTengah || 'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA'}
              </div>
              <div className="text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wide leading-tight truncate">
                {schoolProfile.namaSekolah}
              </div>
              <div className="text-[7.5px] opacity-75 leading-tight truncate">
                {schoolProfile.alamat} • NPSN: {schoolProfile.npsn || '10403612'}
              </div>
            </div>

            {/* Logo Kanan (Tut Wuri) */}
            <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-white/95 rounded-lg p-0.5 shadow-xs print:bg-transparent print:shadow-none">
              <img
                src={logoKanan}
                alt="Logo Tut Wuri"
                className="h-9 w-9 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Ribbon Title Bar */}
        <div className={`${colors.ribbonBg} py-1 px-3 text-center shadow-xs flex items-center justify-between border-b border-black/15 print:border-black`}>
          <span className="text-[8px] font-bold tracking-wider uppercase">
            UJIAN SEKOLAH / ASESMEN
          </span>
          <span className="text-[9.5px] font-black tracking-wider uppercase">
            KARTU PESERTA UJIAN
          </span>
          <span className="text-[8px] font-bold tracking-wider uppercase font-mono">
            TP {schoolProfile.tahunPelajaran}
          </span>
        </div>

        {/* ========================================================
            2. BODY KARTU (FOTO 2X3 + BIODATA LENGKAP)
           ======================================================== */}
        <div className="p-3 sm:p-3.5 flex gap-3 sm:gap-4 items-start">
          {/* Kolom Kiri: Foto 2x3 & Barcode */}
          <div className="flex flex-col items-center shrink-0 w-22 sm:w-24 space-y-2">
            {/* Bingkai Pas Foto Resmi 2x3 */}
            <div className="relative h-28 w-22 rounded-lg border-2 border-zinc-800 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 p-0.5 overflow-hidden shadow-xs print:border-black flex flex-col items-center justify-center">
              {student.foto ? (
                <>
                  <img
                    src={student.foto}
                    alt={student.nama}
                    className="h-full w-full object-cover rounded"
                  />
                  <div className="absolute top-1 left-1 bg-black/60 rounded px-1 text-[6.5px] font-bold text-amber-300 tracking-wider">
                    2x3
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-1 text-center bg-gradient-to-b from-blue-900 to-indigo-950 text-white rounded">
                  <span className="text-xl leading-none">
                    {student.jenisKelamin === 'L' ? '👦' : '👧'}
                  </span>
                  <span className="text-[7px] font-black tracking-wider mt-1 uppercase text-amber-300">
                    PAS FOTO
                  </span>
                  <span className="text-[6.5px] font-bold text-blue-100">
                    2 x 3 CM
                  </span>
                </div>
              )}

              {/* Stempel Sekolah Overlap di Pojok Foto (Autentikasi Fisik) */}
              {showStamp && (
                <div className="absolute -bottom-6 -right-6 z-20">
                  <OfficialStampSvg
                    namaSekolah={schoolProfile.namaSekolah}
                    kabupaten={schoolProfile.kabupaten}
                    kecamatan={schoolProfile.kecamatan}
                    className="opacity-80 scale-75"
                  />
                </div>
              )}
            </div>

            {/* Barcode Otentikasi Resmi */}
            {showBarcode && (
              <div className="w-full pt-0.5 flex flex-col items-center">
                {renderBarcodeSvg(student.noPeserta)}
                <span className="text-[6.5px] text-zinc-500 font-bold uppercase tracking-wider text-center print:text-black">
                  VERIFIKASI RESMI
                </span>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Rincian Biodata Peserta */}
          <div className="flex-1 min-w-0 space-y-1.5 text-xs">
            {/* Box Nomor Peserta Ujian */}
            <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 p-1.5 bg-zinc-50 dark:bg-zinc-800/80 print:bg-zinc-50 print:border-black">
              <span className="text-[7.5px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block print:text-black">
                Nomor Peserta Ujian:
              </span>
              <div className="font-mono text-xs sm:text-[13px] font-black tracking-wider text-emerald-900 dark:text-emerald-300 print:text-black">
                {student.noPeserta}
              </div>
            </div>

            {/* Grid Data Siswa */}
            <div className="space-y-1 text-[11px] leading-tight">
              <div>
                <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase print:text-black">
                  Nama Peserta:
                </span>
                <span className="font-extrabold uppercase text-zinc-950 dark:text-zinc-50 text-[11.5px] tracking-wide block truncate print:text-black">
                  {student.nama}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div>
                  <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase print:text-black">
                    NISN:
                  </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                    {student.nisn}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase print:text-black">
                    NIS:
                  </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                    {student.nis || '-'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase print:text-black">
                  Tempat, Tanggal Lahir:
                </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate block print:text-black">
                  {student.tempatLahir}, {student.tanggalLahir}
                </span>
              </div>

              {/* Ruang & Nomor Meja Highlight */}
              <div className="pt-1">
                <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 block uppercase print:text-black">
                  Lokasi & Tempat Duduk:
                </span>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${colors.subtleBadge} text-[10px] font-black uppercase mt-0.5`}>
                  <span>📍 {student.ruang}</span>
                  <span>•</span>
                  <span>MEJA #{String(student.noMeja).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. FOOTER KARTU (TATA TERTIB + TTD KEPALA SEKOLAH)
         ======================================================== */}
      <div className="relative z-10 border-t border-zinc-200 dark:border-zinc-800 print:border-black p-2.5 sm:p-3 bg-zinc-50/60 dark:bg-zinc-850/60 print:bg-transparent flex items-end justify-between text-[8px]">
        {/* Catatan / Tata Tertib */}
        <div className="space-y-0.5 max-w-[55%] text-zinc-500 dark:text-zinc-400 print:text-zinc-700 leading-tight">
          <div className="font-bold text-zinc-700 dark:text-zinc-300 print:text-black">
            Ketentuan:
          </div>
          <div>1. Kartu wajib dibawa selama ujian berlangsung.</div>
          <div>2. Letakkan di sudut kanan atas meja ujian.</div>
        </div>

        {/* Titimangsa & Tanda Tangan */}
        <div className="text-right space-y-0.5 min-w-[125px]">
          <div className="text-zinc-600 dark:text-zinc-400 print:text-black">
            {schoolProfile.tempatCetak || 'Sungai Buluh'}, {schoolProfile.tanggalKelulusan || '12 Mei 2026'}
          </div>
          <div className="font-bold text-zinc-700 dark:text-zinc-300 print:text-black">
            Kepala Sekolah,
          </div>

          <div className="relative h-9 flex items-center justify-end">
            <SignatureGraphic />
            {showStamp && (
              <div className="absolute right-8 top-[-8px]">
                <OfficialStampSvg
                  namaSekolah={schoolProfile.namaSekolah}
                  kabupaten={schoolProfile.kabupaten}
                  kecamatan={schoolProfile.kecamatan}
                  className="opacity-70 scale-50"
                />
              </div>
            )}
          </div>

          <div className="font-black text-zinc-900 dark:text-zinc-100 underline uppercase tracking-tight text-[8.5px] print:text-black">
            {schoolProfile.kepalaSekolah}
          </div>
          <div className="text-zinc-600 dark:text-zinc-400 font-mono text-[7.5px] print:text-black">
            NIP. {schoolProfile.nipKepalaSekolah}
          </div>
        </div>
      </div>
    </div>
  );
};
