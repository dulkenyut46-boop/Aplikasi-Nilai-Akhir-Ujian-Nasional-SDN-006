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
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50 flex">
      {/* Responsive Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out main-content-layout print:pl-0 print:m-0 ${
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
        <footer className="border-t border-zinc-200 bg-white/60 py-4 px-6 text-center text-xs text-zinc-500 backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 print:hidden">
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
