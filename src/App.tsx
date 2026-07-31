import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { TeacherManagement } from './components/admin/TeacherManagement';
import { ParentManagement } from './components/admin/ParentManagement';
import { ClassSubjectManagement } from './components/admin/ClassSubjectManagement';
import { SchoolSettingsView } from './components/admin/SchoolSettings';
import { SchoolRegistrationModal } from './components/admin/SchoolRegistrationModal';

// Teacher Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AttendanceManager } from './components/teacher/AttendanceManager';
import { HomeworkManager } from './components/teacher/HomeworkManager';
import { StudyMaterialManager } from './components/teacher/StudyMaterialManager';
import { ExamManager } from './components/teacher/ExamManager';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentHomeworkView } from './components/student/StudentHomework';
import { StudentFeePayment } from './components/student/StudentFeePayment';

// Parent Views
import { ParentDashboard } from './components/parent/ParentDashboard';

// Common / Shared Views
import { AIAssistantSuite } from './components/common/AIAssistant';
import { NoticesView } from './components/common/NoticesView';
import { TimetableView } from './components/common/TimetableView';
import { ReportsView } from './components/common/ReportsView';
import { MessagingView } from './components/common/MessagingView';
import { SchoolCalendar } from './components/common/SchoolCalendar';
import { AdminAuditLog } from './components/admin/AdminAuditLog';
import { OfflineBanner } from './components/common/OfflineBanner';
import { PerformanceOverview } from './components/common/PerformanceOverview';
import { LibraryManager } from './components/library/LibraryManager';
import { KeyboardShortcutManager } from './components/common/KeyboardShortcutManager';
import { SchoolLandingPage } from './components/common/SchoolLandingPage';
import { IDCardStudioView } from './components/common/IDCardStudioView';
import { ReadmeDocView } from './components/common/ReadmeDocView';

function MainAppContent() {
  const { user } = useAuth();
  const [isLandingPage, setIsLandingPage] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRegisterSchoolOpen, setIsRegisterSchoolOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    setIsLandingPage(false);
  };

  const handleEnterDashboard = (role?: 'admin' | 'teacher' | 'student' | 'parent') => {
    setIsLandingPage(false);
    setActiveTab('dashboard');
  };

  if (isLandingPage) {
    return <SchoolLandingPage onEnterDashboard={handleEnterDashboard} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (user?.role === 'admin') {
          return (
            <AdminDashboard
              setActiveTab={setActiveTab}
              onOpenRegisterSchool={() => setIsRegisterSchoolOpen(true)}
            />
          );
        }
        if (user?.role === 'teacher') {
          return <TeacherDashboard setActiveTab={setActiveTab} />;
        }
        if (user?.role === 'student') {
          return <StudentDashboard setActiveTab={setActiveTab} />;
        }
        if (user?.role === 'parent') {
          return <ParentDashboard setActiveTab={setActiveTab} />;
        }
        return <AdminDashboard setActiveTab={setActiveTab} onOpenRegisterSchool={() => setIsRegisterSchoolOpen(true)} />;

      case 'students':
        return <StudentManagement />;

      case 'teachers':
        return <TeacherManagement />;

      case 'parents':
        return <ParentManagement />;

      case 'classes':
        return <ClassSubjectManagement />;

      case 'attendance':
        return <AttendanceManager />;

      case 'homework':
        if (user?.role === 'student') {
          return <StudentHomeworkView />;
        }
        return <HomeworkManager />;

      case 'fees':
        return <StudentFeePayment />;

      case 'materials':
        return <StudyMaterialManager />;

      case 'exams':
        return <ExamManager />;

      case 'notices':
        return <NoticesView />;

      case 'timetable':
        return <TimetableView />;

      case 'reports':
        return <ReportsView />;

      case 'settings':
        return <SchoolSettingsView />;

      case 'ai-assistant':
        return <AIAssistantSuite />;

      case 'chat':
        return <MessagingView />;

      case 'calendar':
        return <SchoolCalendar />;

      case 'audit-log':
        return <AdminAuditLog />;

      case 'performance':
        return <PerformanceOverview />;

      case 'library':
        return <LibraryManager />;

      case 'id-cards':
        return <IDCardStudioView />;

      case 'readme':
        return <ReadmeDocView />;

      default:
        return <AdminDashboard setActiveTab={setActiveTab} onOpenRegisterSchool={() => setIsRegisterSchoolOpen(true)} />;
    }
  };

  return (
    <div className="fixed inset-0 h-full w-full bg-[#F1F5F9] dark:bg-[#090D16] flex flex-col font-sans text-slate-800 dark:text-slate-100 selection:bg-blue-600 selection:text-white overflow-hidden transition-colors">
      <OfflineBanner />
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSchoolRegister={() => setIsRegisterSchoolOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onGoToLandingPage={() => setIsLandingPage(true)}
      />

      <KeyboardShortcutManager
        activeTab={activeTab}
        onNavigate={handleTabChange}
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onOpen={() => setIsShortcutsOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative min-h-0 w-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onGoToLandingPage={() => setIsLandingPage(true)}
        />

        <main className="flex-1 p-3.5 sm:p-6 pb-16 lg:pb-6 overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0">
          <div key={activeTab} className="animate-tab-fade-in space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <SchoolRegistrationModal
        isOpen={isRegisterSchoolOpen}
        onClose={() => setIsRegisterSchoolOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
