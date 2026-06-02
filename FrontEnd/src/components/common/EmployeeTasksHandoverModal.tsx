import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, ArrowRightLeft, Send, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface EmployeeTasksHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    EmployeeID: number;
    Name: string;
    Department?: string;
  } | null;
}

interface ActiveTask {
  AssignmentID: number;
  WorkItemID: number;
  TaskTitle: string;
  TaskStatus: string;
  AssignmentName: string;
  Description: string;
  Status: string;
}

export const EmployeeTasksHandoverModal: React.FC<EmployeeTasksHandoverModalProps> = ({
  isOpen,
  onClose,
  employee
}) => {
  const [tasks, setTasks] = useState<ActiveTask[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // Selected task to hand over
  const [selectedTask, setSelectedEditTask] = useState<ActiveTask | null>(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen || !employee) return;

    setLoadingTasks(true);
    setError('');
    setSuccessMessage('');
    setSelectedEditTask(null);
    setTargetEmployeeId('');
    setReason('');
    setExpandedTaskId(null);

    // Fetch active assignments & employees list
    Promise.all([
      api.get('/works/assignments'),
      api.get('/employees')
    ])
      .then(([assignments, allEmps]) => {
        // Filter tasks for this employee where the assignment or work item status is not completed
        const activeTasks = (assignments || []).filter((a: any) => 
          a.EmployeeID == employee.EmployeeID && 
          a.Status !== 'Completed' && 
          a.TaskStatus !== 'Completed'
        );
        setTasks(activeTasks);

        // Filter out the current employee and any managers from recipients list
        const others = (allEmps || []).filter((e: any) => 
          e.EmployeeID !== employee.EmployeeID &&
          !e.Role.toLowerCase().includes('manager')
        );
        setEmployees(others);
        if (others.length > 0) {
          setTargetEmployeeId(others[0].EmployeeID.toString());
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to retrieve task and staff information.');
      })
      .finally(() => setLoadingTasks(false));
  }, [isOpen, employee]);

  const handleSuggestClick = (task: ActiveTask) => {
    setSelectedEditTask(task);
    setReason('');
  };

  const handleCancelSuggest = () => {
    setSelectedEditTask(null);
    setReason('');
  };

  const handleSendHandover = async () => {
    if (!employee || !selectedTask || !targetEmployeeId) return;

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      // 1. Create HandOverRecord
      const hoRes = await api.post('/handovers/initiate', {
        fromEmployeeId: employee.EmployeeID,
        toEmployeeId: parseInt(targetEmployeeId),
        reason: reason.trim() || 'Suggested Handover'
      });

      // 2. Create HandOverItem
      await api.post(`/handovers/${hoRes.id}/items`, {
        assignmentId: selectedTask.AssignmentID,
        note: reason.trim() || 'Suggested Handover'
      });

      setSuccessMessage(`Successfully suggested handover for "${selectedTask.TaskTitle || selectedTask.AssignmentName}"`);
      
      // Remove the task from local list
      setTasks(prev => prev.filter(t => t.AssignmentID !== selectedTask.AssignmentID));
      setSelectedEditTask(null);
      setReason('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to suggest handover. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[550px] flex flex-col overflow-hidden max-h-[90vh] animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-700 to-sky-600 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Briefcase size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Active Tasks</h3>
              <p className="text-xs text-sky-100 mt-0.5">{employee.Name} • {employee.Department || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-sky-200 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
          
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
              <AlertCircle size={16} className="shrink-0" />
              {successMessage}
            </div>
          )}

          {loadingTasks ? (
            <div className="py-16 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-sky-600" size={24} />
              <span>Loading employee tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400 font-medium">
              This employee has no active tasks to suggest handover for.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Active Assigned Work Items ({tasks.length})
              </span>
              
              <div className="flex flex-col gap-3">
                {tasks.map(task => {
                  const isSuggestingThis = selectedTask?.AssignmentID === task.AssignmentID;
                  const isExpanded = expandedTaskId === task.AssignmentID;
                  
                  return (
                    <div 
                      key={task.AssignmentID}
                      className={`border rounded-xl transition-all duration-200 ${
                        isSuggestingThis 
                          ? 'border-sky-500 bg-sky-50/20 ring-1 ring-sky-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white shadow-sm'
                      }`}
                    >
                      {/* Card Header (Clickable for toggle) */}
                      <div 
                        onClick={() => setExpandedTaskId(prev => prev === task.AssignmentID ? null : task.AssignmentID)}
                        className="flex items-start justify-between gap-3 p-4 cursor-pointer select-none hover:bg-slate-50/50 rounded-t-xl"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded uppercase">
                              T-{task.WorkItemID}
                            </span>
                            <span className="text-sm font-bold text-slate-800 truncate">
                              {task.TaskTitle || task.AssignmentName}
                            </span>
                          </div>
                          {!isExpanded && task.Description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {task.Description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {!isSuggestingThis && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSuggestClick(task);
                              }}
                              className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/50 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-[0.98]"
                            >
                              <ArrowRightLeft size={11} /> Suggest Handover
                            </button>
                          )}
                          <div className="text-slate-400 p-1">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content Detail Dropdown */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-100 pt-3 flex flex-col gap-3.5 bg-slate-50/30 rounded-b-xl animate-fade-in">
                          {task.Description && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</span>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {task.Description}
                              </p>
                            </div>
                          )}

                          {/* Detail Grid */}
                          <div className="grid grid-cols-2 gap-2.5 bg-white border border-slate-200/60 rounded-lg p-3 text-[11px] shadow-sm">
                            <div>
                              <span className="text-slate-400 font-semibold block">Work Assignment Group</span>
                              <span className="text-slate-800 font-bold block mt-0.5">{task.AssignmentName || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-semibold block">Task Status</span>
                              <span className="text-slate-800 font-bold block mt-0.5">{task.TaskStatus || 'Pending'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-semibold block">Assignment Status</span>
                              <span className="text-slate-800 font-bold block mt-0.5">{task.Status || 'Assigned'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-semibold block">Assignment ID</span>
                              <span className="text-slate-800 font-bold block mt-0.5">#{task.AssignmentID}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Handover suggestion panel inline */}
                      {isSuggestingThis && (
                        <div className="mx-4 mb-4 p-4 border border-sky-100 bg-sky-50/40 rounded-xl flex flex-col gap-3 animate-fade-in">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Suggest transfer to:</label>
                            <div className="relative">
                              <select 
                                value={targetEmployeeId}
                                onChange={e => setTargetEmployeeId(e.target.value)}
                                className="w-full appearance-none px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                              >
                                {employees.map(emp => (
                                  <option key={emp.EmployeeID} value={emp.EmployeeID}>
                                    {emp.Name} ({emp.Role})
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Reason / Instructions:</label>
                            <textarea 
                              rows={2}
                              value={reason}
                              onChange={e => setReason(e.target.value)}
                              placeholder="Describe reason for suggesting this shift handover..."
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div className="flex justify-end items-center gap-1.5 mt-1">
                            <button
                              onClick={handleCancelSuggest}
                              disabled={submitting}
                              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSendHandover}
                              disabled={submitting}
                              className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-[0.98]"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 size={11} className="animate-spin" /> Suggesting...
                                </>
                              ) : (
                                <>
                                  <Send size={11} /> Submit Suggestion
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
