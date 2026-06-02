import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Plus, Loader2, AlertCircle, Briefcase, Users,
  Pencil, Trash2, ChevronDown, Award, X
} from 'lucide-react';
import api from '../../services/api';
import { CreateWorkAssignmentModal } from '../../components/common/CreateWorkAssignmentModal';

interface AssignmentRow {
  AssignmentID: number;
  GroupID: string;
  WorkItemID: number;
  TaskTitle: string;
  TaskStatus: string;
  EmployeeID: number;
  EmployeeName: string;
  EmployeeEmail: string;
  EmployeeRole: string;
  Department?: string;
  RoleInWork: string;
  AssignmentName: string;
  Description: string;
  Status: string;
  AssignedAt: string;
}

interface GroupedAssignment {
  Key: string;
  GroupID: string;
  GroupName: string;
  Description: string;
  Status: string;
  RoleInWork: string;
  AssignedAt: string;
  AssignmentIDs: number[];
  Tasks: { 
    WorkItemID: number; 
    Title: string; 
    Status: string; 
    Staff: { EmployeeID: number; Name: string; Email: string; Role: string; Department?: string }[]
  }[];
  Staff: { EmployeeID: number; Name: string; Email: string; Role: string; Department?: string }[];
}

const STATUS_BADGE: Record<string, string> = {
  Assigned: 'bg-slate-100 border-slate-200 text-slate-600',
  Active:   'bg-sky-50 border-sky-200 text-sky-700',
  'On Hold':'bg-amber-50 border-amber-200 text-amber-700',
  Completed:'bg-green-50 border-green-200 text-green-700',
};

const TASK_STATUS_BADGE: Record<string, string> = {
  'Pending': 'bg-slate-100 text-slate-600 border-slate-200',
  'In Progress': 'bg-sky-100 text-sky-800 border-sky-200',
  'Review': 'bg-purple-100 text-purple-800 border-purple-200',
  'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const STATUSES = ['Assigned', 'Active', 'On Hold', 'Completed'];

const WorkAssignment: React.FC = () => {
  const [rawAssignments, setRawAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading]             = useState(true);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingGroup, setEditingGroup]   = useState<GroupedAssignment | null>(null);
  const [statusFilter, setStatusFilter]   = useState('All');
  const [searchTerm, setSearchTerm]       = useState('');
  const [message, setMessage]             = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [selectedEditGroupId, setSelectedEditGroupId]   = useState('');
  const [selectedEditTask, setSelectedEditTask]         = useState<any>(null);

  const handleOpenEditStaff = (groupId: string, task: any) => {
    setSelectedEditGroupId(groupId);
    setSelectedEditTask(task);
    setIsEditStaffModalOpen(true);
  };

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/works/assignments');
      setRawAssignments(data || []);
    } catch {
      setMessage({ type: 'error', text: 'Failed to retrieve work assignments.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  // Auto-dismiss message
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  // Grouping logic (groups by GroupID string)
  const groupedAssignments = useMemo((): GroupedAssignment[] => {
    const groups: Record<string, GroupedAssignment> = {};
    
    rawAssignments.forEach(row => {
      const gId = row.GroupID || 'none';
      if (!groups[gId]) {
        groups[gId] = {
          Key: `group-${gId}`,
          GroupID: gId,
          GroupName: row.AssignmentName || `Assignment #${row.AssignmentID}`,
          Description: row.Description || 'No description provided.',
          Status: row.Status || 'Assigned',
          RoleInWork: row.RoleInWork || 'Assignee',
          AssignedAt: row.AssignedAt,
          AssignmentIDs: [],
          Tasks: [],
          Staff: []
        };
      }

      const g = groups[gId];
      g.AssignmentIDs.push(row.AssignmentID);

      let taskObj = g.Tasks.find(t => t.WorkItemID === row.WorkItemID);
      if (!taskObj && row.WorkItemID) {
        taskObj = { 
          WorkItemID: row.WorkItemID, 
          Title: row.TaskTitle, 
          Status: row.TaskStatus || 'Pending',
          Staff: []
        };
        g.Tasks.push(taskObj);
      }

      if (taskObj && row.EmployeeID && !taskObj.Staff.some(s => s.EmployeeID === row.EmployeeID)) {
        taskObj.Staff.push({
          EmployeeID: row.EmployeeID,
          Name: row.EmployeeName,
          Email: row.EmployeeEmail,
          Role: row.EmployeeRole,
          Department: row.Department
        });
      }

      if (row.EmployeeID && !g.Staff.some(s => s.EmployeeID === row.EmployeeID)) {
        g.Staff.push({
          EmployeeID: row.EmployeeID,
          Name: row.EmployeeName,
          Email: row.EmployeeEmail,
          Role: row.EmployeeRole,
          Department: row.Department
        });
      }
    });

    return Object.values(groups).map(g => {
      // Sort tasks within group descending by WorkItemID (newest first)
      g.Tasks = [...g.Tasks].sort((a, b) => b.WorkItemID - a.WorkItemID);
      return g;
    }).sort((a, b) => {
      // Sort groups descending by AssignedAt (newest first)
      const timeA = a.AssignedAt ? new Date(a.AssignedAt).getTime() : 0;
      const timeB = b.AssignedAt ? new Date(b.AssignedAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [rawAssignments]);

  const startEdit = (group: GroupedAssignment) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleQuickStatus = async (group: GroupedAssignment, newStatus: string) => {
    try {
      await api.put('/works/assignments/group/update', {
        groupId: group.GroupID,
        status: newStatus
      });
      fetchAssignments();
      setMessage({ type: 'success', text: `Status updated to "${newStatus}" for assignment.` });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update status.' });
    }
  };

  const handleDelete = async (group: GroupedAssignment) => {
    if (!window.confirm(`Are you sure you want to delete the assignment "${group.GroupName}"?\nThis will remove all associated task-staff allocations.`)) return;
    try {
      await api.post('/works/assignments/group/delete', {
        groupId: group.GroupID
      });
      setMessage({ type: 'success', text: `Grouped assignment removed.` });
      fetchAssignments();
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove grouped assignment.' });
    }
  };

  const filtered = groupedAssignments.filter(group => {
    if (statusFilter !== 'All' && group.Status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = group.GroupName.toLowerCase().includes(q);
      const matchDesc = group.Description.toLowerCase().includes(q);
      const matchTasks = group.Tasks.some(t => t.Title.toLowerCase().includes(q));
      const matchStaff = group.Staff.some(s => s.Name.toLowerCase().includes(q) || (s.Department || '').toLowerCase().includes(q));
      return matchName || matchDesc || matchTasks || matchStaff;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-slate-50/50">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6 font-sans">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-zinc-900 text-3xl font-bold tracking-tight">Work Assignments</h1>
            <p className="text-gray-600 text-sm mt-0.5 font-medium">View, edit, and manage staff task allocations grouped by Assignment.</p>
          </div>
          <button
            onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg shadow-sm transition-colors text-sm font-bold active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.5} /> Create Work Assignment
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold animate-fade-in ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <AlertCircle size={16} className="shrink-0" /> {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-bold text-slate-600">Search</label>
            <div className="relative">
              <input type="text" placeholder="Search by assignment name, tasks, staff, department…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            </div>
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-[200px]">
            <label className="text-xs font-bold text-slate-600">Status Filter</label>
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                {['All', ...STATUSES].map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-sky-600" size={30} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5 w-[25%]">Assignment</th>
                    <th className="px-5 py-3.5 w-[30%]">Work Items (Tasks) & Status</th>
                    <th className="px-5 py-3.5 w-[25%]">Employees Doing It</th>
                    <th className="px-5 py-3.5 w-[10%]">Role</th>
                    <th className="px-5 py-3.5 w-[10%]">Status</th>
                    <th className="px-5 py-3.5 text-center w-[10%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center text-sm text-slate-400 font-medium">
                        {groupedAssignments.length === 0
                          ? "No assignments yet. Click 'Create Work Assignment' to get started."
                          : "No assignments match your current filters."}
                      </td>
                    </tr>
                  ) : filtered.map(group => {
                    return (
                      <tr key={group.Key} className="transition-colors hover:bg-slate-50/40">

                        {/* Assignment info */}
                        <td className="px-5 py-3.5 align-top">
                          <span className="text-sm font-bold text-slate-800 block">{group.GroupName}</span>
                          <span className="text-xs text-slate-500 line-clamp-3 mt-1 font-medium leading-relaxed">{group.Description}</span>
                          <span className="text-[10px] text-slate-400 mt-2 block font-semibold">
                            {group.AssignedAt ? new Date(group.AssignedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                          </span>
                        </td>

                        {/* Work Items / Tasks */}
                        <td className="px-5 py-3.5 align-top">
                          <div className="flex flex-col gap-2">
                            {group.Tasks.map(t => (
                              <button 
                                key={t.WorkItemID} 
                                onClick={() => handleOpenEditStaff(group.GroupID, t)}
                                className="w-full text-left flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/60 rounded-xl p-3 shadow-sm hover:shadow hover:bg-sky-50/30 hover:border-sky-200/60 transition-all select-none group"
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <Briefcase size={12} className="text-slate-400 group-hover:text-sky-600 shrink-0 mt-1 transition-colors" />
                                  <div className="min-w-0">
                                    <span className="text-[9px] font-extrabold text-slate-400 group-hover:text-sky-700/70 block leading-none transition-colors">T-{t.WorkItemID}</span>
                                    <span className="text-xs font-bold text-slate-700 truncate block mt-1 leading-tight group-hover:text-sky-900 transition-colors">{t.Title}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full border tracking-wide uppercase ${TASK_STATUS_BADGE[t.Status] || 'bg-slate-100 text-slate-600'}`}>
                                    {t.Status}
                                  </span>
                                  <Pencil size={11} className="text-slate-300 group-hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* Staff / Employees doing it */}
                        <td className="px-5 py-3.5 align-top">
                          <div className="flex flex-col gap-2">
                            {group.Staff.map(s => (
                              <div key={s.EmployeeID} className="flex items-start gap-2.5 bg-sky-50/50 border border-sky-100/40 rounded-xl p-2 px-3 hover:bg-sky-50 transition-colors">
                                <Users size={12} className="text-sky-700 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-800 block leading-tight">{s.Name}</span>
                                  <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                                    {s.Department || 'N/A'} • {s.Role}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-3.5 align-top whitespace-nowrap">
                          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                            <Award size={11} className="text-slate-500" />
                            {group.RoleInWork}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 align-top whitespace-nowrap">
                          <div className="relative group inline-block">
                            <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded border uppercase tracking-wider cursor-pointer ${STATUS_BADGE[group.Status] || STATUS_BADGE['Assigned']}`}>
                              {group.Status}
                            </span>
                            {/* Quick status dropdown on hover */}
                            <div className="absolute left-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-200 z-20 hidden group-hover:flex flex-col py-1 overflow-hidden">
                              {STATUSES.filter(s => s !== group.Status).map(s => (
                                <button key={s} onClick={() => handleQuickStatus(group, s)}
                                  className="text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-bold">
                                  → {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 align-top whitespace-nowrap text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => startEdit(group)}
                              className="p-1.5 hover:bg-sky-50 text-slate-400 hover:text-sky-700 rounded-lg transition-colors"
                              title="Edit assignment">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(group)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Remove assignment">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-bold">
            Showing {filtered.length} of {groupedAssignments.length} grouped assignments
          </div>
        </div>

      </div>

      <CreateWorkAssignmentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingGroup(null); }}
        editGroup={editingGroup}
        onSuccess={() => {
          fetchAssignments();
          setMessage({
            type: 'success',
            text: editingGroup ? 'Work assignment updated successfully!' : 'Work assignment created successfully!'
          });
          setEditingGroup(null);
        }}
      />

      <EditTaskStaffModal
        isOpen={isEditStaffModalOpen}
        onClose={() => { setIsEditStaffModalOpen(false); setSelectedEditTask(null); }}
        groupId={selectedEditGroupId}
        task={selectedEditTask}
        onSuccess={fetchAssignments}
      />
    </div>
  );
};

/* ── Task-Specific Staff Editor Popup Modal ── */
interface EditTaskStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  task: { WorkItemID: number; Title: string; Staff: any[] } | null;
  onSuccess: () => void;
}

const EditTaskStaffModal: React.FC<EditTaskStaffModalProps> = ({
  isOpen,
  onClose,
  groupId,
  task,
  onSuccess
}) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(() => {
    if (!isOpen || !task) return;
    setSelectedIds(task.Staff.map((s: any) => s.EmployeeID));
    setSearchTerm('');
    setDeptFilter('All');
    setLoadingEmployees(true);
    api.get('/employees')
      .then(data => setEmployees(data || []))
      .catch(err => console.error(err))
      .finally(() => setLoadingEmployees(false));
  }, [isOpen, task]);

  const handleToggle = (empId: number) => {
    setSelectedIds(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleSave = async () => {
    if (!task) return;
    setLoading(true);
    try {
      await api.put('/works/assignments/group/task-staff', {
        groupId,
        workItemId: task.WorkItemID,
        employeeIds: selectedIds
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update employees assigned to this task.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamically compute unique departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach(e => {
      if (e.Department) depts.add(e.Department);
    });
    return ['All', ...Array.from(depts)];
  }, [employees]);

  // Filter and Sort employees: selected on top, then alphabetical name
  const processedEmployees = useMemo(() => {
    let list = employees.filter(e => {
      const matchesSearch = e.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.Role || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'All' || e.Department === deptFilter;
      return matchesSearch && matchesDept;
    });

    list = [...list].sort((a, b) => {
      const aSel = selectedIds.includes(a.EmployeeID) ? 1 : 0;
      const bSel = selectedIds.includes(b.EmployeeID) ? 1 : 0;
      if (aSel !== bSel) {
        return bSel - aSel; // Selected on top
      }
      return a.Name.localeCompare(b.Name);
    });

    return list;
  }, [employees, searchTerm, deptFilter, selectedIds]);

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-sky-700">
          <div>
            <h3 className="text-base font-bold text-white">Edit Task Staff</h3>
            <p className="text-xs text-sky-100 mt-0.5">T-{task.WorkItemID}: {task.Title}</p>
          </div>
          <button onClick={onClose} className="text-sky-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Search & Department Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            </div>
            
            <div className="relative">
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer w-full sm:w-[150px] font-medium"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>Dept: {dept}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>

          {/* List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto flex flex-col divide-y divide-slate-100 bg-slate-50/50">
            {loadingEmployees ? (
              <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-sky-700" /> Loading staff list...
              </div>
            ) : processedEmployees.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No staff found matching query.</div>
            ) : (
              processedEmployees.map(emp => {
                const isChecked = selectedIds.includes(emp.EmployeeID);
                return (
                  <label key={emp.EmployeeID} className="flex items-center gap-3 p-3 hover:bg-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggle(emp.EmployeeID)}
                      className="w-4 h-4 rounded text-sky-700 focus:ring-sky-500 focus:ring-offset-0 border-slate-300 bg-white"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{emp.Name}</span>
                      <span className="text-xs text-slate-500">{emp.Department || 'N/A'} • {emp.Role}</span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default WorkAssignment;
