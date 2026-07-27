import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'ar';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', dir: 'rtl' },
];

// Dictionary of translations
const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Overview Dashboard',
    'nav.performance': 'Performance Overview',
    'nav.students': 'Student Directory',
    'nav.teachers': 'Faculty & Staff',
    'nav.parents': 'Parent Network',
    'nav.classes': 'Classes & Subjects',
    'nav.attendance': 'Attendance Register',
    'nav.homework': 'Assignments & Tasks',
    'nav.materials': 'Study Materials',
    'nav.exams': 'Exams & Grades',
    'nav.fees': 'Tuition & Fee Portal',
    'nav.notices': 'Notices & Circulars',
    'nav.timetable': 'Class Schedules',
    'nav.calendar': 'School Calendar',
    'nav.aiAssistant': 'AI Assistant',
    'nav.messaging': 'Live Messaging',
    'nav.reports': 'Reports Engine',
    'nav.auditLog': 'Admin Audit Log',
    'nav.settings': 'System Settings',

    // Roles
    'role.admin': 'Administrator',
    'role.teacher': 'Educator',
    'role.student': 'Student',
    'role.parent': 'Guardian / Parent',

    // Header & Controls
    'header.search': 'Search students, courses, staff...',
    'header.notifications': 'Notifications',
    'header.registerSchool': 'Register School',
    'header.demoRoles': 'Switch Demo Role',
    'header.language': 'Language',
    'header.logout': 'Sign Out',

    // Common Actions
    'action.save': 'Save Changes',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.refresh': 'Refresh',
    'action.export': 'Export',
    'action.add': 'Add New',
    'action.close': 'Close',
    'action.submit': 'Submit',
    'action.inspect': 'Inspect Details',

    // Statuses
    'status.active': 'Active',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.success': 'Success',
    'status.warning': 'Warning',
    'status.error': 'Error',
    'status.info': 'Info',

    // Quick App Info
    'app.tagline': 'Enterprise Education Management Suite',
    'app.version': 'v4.2 Enterprise'
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel Principal',
    'nav.students': 'Directorio de Estudiantes',
    'nav.teachers': 'Profesorado y Personal',
    'nav.parents': 'Red de Padres',
    'nav.classes': 'Clases y Asignaturas',
    'nav.attendance': 'Registro de Asistencia',
    'nav.homework': 'Tareas y Trabajos',
    'nav.materials': 'Materiales de Estudio',
    'nav.exams': 'Exámenes y Calificaciones',
    'nav.fees': 'Matrícula y Tasas',
    'nav.notices': 'Avisos y Circulares',
    'nav.timetable': 'Horarios de Clases',
    'nav.calendar': 'Calendario Escolar',
    'nav.aiAssistant': 'Asistente IA',
    'nav.messaging': 'Mensajería en Vivo',
    'nav.reports': 'Motor de Informes',
    'nav.auditLog': 'Registro de Auditoría',
    'nav.settings': 'Configuración del Sistema',

    // Roles
    'role.admin': 'Administrador',
    'role.teacher': 'Educador',
    'role.student': 'Estudiante',
    'role.parent': 'Padre / Tutor',

    // Header & Controls
    'header.search': 'Buscar estudiantes, cursos, personal...',
    'header.notifications': 'Notificaciones',
    'header.registerSchool': 'Registrar Escuela',
    'header.demoRoles': 'Cambiar Rol de Prueba',
    'header.language': 'Idioma',
    'header.logout': 'Cerrar Sesión',

    // Common Actions
    'action.save': 'Guardar Cambios',
    'action.cancel': 'Cancelar',
    'action.delete': 'Eliminar',
    'action.edit': 'Editar',
    'action.search': 'Buscar',
    'action.filter': 'Filtrar',
    'action.refresh': 'Actualizar',
    'action.export': 'Exportar',
    'action.add': 'Añadir Nuevo',
    'action.close': 'Cerrar',
    'action.submit': 'Enviar',
    'action.inspect': 'Inspeccionar Detalle',

    // Statuses
    'status.active': 'Activo',
    'status.pending': 'Pendiente',
    'status.completed': 'Completado',
    'status.success': 'Éxito',
    'status.warning': 'Advertencia',
    'status.error': 'Error',
    'status.info': 'Información',

    // Quick App Info
    'app.tagline': 'Plataforma de Gestión Educativa',
    'app.version': 'v4.2 Empresarial'
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de Bord',
    'nav.students': 'Annuaire des Élèves',
    'nav.teachers': 'Corps Enseignant',
    'nav.parents': 'Réseau des Parents',
    'nav.classes': 'Classes et Matières',
    'nav.attendance': 'Registre de Présence',
    'nav.homework': 'Devoirs et Travaux',
    'nav.materials': 'Supports de Cours',
    'nav.exams': 'Examens et Notes',
    'nav.fees': 'Frais de Scolarité',
    'nav.notices': 'Annonces et Circulaires',
    'nav.timetable': 'Emplois du Temps',
    'nav.calendar': 'Calendrier Scolaire',
    'nav.aiAssistant': 'Assistant IA',
    'nav.messaging': 'Messagerie en Direct',
    'nav.reports': 'Moteur de Rapports',
    'nav.auditLog': 'Journal d\'Audition',
    'nav.settings': 'Paramètres Système',

    // Roles
    'role.admin': 'Administrateur',
    'role.teacher': 'Enseignant',
    'role.student': 'Élève',
    'role.parent': 'Parent / Tuteur',

    // Header & Controls
    'header.search': 'Rechercher élèves, cours, personnel...',
    'header.notifications': 'Notifications',
    'header.registerSchool': 'Inscrire une École',
    'header.demoRoles': 'Changer de Rôle Démo',
    'header.language': 'Langue',
    'header.logout': 'Déconnexion',

    // Common Actions
    'action.save': 'Enregistrer',
    'action.cancel': 'Annuler',
    'action.delete': 'Supprimer',
    'action.edit': 'Modifier',
    'action.search': 'Rechercher',
    'action.filter': 'Filtrer',
    'action.refresh': 'Actualiser',
    'action.export': 'Exporter',
    'action.add': 'Ajouter',
    'action.close': 'Fermer',
    'action.submit': 'Soumettre',
    'action.inspect': 'Inspecter',

    // Statuses
    'status.active': 'Actif',
    'status.pending': 'En attente',
    'status.completed': 'Terminé',
    'status.success': 'Succès',
    'status.warning': 'Avertissement',
    'status.error': 'Erreur',
    'status.info': 'Information',

    // Quick App Info
    'app.tagline': 'Plateforme de Gestion Éducative Enterprise',
    'app.version': 'v4.2 Enterprise'
  },
  de: {
    // Navigation
    'nav.dashboard': 'Übersicht Dashboard',
    'nav.students': 'Schülerverzeichnis',
    'nav.teachers': 'Lehrkräfte & Personal',
    'nav.parents': 'Elternnetzwerk',
    'nav.classes': 'Klassen & Fächer',
    'nav.attendance': 'Anwesenheitsbuch',
    'nav.homework': 'Hausaufgaben & Aufgaben',
    'nav.materials': 'Lernmaterialien',
    'nav.exams': 'Prüfungen & Noten',
    'nav.fees': 'Schulgeld & Gebühren',
    'nav.notices': 'Mitteilungen & Rundschreiben',
    'nav.timetable': 'Stundenpläne',
    'nav.calendar': 'Schulkalender',
    'nav.aiAssistant': 'KI-Assistent',
    'nav.messaging': 'Direktnachrichten',
    'nav.reports': 'Berichtsmodul',
    'nav.auditLog': 'System-Audit-Log',
    'nav.settings': 'Systemeinstellungen',

    // Roles
    'role.admin': 'Administrator',
    'role.teacher': 'Lehrkraft',
    'role.student': 'Schüler/in',
    'role.parent': 'Erziehungsberechtigte/r',

    // Header & Controls
    'header.search': 'Schüler, Kurse, Personal suchen...',
    'header.notifications': 'Benachrichtigungen',
    'header.registerSchool': 'Schule Registrieren',
    'header.demoRoles': 'Demo-Rolle Wechseln',
    'header.language': 'Sprache',
    'header.logout': 'Abmelden',

    // Common Actions
    'action.save': 'Speichern',
    'action.cancel': 'Abbrechen',
    'action.delete': 'Löschen',
    'action.edit': 'Bearbeiten',
    'action.search': 'Suchen',
    'action.filter': 'Filtern',
    'action.refresh': 'Aktualisieren',
    'action.export': 'Exportieren',
    'action.add': 'Hinzufügen',
    'action.close': 'Schließen',
    'action.submit': 'Absenden',
    'action.inspect': 'Prüfen',

    // Statuses
    'status.active': 'Aktiv',
    'status.pending': 'Ausstehend',
    'status.completed': 'Abgeschlossen',
    'status.success': 'Erfolgreich',
    'status.warning': 'Warnung',
    'status.error': 'Fehler',
    'status.info': 'Info',

    // Quick App Info
    'app.tagline': 'Schulverwaltungssoftware Enterprise',
    'app.version': 'v4.2 Enterprise'
  },
  hi: {
    // Navigation
    'nav.dashboard': 'मुख्य डैशबोर्ड',
    'nav.students': 'छात्र निर्देशिका',
    'nav.teachers': 'शिक्षक और स्टाफ',
    'nav.parents': 'अभिभावक नेटवर्क',
    'nav.classes': 'कक्षाएं और विषय',
    'nav.attendance': 'उपस्थिति रजिस्टर',
    'nav.homework': 'गृहकार्य और कार्य',
    'nav.materials': 'अध्ययन सामग्री',
    'nav.exams': 'परीक्षा और अंक',
    'nav.fees': 'शुल्क और फीस पोर्टल',
    'nav.notices': 'सूचनाएं और परिपत्र',
    'nav.timetable': 'समय सारणी (टाइमटेबल)',
    'nav.calendar': 'स्कूल कैलेंडर',
    'nav.aiAssistant': 'एआई सहायक',
    'nav.messaging': 'लाइव संदेश',
    'nav.reports': 'रिपोर्ट इंजन',
    'nav.auditLog': 'व्यवस्थापक ऑडिट लॉग',
    'nav.settings': 'सिस्टम सेटिंग्स',

    // Roles
    'role.admin': 'प्रशासक (Admin)',
    'role.teacher': 'शिक्षक',
    'role.student': 'छात्र',
    'role.parent': 'अभिभावक',

    // Header & Controls
    'header.search': 'छात्र, पाठ्यक्रम, स्टाफ खोजें...',
    'header.notifications': 'सूचनाएं',
    'header.registerSchool': 'स्कूल पंजीकृत करें',
    'header.demoRoles': 'डेमो भूमिका बदलें',
    'header.language': 'भाषा',
    'header.logout': 'साइन आउट',

    // Common Actions
    'action.save': 'बदलाव सहेजें',
    'action.cancel': 'रद्द करें',
    'action.delete': 'हटाएं',
    'action.edit': 'संपादित करें',
    'action.search': 'खोजें',
    'action.filter': 'फ़िल्टर',
    'action.refresh': 'ताज़ा करें',
    'action.export': 'निर्यात (Export)',
    'action.add': 'नया जोड़ें',
    'action.close': 'बंद करें',
    'action.submit': 'जमा करें',
    'action.inspect': 'विवरण देखें',

    // Statuses
    'status.active': 'सक्रिय',
    'status.pending': 'लंबित',
    'status.completed': 'पूरा हुआ',
    'status.success': 'सफल',
    'status.warning': 'चेतावनी',
    'status.error': 'त्रुटि',
    'status.info': 'जानकारी',

    // Quick App Info
    'app.tagline': 'एंटरप्राइज शिक्षा प्रबंधन मंच',
    'app.version': 'v4.2 एंटरप्राइज'
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.students': 'دليل الطلاب',
    'nav.teachers': 'الهيئة التدريسية',
    'nav.parents': 'شبكة أولياء الأمور',
    'nav.classes': 'الفصول والمواد',
    'nav.attendance': 'سجل الحضور',
    'nav.homework': 'الواجبات والمهام',
    'nav.materials': 'المواد الدراسية',
    'nav.exams': 'الامتحانات والدرجات',
    'nav.fees': 'بوابة الرسوم والرسوم الدراسية',
    'nav.notices': 'الإشعارات والتعاميم',
    'nav.timetable': 'الجداول الدراسية',
    'nav.calendar': 'التقويم المدرسي',
    'nav.aiAssistant': 'المساعد الذكي',
    'nav.messaging': 'الرسائل المباشرة',
    'nav.reports': 'محرك التقارير',
    'nav.auditLog': 'سجل التدقيق الإداري',
    'nav.settings': 'إعدادات النظام',

    // Roles
    'role.admin': 'المسؤول',
    'role.teacher': 'المعلم',
    'role.student': 'الطالب',
    'role.parent': 'ولي الأمر',

    // Header & Controls
    'header.search': 'البحث عن الطلاب، المقررات، الموظفين...',
    'header.notifications': 'الإشعارات',
    'header.registerSchool': 'تسجيل مدرسة',
    'header.demoRoles': 'تغيير الدور التجريبي',
    'header.language': 'اللغة',
    'header.logout': 'تسجيل الخروج',

    // Common Actions
    'action.save': 'حفظ التغييرات',
    'action.cancel': 'إلغاء',
    'action.delete': 'حذف',
    'action.edit': 'تعديل',
    'action.search': 'بحث',
    'action.filter': 'تصفية',
    'action.refresh': 'تحديث',
    'action.export': 'تصدير',
    'action.add': 'إضافة جديد',
    'action.close': 'إغلاق',
    'action.submit': 'إرسال',
    'action.inspect': 'معاينة التفاصيل',

    // Statuses
    'status.active': 'نشط',
    'status.pending': 'قيد الانتظار',
    'status.completed': 'مكتمل',
    'status.success': 'نجاح',
    'status.warning': 'تحذير',
    'status.error': 'خطأ',
    'status.info': 'معلومات',

    // Quick App Info
    'app.tagline': 'منظومة إدارة التعليم للمؤسسات',
    'app.version': 'v4.2 Enterprise'
  }
};

interface LanguageContextType {
  language: LanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('app_language') as LanguageCode;
    return saved && TRANSLATIONS[saved] ? saved : 'en';
  });

  const currentInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.dir = currentInfo.dir;
    document.documentElement.lang = language;
  }, [language, currentInfo]);

  const setLanguage = (code: LanguageCode) => {
    if (TRANSLATIONS[code]) {
      setLanguageState(code);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageInfo: currentInfo,
        setLanguage,
        t,
        dir: currentInfo.dir
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
