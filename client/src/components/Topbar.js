'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  
  // Create a readable title from pathname
  const pathTitle = pathname.split('/').filter(Boolean).pop() || 'Dashboard';
  const pageTitle = pathTitle.charAt(0).toUpperCase() + pathTitle.slice(1);

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center space-x-4">
        <button 
          className="md:hidden text-secondary hover:text-main focus:outline-none"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-main hidden sm:block">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-6">
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48 lg:w-72 transition-all"
          />
        </div>
        <button className="md:hidden relative p-2 text-secondary hover:text-main rounded-full hover:bg-gray-100 transition-colors">
          <Search size={20} />
        </button>
        <button className="relative p-2 text-secondary hover:text-main rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
        </button>
      </div>
    </header>
  );
}
