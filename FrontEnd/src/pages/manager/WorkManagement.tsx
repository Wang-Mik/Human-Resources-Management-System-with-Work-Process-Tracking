import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, MoreVertical, Pencil, Trash2, UserPlus, FileText, CheckCircle2, ListChecks, Edit3, Check, X } from 'lucide-react';
import { AssignTaskModal } from '../../components/common/AssignTaskModal';
import { WorkAssignmentModal } from '../../components/common/WorkAssignmentModal';
import { TaskDetailModal } from '../../components/common/TaskDetailModal';
import { CreateWorkAssignmentModal } from '../../components/common/CreateWorkAssignmentModal';
import api from '../../services/api';

interface Task {
  WorkItemID: number;
  Title: string;
  Description: string;
  Document?: string;
  WorkType: string;
  AssigneeName: string;
  DueDate: string;
  Status: string;
  Assignees?: { EmployeeID: number; Name: string; Email: string; Role: string }[];
  SubTasks?: { SubTaskID: number; Title: string; Status: string }[];
}

const getStatusBadge = (status: Task['Status']) => {
  switch (status) {
    case 'Pending':
      return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200">Pending</span>;
    case 'In Progress':
      return <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-md border border-sky-200">In Progress</span>;
    case 'Ready for Review':
      return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md border border-amber-200">Ready for Review</span>;
    case 'Completed':
      return <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-200">Completed</span>;
    default:
      return <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-md border border-slate-200">{status || 'Unknown'}</span>;
  }
};

const WorkManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentTask, setAssignmentTask] = useState<Task | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // Subtask editing states for expanded view
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<{ [key: number]: string }>({});

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
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

  const handleAddSubtask = async (taskId: number) => {
    const title = newSubtaskTitles[taskId];
    if (!title || !title.trim()) return;
    try {
      await api.post(`/works/${taskId}/subtasks`, { title: title.trim() });
      setNewSubtaskTitles(prev => ({ ...prev, [taskId]: '' }));
      fetchTasks();
    } catch (err) {
      console.error('Failed to add subtask', err);
    }
  };

  const handleSaveSubtaskTitle = async (subtaskId: number) => {
    if (!editingSubtaskTitle.trim()) return;
    try {
      await api.put(`/works/subtasks/${subtaskId}`, { title: editingSubtaskTitle.trim() });
      setEditingSubtaskId(null);
      setEditingSubtaskTitle('');
      fetchTasks();
    } catch (err) {
      console.error('Failed to update subtask title', err);
    }
  };

  const handleToggleSubtask = async (subtaskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/works/subtasks/${subtaskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to toggle subtask status', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    try {
      await api.delete(`/works/subtasks/${subtaskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete subtask', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter logic sorted descending (newest first)
  const filteredTasks = tasks
    .filter(task => {
      if (statusFilter !== 'All' && task.Status !== statusFilter) return false;
      if (assigneeFilter !== 'All' && (task.AssigneeName || 'Unassigned') !== assigneeFilter) return false;
      if (dueDateFilter) {
        const taskDate = new Date(task.DueDate).toISOString().split('T')[0];
        if (taskDate !== dueDateFilter) return false;
      }
      return true;
    })
    .sort((a, b) => b.WorkItemID - a.WorkItemID);

  // Unique values for filter dropdowns
  const uniqueStatuses = ['All', ...Array.from(new Set(tasks.map(t => t.Status).filter(Boolean)))];
  const uniqueAssignees = ['All', ...Array.from(new Set(tasks.map(t => t.AssigneeName || 'Unassigned')))];

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const userStr = sessionStorage.getItem('user');
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
    try {
      const userStr = sessionStorage.getItem('user');
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
  const readyForReview = tasks.filter(t => t.Status === 'Ready for Review').length;
  const completed = tasks.filter(t => t.Status === 'Completed').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative" onClick={() => setActionMenuId(null)}>
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-900 text-3xl font-bold tracking-tight">Work Management</h1>
            <p className="text-gray-600 text-sm">Manage, structure subtasks, and assign hospital operational tasks.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm transition-all text-sm font-bold active:scale-[0.98]"
            >
              <UserPlus size={18} strokeWidth={2.5} className="text-sky-700" />
              Create Work Assignment
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg shadow-sm transition-colors text-sm font-bold"
            >
              <Plus size={18} strokeWidth={2.5} />
              Create Work Item
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-lg">{pending}</div>
            <div><div className="text-sm font-semibold text-slate-800">Pending</div><div className="text-xs text-slate-500">Tasks waiting</div></div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-700 font-bold text-lg">{inProgress}</div>
            <div><div className="text-sm font-semibold text-slate-800">In Progress</div><div className="text-xs text-slate-500">Being worked on</div></div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-bold text-lg">{readyForReview}</div>
            <div><div className="text-sm font-semibold text-slate-800">Review</div><div className="text-xs text-slate-500">Awaiting check</div></div>
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
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap w-24">Task ID</th>
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
                  filteredTasks.map((task) => {
                    const isExpanded = expandedTaskId === task.WorkItemID;
                    const hasDoc = !!task.Document;

                    return (
                      <React.Fragment key={task.WorkItemID}>
                        <tr className={`hover:bg-slate-50/50 transition-colors ${task.Status === 'Completed' ? 'opacity-65' : ''}`}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                            <button
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.WorkItemID)}
                              className="inline-flex items-center gap-1.5 hover:text-sky-700 transition-colors focus:outline-none"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              <span>T-{task.WorkItemID}</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                            <div className="flex items-center gap-2">
                              <span
                                className={`cursor-pointer hover:text-sky-700 transition-colors ${task.Status === 'Completed' ? 'line-through text-slate-500' : ''}`}
                                onClick={() => setDetailTaskId(task.WorkItemID)}
                              >
                                {task.Title}
                              </span>
                              {hasDoc && (
                                <span title="Document attached" className="inline-flex items-center">
                                  <FileText
                                    size={15}
                                    className="text-amber-500 cursor-pointer animate-pulse"
                                    onClick={() => setDetailTaskId(task.WorkItemID)}
                                  />
                                </span>
                              )}
                              {task.SubTasks && task.SubTasks.length > 0 && (
                                <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                                  {task.SubTasks.filter(s => s.Status === 'Completed').length}/{task.SubTasks.length} subtasks
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                            {task.AssigneeName || (
                              <button
                                onClick={() => setAssignmentTask(task)}
                                className="text-xs text-sky-700 hover:text-sky-800 font-bold bg-sky-50 px-2 py-1 rounded border border-sky-200 transition-all"
                              >
                                Assign Task
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {new Date(task.DueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(task.Status)}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap relative">
                            <div className="inline-flex items-center gap-2">
                              {task.Status === 'Ready for Review' && (
                                <button
                                  onClick={() => handleStatusChange(task.WorkItemID, 'Completed')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                >
                                  <CheckCircle2 size={13} /> Approve
                                </button>
                              )}

                              <button
                                onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === task.WorkItemID ? null : task.WorkItemID); }}
                                className="inline-flex justify-center items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1 rounded hover:bg-slate-100"
                              >
                                <MoreVertical size={20} />
                              </button>
                            </div>

                            {/* Dropdown menu */}
                            {actionMenuId === task.WorkItemID && (
                              <div className="absolute right-6 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-20 py-1" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => { setDetailTaskId(task.WorkItemID); setActionMenuId(null); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2.5 transition-colors">
                                  <Edit3 size={14} /> Edit & View details
                                </button>
                                {task.Status !== 'In Progress' && (
                                  <button onClick={() => handleStatusChange(task.WorkItemID, 'In Progress')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2.5 transition-colors">
                                    <Pencil size={14} /> Start Task
                                  </button>
                                )}
                                {task.Status !== 'Completed' && (
                                  <button onClick={() => handleStatusChange(task.WorkItemID, 'Completed')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2.5 transition-colors">
                                    <CheckCircle2 size={14} /> Complete Task
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

                        {/* Collapsible Subtasks and Document Details */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={6} className="px-10 py-5 border-l-4 border-sky-600">
                              <div className="flex flex-col gap-5">
                                {/* Document Display */}
                                {hasDoc ? (
                                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl max-w-3xl flex flex-col gap-1 shadow-sm">
                                    <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                      <FileText size={14} /> Reference Document
                                    </span>
                                    <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{task.Document}</p>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-400 font-medium">No document attached to this task.</div>
                                )}

                                {/* Subtasks Management */}
                                <div className="flex flex-col gap-3">
                                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <ListChecks size={14} />
                                    Subtasks List ({task.SubTasks?.filter(s => s.Status === 'Completed').length || 0} / {task.SubTasks?.length || 0})
                                  </span>

                                  {/* Inline Add Form */}
                                  <div className="flex gap-2 max-w-xl">
                                    <input
                                      type="text"
                                      placeholder="Create a new subtask inline..."
                                      value={newSubtaskTitles[task.WorkItemID] || ''}
                                      onChange={(e) => setNewSubtaskTitles(prev => ({ ...prev, [task.WorkItemID]: e.target.value }))}
                                      className="flex-1 px-3.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddSubtask(task.WorkItemID);
                                      }}
                                    />
                                    <button
                                      onClick={() => handleAddSubtask(task.WorkItemID)}
                                      className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                                    >
                                      <Plus size={14} /> Add
                                    </button>
                                  </div>

                                  {task.SubTasks && task.SubTasks.length > 0 ? (
                                    <div className="flex flex-col gap-2 max-w-2xl bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                      {task.SubTasks.map((sub, index) => {
                                        const isEditing = editingSubtaskId === sub.SubTaskID;
                                        return (
                                          <div
                                            key={sub.SubTaskID}
                                            className={`flex justify-between items-center py-1.5 border-b border-slate-100 last:border-b-0 text-sm font-semibold text-slate-700`}
                                          >
                                            <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                                              {/* Checkbox */}
                                              <div
                                                onClick={() => handleToggleSubtask(sub.SubTaskID, sub.Status)}
                                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${sub.Status === 'Completed'
                                                    ? 'bg-green-600 border-green-600 text-white'
                                                    : 'border-slate-300 bg-white hover:border-slate-400'
                                                  }`}
                                              >
                                                {sub.Status === 'Completed' && <Check size={11} strokeWidth={3} />}
                                              </div>

                                              {/* Number & Text/Input */}
                                              <span className="text-slate-400 text-xs w-4">{index + 1}.</span>
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editingSubtaskTitle}
                                                  onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                                  className="flex-1 px-2 py-0.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-normal"
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveSubtaskTitle(sub.SubTaskID);
                                                    if (e.key === 'Escape') setEditingSubtaskId(null);
                                                  }}
                                                  autoFocus
                                                />
                                              ) : (
                                                <span className={`flex-1 truncate ${sub.Status === 'Completed' ? 'line-through text-slate-400 font-medium' : ''}`}>
                                                  {sub.Title}
                                                </span>
                                              )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              {isEditing ? (
                                                <>
                                                  <button
                                                    onClick={() => handleSaveSubtaskTitle(sub.SubTaskID)}
                                                    className="p-1 hover:bg-slate-100 rounded text-green-600 hover:text-green-800 transition-colors"
                                                    title="Save title"
                                                  >
                                                    <Check size={14} strokeWidth={2.5} />
                                                  </button>
                                                  <button
                                                    onClick={() => setEditingSubtaskId(null)}
                                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors"
                                                    title="Cancel"
                                                  >
                                                    <X size={14} />
                                                  </button>
                                                </>
                                              ) : (
                                                <>
                                                  <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${sub.Status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
                                                    }`}>
                                                    {sub.Status}
                                                  </span>
                                                  <button
                                                    onClick={() => {
                                                      setEditingSubtaskId(sub.SubTaskID);
                                                      setEditingSubtaskTitle(sub.Title);
                                                    }}
                                                    className="p-1.5 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                                    title="Edit subtask title"
                                                  >
                                                    <Pencil size={12} />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteSubtask(sub.SubTaskID)}
                                                    className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                                    title="Delete subtask"
                                                  >
                                                    <Trash2 size={12} />
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-400 italic">No subtasks added yet.</p>
                                  )}

                                  <div className="mt-2 flex gap-3">
                                    <button
                                      onClick={() => setDetailTaskId(task.WorkItemID)}
                                      className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                                    >
                                      <Pencil size={13} /> Edit Task Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
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

      <WorkAssignmentModal
        isOpen={!!assignmentTask}
        onClose={() => setAssignmentTask(null)}
        task={assignmentTask}
        onSuccess={() => fetchTasks()}
      />

      <TaskDetailModal
        isOpen={detailTaskId !== null}
        onClose={() => setDetailTaskId(null)}
        taskId={detailTaskId}
        onSuccess={() => fetchTasks()}
      />

      <CreateWorkAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSuccess={() => fetchTasks()}
      />
    </div>
  );
};

export default WorkManagement;
