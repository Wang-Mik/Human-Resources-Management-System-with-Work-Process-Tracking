import React, { useState, useEffect } from 'react';
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
import api from '../../services/api';
import { getBottleneckWorkload, getBottleneckDetect } from '../../services/managerService';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>({
    employees: [],
    works: [],
    handovers: [],
    bottlenecks: null,
    workload: [],
  });
  const [timeframe, setTimeframe] = useState<'8h'|'24h'|'7d'>('8h');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emp, works, handovers, bottlenecks, workload] = await Promise.all([
          api.get('/employees'),
          api.get('/works'),
          api.get('/handovers'),
          getBottleneckDetect(),
          getBottleneckWorkload()
        ]);
        setData({ employees: emp, works, handovers, bottlenecks, workload });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const totalStaff = data.employees.length;
  const pendingTasks = data.works.filter((w: any) => w.Status === 'Pending' || w.Status === 'Unassigned' || !w.Status).length;
  const pendingHandovers = data.handovers.filter((h: any) => h.Status === 'Pending').length;
  const criticalBottlenecks = data.bottlenecks?.overloadedStaff?.length || 0;

  const workloadChartData = data.workload.reduce((acc: any, curr: any) => {
    const dept = curr.Department || 'General';
    const existing = acc.find((item: any) => item.name === dept);
    const multiplier = timeframe === '8h' ? 1 : timeframe === '24h' ? 1.5 : 3; // Simulated historical data
    if (existing) {
      existing.tasks += Math.round(curr.ActiveTasks * multiplier);
    } else {
      acc.push({ name: dept, tasks: Math.round(curr.ActiveTasks * multiplier) });
    }
    return acc;
  }, []);

  const urgentTasks = data.bottlenecks?.overdueTasks || [];

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
            <div className="text-4xl font-bold text-slate-800">{totalStaff}</div>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-700 text-sm font-medium">Tasks Pending</h3>
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <ClipboardList size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800">{pendingTasks}</div>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-700 text-sm font-medium leading-tight">Pending<br/>Handovers</h3>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <FileWarning size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800">{pendingHandovers}</div>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-rose-50 rounded-xl shadow-sm border border-rose-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-rose-800 text-sm font-medium leading-tight">Critical<br/>Bottlenecks</h3>
              <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-rose-700">{criticalBottlenecks}</div>
          </div>
        </div>

        {/* Middle Section: Chart & Workforce */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Workload Distribution Chart */}
          <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 text-lg font-semibold">Workload Distribution</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setTimeframe('8h')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timeframe === '8h' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}>8h</button>
                <button onClick={() => setTimeframe('24h')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timeframe === '24h' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}>24h</button>
                <button onClick={() => setTimeframe('7d')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timeframe === '7d' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}>7d</button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-sm bg-sky-600"></div>
              <span className="text-xs font-semibold text-slate-600">Active Tasks</span>
            </div>

            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <button onClick={() => onNavigate?.('WorkforceAvailability')} className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center">
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {data.workload.slice(0, 3).map((staff: any) => {
                const isBusy = staff.ActiveTasks >= 5;
                return (
                  <div key={staff.EmployeeID} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                        {staff.Name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{staff.Name}</p>
                        <p className="text-xs text-slate-500">{staff.Department || 'General'}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 ${isBusy ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} rounded-full flex items-center gap-1.5 border`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                      <span className={`text-xs font-semibold ${isBusy ? 'text-amber-700' : 'text-green-700'}`}>{isBusy ? 'Busy' : 'Available'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Section: Urgent Actions */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="text-rose-600" size={24} />
            <h3 className="text-slate-800 text-lg font-semibold">Urgent Actions</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {urgentTasks.length === 0 ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium">
                No urgent actions required.
              </div>
            ) : (
              urgentTasks.slice(0, 3).map((task: any) => (
                <div key={task.WorkItemID} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider rounded">Overdue</span>
                      <h4 className="text-slate-800 text-base font-semibold">Task: {task.Title}</h4>
                    </div>
                    <p className="text-slate-600 text-sm">Status: {task.Status} - Due: {new Date(task.DueDate).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => onNavigate?.('BottleneckDashboard')} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                      Reassign
                    </button>
                    <button onClick={() => onNavigate?.('WorkManagement')} className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 transition-colors shadow-sm">
                      View Task
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
