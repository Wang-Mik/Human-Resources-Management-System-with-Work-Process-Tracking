import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import api from '../../services/api';

interface Employee {
  EmployeeID: number;
  Name: string;
  Email: string;
  Role: string;
}

interface WorkAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task: {
    WorkItemID: number;
    Title: string;
    Assignees?: { EmployeeID: number; Name: string }[];
  } | null;
}

export const WorkAssignmentModal: React.FC<WorkAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  task
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      // Load employees
      api.get('/employees')
        .then(data => {
          const nonManagers = (data || []).filter((e: any) => !e.Role.toLowerCase().includes('manager'));
          setEmployees(nonManagers);
        })
        .catch(err => console.error('Failed to fetch employees', err));

      // Preset selected employees
      if (task.Assignees) {
        setSelectedIds(task.Assignees.map(a => a.EmployeeID));
      } else {
        setSelectedIds([]);
      }
    }
  }, [isOpen, task]);

  const handleToggle = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!task) return;
    setLoading(true);
    try {
      const userStr = sessionStorage.getItem('user');
      const managerId = userStr ? JSON.parse(userStr).EmployeeID : 1;

      await api.post(`/works/${task.WorkItemID}/assign`, {
        employeeIds: selectedIds,
        assignedBy: managerId,
        roleInWork: 'Primary'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save assignments', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Work Assignment</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assign employees to task T-{task.WorkItemID}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[50vh]">
          <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 mb-2">
            <span className="text-xs font-bold text-sky-700 block uppercase tracking-wider mb-1">Task Title</span>
            <span className="text-sm font-semibold text-slate-800">{task.Title}</span>
          </div>

          <label className="text-sm font-bold text-slate-700">Select Employees</label>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {employees.length === 0 ? (
              <span className="text-sm text-slate-400">Loading employees...</span>
            ) : (
              employees.map(emp => {
                const isChecked = selectedIds.includes(emp.EmployeeID);
                return (
                  <div
                    key={emp.EmployeeID}
                    onClick={() => handleToggle(emp.EmployeeID)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{emp.Name}</span>
                      <span className="text-xs text-slate-500">{emp.Role} • {emp.Email}</span>
                    </div>
                    <div
                      className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-sky-600 border-sky-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-5 py-2 text-sm font-semibold text-white bg-sky-700 rounded-lg shadow-sm hover:bg-sky-800 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
};
