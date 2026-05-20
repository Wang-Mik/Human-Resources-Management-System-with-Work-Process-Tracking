import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AssignTaskModal } from '../../components/common/AssignTaskModal';
import { getBottleneckWorkload } from '../../services/managerService';

const WorkforceAvailability: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workloadData, setWorkloadData] = useState<any[]>([]);

  useEffect(() => {
    getBottleneckWorkload().then(setWorkloadData).catch(console.error);
  }, []);

  const totalStaff = workloadData.length;
  const available = workloadData.filter(s => s.ActiveTasks < 5).length;
  const busy = workloadData.filter(s => s.ActiveTasks >= 5).length;
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden">
      <div className="w-full flex-1 flex flex-col overflow-y-auto bg-white p-6 md:p-8">
        
        {/* Page Header Section */}
        <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-900 text-3xl font-semibold tracking-tight">Workforce Availability</h1>
            <p className="text-gray-600 text-sm">Monitor real-time staff status and attendance.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-300 rounded-md text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm">
                <option>Department: All</option>
                <option>Cardiology</option>
                <option>ICU</option>
                <option>ER</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
            <div className="relative">
              <select className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-300 rounded-md text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm">
                <option>Status: Live</option>
                <option>Status: Offline</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* KPI Widgets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2">
            <span className="text-slate-600 text-sm font-medium tracking-tight">Total Staff on Shift</span>
            <span className="text-zinc-900 text-4xl font-bold">{totalStaff || 0}</span>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
            <span className="text-slate-600 text-sm font-medium tracking-tight">Available</span>
            <span className="text-emerald-500 text-4xl font-bold">{available || 0}</span>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
            <span className="text-slate-600 text-sm font-medium tracking-tight">Busy / In Surgery</span>
            <span className="text-amber-500 text-4xl font-bold">{busy || 0}</span>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-500"></div>
            <span className="text-slate-600 text-sm font-medium tracking-tight">Offline / Break</span>
            <span className="text-slate-500 text-4xl font-bold">0</span>
          </div>
        </div>

        {/* Live Staff Directory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Personnel</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Department</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Live Status</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Current Load</th>
                  <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workloadData.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading staff data...</td></tr>
                ) : (
                  workloadData.map((staff) => {
                    const isBusy = staff.ActiveTasks >= 5;
                    const statusColor = isBusy ? 'amber' : 'emerald';
                    const statusText = isBusy ? 'Busy' : 'Available';
                    
                    return (
                      <tr key={staff.EmployeeID} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-200/50`}>
                                {staff.Name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-${statusColor}-500 border-2 border-white rounded-full`}></div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-zinc-900 font-semibold text-sm">{staff.Name}</span>
                              <span className="text-slate-500 text-xs font-medium">{staff.Department || 'General'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-zinc-900 text-sm">{staff.Department || 'General'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-${statusColor}-50 text-${statusColor}-700 text-xs font-semibold border border-${statusColor}-100`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-${statusColor}-500`}></span>
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 text-sm">{staff.ActiveTasks} Active Tasks</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
                          >
                            Assign Task
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <AssignTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default WorkforceAvailability;
