import React from 'react';
import { 
  Users, 
  ClipboardList, 
  FileWarning, 
  AlertTriangle,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const workloadData = [
  { name: 'ER', tasks: 42 },
  { name: 'ICU', tasks: 28 },
  { name: 'Ward A', tasks: 35 },
  { name: 'Ward B', tasks: 18 },
  { name: 'OR', tasks: 12 },
  { name: 'Lab', tasks: 7 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-700 text-sm font-medium">Total Active Staff</h3>
              <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                <Users size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800">142</div>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-700 text-sm font-medium">Tasks Pending</h3>
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <ClipboardList size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800">28</div>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-700 text-sm font-medium leading-tight">Pending<br/>Handovers</h3>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <FileWarning size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800">12</div>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-rose-50 rounded-xl shadow-sm border border-rose-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-rose-800 text-sm font-medium leading-tight">Critical<br/>Bottlenecks</h3>
              <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-rose-700">3</div>
          </div>
        </div>

        {/* Middle Section: Chart & Workforce */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Workload Distribution Chart */}
          <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 text-lg font-semibold">Workload Distribution</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button className="px-3 py-1 bg-white shadow-sm rounded-md text-xs font-medium text-slate-800">8h</button>
                <button className="px-3 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-slate-800">24h</button>
                <button className="px-3 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-slate-800">7d</button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-sm bg-sky-600"></div>
              <span className="text-xs font-semibold text-slate-600">Active Tasks</span>
            </div>

            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="tasks" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workforce Availability */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 text-lg font-semibold leading-tight">Workforce<br/>Availability</h3>
              <button className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center">
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Item 1 */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">DA</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Dr. Aris</p>
                    <p className="text-xs text-slate-500">Cardiology</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-green-50 border border-green-200 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs font-semibold text-green-700">Available</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">NM</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Nurse Mira</p>
                    <p className="text-xs text-slate-500">ICU</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-semibold text-amber-700">Busy</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">TS</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Tech Sam</p>
                    <p className="text-xs text-slate-500">Radiology</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-red-50 border border-red-200 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <span className="text-xs font-semibold text-red-700">Absent</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Urgent Actions */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="text-rose-600" size={24} />
            <h3 className="text-slate-800 text-lg font-semibold">Urgent Actions</h3>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded">Transfer</span>
                <h4 className="text-slate-800 text-base font-semibold">Handover: ICU Ward B → Ward C</h4>
              </div>
              <p className="text-slate-600 text-sm">Patient: John Doe (ID: 88492). Requires immediate sign-off to free up ICU bed.</p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                Reassign
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm">
                Approve
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
