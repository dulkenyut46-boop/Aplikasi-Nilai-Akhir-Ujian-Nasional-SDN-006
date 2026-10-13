// Helper to generate Indonesian elementary school student pas foto (red/blue background with uniform)
export function generateStudentPhotoSvg(
  name: string,
  gender: 'L' | 'P',
  variant: number = 1
): string {
  // Indonesian Pas Foto standard background:
  // Red background (#d32f2f) for odd birth years, Blue (#1976d2) for even birth years
  const bgColors = ['#c62828', '#1565c0', '#b71c1c', '#0d47a1'];
  const bg = bgColors[variant % bgColors.length];

  // Boys: short neat hair, white shirt with red SD tie/collar
  // Girls: hair with ribbon or hijab/jilbab, white shirt with red tie
  const isHijab = gender === 'P' && variant % 2 === 0;

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200">
    <defs>
      <linearGradient id="bgGrad${variant}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bg}" />
        <stop offset="100%" stop-color="${bg === '#c62828' ? '#8e0000' : '#002171'}" />
      </linearGradient>
      <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fed7aa" />
        <stop offset="100%" stop-color="#fbcfe8" />
      </linearGradient>
    </defs>
    
    <!-- Background (Pas Foto Resmi) -->
    <rect width="160" height="200" fill="url(#bgGrad${variant})" />

    <!-- Shadows / Lighting vignette -->
    <circle cx="80" cy="90" r="75" fill="white" opacity="0.08" />

    ${
      gender === 'L'
        ? `
      <!-- Boy: Hair -->
      <path d="M48 76 Q46 36 80 34 Q114 36 112 76 Q98 62 80 62 Q62 62 48 76 Z" fill="#18181b" />
      <!-- Boy: Neck -->
      <rect x="70" y="96" width="20" height="24" fill="#fcd34d" />
      <!-- Boy: Head -->
      <ellipse cx="80" cy="74" rx="26" ry="30" fill="#fde68a" />
      <!-- Ears -->
      <ellipse cx="53" cy="76" rx="4" ry="7" fill="#fde68a" />
      <ellipse cx="107" cy="76" rx="4" ry="7" fill="#fde68a" />
      <!-- Eyes -->
      <ellipse cx="71" cy="74" rx="2.5" ry="3" fill="#18181b" />
      <ellipse cx="89" cy="74" rx="2.5" ry="3" fill="#18181b" />
      <circle cx="72" cy="73" r="0.8" fill="#ffffff" />
      <circle cx="90" cy="73" r="0.8" fill="#ffffff" />
      <!-- Eyebrows -->
      <path d="M66 69 Q72 67 76 69" stroke="#18181b" stroke-width="1.8" fill="none" stroke-linecap="round" />
      <path d="M84 69 Q88 67 94 69" stroke="#18181b" stroke-width="1.8" fill="none" stroke-linecap="round" />
      <!-- Nose & Smile -->
      <path d="M80 77 L78 83 L82 83" stroke="#d97706" stroke-width="1.2" fill="none" stroke-linecap="round" />
      <path d="M74 88 Q80 93 86 88" stroke="#b45309" stroke-width="1.6" fill="none" stroke-linecap="round" />
      <!-- White School Uniform (Kemeja Putih SD) -->
      <path d="M24 200 L36 122 L70 120 L80 135 L90 120 L124 122 L136 200 Z" fill="#ffffff" />
      <!-- Collar (Kerah Putih) -->
      <polygon points="80,128 58,114 74,112" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="0.8" />
      <polygon points="80,128 102,114 86,112" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="0.8" />
      <!-- Dasi Merah SD -->
      <polygon points="77,126 83,126 86,168 80,178 74,168" fill="#b91c1c" />
      <polygon points="76,124 84,124 82,132 78,132" fill="#991b1b" />
      <!-- Badge OSIS Merah Putih -->
      <rect x="42" y="148" width="14" height="12" rx="2" fill="#b91c1c" />
      <rect x="42" y="154" width="14" height="6" rx="1" fill="#ffffff" />
      `
        : isHijab
        ? `
      <!-- Girl: Jilbab/Kerudung Putih Sekolah -->
      <path d="M44 80 Q42 36 80 34 Q118 36 116 80 Q124 140 134 200 L26 200 Q36 140 44 80 Z" fill="#ffffff" />
      <!-- Jilbab Inner Contour -->
      <ellipse cx="80" cy="76" rx="24" ry="28" fill="#fef08a" />
      <!-- Forehead/Face -->
      <path d="M57 74 Q80 50 103 74 Q104 100 80 102 Q56 100 57 74 Z" fill="#fde68a" />
      <!-- Eyes -->
      <ellipse cx="71" cy="74" rx="2.5" ry="3" fill="#18181b" />
      <ellipse cx="89" cy="74" rx="2.5" ry="3" fill="#18181b" />
      <circle cx="72" cy="73" r="0.8" fill="#ffffff" />
      <circle cx="90" cy="73" r="0.8" fill="#ffffff" />
      <!-- Eyebrows -->
      <path d="M66 69 Q72 67 76 69" stroke="#18181b" stroke-width="1.8" fill="none" stroke-linecap="round" />
      <path d="M84 69 Q88 67 94 69" stroke="#18181b" stroke-width="1.8" fill="none" stroke-linecap="round" />
      <!-- Smile -->
      <path d="M74 88 Q80 93 86 88" stroke="#b45309" stroke-width="1.6" fill="none" stroke-linecap="round" />
      <!-- Jilbab folds -->
      <path d="M80 104 L80 170" stroke="#e4e4e7" stroke-width="1.5" />
      <path d="M68 116 Q80 130 92 116" stroke="#e4e4e7" stroke-width="1.2" fill="none" />
      <!-- Dasi Merah SD visible under hijab fold -->
      <polygon points="78,140 82,140 84,170 80,178 76,170" fill="#b91c1c" />
      `
        : `
      <!-- Girl: Neat Hair with Ponytail / Ribbon -->
      <path d="M44 80 Q40 32 80 30 Q120 32 116 80 Q100 60 80 60 Q60 60 44 80 Z" fill="#1c1917" />
      <!-- Hair Bob / Sides -->
      <path d="M46 70 Q42 110 52 115 Q56 95 56 80 Z" fill="#1c1917" />
      <path d="M114 70 Q118 110 108 115 Q104 95 104 80 Z" fill="#1c1917" />
      <!-- Head -->
      <ellipse cx="80" cy="74" rx="25" ry="29" fill="#fde68a" />
      <!-- Ears -->
      <ellipse cx="54" cy="76" rx="3.5" ry="6" fill="#fde68a" />
      <ellipse cx="106" cy="76" rx="3.5" ry="6" fill="#fde68a" />
      <!-- Hair Ribbon Red -->
      <circle cx="50" cy="50" r="5" fill="#ef4444" />
      <!-- Eyes -->
      <ellipse cx="71" cy="74" rx="2.5" ry="3" fill="#18181b" />
      <ellipse cx="89" cy="74" rx="2.5" ry="3" fill="#18181b" />
      <circle cx="72" cy="73" r="0.8" fill="#ffffff" />
      <circle cx="90" cy="73" r="0.8" fill="#ffffff" />
      <!-- Smile -->
      <path d="M74 88 Q80 93 86 88" stroke="#b45309" stroke-width="1.6" fill="none" stroke-linecap="round" />
      <!-- White School Uniform (Kemeja Putih SD) -->
      <path d="M24 200 L36 122 L70 120 L80 135 L90 120 L124 122 L136 200 Z" fill="#ffffff" />
      <!-- Collar -->
      <polygon points="80,128 58,114 74,112" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="0.8" />
      <polygon points="80,128 102,114 86,112" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="0.8" />
      <!-- Dasi Kupu / Dasi Merah -->
      <polygon points="77,126 83,126 86,168 80,178 74,168" fill="#b91c1c" />
      `
    }

    <!-- Official Stamp Mark watermark at bottom corner (optional authentic feel) -->
    <circle cx="132" cy="172" r="18" fill="none" stroke="#fef08a" stroke-width="1" stroke-dasharray="2,2" opacity="0.3" />
    <text x="132" y="174" font-size="5" font-family="sans-serif" font-weight="bold" fill="#fef08a" text-anchor="middle" opacity="0.4">SDN 006</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
