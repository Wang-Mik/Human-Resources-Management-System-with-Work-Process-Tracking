import React, { useState, useEffect } from 'react';
import ReassignTaskModal from '../../components/common/ReassignTaskModal';
import { getBottleneckWorkload, getBottleneckDetect } from '../../services/managerService';
import api from '../../services/api';
import { 
  Building2, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  AlertCircle, 
  MoreHorizontal, 
  CheckCircle2,
  Search,
  X
} from 'lucide-react';

const BottleneckDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [reassignTask, setReassignTask] = useState<any>(null);
  const [workloadData, setWorkloadData] = useState<any>(null);
  const [detectData, setDetectData] = useState<any>(null);
  const [allWorks, setAllWorks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewStaffTasks, setViewStaffTasks] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [workload, detect, works] = await Promise.all([
        getBottleneckWorkload(),
        getBottleneckDetect(),
        api.get('/works')
      ]);
      setWorkloadData(workload);
      setDetectData(detect);
      setAllWorks(works);
    } catch (err) {
      console.error('Failed to fetch bottleneck data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build dynamic overview alerts from real data
  const overloadedStaff = detectData?.overloadedStaff || [];
  const overdueTasks = detectData?.overdueTasks || [];

  // Build suggestion cards from overdue tasks matched with assignments
  const suggestionCards = overdueTasks.slice(0, 4).map((task: any) => {
    const assignment = allWorks.find((w: any) => w.WorkItemID === task.WorkItemID);
    return {
      ...task,
      AssigneeName: assignment?.AssigneeName || 'Unassigned',
    };
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden">
      <div className="w-full flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* Header & Filters */}
        <div className="flex flex-col gap-4 p-6 md:p-8 pb-0 shrink-0 bg-white">
          <div>
            <h1 className="text-zinc-900 text-3xl font-semibold tracking-tight">Bottleneck Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Workload analysis and reassignment suggestions.</p>
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white py-2 rounded-lg mt-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select className="appearance-none pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer shadow-sm hover:bg-slate-100 transition-colors">
                    <option>All Departments</option>
                    <option>Emergency</option>
                    <option>ICU</option>
                  </select>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select className="appearance-none pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer shadow-sm hover:bg-slate-100 transition-colors">
                    <option>All Shifts</option>
                    <option>Morning</option>
                    <option>Night</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select className="appearance-none pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer shadow-sm hover:bg-slate-100 transition-colors">
                  <option>Last 7 Days</option>
                  <option>Today</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 md:px-8 border-b border-slate-200 shrink-0 bg-white pt-2">
          <div className="flex items-center gap-8">
            {['Overview', 'Delayed Tasks', 'Staff Workload'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-base font-semibold transition-colors border-b-2 ${activeTab === tab ? 'text-sky-600 border-sky-600' : 'text-slate-600 border-transparent hover:text-slate-900'}`}
              >
                {tab}
                {tab === 'Delayed Tasks' && overdueTasks.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">{overdueTasks.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          
          {activeTab === 'Overview' && (
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Dynamic Alerts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overloadedStaff.length > 0 ? (
                  overloadedStaff.slice(0, 2).map((staff: any) => (
                    <div key={staff.EmployeeID} className="bg-orange-50/80 border border-orange-200/60 rounded-lg p-5 flex items-start gap-4 shadow-sm">
                      <AlertTriangle className="text-orange-600 mt-0.5 shrink-0" size={24} />
                      <div className="flex flex-col">
                        <span className="text-orange-800 font-semibold text-base">Warning: {staff.Name} is overloaded</span>
                        <span className="text-orange-700 text-sm mt-0.5">({staff.TaskCount} active tasks)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-green-50/80 border border-green-200/60 rounded-lg p-5 flex items-start gap-4 shadow-sm col-span-2">
                    <CheckCircle2 className="text-green-600 mt-0.5 shrink-0" size={24} />
                    <div className="flex flex-col">
                      <span className="text-green-800 font-semibold text-base">All clear</span>
                      <span className="text-green-700 text-sm mt-0.5">No overloaded staff detected</span>
                    </div>
                  </div>
                )}
                {overdueTasks.length > 0 && (
                  <div className="bg-rose-50/80 border border-rose-200/60 rounded-lg p-5 flex items-start gap-4 shadow-sm">
                    <AlertCircle className="text-rose-600 mt-0.5 shrink-0" size={24} />
                    <div className="flex flex-col">
                      <span className="text-rose-800 font-semibold text-base">{overdueTasks.length} task(s) are overdue</span>
                      <span className="text-rose-700 text-sm mt-0.5">Action required</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Workload Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Staff Workload Distribution</h3>
                    <button 
                      onClick={() => setActiveTab('Staff Workload')}
                      className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-sm font-semibold transition-colors"
                    >
                      <MoreHorizontal size={16} />
                      View Details
                    </button>
                  </div>
                  
                  {/* Dynamic Chart */}
                  <div className="flex-1 min-h-[300px] flex items-end gap-6 md:gap-8 px-4 pb-8 relative mt-10">
                    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs font-semibold text-slate-400">
                      <span>10+</span>
                      <span>7</span>
                      <span>4</span>
                      <span>0</span>
                    </div>

                    <div className="flex-1 flex justify-around items-end ml-10 border-b border-slate-200 pb-1 h-full relative">
                      <div className="absolute top-0 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                      <div className="absolute top-[33%] left-0 right-0 border-t border-slate-100 border-dashed"></div>
                      <div className="absolute top-[66%] left-0 right-0 border-t border-slate-100 border-dashed"></div>

                      {workloadData ? workloadData.map((staff: any) => {
                        const maxTasks = 10;
                        const barHeight = Math.max(20, Math.min(staff.ActiveTasks / maxTasks * 250, 300));
                        const isOverloaded = staff.ActiveTasks >= 5;
                        const color = isOverloaded ? 'bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]' : staff.ActiveTasks >= 3 ? 'bg-amber-400' : 'bg-slate-400';
                        
                        return (
                          <div key={staff.EmployeeID} className="flex flex-col items-center gap-4 z-10 w-full group relative">
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded shadow-lg pointer-events-none whitespace-nowrap">
                              {staff.Name}: {staff.ActiveTasks} tasks
                            </div>
                            <div 
                              className={`w-12 sm:w-14 rounded-t-md transition-all ${color}`} 
                              style={{ height: `${barHeight}px` }}
                            ></div>
                            <span className={`text-xs font-semibold absolute -bottom-7 truncate max-w-[60px] ${isOverloaded ? 'text-rose-600' : 'text-slate-600'}`}>
                              {staff.Name.split(' ').pop()}
                            </span>
                          </div>
                        );
                      }) : (
                        <div className="text-slate-400 text-sm">Loading...</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Dynamic Reassignment Suggestions */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col gap-6">
                  <h3 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-4">Reassignment Suggestions</h3>
                  
                  <div className="flex flex-col gap-5 overflow-y-auto">
                    {suggestionCards.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-8">
                        <CheckCircle2 size={32} className="text-green-500" />
                        <p className="text-sm text-slate-500 text-center">No reassignment suggestions needed. All tasks are on track!</p>
                      </div>
                    ) : (
                      suggestionCards.map((task: any) => (
                        <div key={task.WorkItemID} className="bg-slate-50/50 rounded-lg border border-slate-200 p-5 flex flex-col gap-4 relative shadow-sm">
                          <div className="absolute top-5 right-5 bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded">Overdue</div>
                          
                          <div>
                            <span className="text-xs font-bold text-slate-500">T-{task.WorkItemID}</span>
                            <h4 className="font-semibold text-slate-900 text-base leading-tight mt-1 pr-20">{task.Title}</h4>
                          </div>
                          
                          <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col gap-3 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Current<br/>Assignee</span>
                              <div className="flex items-center gap-2">
                                <AlertTriangle size={16} className="text-rose-600" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-rose-700 leading-none">{task.AssigneeName}</span>
                                  <span className="text-[11px] text-rose-600 font-medium">(Overdue task)</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => setReassignTask(task)}
                            className="w-full py-2.5 bg-sky-600 text-white rounded-md font-medium text-sm hover:bg-sky-700 transition-colors shadow-sm"
                          >
                            Reassign Task
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'Delayed Tasks' && (
            <div className="p-6 md:p-8 flex flex-col gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Task ID & Name</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Type</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Current Assignee</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Due Date</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      
                      {!detectData ? (
                        <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">Loading delayed tasks...</td></tr>
                      ) : overdueTasks.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">No delayed tasks found. All tasks are on schedule!</td></tr>
                      ) : (
                        overdueTasks.map((task: any) => {
                          const assignment = allWorks.find((w: any) => w.WorkItemID === task.WorkItemID);
                          const dueDate = new Date(task.DueDate);
                          const now = new Date();
                          const hoursOverdue = Math.round((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60));
                          
                          return (
                            <tr key={task.WorkItemID} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-slate-900 whitespace-nowrap">T-{task.WorkItemID}</span>
                                  <span className="text-sm text-slate-600 whitespace-nowrap truncate max-w-[200px]">{task.Title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded">{task.WorkType || 'General'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-slate-900 whitespace-nowrap">{assignment?.AssigneeName || 'Unassigned'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-rose-600">{hoursOverdue}h overdue</span>
                                  <span className="text-xs text-slate-500">{dueDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-md border border-rose-200">{task.Status}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => setReassignTask({ ...task, AssigneeName: assignment?.AssigneeName })}
                                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                                >
                                  Reassign
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
          )}

          {activeTab === 'Staff Workload' && (
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Search Bar */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Staff Name" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>

              {/* Staff Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {!workloadData ? (
                  <div className="text-slate-500 col-span-full">Loading workload data...</div>
                ) : (
                  workloadData
                    .filter((staff: any) => staff.Name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((staff: any) => {
                    const maxTasks = 10;
                    const capacity = Math.round((staff.ActiveTasks / maxTasks) * 100);
                    const isOverloaded = capacity >= 100;
                    const isBusy = capacity > 70;
                    const bgColor = isOverloaded ? 'bg-rose-100' : isBusy ? 'bg-amber-100' : 'bg-sky-100';
                    const textColor = isOverloaded ? 'text-rose-700' : isBusy ? 'text-amber-700' : 'text-sky-700';
                    const barColor = isOverloaded ? 'bg-rose-600' : isBusy ? 'bg-amber-500' : 'bg-sky-600';
                    const statusText = isOverloaded ? 'Overloaded' : isBusy ? 'Busy' : 'Optimal';

                    return (
                      <div key={staff.EmployeeID} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center ${textColor} font-bold text-lg shrink-0`}>
                              {staff.Name.substring(0,2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 truncate max-w-[120px]">{staff.Name}</span>
                              <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">{staff.Department || 'General'}</span>
                            </div>
                          </div>
                          {isOverloaded && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded">Urgent</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-600">Capacity</span>
                            <span className={textColor}>{capacity}% - {statusText}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(capacity, 100)}%` }}></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-2 pt-4 border-t border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-900 leading-none">{staff.ActiveTasks}</span>
                            <span className="text-xs text-slate-500 font-medium mt-1">Active Tasks</span>
                          </div>
                          <button onClick={() => setViewStaffTasks(staff)} className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-sky-600 text-xs font-bold rounded-lg shadow-sm transition-colors">
                            View Tasks
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

      </div>
      <ReassignTaskModal 
        isOpen={!!reassignTask} 
        onClose={() => setReassignTask(null)} 
        task={reassignTask}
        onSuccess={() => fetchData()}
      />
      
      {/* View Staff Tasks Modal */}
      {viewStaffTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-zinc-900 text-xl font-semibold">Active Tasks</h2>
                <p className="text-gray-600 text-sm mt-0.5">{viewStaffTasks.Name} - {viewStaffTasks.Department || 'General'}</p>
              </div>
              <button onClick={() => setViewStaffTasks(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="flex flex-col gap-4">
                {(() => {
                  const staffTasks = allWorks.filter(w => w.AssigneeName === viewStaffTasks.Name && w.Status !== 'Completed');
                  if (staffTasks.length === 0) {
                    return <div className="text-center text-slate-500 py-8">No active tasks found for this employee.</div>;
                  }
                  return staffTasks.map(task => (
                    <div key={task.WorkItemID} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">T-{task.WorkItemID}</span>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                            task.Status === 'In Progress' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>{task.Status || 'Pending'}</span>
                        </div>
                        {task.DueDate && (
                          <div className={`text-xs font-semibold ${new Date(task.DueDate) < new Date() ? 'text-rose-600' : 'text-slate-500'}`}>
                            Due: {new Date(task.DueDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <h4 className="text-slate-900 font-semibold text-base">{task.Title}</h4>
                      <p className="text-sm text-slate-600">{task.Description}</p>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottleneckDashboard;
