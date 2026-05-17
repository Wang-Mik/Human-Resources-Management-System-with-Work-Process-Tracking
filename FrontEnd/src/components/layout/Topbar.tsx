import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

export const Topbar: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
      <div className="flex items-center gap-6 flex-1">
        <h2 className="text-sky-700 text-xl font-bold tracking-tight md:hidden">HMS</h2>
        
        <div className="relative max-w-md w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search employee or task..." 
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <span className="text-sm font-medium text-slate-700">AM Shift - Oct 24</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
            <ChevronDown size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};