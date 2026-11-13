import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentManagementView } from './components/students/StudentManagementView';
import { StudentPhotoManagementView } from './components/students/StudentPhotoManagementView';
import { RaporGradesView } from './components/grades/RaporGradesView';
import { ExamGradesView } from './components/grades/ExamGradesView';
import { FinalRecapView } from './components/grades/FinalRecapView';
import { GradesTemplateAndImportView } from './components/grades/GradesTemplateAndImportView';
import { ExamToolsView } from './components/exam-tools/ExamToolsView';
import { DiplomaManagementView } from './components/diploma/DiplomaManagementView';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
        return <StudentManagementView />;
      case 'student-photos':
        return <StudentPhotoManagementView />;
      case 'rapor':
        return <RaporGradesView />;
      case 'exam':
        return <ExamGradesView />;
      case 'final-rekap':
        return <FinalRecapView />;
      case 'grades-template-import':
        return <GradesTemplateAndImportView />;
      case 'exam-tools':
        return <ExamToolsView />;
      case 'diploma':
        return <DiplomaManagementView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen app-blue-atmosphere relative text-slate-950 antialiased dark:text-slate-50 flex print:bg-white">
      {/* Subtle Light-Blue Atmospheric Nuance Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 print:hidden" aria-hidden="true">
        <div className="absolute -top-28 right-8 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
        <div className="absolute top-1/3 left-1/3 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute -bottom-24 left-1/4 h-96 w-96 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/10" />
      </div>

      {/* Responsive Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`relative z-10 flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out main-content-layout print:pl-0 print:m-0 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Topbar */}
        <Topbar
          collapsed={collapsed}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto print:p-0 print:max-w-none print:m-0">
          {renderActiveView()}
        </main>

        {/* Footer */}
        <footer className="border-t border-sky-300/80 bg-white/85 py-4 px-6 text-center text-xs font-medium text-slate-800 backdrop-blur-md dark:border-sky-900/60 dark:bg-slate-900/75 dark:text-slate-300 print:hidden">
          <p>
            © {new Date().getFullYear()} Aplikasi Rekap Nilai Akhir Ujian Nasional • <b>SDN 006 Sungai Buluh</b>, Kecamatan Singingi Hilir, Kabupaten Kuantan Singingi, Riau
          </p>
        </footer>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
