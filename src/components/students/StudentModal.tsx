import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, SubjectKey } from '../../types';
import { Modal } from '../common/Modal';
import { SUBJECT_LIST } from '../../constants/subjects';
import { generateStudentPhotoSvg } from '../../utils/studentAvatars';
import { Camera, Upload, Trash2, Sparkles } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
}) => {
  const { addStudent, updateStudent, subjects } = useApp();

  const [nama, setNama] = useState('');
  const [noPeserta, setNoPeserta] = useState('');
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [namaAyah, setNamaAyah] = useState('');
  const [namaIbu, setNamaIbu] = useState('');
  const [pekerjaanOrtu, setPekerjaanOrtu] = useState('');
  const [alamat, setAlamat] = useState('');
  const [ruang, setRuang] = useState<'RUANG 1' | 'RUANG 2' | 'RUANG 3' | 'RUANG 4'>('RUANG 1');
  const [noMeja, setNoMeja] = useState<number>(1);
  const [statusKelulusan, setStatusKelulusan] = useState<'LULUS' | 'TIDAK LULUS' | 'DITUNDA'>('LULUS');
  const [noSeriIjazah, setNoSeriIjazah] = useState('');
  const [noSuratKelulusan, setNoSuratKelulusan] = useState('');
  const [noSuratTranskrip, setNoSuratTranskrip] = useState('');
  const [foto, setFoto] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setNama(studentToEdit.nama);
      setNoPeserta(studentToEdit.noPeserta);
      setNisn(studentToEdit.nisn);
      setNis(studentToEdit.nis);
      setTempatLahir(studentToEdit.tempatLahir);
      setTanggalLahir(studentToEdit.tanggalLahir);
      setJenisKelamin(studentToEdit.jenisKelamin);
      setNamaAyah(studentToEdit.namaAyah);
      setNamaIbu(studentToEdit.namaIbu);
      setPekerjaanOrtu(studentToEdit.pekerjaanOrtu);
      setAlamat(studentToEdit.alamat);
      setRuang(studentToEdit.ruang);
      setNoMeja(studentToEdit.noMeja);
      setStatusKelulusan(studentToEdit.statusKelulusan);
      setNoSeriIjazah(studentToEdit.noSeriIjazah || '');
      setNoSuratKelulusan(studentToEdit.noSuratKelulusan || '');
      setNoSuratTranskrip(studentToEdit.noSuratTranskrip || '');
      setFoto(studentToEdit.foto || '');
    } else {
      // Defaults for new student
      const randNum = Math.floor(Math.random() * 800) + 100;
      setNama('');
      setNoPeserta(`04-006-${String(randNum)}-1`);
      setNisn(`01${Math.floor(Math.random() * 89999999 + 10000000)}`);
      setNis(`2019${Math.floor(Math.random() * 899 + 100)}`);
      setTempatLahir('Sungai Buluh');
      setTanggalLahir('2013-05-15');
      setJenisKelamin('L');
      setNamaAyah('');
      setNamaIbu('');
      setPekerjaanOrtu('Wiraswasta');
      setAlamat('Desa Sungai Buluh, Singingi Hilir');
      setRuang('RUANG 1');
      setNoMeja(1);
      setStatusKelulusan('LULUS');
      setNoSeriIjazah(`DN-09/D-SD/26/0014${String(randNum).padStart(3, '0')}`);
      setNoSuratKelulusan(`421.2/SDN-06/SK-LULUS/2026/${String(randNum).padStart(3, '0')}`);
      setNoSuratTranskrip(`421.2/SDN-06/SKHU/2026/${String(randNum).padStart(3, '0')}`);
      setFoto(generateStudentPhotoSvg('SISWA BARU', 'L', 1));
    }
  }, [studentToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    if (studentToEdit) {
      updateStudent(studentToEdit.id, {
        nama: nama.toUpperCase(),
        noPeserta,
        nisn,
        nis,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        namaAyah,
        namaIbu,
        pekerjaanOrtu,
        alamat,
        ruang,
        noMeja,
        statusKelulusan,
        noSeriIjazah,
        noSuratKelulusan,
        noSuratTranskrip,
        foto: foto || undefined,
      });
    } else {
      // Build default score objects for 10 subjects
      const initialMap = {} as Record<SubjectKey, number>;
      const initialUS = {} as Record<SubjectKey, { tulis: number; praktik?: number; akhir: number }>;

      subjects.forEach((s) => {
        initialMap[s.key] = s.kkm + 5;
        initialUS[s.key] = { tulis: s.kkm + 5, akhir: s.kkm + 5 };
      });

      addStudent({
        nama: nama.toUpperCase(),
        noPeserta,
        nisn,
        nis,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        namaAyah,
        namaIbu,
        pekerjaanOrtu,
        alamat,
        ruang,
        noMeja,
        foto: foto || undefined,
        rapor: {
          s7: { ...initialMap },
          s8: { ...initialMap },
          s9: { ...initialMap },
          s10: { ...initialMap },
          s11: { ...initialMap },
          s12: { ...initialMap },
        },
        us: initialUS,
        statusKelulusan,
        noSeriIjazah,
        noSuratKelulusan,
        noSuratTranskrip,
        tanggalAmbilIjazah: '15 Juni 2026',
        penerimaIjazah: `${namaAyah} (Orang Tua)`,
        catatan: 'Peserta Ujian Baru',
      });
    }

    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Ubah Data Peserta Ujian' : 'Tambah Peserta Ujian Baru'}
      subtitle="Pastikan Nomor Peserta, NISN, dan Ruang Ujian sesuai DNT resmi"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Pas Foto Peserta Ujian */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-700 dark:bg-zinc-800/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative h-24 w-18 overflow-hidden rounded-lg border-2 border-emerald-600 bg-white shadow-xs shrink-0 flex items-center justify-center dark:bg-zinc-900">
            {foto ? (
              <img src={foto} alt="Pas Foto" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center p-1">
                <span className="text-xl">{jenisKelamin === 'L' ? '👦' : '👧'}</span>
                <span className="text-[7px] text-zinc-400 font-bold block uppercase mt-0.5">FOTO 2x3</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1.5 text-center sm:text-left">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block uppercase">
              Pas Foto Resmi Peserta (Ukuran 2x3 & 3x4)
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Digunakan pada Kartu Peserta Ujian, Denah Meja Ruangan, dan Surat Keterangan Hasil Ujian (SKHU).
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Unggah Berkas Gambar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setFoto(generateStudentPhotoSvg(nama || 'SISWA BARU', jenisKelamin, 1))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Gunakan Avatar Resmi
              </button>

              {foto && (
                <button
                  type="button"
                  onClick={() => setFoto('')}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Nama Lengkap Siswa *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: AHMAD MAULANA"
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm font-semibold uppercase text-zinc-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              No. Peserta Ujian *
            </label>
            <input
              type="text"
              required
              value={noPeserta}
              onChange={(e) => setNoPeserta(e.target.value)}
              placeholder="04-006-001-8"
              className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              NISN (10 Digit) *
            </label>
            <input
              type="text"
              required
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="0123456789"
              className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              NIS (Buku Induk)
            </label>
            <input
              type="text"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="2019001"
              className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Jenis Kelamin
            </label>
            <select
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Tempat Lahir
            </label>
            <input
              type="text"
              value={tempatLahir}
              onChange={(e) => setTempatLahir(e.target.value)}
              placeholder="Sungai Buluh"
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Nama Ayah Kandung
            </label>
            <input
              type="text"
              value={namaAyah}
              onChange={(e) => setNamaAyah(e.target.value)}
              placeholder="Nama Ayah"
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Nama Ibu Kandung
            </label>
            <input
              type="text"
              value={namaIbu}
              onChange={(e) => setNamaIbu(e.target.value)}
              placeholder="Nama Ibu"
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Ruang Ujian
            </label>
            <select
              value={ruang}
              onChange={(e) => setRuang(e.target.value as any)}
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="RUANG 1">RUANG 1</option>
              <option value="RUANG 2">RUANG 2</option>
              <option value="RUANG 3">RUANG 3</option>
              <option value="RUANG 4">RUANG 4</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Nomor Meja
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={noMeja}
              onChange={(e) => setNoMeja(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Nomor Ijazah
            </label>
            <input
              type="text"
              value={noSeriIjazah}
              onChange={(e) => setNoSeriIjazah(e.target.value)}
              placeholder="DN-09/D-SD/26/0014501"
              className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Nomor Surat Kelulusan (SKL)
            </label>
            <input
              type="text"
              value={noSuratKelulusan}
              onChange={(e) => setNoSuratKelulusan(e.target.value)}
              placeholder="421.2/SDN-06/SK-LULUS/2026/001"
              className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Nomor Surat Transkrip Nilai (SKHU)
            </label>
            <input
              type="text"
              value={noSuratTranskrip}
              onChange={(e) => setNoSuratTranskrip(e.target.value)}
              placeholder="421.2/SDN-06/SKHU/2026/001"
              className="w-full font-mono rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-colors"
          >
            {studentToEdit ? 'Simpan Perubahan' : 'Tambahkan Peserta'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
