import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';

interface TopbarProps {
  onLogout?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onLogout }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const hours = currentTime.getHours();
  let shift = 'Night Shift';
  if (hours >= 7 && hours < 15) {
    shift = 'Morning Shift';
  } else if (hours >= 15 && hours < 23) {
    shift = 'Afternoon Shift';
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0 relative">
      <div className="flex items-center gap-6 flex-1">
        <h2 className="text-sky-700 text-xl font-bold tracking-tight md:hidden">HMS</h2>
        
        <div className="relative max-w-md w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search tasks, patients, or staff..." 
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 hover:border-sky-300 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 sm:text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm">
          <span className="text-sm font-bold text-sky-700 min-w-[100px] text-center tabular-nums tracking-wide">{formattedTime}</span>
          <div className="w-px h-4 bg-slate-300"></div>
          <span className="text-xs font-semibold text-slate-600 min-w-[110px] text-center">{shift} - {formattedDate}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="relative p-2.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 border border-transparent hover:border-sky-100">
            <Bell size={20} />
            <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-95 border ${isMenuOpen ? 'bg-sky-50 text-sky-700 border-sky-100 shadow' : 'text-slate-500 hover:text-sky-700 hover:bg-sky-50 border-transparent hover:border-sky-100 hover:shadow'}`}
            >
              <ChevronDown size={20} className={isMenuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 py-1.5 z-50 animate-fade-in origin-top-right">
                <button 
                  onClick={() => { setIsMenuOpen(false); onLogout?.(); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2.5 transition-colors font-semibold"
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};