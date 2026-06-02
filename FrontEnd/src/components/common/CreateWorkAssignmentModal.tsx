import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, CheckSquare, Square, UserPlus, Briefcase, ChevronDown, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface Employee {
  EmployeeID: number;
  Name: string;
  Email: string;
  Role: string;
  Department?: string;
  Position?: string;
}

interface Task {
  WorkItemID: number;
  Title: string;
  Description?: string;
  Status: string;
}

interface CreateWorkAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editGroup?: any; // optional group to edit
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-600 border-slate-200',
  'In Progress': 'bg-sky-50 text-sky-700 border-sky-200',
  'Ready for Review': 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-rose-50 text-rose-600 border-rose-200',
};

export const CreateWorkAssignmentModal: React.FC<CreateWorkAssignmentModalProps> = ({
  isOpen, onClose, onSuccess, editGroup
}) => {
  const [assignmentName, setAssignmentName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Assigned');
  const [roleInWork, setRoleInWork] = useState('Assignee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lists
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Task filters
  const [taskSearch, setTaskSearch] = useState('');
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Employee filters
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Selections
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setDataLoading(true);
    setError('');

    if (editGroup) {
      setAssignmentName(editGroup.GroupName || '');
      setDescription(editGroup.Description || '');
      setStatus(editGroup.Status || 'Assigned');
      setRoleInWork(editGroup.RoleInWork || 'Assignee');
      setSelectedTaskIds(editGroup.Tasks.map((t: any) => t.WorkItemID));
      setSelectedEmployeeIds(editGroup.Staff.map((s: any) => s.EmployeeID));
    } else {
      setAssignmentName('');
      setDescription('');
      setStatus('Assigned');
      setRoleInWork('Assignee');
      setSelectedTaskIds([]);
      setSelectedEmployeeIds([]);
    }

    setTaskSearch('');
    setShowAllTasks(false);
    setEmployeeSearch('');
    setDeptFilter('All');

    Promise.all([api.get('/works'), api.get('/employees')])
      .then(([worksData, empsData]) => {
        setTasks(worksData || []);
        const nonManagers = (empsData || []).filter((e: any) => !e.Role.toLowerCase().includes('manager'));
        setEmployees(nonManagers);
      })
      .catch(() => setError('Failed to load tasks or employees. Please retry.'))
      .finally(() => setDataLoading(false));
  }, [isOpen, editGroup]);

  // Derived filter lists
  const allDepartments = useMemo(() =>
    ['All', ...Array.from(new Set(employees.map(e => e.Department || 'N/A').filter(Boolean)))],
    [employees]);

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (!showAllTasks && t.Status !== 'Pending' && !selectedTaskIds.includes(t.WorkItemID)) return false;
    const q = taskSearch.toLowerCase();
    return !q || t.Title.toLowerCase().includes(q) || (t.Description || '').toLowerCase().includes(q);
  }), [tasks, taskSearch, showAllTasks, selectedTaskIds]);

  const filteredEmployees = useMemo(() => employees.filter(e => {
    if (deptFilter !== 'All' && (e.Department || 'N/A') !== deptFilter) return false;
    const q = employeeSearch.toLowerCase();
    return !q || e.Name.toLowerCase().includes(q) || e.Email.toLowerCase().includes(q)
      || (e.Department || '').toLowerCase().includes(q) || (e.Position || '').toLowerCase().includes(q);
  }), [employees, employeeSearch, deptFilter]);

  const handleSave = async () => {
    setError('');
    if (!assignmentName.trim()) { setError('Assignment Name is required.'); return; }
    if (selectedTaskIds.length === 0) { setError('Please select at least one work item.'); return; }
    if (selectedEmployeeIds.length === 0) { setError('Please select at least one employee.'); return; }

    setLoading(true);
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (editGroup) {
        await api.put('/works/assignments/group/update', {
          groupId: editGroup.GroupID,
          assignmentName: assignmentName.trim(),
          description: description.trim(),
          status,
          roleInWork,
          workItemIds: selectedTaskIds,
          employeeIds: selectedEmployeeIds
        });
      } else {
        await api.post('/works/assignments/bulk', {
          workItemIds: selectedTaskIds,
          employeeIds: selectedEmployeeIds,
          assignedBy: user.EmployeeID || 1,
          roleInWork,
          assignmentName: assignmentName.trim(),
          description: description.trim(),
          status,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] flex flex-col overflow-hidden max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-700 to-sky-600 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus size={20} /> {editGroup ? 'Edit Work Assignment' : 'Create Work Assignment'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-sky-200 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar">

          {error && (
            <div className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm font-medium">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Assignment Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. ICU Night Shift Allocation"
                value={assignmentName}
                onChange={e => setAssignmentName(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Role in Work</label>
              <select value={roleInWork} onChange={e => setRoleInWork(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="Assignee">Assignee</option>
                <option value="Primary">Primary Specialist</option>
                <option value="Supporting">Supporting Hand</option>
                <option value="Consultant">Consultant</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Description</label>
              <textarea rows={2} placeholder="Specific shift instructions or assignment scope..."
                value={description} onChange={e => setDescription(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Assignment Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="Assigned">Assigned</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {dataLoading ? (
            <div className="py-10 text-center text-sm text-slate-400">Loading tasks and employees…</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-5 min-h-[320px]">

              {/* Left: Tasks */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={13} className="text-sky-700" /> Select Tasks
                    <span className="ml-1 bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-extrabold">{selectedTaskIds.length}</span>
                  </span>
                  {selectedTaskIds.length > 0 && (
                    <button onClick={() => setSelectedTaskIds([])} className="text-[10px] text-rose-500 hover:text-rose-700 font-bold">Clear</button>
                  )}
                </div>

                {/* Task filters row */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type="text" placeholder="Search tasks…" value={taskSearch}
                      onChange={e => setTaskSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white hover:bg-slate-50 transition shrink-0">
                    <input 
                      type="checkbox" 
                      checked={showAllTasks} 
                      onChange={e => setShowAllTasks(e.target.checked)} 
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5" 
                    />
                    <span>Show All</span>
                  </label>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 max-h-[260px] overflow-y-auto custom-scrollbar bg-white">
                  {filteredTasks.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-400">No tasks match your filters.</div>
                  ) : filteredTasks.map(task => {
                    const sel = selectedTaskIds.includes(task.WorkItemID);
                    return (
                      <div key={task.WorkItemID} onClick={() => setSelectedTaskIds(prev =>
                        sel ? prev.filter(id => id !== task.WorkItemID) : [...prev, task.WorkItemID])}
                        className={`flex items-start gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer transition-colors select-none ${sel ? 'bg-sky-50' : 'hover:bg-slate-50'}`}>
                        {sel ? <CheckSquare className="text-sky-700 shrink-0 mt-0.5" size={15} /> : <Square className="text-slate-300 shrink-0 mt-0.5" size={15} />}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{task.Title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400">T-{task.WorkItemID}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${STATUS_COLORS[task.Status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              {task.Status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Employees */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus size={13} className="text-sky-700" /> Select Staff
                    <span className="ml-1 bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-extrabold">{selectedEmployeeIds.length}</span>
                  </span>
                  {selectedEmployeeIds.length > 0 && (
                    <button onClick={() => setSelectedEmployeeIds([])} className="text-[10px] text-rose-500 hover:text-rose-700 font-bold">Clear</button>
                  )}
                </div>

                {/* Employee filters row */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type="text" placeholder="Search staff…" value={employeeSearch}
                      onChange={e => setEmployeeSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  </div>
                  <div className="relative">
                    <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                      className="pl-2.5 pr-6 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white">
                      {allDepartments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Dept.' : d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={11} />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 max-h-[260px] overflow-y-auto custom-scrollbar bg-white">
                  {filteredEmployees.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-400">No staff match your filters.</div>
                  ) : filteredEmployees.map(emp => {
                    const sel = selectedEmployeeIds.includes(emp.EmployeeID);
                    return (
                      <div key={emp.EmployeeID} onClick={() => setSelectedEmployeeIds(prev =>
                        sel ? prev.filter(id => id !== emp.EmployeeID) : [...prev, emp.EmployeeID])}
                        className={`flex items-start gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer transition-colors select-none ${sel ? 'bg-sky-50' : 'hover:bg-slate-50'}`}>
                        {sel ? <CheckSquare className="text-sky-700 shrink-0 mt-0.5" size={15} /> : <Square className="text-slate-300 shrink-0 mt-0.5" size={15} />}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{emp.Name}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {emp.Department || 'No Dept'} • {emp.Position || 'No Position'} • {emp.Role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
          </span>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading || dataLoading}
              className="px-5 py-2 text-sm font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Saving…' : (editGroup ? 'Save Changes' : 'Create Assignment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
