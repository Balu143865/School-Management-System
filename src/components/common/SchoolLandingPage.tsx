import React, { useState, useEffect } from 'react';
import heroBannerImg from '../../assets/images/school_hero_banner_1785341252398.jpg';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  Award,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Globe,
  UserCheck,
  FileText,
  MessageSquare,
  Lock,
  ChevronRight,
  ChevronDown,
  Star,
  Compass,
  Cpu,
  Trophy,
  HeartHandshake,
  Send,
  ExternalLink,
  Laptop,
  Bus,
  Dumbbell,
  Microscope,
  Library,
  Home as HomeIcon,
  Quote,
  HelpCircle,
  Sun,
  Moon,
  Linkedin,
  Github,
  Instagram
} from 'lucide-react';

interface SchoolLandingPageProps {
  onEnterDashboard: (role?: 'admin' | 'teacher' | 'student' | 'parent') => void;
}

export const SchoolLandingPage: React.FC<SchoolLandingPageProps> = ({ onEnterDashboard }) => {
  const { schoolSettings, demoLogin } = useAuth();
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'students' | 'parents' | 'alumni'>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };
  const [inquiryForm, setInquiryForm] = useState({
    parentName: '',
    email: '',
    phone: '',
    grade: 'Grade 9',
    message: ''
  });

  const schoolName = schoolSettings?.schoolName || 'Greenwood International Academy';
  const schoolTagline = schoolSettings?.tagline || 'Empowering Tomorrow\'s Global Leaders & Innovators';

  const handleRoleSelect = async (role: 'admin' | 'teacher' | 'student' | 'parent') => {
    await demoLogin(role);
    onEnterDashboard(role);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.parentName || !inquiryForm.email) return;
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryForm({ parentName: '', email: '', phone: '', grade: 'Grade 9', message: '' });
    }, 4000);
  };

  return (
    <div id="home" className={`h-screen w-full font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-y-auto overflow-x-hidden scroll-smooth transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">Admissions Open</span>
            <span>Enrollment for Academic Session 2026-2027 is now active.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="tel:+916304045279" className="hover:underline flex items-center gap-1 opacity-90 hover:opacity-100">
              <Phone className="w-3 h-3" /> +91 63040 45279
            </a>
            <span className="hidden md:inline opacity-40">•</span>
            <a href="mailto:admissions@greenwood.edu" className="hover:underline flex items-center gap-1 opacity-90 hover:opacity-100">
              <Mail className="w-3 h-3" /> admissions@greenwood.edu
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 border-b ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
              }`}>
                <GraduationCap className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-extrabold text-base sm:text-lg tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>{schoolName}</h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Accredited K-12
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>{schoolTagline}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={`hidden lg:flex items-center gap-5 text-xs font-semibold ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            <a href="#home" className="text-emerald-500 font-bold hover:text-emerald-400 transition">Home</a>
            <a href="#about" className="hover:text-emerald-500 transition">About</a>
            <a href="#portals" className="hover:text-emerald-500 transition">Portals</a>
            <a href="#academics" className="hover:text-emerald-500 transition">Academics</a>
            <a href="#facilities" className="hover:text-emerald-500 transition">Facilities</a>
            <a href="#leadership" className="hover:text-emerald-500 transition">Leadership</a>
            <a href="#news" className="hover:text-emerald-500 transition">News</a>
            <a href="#testimonials" className="hover:text-emerald-500 transition">Testimonials</a>
            <a href="#faq" className="hover:text-emerald-500 transition">FAQ</a>
            <a href="#contact" className="hover:text-emerald-500 transition">Contact</a>
          </nav>

          {/* CTA Action & Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              type="button"
              className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-800/90 text-amber-400 border-slate-700 hover:bg-slate-700/90 hover:border-amber-400/50 hover:shadow-amber-400/10'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-amber-600 hover:border-amber-500/50'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Light/Dark Theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            <button
              onClick={() => handleRoleSelect('admin')}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white'
          : 'bg-gradient-to-b from-emerald-50/90 via-teal-50/60 to-emerald-100/50 text-slate-900'
      }`}>
        {/* Generated Hero Background Image with Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={heroBannerImg}
            alt="School Campus Background"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center scale-105 filter saturate-[1.2] ${
              isDarkMode ? 'opacity-20' : 'opacity-15'
            }`}
          />
          <div className={`absolute inset-0 ${
            isDarkMode
              ? 'bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950/80'
              : 'bg-gradient-to-r from-emerald-50/95 via-emerald-50/80 to-teal-50/70'
          }`} />
          <div className={`absolute inset-0 ${
            isDarkMode
              ? 'bg-gradient-to-b from-slate-900/60 via-transparent to-slate-950'
              : 'bg-gradient-to-b from-emerald-100/30 via-transparent to-emerald-100/60'
          }`} />
        </div>

        {/* Glowing background graphics */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[280px] h-[280px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                isDarkMode
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-800'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Ranked #1 International School in Digital Innovation 2026</span>
              </div>

              <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Nurturing Visionaries, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                  Inspiring Excellence.
                </span>
              </h1>

              <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Welcome to {schoolName}. We combine rigorous academic curricula with state-of-the-art AI campus infrastructure, holistic sports development, and digital student management to empower the next generation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => handleRoleSelect('admin')}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-500/25 active:scale-95"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Enter School Portal (Admin Dashboard)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#portals"
                  className={`px-4 py-3 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition border ${
                    isDarkMode
                      ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Role Access Portals</span>
                </a>
              </div>

              {/* Stat Badges */}
              <div className={`pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t ${
                isDarkMode ? 'border-slate-800/80' : 'border-emerald-200'
              }`}>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>2,400+</div>
                  <div className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Enrolled Students</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">99.8%</div>
                  <div className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Graduation Rate</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>120+</div>
                  <div className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Expert Faculty</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">45+</div>
                  <div className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>STEM Labs & Clubs</div>
                </div>
              </div>
            </div>

            {/* Right Hero Card Showcase */}
            <div className="lg:col-span-5 relative">
              {/* Outer Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition duration-500" />

              <div className={`relative rounded-3xl overflow-hidden border-2 shadow-2xl backdrop-blur-xl p-5 sm:p-6 space-y-5 ${
                isDarkMode
                  ? 'border-emerald-500/40 bg-slate-900/95 text-white'
                  : 'border-emerald-300 bg-white/95 text-slate-900'
              }`}>
                {/* Card Top Header */}
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md">
                      <div className={`w-full h-full rounded-[8px] flex items-center justify-center ${
                        isDarkMode ? 'bg-slate-900' : 'bg-white'
                      }`}>
                        <GraduationCap className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Smart Campus Live Hub</h3>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        System Active & Syncing
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    v2.4 Live
                  </span>
                </div>

                {/* Hero Feature Image with Gradient Fallback */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-gradient-to-br from-slate-800 via-teal-950 to-slate-900 h-44 sm:h-48 group">
                  <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80"
                    alt="Campus Library & Students"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                  {/* Badge over image */}
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-white shadow-md">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>A+ Grade Campus</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <div className="text-xs font-bold text-white">Modern Digital Campus & AI Learning</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Real-time attendance, digital student IDs & parent connect.</div>
                  </div>
                </div>

                {/* Live Campus Quick Metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-2xl border space-y-1 ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700/70'
                      : 'bg-emerald-50/80 border-emerald-200'
                  }`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Today's Attendance</span>
                    </div>
                    <div className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      98.4% <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(2,360)</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl border space-y-1 ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700/70'
                      : 'bg-blue-50/80 border-blue-200'
                  }`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      <span>Active Classes</span>
                    </div>
                    <div className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>42 Sessions</div>
                  </div>
                </div>

                {/* Quick Launch Action inside right box */}
                <div className="pt-1">
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Administrator Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Floating Badge (positioned at bottom-left) */}
              <div className={`absolute -bottom-3 -left-3 px-3 py-2 rounded-xl border shadow-xl flex items-center gap-2.5 backdrop-blur-md hidden sm:flex z-20 ${
                isDarkMode
                  ? 'bg-slate-900/95 border-slate-700 text-white'
                  : 'bg-white/95 border-slate-300 text-slate-900'
              }`}>
                <div className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Assistant Ready</div>
                  <div className={`text-[9px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Automated Grading & Analytics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Access Portals */}
      <section id="portals" className={`py-20 transition-colors duration-300 border-t border-b ${
        isDarkMode
          ? 'bg-slate-950 border-slate-800 text-white'
          : 'bg-sky-50/90 border-sky-200/80 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
            }`}>
              Instant Access Portals
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Launch Your Dedicated Portal</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Select your role to access management dashboards, academic tools, attendance registers, or parent gradebooks.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Admin Portal Card */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] flex flex-col justify-between group shadow-lg hover:shadow-2xl ${
              isDarkMode
                ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-slate-800 hover:border-emerald-500/60 hover:shadow-emerald-500/20 text-white'
                : 'bg-white border-slate-200/90 hover:border-emerald-500/60 hover:shadow-emerald-500/15 text-slate-900'
            }`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Full Control</span>
                  <h3 className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Administrator Dashboard</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Student & teacher management, class scheduling, school settings, fee audit logs, and AI suite.
                  </p>
                </div>
                <ul className={`text-[11px] space-y-1.5 pt-2 border-t ${
                  isDarkMode ? 'text-slate-300 border-slate-800/80' : 'text-slate-700 border-slate-200'
                }`}>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Student & Teacher Records</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Fee Collection & Audit Log</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Timetable & Exam Manager</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleSelect('admin')}
                className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
              >
                <span>Launch Admin Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Teacher Portal Card */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] flex flex-col justify-between group shadow-lg hover:shadow-2xl ${
              isDarkMode
                ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-slate-800 hover:border-blue-500/60 hover:shadow-blue-500/20 text-white'
                : 'bg-white border-slate-200/90 hover:border-blue-500/60 hover:shadow-blue-500/15 text-slate-900'
            }`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase">Faculty Hub</span>
                  <h3 className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Teacher Workspace</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Attendance registers with QR scan, assignment posting, study materials, and report card generation.
                  </p>
                </div>
                <ul className={`text-[11px] space-y-1.5 pt-2 border-t ${
                  isDarkMode ? 'text-slate-300 border-slate-800/80' : 'text-slate-700 border-slate-200'
                }`}>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" /> QR & Manual Attendance</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Gradebook & Exam Entry</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Upload Homework & Materials</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleSelect('teacher')}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20"
              >
                <span>Open Faculty Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Student Portal Card */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] flex flex-col justify-between group shadow-lg hover:shadow-2xl ${
              isDarkMode
                ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-slate-800 hover:border-purple-500/60 hover:shadow-purple-500/20 text-white'
                : 'bg-white border-slate-200/90 hover:border-purple-500/60 hover:shadow-purple-500/15 text-slate-900'
            }`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded uppercase">Student Desk</span>
                  <h3 className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Student Portal</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Digital Student ID card, online fee payment, assignment submission, timetable, and study downloads.
                  </p>
                </div>
                <ul className={`text-[11px] space-y-1.5 pt-2 border-t ${
                  isDarkMode ? 'text-slate-300 border-slate-800/80' : 'text-slate-700 border-slate-200'
                }`}>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Digital Student ID Card</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Tuition Fee Receipt Generator</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Submit Homework & Homework Tracker</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleSelect('student')}
                className="mt-6 w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-purple-600/20"
              >
                <span>Enter Student Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Parent Portal Card */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] flex flex-col justify-between group shadow-lg hover:shadow-2xl ${
              isDarkMode
                ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-slate-800 hover:border-amber-500/60 hover:shadow-amber-500/20 text-white'
                : 'bg-white border-slate-200/90 hover:border-amber-500/60 hover:shadow-amber-500/15 text-slate-900'
            }`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase">Parent Connect</span>
                  <h3 className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Parent Dashboard</h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Monitor child attendance, academic report cards, notices, teacher messaging, and fee dues.
                  </p>
                </div>
                <ul className={`text-[11px] space-y-1.5 pt-2 border-t ${
                  isDarkMode ? 'text-slate-300 border-slate-800/80' : 'text-slate-700 border-slate-200'
                }`}>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Real-time Attendance Updates</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Progress Reports & Grades</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Direct Teacher Messaging</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleSelect('parent')}
                className="mt-6 w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-amber-600/20"
              >
                <span>Access Parent Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About & Core Features Section */}
      <section id="about" className={`py-20 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-slate-900 text-white'
          : 'bg-amber-50/70 border-t border-b border-amber-200/70 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
                isDarkMode
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/15 text-amber-800 border-amber-500/30'
              }`}>
                Why Choose {schoolName}?
              </span>
              <h2 className={`text-2xl sm:text-4xl font-black leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Empowering Students with World-Class Infrastructure & AI Technology.
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                At {schoolName}, education extends far beyond traditional textbooks. Our state-of-the-art campus blends experiential STEM learning, personalized AI tutoring, global language immersion, and comprehensive athletic facilities.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className={`p-4 rounded-2xl border space-y-2 transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-emerald-500/10 ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700/80 hover:border-emerald-500/50'
                    : 'bg-white border-amber-200/80 hover:border-emerald-500/50'
                }`}>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Smart Classrooms & Labs</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Interactive touch boards, 3D STEM labs, and high-speed Wi-Fi across campus.</p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-blue-500/10 ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700/80 hover:border-blue-500/50'
                    : 'bg-white border-amber-200/80 hover:border-blue-500/50'
                }`}>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Digital ID & QR Attendance</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Instant parent notification upon campus arrival & real-time analytics.</p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-purple-500/10 ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700/80 hover:border-purple-500/50'
                    : 'bg-white border-amber-200/80 hover:border-purple-500/50'
                }`}>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>1:12 Student-Teacher Ratio</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Dedicated mentorship ensuring no child gets left behind.</p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-amber-500/10 ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-slate-700/80 hover:border-amber-500/50'
                    : 'bg-white border-amber-200/80 hover:border-amber-500/50'
                }`}>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>100% University Placement</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Graduates accepted at top ivy league and international universities.</p>
                </div>
              </div>
            </div>

            {/* Gallery collage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80"
                  alt="Science Lab"
                  referrerPolicy="no-referrer"
                  className={`rounded-3xl border h-52 sm:h-64 w-full object-cover shadow-lg ${
                    isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-amber-200 bg-white'
                  }`}
                />
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80"
                  alt="Classroom Instruction"
                  referrerPolicy="no-referrer"
                  className={`rounded-3xl border h-40 sm:h-48 w-full object-cover shadow-lg ${
                    isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-amber-200 bg-white'
                  }`}
                />
              </div>
              <div className="space-y-4 pt-6">
                <img
                  src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80"
                  alt="Sports & Activities"
                  referrerPolicy="no-referrer"
                  className={`rounded-3xl border h-40 sm:h-48 w-full object-cover shadow-lg ${
                    isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-amber-200 bg-white'
                  }`}
                />
                <img
                  src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80"
                  alt="Robotics & Computer Lab"
                  referrerPolicy="no-referrer"
                  className={`rounded-3xl border h-52 sm:h-64 w-full object-cover shadow-lg ${
                    isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-amber-200 bg-white'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Curricula Section */}
      <section id="academics" className={`py-20 transition-colors duration-300 border-t ${
        isDarkMode
          ? 'bg-slate-950 border-slate-800 text-white'
          : 'bg-purple-50/80 border-purple-200/80 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-purple-500/15 text-purple-800 border-purple-500/30'
            }`}>
              Academic Wings
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Comprehensive K-12 Curricula</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Tailored pathways designed for foundational growth, critical thinking, university preparation, and global competitiveness.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border space-y-4 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 group ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/60'
                : 'bg-white border-purple-200/90 hover:border-emerald-500/60'
            }`}>
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit group-hover:scale-110 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Primary School (Grades K-5)</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Foundational literacy, mathematics, creative arts, and play-based scientific discovery in a safe, nurturing environment.
              </p>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-2">
                <span>Inquiry-based Learning</span>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border space-y-4 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 group ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 hover:border-blue-500/60'
                : 'bg-white border-purple-200/90 hover:border-blue-500/60'
            }`}>
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit group-hover:scale-110 transition">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Middle School (Grades 6-8)</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                STEM orientation, computer coding, foreign languages, sports specialization, and collaborative problem-solving.
              </p>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 pt-2">
                <span>Robotics & Language Immersion</span>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border space-y-4 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 group ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 hover:border-purple-500/60'
                : 'bg-white border-purple-200/90 hover:border-purple-500/60'
            }`}>
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl w-fit group-hover:scale-110 transition">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>High School (Grades 9-12)</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Advanced Placement (AP), IB Diploma option, university career counseling, SAT/ACT workshops, and research projects.
              </p>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 pt-2">
                <span>AP & Ivy University Prep</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Facilities & Infrastructure Section */}
      <section id="facilities" className={`py-20 transition-colors duration-300 border-t ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-teal-50/80 border-teal-200/80 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-teal-500/15 text-teal-800 border-teal-500/30'
            }`}>
              Campus Facilities
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>World-Class Infrastructure</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Designed for safety, innovation, athletic excellence, and comfortable learning across 25 acres.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border space-y-3.5 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 group ${
              isDarkMode
                ? 'bg-slate-800/60 border-slate-700/80 hover:border-emerald-500/60'
                : 'bg-white border-teal-200/90 hover:border-emerald-500/60'
            }`}>
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit group-hover:scale-110 transition">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Advanced STEM & Robotics Labs</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                3D printing, AI simulation pods, optics, biotechnology stations, and robotics programming workbenches.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border space-y-3.5 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 group ${
              isDarkMode
                ? 'bg-slate-800/60 border-slate-700/80 hover:border-blue-500/60'
                : 'bg-white border-teal-200/90 hover:border-blue-500/60'
            }`}>
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit group-hover:scale-110 transition">
                <Library className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Digital Knowledge Center</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Over 30,000 physical volumes, e-journal databases, quiet research zones, and audio-visual pods.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border space-y-3.5 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 group ${
              isDarkMode
                ? 'bg-slate-800/60 border-slate-700/80 hover:border-amber-500/60'
                : 'bg-white border-teal-200/90 hover:border-amber-500/60'
            }`}>
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit group-hover:scale-110 transition">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Olympic Sports Complex</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Temperature-controlled pool, synthetic turf soccer pitch, indoor basketball court, and tennis arena.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border space-y-3.5 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 group ${
              isDarkMode
                ? 'bg-slate-800/60 border-slate-700/80 hover:border-purple-500/60'
                : 'bg-white border-teal-200/90 hover:border-purple-500/60'
            }`}>
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl w-fit group-hover:scale-110 transition">
                <Bus className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>GPS Fleet Transport</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Air-conditioned buses with real-time GPS tracking accessible directly via the parent mobile dashboard.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border space-y-3.5 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 group ${
              isDarkMode
                ? 'bg-slate-800/60 border-slate-700/80 hover:border-cyan-500/60'
                : 'bg-white border-teal-200/90 hover:border-cyan-500/60'
            }`}>
              <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-2xl w-fit group-hover:scale-110 transition">
                <HomeIcon className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Residential Hostel Facility</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Secure, modern dormitories with 24/7 warden care, nutritious catering, and supervised study hours.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border space-y-3.5 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-rose-500/20 group ${
              isDarkMode
                ? 'bg-slate-800/60 border-slate-700/80 hover:border-rose-500/60'
                : 'bg-white border-teal-200/90 hover:border-rose-500/60'
            }`}>
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl w-fit group-hover:scale-110 transition">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>800-Seat Auditorium</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Acoustically engineered performing arts theater hosting drama, musical concerts, and international MUN conferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Principal's Message Section */}
      <section id="leadership" className={`py-20 transition-colors duration-300 border-t ${
        isDarkMode
          ? 'bg-slate-950 border-slate-800 text-white'
          : 'bg-indigo-50/80 border-indigo-200/80 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`rounded-3xl border p-8 sm:p-12 relative overflow-hidden shadow-xl ${
            isDarkMode
              ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border-slate-800 text-white'
              : 'bg-white border-indigo-200/90 text-slate-900'
          }`}>
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 text-center lg:text-left space-y-4">
                <div className="relative inline-block">
                  <img
                    src="/principal_balu_naik.png"
                    alt="Principal Dr. Balu Naik, B. Tech"
                    referrerPolicy="no-referrer"
                    className={`w-44 h-44 sm:w-52 sm:h-52 rounded-3xl object-cover mx-auto lg:mx-0 border-2 shadow-2xl ${
                      isDarkMode ? 'border-emerald-500/40 bg-slate-800' : 'border-indigo-400 bg-indigo-50'
                    }`}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-2 rounded-xl shadow-lg">
                    <Quote className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{schoolSettings?.principalName || 'Dr. Balu Naik, B. Tech'}</h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Head of School & Executive Director</p>
                  <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Academic Dean & Lead Educational Visionary</p>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
                  isDarkMode
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-indigo-500/15 text-indigo-800 border-indigo-500/30'
                }`}>
                  Principal's Desk
                </span>
                <h2 className={`text-2xl sm:text-3xl font-black leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  "Educating the Mind Without Educating the Heart is No Education at All."
                </h2>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  At {schoolName}, we take immense pride in fostering an inclusive environment where curiosity is celebrated and integrity is paramount. Through our integrated digital platform, parents, students, and educators work in unison to build character, academic mastery, and global empathy.
                </p>
                <div className={`pt-2 flex flex-wrap items-center gap-4 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> CBSE & IB World School</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ISO 9001 Certified Campus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest School News & Events */}
      <section id="news" className={`py-20 transition-colors duration-300 border-t ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-rose-50/80 border-rose-200/80 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 ${
            isDarkMode ? 'border-slate-800' : 'border-rose-200'
          }`}>
            <div>
              <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
                isDarkMode
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-800 border-rose-500/30'
              }`}>
                Campus Updates
              </span>
              <h2 className={`text-2xl sm:text-4xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Latest News & Events</h2>
            </div>
            <button
              onClick={() => handleRoleSelect('admin')}
              className="text-xs font-bold text-rose-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All Circulars in Portal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className={`rounded-2xl overflow-hidden border space-y-3 p-4 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 group ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700/80 hover:border-emerald-500/60'
                : 'bg-white border-rose-200/90 hover:border-emerald-500/60'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Aug 12, 2026</span>
                <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Science & AI</span>
              </div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Annual Science & Robotics Exhibition 2026</h4>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Over 150 student innovations will be displayed in the auditorium including autonomous drones and AI tools.
              </p>
            </div>

            <div className={`rounded-2xl overflow-hidden border space-y-3 p-4 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 group ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700/80 hover:border-blue-500/60'
                : 'bg-white border-rose-200/90 hover:border-blue-500/60'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Aug 20, 2026</span>
                <span className="bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">Sports Meet</span>
              </div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Inter-House Athletics Championship</h4>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Track and field events, swimming championships, and basketball finals hosted at our sports complex.
              </p>
            </div>

            <div className={`rounded-2xl overflow-hidden border space-y-3 p-4 transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 group ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700/80 hover:border-purple-500/60'
                : 'bg-white border-rose-200/90 hover:border-purple-500/60'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Sep 01, 2026</span>
                <span className="bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">Admissions</span>
              </div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Parent Orientation & Open House Day</h4>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Meet principal, tour smart laboratories, and interact with academic coordinators for 2026 admissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & Success Stories Section */}
      <section id="testimonials" className={`py-20 transition-colors duration-300 border-t relative overflow-hidden ${
        isDarkMode
          ? 'bg-slate-950 border-slate-800 text-white'
          : 'bg-emerald-50/80 border-emerald-200/80 text-slate-900'
      }`}>
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
            }`}>
              Community Voices
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Student & Parent Success Stories</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Hear directly from our thriving community of students, parents, and alumni about their transformative journey at {schoolName}.
            </p>

            {/* Filter Tabs */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: 'all', label: 'All Stories' },
                { id: 'parents', label: 'Parents' },
                { id: 'students', label: 'Students' },
                { id: 'alumni', label: 'Alumni' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTestimonialFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    testimonialFilter === tab.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : isDarkMode
                      ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      : 'bg-white text-slate-700 hover:bg-emerald-100/70 border border-emerald-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                category: 'parents',
                name: 'Samantha & David Miller',
                role: 'Parents of Leo (Grade 8)',
                tag: 'Parent Connect User',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                quote: 'The Parent Portal has been a total game-changer. We get instant SMS & app notifications for Leo’s attendance, homework grades, and bus location. The transparency and faculty support are unmatchable.',
                rating: 5,
                achievement: 'Real-time Attendance & Fee Tracking'
              },
              {
                category: 'students',
                name: 'Aarav Sharma',
                role: 'Grade 12 Student (Head Boy)',
                tag: 'Robotics Team Lead',
                avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
                quote: 'The AI robotics lab and mentor support helped us win 1st place in the National STEM Innovation Challenge. Greenwood doesn’t just teach textbooks; it builds future leaders.',
                rating: 5,
                achievement: 'National STEM Champion 2026'
              },
              {
                category: 'alumni',
                name: 'Dr. Priya Nair',
                role: 'Alumni Class of 2021',
                tag: 'Stanford Biomedical Fellow',
                avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
                quote: 'My foundation in advanced biology and research methods was built right here in Greenwood’s high-school labs. The rigor and global perspective gave me a huge edge in ivy league admissions.',
                rating: 5,
                achievement: 'Stanford Scholar & Author'
              },
              {
                category: 'parents',
                name: 'Marcus Vance',
                role: 'Parent of Sophia (Grade 4)',
                tag: 'Junior School Parent',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                quote: 'Sophia went from being shy to leading her class in drama and public speaking. The balanced focus between academics, sports, and creative arts is truly remarkable.',
                rating: 5,
                achievement: 'Holistic Character Growth'
              },
              {
                category: 'students',
                name: 'Ananya Roy',
                role: 'Grade 10 Student',
                tag: '99.4% Academic Topper',
                avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
                quote: 'The digital student portal makes revising so effortless. Having past papers, AI quizzes, and direct chat with subject teachers helped me top the state exams.',
                rating: 5,
                achievement: 'State Academic Topper'
              },
              {
                category: 'alumni',
                name: 'James Rodriguez',
                role: 'Alumni Class of 2023',
                tag: 'MIT Robotics Major',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                quote: 'Greenwood fostered my passion for coding when I was in Grade 9. The teachers mentored me beyond class hours and helped me publish my first research paper before graduation.',
                rating: 5,
                achievement: 'MIT Scholar \'25'
              }
            ]
              .filter(item => testimonialFilter === 'all' || item.category === testimonialFilter)
              .map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl p-6 border transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.02] flex flex-col justify-between space-y-4 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 group ${
                    isDarkMode
                      ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/60'
                      : 'bg-white border-emerald-200/90 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Rating & Category Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: item.rating }).map((_, r) => (
                          <Star key={r} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {item.tag}
                      </span>
                    </div>

                    {/* Quote text */}
                    <div className="relative pt-1">
                      <Quote className="w-6 h-6 text-emerald-500/20 group-hover:text-emerald-500/40 transition absolute -top-2 -left-1 pointer-events-none" />
                      <p className={`text-xs leading-relaxed italic relative z-10 pl-2 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        "{item.quote}"
                      </p>
                    </div>
                  </div>

                  {/* User Profile Footer */}
                  <div className={`pt-4 border-t flex items-center justify-between gap-3 ${
                    isDarkMode ? 'border-slate-800/80' : 'border-emerald-100'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-emerald-500/40 shrink-0 bg-slate-200 dark:bg-slate-800"
                      />
                      <div className="min-w-0">
                        <h4 className={`font-bold text-xs truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</h4>
                        <p className={`text-[10px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.role}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg border shrink-0 ${
                      isDarkMode
                        ? 'text-emerald-400 bg-slate-950 border-slate-800'
                        : 'text-emerald-800 bg-emerald-100/80 border-emerald-200'
                    }`}>
                      {item.achievement}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className={`py-20 transition-colors duration-300 border-t ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-blue-50/80 border-blue-200/80 text-slate-900'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-blue-500/15 text-blue-800 border-blue-500/30'
            }`}>
              Got Questions?
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Frequently Asked Questions</h2>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Find instant answers regarding school admissions, portals, fee structure, and campus amenities.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is the procedure for student admission for the 2026-2027 academic session?",
                a: "Admissions begin with submitting our online inquiry form or visiting campus. Following a short interaction session and document verification, selected candidates receive admission confirmation within 3 working days."
              },
              {
                q: "How do parents track student attendance, report cards, and fee receipts?",
                a: "Parents receive login credentials to our Parent Connect Portal. Real-time QR attendance alerts, quarterly grade cards, assignment feedback, and fee receipt downloads are accessible on desktop and mobile."
              },
              {
                q: "What safety measures and GPS fleet tracking exist for school buses?",
                a: "All school buses are equipped with speed governors, CCTV cameras, trained lady attendants, and live GPS tracking accessible via the parent dashboard."
              },
              {
                q: "Are academic or athletic scholarships available?",
                a: "Yes, Greenwood Academy offers merit-based scholarships up to 50% tuition fee waiver for exceptional performers in national sports, STEM olympiads, and academic excellence."
              },
              {
                q: "How can parents communicate directly with class teachers and subject faculty?",
                a: "Parents can send direct messages through the Parent Portal, schedule 1-on-1 video consultations, or attend monthly Parent-Teacher Meetings (PTMs)."
              }
            ].map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border overflow-hidden transition shadow-sm ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700/80'
                      : 'bg-white border-blue-200/90'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className={`w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus:outline-none transition ${
                      isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-blue-50/50'
                    }`}
                  >
                    <span className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                      {item.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
                  </button>
                  {isOpen && (
                    <div className={`px-6 pb-5 pt-1 text-xs leading-relaxed border-t ${
                      isDarkMode ? 'text-slate-300 border-slate-700/50' : 'text-slate-600 border-blue-100'
                    }`}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Admission Inquiry & Contact Section */}
      <section id="contact" className={`py-20 transition-colors duration-300 border-t ${
        isDarkMode
          ? 'bg-slate-950 border-slate-800 text-white'
          : 'bg-orange-50/80 border-orange-200/80 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Contact details */}
            <div className="lg:col-span-5 space-y-6">
              <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
                isDarkMode
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-orange-500/15 text-orange-800 border-orange-500/30'
              }`}>
                Get In Touch
              </span>
              <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Visit Our Campus & Admissions Office</h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Have questions regarding school registration, fee structure, scholarships, or campus tours? Our admissions counselors are here to help.
              </p>

              <div className="space-y-4 pt-2 text-xs">
                <div className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.01] shadow-md hover:shadow-xl hover:shadow-emerald-500/15 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                    : 'bg-white border-orange-200/90 hover:border-emerald-500/50'
                }`}>
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Campus Address</h5>
                    <p className={`mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Macherla, Palnadu, AP - 522426</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.01] shadow-md hover:shadow-xl hover:shadow-blue-500/15 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50'
                    : 'bg-white border-orange-200/90 hover:border-blue-500/50'
                }`}>
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admissions Helpline</h5>
                    <p className={`mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>+91 63040 45279</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.01] shadow-md hover:shadow-xl hover:shadow-purple-500/15 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 hover:border-purple-500/50'
                    : 'bg-white border-orange-200/90 hover:border-purple-500/50'
                }`}>
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Office Visiting Hours</h5>
                    <p className={`mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Monday – Saturday: 08:00 AM – 04:30 PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admission Inquiry Form */}
            <div className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border shadow-xl ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-orange-200/90 text-slate-900'
            }`}>
              <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Send an Admission Inquiry</h3>
              <p className={`text-xs mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Fill in the details below to receive our official prospectus and callback.</p>

              {inquirySubmitted ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 animate-bounce" />
                  <h4 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Inquiry Received Successfully!</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Thank you for contacting {schoolName}. Our admissions officer will get in touch with you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Parent / Guardian Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Robert Vance"
                        value={inquiryForm.parentName}
                        onChange={e => setInquiryForm({ ...inquiryForm, parentName: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                          isDarkMode
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-orange-50/40 border-orange-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="parent@example.com"
                        value={inquiryForm.email}
                        onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                          isDarkMode
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-orange-50/40 border-orange-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 63040 45279"
                        value={inquiryForm.phone}
                        onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                          isDarkMode
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-orange-50/40 border-orange-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Target Grade / Class</label>
                      <select
                        value={inquiryForm.grade}
                        onChange={e => setInquiryForm({ ...inquiryForm, grade: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                          isDarkMode
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-orange-50/40 border-orange-200 text-slate-900'
                        }`}
                      >
                        <option value="Kindergarten">Kindergarten / Primary</option>
                        <option value="Grade 5">Grade 5 - Grade 8</option>
                        <option value="Grade 9">Grade 9 - Grade 10</option>
                        <option value="Grade 11">Grade 11 - Grade 12 (AP/IB)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Inquiry / Message</label>
                    <textarea
                      rows={3}
                      placeholder="Ask about fee structure, sports facilities, or hostel options..."
                      value={inquiryForm.message}
                      onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 resize-none ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-white'
                          : 'bg-orange-50/40 border-orange-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Admission Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`text-xs border-t pt-16 pb-12 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-slate-950 text-slate-400 border-slate-800/80'
          : 'bg-slate-900 text-slate-300 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-800/80">
            {/* Col 1: School Identity */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <span className="font-extrabold text-white text-base block">{schoolName}</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">{schoolTagline}</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Empowering leaders of tomorrow through holistic character education, modern AI learning tools, world-class athletic facilities, and global university readiness.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Accredited International School (CBSE / IB World)</span>
              </div>
              
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Connect With Us</span>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://www.linkedin.com/in/banavath-balu-naik-a9ab03298"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    className="p-2.5 bg-slate-900 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all duration-200 group flex items-center gap-2 text-xs font-semibold"
                  >
                    <Linkedin className="w-4 h-4 transition-transform group-hover:scale-110 text-blue-400" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://github.com/Balu143865"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Profile"
                    className="p-2.5 bg-slate-900 hover:bg-slate-700/50 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-500/50 rounded-xl transition-all duration-200 group flex items-center gap-2 text-xs font-semibold"
                  >
                    <Github className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-200" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://www.instagram.com/balu_naik_rocky"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Profile"
                    className="p-2.5 bg-slate-900 hover:bg-pink-600/20 text-slate-400 hover:text-pink-400 border border-slate-800 hover:border-pink-500/50 rounded-xl transition-all duration-200 group flex items-center gap-2 text-xs font-semibold"
                  >
                    <Instagram className="w-4 h-4 transition-transform group-hover:scale-110 text-pink-400" />
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-extrabold text-white text-sm uppercase tracking-wider text-emerald-400">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#home" className="hover:text-white transition">Home</a></li>
                <li><a href="#about" className="hover:text-white transition">About School</a></li>
                <li><a href="#portals" className="hover:text-white transition">Role Portals</a></li>
                <li><a href="#academics" className="hover:text-white transition">K-12 Curricula</a></li>
                <li><a href="#facilities" className="hover:text-white transition">Campus Facilities</a></li>
                <li><a href="#leadership" className="hover:text-white transition">Principal's Desk</a></li>
                <li><a href="#news" className="hover:text-white transition">News & Events</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            {/* Col 3: Access Portals */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-extrabold text-white text-sm uppercase tracking-wider text-emerald-400">Digital Portals</h4>
              <p className="text-[11px] text-slate-400">Select your role to access real-time dashboards:</p>
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleRoleSelect('admin')}
                  className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-emerald-400" /> Administrator Portal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleRoleSelect('teacher')}
                  className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-semibold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-blue-400" /> Faculty & Teacher Portal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-semibold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-amber-400" /> Student Learning Portal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleRoleSelect('parent')}
                  className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-semibold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-purple-400" /> Parent Connect Portal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Col 4: Campus Contact */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-extrabold text-white text-sm uppercase tracking-wider text-emerald-400">Campus Contact</h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Macherla, Palnadu, AP - 522426</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href="tel:+916304045279" className="hover:text-emerald-300 transition">+91 63040 45279</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>admissions@greenwood.edu</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mon - Sat: 8:00 AM - 4:30 PM EST</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 {schoolName}. All rights reserved. Powered by AI Studio School Management Platform.</p>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
                <a href="https://www.linkedin.com/in/banavath-balu-naik-a9ab03298" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="p-1.5 hover:text-blue-400 transition">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://github.com/Balu143865" target="_blank" rel="noopener noreferrer" title="GitHub" className="p-1.5 hover:text-white transition">
                  <Github className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/balu_naik_rocky" target="_blank" rel="noopener noreferrer" title="Instagram" className="p-1.5 hover:text-pink-400 transition">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
              <a href="#about" className="hover:text-slate-300 transition">Privacy Policy</a>
              <a href="#about" className="hover:text-slate-300 transition">Terms & Conditions</a>
              <a href="#about" className="hover:text-slate-300 transition">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
