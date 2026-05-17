import React, { useState } from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import InitiateHandoverModal from '../../components/common/InitiateHandoverModal';

const MyHandovers: React.FC = () => {
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-900 text-3xl font-bold font-['Inter'] leading-tight">My Handovers</h1>
            <p className="text-slate-600 text-base font-normal font-['Inter'] leading-6">Manage and track shift transitions.</p>
          </div>
          <button 
            onClick={() => setIsHandoverModalOpen(true)}
            className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 transition-colors rounded-sm flex justify-center items-center gap-2 shadow-sm"
          >
            <Plus size={16} className="text-white" />
            <span className="text-white text-sm font-medium font-['Inter'] leading-5 tracking-tight">Initiate Handover</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm outline outline-1 outline-slate-300/20 flex flex-col overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="px-6 py-4 bg-slate-100 border-b border-slate-300/20 flex justify-between items-center">
            <h2 className="text-zinc-900 text-lg font-semibold font-['Inter'] leading-7">Handover History</h2>
            <button className="flex justify-center items-center p-2 hover:bg-slate-200 rounded-md transition-colors" title="Filter">
              <SlidersHorizontal size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-slate-300/20">
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Handover<br/>ID</th>
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Shift</th>
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Target<br/>Employee</th>
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Submitted<br/>Time</th>
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300/20">
                
                {/* Row 1 */}
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sky-700 text-sm font-medium font-['Inter'] cursor-pointer hover:underline">#HO-4092</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-900 text-sm font-normal font-['Inter']">PM Shift</span>
                      <span className="text-slate-500 text-xs">(19:00-07:00)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full object-cover" src="https://ui-avatars.com/api/?name=Nurse+Kim&background=E0F2FE&color=0369A1" alt="Nurse Kim" />
                      <span className="text-zinc-900 text-sm font-normal font-['Inter']">Nurse. Kim</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 text-sm font-normal font-['Inter']">Oct 24, 18:45</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium font-['Inter'] rounded-xl outline outline-1 outline-amber-200 inline-block text-center whitespace-nowrap">Pending Review</span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sky-700 text-sm font-medium font-['Inter'] cursor-pointer hover:underline">#HO-4091</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-900 text-sm font-normal font-['Inter']">PM Shift</span>
                      <span className="text-slate-500 text-xs">(19:00-07:00)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full object-cover" src="https://ui-avatars.com/api/?name=Dr+Quang+Minh&background=E0F2FE&color=0369A1" alt="Dr. Quang Minh" />
                      <span className="text-zinc-900 text-sm font-normal font-['Inter']">Dr. Quang Minh</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 text-sm font-normal font-['Inter']">Oct 23, 18:45</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium font-['Inter'] rounded-xl outline outline-1 outline-green-200 inline-block text-center whitespace-nowrap">Approved</span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sky-700 text-sm font-medium font-['Inter'] cursor-pointer hover:underline">#HO-4090</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-900 text-sm font-normal font-['Inter']">PM Shift</span>
                      <span className="text-slate-500 text-xs">(19:00-07:00)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full object-cover" src="https://ui-avatars.com/api/?name=Dr+Quang+Minh&background=E0F2FE&color=0369A1" alt="Dr. Quang Minh" />
                      <span className="text-zinc-900 text-sm font-normal font-['Inter']">Dr. Quang Minh</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 text-sm font-normal font-['Inter']">Oct 22, 18:45</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium font-['Inter'] rounded-xl outline outline-1 outline-green-200 inline-block text-center whitespace-nowrap">Approved</span>
                  </td>
                </tr>
                
                {/* Row 4 */}
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sky-700 text-sm font-medium font-['Inter'] cursor-pointer hover:underline">#HO-4089</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-900 text-sm font-normal font-['Inter']">AM Shift</span>
                      <span className="text-slate-500 text-xs">(07:00-19:00)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full object-cover" src="https://ui-avatars.com/api/?name=Nurse+Sarah&background=E0F2FE&color=0369A1" alt="Nurse Sarah" />
                      <span className="text-zinc-900 text-sm font-normal font-['Inter']">Nurse. Sarah</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 text-sm font-normal font-['Inter']">Oct 21, 06:45</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium font-['Inter'] rounded-xl outline outline-1 outline-green-200 inline-block text-center whitespace-nowrap">Approved</span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-white border-t border-slate-300/20 flex justify-between items-center">
            <span className="text-slate-600 text-sm font-normal font-['Inter'] hidden sm:block">Showing 1 to 4 of 24 entries</span>
            
            <div className="flex items-center gap-1 ml-auto sm:ml-0">
              <button className="px-3 py-1 bg-white text-slate-400 border border-slate-300/50 rounded-sm hover:bg-slate-50 disabled:opacity-50 text-sm font-normal" disabled>Prev</button>
              <button className="px-3 py-1 bg-sky-700 text-white rounded-sm text-sm font-normal">1</button>
              <button className="px-3 py-1 bg-white text-slate-600 border border-slate-300/50 rounded-sm hover:bg-slate-50 text-sm font-normal">2</button>
              <button className="px-3 py-1 bg-white text-slate-600 border border-slate-300/50 rounded-sm hover:bg-slate-50 text-sm font-normal">Next</button>
            </div>
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

export default MyHandovers;
