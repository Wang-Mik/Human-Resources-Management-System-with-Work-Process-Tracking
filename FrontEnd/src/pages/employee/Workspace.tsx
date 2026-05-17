import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, Hourglass, ArrowRightLeft, MapPin, BedDouble } from 'lucide-react';
import InitiateHandoverModal from '../../components/common/InitiateHandoverModal';

const Workspace: React.FC = () => {
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="w-full h-full flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-1 mb-2 animate-fade-in">
          <h1 className="text-zinc-900 text-3xl font-bold font-['Inter'] tracking-tight">Good Morning, Nurse Kim</h1>
          <p className="text-slate-600 text-base font-normal font-['Inter']">Here's what's happening on your shift today.</p>
        </div>

        {/* Top Section: Shift & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* Shift Status Card */}
          <div className="p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-between items-start group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="w-full flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="text-sky-700" size={20} />
                </div>
                <h2 className="text-zinc-900 text-xl font-semibold font-['Inter']">Shift Status</h2>
              </div>
              <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-sm">
                <span className="text-white text-xs font-bold font-['Inter'] tracking-wide uppercase">Active</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-zinc-900 text-6xl font-black font-['Inter'] tracking-tight">07:00</span>
                <span className="text-slate-500 text-2xl font-bold font-['Inter']">AM</span>
              </div>
              <p className="text-slate-600 text-sm font-medium font-['Inter'] flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                Shift started. Elapsed time: 4h 32m
              </p>
            </div>
            <button className="px-8 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-700 font-medium font-['Inter'] transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm">
              Clock Out
            </button>
          </div>

          {/* Availability Card */}
          <div className="p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <h2 className="text-zinc-900 text-xl font-semibold font-['Inter'] mb-auto">Current Availability</h2>
            <div className="mt-8 pt-4 w-full">
              <div className="p-1.5 bg-slate-100/80 rounded-xl flex justify-center items-center gap-1.5 w-full">
                <button className="flex-1 py-3 bg-white rounded-lg shadow-sm border border-slate-200/50 flex justify-center items-center gap-2 transform transition-all">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-zinc-900 text-sm font-bold font-['Inter']">Available</span>
                </button>
                <button className="flex-1 py-3 hover:bg-white/60 rounded-lg flex justify-center items-center gap-2 transition-all">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-slate-600 text-sm font-medium font-['Inter']">Busy</span>
                </button>
                <button className="flex-1 py-3 hover:bg-white/60 rounded-lg flex justify-center items-center gap-2 transition-all">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span className="text-slate-600 text-sm font-medium font-['Inter']">Emergency</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Section Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
          
          {/* Middle Section: My Tasks (Spans 8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="pb-3 border-b border-slate-200 flex justify-between items-end">
              <h2 className="text-zinc-900 text-2xl font-bold font-['Inter']">My Tasks for Today</h2>
              <a href="#" className="text-sky-600 text-sm font-semibold font-['Inter'] hover:text-sky-800 transition-colors flex items-center gap-1 group">
                View All (12)
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
              {/* Task Card 1 */}
              <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-center">
                  <div className="px-3 py-1.5 bg-blue-50 text-sky-700 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-sky-600" />
                    <span className="text-xs font-bold font-['Inter']">In Progress</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full">
                    <AlertCircle size={14} className="text-red-600" />
                    <span className="text-red-700 text-xs font-bold font-['Inter']">Due: 10:30 AM</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-zinc-900 text-lg font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">T-882: Patient Vitals Check</h3>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={16} />
                    <span className="text-sm font-medium font-['Inter']">Room 204</span>
                  </div>
                </div>
                <div className="pt-4 mt-auto">
                  <button className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 transition-all text-white rounded-xl text-sm font-semibold font-['Inter'] shadow-md hover:shadow-lg active:scale-[0.98]">
                    Update Progress
                  </button>
                </div>
              </div>

              {/* Task Card 2 */}
              <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-center">
                  <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full flex items-center gap-1.5">
                    <Hourglass size={14} className="text-slate-600" />
                    <span className="text-xs font-bold font-['Inter']">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 px-3 py-1.5">
                    <Clock size={14} />
                    <span className="text-xs font-bold font-['Inter']">Due: 11:15 AM</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-zinc-900 text-lg font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">T-895: Medication Admin</h3>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <BedDouble size={16} />
                    <span className="text-sm font-medium font-['Inter']">ICU - Bed 04</span>
                  </div>
                </div>
                <div className="pt-4 mt-auto">
                  <button className="w-full py-2.5 bg-white border-2 border-sky-600 text-sky-700 hover:bg-sky-50 transition-all rounded-xl text-sm font-semibold font-['Inter'] active:scale-[0.98]">
                    Start Task
                  </button>
                </div>
              </div>

              {/* Task Card 3 */}
              <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-center">
                  <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full flex items-center gap-1.5">
                    <Hourglass size={14} className="text-slate-600" />
                    <span className="text-xs font-bold font-['Inter']">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 px-3 py-1.5">
                    <Clock size={14} />
                    <span className="text-xs font-bold font-['Inter']">Due: 01:00 PM</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-zinc-900 text-lg font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">T-901: Patient check</h3>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <BedDouble size={16} />
                    <span className="text-sm font-medium font-['Inter']">Recovery Room 1</span>
                  </div>
                </div>
                <div className="pt-4 mt-auto">
                  <button className="w-full py-2.5 bg-white border-2 border-sky-600 text-sky-700 hover:bg-sky-50 transition-all rounded-xl text-sm font-semibold font-['Inter'] active:scale-[0.98]">
                    Start Task
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Panel: Upcoming Handover (Spans 4 cols) */}
          <div className="xl:col-span-4 p-8 bg-gradient-to-b from-white to-sky-50/30 rounded-2xl shadow-sm border border-sky-100 flex flex-col gap-6 w-full">
            <div className="pb-4 border-b border-sky-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex justify-center items-center text-sky-700 shadow-sm">
                <ArrowRightLeft size={24} />
              </div>
              <h2 className="text-zinc-900 text-2xl font-bold font-['Inter']">Shift Transition</h2>
            </div>
            
            <div className="px-4 py-8 bg-white/60 backdrop-blur-sm rounded-xl border border-sky-100/50 flex flex-col items-center gap-3">
              <div className="relative">
                <Hourglass size={32} className="text-sky-600 animate-pulse" />
              </div>
              <div className="text-center mt-2">
                <span className="text-zinc-900 text-lg font-bold font-['Inter']">Your shift ends in </span>
                <span className="text-red-600 text-xl font-black font-['Inter'] mx-1">2 hours</span>
              </div>
              <p className="text-center text-slate-600 text-sm font-medium font-['Inter'] leading-relaxed px-4">
                Ensure all critical tasks are updated before handover.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-2 px-2">
              <div className="flex justify-between items-center group">
                <span className="text-slate-600 text-sm font-semibold font-['Inter'] group-hover:text-zinc-900 transition-colors">Pending Tasks</span>
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-zinc-900 text-sm font-bold font-['Inter']">4</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-600 text-sm font-semibold font-['Inter'] group-hover:text-zinc-900 transition-colors">Unread Notes</span>
                <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold font-['Inter']">1</span>
              </div>
            </div>

            <button 
              onClick={() => setIsHandoverModalOpen(true)}
              className="w-full py-3.5 mt-auto bg-zinc-900 hover:bg-zinc-800 transition-all rounded-xl shadow-lg hover:shadow-xl text-white text-sm font-bold font-['Inter'] flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              Initiate Handover
              <ArrowRightLeft size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

        </div>
      </div>

      <InitiateHandoverModal 
        isOpen={isHandoverModalOpen} 
        onClose={() => setIsHandoverModalOpen(false)} 
      />
    </div>
  );
};

export default Workspace;
