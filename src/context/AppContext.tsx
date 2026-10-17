import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Student, SchoolProfile, Supervisor, CommitteeMember, DiplomaRecord, SubjectKey, ExamScoreDetail, SubjectInfo } from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SCHOOL_PROFILE,
  INITIAL_SUPERVISORS,
  INITIAL_COMMITTEE,
  INITIAL_DIPLOMA_RECORDS,
} from '../data/initialData';
import { SUBJECT_LIST, calculateStudentTotalFinalScore, calculateStudentOverallFinalScore } from '../constants/subjects';
import { generateStudentPhotoSvg } from '../utils/studentAvatars';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  students: Student[];
  schoolProfile: SchoolProfile;
  supervisors: Supervisor[];
  committee: CommitteeMember[];
  diplomaRecords: DiplomaRecord[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Selection modals
  selectedStudentForDetail: Student | null;
  setSelectedStudentForDetail: (student: Student | null) => void;
  selectedStudentForSKHU: Student | null;
  setSelectedStudentForSKHU: (student: Student | null) => void;
  selectedStudentForCert: Student | null;
  setSelectedStudentForCert: (student: Student | null) => void;
  
  // Printing helpers
  selectedRoomForPrint: string;
  setSelectedRoomForPrint: (room: string) => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // CRUD actions
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  updateStudentRaporScore: (
    studentId: string,
    semester: 's7' | 's8' | 's9' | 's10' | 's11' | 's12',
    subject: SubjectKey,
    value: number
  ) => void;
  updateStudentUSScore: (
    studentId: string,
    subject: SubjectKey,
    detail: Partial<ExamScoreDetail>
  ) => void;
  updateSchoolProfile: (data: Partial<SchoolProfile>) => void;
  updateSupervisor: (id: string, data: Partial<Supervisor>) => void;
  addSupervisor: (data: Omit<Supervisor, 'id'>) => void;
  deleteSupervisor: (id: string) => void;
  setSupervisorsList: (list: Supervisor[]) => void;
  resetSupervisorsToDefault: () => void;
  updateCommitteeMember: (id: string, data: Partial<CommitteeMember>) => void;
  addCommitteeMember: (data: Omit<CommitteeMember, 'id'>) => void;
  deleteCommitteeMember: (id: string) => void;
  setCommitteeList: (list: CommitteeMember[]) => void;
  resetCommitteeToDefault: () => void;
  updateDiplomaRecord: (index: number, data: Partial<DiplomaRecord>) => void;
  
  // Photo management
  updateStudentPhoto: (studentId: string, foto: string | null) => void;
  batchUpdateStudentPhotos: (updates: Array<{ id: string; foto: string }>) => void;
  applyDefaultOfficialAvatars: () => void;
  clearAllStudentPhotos: () => void;

  // Subject management
  subjects: SubjectInfo[];
  addSubject: (subject: Omit<SubjectInfo, 'key'> & { key?: string; defaultScore?: number }) => void;
  updateSubject: (key: string, data: Partial<SubjectInfo>) => void;
  deleteSubject: (key: string) => void;
  resetSubjectsToDefault: () => void;
  
  // Data utilities
  resetToDefaultData: () => void;
  exportToCSV: () => void;
  exportToJSON: () => void;
  importFromJSON: (jsonStr: string) => boolean;
  downloadStudentCSVTemplate: () => void;
  downloadStudentExcelTemplate: () => void;
  importStudentsList: (newStudents: Student[], mode: 'append' | 'replace') => void;
  downloadGradesExcelTemplate: (category: 'rapor' | 'us', semester?: 's7' | 's8' | 's9' | 's10' | 's11' | 's12') => void;
  downloadMasterGradesWorkbook: () => void;
  importGradesBatch: (
    category: 'rapor' | 'us',
    semester: 's7' | 's8' | 's9' | 's10' | 's11' | 's12',
    rows: Array<{
      identifier: string;
      scores: Record<string, any>;
    }>
  ) => { matched: number; total: number };
  importMultiSheetGrades: (
    sheetData: Record<string, Array<{ identifier: string; scores: Record<string, any> }>>
  ) => { totalMatched: number; sheetsProcessed: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'sdn006_un_students_v1',
  SCHOOL: 'sdn006_un_school_v1',
  SUPERVISORS: 'sdn006_un_supervisors_v1',
  COMMITTEE: 'sdn006_un_committee_v1',
  DIPLOMA: 'sdn006_un_diploma_v1',
  DARK_MODE: 'sdn006_un_dark_mode_v1',
  SUBJECTS: 'sdn006_un_subjects_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with localStorage fallback
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return stored ? JSON.parse(stored) : INITIAL_STUDENTS;
    } catch (e) {
      return INITIAL_STUDENTS;
    }
  });

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCHOOL);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...INITIAL_SCHOOL_PROFILE,
          ...parsed,
          kopSurat: {
            ...INITIAL_SCHOOL_PROFILE.kopSurat,
            ...(parsed.kopSurat || {}),
          },
        };
      }
      return INITIAL_SCHOOL_PROFILE;
    } catch (e) {
      return INITIAL_SCHOOL_PROFILE;
    }
  });

  const [supervisors, setSupervisors] = useState<Supervisor[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUPERVISORS);
      return stored ? JSON.parse(stored) : INITIAL_SUPERVISORS;
    } catch (e) {
      return INITIAL_SUPERVISORS;
    }
  });

  const [committee, setCommittee] = useState<CommitteeMember[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMMITTEE);
      return stored ? JSON.parse(stored) : INITIAL_COMMITTEE;
    } catch (e) {
      return INITIAL_COMMITTEE;
    }
  });

  // Persist committee
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(committee));
  }, [committee]);

  const [diplomaRecords, setDiplomaRecords] = useState<DiplomaRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DIPLOMA);
      return stored ? JSON.parse(stored) : INITIAL_DIPLOMA_RECORDS;
    } catch (e) {
      return INITIAL_DIPLOMA_RECORDS;
    }
  });

  const [subjects, setSubjects] = useState<SubjectInfo[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return stored ? JSON.parse(stored) : SUBJECT_LIST;
    } catch (e) {
      return SUBJECT_LIST;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [selectedStudentForSKHU, setSelectedStudentForSKHU] = useState<Student | null>(null);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Student | null>(null);
  const [selectedRoomForPrint, setSelectedRoomForPrint] = useState<string>('RUANG 1');

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode));
  }, [darkMode]);

  // Persist students
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  // Persist school profile
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  // Persist supervisors
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPERVISORS, JSON.stringify(supervisors));
  }, [supervisors]);

  // Persist diploma records
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIPLOMA, JSON.stringify(diplomaRecords));
  }, [diplomaRecords]);

  // Persist subjects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const id = `std-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id,
    };
    setStudents((prev) => [newStudent, ...prev]);
    showToast('Berhasil Ditambahkan', `Peserta ${newStudent.nama} berhasil didaftarkan.`, 'success');
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((std) => (std.id === id ? { ...std, ...data } : std))
    );
    showToast('Data Diperbarui', 'Data peserta ujian berhasil disimpan.', 'success');
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((std) => std.id !== id));
    showToast('Data Dihapus', `Data ${target?.nama || 'peserta'} telah dihapus.`, 'info');
  };

  const updateStudentRaporScore = (
    studentId: string,
    semester: 's7' | 's8' | 's9' | 's10' | 's11' | 's12',
    subject: SubjectKey,
    value: number
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          rapor: {
            ...s.rapor,
            [semester]: {
              ...s.rapor[semester],
              [subject]: value,
            },
          },
        };
      })
    );
  };

  const updateStudentUSScore = (
    studentId: string,
    subject: SubjectKey,
    detail: Partial<ExamScoreDetail>
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const currentDetail = s.us[subject] || { tulis: 0, akhir: 0 };
        const updatedDetail = { ...currentDetail, ...detail };
        
        // Recalculate akhir if not explicitly provided
        if (detail.akhir !== undefined) {
          updatedDetail.akhir = detail.akhir;
        } else if (updatedDetail.praktik !== undefined && updatedDetail.praktik !== null && updatedDetail.praktik > 0) {
          updatedDetail.akhir = Math.round(((updatedDetail.tulis * 0.5) + (updatedDetail.praktik * 0.5)) * 10) / 10;
        } else {
          updatedDetail.akhir = updatedDetail.tulis;
        }

        return {
          ...s,
          us: {
            ...s.us,
            [subject]: updatedDetail,
          },
        };
      })
    );
  };

  const updateSchoolProfile = (data: Partial<SchoolProfile>) => {
    setSchoolProfile((prev) => ({ ...prev, ...data }));
    showToast('Profil Diperbarui', 'Data identitas sekolah & pengaturan berhasil disimpan.', 'success');
  };

  const updateSupervisor = (id: string, data: Partial<Supervisor>) => {
    setSupervisors((prev) =>
      prev.map((sup) => (sup.id === id ? { ...sup, ...data } : sup))
    );
    showToast('Pengawas Diperbarui', 'Data pengawas ujian berhasil diperbarui.', 'success');
  };

  const addSupervisor = (data: Omit<Supervisor, 'id'>) => {
    const id = `sup-${Date.now()}`;
    setSupervisors((prev) => [...prev, { ...data, id }]);
    showToast('Pengawas Ditambahkan', `${data.nama} telah ditambahkan ke daftar pengawas.`, 'success');
  };

  const deleteSupervisor = (id: string) => {
    setSupervisors((prev) => prev.filter((sup) => sup.id !== id));
    showToast('Pengawas Dihapus', 'Data pengawas telah dihapus.', 'info');
  };

  const setSupervisorsList = (list: Supervisor[]) => {
    setSupervisors(list);
    showToast('Pengawas Disimpan', `${list.length} pengawas TPU VI berhasil disimpan.`, 'success');
  };

  const resetSupervisorsToDefault = () => {
    setSupervisors(INITIAL_SUPERVISORS);
    localStorage.removeItem(STORAGE_KEYS.SUPERVISORS);
    showToast('Reset Pengawas', 'Daftar pengawas dikembalikan ke data awal TPU VI.', 'info');
  };

  const updateCommitteeMember = (id: string, data: Partial<CommitteeMember>) => {
    setCommittee((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    showToast('Panitia Diperbarui', 'Data susunan panitia ujian berhasil diperbarui.', 'success');
  };

  const addCommitteeMember = (data: Omit<CommitteeMember, 'id'>) => {
    const id = `com-${Date.now()}`;
    setCommittee((prev) => [...prev, { ...data, id }]);
    showToast('Panitia Ditambahkan', `${data.nama} telah ditambahkan ke susunan panitia.`, 'success');
  };

  const deleteCommitteeMember = (id: string) => {
    setCommittee((prev) => prev.filter((c) => c.id !== id));
    showToast('Panitia Dihapus', 'Data anggota panitia telah dihapus.', 'info');
  };

  const setCommitteeList = (list: CommitteeMember[]) => {
    setCommittee(list);
    showToast('Panitia Disimpan', `${list.length} anggota susunan panitia berhasil diperbarui.`, 'success');
  };

  const resetCommitteeToDefault = () => {
    setCommittee(INITIAL_COMMITTEE);
    localStorage.removeItem(STORAGE_KEYS.COMMITTEE);
    showToast('Reset Panitia', 'Susunan panitia dikembalikan ke SK awal.', 'info');
  };

  const updateDiplomaRecord = (index: number, data: Partial<DiplomaRecord>) => {
    setDiplomaRecords((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...data };
      return copy;
    });
    showToast('Blangko Ijazah Disimpan', 'Catatan penggunaan blangko ijazah diperbarui.', 'success');
  };

  const updateStudentPhoto = (studentId: string, foto: string | null) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, foto: foto || undefined } : s))
    );
    showToast(foto ? 'Foto Disimpan' : 'Foto Dihapus', 'Foto profil peserta berhasil disimpan.', 'success');
  };

  const batchUpdateStudentPhotos = (updates: Array<{ id: string; foto: string }>) => {
    const map = new Map(updates.map((u) => [u.id, u.foto]));
    setStudents((prev) =>
      prev.map((s) => {
        if (map.has(s.id)) {
          return { ...s, foto: map.get(s.id) };
        }
        return s;
      })
    );
    showToast('Foto Massal Berhasil', `${updates.length} foto peserta berhasil diperbarui.`, 'success');
  };

  const applyDefaultOfficialAvatars = () => {
    setStudents((prev) =>
      prev.map((s, idx) => ({
        ...s,
        foto: generateStudentPhotoSvg(s.nama, s.jenisKelamin, idx + 1),
      }))
    );
    showToast('Avatar Resmi Diterapkan', 'Seluruh peserta telah dipasangkan pas foto resmi standar SD.', 'success');
  };

  const clearAllStudentPhotos = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        foto: undefined,
      }))
    );
    showToast('Foto Dikosongkan', 'Seluruh foto peserta telah dihapus.', 'info');
  };

  // Subject Management (Tambah Mapel, Edit Nama Pelajaran, Hapus Mapel)
  const addSubject = (newSub: Omit<SubjectInfo, 'key'> & { key?: string; defaultScore?: number }) => {
    const rawKey = (newSub.key || newSub.code || newSub.name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 16);
    let finalKey = rawKey || `mapel_${Date.now()}`;
    
    // Ensure uniqueness
    let counter = 1;
    while (subjects.some((s) => s.key === finalKey)) {
      finalKey = `${rawKey}_${counter++}`;
    }

    const defaultScore = newSub.defaultScore ?? (Number(newSub.kkm) || 75) + 5;
    const created: SubjectInfo = {
      key: finalKey,
      name: newSub.name.trim(),
      code: (newSub.code || newSub.name.slice(0, 5)).trim().toUpperCase(),
      kkm: Number(newSub.kkm) || 75,
    };

    setSubjects((prev) => [...prev, created]);

    // Also populate student scores for this new subject
    setStudents((prev) =>
      prev.map((s) => {
        const usCopy = { ...s.us };
        if (!usCopy[finalKey]) {
          usCopy[finalKey] = {
            tulis: defaultScore,
            praktik: defaultScore,
            akhir: defaultScore,
          };
        }
        const raporCopy = { ...s.rapor };
        (['s7', 's8', 's9', 's10', 's11', 's12'] as const).forEach((sem) => {
          if (!raporCopy[sem]) {
            raporCopy[sem] = {} as any;
          }
          if (raporCopy[sem][finalKey] === undefined) {
            raporCopy[sem] = { ...raporCopy[sem], [finalKey]: defaultScore };
          }
        });
        return {
          ...s,
          us: usCopy,
          rapor: raporCopy,
        };
      })
    );

    showToast(
      'Mata Pelajaran Ditambahkan',
      `Mata pelajaran "${created.name}" (${created.code}) berhasil ditambahkan ke daftar ujian.`,
      'success'
    );
  };

  const updateSubject = (key: string, data: Partial<SubjectInfo>) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.key === key) {
          return {
            ...sub,
            ...data,
            name: data.name !== undefined ? data.name.trim() : sub.name,
            code: data.code !== undefined ? data.code.trim().toUpperCase() : sub.code,
            kkm: data.kkm !== undefined ? Number(data.kkm) : sub.kkm,
          };
        }
        return sub;
      })
    );

    showToast(
      'Mata Pelajaran Diperbarui',
      `Data mata pelajaran berhasil diperbarui.`,
      'success'
    );
  };

  const deleteSubject = (key: string) => {
    if (subjects.length <= 1) {
      showToast('Gagal Menghapus', 'Minimal harus ada 1 mata pelajaran ujian sekolah.', 'error');
      return;
    }

    const targetSub = subjects.find((s) => s.key === key);
    setSubjects((prev) => prev.filter((s) => s.key !== key));

    showToast(
      'Mata Pelajaran Dihapus',
      `Mata pelajaran "${targetSub?.name || key}" telah dihapus dari daftar ujian.`,
      'info'
    );
  };

  const resetSubjectsToDefault = () => {
    setSubjects(SUBJECT_LIST);
    showToast('Reset Mata Pelajaran', 'Daftar mata pelajaran dikembalikan ke standar awal kurikulum.', 'info');
  };

  const resetToDefaultData = () => {
    setStudents(INITIAL_STUDENTS);
    setSchoolProfile(INITIAL_SCHOOL_PROFILE);
    setSupervisors(INITIAL_SUPERVISORS);
    setCommittee(INITIAL_COMMITTEE);
    setDiplomaRecords(INITIAL_DIPLOMA_RECORDS);
    setSubjects(SUBJECT_LIST);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.SCHOOL);
    localStorage.removeItem(STORAGE_KEYS.SUPERVISORS);
    localStorage.removeItem(STORAGE_KEYS.COMMITTEE);
    localStorage.removeItem(STORAGE_KEYS.DIPLOMA);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    showToast('Data Direset', 'Semua data telah dikembalikan ke standar awal SDN 006 Sungai Buluh.', 'info');
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'No',
      'No Peserta',
      'NISN',
      'NIS',
      'Nama Peserta',
      'L/P',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Nama Orang Tua',
      'Ruang',
      'No Meja',
      'Rata-rata Rapor',
      'Rata-rata US',
      'Nilai Akhir',
      'Status Kelulusan',
      'No Ijazah',
      'No Surat Kelulusan',
      'No Surat Transkrip Nilai',
    ];

    const rows = students.map((s, idx) => {
      const avgRapor = (
        SUBJECT_LIST.reduce((acc, sub) => {
          const r = s.rapor;
          const tot = (r.s7[sub.key] || 0) + (r.s8[sub.key] || 0) + (r.s9[sub.key] || 0) + (r.s10[sub.key] || 0) + (r.s11[sub.key] || 0) + (r.s12[sub.key] || 0);
          return acc + tot / 6;
        }, 0) / SUBJECT_LIST.length
      ).toFixed(2);

      const avgUS = (
        SUBJECT_LIST.reduce((acc, sub) => {
          const d = s.us[sub.key];
          return acc + (d ? d.akhir : 0);
        }, 0) / SUBJECT_LIST.length
      ).toFixed(2);

      const na = calculateStudentOverallFinalScore(s, schoolProfile).toFixed(2);

      return [
        idx + 1,
        `"${s.noPeserta}"`,
        `"${s.nisn}"`,
        `"${s.nis}"`,
        `"${s.nama}"`,
        `"${s.jenisKelamin}"`,
        `"${s.tempatLahir}"`,
        `"${s.tanggalLahir}"`,
        `"${s.namaAyah}"`,
        `"${s.ruang}"`,
        s.noMeja,
        avgRapor,
        avgUS,
        na,
        `"${s.statusKelulusan}"`,
        `"${s.noSeriIjazah || '-'}"`,
        `"${s.noSuratKelulusan || '-'}"`,
        `"${s.noSuratTranskrip || '-'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_SDN_006_Sungai_Buluh_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Berhasil', 'File CSV berhasil diunduh ke komputer Anda.', 'success');
  };

  const exportToJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      schoolProfile,
      students,
      supervisors,
      diplomaRecords,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `Backup_Data_SDN006_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Cadangan Disimpan', 'File JSON backup berhasil diunduh.', 'success');
  };

  const importFromJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.students)) {
        setStudents(parsed.students);
      }
      if (parsed.schoolProfile) {
        setSchoolProfile(parsed.schoolProfile);
      }
      if (Array.isArray(parsed.supervisors)) {
        setSupervisors(parsed.supervisors);
      }
      showToast('Import Berhasil', 'Data berhasil dipulihkan dari file backup.', 'success');
      return true;
    } catch (e) {
      showToast('Gagal Import', 'Format berkas JSON tidak valid atau rusak.', 'error');
      return false;
    }
  };

  const downloadStudentCSVTemplate = () => {
    const headers = [
      'No Peserta',
      'NISN',
      'NIS',
      'Nama Peserta',
      'L/P',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Nama Ayah',
      'Nama Ibu',
      'Pekerjaan Ortu',
      'Alamat',
      'Ruang Ujian',
      'Nomor Meja',
      'No Ijazah',
      'No Surat Kelulusan',
      'No Surat Transkrip Nilai',
    ];

    const sampleRows = [
      [
        '04-006-033-2',
        '0123456813',
        '2019033',
        'MUHAMMAD FAUZAN',
        'L',
        'Sungai Buluh',
        '2013-05-10',
        'Ahmad Fauzi',
        'Siti Khodijah',
        'Wiraswasta',
        'RT 01 RW 01 Sungai Buluh',
        'RUANG 1',
        '9',
        'DN-09/D-SD/26/0014533',
        '421.2/SDN-06/SK-LULUS/2026/033',
        '421.2/SDN-06/SKHU/2026/033',
      ],
      [
        '04-006-034-3',
        '0123456814',
        '2019034',
        'ZAHRA ANINDYA',
        'P',
        'Koto Baru',
        '2013-09-15',
        'Dedi Kurniawan',
        'Ratna Sari',
        'PNS',
        'RT 02 RW 01 Sungai Buluh',
        'RUANG 1',
        '10',
        'DN-09/D-SD/26/0014534',
        '421.2/SDN-06/SK-LULUS/2026/034',
        '421.2/SDN-06/SKHU/2026/034',
      ],
      [
        '04-006-035-4',
        '0123456815',
        '2019035',
        'BAGAS PRASETYO',
        'L',
        'Sungai Buluh',
        '2013-02-18',
        'Slamet Riyadi',
        'Sri Utami',
        'Petani Sawit',
        'RT 03 RW 02 Sungai Buluh',
        'RUANG 2',
        '9',
        'DN-09/D-SD/26/0014535',
        '421.2/SDN-06/SK-LULUS/2026/035',
        '421.2/SDN-06/SKHU/2026/035',
      ],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...sampleRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Template_Data_Siswa_SDN_006.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template Diunduh', 'Berkas template data siswa (CSV) berhasil diunduh.', 'success');
  };

  const downloadStudentExcelTemplate = () => {
    const wsData = [
      [
        'No Peserta',
        'NISN',
        'NIS',
        'Nama Peserta',
        'L/P',
        'Tempat Lahir',
        'Tanggal Lahir',
        'Nama Ayah',
        'Nama Ibu',
        'Pekerjaan Ortu',
        'Alamat',
        'Ruang Ujian',
        'Nomor Meja',
        'No Ijazah',
        'No Surat Kelulusan',
        'No Surat Transkrip Nilai',
      ],
      [
        '04-006-033-2',
        '0123456813',
        '2019033',
        'MUHAMMAD FAUZAN',
        'L',
        'Sungai Buluh',
        '2013-05-10',
        'Ahmad Fauzi',
        'Siti Khodijah',
        'Wiraswasta',
        'RT 01 RW 01 Sungai Buluh',
        'RUANG 1',
        9,
        'DN-09/D-SD/26/0014533',
        '421.2/SDN-06/SK-LULUS/2026/033',
        '421.2/SDN-06/SKHU/2026/033',
      ],
      [
        '04-006-034-3',
        '0123456814',
        '2019034',
        'ZAHRA ANINDYA',
        'P',
        'Koto Baru',
        '2013-09-15',
        'Dedi Kurniawan',
        'Ratna Sari',
        'PNS',
        'RT 02 RW 01 Sungai Buluh',
        'RUANG 1',
        10,
        'DN-09/D-SD/26/0014534',
        '421.2/SDN-06/SK-LULUS/2026/034',
        '421.2/SDN-06/SKHU/2026/034',
      ],
      [
        '04-006-035-4',
        '0123456815',
        '2019035',
        'BAGAS PRASETYO',
        'L',
        'Sungai Buluh',
        '2013-02-18',
        'Slamet Riyadi',
        'Sri Utami',
        'Petani Sawit',
        'RT 03 RW 02 Sungai Buluh',
        'RUANG 2',
        9,
        'DN-09/D-SD/26/0014535',
        '421.2/SDN-06/SK-LULUS/2026/035',
        '421.2/SDN-06/SKHU/2026/035',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 16 },
      { wch: 14 },
      { wch: 12 },
      { wch: 28 },
      { wch: 6 },
      { wch: 16 },
      { wch: 14 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 26 },
      { wch: 32 },
      { wch: 28 },
    ];

    const guideData = [
      ['PETUNJUK PENGISIAN TEMPLATE DATA SISWA UJIAN NASIONAL SDN 006 SUNGAI BULUH'],
      [''],
      ['Kolom', 'Keterangan', 'Contoh Format / Aturan Validasi'],
      ['No Peserta', 'Nomor peserta ujian', '04-006-001-8 (Format Standar DNT Dinas)'],
      ['NISN', 'Nomor Induk Siswa Nasional', '10 digit angka unik (Contoh: 0123456789)'],
      ['NIS', 'Nomor Induk Siswa Sekolah', 'Nomor buku induk siswa (Contoh: 2019001)'],
      ['Nama Peserta', 'Nama lengkap siswa', 'Gunakan huruf kapital (Contoh: AHMAD MAULANA) - WAJIB DIISI'],
      ['L/P', 'Jenis Kelamin', 'Ketik L untuk Laki-laki atau P untuk Perempuan - WAJIB'],
      ['Tempat Lahir', 'Kota/Desa kelahiran', 'Contoh: Sungai Buluh / Koto Baru'],
      ['Tanggal Lahir', 'Format tanggal lahir', 'Format: YYYY-MM-DD (Contoh: 2013-05-15)'],
      ['Nama Ayah', 'Nama ayah kandung', 'Contoh: Ridwan'],
      ['Nama Ibu', 'Nama ibu kandung', 'Contoh: Kasmarni'],
      ['Pekerjaan Ortu', 'Pekerjaan orang tua', 'Contoh: Petani Sawit / Wiraswasta / PNS'],
      ['Alamat', 'Alamat tempat tinggal', 'Contoh: RT 01 RW 01 Desa Sungai Buluh'],
      ['Ruang Ujian', 'Penempatan ruang ujian', 'Isi salah satu: RUANG 1, RUANG 2, RUANG 3, atau RUANG 4'],
      ['Nomor Meja', 'Nomor meja tempat duduk', 'Angka 1 sampai 20 (Contoh: 1)'],
      ['No Ijazah', 'Nomor seri blangko ijazah', 'DN-09/D-SD/26/0014501 (Format resmi Kemdikbud)'],
      ['No Surat Kelulusan', 'Nomor SK Kelulusan / SKL', 'Contoh: 421.2/SDN-06/SK-LULUS/2026/001'],
      ['No Surat Transkrip Nilai', 'Nomor SKHU / Transkrip', 'Contoh: 421.2/SDN-06/SKHU/2026/001'],
    ];

    const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
    wsGuide['!cols'] = [{ wch: 25 }, { wch: 32 }, { wch: 55 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DATA SISWA');
    XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK');

    XLSX.writeFile(wb, 'Template_Data_Siswa_SDN_006.xlsx');
    showToast('Template Excel Diunduh', 'Berkas Template_Data_Siswa_SDN_006.xlsx berhasil disimpan.', 'success');
  };

  const importStudentsList = (newStudents: Student[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setStudents(newStudents);
      showToast('Impor Berhasil', `Seluruh data digantikan dengan ${newStudents.length} peserta baru.`, 'success');
    } else {
      setStudents((prev) => [...prev, ...newStudents]);
      showToast('Impor Berhasil', `${newStudents.length} peserta baru berhasil ditambahkan.`, 'success');
    }
  };

  const downloadGradesExcelTemplate = (
    category: 'rapor' | 'us',
    semester: 's7' | 's8' | 's9' | 's10' | 's11' | 's12' = 's12'
  ) => {
    const semLabels: Record<string, string> = {
      s7: 'Semester 7 (Kelas 4 Sem 1)',
      s8: 'Semester 8 (Kelas 4 Sem 2)',
      s9: 'Semester 9 (Kelas 5 Sem 1)',
      s10: 'Semester 10 (Kelas 5 Sem 2)',
      s11: 'Semester 11 (Kelas 6 Sem 1)',
      s12: 'Semester 12 (Kelas 6 Sem 2)',
    };

    if (category === 'rapor') {
      const headers = [
        'No',
        'No Peserta',
        'NISN',
        'Nama Peserta',
        'Ruang',
        ...SUBJECT_LIST.map((s) => s.code),
      ];

      const rows = students.map((s, idx) => {
        const scores = s.rapor[semester] || {};
        return [
          idx + 1,
          s.noPeserta,
          s.nisn,
          s.nama,
          s.ruang,
          ...SUBJECT_LIST.map((sub) => scores[sub.key] ?? 85),
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 16 },
        { wch: 14 },
        { wch: 28 },
        { wch: 12 },
        ...SUBJECT_LIST.map(() => ({ wch: 10 })),
      ];

      const guideRows = [
        [`PETUNJUK INPUT NILAI RAPOR ${semLabels[semester]?.toUpperCase() || ''}`],
        ['SD NEGERI 006 SUNGAI BULUH • KEC. SINGINGI HILIR'],
        [''],
        ['1. Kolom No Peserta, NISN, Nama, dan Ruang telah diisi otomatis sesuai data siswa aktif.'],
        ['2. Masukkan nilai angka antara 0 sampai dengan 100 untuk setiap mata pelajaran.'],
        ['3. Nilai KKM per Mata Pelajaran:'],
        ...SUBJECT_LIST.map((sub) => [`   - ${sub.name} (${sub.code}) : KKM ${sub.kkm}`]),
        ['4. Simpan berkas Excel ini lalu unggah kembali melalui tombol "Impor Nilai (.xlsx)".'],
      ];
      const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
      wsGuide['!cols'] = [{ wch: 65 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `NILAI_RAPOR_${semester.toUpperCase()}`);
      XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK');

      const fileName = `Template_Nilai_Rapor_${semester.toUpperCase()}_SDN006.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast('Template Nilai Diunduh', `Berkas ${fileName} berhasil disimpan.`, 'success');
    } else {
      // US (Ujian Sekolah)
      const headers = [
        'No',
        'No Peserta',
        'NISN',
        'Nama Peserta',
        'Ruang',
        'PAB_Tulis',
        'PAB_Praktik',
        'PPKn_Tulis',
        'BIN_Tulis',
        'BIN_Praktik',
        'MAT_Tulis',
        'IPA_Tulis',
        'IPA_Praktik',
        'IPS_Tulis',
        'SBdP_Tulis',
        'SBdP_Praktik',
        'PJOK_Tulis',
        'PJOK_Praktik',
        'MULOK_Tulis',
        'BING_Tulis',
      ];

      const rows = students.map((s, idx) => {
        const u = s.us;
        return [
          idx + 1,
          s.noPeserta,
          s.nisn,
          s.nama,
          s.ruang,
          u.pab?.tulis ?? 85,
          u.pab?.praktik ?? 85,
          u.ppkn?.tulis ?? 85,
          u.bin?.tulis ?? 85,
          u.bin?.praktik ?? 85,
          u.mat?.tulis ?? 85,
          u.ipa?.tulis ?? 85,
          u.ipa?.praktik ?? 85,
          u.ips?.tulis ?? 85,
          u.sbdp?.tulis ?? 85,
          u.sbdp?.praktik ?? 85,
          u.pjok?.tulis ?? 85,
          u.pjok?.praktik ?? 85,
          u.mulok?.tulis ?? 85,
          u.bing?.tulis ?? 85,
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 16 },
        { wch: 14 },
        { wch: 28 },
        { wch: 12 },
        ...headers.slice(5).map(() => ({ wch: 13 })),
      ];

      const guideRows = [
        ['PETUNJUK INPUT NILAI UJIAN SEKOLAH (N_US) TEORI & PRAKTIK'],
        ['SD NEGERI 006 SUNGAI BULUH • KEC. SINGINGI HILIR'],
        [''],
        ['1. Masukkan nilai ujian tertulis (teori) pada kolom berakhiran "_Tulis".'],
        ['2. Masukkan nilai ujian praktik pada mapel yang memiliki ujian praktik (PAB, BIN, IPA, SBdP, PJOK).'],
        ['3. Nilai akhir US dihitung otomatis dari 50% Tulis + 50% Praktik (atau 100% Tulis jika tanpa praktik).'],
        ['4. Rentang nilai: 0 s.d. 100.'],
      ];
      const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
      wsGuide['!cols'] = [{ wch: 65 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'NILAI_UJIAN_SEKOLAH');
      XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK');

      const fileName = `Template_Nilai_US_SDN006.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast('Template Nilai Diunduh', `Berkas ${fileName} berhasil disimpan.`, 'success');
    }
  };

  const downloadMasterGradesWorkbook = () => {
    const wb = XLSX.utils.book_new();

    // 1. Petunjuk
    const guideRows = [
      ['BUKU TEMPLATE MASTER NILAI RAPOR & UJIAN SEKOLAH (N_US)'],
      ['SD NEGERI 006 SUNGAI BULUH • KECAMATAN SINGINGI HILIR • KAB. KUANTAN SINGINGI'],
      ['TAHUN PELAJARAN 2025/2026'],
      [''],
      ['STRUKTUR SHEET DALAM BERKAS INI:'],
      ['1. PETUNJUK: Halaman panduan pengisian'],
      ['2. RAPOR_S7 s/d RAPOR_S12: Nilai Rapor Semester 7 (Kelas 4 Sem 1) s.d. Semester 12 (Kelas 6 Sem 2)'],
      ['3. NILAI_US: Nilai Ujian Sekolah Teori & Praktik (10 Mata Pelajaran)'],
      [''],
      ['ATURAN PENGISIAN:'],
      ['- Nilai diisi berupa angka 0 s.d. 100.'],
      ['- Kolom No Peserta, NISN, dan Nama Siswa jangan diubah agar sistem dapat mencocokkan data secara otomatis.'],
      ['- Pada sheet NILAI_US, mata pelajaran praktik diisi pada kolom "_Praktik".'],
      ['- Berkas ini dapat langsung diimpor kembali ke aplikasi melalui menu "Impor Nilai (.xlsx)".'],
    ];
    const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
    wsGuide['!cols'] = [{ wch: 75 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK');

    // 2. Sheets Rapor S7 - S12
    const semestersList: Array<'s7' | 's8' | 's9' | 's10' | 's11' | 's12'> = [
      's7',
      's8',
      's9',
      's10',
      's11',
      's12',
    ];

    semestersList.forEach((sem) => {
      const headers = [
        'No',
        'No Peserta',
        'NISN',
        'Nama Peserta',
        'Ruang',
        ...SUBJECT_LIST.map((s) => s.code),
      ];

      const rows = students.map((s, idx) => {
        const scores = s.rapor[sem] || {};
        return [
          idx + 1,
          s.noPeserta,
          s.nisn,
          s.nama,
          s.ruang,
          ...SUBJECT_LIST.map((sub) => scores[sub.key] ?? 85),
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 16 },
        { wch: 14 },
        { wch: 28 },
        { wch: 12 },
        ...SUBJECT_LIST.map(() => ({ wch: 10 })),
      ];
      XLSX.utils.book_append_sheet(wb, ws, `RAPOR_${sem.toUpperCase()}`);
    });

    // 3. Sheet Nilai US
    const usHeaders = [
      'No',
      'No Peserta',
      'NISN',
      'Nama Peserta',
      'Ruang',
      'PAB_Tulis',
      'PAB_Praktik',
      'PPKn_Tulis',
      'BIN_Tulis',
      'BIN_Praktik',
      'MAT_Tulis',
      'IPA_Tulis',
      'IPA_Praktik',
      'IPS_Tulis',
      'SBdP_Tulis',
      'SBdP_Praktik',
      'PJOK_Tulis',
      'PJOK_Praktik',
      'MULOK_Tulis',
      'BING_Tulis',
    ];

    const usRows = students.map((s, idx) => {
      const u = s.us;
      return [
        idx + 1,
        s.noPeserta,
        s.nisn,
        s.nama,
        s.ruang,
        u.pab?.tulis ?? 85,
        u.pab?.praktik ?? 85,
        u.ppkn?.tulis ?? 85,
        u.bin?.tulis ?? 85,
        u.bin?.praktik ?? 85,
        u.mat?.tulis ?? 85,
        u.ipa?.tulis ?? 85,
        u.ipa?.praktik ?? 85,
        u.ips?.tulis ?? 85,
        u.sbdp?.tulis ?? 85,
        u.sbdp?.praktik ?? 85,
        u.pjok?.tulis ?? 85,
        u.pjok?.praktik ?? 85,
        u.mulok?.tulis ?? 85,
        u.bing?.tulis ?? 85,
      ];
    });

    const wsUS = XLSX.utils.aoa_to_sheet([usHeaders, ...usRows]);
    wsUS['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 14 },
      { wch: 28 },
      { wch: 12 },
      ...usHeaders.slice(5).map(() => ({ wch: 13 })),
    ];
    XLSX.utils.book_append_sheet(wb, wsUS, 'NILAI_US');

    const fileName = `Master_Template_Nilai_Lengkap_SDN006.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast('Master Template Diunduh', `Berkas ${fileName} (Semua Semester & US) berhasil disimpan.`, 'success');
  };

  const importMultiSheetGrades = (
    sheetData: Record<string, Array<{ identifier: string; scores: Record<string, any> }>>
  ) => {
    let totalMatched = 0;
    const sheets = Object.keys(sheetData);

    setStudents((prev) => {
      return prev.map((std) => {
        let studentUpdated = false;
        let updatedRapor = { ...std.rapor };
        let updatedUS = { ...std.us };

        sheets.forEach((sheetKey) => {
          const rows = sheetData[sheetKey] || [];
          const match = rows.find((r) => {
            const id = r.identifier.trim().toLowerCase();
            return (
              std.noPeserta.toLowerCase() === id ||
              std.nisn.toLowerCase() === id ||
              std.nama.toLowerCase() === id
            );
          });

          if (!match) return;
          studentUpdated = true;

          const norm = sheetKey.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (norm.includes('us') || norm.includes('ujian')) {
            SUBJECT_LIST.forEach((sub) => {
              const k = sub.key;
              const code = sub.code.toLowerCase();
              const tulisVal =
                match.scores[`${k}_tulis`] ??
                match.scores[`${code}_tulis`] ??
                match.scores[k] ??
                match.scores[code];
              const praktikVal =
                match.scores[`${k}_praktik`] ?? match.scores[`${code}_praktik`];
              const current = updatedUS[k] || { tulis: 80, akhir: 80 };
              const tulis =
                tulisVal !== undefined && !isNaN(Number(tulisVal))
                  ? Math.min(100, Math.max(0, Number(tulisVal)))
                  : current.tulis;
              const praktik =
                praktikVal !== undefined && !isNaN(Number(praktikVal))
                  ? Math.min(100, Math.max(0, Number(praktikVal)))
                  : current.praktik;
              const akhir =
                praktik !== undefined && praktik > 0
                  ? Math.round((tulis * 0.5 + praktik * 0.5) * 10) / 10
                  : tulis;
              updatedUS[k] = { tulis, praktik, akhir };
            });
          } else {
            // Find semester s7..s12
            let sem: 's7' | 's8' | 's9' | 's10' | 's11' | 's12' = 's12';
            if (norm.includes('s7') || norm.includes('sem7') || norm.includes('semester7')) sem = 's7';
            else if (norm.includes('s8') || norm.includes('sem8') || norm.includes('semester8')) sem = 's8';
            else if (norm.includes('s9') || norm.includes('sem9') || norm.includes('semester9')) sem = 's9';
            else if (norm.includes('s10') || norm.includes('sem10') || norm.includes('semester10')) sem = 's10';
            else if (norm.includes('s11') || norm.includes('sem11') || norm.includes('semester11')) sem = 's11';
            else if (norm.includes('s12') || norm.includes('sem12') || norm.includes('semester12')) sem = 's12';

            const currentSem = updatedRapor[sem] || ({} as Record<SubjectKey, number>);
            const newSemScores = { ...currentSem };
            SUBJECT_LIST.forEach((sub) => {
              const val = match.scores[sub.key] ?? match.scores[sub.code.toLowerCase()];
              if (val !== undefined && val !== null && !isNaN(Number(val))) {
                newSemScores[sub.key] = Math.min(100, Math.max(0, Number(val)));
              }
            });
            updatedRapor[sem] = newSemScores;
          }
        });

        if (studentUpdated) {
          totalMatched++;
          return {
            ...std,
            rapor: updatedRapor,
            us: updatedUS,
          };
        }
        return std;
      });
    });

    showToast(
      'Impor Multi-Sheet Berhasil',
      `${totalMatched} siswa diperbarui dari ${sheets.length} lembar kerja.`,
      'success'
    );
    return { totalMatched, sheetsProcessed: sheets.length };
  };

  const importGradesBatch = (
    category: 'rapor' | 'us',
    semester: 's7' | 's8' | 's9' | 's10' | 's11' | 's12',
    rows: Array<{
      identifier: string;
      scores: Record<string, any>;
    }>
  ) => {
    let matched = 0;

    setStudents((prev) => {
      return prev.map((std) => {
        const match = rows.find((r) => {
          const id = r.identifier.trim().toLowerCase();
          return (
            std.noPeserta.toLowerCase() === id ||
            std.nisn.toLowerCase() === id ||
            std.nama.toLowerCase() === id
          );
        });

        if (!match) return std;
        matched++;

        if (category === 'rapor') {
          const currentRapor = std.rapor[semester] || ({} as Record<SubjectKey, number>);
          const updatedRapor = { ...currentRapor };

          SUBJECT_LIST.forEach((sub) => {
            const val = match.scores[sub.key] ?? match.scores[sub.code.toLowerCase()];
            if (val !== undefined && val !== null && !isNaN(Number(val))) {
              updatedRapor[sub.key] = Math.min(100, Math.max(0, Number(val)));
            }
          });

          return {
            ...std,
            rapor: {
              ...std.rapor,
              [semester]: updatedRapor,
            },
          };
        } else {
          // category === 'us'
          const updatedUS = { ...std.us };

          SUBJECT_LIST.forEach((sub) => {
            const k = sub.key;
            const code = sub.code.toLowerCase();
            const tulisVal =
              match.scores[`${k}_tulis`] ??
              match.scores[`${code}_tulis`] ??
              match.scores[k] ??
              match.scores[code];

            const praktikVal =
              match.scores[`${k}_praktik`] ??
              match.scores[`${code}_praktik`];

            const current = updatedUS[k] || { tulis: 80, akhir: 80 };
            const tulis =
              tulisVal !== undefined && tulisVal !== null && !isNaN(Number(tulisVal))
                ? Math.min(100, Math.max(0, Number(tulisVal)))
                : current.tulis;
            const praktik =
              praktikVal !== undefined && praktikVal !== null && !isNaN(Number(praktikVal))
                ? Math.min(100, Math.max(0, Number(praktikVal)))
                : current.praktik;
            const akhir =
              praktik !== undefined && praktik > 0
                ? Math.round((tulis * 0.5 + praktik * 0.5) * 10) / 10
                : tulis;

            updatedUS[k] = { tulis, praktik, akhir };
          });

          return {
            ...std,
            us: updatedUS,
          };
        }
      });
    });

    showToast(
      'Impor Nilai Berhasil',
      `${matched} dari ${rows.length} siswa berhasil diperbarui nilainya.`,
      'success'
    );
    return { matched, total: rows.length };
  };

  return (
    <AppContext.Provider
      value={{
        students,
        schoolProfile,
        supervisors,
        committee,
        diplomaRecords,
        activeTab,
        setActiveTab,
        darkMode,
        toggleDarkMode,
        selectedStudentForDetail,
        setSelectedStudentForDetail,
        selectedStudentForSKHU,
        setSelectedStudentForSKHU,
        selectedStudentForCert,
        setSelectedStudentForCert,
        selectedRoomForPrint,
        setSelectedRoomForPrint,
        toasts,
        showToast,
        removeToast,
        addStudent,
        updateStudent,
        deleteStudent,
        updateStudentRaporScore,
        updateStudentUSScore,
        updateSchoolProfile,
        updateSupervisor,
        addSupervisor,
        deleteSupervisor,
        setSupervisorsList,
        resetSupervisorsToDefault,
        updateCommitteeMember,
        addCommitteeMember,
        deleteCommitteeMember,
        setCommitteeList,
        resetCommitteeToDefault,
        updateDiplomaRecord,
        updateStudentPhoto,
        batchUpdateStudentPhotos,
        applyDefaultOfficialAvatars,
        clearAllStudentPhotos,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        resetSubjectsToDefault,
        resetToDefaultData,
        exportToCSV,
        exportToJSON,
        importFromJSON,
        downloadStudentCSVTemplate,
        downloadStudentExcelTemplate,
        importStudentsList,
        downloadGradesExcelTemplate,
        downloadMasterGradesWorkbook,
        importGradesBatch,
        importMultiSheetGrades,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
