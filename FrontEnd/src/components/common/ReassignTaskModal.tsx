import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { getBottleneckSuggestions, reassignWork } from '../../services/managerService';

interface ReassignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: {
    WorkItemID: number;
    Title: string;
    Status: string;
    DueDate?: string;
    AssigneeName?: string;
  } | null;
  onSuccess?: () => void;
}

const ReassignTaskModal: React.FC<ReassignTaskModalProps> = ({ isOpen, onClose, task, onSuccess }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setLoading(true);
      setSelectedEmployee(null);
      setReason('');
      getBottleneckSuggestions(task.WorkItemID)
        .then(data => {
          setSuggestions(data);
          if (data.length > 0) setSelectedEmployee(data[0].EmployeeID);
        })
        .catch(err => console.error('Failed to fetch suggestions', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, task]);

  const handleConfirm = async () => {
    if (!task || !selectedEmployee) return;
    setSubmitting(true);
    try {
      const userStr = localStorage.getItem('user');
      const managerId = userStr ? JSON.parse(userStr).EmployeeID : 1;
      await reassignWork({
        workItemId: task.WorkItemID,
        newEmployeeId: selectedEmployee,
        reassignedBy: managerId,
        reason: reason || `Reassigned from ${task.AssigneeName || 'Unknown'}`
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to reassign', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-rose-600" size={18} />
            </div>
            <div>
              <h2 className="text-zinc-900 text-xl font-semibold">Reassign Task</h2>
              <p className="text-gray-700 text-xs font-medium mt-0.5">T-{task.WorkItemID} · {task.Title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex justify-center items-center hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col gap-6 overflow-y-auto">
          
          {/* Task Context */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task Context</span>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-slate-500 font-medium">Status</div>
                <div className="text-sm font-semibold text-rose-700 mt-0.5">{task.Status}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Current Assignee</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{task.AssigneeName || 'Unassigned'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Due Date</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {task.DueDate ? new Date(task.DueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Reassignment</span>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-sky-600" size={24} />
                <span className="ml-2 text-sm text-slate-500">Finding available staff...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
                No available staff found for reassignment.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                {suggestions.map((emp, idx) => (
                  <button
                    key={emp.EmployeeID}
                    onClick={() => setSelectedEmployee(emp.EmployeeID)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedEmployee === emp.EmployeeID 
                        ? 'border-sky-500 bg-sky-50 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        selectedEmployee === emp.EmployeeID ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {emp.Name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900">{emp.Name}</div>
                        <div className="text-xs text-slate-500">{emp.ActiveTasks} active tasks</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {idx === 0 && (
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-bold uppercase rounded">Recommended</span>
                      )}
                      {emp.ActiveTasks === 0 && (
                        <CheckCircle2 size={16} className="text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason for Reassignment</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for reassignment..."
              className="w-full min-h-[80px] p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none placeholder-slate-400"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-4 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedEmployee || submitting}
            className={`px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 ${
              !selectedEmployee || submitting ? 'bg-slate-300 cursor-not-allowed' : 'bg-sky-700 hover:bg-sky-800'
            }`}
          >
            {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignTaskModal;
