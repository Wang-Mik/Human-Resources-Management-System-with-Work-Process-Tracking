import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, MoreVertical, Pencil, Trash2, UserPlus } from 'lucide-react';
import { AssignTaskModal } from '../../components/common/AssignTaskModal';
import api from '../../services/api';

interface Task {
  WorkItemID: number;
  Title: string;
  Description: string;
  WorkType: string;
  AssigneeName: string;
  DueDate: string;
  Status: string;
}

const getStatusBadge = (status: Task['Status']) => {
  switch (status) {
    case 'Pending':
      return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200">Pending</span>;
    case 'In Progress':
      return <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-md border border-sky-200">In Progress</span>;
    case 'Completed':
      return <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-200">Completed</span>;
    default:
      return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md border border-amber-200">{status || 'Unknown'}</span>;
  }
};

const WorkManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [dueDateFilter, setDueDateFilter] = useState('');

  const fetchTasks = async () => {
    try {
      const data = await api.get('/works');
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'All' && task.Status !== statusFilter) return false;
    if (assigneeFilter !== 'All' && (task.AssigneeName || 'Unassigned') !== assigneeFilter) return false;
    if (dueDateFilter) {
      const taskDate = new Date(task.DueDate).toISOString().split('T')[0];
      if (taskDate !== dueDateFilter) return false;
    }
    return true;
  });

  // Unique values for filter dropdowns
  const uniqueStatuses = ['All', ...Array.from(new Set(tasks.map(t => t.Status).filter(Boolean)))];
  const uniqueAssignees = ['All', ...Array.from(new Set(tasks.map(t => t.AssigneeName || 'Unassigned')))];

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const userStr = localStorage.getItem('user');
      const employeeId = userStr ? JSON.parse(userStr).EmployeeID : 1;
      await api.put(`/works/${taskId}/progress`, {
        status: newStatus,
        employeeId,
        contextNote: `Status changed to ${newStatus} by manager`
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update status', err);
    }
    setActionMenuId(null);
  };

  const handleDeleteTask = async (taskId: number) => {
    // Note: No delete endpoint yet, but we can set to Cancelled
    try {
      const userStr = localStorage.getItem('user');
      const employeeId = userStr ? JSON.parse(userStr).EmployeeID : 1;
      await api.put(`/works/${taskId}/progress`, {
        status: 'Cancelled',
        employeeId,
        contextNote: 'Task cancelled by manager'
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to cancel task', err);
    }
    setActionMenuId(null);
  };

  // Summary stats
  const pending = tasks.filter(t => t.Status === 'Pending').length;
  const inProgress = tasks.filter(t => t.Status === 'In Progress').length;
  const completed = tasks.filter(t => t.Status === 'Completed').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative" onClick={() => setActionMenuId(null)}>
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-900 text-3xl font-bold tracking-tight">Work Management</h1>
            <p className="text-gray-600 text-sm">Manage and assign hospital operational tasks.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg shadow-sm transition-colors text-sm font-bold"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create New Work Item
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-lg">{pending}</div>
            <div><div className="text-sm font-semibold text-slate-800">Pending</div><div className="text-xs text-slate-500">Tasks waiting</div></div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-700 font-bold text-lg">{inProgress}</div>
            <div><div className="text-sm font-semibold text-slate-800">In Progress</div><div className="text-xs text-slate-500">Being worked on</div></div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-lg">{completed}</div>
            <div><div className="text-sm font-semibold text-slate-800">Completed</div><div className="text-xs text-slate-500">Done today</div></div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-wrap lg:flex-nowrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
            <label className="text-slate-700 text-xs font-bold">Status</label>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                {uniqueStatuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
            <label className="text-slate-700 text-xs font-bold">Assignee</label>
            <div className="relative">
              <select 
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                {uniqueAssignees.map(a => <option key={a} value={a}>{a === 'All' ? 'Any Assignee' : a}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-slate-700 text-xs font-bold">Due Date</label>
            <div className="relative">
              <input
                type="date"
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          {(statusFilter !== 'All' || assigneeFilter !== 'All' || dueDateFilter) && (
            <button
              onClick={() => { setStatusFilter('All'); setAssigneeFilter('All'); setDueDateFilter(''); }}
              className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Task ID</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Task Title</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Assigned To</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Due Date</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Status</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">Loading tasks...</td></tr>
                ) : filteredTasks.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">No tasks found.</td></tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.WorkItemID} className={`hover:bg-slate-50 transition-colors ${task.Status === 'Completed' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">T-{task.WorkItemID}</td>
                      <td className={`px-6 py-4 text-sm text-slate-800 ${task.Status === 'Completed' ? 'line-through text-slate-500' : 'font-medium'}`}>{task.Title}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{task.AssigneeName || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{new Date(task.DueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(task.Status)}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === task.WorkItemID ? null : task.WorkItemID); }}
                          className="inline-flex justify-center items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1 rounded hover:bg-slate-100"
                        >
                          <MoreVertical size={20} />
                        </button>
                        
                        {/* Dropdown menu */}
                        {actionMenuId === task.WorkItemID && (
                          <div className="absolute right-6 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-20 py-1" onClick={(e) => e.stopPropagation()}>
                            {task.Status !== 'In Progress' && (
                              <button onClick={() => handleStatusChange(task.WorkItemID, 'In Progress')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2.5 transition-colors">
                                <Pencil size={14} /> Start Task
                              </button>
                            )}
                            {task.Status !== 'Completed' && (
                              <button onClick={() => handleStatusChange(task.WorkItemID, 'Completed')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2.5 transition-colors">
                                <UserPlus size={14} /> Mark Complete
                              </button>
                            )}
                            {task.Status === 'In Progress' && (
                              <button onClick={() => handleStatusChange(task.WorkItemID, 'Pending')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2.5 transition-colors">
                                <Pencil size={14} /> Set Pending
                              </button>
                            )}
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={() => handleDeleteTask(task.WorkItemID)} className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors">
                              <Trash2 size={14} /> Cancel Task
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Showing {filteredTasks.length} of {tasks.length} tasks</span>
          </div>
        </div>

      </div>

      <AssignTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchTasks()}
      />
    </div>
  );
};

export default WorkManagement;
