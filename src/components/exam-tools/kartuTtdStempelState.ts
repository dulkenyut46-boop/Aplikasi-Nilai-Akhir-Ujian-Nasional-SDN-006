import { SchoolProfile } from '../../types';

export type SignatureType = 'digital' | 'upload' | 'draw' | 'manual';
export type StampType = 'auto-svg' | 'upload';
export type StampPosition = 'ttd' | 'foto' | 'both';
export type DigitalSignatureStyle = 'formal' | 'flowing' | 'script';

export interface KartuTtdStempelConfig {
  // === 1. TANDA TANGAN ===
  showSignature: boolean;
  signatureType: SignatureType;
  uploadedSignatureImage?: string; // base64 PNG data URL
  drawnSignatureImage?: string; // base64 PNG data URL from canvas
  digitalSignatureStyle: DigitalSignatureStyle;
  signatureScale: number; // 70 to 140 (percentage)
  signatureOffsetX: number; // -40 to 40 px
  signatureOffsetY: number; // -30 to 30 px

  // Biodata / Naskah Penandatangan
  jabatanPenandatangan: string;
  namaPenandatangan: string;
  nipPenandatangan: string;
  titimangsaTempat: string;
  titimangsaTanggal: string;

  // === 2. STEMPEL SEKOLAH ===
  showStamp: boolean;
  stampType: StampType;
  uploadedStampImage?: string; // base64 PNG data URL
  stampColor: string; // Hex color code
  stampTextTop: string;
  stampTextBottom: string;
  stampTextCenter1: string;
  stampTextCenter2: string;
  stampScale: number; // 60 to 140 (percentage)
  stampRotation: number; // -30 to 30 (degrees)
  stampOpacity: number; // 40 to 100 (percentage)
  stampPosition: StampPosition;
  stampOffsetX: number; // -40 to 40 px
  stampOffsetY: number; // -30 to 30 px
}

export const STORAGE_KEY_KARTU_TTD_STEMPEL = 'sdn006_kartu_ujian_ttd_stempel_v1';

export const STAMP_PRESET_COLORS = [
  { label: 'Biru Indigo Dinas', value: '#4338ca', desc: 'Warna standar cap dinas basah' },
  { label: 'Ungu Cap Basah', value: '#581c87', desc: 'Warna khas tinta stempel ungu' },
  { label: 'Merah Dinas', value: '#b91c1c', desc: 'Warna stempel merah resmi' },
  { label: 'Biru Tua Gelap', value: '#1e3a8a', desc: 'Warna biru klasik naskah dinas' },
  { label: 'Hitam Pekat', value: '#18181b', desc: 'Cocok untuk cetak monokrom laser' },
];

export function getDefaultKartuTtdStempel(schoolProfile?: SchoolProfile): KartuTtdStempelConfig {
  const namaSekolah = schoolProfile?.namaSekolah || 'SDN 006 SUNGAI BULUH';
  const singkatSekolah = namaSekolah
    .replace('SEKOLAH DASAR NEGERI', 'SDN')
    .replace('SD NEGERI', 'SDN');
  const kabupaten = schoolProfile?.kabupaten || 'KUANTAN SINGINGI';
  const cleanKab = kabupaten.replace('KABUPATEN', '').trim();
  const kecamatan = schoolProfile?.kecamatan || 'SINGINGI HILIR';

  return {
    showSignature: true,
    signatureType: 'digital',
    digitalSignatureStyle: 'formal',
    signatureScale: 100,
    signatureOffsetX: 0,
    signatureOffsetY: 0,

    jabatanPenandatangan: 'Kepala Sekolah,',
    namaPenandatangan: schoolProfile?.kepalaSekolah || 'H. SUPRIADI, S.Pd., M.Pd.',
    nipPenandatangan: schoolProfile?.nipKepalaSekolah || '19720412 199603 1 003',
    titimangsaTempat: schoolProfile?.tempatCetak || 'Sungai Buluh',
    titimangsaTanggal: schoolProfile?.tanggalKelulusan || '12 Mei 2026',

    showStamp: true,
    stampType: 'auto-svg',
    stampColor: '#4338ca',
    stampTextTop: `PEMERINTAH KAB. ${cleanKab || 'KUANTAN SINGINGI'}`,
    stampTextBottom: `KORWIL KEC. ${kecamatan}`,
    stampTextCenter1: singkatSekolah,
    stampTextCenter2: 'CAP SEKOLAH',
    stampScale: 100,
    stampRotation: -12,
    stampOpacity: 85,
    stampPosition: 'ttd',
    stampOffsetX: 0,
    stampOffsetY: 0,
  };
}

export function loadKartuTtdStempelState(schoolProfile?: SchoolProfile): KartuTtdStempelConfig {
  const defaults = getDefaultKartuTtdStempel(schoolProfile);
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KARTU_TTD_STEMPEL);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch (e) {
    console.warn('Failed to load kartu ttd stempel state:', e);
    return defaults;
  }
}

export function saveKartuTtdStempelState(state: KartuTtdStempelConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_KARTU_TTD_STEMPEL, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save kartu ttd stempel state:', e);
  }
}

/**
 * Optimizes an uploaded image file into a transparent PNG data URL
 * to avoid exceeding browser localStorage limits.
 */
export async function optimizeTransparentImage(
  file: File,
  maxDimension = 500
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image onto canvas preserving alpha channel
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as PNG with alpha
        const pngDataUrl = canvas.toDataURL('image/png');
        resolve(pngDataUrl);
      };
      img.onerror = () => reject(new Error('Gagal memuat berkas gambar.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.readAsDataURL(file);
  });
}
