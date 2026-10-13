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
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-emerald-950 text-white transition-all duration-300 ease-in-out border-r border-emerald-900/80 shadow-xl ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-emerald-900/70 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md border border-emerald-400/30">
              <School className="h-6 w-6 text-amber-300" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
                  REKAP UJIAN NASIONAL
                </span>
                <span className="text-sm font-extrabold text-white truncate">
                  SDN 006 SUNGAI BULUH
                </span>
                <span className="text-[10px] text-emerald-300/80">Kec. Singingi Hilir - TP {schoolProfile.tahunPelajaran}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors"
            title={collapsed ? 'Perluas Menu' : 'Perkecil Menu'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          <div className="px-2 mb-2">
            {!collapsed && (
              <span className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider">
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
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/40 font-semibold'
                    : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-amber-300' : 'text-emerald-400 group-hover:text-emerald-200'
                  }`}
                />

                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <div className="truncate">
                      <div className="truncate leading-tight">{item.label}</div>
                      <div className="text-[10px] text-emerald-300/70 truncate">{item.sublabel}</div>
                    </div>
                    {item.badge && (
                      <span
                        className={`ml-2 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? 'bg-amber-400 text-emerald-950'
                            : 'bg-emerald-900/90 text-emerald-300 border border-emerald-800'
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
        <div className="border-t border-emerald-900/80 p-3 bg-emerald-950/90">
          {!collapsed ? (
            <div className="rounded-lg bg-emerald-900/50 p-2.5 border border-emerald-800/60">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-200 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-emerald-400" />
                  Status Rekap
                </span>
                <span className="font-bold text-amber-300">100% Siap</span>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                NPSN: <span className="text-white font-mono">{schoolProfile.npsn}</span> | Akreditasi:{' '}
                <span className="text-amber-300 font-bold">{schoolProfile.akreditasi}</span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
