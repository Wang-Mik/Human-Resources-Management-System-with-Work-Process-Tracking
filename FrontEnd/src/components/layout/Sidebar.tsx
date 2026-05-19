import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  ClipboardCheck,
  AlertOctagon,
  Users,
  Settings,
  User,
  PieChart
} from 'lucide-react';

interface SidebarProps {
  userRole?: 'manager' | 'employee';
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole = 'manager', currentPage = 'Dashboard', onNavigate }) => {
  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0 hidden md:flex">
      <div className="px-6 py-8 mb-2">
        <h1 className="text-sky-700 text-xl font-bold tracking-tight">HMS Portal</h1>
        <p className="text-gray-700 text-xs font-semibold mt-1">City General Hospital</p>
      </div>

      <nav className="flex-1 pl-4 space-y-1 overflow-y-auto">
        {userRole === 'manager' ? (
          <>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate?.('Dashboard'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-lg transition-colors ${currentPage === 'Dashboard' ? 'bg-blue-100/30 border-r-4 border-sky-700 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <LayoutDashboard size={20} />
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate?.('WorkManagement'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-lg transition-colors ${currentPage === 'WorkManagement' ? 'bg-blue-100/30 border-r-4 border-sky-700 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Briefcase size={20} />
              <span className="text-sm font-medium">Work Management</span>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate?.('HandoverReview'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-lg transition-colors ${currentPage === 'HandoverReview' ? 'bg-blue-100/30 border-r-4 border-sky-700 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <ClipboardCheck size={20} />
              <span className="text-sm font-medium">Handover Review</span>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate?.('BottleneckDashboard'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-lg transition-colors ${currentPage === 'BottleneckDashboard' ? 'bg-blue-100/30 border-r-4 border-sky-700 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <PieChart size={20} />
              <span className="text-sm font-medium">Bottleneck Dashboard</span>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate?.('WorkforceAvailability'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-lg transition-colors ${currentPage === 'WorkforceAvailability' ? 'bg-blue-100/30 border-r-4 border-sky-700 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Users size={20} />
              <span className="text-sm font-medium">Workforce</span>
            </a>
          </>
        ) : (
          <>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate?.('Workspace'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-lg transition-colors ${currentPage === 'Workspace' ? 'bg-blue-100/30 border-r-4 border-sky-700 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <LayoutDashboard size={20} />
              <span className="text-sm font-medium">My work space</span>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate?.('TaskBoard'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-lg transition-colors ${currentPage === 'TaskBoard' ? 'bg-blue-100/30 border-r-4 border-sky-700 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <ClipboardCheck size={20} />
              <span className="text-sm font-medium">Task Board</span>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate?.('MyHandovers'); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-lg transition-colors ${currentPage === 'MyHandovers' ? 'bg-blue-100/30 border-r-4 border-sky-700 text-sky-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Briefcase size={20} />
              <span className="text-sm font-medium">My Handovers</span>
            </a>
          </>
        )}
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-l-lg transition-colors">
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </a>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 shrink-0">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{userRole === 'manager' ? 'Dr. Khoa' : 'Nurse Kim'}</p>
            <p className="text-xs text-slate-500 truncate">{userRole === 'manager' ? 'Operations Manager' : 'Staff Nurse'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};