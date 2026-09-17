'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard, Users, GraduationCap, Building2, BookOpen, 
  BookMarked, School, CalendarCheck, FileSpreadsheet, 
  PenTool, Clock, Bell, Banknote, BrainCircuit, LogOut, ChevronRight, X
} from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/teachers', label: 'Teachers', icon: GraduationCap },
  { href: '/departments', label: 'Departments', icon: Building2 },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/subjects', label: 'Subjects', icon: BookMarked },
  { href: '/classes', label: 'Classes', icon: School },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/marks', label: 'Marks & Results', icon: FileSpreadsheet },
  { href: '/exams', label: 'Exams', icon: PenTool },
  { href: '/timetable', label: 'Timetable', icon: Clock },
  { href: '/notices', label: 'Notices', icon: Bell },
  { href: '/fees', label: 'Fees', icon: Banknote },
  { href: '/dsa-analytics', label: 'DSA Analytics', icon: BrainCircuit },
];

const teacherLinks = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { href: '/marks', label: 'Marks', icon: FileSpreadsheet },
  { href: '/assignments', label: 'Assignments', icon: BookOpen },
  { href: '/timetable', label: 'Timetable', icon: Clock },
  { href: '/notices', label: 'Notices', icon: Bell },
];

const studentLinks = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'My Attendance', icon: CalendarCheck },
  { href: '/marks', label: 'My Marks', icon: FileSpreadsheet },
  { href: '/assignments', label: 'Assignments', icon: BookOpen },
  { href: '/timetable', label: 'Timetable', icon: Clock },
  { href: '/fees', label: 'My Fees', icon: Banknote },
  { href: '/notices', label: 'Notices', icon: Bell },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = user?.role === 'ADMIN' ? adminLinks 
              : user?.role === 'TEACHER' ? teacherLinks 
              : user?.role === 'STUDENT' ? studentLinks 
              : [];

  return (
    <aside 
      className={`w-64 bg-nav/95 backdrop-blur-xl border-r border-slate-800 text-white flex flex-col h-screen fixed z-30 transition-all duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3 group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-400 rounded-lg flex items-center justify-center font-bold text-lg shadow-glow transition-transform group-hover:scale-105">S</div>
          <span className="text-xl font-bold tracking-wider">SMS<span className="text-primary text-xs ml-1 align-top opacity-80 font-medium">2.0</span></span>
        </div>
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        )}
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-3 px-3">Main Menu</div>
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`group flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-primary/90 text-white shadow-md shadow-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon size={18} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span className="text-sm font-medium flex-1">{link.label}</span>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/5 bg-nav/90 backdrop-blur-md sticky bottom-0">
        <div className="flex items-center space-x-3 mb-4 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-sm font-bold shadow-sm">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium truncate text-white">{user?.email}</div>
            <div className="text-xs text-indigo-300/80 capitalize font-medium">{user?.role?.toLowerCase()}</div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-sm font-medium text-slate-400 transition-all duration-200"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
