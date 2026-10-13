import React, { useState, useEffect } from 'react';
import {
  Mail,
  FileSignature,
  Printer,
  Edit3,
  Check,
  RotateCcw,
  Users,
  Copy,
  FileDown,
  AlignJustify,
  Type,
  FileText,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import { SchoolProfile, Student } from '../../types';
import { KopSurat } from '../common/KopSurat';
import {
  SUBJECT_LIST,
  calculateStudentTotalFinalScore,
  calculateStudentOverallFinalScore,
} from '../../constants/subjects';
import {
  GuruRapat,
  DEFAULT_GURU_RAPAT,
  UndanganDocState,
  DEFAULT_UNDANGAN,
  loadUndanganDocState,
  saveUndanganDocState,
  BeritaAcaraDocState,
  DEFAULT_BERITA_ACARA,
  loadBeritaAcaraDocState,
  saveBeritaAcaraDocState,
  SKKelulusanState,
  DEFAULT_SK_KELULUSAN,
  loadSKKelulusanState,
  saveSKKelulusanState,
  loadGuruRapatList,
  saveGuruRapatList,
  downloadAsWordDoc,
  formatSignatureDots,
  DocFontFamily,
  DocFontSize,
  DocLineSpacing,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  LINE_SPACING_OPTIONS,
  getFontCssFamily,
} from './graduationDocsState';
import { EditGuruRapatModal } from './EditGuruRapatModal';

export type GraduationDocType = 'undangan' | 'ba-kelulusan' | 'hadir-rapat' | 'sk-kelulusan' | 'semua';
export { DEFAULT_GURU_RAPAT as INITIAL_GURU_RAPAT };

interface Props {
  schoolProfile: SchoolProfile;
  students: Student[];
  initialDoc?: GraduationDocType;
  onOpenPrintPreview: (docType: GraduationDocType) => void;
  onActiveDocChange?: (docType: GraduationDocType) => void;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const GraduationDocsView: React.FC<Props> = ({
  schoolProfile,
  students,
  initialDoc = 'undangan',
  onOpenPrintPreview,
  onActiveDocChange,
  showToast,
}) => {
  const [activeDoc, setActiveDoc] = useState<GraduationDocType>(initialDoc);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditGuruModalOpen, setIsEditGuruModalOpen] = useState<boolean>(false);

  useEffect(() => {
    onActiveDocChange?.(activeDoc);
  }, [activeDoc, onActiveDocChange]);

  // 1. Undangan State (Loaded from localStorage)
  const [undanganState, setUndanganState] = useState<UndanganDocState>(loadUndanganDocState);

  // 2. Berita Acara State (Loaded from localStorage)
  const [baState, setBaState] = useState<BeritaAcaraDocState>(loadBeritaAcaraDocState);

  // 3. Daftar Hadir State (Loaded from localStorage)
  const [rapatHadirTanggal, setRapatHadirTanggal] = useState('Sungai Buluh, 30 Mei 2026');
  const [signatureMode, setSignatureMode] = useState<'manual' | 'digital'>('manual');
  const [guruList, setGuruList] = useState<GuruRapat[]>(loadGuruRapatList);

  // 4. SK Kelulusan State (Loaded from localStorage)
  const [skState, setSkState] = useState<SKKelulusanState>(loadSKKelulusanState);

  // Keep states in sync with localStorage
  useEffect(() => {
    if (initialDoc && initialDoc !== 'semua') {
      setActiveDoc(initialDoc);
    }
  }, [initialDoc]);

  useEffect(() => {
    saveUndanganDocState(undanganState);
  }, [undanganState]);

  useEffect(() => {
    saveBeritaAcaraDocState(baState);
  }, [baState]);

  useEffect(() => {
    saveGuruRapatList(guruList);
  }, [guruList]);

  useEffect(() => {
    saveSKKelulusanState(skState);
  }, [skState]);

  const handleUpdateGuruList = (newList: GuruRapat[]) => {
    setGuruList(newList);
    saveGuruRapatList(newList);
  };

  const handleUndanganFieldChange = (field: keyof UndanganDocState, value: any) => {
    setUndanganState((prev) => {
      const updated = { ...prev, [field]: value };
      saveUndanganDocState(updated);
      return updated;
    });
  };

  const handleBAFieldChange = (field: keyof BeritaAcaraDocState, value: any) => {
    setBaState((prev) => {
      const updated = { ...prev, [field]: value };
      saveBeritaAcaraDocState(updated);
      return updated;
    });
  };

  const handleSKFieldChange = (field: keyof SKKelulusanState, value: any) => {
    setSkState((prev) => {
      const updated = { ...prev, [field]: value };
      saveSKKelulusanState(updated);
      return updated;
    });
  };

  const resetToDefault = () => {
    setUndanganState(DEFAULT_UNDANGAN);
    saveUndanganDocState(DEFAULT_UNDANGAN);

    setBaState(DEFAULT_BERITA_ACARA);
    saveBeritaAcaraDocState(DEFAULT_BERITA_ACARA);

    setRapatHadirTanggal('Sungai Buluh, 30 Mei 2026');
    setGuruList(DEFAULT_GURU_RAPAT);
    saveGuruRapatList(DEFAULT_GURU_RAPAT);

    setSkState(DEFAULT_SK_KELULUSAN);
    saveSKKelulusanState(DEFAULT_SK_KELULUSAN);

    if (showToast) {
      showToast('Data Direset', 'Semua isian, jenis font, ukuran, dan spasi telah dikembalikan ke format baku Word.', 'info');
    }
  };

  // Unduh dokumen Undangan Rapat ke format Microsoft Word (.doc)
  const handleDownloadUndanganWord = () => {
    const wordContent = `
      <div style="text-align: center; font-family: ${getFontCssFamily(undanganState.fontFamily)};">
        <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KABUPATEN KUANTAN SINGINGI</h3>
        <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA</h3>
        <h2 style="margin: 0; font-size: 15pt; font-weight: bold; text-transform: uppercase;">SEKOLAH DASAR NEGERI 006 SUNGAI BULUH</h2>
        <p style="margin: 2pt 0; font-size: 9.5pt; text-indent: 0;">${schoolProfile.alamat} | NPSN: ${schoolProfile.npsn}</p>
        <div style="border-bottom: 3px double #000; margin-top: 6pt; margin-bottom: 12pt;"></div>
      </div>

      <div style="text-align: right; margin-bottom: 10pt; font-size: ${undanganState.fontSize};">
        ${undanganState.tempatSurat}, ${undanganState.tanggalSurat}
      </div>

      <table style="width: 100%; border: none; margin-bottom: 12pt; font-size: ${undanganState.fontSize};">
        <tr>
          <td style="width: 55%; vertical-align: top; border: none; padding: 0;">
            <table style="width: 100%; border: none;">
              <tr>
                <td style="width: 70px; border: none; padding: 1pt 0;">Nomor</td>
                <td style="width: 15px; border: none; padding: 1pt 0;">:</td>
                <td style="border: none; padding: 1pt 0; font-family: monospace; font-weight: bold;">${undanganState.nomor}</td>
              </tr>
              <tr>
                <td style="border: none; padding: 1pt 0;">Sifat</td>
                <td style="border: none; padding: 1pt 0;">:</td>
                <td style="border: none; padding: 1pt 0;">${undanganState.sifat}</td>
              </tr>
              <tr>
                <td style="border: none; padding: 1pt 0;">Lampiran</td>
                <td style="border: none; padding: 1pt 0;">:</td>
                <td style="border: none; padding: 1pt 0;">${undanganState.lampiran}</td>
              </tr>
              <tr>
                <td style="border: none; padding: 1pt 0;">Hal</td>
                <td style="border: none; padding: 1pt 0;">:</td>
                <td style="border: none; padding: 1pt 0; font-weight: bold;">${undanganState.hal}</td>
              </tr>
            </table>
          </td>
          <td style="width: 45%; vertical-align: top; border: none; padding: 0 0 0 20pt;">
            <p style="margin: 0; text-indent: 0;">Kepada Yth :</p>
            <p style="margin: 2pt 0; font-weight: bold; text-indent: 0;">${undanganState.tujuan}</p>
            <p style="margin: 0; text-indent: 0;">${schoolProfile.namaSekolah}</p>
            <p style="margin: 0; text-indent: 0;">${undanganState.tempatTujuan}</p>
          </td>
        </tr>
      </table>

      <div style="margin-top: 14pt; margin-bottom: 8pt; font-size: ${undanganState.fontSize};">
        <p style="margin: 0; text-indent: 0;"><i>${undanganState.salamPembuka}</i></p>
      </div>

      <div style="text-align: justify; font-size: ${undanganState.fontSize}; line-height: ${undanganState.lineSpacing}; margin-bottom: 10pt;">
        <p style="margin: 0 0 8pt 0; text-indent: 1.25cm;">
          ${undanganState.paragrafPengantar}
        </p>
      </div>

      <div style="margin-left: 1.25cm; margin-bottom: 10pt; font-size: ${undanganState.fontSize};">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="width: 130px; border: none; padding: 2pt 0;">Hari / Tanggal</td>
            <td style="width: 15px; border: none; padding: 2pt 0;">:</td>
            <td style="border: none; padding: 2pt 0; font-weight: bold;">${undanganState.hariTanggal}</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2pt 0;">Waktu / Pukul</td>
            <td style="border: none; padding: 2pt 0;">:</td>
            <td style="border: none; padding: 2pt 0;">${undanganState.jam}</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2pt 0;">Tempat</td>
            <td style="border: none; padding: 2pt 0;">:</td>
            <td style="border: none; padding: 2pt 0;">${undanganState.tempat}</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">Acara</td>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">:</td>
            <td style="border: none; padding: 2pt 0; font-weight: bold; vertical-align: top;">${undanganState.acara}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: justify; font-size: ${undanganState.fontSize}; line-height: ${undanganState.lineSpacing}; margin-bottom: 18pt;">
        <p style="margin: 0; text-indent: 1.25cm;">
          ${undanganState.paragrafPenutup}
        </p>
      </div>

      <div style="margin-top: 24pt; float: right; width: 280px; text-align: left; font-size: ${undanganState.fontSize};">
        <p style="margin: 0; text-indent: 0;">Kepala Sekolah,</p>
        <div style="height: 55pt;"></div>
        <p style="margin: 0; font-weight: bold; text-decoration: underline; text-transform: uppercase; text-indent: 0;">${schoolProfile.kepalaSekolah}</p>
        <p style="margin: 0; text-indent: 0;">NIP. ${schoolProfile.nipKepalaSekolah}</p>
      </div>
      <div style="clear: both;"></div>

      ${
        undanganState.showTembusan && undanganState.tembusan.length > 0
          ? `
      <div style="margin-top: 20pt; font-size: 10pt; line-height: 1.3;">
        <p style="margin: 0; font-weight: bold; text-indent: 0;">Tembusan Yth :</p>
        <ol style="margin: 2pt 0 0 16pt; padding: 0;">
          ${undanganState.tembusan.map((t) => `<li>${t}</li>`).join('')}
        </ol>
      </div>`
          : ''
      }
    `;

    downloadAsWordDoc(
      wordContent,
      `Undangan_Rapat_Kelulusan_SDN006_${schoolProfile.tahunPelajaran.replace(/\//g, '_')}`,
      {
        fontFamily: undanganState.fontFamily,
        fontSize: undanganState.fontSize,
        lineSpacing: undanganState.lineSpacing,
      }
    );

    if (showToast) {
      showToast('Unduh Word Berhasil', 'Surat Undangan Rapat telah diekspor ke Microsoft Word (.doc).', 'success');
    }
  };

  // Unduh Berita Acara ke format Microsoft Word (.doc)
  const handleDownloadBeritaAcaraWord = () => {
    const wordContent = `
      ${
        baState.showKop
          ? `
      <div style="text-align: center; font-family: ${getFontCssFamily(baState.fontFamily)};">
        <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KABUPATEN KUANTAN SINGINGI</h3>
        <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA</h3>
        <h2 style="margin: 0; font-size: 15pt; font-weight: bold; text-transform: uppercase;">SEKOLAH DASAR NEGERI 006 SUNGAI BULUH</h2>
        <p style="margin: 2pt 0; font-size: 9.5pt; text-indent: 0;">${schoolProfile.alamat} | NPSN: ${schoolProfile.npsn}</p>
        <div style="border-bottom: 3px double #000; margin-top: 6pt; margin-bottom: 14pt;"></div>
      </div>`
          : ''
      }

      <div style="text-align: center; margin-bottom: 16pt; font-family: ${getFontCssFamily(baState.fontFamily)};">
        <h2 style="margin: 0; font-size: 14pt; font-weight: bold; letter-spacing: 1.5px; text-decoration: underline; text-transform: uppercase;">
          ${baState.judul}
        </h2>
        <h3 style="margin: 3pt 0 0 0; font-size: 11pt; font-weight: bold; text-transform: uppercase;">
          ${baState.subJudul.replace(/\n/g, '<br/>')}
        </h3>
        <p style="margin: 4pt 0 0 0; font-size: 11pt; font-family: monospace; font-weight: bold; text-indent: 0;">
          Nomor : ${baState.nomor}
        </p>
      </div>

      <div style="text-align: justify; font-size: ${baState.fontSize}; line-height: ${baState.lineSpacing}; margin-bottom: 10pt;">
        <p style="margin: 0 0 10pt 0; text-indent: 1.25cm;">
          ${baState.paragrafPembuka}
        </p>
      </div>

      <div style="margin-left: 1.25cm; margin-bottom: 12pt; font-size: ${baState.fontSize}; line-height: ${baState.lineSpacing};">
        <p style="margin: 0 0 4pt 0; text-indent: 0; font-weight: bold;">
          Berdasarkan hasil musyawarah dan evaluasi menyeluruh terhadap seluruh kriteria kelulusan, rapat menetapkan keputusan sebagai berikut:
        </p>
        <table style="width: 100%; border: none; margin: 4pt 0;">
          <tr>
            <td style="width: 30px; border: none; padding: 2pt 0; vertical-align: top;">1.</td>
            <td style="width: 340px; border: none; padding: 2pt 0; vertical-align: top;">Jumlah Peserta Didik Kelas VI Terdaftar</td>
            <td style="width: 15px; border: none; padding: 2pt 0; vertical-align: top;">:</td>
            <td style="border: none; padding: 2pt 0; font-weight: bold; vertical-align: top;">${baState.totalPeserta} (delapan puluh) orang</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">2.</td>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">Jumlah Peserta Didik Mengikuti Ujian Sekolah</td>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">:</td>
            <td style="border: none; padding: 2pt 0; font-weight: bold; vertical-align: top;">${baState.totalPeserta} (delapan puluh) orang</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">3.</td>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">Jumlah Peserta Didik Dinyatakan LULUS</td>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">:</td>
            <td style="border: none; padding: 2pt 0; font-weight: bold; color: #000; vertical-align: top;">${baState.pesertaLulus} (delapan puluh) orang (100%)</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">4.</td>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">Jumlah Peserta Didik TIDAK LULUS</td>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">:</td>
            <td style="border: none; padding: 2pt 0; font-weight: bold; vertical-align: top;">${baState.pesertaTidakLulus} (nol) orang (0%)</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2pt 0; vertical-align: top;">5.</td>
            <td colspan="3" style="border: none; padding: 2pt 0; vertical-align: top;">
              Daftar nama-nama peserta didik yang dinyatakan LULUS tercantum dalam lampiran yang merupakan satu kesatuan tidak terpisahkan dari Berita Acara ini.
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: justify; font-size: ${baState.fontSize}; line-height: ${baState.lineSpacing}; margin-bottom: 22pt;">
        <p style="margin: 0; text-indent: 1.25cm;">
          ${baState.paragrafPenutup}
        </p>
      </div>

      <table style="width: 100%; border: none; font-size: ${baState.fontSize}; margin-top: 20pt;">
        <tr>
          <td style="width: 50%; vertical-align: top; border: none; padding: 0; text-align: left;">
            ${
              baState.showNotulis
                ? `
            <p style="margin: 0; text-indent: 0;">Notulis / Sekretaris Rapat,</p>
            <div style="height: 55pt;"></div>
            <p style="margin: 0; font-weight: bold; text-decoration: underline; text-transform: uppercase; text-indent: 0;">${baState.namaNotulis}</p>
            <p style="margin: 0; text-indent: 0;">NIP. ${baState.nipNotulis}</p>
            `
                : ''
            }
          </td>
          <td style="width: 50%; vertical-align: top; border: none; padding: 0; text-align: left;">
            <p style="margin: 0; text-indent: 0;">Dibuat di : ${baState.dibuatDi}</p>
            <p style="margin: 0; text-indent: 0;">Pada tanggal : ${baState.padaTanggal}</p>
            <p style="margin: 4pt 0 0 0; font-weight: bold; text-indent: 0;">Kepala SD Negeri 006 Sungai Buluh,</p>
            <div style="height: 50pt;"></div>
            <p style="margin: 0; font-weight: bold; text-decoration: underline; text-transform: uppercase; text-indent: 0;">${schoolProfile.kepalaSekolah}</p>
            <p style="margin: 0; text-indent: 0;">NIP. ${schoolProfile.nipKepalaSekolah}</p>
          </td>
        </tr>
      </table>
    `;

    downloadAsWordDoc(
      wordContent,
      `Berita_Acara_Kelulusan_SDN006_${schoolProfile.tahunPelajaran.replace(/\//g, '_')}`,
      {
        fontFamily: baState.fontFamily,
        fontSize: baState.fontSize,
        lineSpacing: baState.lineSpacing,
      }
    );

    if (showToast) {
      showToast('Unduh Word Berhasil', 'Naskah Berita Acara Rapat telah diekspor ke Microsoft Word (.doc).', 'success');
    }
  };

  // Unduh dokumen SK ke format Microsoft Word (.doc)
  const handleDownloadSKWord = () => {
    const wordContent = `
      <div style="text-align: center; font-family: ${getFontCssFamily(skState.fontFamily)};">
        <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KABUPATEN KUANTAN SINGINGI</h3>
        <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA</h3>
        <h2 style="margin: 0; font-size: 15pt; font-weight: bold; text-transform: uppercase;">SEKOLAH DASAR NEGERI 006 SUNGAI BULUH</h2>
        <p style="margin: 2pt 0; font-size: 9.5pt; text-indent: 0;">${schoolProfile.alamat} | NPSN: ${schoolProfile.npsn}</p>
        <div style="border-bottom: 3px double #000; margin-top: 6pt; margin-bottom: 14pt;"></div>
      </div>

      <div style="text-align: center; margin-bottom: 14pt; font-family: ${getFontCssFamily(skState.fontFamily)};">
        <p style="margin: 0; font-weight: bold; letter-spacing: 2px; text-indent: 0;">K E P U T U S A N</p>
        <p style="margin: 0; font-weight: bold; text-transform: uppercase; text-indent: 0;">KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH</p>
        <p style="margin: 0; font-weight: bold; font-family: monospace; text-indent: 0;">NOMOR : ${skState.nomor}</p>
        <p style="margin: 6pt 0 0 0; font-weight: bold; text-indent: 0;">T E N T A N G</p>
        <p style="margin: 0; font-weight: bold; text-transform: uppercase; text-indent: 0;">${skState.tentang}</p>
        <p style="margin: 10pt 0 0 0; font-weight: bold; text-indent: 0;">DENGAN RAHMAT TUHAN YANG MAHA ESA</p>
        <p style="margin: 0; font-weight: bold; text-transform: uppercase; text-indent: 0;">KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH,</p>
      </div>

      <table style="width: 100%; border: none; font-size: ${skState.fontSize}; line-height: ${skState.lineSpacing}; margin-bottom: 12pt;">
        <tr>
          <td style="width: 120px; vertical-align: top; font-weight: bold; border: none; padding: 2pt 0;">Menimbang</td>
          <td style="width: 15px; vertical-align: top; font-weight: bold; border: none; padding: 2pt 0;">:</td>
          <td style="vertical-align: top; text-align: justify; border: none; padding: 2pt 0;">
            <p style="margin: 0 0 4pt 0; text-indent: 0;">a. ${skState.menimbangA}</p>
            <p style="margin: 0 0 4pt 0; text-indent: 0;">b. ${skState.menimbangB}</p>
            <p style="margin: 0; text-indent: 0;">c. ${skState.menimbangC}</p>
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 6pt;">Mengingat</td>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 6pt;">:</td>
          <td style="vertical-align: top; text-align: justify; border: none; padding-top: 6pt;">
            <p style="margin: 0 0 4pt 0; text-indent: 0;">1. ${skState.mengingat1}</p>
            <p style="margin: 0 0 4pt 0; text-indent: 0;">2. ${skState.mengingat2}</p>
            <p style="margin: 0 0 4pt 0; text-indent: 0;">3. ${skState.mengingat3}</p>
            <p style="margin: 0; text-indent: 0;">4. ${skState.mengingat4}</p>
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 6pt;">Memperhatikan</td>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 6pt;">:</td>
          <td style="vertical-align: top; text-align: justify; border: none; padding-top: 6pt;">
            <p style="margin: 0 0 4pt 0; text-indent: 0;">1. ${skState.memperhatikan1}</p>
            <p style="margin: 0; text-indent: 0;">2. ${skState.memperhatikan2}</p>
          </td>
        </tr>
      </table>

      <div style="text-align: center; font-weight: bold; margin: 12pt 0; letter-spacing: 2px;">
        M E M U T U S K A N :
      </div>

      <table style="width: 100%; border: none; font-size: ${skState.fontSize}; line-height: ${skState.lineSpacing};">
        <tr>
          <td style="width: 120px; vertical-align: top; font-weight: bold; border: none;">Menetapkan</td>
          <td style="width: 15px; vertical-align: top; font-weight: bold; border: none;">:</td>
          <td style="vertical-align: top; font-weight: bold; text-transform: uppercase; border: none;">
            KEPUTUSAN KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH TENTANG ${skState.tentang}.
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 4pt;">KESATU</td>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 4pt;">:</td>
          <td style="vertical-align: top; text-align: justify; border: none; padding-top: 4pt;">
            ${skState.diktumKesatu}
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 4pt;">KEDUA</td>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 4pt;">:</td>
          <td style="vertical-align: top; text-align: justify; border: none; padding-top: 4pt;">
            ${skState.diktumKedua}
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 4pt;">KETIGA</td>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 4pt;">:</td>
          <td style="vertical-align: top; text-align: justify; border: none; padding-top: 4pt;">
            ${skState.diktumKetiga}
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 4pt;">KEEMPAT</td>
          <td style="vertical-align: top; font-weight: bold; border: none; padding-top: 4pt;">:</td>
          <td style="vertical-align: top; text-align: justify; border: none; padding-top: 4pt;">
            ${skState.diktumKeempat}
          </td>
        </tr>
      </table>

      <div style="margin-top: 24pt; float: right; width: 280px; text-align: left; font-size: ${skState.fontSize};">
        <p style="margin: 0; text-indent: 0;">Ditetapkan di : ${skState.ditetapkanDi}</p>
        <p style="margin: 0; text-indent: 0;">Pada tanggal  : ${skState.padaTanggal}</p>
        <p style="margin: 6pt 0 0 0; font-weight: bold; text-indent: 0;">Kepala SD Negeri 006 Sungai Buluh,</p>
        <div style="height: 55pt;"></div>
        <p style="margin: 0; font-weight: bold; text-decoration: underline; text-transform: uppercase; text-indent: 0;">${schoolProfile.kepalaSekolah}</p>
        <p style="margin: 0; text-indent: 0;">NIP. ${schoolProfile.nipKepalaSekolah}</p>
      </div>
      <div style="clear: both;"></div>

      ${
        skState.showTembusan
          ? `
      <div style="margin-top: 20pt; font-size: 10pt; line-height: 1.3;">
        <p style="margin: 0; font-weight: bold; text-indent: 0;">Tembusan disampaikan kepada Yth :</p>
        <ol style="margin: 2pt 0 0 16pt; padding: 0;">
          <li>Kepala Dinas Pendidikan Kepemudaan dan Olahraga Kab. Kuantan Singingi;</li>
          <li>Koordinator Wilayah Bidang Pendidikan Kec. Singingi Hilir;</li>
          <li>Ketua Komite SD Negeri 006 Sungai Buluh;</li>
          <li>Yang bersangkutan untuk diketahui;</li>
          <li>Arsip Sekolah.</li>
        </ol>
      </div>`
          : ''
      }
    `;

    downloadAsWordDoc(
      wordContent,
      `SK_Kelulusan_SDN006_${schoolProfile.tahunPelajaran.replace(/\//g, '_')}`,
      {
        fontFamily: skState.fontFamily,
        fontSize: skState.fontSize,
        lineSpacing: skState.lineSpacing,
      }
    );

    if (showToast) {
      showToast('Unduh Word Berhasil', 'Dokumen SK Kelulusan telah diekspor ke Microsoft Word (.doc).', 'success');
    }
  };

  // Unduh Daftar Hadir Rapat ke Word
  const handleDownloadHadirWord = () => {
    const tableRows = guruList
      .map(
        (g, idx) => `
      <tr>
        <td style="text-align: center; font-weight: bold; width: 35px;">${g.no}</td>
        <td style="font-weight: bold; text-transform: uppercase;">${g.nama}</td>
        <td>${g.jabatan}</td>
        <td style="width: 170px; padding: 3pt 6pt;">
          <table style="width: 100%; border: none; border-collapse: collapse; margin: 0; padding: 0;">
            <tr>
              <td style="border: none; width: 50%; padding: 0; text-align: left; font-family: 'Courier New', Courier, monospace; font-size: 10pt; font-weight: bold;">
                ${idx % 2 === 0 ? formatSignatureDots(idx + 1) : ''}
              </td>
              <td style="border: none; width: 50%; padding: 0 0 0 6pt; text-align: left; font-family: 'Courier New', Courier, monospace; font-size: 10pt; font-weight: bold;">
                ${idx % 2 !== 0 ? formatSignatureDots(idx + 1) : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
      )
      .join('');

    const wordContent = `
      <div style="text-align: center; font-family: 'Times New Roman', serif;">
        <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">PEMERINTAH KABUPATEN KUANTAN SINGINGI</h3>
        <h3 style="margin: 0; font-size: 13pt; font-weight: bold; text-transform: uppercase;">DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA</h3>
        <h2 style="margin: 0; font-size: 15pt; font-weight: bold; text-transform: uppercase;">SEKOLAH DASAR NEGERI 006 SUNGAI BULUH</h2>
        <p style="margin: 2pt 0; font-size: 9.5pt; text-indent: 0;">${schoolProfile.alamat} | NPSN: ${schoolProfile.npsn}</p>
        <div style="border-bottom: 3px double #000; margin-top: 6pt; margin-bottom: 14pt;"></div>
      </div>

      <div style="text-align: center; margin-bottom: 12pt; font-family: 'Times New Roman', serif;">
        <h3 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase; text-decoration: underline;">DAFTAR HADIR RAPAT KELULUSAN</h3>
        <h4 style="margin: 2pt 0; font-size: 12pt; font-weight: bold; text-transform: uppercase;">DEWAN GURU & TENAGA KEPENDIDIKAN</h4>
        <h4 style="margin: 0; font-size: 12pt; font-weight: bold; text-transform: uppercase;">SD NEGERI 006 SUNGAI BULUH</h4>
        <p style="margin: 2pt 0; font-size: 11pt; text-indent: 0;">TAHUN PELAJARAN ${schoolProfile.tahunPelajaran}</p>
      </div>

      <p style="font-size: 10pt; margin-bottom: 6pt; text-indent: 0;">
        <b>Hari / Tanggal:</b> Sabtu, 30 Mei 2026 &nbsp;|&nbsp; <b>Pukul:</b> 11.00 WIB &nbsp;|&nbsp; <b>Tempat:</b> SDN 006 Sungai Buluh
      </p>

      <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
        <thead>
          <tr style="background-color: #f2f2f2; font-weight: bold;">
            <th style="width: 35px; text-align: center; border: 1px solid black;">NO</th>
            <th style="min-width: 180px; text-align: left; border: 1px solid black;">NAMA LENGKAP</th>
            <th style="width: 160px; text-align: left; border: 1px solid black;">JABATAN</th>
            <th style="width: 170px; text-align: center; border: 1px solid black;">TANDA TANGAN</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div style="margin-top: 24pt; float: right; width: 260px; text-align: center; font-size: 11pt;">
        <p style="margin: 0; text-indent: 0;">Sungai Buluh, 30 Mei 2026</p>
        <p style="margin: 2pt 0 0 0; font-weight: bold; text-indent: 0;">Kepala SDN 006 Sungai Buluh,</p>
        <div style="height: 50pt;"></div>
        <p style="margin: 0; font-weight: bold; text-decoration: underline; text-transform: uppercase; text-indent: 0;">${schoolProfile.kepalaSekolah}</p>
        <p style="margin: 0; text-indent: 0;">NIP. ${schoolProfile.nipKepalaSekolah}</p>
      </div>
      <div style="clear: both;"></div>
    `;

    downloadAsWordDoc(wordContent, `Daftar_Hadir_Rapat_Kelulusan_SDN006`);
    if (showToast) {
      showToast('Unduh Word Berhasil', 'Daftar hadir rapat telah diekspor ke Microsoft Word (.doc).', 'success');
    }
  };

  const handleCopyText = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    if (showToast) {
      showToast('Teks Disalin', `Isi naskah ${title} berhasil disalin ke clipboard.`, 'success');
    }
  };

  // Helper active typography based on document
  const currentFontFamily: DocFontFamily =
    activeDoc === 'undangan'
      ? undanganState.fontFamily
      : activeDoc === 'ba-kelulusan'
      ? baState.fontFamily
      : activeDoc === 'sk-kelulusan'
      ? skState.fontFamily
      : 'times';

  const currentFontSize: DocFontSize =
    activeDoc === 'undangan'
      ? undanganState.fontSize
      : activeDoc === 'ba-kelulusan'
      ? baState.fontSize
      : activeDoc === 'sk-kelulusan'
      ? skState.fontSize
      : '12pt';

  const currentLineSpacing: DocLineSpacing =
    activeDoc === 'undangan'
      ? undanganState.lineSpacing
      : activeDoc === 'ba-kelulusan'
      ? baState.lineSpacing
      : activeDoc === 'sk-kelulusan'
      ? skState.lineSpacing
      : '1.35';

  const handleToolbarFontChange = (font: DocFontFamily) => {
    if (activeDoc === 'undangan') handleUndanganFieldChange('fontFamily', font);
    else if (activeDoc === 'ba-kelulusan') handleBAFieldChange('fontFamily', font);
    else if (activeDoc === 'sk-kelulusan') handleSKFieldChange('fontFamily', font);
  };

  const handleToolbarFontSizeChange = (size: DocFontSize) => {
    if (activeDoc === 'undangan') handleUndanganFieldChange('fontSize', size);
    else if (activeDoc === 'ba-kelulusan') handleBAFieldChange('fontSize', size);
    else if (activeDoc === 'sk-kelulusan') handleSKFieldChange('fontSize', size);
  };

  const handleToolbarLineSpacingChange = (spacing: DocLineSpacing) => {
    if (activeDoc === 'undangan') handleUndanganFieldChange('lineSpacing', spacing);
    else if (activeDoc === 'ba-kelulusan') handleBAFieldChange('lineSpacing', spacing);
    else if (activeDoc === 'sk-kelulusan') handleSKFieldChange('lineSpacing', spacing);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Kelulusan */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-3xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-teal-50/50 to-white p-5 shadow-xs dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-zinc-900 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
              <FileSignature className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                Administrasi Undangan & Dokumen Kelulusan Kelas 6
                <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
                  Format Baku Word & Cetak A4
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Surat undangan rapat dan naskah dokumen kelulusan peserta didik kelas 6 SDN 006 Sungai Buluh
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Unduh Word berdasarkan tab aktif */}
          {activeDoc === 'undangan' && (
            <button
              type="button"
              onClick={handleDownloadUndanganWord}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 shadow-xs hover:bg-blue-100 dark:bg-blue-950/50 dark:border-blue-700 dark:text-blue-200 transition-all"
              title="Unduh Surat Undangan format Microsoft Word (.doc)"
            >
              <FileDown className="h-4 w-4 text-blue-700" />
              Unduh Word Undangan
            </button>
          )}

          {activeDoc === 'ba-kelulusan' && (
            <button
              type="button"
              onClick={handleDownloadBeritaAcaraWord}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 shadow-xs hover:bg-blue-100 dark:bg-blue-950/50 dark:border-blue-700 dark:text-blue-200 transition-all"
              title="Unduh Berita Acara format Microsoft Word (.doc)"
            >
              <FileDown className="h-4 w-4 text-blue-700" />
              Unduh Word Berita Acara
            </button>
          )}

          {activeDoc === 'hadir-rapat' && (
            <button
              type="button"
              onClick={() => setIsEditGuruModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-800 shadow-xs hover:bg-emerald-100 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-200 transition-all"
            >
              <Users className="h-4 w-4 text-emerald-700" />
              Menu Edit Nama Guru ({guruList.length})
            </button>
          )}

          {activeDoc === 'sk-kelulusan' && (
            <button
              type="button"
              onClick={handleDownloadSKWord}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 shadow-xs hover:bg-blue-100 dark:bg-blue-950/50 dark:border-blue-700 dark:text-blue-200 transition-all"
              title="Unduh SK format Microsoft Word (.doc)"
            >
              <FileDown className="h-4 w-4 text-blue-700" />
              Unduh Word SK (.doc)
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
              isEditing
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
            }`}
          >
            {isEditing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4 text-emerald-600" />}
            {isEditing ? 'Selesai Menyunting' : 'Sunting Data Dokumen'}
          </button>

          <button
            type="button"
            onClick={resetToDefault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
            title="Kembalikan isian ke format resmi asli"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Default
          </button>

          <button
            type="button"
            onClick={() => onOpenPrintPreview(activeDoc)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 active:scale-95 transition-all"
            title="Buka pratinjau lembar kertas A4 siap cetak dengan kop surat resmi"
          >
            <Printer className="h-4 w-4" />
            Cetak Dokumen Terpilih ({
              activeDoc === 'undangan'
                ? 'Hal. 1: Undangan'
                : activeDoc === 'ba-kelulusan'
                ? 'Hal. 2: Berita Acara'
                : activeDoc === 'hadir-rapat'
                ? 'Hal. 3: Daftar Hadir'
                : 'Hal. 4: SK Kelulusan'
            })
          </button>
        </div>
      </div>

      {/* Navigasi Lembar Kerja (GraduationDocsView): 4 kartu dokumen berurutan dalam grid 4 kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 print:hidden">
        {[
          {
            key: 'undangan',
            title: 'Undangan Rapat',
            subtitle: 'Surat Undangan Guru & Tendik',
            icon: Mail,
            pageBadge: 'Hal. 1',
            docNumber: 1,
          },
          {
            key: 'ba-kelulusan',
            title: 'Berita Acara',
            subtitle: 'Musyawarah & Keputusan Kelulusan',
            icon: FileSignature,
            pageBadge: 'Hal. 2',
            docNumber: 2,
          },
          {
            key: 'hadir-rapat',
            title: 'Daftar Hadir Rapat',
            subtitle: 'Presensi Dewan Guru & Tendik',
            icon: Users,
            pageBadge: 'Hal. 3',
            docNumber: 3,
          },
          {
            key: 'sk-kelulusan',
            title: 'SK Kelulusan',
            subtitle: 'Surat Keputusan Kepala Sekolah',
            icon: Scale,
            pageBadge: 'Hal. 4',
            docNumber: 4,
          },
        ].map((doc) => {
          const isActive = activeDoc === doc.key;
          const Icon = doc.icon;
          return (
            <div
              key={doc.key}
              onClick={() => {
                setActiveDoc(doc.key as GraduationDocType);
                onActiveDocChange?.(doc.key as GraduationDocType);
              }}
              role="button"
              tabIndex={0}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'border-emerald-600 bg-emerald-50/90 shadow-md ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:border-emerald-500'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                    Kop Surat ✓
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                      isActive
                        ? 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {doc.pageBadge}
                  </span>
                </div>
              </div>
              <div>
                <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  {doc.title}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  {doc.subtitle}
                </div>
                {/* Searchable accessible text for exact matching */}
                <span className="sr-only">{`${doc.title} (${doc.subtitle})`}</span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 font-medium">Format Resmi A4</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDoc(doc.key as GraduationDocType);
                    onOpenPrintPreview(doc.key as GraduationDocType);
                  }}
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 hover:underline"
                  title={`Cetak ${doc.title} dengan Kop Surat`}
                >
                  <Printer className="h-3 w-3" />
                  Cetak Dokumen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Panel bila Mode Sunting Aktif */}
      {isEditing && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50/70 p-5 dark:border-amber-900/60 dark:bg-amber-950/20 space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                Panel Kustomisasi Dokumen ({activeDoc.toUpperCase()})
              </h4>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
              Perubahan langsung tampil pada naskah dokumen di bawah
            </span>
          </div>

          {/* Sunting Dokumen 1: Undangan */}
          {activeDoc === 'undangan' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nomor Surat Undangan
                  </label>
                  <input
                    type="text"
                    value={undanganState.nomor}
                    onChange={(e) => handleUndanganFieldChange('nomor', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Sifat Surat
                  </label>
                  <input
                    type="text"
                    value={undanganState.sifat}
                    onChange={(e) => handleUndanganFieldChange('sifat', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Hal / Perihal
                  </label>
                  <input
                    type="text"
                    value={undanganState.hal}
                    onChange={(e) => handleUndanganFieldChange('hal', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tujuan Surat (Kepada Yth)
                  </label>
                  <input
                    type="text"
                    value={undanganState.tujuan}
                    onChange={(e) => handleUndanganFieldChange('tujuan', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tempat Tujuan (di - ...)
                  </label>
                  <input
                    type="text"
                    value={undanganState.tempatTujuan}
                    onChange={(e) => handleUndanganFieldChange('tempatTujuan', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tanggal Surat
                  </label>
                  <input
                    type="text"
                    value={undanganState.tanggalSurat}
                    onChange={(e) => handleUndanganFieldChange('tanggalSurat', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Hari / Tanggal Rapat
                  </label>
                  <input
                    type="text"
                    value={undanganState.hariTanggal}
                    onChange={(e) => handleUndanganFieldChange('hariTanggal', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Jam Pelaksanaan
                  </label>
                  <input
                    type="text"
                    value={undanganState.jam}
                    onChange={(e) => handleUndanganFieldChange('jam', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tempat Rapat
                  </label>
                  <input
                    type="text"
                    value={undanganState.tempat}
                    onChange={(e) => handleUndanganFieldChange('tempat', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Agenda Acara Rapat
                </label>
                <input
                  type="text"
                  value={undanganState.acara}
                  onChange={(e) => handleUndanganFieldChange('acara', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Paragraf Pengantar
                </label>
                <textarea
                  rows={2}
                  value={undanganState.paragrafPengantar}
                  onChange={(e) => handleUndanganFieldChange('paragrafPengantar', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Paragraf Penutup
                </label>
                <textarea
                  rows={2}
                  value={undanganState.paragrafPenutup}
                  onChange={(e) => handleUndanganFieldChange('paragrafPenutup', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={undanganState.showTembusan}
                    onChange={(e) => handleUndanganFieldChange('showTembusan', e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Tampilkan Tembusan Surat di Bagian Bawah
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Sunting Dokumen 2: Berita Acara */}
          {activeDoc === 'ba-kelulusan' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nomor Berita Acara
                  </label>
                  <input
                    type="text"
                    value={baState.nomor}
                    onChange={(e) => handleBAFieldChange('nomor', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Judul Naskah
                  </label>
                  <input
                    type="text"
                    value={baState.judul}
                    onChange={(e) => handleBAFieldChange('judul', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Hari & Tanggal Rapat (Terbilang Resmi Word)
                  </label>
                  <input
                    type="text"
                    value={baState.hariTanggalTerbilang}
                    onChange={(e) => handleBAFieldChange('hariTanggalTerbilang', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tahun Pelajaran (Terbilang)
                  </label>
                  <input
                    type="text"
                    value={baState.tahunPelajaranTeks}
                    onChange={(e) => handleBAFieldChange('tahunPelajaranTeks', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tempat Rapat Musyawarah
                </label>
                <input
                  type="text"
                  value={baState.tempat}
                  onChange={(e) => handleBAFieldChange('tempat', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Paragraf Pembuka
                </label>
                <textarea
                  rows={2}
                  value={baState.paragrafPembuka}
                  onChange={(e) => handleBAFieldChange('paragrafPembuka', e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Total Peserta Didik
                  </label>
                  <input
                    type="number"
                    value={baState.totalPeserta}
                    onChange={(e) => handleBAFieldChange('totalPeserta', Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Peserta Lulus (Orang)
                  </label>
                  <input
                    type="number"
                    value={baState.pesertaLulus}
                    onChange={(e) => handleBAFieldChange('pesertaLulus', Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Peserta Tidak Lulus
                  </label>
                  <input
                    type="number"
                    value={baState.pesertaTidakLulus}
                    onChange={(e) => handleBAFieldChange('pesertaTidakLulus', Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Dibuat di
                  </label>
                  <input
                    type="text"
                    value={baState.dibuatDi}
                    onChange={(e) => handleBAFieldChange('dibuatDi', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Pada Tanggal
                  </label>
                  <input
                    type="text"
                    value={baState.padaTanggal}
                    onChange={(e) => handleBAFieldChange('padaTanggal', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Notulis / Sekretaris
                  </label>
                  <input
                    type="text"
                    value={baState.namaNotulis}
                    onChange={(e) => handleBAFieldChange('namaNotulis', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    NIP Notulis
                  </label>
                  <input
                    type="text"
                    value={baState.nipNotulis}
                    onChange={(e) => handleBAFieldChange('nipNotulis', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={baState.showKop}
                    onChange={(e) => handleBAFieldChange('showKop', e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Sertakan Kop Surat SDN 006 di Bagian Atas
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={baState.showNotulis}
                    onChange={(e) => handleBAFieldChange('showNotulis', e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Tampilkan Kolom Tanda Tangan Notulis (Format 2 Kolom Kedinasan)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Sunting Dokumen 3: Hadir Rapat */}
          {activeDoc === 'hadir-rapat' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">Titimangsa Tanggal:</span>
                  <input
                    type="text"
                    value={rapatHadirTanggal}
                    onChange={(e) => setRapatHadirTanggal(e.target.value)}
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditGuruModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    Buka Menu Edit Nama Guru ({guruList.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadHadirWord}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition-colors"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Unduh Format Word
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sunting Dokumen 4: SK Kelulusan */}
          {activeDoc === 'sk-kelulusan' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nomor Surat Keputusan (SK)
                  </label>
                  <input
                    type="text"
                    value={skState.nomor}
                    onChange={(e) => handleSKFieldChange('nomor', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tentang / Judul Penetapan
                  </label>
                  <input
                    type="text"
                    value={skState.tentang}
                    onChange={(e) => handleSKFieldChange('tentang', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Menimbang (Butir a)
                  </label>
                  <textarea
                    rows={2}
                    value={skState.menimbangA}
                    onChange={(e) => handleSKFieldChange('menimbangA', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Menimbang (Butir b)
                  </label>
                  <textarea
                    rows={2}
                    value={skState.menimbangB}
                    onChange={(e) => handleSKFieldChange('menimbangB', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Diktum KESATU
                  </label>
                  <textarea
                    rows={2}
                    value={skState.diktumKesatu}
                    onChange={(e) => handleSKFieldChange('diktumKesatu', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Diktum KEDUA
                  </label>
                  <textarea
                    rows={2}
                    value={skState.diktumKedua}
                    onChange={(e) => handleSKFieldChange('diktumKedua', e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skState.showTembusan}
                    onChange={(e) => handleSKFieldChange('showTembusan', e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Tampilkan Tembusan Surat (Dinas, Korwil, Komite, Arsip)
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skState.showLampiran}
                    onChange={(e) => handleSKFieldChange('showLampiran', e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Sertakan Lampiran Tabel 80 Siswa Lulus di Bawah SK
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kontrol Toolbar Word Khusus Dokumen yang Aktif */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-200/90 dark:bg-zinc-800/90 px-4 py-2.5 rounded-2xl text-xs border border-zinc-300 dark:border-zinc-700 shadow-xs print:hidden">
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
          <AlignJustify className="h-4 w-4 text-emerald-600" />
          <span>
            {activeDoc === 'undangan' && 'Naskah Surat Undangan Rapat (Format Baku Microsoft Word)'}
            {activeDoc === 'ba-kelulusan' && 'Naskah Berita Acara Kelulusan (Format Baku Microsoft Word)'}
            {activeDoc === 'hadir-rapat' && `Lembar Presensi Rapat Kelulusan (${guruList.length} Peserta Rapat)`}
            {activeDoc === 'sk-kelulusan' && 'Naskah SK Penetapan Kelulusan (Format Baku Microsoft Word)'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Kontrol Jenis Font, Ukuran Font, dan Pilihan Ukuran Spasi untuk Undangan, BA, dan SK */}
          {['undangan', 'ba-kelulusan', 'sk-kelulusan'].includes(activeDoc) && (
            <div className="flex flex-wrap items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-2xs">
              {/* Pilihan Jenis Font */}
              <div className="flex items-center gap-1 px-2 py-0.5">
                <Type className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-zinc-500 font-bold text-[11px]">Font:</span>
                <select
                  value={currentFontFamily}
                  onChange={(e) => handleToolbarFontChange(e.target.value as DocFontFamily)}
                  className="bg-transparent font-bold text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer pr-1"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></div>

              {/* Pilihan Ukuran Font */}
              <div className="flex items-center gap-1 px-2 py-0.5">
                <span className="text-zinc-500 font-bold text-[11px]">Ukuran:</span>
                <select
                  value={currentFontSize}
                  onChange={(e) => handleToolbarFontSizeChange(e.target.value as DocFontSize)}
                  className="bg-transparent font-bold text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer pr-1"
                >
                  {FONT_SIZE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></div>

              {/* Pilihan Ukuran Spasi */}
              <div className="flex items-center gap-1 px-2 py-0.5">
                <span className="text-zinc-500 font-bold text-[11px]">Spasi:</span>
                <select
                  value={currentLineSpacing}
                  onChange={(e) => handleToolbarLineSpacingChange(e.target.value as DocLineSpacing)}
                  className="bg-transparent font-bold text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer pr-1"
                >
                  {LINE_SPACING_OPTIONS.map((sp) => (
                    <option key={sp.value} value={sp.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {sp.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeDoc === 'undangan' && (
            <button
              type="button"
              onClick={handleDownloadUndanganWord}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
              title="Unduh surat undangan ke format file Word (.doc)"
            >
              <FileDown className="h-3.5 w-3.5" />
              Unduh Word
            </button>
          )}

          {activeDoc === 'ba-kelulusan' && (
            <button
              type="button"
              onClick={handleDownloadBeritaAcaraWord}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
              title="Unduh berita acara ke format file Word (.doc)"
            >
              <FileDown className="h-3.5 w-3.5" />
              Unduh Word
            </button>
          )}

          {activeDoc === 'hadir-rapat' && (
            <>
              <button
                type="button"
                onClick={() => setIsEditGuruModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-800 transition-all active:scale-95"
              >
                <Users className="h-3.5 w-3.5" />
                Edit Nama ({guruList.length})
              </button>

              <div className="flex items-center rounded-xl bg-white dark:bg-zinc-900 p-0.5 border border-zinc-300 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setSignatureMode('manual')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    signatureMode === 'manual'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  Zig-Zag (Manual)
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMode('digital')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    signatureMode === 'digital'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  Paraf Terisi (Digital)
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadHadirWord}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
                title="Unduh daftar hadir ke Word (.doc)"
              >
                <FileDown className="h-3.5 w-3.5" />
                Unduh Word
              </button>
            </>
          )}

          {activeDoc === 'sk-kelulusan' && (
            <button
              type="button"
              onClick={handleDownloadSKWord}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
              title="Unduh file naskah SK format Microsoft Word (.doc)"
            >
              <FileDown className="h-3.5 w-3.5" />
              Unduh Word (.doc)
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenPrintPreview(activeDoc)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3.5 py-1.5 font-bold shadow-xs hover:opacity-90 transition-all active:scale-95"
            title="Cetak dokumen terpilih lengkap dengan kop surat resmi"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />
            Cetak Dokumen Terpilih
          </button>
        </div>
      </div>

      {/* Lembar Tampilan Dokumen Kertas A4 (Mirip Microsoft Word Canvas) */}
      <div className="rounded-3xl border border-zinc-300 bg-zinc-200/70 p-4 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col items-center print:border-none print:p-0 print:bg-white print:m-0 print:shadow-none">
        {/* Word Ruler Bar Simulation for All Word-style Documents */}
        {['undangan', 'ba-kelulusan', 'sk-kelulusan'].includes(activeDoc) && (
          <div className="w-full max-w-[210mm] bg-zinc-100 border border-zinc-300 border-b-0 rounded-t-xl px-6 py-2 flex items-center justify-between text-[10px] font-mono text-zinc-600 select-none shadow-xs print:hidden">
            <span className="flex items-center gap-1.5 font-sans font-bold text-zinc-800">
              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block"></span>
              Microsoft Word Print Layout • Standar A4 (21,0 cm × 29,7 cm)
              <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-mono text-blue-800 font-bold">
                {currentFontFamily.toUpperCase()} • {currentFontSize} • SPASI {currentLineSpacing}
              </span>
            </span>
            <div className="hidden sm:flex items-center gap-3">
              <span>Margin Kiri: 2,5 cm</span>
              <span>•</span>
              <span>Indent Alinea: 1,25 cm</span>
              <span>•</span>
              <span>Margin Kanan: 2,5 cm</span>
            </div>
          </div>
        )}

        <div
          className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 sm:p-14 shadow-2xl border border-zinc-300 transition-all print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:text-black"
          style={{
            fontFamily: getFontCssFamily(currentFontFamily),
            fontSize: currentFontSize,
            lineHeight: currentLineSpacing,
          }}
        >
          {/* ========================================================
              DOKUMEN 1: SURAT UNDANGAN RAPAT KELULUSAN
             ======================================================== */}
          {activeDoc === 'undangan' && (
            <div className="space-y-4 text-black">
              {/* Kop Surat Resmi */}
              <KopSurat schoolProfile={schoolProfile} />

              {/* Titimangsa Kanan */}
              <div className="text-right pt-2 pb-1">
                {undanganState.tempatSurat}, {undanganState.tanggalSurat}
              </div>

              {/* Data Nomor, Sifat, Lamp, Hal & Yth (Format 2 Kolom Baku Word) */}
              <div className="grid grid-cols-12 gap-y-1 items-start">
                <div className="col-span-7 space-y-1">
                  <div className="grid grid-cols-6">
                    <span className="col-span-2">Nomor</span>
                    <span className="col-span-4 font-mono font-bold">: {undanganState.nomor}</span>
                  </div>
                  <div className="grid grid-cols-6">
                    <span className="col-span-2">Sifat</span>
                    <span className="col-span-4">: {undanganState.sifat}</span>
                  </div>
                  <div className="grid grid-cols-6">
                    <span className="col-span-2">Lampiran</span>
                    <span className="col-span-4">: {undanganState.lampiran}</span>
                  </div>
                  <div className="grid grid-cols-6">
                    <span className="col-span-2">Hal</span>
                    <span className="col-span-4 font-bold">: {undanganState.hal}</span>
                  </div>
                </div>
                <div className="col-span-5 pl-4 space-y-1">
                  <div>Kepada Yth :</div>
                  <div className="font-bold">{undanganState.tujuan}</div>
                  <div>{schoolProfile.namaSekolah}</div>
                  <div>{undanganState.tempatTujuan}</div>
                </div>
              </div>

              {/* Salam Pembuka */}
              <div className="pt-4 italic">
                {undanganState.salamPembuka}
              </div>

              {/* Paragraf Isi Pengantar (Format Word: Indent Alinea 1.25cm + Rata Kiri-Kanan) */}
              <div className="text-justify" style={{ textIndent: '1.25cm' }}>
                {undanganState.paragrafPengantar}
              </div>

              {/* Jadwal Pelaksanaan (Format Word Tabulasi Rapi dengan Titik Dua Sejajar) */}
              <div className="pl-10 space-y-1.5 py-1">
                <div className="grid grid-cols-12">
                  <span className="col-span-3">Hari / Tanggal</span>
                  <span className="col-span-9 font-bold">: {undanganState.hariTanggal}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-3">Waktu / Pukul</span>
                  <span className="col-span-9">: {undanganState.jam}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-3">Tempat</span>
                  <span className="col-span-9">: {undanganState.tempat}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-3">Acara</span>
                  <span className="col-span-9 font-bold">: {undanganState.acara}</span>
                </div>
              </div>

              {/* Penutup Surat (Format Word: Indent Alinea 1.25cm + Rata Kiri-Kanan) */}
              <div className="text-justify pt-2" style={{ textIndent: '1.25cm' }}>
                {undanganState.paragrafPenutup}
              </div>

              {/* Tanda Tangan Kepala Sekolah (Format Word: Rata Kanan Bawah) */}
              <div className="flex justify-end pt-10 break-inside-avoid">
                <div className="text-left w-64 space-y-1">
                  <div>Kepala Sekolah,</div>
                  <div className="h-20"></div>
                  <div className="font-bold underline uppercase tracking-wide">
                    {schoolProfile.kepalaSekolah}
                  </div>
                  <div className="pt-0.5 text-zinc-900 tracking-normal font-normal">
                    NIP. {schoolProfile.nipKepalaSekolah}
                  </div>
                </div>
              </div>

              {/* Tembusan Surat Bila Diaktifkan */}
              {undanganState.showTembusan && (
                <div className="pt-8 border-t border-zinc-300 mt-8 text-[11px] break-inside-avoid">
                  <div className="font-bold mb-1">Tembusan disampaikan kepada Yth :</div>
                  <ol className="list-decimal pl-5 space-y-0.5 text-zinc-800">
                    {undanganState.tembusan.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              DOKUMEN 2: BERITA ACARA PENGUMUMAN KELULUSAN
             ======================================================== */}
          {activeDoc === 'ba-kelulusan' && (
            <div className="space-y-5 text-black">
              {/* Kop Surat Resmi */}
              <KopSurat schoolProfile={schoolProfile} />

              {/* Judul Dokumen (Format Baku Microsoft Word: Tengah, Huruf Kapital, Bergaris Bawah) */}
              <div className="text-center pt-2 pb-2 space-y-1 leading-snug">
                <h2 className="text-base sm:text-lg font-black tracking-widest uppercase underline underline-offset-4">
                  {baState.judul}
                </h2>
                <h3 className="text-xs sm:text-sm font-extrabold uppercase">
                  {baState.subJudul.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx === 0 && <br />}
                    </React.Fragment>
                  ))}
                </h3>
                <p className="text-xs font-mono font-bold pt-1">
                  Nomor : {baState.nomor}
                </p>
              </div>

              {/* Paragraf Pembuka (Format Word: Indent Alinea 1.25cm + Rata Kiri-Kanan) */}
              <div className="text-justify" style={{ textIndent: '1.25cm' }}>
                Pada hari ini, <b>{baState.hariTanggalTerbilang}</b>, bertempat di <b>{baState.tempat}</b>, telah diselenggarakan Rapat Musyawarah Dewan Guru yang dipimpin langsung oleh Kepala Sekolah dan dihadiri oleh seluruh Dewan Guru serta Tenaga Kependidikan untuk menentukan kelulusan peserta didik kelas VI (enam) Tahun Pelajaran {baState.tahunPelajaranTeks}.
              </div>

              {/* Hasil Keputusan Musyawarah (Format Butir Berangka Rapi seperti Word) */}
              <div className="space-y-2 text-justify pl-6">
                <p className="font-bold">
                  Berdasarkan hasil musyawarah dan evaluasi menyeluruh terhadap kriteria kelulusan peserta didik, rapat memutuskan dan menetapkan hasil sebagai berikut:
                </p>
                <div className="pl-4 space-y-1.5">
                  <div className="grid grid-cols-12">
                    <span className="col-span-1 font-bold">1.</span>
                    <span className="col-span-7">Jumlah Peserta Didik Kelas VI Terdaftar</span>
                    <span className="col-span-4 font-bold">: {baState.totalPeserta} (delapan puluh) orang</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-1 font-bold">2.</span>
                    <span className="col-span-7">Jumlah Peserta Didik Mengikuti Ujian Sekolah</span>
                    <span className="col-span-4 font-bold">: {baState.totalPeserta} (delapan puluh) orang</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-1 font-bold">3.</span>
                    <span className="col-span-7">Jumlah Peserta Didik Dinyatakan LULUS</span>
                    <span className="col-span-4 font-black text-emerald-900">: {baState.pesertaLulus} (delapan puluh) orang (100%)</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-1 font-bold">4.</span>
                    <span className="col-span-7">Jumlah Peserta Didik Dinyatakan TIDAK LULUS</span>
                    <span className="col-span-4 font-bold">: {baState.pesertaTidakLulus} (nol) orang (0%)</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-1 font-bold">5.</span>
                    <span className="col-span-11">
                      Daftar nama-nama peserta didik yang dinyatakan LULUS tercantum dalam lampiran yang merupakan satu kesatuan tidak terpisahkan dari Berita Acara ini.
                    </span>
                  </div>
                </div>
              </div>

              {/* Paragraf Penutup (Format Word: Indent Alinea 1.25cm + Rata Kiri-Kanan) */}
              <div className="text-justify pt-1" style={{ textIndent: '1.25cm' }}>
                {baState.paragrafPenutup}
              </div>

              {/* Pengesahan Tanda Tangan (Format Word 2 Kolom Kedinasan) */}
              <div className="grid grid-cols-2 pt-10 break-inside-avoid">
                {/* Kolom Kiri: Notulis / Sekretaris */}
                <div>
                  {baState.showNotulis && (
                    <div className="text-left w-64 space-y-1">
                      <div>Notulis / Sekretaris Rapat,</div>
                      <div className="h-20"></div>
                      <div className="font-bold underline uppercase">{baState.namaNotulis}</div>
                      <div className="pt-0.5 text-zinc-900 tracking-normal font-normal">NIP. {baState.nipNotulis}</div>
                    </div>
                  )}
                </div>

                {/* Kolom Kanan: Titimangsa & Kepala Sekolah */}
                <div className="flex justify-end">
                  <div className="text-left w-64 space-y-1">
                    <div>Dibuat di : {baState.dibuatDi}</div>
                    <div>Pada Tanggal : {baState.padaTanggal}</div>
                    <div className="pt-1 font-bold">Kepala SD Negeri 006 Sungai Buluh,</div>
                    <div className="h-16"></div>
                    <div className="font-bold underline uppercase tracking-wide">
                      {schoolProfile.kepalaSekolah}
                    </div>
                    <div className="pt-0.5 text-zinc-900 tracking-normal font-normal">
                      NIP. {schoolProfile.nipKepalaSekolah}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              DOKUMEN 3: DAFTAR HADIR RAPAT KELULUSAN (RAPAT DEWAN GURU)
             ======================================================== */}
          {activeDoc === 'hadir-rapat' && (
            <div className="space-y-4 text-xs font-sans text-black">
              {/* Kop Surat Resmi */}
              <KopSurat schoolProfile={schoolProfile} />

              {/* Header Dokumen Rapat Resmi */}
              <div className="text-center pb-2 space-y-1 border-b border-black pb-2 pt-1">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wide underline underline-offset-4 text-black">
                  DAFTAR HADIR RAPAT KELULUSAN KELAS VI
                </h3>
                <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-900">
                  DEWAN GURU & TENAGA KEPENDIDIKAN SD NEGERI 006 SUNGAI BULUH
                </h4>
                <p className="text-xs font-bold text-zinc-700">
                  TAHUN PELAJARAN {schoolProfile.tahunPelajaran}
                </p>
              </div>

              {/* Rincian Rapat Singkat */}
              <div className="grid grid-cols-12 text-[11px] font-medium py-1 px-1 gap-y-1 border-b border-zinc-300 pb-2">
                <div className="col-span-6 space-y-0.5">
                  <div>Hari / Tanggal : <b>Sabtu, 30 Mei 2026</b></div>
                  <div>Waktu / Pukul : <b>11.00 WIB s.d. Selesai</b></div>
                </div>
                <div className="col-span-6 space-y-0.5 text-right">
                  <div>Tempat : <b>Ruang Guru SDN 006 Sungai Buluh</b></div>
                  <div>Jumlah Hadir : <b>{guruList.length} Orang (Lengkap)</b></div>
                </div>
              </div>

              {/* Tabel Daftar Hadir Resmi dengan Format Zig-Zag Kedinasan Word */}
              <table className="w-full text-left text-xs border border-black border-collapse">
                <thead>
                  <tr className="border-b-2 border-black font-bold text-center bg-zinc-100">
                    <th className="p-2 w-12 border-r border-black">NO</th>
                    <th className="p-2 border-r border-black text-left">NAMA LENGKAP & GELAR</th>
                    <th className="p-2 w-[28%] border-r border-black text-left">JABATAN</th>
                    <th className="p-2 w-[32%] text-center">TANDA TANGAN</th>
                  </tr>
                </thead>
                <tbody>
                  {guruList.map((g, idx) => {
                    const isOdd = (idx + 1) % 2 !== 0;
                    return (
                      <tr key={g.id || g.no} className="border-b border-black h-8 break-inside-avoid">
                        <td className="p-1.5 text-center font-bold border-r border-black">{idx + 1}.</td>
                        <td className="p-1.5 border-r border-black font-bold uppercase">{g.nama}</td>
                        <td className="p-1.5 border-r border-black text-zinc-800">{g.jabatan}</td>
                        <td className="p-1.5 align-middle overflow-hidden">
                          {signatureMode === 'manual' ? (
                            <div className="grid grid-cols-2 gap-1 items-center h-full px-1 overflow-hidden">
                              <div className="text-left overflow-hidden whitespace-nowrap">
                                {isOdd && (
                                  <span className="font-mono text-[11px] font-bold text-zinc-800">
                                    {formatSignatureDots(idx + 1)}
                                  </span>
                                )}
                              </div>
                              <div className="text-left overflow-hidden whitespace-nowrap pl-1.5">
                                {!isOdd && (
                                  <span className="font-mono text-[11px] font-bold text-zinc-800">
                                    {formatSignatureDots(idx + 1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1 items-center h-full px-1 overflow-hidden">
                              <div className="text-left overflow-hidden whitespace-nowrap">
                                {isOdd && (
                                  <span className="text-[11px] italic font-serif text-emerald-900 inline-block truncate">
                                    ✍️ {g.nama.split(',')[0].replace(/(S\.Pd|M\.Pd|S\.Kom|S\.E|I\.)/g, '').trim()}
                                  </span>
                                )}
                              </div>
                              <div className="text-left overflow-hidden whitespace-nowrap pl-1.5">
                                {!isOdd && (
                                  <span className="text-[11px] italic font-serif text-emerald-900 inline-block truncate">
                                    ✍️ {g.nama.split(',')[0].replace(/(S\.Pd|M\.Pd|S\.Kom|S\.E|I\.)/g, '').trim()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pengesahan Titimangsa */}
              <div className="flex justify-between pt-6 break-inside-avoid text-xs">
                <div className="text-left w-56 space-y-1">
                  <div>Notulis / Sekretaris Rapat,</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline uppercase">BUDI SANTOSO, S.Pd.SD</div>
                  <div className="pt-0.5 text-zinc-900 tracking-normal font-normal">NIP. 19851210 200903 1 005</div>
                </div>
                <div className="text-center w-64 space-y-1">
                  <div>{rapatHadirTanggal}</div>
                  <div className="font-bold">Kepala SDN 006 Sungai Buluh</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                  <div className="pt-0.5 text-zinc-900 tracking-normal font-normal">NIP. {schoolProfile.nipKepalaSekolah}</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              DOKUMEN 4: SK KELULUSAN KEPALA SEKOLAH (FORMAT KETIKAN WORD)
             ======================================================== */}
          {activeDoc === 'sk-kelulusan' && (
            <div className="space-y-4 text-black">
              {/* Kop Surat Resmi Word dengan Garis Ganda */}
              <KopSurat schoolProfile={schoolProfile} />

              {/* Judul Keputusan (Word Style Centered & Spaced) */}
              <div className="text-center pt-1 pb-3 space-y-0.5 leading-snug">
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-widest">
                  K E P U T U S A N
                </h3>
                <h4 className="text-xs sm:text-sm font-bold uppercase">
                  KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH
                </h4>
                <p className="text-xs font-mono font-bold">
                  NOMOR : {skState.nomor}
                </p>
                <div className="pt-2">
                  <p className="text-xs font-bold uppercase tracking-widest">T E N T A N G</p>
                  <p className="text-xs sm:text-sm font-bold uppercase max-w-xl mx-auto">
                    {skState.tentang}
                  </p>
                </div>
                <div className="pt-2">
                  <p className="text-xs font-bold uppercase tracking-wide">
                    DENGAN RAHMAT TUHAN YANG MAHA ESA
                  </p>
                  <p className="text-xs font-bold uppercase">
                    KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH,
                  </p>
                </div>
              </div>

              {/* Naskah Konsideran (Menimbang, Mengingat, Memperhatikan) Tabulasi Word */}
              <div className="space-y-3 leading-relaxed text-justify">
                {/* 1. Menimbang */}
                <div className="flex items-start">
                  <div className="w-28 sm:w-32 shrink-0 font-bold">Menimbang</div>
                  <div className="w-4 shrink-0 font-bold">:</div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">a.</span>
                      <span className="flex-1">{skState.menimbangA}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">b.</span>
                      <span className="flex-1">{skState.menimbangB}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">c.</span>
                      <span className="flex-1">{skState.menimbangC}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Mengingat */}
                <div className="flex items-start">
                  <div className="w-28 sm:w-32 shrink-0 font-bold">Mengingat</div>
                  <div className="w-4 shrink-0 font-bold">:</div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">1.</span>
                      <span className="flex-1">{skState.mengingat1}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">2.</span>
                      <span className="flex-1">{skState.mengingat2}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">3.</span>
                      <span className="flex-1">{skState.mengingat3}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">4.</span>
                      <span className="flex-1">{skState.mengingat4}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Memperhatikan */}
                <div className="flex items-start">
                  <div className="w-28 sm:w-32 shrink-0 font-bold">Memperhatikan</div>
                  <div className="w-4 shrink-0 font-bold">:</div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">1.</span>
                      <span className="flex-1">{skState.memperhatikan1}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-5 shrink-0">2.</span>
                      <span className="flex-1">{skState.memperhatikan2}</span>
                    </div>
                  </div>
                </div>

                {/* Diktum MEMUTUSKAN */}
                <div className="text-center font-bold pt-2 pb-1 tracking-widest text-xs sm:text-sm">
                  M E M U T U S K A N :
                </div>

                {/* Diktum Menetapkan */}
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="w-28 sm:w-32 shrink-0 font-bold">Menetapkan</div>
                    <div className="w-4 shrink-0 font-bold">:</div>
                    <div className="flex-1 font-bold uppercase">
                      KEPUTUSAN KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH TENTANG {skState.tentang}.
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-28 sm:w-32 shrink-0 font-bold">KESATU</div>
                    <div className="w-4 shrink-0 font-bold">:</div>
                    <div className="flex-1">{skState.diktumKesatu}</div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-28 sm:w-32 shrink-0 font-bold">KEDUA</div>
                    <div className="w-4 shrink-0 font-bold">:</div>
                    <div className="flex-1">{skState.diktumKedua}</div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-28 sm:w-32 shrink-0 font-bold">KETIGA</div>
                    <div className="w-4 shrink-0 font-bold">:</div>
                    <div className="flex-1">{skState.diktumKetiga}</div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-28 sm:w-32 shrink-0 font-bold">KEEMPAT</div>
                    <div className="w-4 shrink-0 font-bold">:</div>
                    <div className="flex-1">{skState.diktumKeempat}</div>
                  </div>
                </div>
              </div>

              {/* Titimangsa & Tanda Tangan */}
              <div className="flex justify-end pt-8 break-inside-avoid">
                <div className="w-72 space-y-1">
                  <div className="grid grid-cols-5">
                    <span className="col-span-2">Ditetapkan di</span>
                    <span className="col-span-3">: {skState.ditetapkanDi}</span>
                  </div>
                  <div className="grid grid-cols-5">
                    <span className="col-span-2">Pada Tanggal</span>
                    <span className="col-span-3">: {skState.padaTanggal}</span>
                  </div>
                  <div className="pt-2 font-bold">Kepala SD Negeri 006 Sungai Buluh,</div>
                  <div className="h-20"></div>
                  <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                  <div className="pt-0.5 text-zinc-900 tracking-normal font-normal">NIP. {schoolProfile.nipKepalaSekolah}</div>
                </div>
              </div>

              {/* Tembusan Resmi SK */}
              {skState.showTembusan && (
                <div className="pt-6 border-t border-zinc-300 mt-6 text-[11px] break-inside-avoid">
                  <div className="font-bold mb-1">Tembusan disampaikan kepada Yth :</div>
                  <ol className="list-decimal pl-5 space-y-0.5 text-zinc-800">
                    <li>Kepala Dinas Pendidikan Kepemudaan dan Olahraga Kab. Kuantan Singingi;</li>
                    <li>Koordinator Wilayah Bidang Pendidikan Kec. Singingi Hilir;</li>
                    <li>Ketua Komite SD Negeri 006 Sungai Buluh;</li>
                    <li>Yang bersangkutan untuk diketahui;</li>
                    <li>Arsip Sekolah.</li>
                  </ol>
                </div>
              )}

              {/* Opsi Lampiran SK Kelulusan */}
              {skState.showLampiran && (
                <div className="pt-8 border-t-2 border-black mt-8 space-y-3 break-before-page">
                  <div className="text-center space-y-1">
                    <p className="text-[11px] font-bold uppercase">
                      LAMPIRAN KEPUTUSAN KEPALA SEKOLAH DASAR NEGERI 006 SUNGAI BULUH
                    </p>
                    <p className="font-mono text-[10px]">NOMOR : {skState.nomor}</p>
                    <p className="text-xs font-extrabold uppercase">
                      DAFTAR PESERTA DIDIK KELAS VI YANG DINYATAKAN LULUS & REKAPITULASI NILAI AKHIR
                    </p>
                    <p className="text-[10px] text-zinc-600">
                      Tahun Pelajaran {schoolProfile.tahunPelajaran} • Bobot: {schoolProfile.bobotRapor}% Rata Rapor + {schoolProfile.bobotUS}% Ujian Sekolah • KKM: {schoolProfile.kkmKelulusan}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-black border-collapse">
                      <thead>
                        <tr className="bg-zinc-100 font-bold border-b border-black">
                          <th className="p-1.5 w-8 text-center border-r border-black">No</th>
                          <th className="p-1.5 min-w-[100px] border-r border-black">No. Peserta</th>
                          <th className="p-1.5 min-w-[80px] border-r border-black">NISN</th>
                          <th className="p-1.5 min-w-[170px] border-r border-black">Nama Lengkap</th>
                          <th className="p-1.5 text-center w-8 border-r border-black">L/P</th>
                          <th className="p-1.5 text-center w-16 border-r border-black">Total NA</th>
                          <th className="p-1.5 text-center w-16 border-r border-black">Rata NA</th>
                          <th className="p-1.5 text-center min-w-[70px]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, idx) => {
                          const totalNA = calculateStudentTotalFinalScore(s, schoolProfile, SUBJECT_LIST);
                          const avgNA = calculateStudentOverallFinalScore(s, schoolProfile, SUBJECT_LIST);
                          return (
                            <tr key={s.id} className="border-b border-black h-6 break-inside-avoid">
                              <td className="p-1 text-center font-bold border-r border-black">{idx + 1}</td>
                              <td className="p-1 font-mono border-r border-black">{s.noPeserta}</td>
                              <td className="p-1 font-mono border-r border-black">{s.nisn}</td>
                              <td className="p-1 font-bold uppercase border-r border-black">{s.nama}</td>
                              <td className="p-1 text-center border-r border-black">{s.jenisKelamin}</td>
                              <td className="p-1 text-center font-mono font-bold border-r border-black">{totalNA.toFixed(1)}</td>
                              <td className="p-1 text-center font-mono font-bold text-emerald-800 border-r border-black">{avgNA.toFixed(2)}</td>
                              <td className="p-1 text-center font-bold text-emerald-800">LULUS</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pengesahan Titimangsa Lampiran */}
                  <div className="flex justify-end pt-4 break-inside-avoid">
                    <div className="w-64 space-y-1 text-xs">
                      <div>Sungai Buluh, {skState.padaTanggal}</div>
                      <div className="font-bold">Kepala SD Negeri 006 Sungai Buluh,</div>
                      <div className="h-16"></div>
                      <div className="font-bold underline uppercase">{schoolProfile.kepalaSekolah}</div>
                      <div className="pt-0.5 text-zinc-900 tracking-normal font-normal">
                        NIP. {schoolProfile.nipKepalaSekolah}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog Edit Nama Guru Rapat */}
      <EditGuruRapatModal
        isOpen={isEditGuruModalOpen}
        onClose={() => setIsEditGuruModalOpen(false)}
        guruList={guruList}
        onSave={handleUpdateGuruList}
        showToast={showToast}
      />
    </div>
  );
};
