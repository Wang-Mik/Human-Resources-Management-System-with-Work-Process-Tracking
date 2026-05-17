import React, { useState } from 'react';
import { Clock, MapPin, CheckCircle2, CheckCheck } from 'lucide-react';
import ConfirmTaskUpdateModal from '../../components/common/ConfirmTaskUpdateModal';

const TaskBoard: React.FC = () => {
  const [activeTaskForUpdate, setActiveTaskForUpdate] = useState<{id: string; name: string; status: string} | null>(null);

  return (
    <div className="flex-1 h-full overflow-hidden p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
      <div className="w-full flex flex-col gap-8 h-full max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col gap-1 animate-fade-in shrink-0">
          <h1 className="text-zinc-900 text-3xl font-bold font-['Inter'] tracking-tight">Task Board</h1>
          <p className="text-slate-600 text-base font-normal font-['Inter']">Manage your daily operations and clinical tasks.</p>
        </div>

        {/* Kanban Board Area */}
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          
          {/* Column: Pending */}
          <div className="flex flex-col min-w-[340px] max-w-[360px] w-full bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 gap-4 h-max shadow-sm">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-zinc-900 text-xl font-bold font-['Inter']">Pending</h2>
              <span className="w-7 h-7 bg-white text-zinc-900 shadow-sm rounded-full flex items-center justify-center text-sm font-bold">2</span>
            </div>

            {/* Task Card: Urgent */}
            <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-bold font-['Inter']">T-882</span>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-md">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  <span className="text-red-700 text-xs font-bold font-['Inter'] uppercase tracking-wider">Urgent</span>
                </div>
              </div>
              <h3 className="text-zinc-900 text-base font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">Patient Vitals Check</h3>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={14} />
                <span className="text-xs font-semibold font-['Inter']">Room 204</span>
                <span className="text-slate-300 text-xs font-bold">•</span>
                <Clock size={14} />
                <span className="text-xs font-semibold font-['Inter']">10:00 AM</span>
              </div>
              <button 
                onClick={() => setActiveTaskForUpdate({ id: 'T-882', name: 'Patient Vitals Check', status: 'Pending' })}
                className="w-full mt-3 py-2.5 bg-sky-700 hover:bg-sky-800 transition-colors text-white rounded-lg text-sm font-semibold font-['Inter'] shadow-sm active:scale-[0.98]"
              >
                Start Task
              </button>
            </div>

            {/* Task Card: Normal */}
            <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-bold font-['Inter']">T-884</span>
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <div className="w-2 h-2 rounded-full bg-sky-700"></div>
                </div>
              </div>
              <h3 className="text-zinc-900 text-base font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">Medication Round - East Wing</h3>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={14} />
                <span className="text-xs font-semibold font-['Inter']">East Wing</span>
                <span className="text-slate-300 text-xs font-bold">•</span>
                <Clock size={14} />
                <span className="text-xs font-semibold font-['Inter']">11:30 AM</span>
              </div>
              <button 
                onClick={() => setActiveTaskForUpdate({ id: 'T-884', name: 'Medication Round - East Wing', status: 'Pending' })}
                className="w-full mt-3 py-2.5 bg-sky-700 hover:bg-sky-800 transition-colors text-white rounded-lg text-sm font-semibold font-['Inter'] shadow-sm active:scale-[0.98]"
              >
                Start Task
              </button>
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="flex flex-col min-w-[340px] max-w-[360px] w-full bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 gap-4 h-max shadow-sm">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-zinc-900 text-xl font-bold font-['Inter']">In Progress</h2>
              <span className="w-7 h-7 bg-blue-100 text-sky-700 shadow-sm rounded-full flex items-center justify-center text-sm font-bold">1</span>
            </div>

            {/* Task Card: In Progress */}
            <div className="p-5 bg-white rounded-xl shadow-[0_4px_20px_rgb(3,105,161,0.08)] border-2 border-sky-600/20 flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300">
              <span className="text-slate-500 text-xs font-bold font-['Inter']">T-879</span>
              <h3 className="text-zinc-900 text-base font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">Post-Op Assessment</h3>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={14} />
                <span className="text-xs font-semibold font-['Inter']">ICU Bed 4</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button 
                  onClick={() => setActiveTaskForUpdate({ id: 'T-879', name: 'Post-Op Assessment', status: 'In Progress' })}
                  className="flex-1 py-2.5 bg-sky-700 hover:bg-sky-800 transition-colors text-white rounded-lg text-sm font-semibold font-['Inter'] shadow-sm active:scale-[0.98]"
                >
                  Update
                </button>
                <button className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors rounded-lg text-sm font-semibold font-['Inter'] active:scale-[0.98]">
                  Handover
                </button>
              </div>
            </div>
          </div>

          {/* Column: Completed */}
          <div className="flex flex-col min-w-[340px] max-w-[360px] w-full bg-slate-100/40 rounded-2xl border border-slate-200/50 p-4 gap-4 h-max opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-slate-600 text-xl font-bold font-['Inter']">Completed</h2>
              <span className="w-7 h-7 bg-slate-200/50 text-slate-500 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            </div>

            {/* Task Card: Completed */}
            <div className="p-5 bg-white/70 rounded-xl border border-slate-200/50 flex flex-col gap-2 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold font-['Inter'] line-through">T-870</span>
                <CheckCircle2 size={18} className="text-sky-700/80" />
              </div>
              <h3 className="text-slate-600 text-base font-bold font-['Inter'] mt-1">Morning Briefing</h3>
              <div className="flex items-center gap-2 text-slate-500 mt-2">
                <CheckCheck size={14} />
                <span className="text-xs font-semibold font-['Inter']">Completed at 08:15 AM</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <ConfirmTaskUpdateModal 
        isOpen={!!activeTaskForUpdate}
        onClose={() => setActiveTaskForUpdate(null)}
        task={activeTaskForUpdate}
      />
    </div>
  );
};

export default TaskBoard;
