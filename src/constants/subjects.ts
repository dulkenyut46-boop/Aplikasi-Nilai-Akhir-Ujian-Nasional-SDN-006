import { SubjectInfo, SubjectKey, Student, SchoolProfile } from '../types';

export const SUBJECT_LIST: SubjectInfo[] = [
  { key: 'pab', name: 'Pendidikan Agama dan Budi Pekerti', code: 'PAB', kkm: 75 },
  { key: 'ppkn', name: 'Pendidikan Pancasila dan Kewarganegaraan', code: 'PPKn', kkm: 75 },
  { key: 'bin', name: 'Bahasa Indonesia', code: 'BIN', kkm: 72 },
  { key: 'mat', name: 'Matematika', code: 'MAT', kkm: 70 },
  { key: 'ipa', name: 'Ilmu Pengetahuan Alam', code: 'IPA', kkm: 72 },
  { key: 'ips', name: 'Ilmu Pengetahuan Sosial', code: 'IPS', kkm: 72 },
  { key: 'sbdp', name: 'Seni Budaya dan Prakarya', code: 'SBdP', kkm: 75 },
  { key: 'pjok', name: 'Pendidikan Jasmani, Olahraga & Kesehatan', code: 'PJOK', kkm: 75 },
  { key: 'mulok', name: 'Muatan Lokal (Bahasa Daerah)', code: 'MULOK', kkm: 75 },
  { key: 'bing', name: 'Bahasa Inggris', code: 'BING', kkm: 70 },
];

/**
 * Menghitung rata-rata nilai rapor (Semester 7 sampai Semester 12) untuk mata pelajaran tertentu
 */
export function calculateSubjectRaporAverage(student: Student, subject: SubjectKey): number {
  const s = student.rapor;
  const total = 
    (s.s7[subject] || 0) +
    (s.s8[subject] || 0) +
    (s.s9[subject] || 0) +
    (s.s10[subject] || 0) +
    (s.s11[subject] || 0) +
    (s.s12[subject] || 0);
  return Number((total / 6).toFixed(2));
}

/**
 * Menghitung rata-rata seluruh nilai rapor seorang siswa
 */
export function calculateOverallRaporAverage(
  student: Student,
  subjectList: SubjectInfo[] = SUBJECT_LIST
): number {
  if (!subjectList || subjectList.length === 0) return 0;
  let sum = 0;
  subjectList.forEach((sub) => {
    sum += calculateSubjectRaporAverage(student, sub.key);
  });
  return Number((sum / subjectList.length).toFixed(2));
}

/**
 * Menghitung Nilai Ujian Sekolah (US) untuk mata pelajaran tertentu
 */
export function calculateSubjectUSScore(student: Student, subject: SubjectKey): number {
  const detail = student.us[subject];
  if (!detail) return 0;
  if (detail.praktik !== undefined && detail.praktik !== null && detail.praktik > 0) {
    return Number(((detail.tulis * 0.5) + (detail.praktik * 0.5)).toFixed(2));
  }
  return detail.tulis || detail.akhir || 0;
}

/**
 * Menghitung Rata-rata Ujian Sekolah seluruh mapel
 */
export function calculateOverallUSAverage(
  student: Student,
  subjectList: SubjectInfo[] = SUBJECT_LIST
): number {
  if (!subjectList || subjectList.length === 0) return 0;
  let sum = 0;
  subjectList.forEach((sub) => {
    sum += calculateSubjectUSScore(student, sub.key);
  });
  return Number((sum / subjectList.length).toFixed(2));
}

/**
 * Menghitung Nilai Akhir (NA) per mata pelajaran
 * Bobot standar: 60% Rata-rata Rapor + 40% Nilai US
 */
export function calculateSubjectFinalScore(
  student: Student,
  subject: SubjectKey,
  school: SchoolProfile
): number {
  const raporAvg = calculateSubjectRaporAverage(student, subject);
  const usScore = calculateSubjectUSScore(student, subject);
  const weightRapor = school.bobotRapor || 60;
  const weightUS = school.bobotUS || 40;
  const finalScore = (raporAvg * weightRapor + usScore * weightUS) / 100;
  return Number(finalScore.toFixed(2));
}

/**
 * Menghitung Nilai Akhir (NA) keseluruhan siswa (rata-rata NA seluruh mapel)
 */
export function calculateStudentOverallFinalScore(
  student: Student,
  school: SchoolProfile,
  subjectList: SubjectInfo[] = SUBJECT_LIST
): number {
  if (!subjectList || subjectList.length === 0) return 0;
  let sum = 0;
  subjectList.forEach((sub) => {
    sum += calculateSubjectFinalScore(student, sub.key, school);
  });
  return Number((sum / subjectList.length).toFixed(2));
}

/**
 * Menghitung Total Skor Nilai Akhir Seluruh Mapel
 */
export function calculateStudentTotalFinalScore(
  student: Student,
  school: SchoolProfile,
  subjectList: SubjectInfo[] = SUBJECT_LIST
): number {
  let sum = 0;
  subjectList.forEach((sub) => {
    sum += calculateSubjectFinalScore(student, sub.key, school);
  });
  return Number(sum.toFixed(2));
}

/**
 * Konversi Nilai ke Predikat
 */
export function getGradePredicate(score: number): { grade: string; label: string; color: string } {
  if (score >= 90) return { grade: 'A', label: 'Sangat Baik', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' };
  if (score >= 80) return { grade: 'B', label: 'Baik', color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800' };
  if (score >= 70) return { grade: 'C', label: 'Cukup', color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' };
  return { grade: 'D', label: 'Kurang', color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800' };
}

/**
 * Konversi angka desimal ke teks terbilang dalam Bahasa Indonesia
 * Contoh: 86.75 -> Delapan puluh enam koma tujuh lima
 */
export function numberToWordsIndonesian(num: number): string {
  const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

  function intToWords(n: number): string {
    if (n < 12) return units[n];
    if (n < 20) return intToWords(n - 10) + ' belas';
    if (n < 100) return intToWords(Math.floor(n / 10)) + ' puluh' + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 200) return 'seratus' + (n % 100 !== 0 ? ' ' + intToWords(n % 100) : '');
    if (n < 1000) return units[Math.floor(n / 100)] + ' ratus' + (n % 100 !== 0 ? ' ' + intToWords(n % 100) : '');
    return n.toString();
  }

  const parts = num.toFixed(2).split('.');
  const intPart = parseInt(parts[0], 10);
  const decPart = parts[1];

  let result = intToWords(intPart);
  if (decPart && decPart !== '00') {
    result += ' koma';
    for (let i = 0; i < decPart.length; i++) {
      const d = parseInt(decPart[i], 10);
      result += ' ' + (d === 0 ? 'nol' : units[d]);
    }
  }

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}
