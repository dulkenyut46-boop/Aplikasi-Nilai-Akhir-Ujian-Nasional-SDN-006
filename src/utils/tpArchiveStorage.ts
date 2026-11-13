import {
  Student,
  Supervisor,
  CommitteeMember,
  DiplomaRecord,
  SubjectInfo,
} from '../types';

export interface TpArchiveMeta {
  tahunPelajaran: string;
  updatedAt: string;
  locked: boolean;
  studentCount: number;
  supervisorCount: number;
  committeeCount: number;
  diplomaCount: number;
  hasData: boolean;
}

export interface TpModuleStates {
  baPelaksanaan?: string | null;
  tpuLeader?: string | null;
  panitiaMeta?: string | null;
  guruList?: string | null;
  skKelulusan?: string | null;
  undangan?: string | null;
  beritaAcaraDoc?: string | null;
  hadirRapatMeta?: string | null;
  serahTerimaMeta?: string | null;
  perpisahanMeta?: string | null;
  kartuTtdStempel?: string | null;
  kartuLayout?: string | null;
}

export interface TpSnapshot {
  tahunPelajaran: string;
  updatedAt: string;
  locked: boolean;
  tanggalKelulusan?: string;
  students: Student[];
  supervisors: Supervisor[];
  committee: CommitteeMember[];
  diplomaRecords: DiplomaRecord[];
  subjects: SubjectInfo[];
  modules: TpModuleStates;
}

const TP_INDEX_KEY = 'sdn006_un_tp_index_v1';
const TP_DATA_PREFIX = 'sdn006_un_tp_data_v1__';
const ACTIVE_TP_KEY = 'sdn006_un_active_tp_v1';

export const MODULE_STORAGE_KEYS: Record<keyof TpModuleStates, string> = {
  baPelaksanaan: 'sdn006_un_ba_pelaksanaan_pdf_v2',
  tpuLeader: 'sdn006_un_tpu_leader_v1',
  panitiaMeta: 'sdn006_un_panitia_meta_v1',
  guruList: 'sdn006_rapat_guru_list_v2',
  skKelulusan: 'sdn006_sk_kelulusan_state_v3',
  undangan: 'sdn006_undangan_state_v1',
  beritaAcaraDoc: 'sdn006_ba_state_v1',
  hadirRapatMeta: 'sdn006_hadir_rapat_meta',
  serahTerimaMeta: 'sdn006_un_serah_terima_meta_v1',
  perpisahanMeta: 'sdn006_un_perpisahan_meta_v1',
  kartuTtdStempel: 'sdn006_kartu_ujian_ttd_stempel_v1',
  kartuLayout: 'sdn006_kartu_ujian_layout_v1',
};

export function normalizeTpLabel(tp: string): string {
  return tp.trim().replace(/\s+/g, '');
}

export function getTpStorageKey(tp: string): string {
  const safe = normalizeTpLabel(tp).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${TP_DATA_PREFIX}${safe}`;
}

export function loadActiveTp(): string | null {
  try {
    return localStorage.getItem(ACTIVE_TP_KEY);
  } catch {
    return null;
  }
}

export function saveActiveTp(tp: string): void {
  try {
    localStorage.setItem(ACTIVE_TP_KEY, normalizeTpLabel(tp));
  } catch (err) {
    console.warn('Gagal menyimpan TP aktif:', err);
  }
}

export function loadTpIndex(): TpArchiveMeta[] {
  try {
    const raw = localStorage.getItem(TP_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTpIndex(index: TpArchiveMeta[]): void {
  try {
    const sorted = [...index].sort((a, b) =>
      b.tahunPelajaran.localeCompare(a.tahunPelajaran)
    );
    localStorage.setItem(TP_INDEX_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.warn('Gagal menyimpan indeks arsip TP:', err);
  }
}

export function hasTpArchive(tp: string): boolean {
  const norm = normalizeTpLabel(tp);
  const index = loadTpIndex();
  if (index.some((item) => normalizeTpLabel(item.tahunPelajaran) === norm)) {
    return true;
  }
  try {
    return localStorage.getItem(getTpStorageKey(norm)) !== null;
  } catch {
    return false;
  }
}

export function loadTpSnapshot(tp: string): TpSnapshot | null {
  try {
    const raw = localStorage.getItem(getTpStorageKey(tp));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TpSnapshot;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (err) {
    console.warn('Gagal memuat arsip TP:', tp, err);
    return null;
  }
}

export function readModuleStatesFromStorage(): TpModuleStates {
  const result: TpModuleStates = {};
  (Object.keys(MODULE_STORAGE_KEYS) as Array<keyof TpModuleStates>).forEach((k) => {
    try {
      result[k] = localStorage.getItem(MODULE_STORAGE_KEYS[k]);
    } catch {
      result[k] = null;
    }
  });
  return result;
}

export function writeModuleStatesToStorage(modules?: TpModuleStates): void {
  (Object.keys(MODULE_STORAGE_KEYS) as Array<keyof TpModuleStates>).forEach((k) => {
    const storageKey = MODULE_STORAGE_KEYS[k];
    const val = modules?.[k];
    try {
      if (val !== undefined && val !== null) {
        localStorage.setItem(storageKey, val);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (err) {
      console.warn('Gagal memulihkan modul state:', storageKey, err);
    }
  });
}

export function resetPerTpModuleStatesInStorage(): void {
  const keysToClear: Array<keyof TpModuleStates> = [
    'baPelaksanaan',
    'panitiaMeta',
    'skKelulusan',
    'undangan',
    'beritaAcaraDoc',
    'hadirRapatMeta',
    'serahTerimaMeta',
    'perpisahanMeta',
  ];
  keysToClear.forEach((k) => {
    try {
      localStorage.removeItem(MODULE_STORAGE_KEYS[k]);
    } catch {
      // ignore
    }
  });
}

export function computeHasData(snapshot: {
  students: Student[];
  supervisors: Supervisor[];
  committee: CommitteeMember[];
  diplomaRecords: DiplomaRecord[];
}): boolean {
  return (
    snapshot.students.length > 0 ||
    snapshot.supervisors.length > 0 ||
    snapshot.committee.length > 0 ||
    snapshot.diplomaRecords.length > 0
  );
}

export function saveTpSnapshot(
  snapshot: TpSnapshot,
  options?: { lockIfFilled?: boolean; preserveExistingLock?: boolean }
): TpArchiveMeta {
  const normTp = normalizeTpLabel(snapshot.tahunPelajaran);
  const existingIndex = loadTpIndex();
  const existingMeta = existingIndex.find(
    (item) => normalizeTpLabel(item.tahunPelajaran) === normTp
  );

  const hasData = computeHasData(snapshot);
  let resolvedLocked = snapshot.locked;

  if (options?.preserveExistingLock && existingMeta) {
    resolvedLocked = existingMeta.locked;
  }
  if (options?.lockIfFilled && hasData) {
    resolvedLocked = true;
  }

  const finalSnapshot: TpSnapshot = {
    ...snapshot,
    tahunPelajaran: normTp,
    locked: resolvedLocked,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(getTpStorageKey(normTp), JSON.stringify(finalSnapshot));
  } catch (err) {
    console.warn('Gagal menyimpan snapshot TP:', normTp, err);
  }

  const meta: TpArchiveMeta = {
    tahunPelajaran: normTp,
    updatedAt: finalSnapshot.updatedAt,
    locked: resolvedLocked,
    studentCount: finalSnapshot.students.length,
    supervisorCount: finalSnapshot.supervisors.length,
    committeeCount: finalSnapshot.committee.length,
    diplomaCount: finalSnapshot.diplomaRecords.length,
    hasData,
  };

  const nextIndex = existingIndex.filter(
    (item) => normalizeTpLabel(item.tahunPelajaran) !== normTp
  );
  nextIndex.push(meta);
  saveTpIndex(nextIndex);

  return meta;
}

export function setTpLockInStorage(tp: string, locked: boolean): TpArchiveMeta[] {
  const normTp = normalizeTpLabel(tp);
  const snap = loadTpSnapshot(normTp);
  if (snap) {
    snap.locked = locked;
    try {
      localStorage.setItem(getTpStorageKey(normTp), JSON.stringify(snap));
    } catch {
      // ignore
    }
  }

  const index = loadTpIndex();
  const updated = index.map((item) =>
    normalizeTpLabel(item.tahunPelajaran) === normTp
      ? { ...item, locked, updatedAt: new Date().toISOString() }
      : item
  );
  saveTpIndex(updated);
  return updated;
}

export function getTpLockFromStorage(tp: string): boolean {
  const normTp = normalizeTpLabel(tp);
  const index = loadTpIndex();
  const meta = index.find((item) => normalizeTpLabel(item.tahunPelajaran) === normTp);
  if (meta) return meta.locked;
  const snap = loadTpSnapshot(normTp);
  return snap?.locked ?? false;
}
