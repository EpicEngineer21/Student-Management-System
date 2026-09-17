'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  
  // Create a readable title from pathname
  const pathTitle = pathname.split('/').filter(Boolean).pop() || 'Dashboard';
  const pageTitle = pathTitle.charAt(0).toUpperCase() + pathTitle.slice(1);

  return (
    <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shadow-sm transition-all">
      <div className="flex items-center space-x-4">
        <button 
          className="md:hidden text-secondary hover:text-primary focus:outline-none transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-main tracking-tight hidden sm:block">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-6">
        <div className="relative hidden md:block group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-primary transition-colors">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="pl-11 pr-4 py-2.5 border border-border/80 rounded-full text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface w-48 lg:w-80 transition-all shadow-sm"
          />
        </div>
        <button className="md:hidden relative p-2.5 text-secondary hover:text-primary rounded-full hover:bg-slate-100 transition-colors">
          <Search size={20} />
        </button>
        <button className="relative p-2.5 text-secondary hover:text-primary rounded-full hover:bg-slate-100 transition-all group">
          <Bell size={20} className="group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}
