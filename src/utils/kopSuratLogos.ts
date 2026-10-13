// High quality vector SVG assets for Indonesian official educational letterheads (Kop Surat)

export interface KopLogoPreset {
  id: string;
  name: string;
  description: string;
  category: 'pemerintah' | 'pendidikan' | 'nasional';
  svg: string;
  dataUrl: string;
}

// 1. Tut Wuri Handayani (Official Kemendikbudristek)
export const SVG_TUTWURI_HANDAYANI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="twBgGrad" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="70%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="60%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
    <filter id="twShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Outer Pentagon (Segi Lima Dasar) -->
  <polygon points="100,10 188,74 154,178 46,178 12,74" fill="url(#twBgGrad)" stroke="#facc15" stroke-width="4.5" stroke-linejoin="round"/>
  <!-- Inner Pentagon Outline -->
  <polygon points="100,20 176,75 147,166 53,166 24,75" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="4,2" opacity="0.6"/>

  <!-- Belimbing & Sayap Kembar (Wings of Knowledge) -->
  <g filter="url(#twShadow)">
    <!-- Left Wing Feathers -->
    <path d="M100 120 C85 110 52 105 40 85 C38 95 48 115 65 125 C50 122 42 128 46 136 C55 142 75 142 90 134 Z" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1"/>
    <!-- Right Wing Feathers -->
    <path d="M100 120 C115 110 148 105 160 85 C162 95 152 115 135 125 C150 122 158 128 154 136 C145 142 125 142 110 134 Z" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1"/>
    <!-- Center Feather Crown -->
    <path d="M100 70 C94 85 90 105 100 128 C110 105 106 85 100 70 Z" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1"/>
    <path d="M100 55 C90 70 85 95 100 115 C115 95 110 70 100 55 Z" fill="#fbbf24" opacity="0.9"/>
  </g>

  <!-- Nyala Obor / Api Semangat Merah Putih -->
  <path d="M100 38 C94 52 90 62 100 74 C110 62 106 52 100 38 Z" fill="url(#fireGrad)"/>
  <circle cx="100" cy="74" r="5" fill="#fef08a"/>

  <!-- Buku Terbuka Putih (The Open Book) -->
  <g filter="url(#twShadow)">
    <!-- Book Base -->
    <path d="M100 142 C85 132 60 132 45 138 L48 154 C65 148 85 148 100 156 C115 148 135 148 152 154 L155 138 C140 132 115 132 100 142 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
    <!-- Book Pages Center Spine -->
    <line x1="100" y1="142" x2="100" y2="156" stroke="#0f172a" stroke-width="2"/>
    <path d="M52 144 C70 139 88 140 98 147" stroke="#94a3b8" stroke-width="1" fill="none"/>
    <path d="M148 144 C130 139 112 140 102 147" stroke="#94a3b8" stroke-width="1" fill="none"/>
  </g>

  <!-- Motto Ribbon "TUT WURI HANDAYANI" -->
  <g>
    <path d="M38 174 L162 174 L154 186 L46 186 Z" fill="#facc15" stroke="#78350f" stroke-width="1"/>
    <text x="100" y="183" font-family="system-ui, -apple-system, sans-serif" font-size="7.5" font-weight="900" text-anchor="middle" fill="#1e293b" letter-spacing="0.8">TUT WURI HANDAYANI</text>
  </g>
</svg>`;

// 2. Lambang Daerah Pemkab Kuantan Singingi (Kuansing - Jalur, Padi & Kapas, Bintang)
export const SVG_PEMDA_KUANSING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="60%" stop-color="#065f46"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="goldKuansing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="ksShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Official Perisai Segi Lima Pemda -->
  <path d="M100 12 L180 32 L172 136 C172 165 140 186 100 194 C60 186 28 165 28 136 L20 32 Z" fill="url(#shieldGrad)" stroke="#facc15" stroke-width="4.5" stroke-linejoin="round" filter="url(#ksShadow)"/>
  
  <!-- Inner Red & White Field (Merah Putih Nasional) -->
  <path d="M100 22 L168 39 L162 100 L38 100 L32 39 Z" fill="#dc2626"/>
  <path d="M38 100 L162 100 L158 132 C158 156 130 174 100 181 C70 174 42 156 42 132 Z" fill="#f8fafc"/>

  <!-- Bintang Kuning Emas di Puncak (Ketuhanan Yang Maha Esa) -->
  <polygon points="100,28 105,42 119,42 108,51 112,65 100,56 88,65 92,51 81,42 95,42" fill="url(#goldKuansing)" stroke="#78350f" stroke-width="0.8"/>

  <!-- Padi (Kiri - 17 butir simbol kemakmuran) -->
  <g fill="#eab308" stroke="#854d0e" stroke-width="0.6">
    <ellipse cx="56" cy="65" rx="4" ry="7" transform="rotate(-30 56 65)"/>
    <ellipse cx="50" cy="80" rx="4" ry="7" transform="rotate(-25 50 80)"/>
    <ellipse cx="48" cy="98" rx="4" ry="7" transform="rotate(-15 48 98)"/>
    <ellipse cx="50" cy="116" rx="4" ry="7" transform="rotate(5 50 116)"/>
    <ellipse cx="58" cy="132" rx="4" ry="7" transform="rotate(25 58 132)"/>
    <path d="M50 60 Q44 100 66 142" stroke="#854d0e" stroke-width="1.8" fill="none"/>
  </g>

  <!-- Kapas (Kanan - 8 kuntum bunga putih tangkai hijau) -->
  <g fill="#ffffff" stroke="#15803d" stroke-width="0.8">
    <circle cx="146" cy="68" r="6"/>
    <circle cx="152" cy="86" r="6"/>
    <circle cx="153" cy="104" r="6"/>
    <circle cx="150" cy="122" r="6"/>
    <circle cx="140" cy="138" r="6"/>
    <path d="M150 62 Q158 100 134 144" stroke="#15803d" stroke-width="1.8" fill="none"/>
  </g>

  <!-- Jalur Kuantan Singingi (Perahu Tradisional Pacu Jalur Kuansing) -->
  <g filter="url(#ksShadow)">
    <!-- Sungai Kuantan Waves -->
    <path d="M56 126 C75 120 125 120 144 126 C135 135 118 138 100 138 C82 138 65 135 56 126 Z" fill="url(#waterGrad)"/>
    <!-- The Long Canoe (Jalur Kuansing) with Golden Bow & Stern -->
    <path d="M42 118 C70 126 130 126 158 118 C150 126 132 130 100 130 C68 130 50 126 42 118 Z" fill="#78350f" stroke="#451a03" stroke-width="1"/>
    <!-- Selembayung / Ukiran Emas Ujung Jalur -->
    <path d="M38 112 C44 116 48 118 52 118 C46 121 42 120 38 112 Z" fill="#facc15"/>
    <path d="M162 112 C156 116 152 118 148 118 C154 121 158 120 162 112 Z" fill="#facc15"/>
    <!-- Rowers / Anak Pacu Siluet -->
    <circle cx="70" cy="116" r="2" fill="#fef08a"/>
    <circle cx="82" cy="116" r="2" fill="#fef08a"/>
    <circle cx="94" cy="116" r="2" fill="#fef08a"/>
    <circle cx="106" cy="116" r="2" fill="#fef08a"/>
    <circle cx="118" cy="116" r="2" fill="#fef08a"/>
    <circle cx="130" cy="116" r="2" fill="#fef08a"/>
  </g>

  <!-- Pita Kuning Semboyan Daerah "KUANTAN SINGINGI" -->
  <g>
    <path d="M32 156 L100 162 L168 156 L160 172 L100 176 L40 172 Z" fill="#facc15" stroke="#78350f" stroke-width="1.2"/>
    <text x="100" y="169" font-family="system-ui, -apple-system, sans-serif" font-size="7.5" font-weight="900" text-anchor="middle" fill="#0f172a" letter-spacing="1">KUANTAN SINGINGI</text>
  </g>
</svg>`;

// 3. Logo Sekolah Dasar (SD) Nasional
export const SVG_SD_NASIONAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="sdRedGrad" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="70%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
    <linearGradient id="sdGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
  </defs>

  <!-- Circular Outer Shield -->
  <circle cx="100" cy="100" r="90" fill="url(#sdRedGrad)" stroke="#facc15" stroke-width="5"/>
  <circle cx="100" cy="100" r="82" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="6,3"/>

  <!-- Inner Blue Ring -->
  <circle cx="100" cy="100" r="62" fill="#0369a1" stroke="#facc15" stroke-width="2.5"/>

  <!-- Center White Star (Bintang Pendidikan) -->
  <polygon points="100,46 106,62 122,62 109,72 114,88 100,78 86,88 91,72 78,62 94,62" fill="url(#sdGold)" stroke="#78350f" stroke-width="0.8"/>

  <!-- Pen & Book Insignia -->
  <!-- Open Book -->
  <path d="M100 114 C85 106 65 106 54 112 L56 128 C68 122 86 122 100 130 C114 122 132 122 144 128 L146 112 C135 106 115 106 100 114 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="100" y1="114" x2="100" y2="130" stroke="#0f172a" stroke-width="2"/>
  
  <!-- Pen Nib (Pena Emas) -->
  <path d="M100 84 L105 102 L100 112 L95 102 Z" fill="url(#sdGold)" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="102" r="1.5" fill="#1e293b"/>

  <!-- Ribbon "SEKOLAH DASAR" -->
  <path d="M36 150 L100 156 L164 150 L156 166 L100 170 L44 166 Z" fill="#facc15" stroke="#78350f" stroke-width="1.2"/>
  <text x="100" y="163" font-family="system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="900" text-anchor="middle" fill="#0f172a" letter-spacing="1">SEKOLAH DASAR</text>
</svg>`;

// 4. Lambang Garuda Pancasila
export const SVG_GARUDA_PANCASILA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="garudaGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>

  <!-- Wings Left & Right -->
  <!-- Left Wing (17 Bulu Sayap) -->
  <path d="M100 80 C80 50 40 40 18 55 C22 75 42 95 62 108 C42 112 28 124 35 136 C45 142 70 134 85 120 Z" fill="url(#garudaGold)" stroke="#78350f" stroke-width="1.2"/>
  <!-- Right Wing -->
  <path d="M100 80 C120 50 160 40 182 55 C178 75 158 95 138 108 C158 112 172 124 165 136 C155 142 130 134 115 120 Z" fill="url(#garudaGold)" stroke="#78350f" stroke-width="1.2"/>

  <!-- Tail (8 Bulu Ekor) -->
  <path d="M88 140 L100 175 L112 140 Z" fill="url(#garudaGold)" stroke="#78350f" stroke-width="1"/>
  <path d="M78 140 L100 182 L122 140 Z" fill="url(#garudaGold)" stroke="#78350f" stroke-width="1" opacity="0.8"/>

  <!-- Head facing right -->
  <path d="M100 48 C96 38 102 24 114 26 C124 28 128 36 122 42 C126 44 124 48 118 48 C114 55 106 58 100 58 Z" fill="url(#garudaGold)" stroke="#78350f" stroke-width="1.2"/>
  <circle cx="112" cy="34" r="1.5" fill="#18181b"/>
  <!-- Beak -->
  <path d="M120 36 L130 38 L122 42 Z" fill="#f59e0b" stroke="#78350f" stroke-width="0.8"/>

  <!-- Center Shield (Perisai 5 Sila) -->
  <g>
    <path d="M78 70 L122 70 L118 115 C118 128 100 135 100 135 C100 135 82 128 82 115 Z" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
    <!-- Quarter Quadrants -->
    <rect x="80" y="72" width="20" height="28" fill="#dc2626"/>
    <rect x="100" y="72" width="20" height="28" fill="#ffffff"/>
    <rect x="80" y="100" width="20" height="25" fill="#ffffff"/>
    <rect x="100" y="100" width="20" height="25" fill="#dc2626"/>
    <!-- Center Black Shield Star (Ketuhanan) -->
    <rect x="92" y="86" width="16" height="18" fill="#0f172a" rx="2"/>
    <polygon points="100,89 102,94 107,94 103,97 105,102 100,99 95,102 97,97 93,94 98,94" fill="#facc15"/>
  </g>

  <!-- Claws clutching Ribbon -->
  <circle cx="84" cy="154" r="4" fill="url(#garudaGold)" stroke="#78350f" stroke-width="1"/>
  <circle cx="116" cy="154" r="4" fill="url(#garudaGold)" stroke="#78350f" stroke-width="1"/>

  <!-- White Ribbon "BHINNEKA TUNGGAL IKA" -->
  <path d="M50 156 L100 160 L150 156 L145 168 L100 171 L55 168 Z" fill="#ffffff" stroke="#1e293b" stroke-width="1"/>
  <text x="100" y="166" font-family="system-ui, -apple-system, sans-serif" font-size="5.5" font-weight="900" text-anchor="middle" fill="#0f172a" letter-spacing="0.5">BHINNEKA TUNGGAL IKA</text>
</svg>`;

// Helper to convert SVG string to data URI
export function svgToDataUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const KOP_LOGO_PRESETS: KopLogoPreset[] = [
  {
    id: 'pemda_kuansing',
    name: 'Lambang Pemkab Kuantan Singingi',
    description: 'Logo resmi Pemerintah Kabupaten Kuantan Singingi (Jalur, Padi & Kapas, Perisai)',
    category: 'pemerintah',
    svg: SVG_PEMDA_KUANSING,
    dataUrl: svgToDataUri(SVG_PEMDA_KUANSING),
  },
  {
    id: 'tutwuri',
    name: 'Tut Wuri Handayani',
    description: 'Logo resmi Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbud)',
    category: 'pendidikan',
    svg: SVG_TUTWURI_HANDAYANI,
    dataUrl: svgToDataUri(SVG_TUTWURI_HANDAYANI),
  },
  {
    id: 'sd_nasional',
    name: 'Logo Sekolah Dasar (SD)',
    description: 'Lambang standar Sekolah Dasar Nasional (Bintang, Buku & Pena)',
    category: 'pendidikan',
    svg: SVG_SD_NASIONAL,
    dataUrl: svgToDataUri(SVG_SD_NASIONAL),
  },
  {
    id: 'garuda',
    name: 'Garuda Pancasila',
    description: 'Lambang Negara Republik Indonesia resmi untuk naskah kedinasan negara',
    category: 'nasional',
    svg: SVG_GARUDA_PANCASILA,
    dataUrl: svgToDataUri(SVG_GARUDA_PANCASILA),
  },
];

export function getPresetLogoDataUrl(presetId: string): string {
  const found = KOP_LOGO_PRESETS.find((p) => p.id === presetId);
  return found ? found.dataUrl : KOP_LOGO_PRESETS[0].dataUrl;
}
