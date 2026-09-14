'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/students', label: 'Students', icon: '🎓' },
  { href: '/teachers', label: 'Teachers', icon: '👨‍🏫' },
  { href: '/departments', label: 'Departments', icon: '🏢' },
  { href: '/courses', label: 'Courses', icon: '📚' },
  { href: '/subjects', label: 'Subjects', icon: '📖' },
  { href: '/classes', label: 'Classes', icon: '🏫' },
  { href: '/attendance', label: 'Attendance', icon: '📋' },
  { href: '/marks', label: 'Marks & Results', icon: '📝' },
  { href: '/exams', label: 'Exams', icon: '✍️' },
  { href: '/timetable', label: 'Timetable', icon: '🕒' },
  { href: '/notices', label: 'Notices', icon: '📢' },
  { href: '/fees', label: 'Fees', icon: '💰' },
  { href: '/dsa-analytics', label: 'DSA Analytics', icon: '🧠' },
];

const teacherLinks = [
  { href: '/teacher', label: 'Dashboard', icon: '📊' },
  { href: '/students', label: 'Students', icon: '🎓' },
  { href: '/attendance', label: 'Attendance', icon: '📋' },
  { href: '/marks', label: 'Marks', icon: '📝' },
  { href: '/assignments', label: 'Assignments', icon: '📚' },
  { href: '/timetable', label: 'Timetable', icon: '🕒' },
  { href: '/notices', label: 'Notices', icon: '📢' },
];

const studentLinks = [
  { href: '/student', label: 'Dashboard', icon: '📊' },
  { href: '/attendance', label: 'My Attendance', icon: '📋' },
  { href: '/marks', label: 'My Marks', icon: '📝' },
  { href: '/assignments', label: 'Assignments', icon: '📚' },
  { href: '/timetable', label: 'Timetable', icon: '🕒' },
  { href: '/fees', label: 'My Fees', icon: '💰' },
  { href: '/notices', label: 'Notices', icon: '📢' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = user?.role === 'ADMIN' ? adminLinks 
              : user?.role === 'TEACHER' ? teacherLinks 
              : user?.role === 'STUDENT' ? studentLinks 
              : [];

  return (
    <aside className="w-64 bg-dark text-white flex flex-col h-screen fixed overflow-y-auto">
      <div className="p-4 border-b border-dark-lighter flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-xl">S</div>
        <span className="text-xl font-bold tracking-wider">SMS<span className="text-primary text-xs ml-1 align-top">2.0</span></span>
      </div>
      
      <div className="p-4">
        <div className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2">Main Menu</div>
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-dark-lighter hover:text-white'
                }`}
              >
                <span>{link.icon}</span>
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-dark-lighter">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-semibold">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-sm font-medium truncate w-40">{user?.email}</div>
            <div className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-dark-lighter hover:bg-red-600 rounded-md text-sm font-medium transition-colors"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
