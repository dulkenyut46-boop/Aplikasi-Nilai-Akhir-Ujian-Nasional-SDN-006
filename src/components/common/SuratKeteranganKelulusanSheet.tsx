import React from 'react';
import { Student, SchoolProfile, SubjectInfo } from '../../types';
import { KopSurat } from './KopSurat';
import { calculateSubjectFinalScore } from '../../constants/subjects';
import {
  SKKelulusanState,
  DEFAULT_SK_KELULUSAN,
  getFontCssFamily,
  DocFontFamily,
  DocFontSize,
  DocLineSpacing,
} from '../exam-tools/graduationDocsState';

export interface SKLSubjectRow {
  no: number;
  name: string;
  score: number;
  scoreFormatted: string;
}

/**
 * Helper to compute the exact 9 standard subjects from the student's Rekap Nilai Akhir
 */
export function getStudentSKLSubjects(
  student: Student,
  school: SchoolProfile,
  subjects: SubjectInfo[] = []
): SKLSubjectRow[] {
  // Check student name/custom to determine religion subject (Islam vs Kristen)
  const isChristian = /SITINJAK|CRISTIAN|DANIEL|YOHANES|ESTER|MARIA|SIMANJUNTAK/i.test(
    student.nama
  );
  const agamaName = isChristian
    ? 'Pendidikan Agama Kristen'
    : 'Pendidikan Agama Islam';

  const formatScore = (num: number) => num.toFixed(2).replace('.', ',');

  // 1. Agama
  const scoreAgama = calculateSubjectFinalScore(student, 'pab', school);
  // 2. PPKn
  const scorePPKn = calculateSubjectFinalScore(student, 'ppkn', school);
  // 3. Bahasa Indonesia
  const scoreBin = calculateSubjectFinalScore(student, 'bin', school);
  // 4. Matematika
  const scoreMat = calculateSubjectFinalScore(student, 'mat', school);

  // 5. IPAS (Ilmu Pengetahuan Alam dan Sosial)
  let scoreIPAS = calculateSubjectFinalScore(student, 'ipa', school);
  if (subjects.some((s) => s.key === 'ips') && student.us['ips']) {
    const scoreIPS = calculateSubjectFinalScore(student, 'ips', school);
    scoreIPAS = Number(((scoreIPAS + scoreIPS) / 2).toFixed(2));
  }

  // 6. Seni Budaya (sbdp)
  const scoreSBdP = calculateSubjectFinalScore(student, 'sbdp', school);
  // 7. PJOK
  const scorePJOK = calculateSubjectFinalScore(student, 'pjok', school);
  // 8. Muatan Lokal / Budaya Melayu Riau (mulok)
  const scoreMulok = calculateSubjectFinalScore(student, 'mulok', school);
  // 9. Bahasa Inggris (bing)
  const scoreBing = calculateSubjectFinalScore(student, 'bing', school);

  return [
    { no: 1, name: agamaName, score: scoreAgama, scoreFormatted: formatScore(scoreAgama) },
    { no: 2, name: 'Pendidikan Pancasila dan Kewarganegaraan', score: scorePPKn, scoreFormatted: formatScore(scorePPKn) },
    { no: 3, name: 'Bahasa Indonesia', score: scoreBin, scoreFormatted: formatScore(scoreBin) },
    { no: 4, name: 'Matematika', score: scoreMat, scoreFormatted: formatScore(scoreMat) },
    { no: 5, name: 'Ilmu Pengetahuan Alam dan Sosial', score: scoreIPAS, scoreFormatted: formatScore(scoreIPAS) },
    { no: 6, name: 'Seni Budaya', score: scoreSBdP, scoreFormatted: formatScore(scoreSBdP) },
    { no: 7, name: 'Pendidikan Jasmani Olahraga dan Kesehatan', score: scorePJOK, scoreFormatted: formatScore(scorePJOK) },
    { no: 8, name: 'Muatan lokal / Budaya Melayu Riau', score: scoreMulok, scoreFormatted: formatScore(scoreMulok) },
    { no: 9, name: 'Bahasa Inggris', score: scoreBing, scoreFormatted: formatScore(scoreBing) },
  ];
}

/**
 * Generate standalone Microsoft Word (.doc) HTML content
 */
export function generateSKLWordHtml(
  student: Student,
  schoolProfile: SchoolProfile,
  subjects: SubjectInfo[],
  skState: SKKelulusanState = DEFAULT_SK_KELULUSAN
): string {
  const fontCss = getFontCssFamily(skState.fontFamily);
  const rows = getStudentSKLSubjects(student, schoolProfile, subjects);

  const tableRowsHtml = rows
    .map(
      (r) => `
    <tr>
      <td style="border: 1px solid black; padding: 3pt 6pt; text-align: center; width: 40px;">${r.no}</td>
      <td style="border: 1px solid black; padding: 3pt 8pt; text-align: left;">${r.name}</td>
      <td style="border: 1px solid black; padding: 3pt 6pt; text-align: center; width: 85px; font-weight: bold;">${r.scoreFormatted}</td>
    </tr>`
    )
    .join('');

  return `
    <div style="font-family: ${fontCss}; font-size: ${skState.fontSize}; line-height: ${skState.lineSpacing}; color: #000;">
      <!-- Kop Surat Resmi -->
      <div style="text-align: center; margin-bottom: 8pt;">
        <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KABUPATEN KUANTAN SINGINGI</h3>
        <h2 style="margin: 0; font-size: 15pt; font-weight: bold; text-transform: uppercase;">SEKOLAH DASAR NEGERI 006 SUNGAI BULUH</h2>
        <h3 style="margin: 0; font-size: 12pt; font-weight: bold; text-transform: uppercase;">KECAMATAN SINGINGI HILIR</h3>
        <p style="margin: 2pt 0; font-size: 9pt; text-indent: 0;">Alamat : Jln. Pendidikan No. 01 Desa Sungai Buluh , email : sdn006sungaibuluh@gmail.com, NPSN: 10403871</p>
        <div style="border-bottom: 3px double #000; margin-top: 5pt; margin-bottom: 12pt;"></div>
      </div>

      <!-- Judul Dokumen -->
      <div style="text-align: center; margin-bottom: 12pt;">
        <h2 style="margin: 0; font-size: 13.5pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; letter-spacing: 1px;">
          SURAT KETERANGAN KELULUSAN
        </h2>
        <p style="margin: 2pt 0 0 0; font-size: 11pt; font-weight: bold; text-indent: 0;">
          NO : ${skState.nomor || student.noSuratKelulusan || '422/SKL/SDN-006/SB/VI/ 2026/042'}
        </p>
      </div>

      <!-- Pembuka -->
      <p style="text-align: justify; margin: 0 0 8pt 0; text-indent: 0;">
        ${skState.pembukaText || 'Yang bertanda tangan dibawah ini Kepala SD Negeri 006 Sungai Buluh Kecamatan Singingi Hilir Kabupaten Kuantan Singingi Provinsi Riau menerangkan bahwa :'}
      </p>

      <!-- Biodata Siswa -->
      <table style="width: 100%; border: none; border-collapse: collapse; margin: 4pt 0 10pt 24pt;">
        <tr>
          <td style="width: 220px; border: none; padding: 2pt 0;">Nama Siswa</td>
          <td style="width: 15px; border: none; padding: 2pt 0;">:</td>
          <td style="border: none; padding: 2pt 0; font-weight: bold; text-transform: uppercase;">${student.nama}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2pt 0;">Tempat Tanggal Lahir</td>
          <td style="border: none; padding: 2pt 0;">:</td>
          <td style="border: none; padding: 2pt 0;">${student.tempatLahir} , ${student.tanggalLahir}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2pt 0;">Nama Orang Tua/Wali</td>
          <td style="border: none; padding: 2pt 0;">:</td>
          <td style="border: none; padding: 2pt 0; font-weight: bold; text-transform: uppercase;">${student.namaAyah || student.namaIbu || 'RADEN EDIRAN SITINJAK'}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2pt 0;">Nomor Induk Siswa Nasional</td>
          <td style="border: none; padding: 2pt 0;">:</td>
          <td style="border: none; padding: 2pt 0;">${student.nisn}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2pt 0;">Nomor Peserta Ujian Sekolah</td>
          <td style="border: none; padding: 2pt 0;">:</td>
          <td style="border: none; padding: 2pt 0;">${student.noPeserta}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2pt 0;">Tahun Pembelajaran</td>
          <td style="border: none; padding: 2pt 0;">:</td>
          <td style="border: none; padding: 2pt 0;">${skState.tahunPelajaran || schoolProfile.tahunPelajaran}</td>
        </tr>
      </table>

      <!-- Keputusan -->
      <p style="text-align: justify; margin: 0 0 6pt 0; text-indent: 0;">
        Berdasarkan Keputusan kepala sekolah SD Negeri 006 Sungai Buluh nomor :${skState.nomorSKPenetapan || '422/KPTS/SDN-006/SB/VI/2026/041'} tanggal ${skState.tanggalSKPenetapan || '02 Juni 2026'}, tentang Kelulusan Siswa Tahun Pelajaran ${skState.tahunPelajaran || schoolProfile.tahunPelajaran}, dinyatakan :
      </p>

      <!-- Status LULUS -->
      <div style="text-align: center; margin: 10pt 0; font-size: 15pt; font-weight: bold; letter-spacing: 4px;">
        L U L U S
      </div>

      <!-- Dasar Hukum -->
      <p style="text-align: justify; margin: 0 0 8pt 0; text-indent: 0;">
        ${skState.dasarHukumText || 'dari satuan Pendidikan sesuai dengan Permendikburistek Nomor 21 Tahun 2022 Standar Penilaian Pendidikan pada pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah, Permendikbudristek Nomor 5 Tahun 2022 tentang Standar Kompetensi Lulusan pada Pendidikan Anak Usia Dini,Jenjang Pendidikan Dasar dan Jenjang Pendidikan Menengah,dan Permendikbudristek Nomor 58 Tahun 2024 tentang Ijazah Jenjang Pendidikan Dasar dan Pendidikan Menengah, dengan nilai sebagai berikut :'}
      </p>

      <!-- Tabel Nilai -->
      <table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin: 6pt 0 12pt 0;">
        <thead>
          <tr style="background-color: #f5f5f5; font-weight: bold;">
            <th style="border: 1px solid black; padding: 4pt 6pt; text-align: center; width: 40px;">No</th>
            <th style="border: 1px solid black; padding: 4pt 8pt; text-align: left;">Mata Pelajaran</th>
            <th style="border: 1px solid black; padding: 4pt 6pt; text-align: center; width: 85px;">Nilai</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <!-- Penutup -->
      <p style="text-align: justify; margin: 0 0 16pt 0; text-indent: 0;">
        ${skState.penutupText || 'Demikian surat keterangan ini dibuat, dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.'}
      </p>

      <!-- Tanda Tangan -->
      <div style="margin-top: 14pt; float: right; width: 280px; text-align: left;">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="width: 95px; border: none; padding: 1pt 0;">Ditetapakan</td>
            <td style="width: 10px; border: none; padding: 1pt 0;">:</td>
            <td style="border: none; padding: 1pt 0;">${skState.tempatCetak || 'Sungai Buluh'}</td>
          </tr>
          <tr>
            <td style="border: none; padding: 1pt 0;">Pada Tanggal</td>
            <td style="border: none; padding: 1pt 0;">:</td>
            <td style="border: none; padding: 1pt 0;">${skState.tanggalCetak || '2 Juni 2026'}</td>
          </tr>
        </table>
        <p style="margin: 4pt 0 0 0; text-indent: 0;">Kepala SD Negeri 006 Sungai Buluh</p>
        <div style="height: 50pt;"></div>
        <p style="margin: 0; font-weight: bold; text-decoration: underline; text-indent: 0;">${schoolProfile.kepalaSekolah}</p>
        <p style="margin: 0; text-indent: 0;">NIP ${schoolProfile.nipKepalaSekolah}</p>
      </div>
      <div style="clear: both;"></div>
    </div>
  `;
}

interface Props {
  student: Student;
  schoolProfile: SchoolProfile;
  subjects: SubjectInfo[];
  skState?: SKKelulusanState;
  fontFamily?: DocFontFamily;
  fontSize?: DocFontSize;
  lineSpacing?: DocLineSpacing;
}

export const SuratKeteranganKelulusanSheet: React.FC<Props> = ({
  student,
  schoolProfile,
  subjects,
  skState = DEFAULT_SK_KELULUSAN,
  fontFamily,
  fontSize,
  lineSpacing,
}) => {
  const currentFont = fontFamily || skState.fontFamily || 'times';
  const currentSize = fontSize || skState.fontSize || '11pt';
  const currentSpacing = lineSpacing || skState.lineSpacing || '1.25';

  const rows = getStudentSKLSubjects(student, schoolProfile, subjects);

  return (
    <div
      className="w-full text-black leading-relaxed"
      style={{
        fontFamily: getFontCssFamily(currentFont),
        fontSize: currentSize,
        lineHeight: currentSpacing,
      }}
    >
      {/* 1. KOP SURAT RESMI */}
      <KopSurat schoolProfile={schoolProfile} />

      {/* 2. JUDUL DOKUMEN & NOMOR */}
      <div className="text-center pt-2 pb-2 space-y-0.5">
        <h2 className="text-sm sm:text-base font-bold tracking-wide uppercase underline underline-offset-4">
          SURAT KETERANGAN KELULUSAN
        </h2>
        <p className="text-xs sm:text-[13px] font-bold text-zinc-900 dark:text-zinc-900 pt-0.5">
          NO : {skState.nomor || student.noSuratKelulusan || '422/SKL/SDN-006/SB/VI/ 2026/042'}
        </p>
      </div>

      {/* 3. PARAGRAF PEMBUKA */}
      <div className="text-justify pt-1 pb-1">
        {skState.pembukaText ||
          'Yang bertanda tangan dibawah ini Kepala SD Negeri 006 Sungai Buluh Kecamatan Singingi Hilir Kabupaten Kuantan Singingi Provinsi Riau menerangkan bahwa :'}
      </div>

      {/* 4. TABEL BIODATA SISWA */}
      <div className="pl-6 sm:pl-10 py-1.5">
        <table className="w-full border-none border-collapse text-xs sm:text-[12.5px]">
          <tbody>
            <tr>
              <td className="w-48 sm:w-56 py-0.5 align-top">Nama Siswa</td>
              <td className="w-4 py-0.5 align-top">:</td>
              <td className="py-0.5 font-bold uppercase align-top">{student.nama}</td>
            </tr>
            <tr>
              <td className="py-0.5 align-top">Tempat Tanggal Lahir</td>
              <td className="py-0.5 align-top">:</td>
              <td className="py-0.5 align-top">
                {student.tempatLahir} , {student.tanggalLahir}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 align-top">Nama Orang Tua/Wali</td>
              <td className="py-0.5 align-top">:</td>
              <td className="py-0.5 font-bold uppercase align-top">
                {student.namaAyah || student.namaIbu || 'RADEN EDIRAN SITINJAK'}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 align-top">Nomor Induk Siswa Nasional</td>
              <td className="py-0.5 align-top">:</td>
              <td className="py-0.5 align-top">{student.nisn}</td>
            </tr>
            <tr>
              <td className="py-0.5 align-top">Nomor Peserta Ujian Sekolah</td>
              <td className="py-0.5 align-top">:</td>
              <td className="py-0.5 align-top">{student.noPeserta}</td>
            </tr>
            <tr>
              <td className="py-0.5 align-top">Tahun Pembelajaran</td>
              <td className="py-0.5 align-top">:</td>
              <td className="py-0.5 align-top">
                {skState.tahunPelajaran || schoolProfile.tahunPelajaran}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. PARAGRAF PERNYATAAN KEPUTUSAN */}
      <div className="text-justify pt-1.5 pb-1">
        Berdasarkan Keputusan kepala sekolah SD Negeri 006 Sungai Buluh nomor :
        {skState.nomorSKPenetapan || '422/KPTS/SDN-006/SB/VI/2026/041'} tanggal{' '}
        {skState.tanggalSKPenetapan || '02 Juni 2026'}, tentang Kelulusan Siswa Tahun Pelajaran{' '}
        {skState.tahunPelajaran || schoolProfile.tahunPelajaran}, dinyatakan :
      </div>

      {/* 6. STATUS KELULUSAN (LULUS) */}
      <div className="text-center py-2 sm:py-3 font-black text-base sm:text-lg tracking-[0.25em] uppercase">
        L U L U S
      </div>

      {/* 7. PARAGRAF DASAR HUKUM */}
      <div className="text-justify pb-2">
        {skState.dasarHukumText ||
          'dari satuan Pendidikan sesuai dengan Permendikburistek Nomor 21 Tahun 2022 Standar Penilaian Pendidikan pada pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah, Permendikbudristek Nomor 5 Tahun 2022 tentang Standar Kompetensi Lulusan pada Pendidikan Anak Usia Dini,Jenjang Pendidikan Dasar dan Jenjang Pendidikan Menengah,dan Permendikbudristek Nomor 58 Tahun 2024 tentang Ijazah Jenjang Pendidikan Dasar dan Pendidikan Menengah, dengan nilai sebagai berikut :'}
      </div>

      {/* 8. TABEL MATA PELAJARAN DAN NILAI AKHIR */}
      <div className="my-1">
        <table className="w-full text-left text-xs sm:text-[12.5px] border border-black border-collapse">
          <thead>
            <tr className="bg-zinc-100 font-bold border-b border-black">
              <th className="p-1 sm:p-1.5 w-10 text-center border-r border-black">No</th>
              <th className="p-1 sm:p-1.5 px-3 border-r border-black">Mata Pelajaran</th>
              <th className="p-1 sm:p-1.5 w-24 sm:w-28 text-center">Nilai</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.no} className="border-b border-black">
                <td className="p-1 sm:p-1.5 text-center border-r border-black font-medium">
                  {row.no}
                </td>
                <td className="p-1 sm:p-1.5 px-3 border-r border-black">{row.name}</td>
                <td className="p-1 sm:p-1.5 text-center font-bold">{row.scoreFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 9. PARAGRAF PENUTUP */}
      <div className="text-justify pt-2.5 pb-2">
        {skState.penutupText ||
          'Demikian surat keterangan ini dibuat, dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.'}
      </div>

      {/* 10. TANDA TANGAN KEPALA SEKOLAH */}
      <div className="flex justify-end pt-3 sm:pt-4 break-inside-avoid">
        <div className="text-left w-64 sm:w-72 text-xs sm:text-[12.5px] space-y-0.5">
          <div className="grid grid-cols-5">
            <span className="col-span-2">Ditetapakan</span>
            <span className="col-span-3">: {skState.tempatCetak || 'Sungai Buluh'}</span>
          </div>
          <div className="grid grid-cols-5">
            <span className="col-span-2">Pada Tanggal</span>
            <span className="col-span-3">: {skState.tanggalCetak || '2 Juni 2026'}</span>
          </div>
          <div className="pt-0.5 font-normal">Kepala SD Negeri 006 Sungai Buluh</div>
          <div className="h-16 sm:h-20"></div>
          <div className="font-bold underline uppercase tracking-wide">
            {schoolProfile.kepalaSekolah}
          </div>
          <div className="pt-0.5 text-black font-normal">
            NIP {schoolProfile.nipKepalaSekolah}
          </div>
        </div>
      </div>
    </div>
  );
};
