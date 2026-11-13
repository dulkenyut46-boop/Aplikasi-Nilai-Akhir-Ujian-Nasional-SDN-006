import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileSpreadsheet,
  Award,
  Layers,
  GraduationCap,
  Settings,
  School,
  ChevronLeft,
  ChevronRight,
  Database,
  Printer,
  FileUp,
  Camera,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { activeTab, setActiveTab, students, schoolProfile } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Rekap',
      sublabel: 'Analitik & KPI Nilai',
      icon: LayoutDashboard,
      badge: 'Utama',
    },
    {
      id: 'students',
      label: 'Data Peserta (PD)',
      sublabel: 'Kelengkapan Biodata',
      icon: Users,
      badge: `${students.length}`,
    },
    {
      id: 'student-photos',
      label: 'Foto Peserta Siswa',
      sublabel: 'Denah, Kartu & Ijazah',
      icon: Camera,
      badge: `${students.filter((s) => Boolean(s.foto)).length}`,
    },
    {
      id: 'rapor',
      label: 'Nilai Rapor (S7 - S12)',
      sublabel: 'Rata-rata Semester K13',
      icon: BookOpen,
      badge: '6 Sem',
    },
    {
      id: 'exam',
      label: 'Nilai Ujian Sekolah (US)',
      sublabel: 'Teori & Praktik',
      icon: FileSpreadsheet,
      badge: '10 Mapel',
    },
    {
      id: 'final-rekap',
      label: 'Rekap Nilai Akhir',
      sublabel: 'Perangkingan & Bobot',
      icon: Award,
      badge: 'Transkrip',
    },
    {
      id: 'grades-template-import',
      label: 'Template & Impor Nilai',
      sublabel: 'Format .xlsx & Impor',
      icon: FileUp,
      badge: '.XLSX',
    },
    {
      id: 'exam-tools',
      label: 'Perangkat & Ruang',
      sublabel: 'Denah, Kartu, Hadir',
      icon: Layers,
      badge: 'R1 - R4',
    },
    {
      id: 'diploma',
      label: 'Ijazah & Kelulusan',
      sublabel: 'Transkrip Nilai & Blangko',
      icon: GraduationCap,
      badge: 'Resmi',
    },
    {
      id: 'settings',
      label: 'Pengaturan Sekolah',
      sublabel: 'Bobot, Panitia, Cadangan',
      icon: Settings,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-gradient-to-b from-sky-100/95 via-blue-100/90 to-cyan-100/90 backdrop-blur-xl text-slate-800 transition-all duration-300 ease-in-out border-r border-sky-200/90 shadow-xl shadow-sky-900/10 dark:from-slate-900/95 dark:via-sky-950/95 dark:to-slate-900/95 dark:text-slate-100 dark:border-sky-900/60 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Subtle inner light-blue sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-sky-200/35 dark:from-sky-500/5 dark:to-transparent" />

        {/* Brand Header */}
        <div className="relative z-10 flex h-18 items-center justify-between border-b border-sky-300/80 dark:border-sky-900/60 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white shadow-md shadow-sky-600/25 border border-sky-400/60">
              <School className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-extrabold tracking-widest text-sky-900 dark:text-sky-400 uppercase">
                  REKAP UJIAN NASIONAL
                </span>
                <span className="text-sm font-black text-slate-950 dark:text-white truncate">
                  SDN 006 SUNGAI BULUH
                </span>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-sky-300/85">Kec. Singingi Hilir - TP {schoolProfile.tahunPelajaran}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg bg-white/85 text-sky-950 border border-sky-300/90 hover:bg-sky-200 hover:text-slate-950 dark:bg-sky-900/60 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-800 dark:hover:text-white transition-colors"
            title={collapsed ? 'Perluas Menu' : 'Perkecil Menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="relative z-10 flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          <div className="px-2 mb-2">
            {!collapsed && (
              <span className="text-[11px] font-bold text-sky-950 dark:text-sky-300 uppercase tracking-wider">
                Modul Manajemen Ujian
              </span>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-700 to-blue-700 text-white shadow-md shadow-sky-700/25 font-bold'
                    : 'text-slate-900 font-semibold hover:bg-white/85 hover:text-slate-950 hover:shadow-xs dark:text-sky-100/90 dark:hover:bg-sky-900/50 dark:hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-amber-200' : 'text-sky-800 group-hover:text-blue-900 dark:text-sky-400 dark:group-hover:text-sky-200'
                  }`}
                />

                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <div className="truncate">
                      <div className="truncate leading-tight">{item.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-sky-50 font-medium' : 'text-slate-700 font-medium dark:text-sky-300/80'}`}>{item.sublabel}</div>
                    </div>
                    {item.badge && (
                      <span
                        className={`ml-2 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? 'bg-white text-sky-900 shadow-xs'
                            : 'bg-white/90 text-sky-950 border border-sky-300/90 dark:bg-sky-900/80 dark:text-sky-200 dark:border-sky-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* School Status Footer */}
        <div className="relative z-10 border-t border-sky-300/80 p-3 bg-sky-100/75 dark:border-sky-900/70 dark:bg-slate-900/80">
          {!collapsed ? (
            <div className="rounded-xl bg-white/90 p-2.5 border border-sky-300/90 shadow-xs dark:bg-sky-950/60 dark:border-sky-800/60">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-900 dark:text-sky-100 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-sky-800 dark:text-sky-400" />
                  Status Rekap
                </span>
                <span className="font-extrabold text-sky-900 dark:text-amber-300">100% Siap</span>
              </div>
              <p className="text-[11px] font-medium text-slate-800 dark:text-sky-300/85">
                NPSN: <span className="text-slate-950 dark:text-white font-mono font-bold">{schoolProfile.npsn}</span> | Akreditasi:{' '}
                <span className="text-sky-900 dark:text-amber-300 font-extrabold">{schoolProfile.akreditasi}</span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-2 w-2 rounded-full bg-sky-700 animate-ping" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
