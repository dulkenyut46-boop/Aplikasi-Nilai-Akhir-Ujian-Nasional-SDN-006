import React from 'react';
import { KopSuratConfig, SchoolProfile } from '../../types';
import { getPresetLogoDataUrl } from '../../utils/kopSuratLogos';

interface KopSuratProps {
  config?: KopSuratConfig;
  schoolProfile?: SchoolProfile;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  isPrintOnly?: boolean;
}

export const KopSurat: React.FC<KopSuratProps> = ({
  config: customConfig,
  schoolProfile,
  variant = 'default',
  className = '',
  isPrintOnly = false,
}) => {
  // Resolved config from passed prop or schoolProfile
  const cfg: KopSuratConfig = customConfig || schoolProfile?.kopSurat || {
    instansiAtas: 'PEMERINTAH KABUPATEN KUANTAN SINGINGI',
    instansiTengah: 'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA',
    instansiBawah: 'KOORDINATOR WILAYAH KECAMATAN SINGINGI HILIR',
    namaSekolah: schoolProfile?.namaSekolah || 'SEKOLAH DASAR NEGERI 006 SUNGAI BULUH',
    alamat: schoolProfile?.alamat || 'Jl. Poros Desa Sungai Buluh, RT 04 / RW 02',
    desa: schoolProfile?.desa || 'Sungai Buluh',
    kecamatan: schoolProfile?.kecamatan || 'Singingi Hilir',
    kabupaten: schoolProfile?.kabupaten || 'Kuantan Singingi',
    provinsi: schoolProfile?.provinsi || 'Riau',
    kodePos: schoolProfile?.kodePos || '29563',
    kontak: '',
    email: '',
    website: '',
    tipeGaris: 'ganda',
    showLogoKiri: true,
    logoKiri: getPresetLogoDataUrl('pemda_kuansing'),
    logoKiriPreset: 'pemda_kuansing',
    logoKiriSize: 76,
    showLogoKanan: true,
    logoKanan: getPresetLogoDataUrl('tutwuri'),
    logoKananPreset: 'tutwuri',
    logoKananSize: 76,
  };

  // Determine logo sources
  const leftLogoSrc = cfg.logoKiri || getPresetLogoDataUrl(cfg.logoKiriPreset || 'pemda_kuansing');
  const rightLogoSrc = cfg.logoKanan || getPresetLogoDataUrl(cfg.logoKananPreset || 'tutwuri');

  const leftSize = variant === 'compact' ? Math.round(cfg.logoKiriSize * 0.75) : cfg.logoKiriSize;
  const rightSize = variant === 'compact' ? Math.round(cfg.logoKananSize * 0.75) : cfg.logoKananSize;

  const renderDivider = () => {
    switch (cfg.tipeGaris) {
      case 'tebal':
        return (
          <div className="mt-3 border-b-[3px] border-zinc-950 dark:border-zinc-100 print:border-black" />
        );
      case 'klasik':
        return (
          <div className="mt-3 border-b-4 border-double border-zinc-950 dark:border-zinc-100 print:border-black" />
        );
      case 'modern':
        return (
          <div className="mt-3 space-y-0.5">
            <div className="h-1 bg-gradient-to-r from-emerald-800 via-amber-500 to-emerald-800 rounded-full print:bg-black" />
            <div className="h-0.5 bg-zinc-400 dark:bg-zinc-600 print:bg-black" />
          </div>
        );
      case 'ganda':
      default:
        // Standar Tata Naskah Dinas Resmi: Garis tebal di atas, garis tipis di bawah
        return (
          <div className="mt-2.5 pt-0.5 print:mt-2">
            <div className="border-t-[3px] border-zinc-950 dark:border-zinc-100 print:border-black" />
            <div className="border-t border-zinc-950 dark:border-zinc-100 print:border-black mt-[2.5px]" />
          </div>
        );
    }
  };

  return (
    <header
      className={`kop-surat printable-header select-none text-zinc-900 dark:text-zinc-50 print:text-black print:block ${
        isPrintOnly ? 'hidden print:block' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 sm:gap-5">
        {/* Logo Kiri (Default: Lambang Daerah Pemkab Kuansing) */}
        {cfg.showLogoKiri ? (
          <div
            className="flex shrink-0 items-center justify-center"
            style={{ width: `${leftSize}px`, minWidth: `${leftSize}px` }}
          >
            <img
              src={leftLogoSrc}
              alt="Logo Kiri Kop Surat"
              className="object-contain drop-shadow-xs transition-transform"
              style={{
                width: `${leftSize}px`,
                height: `${leftSize}px`,
                maxHeight: `${leftSize}px`,
              }}
              onError={(e) => {
                // Fallback to preset if URL breaks
                (e.target as HTMLImageElement).src = getPresetLogoDataUrl('pemda_kuansing');
              }}
            />
          </div>
        ) : (
          /* Placeholder to keep header text centered if only right logo is visible */
          cfg.showLogoKanan && (
            <div
              className="hidden sm:block shrink-0"
              style={{ width: `${rightSize}px` }}
              aria-hidden="true"
            />
          )
        )}

        {/* Text Kop Tengah */}
        <div className="flex-1 text-center px-1">
          {/* Instansi Baris 1: PEMERINTAH KABUPATEN KUANTAN SINGINGI (Diperbesar Sesuai Halaman Tersedia) */}
          {cfg.instansiAtas && (
            <h4
              className={`font-black tracking-wider uppercase text-zinc-950 dark:text-zinc-50 print:text-black leading-tight ${
                variant === 'compact'
                  ? 'text-xs sm:text-sm md:text-[15px]'
                  : 'text-sm sm:text-base md:text-lg lg:text-[21px]'
              }`}
            >
              {cfg.instansiAtas}
            </h4>
          )}

          {/* Instansi Baris 2 (Dinas Pendidikan) */}
          {cfg.instansiTengah && (
            <h3
              className={`font-extrabold tracking-wide uppercase text-zinc-900 dark:text-zinc-100 print:text-black leading-tight mt-0.5 ${
                variant === 'compact' ? 'text-[10.5px] sm:text-[11.5px]' : 'text-xs sm:text-[13px] md:text-sm'
              }`}
            >
              {cfg.instansiTengah}
            </h3>
          )}

          {/* Sub Instansi / Korwil (Optional) */}
          {cfg.instansiBawah && (
            <h5
              className={`font-semibold tracking-wide uppercase text-zinc-700 dark:text-zinc-300 print:text-black leading-tight mt-0.5 ${
                variant === 'compact' ? 'text-[9.5px]' : 'text-[11px] sm:text-xs'
              }`}
            >
              {cfg.instansiBawah}
            </h5>
          )}

          {/* Nama Satuan Pendidikan (Paling Menonjol) */}
          <h2
            className={`font-black uppercase tracking-wide text-emerald-950 dark:text-emerald-300 print:text-black leading-tight my-0.5 ${
              variant === 'compact'
                ? 'text-sm sm:text-base'
                : 'text-base sm:text-lg md:text-[19px] lg:text-[20px]'
            }`}
          >
            {cfg.namaSekolah}
          </h2>

          {/* Alamat & Wilayah (Baris Penutup Kop Surat) */}
          <p
            className={`text-zinc-700 dark:text-zinc-300 print:text-black font-sans leading-tight mt-0.5 ${
              variant === 'compact' ? 'text-[9px] sm:text-[10px]' : 'text-[10.5px] sm:text-[11.5px]'
            }`}
          >
            {cfg.alamat}
            {cfg.kecamatan ? `, Kec. ${cfg.kecamatan}` : ''}
            {cfg.kabupaten ? `, Kab. ${cfg.kabupaten}` : ''}
            {cfg.kodePos ? ` - Kode Pos: ${cfg.kodePos}` : ''}
          </p>
        </div>

        {/* Logo Kanan (Default: Tut Wuri Handayani) */}
        {cfg.showLogoKanan ? (
          <div
            className="flex shrink-0 items-center justify-center"
            style={{ width: `${rightSize}px`, minWidth: `${rightSize}px` }}
          >
            <img
              src={rightLogoSrc}
              alt="Logo Kanan Kop Surat"
              className="object-contain drop-shadow-xs transition-transform"
              style={{
                width: `${rightSize}px`,
                height: `${rightSize}px`,
                maxHeight: `${rightSize}px`,
              }}
              onError={(e) => {
                // Fallback to preset if URL breaks
                (e.target as HTMLImageElement).src = getPresetLogoDataUrl('tutwuri');
              }}
            />
          </div>
        ) : (
          /* Placeholder to keep header text centered if only left logo is visible */
          cfg.showLogoKiri && (
            <div
              className="hidden sm:block shrink-0"
              style={{ width: `${leftSize}px` }}
              aria-hidden="true"
            />
          )
        )}
      </div>

      {/* Garis Pembatas Kop Surat Resmi */}
      {renderDivider()}
    </header>
  );
};
