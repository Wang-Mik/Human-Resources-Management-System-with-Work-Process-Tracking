import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, Check, ListChecks, Plus, Trash2, Edit2, Lock, Save, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null;
  onSuccess: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  taskId,
  onSuccess
}) => {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);

  // Edit states for task metadata
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDocument, setEditDocument] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Subtask edit states
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const data = await api.get(`/works/${taskId}`);
      setTask(data);
      setEditTitle(data.Title);
      setEditDescription(data.Description || '');
      setEditDocument(data.Document || '');
      setEditStatus(data.Status);
    } catch (err) {
      console.error('Failed to load task details', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isOpen && taskId) {
      const userStr = sessionStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      setIsManager(user?.Role === 'Manager');

      // Check attendance status
      if (user) {
        api.get(`/availability/attendance/today/${user.EmployeeID}`)
          .then(data => {
            setIsClockedIn(!!data?.CheckInTime && !data?.CheckOutTime);
          })
          .catch(() => setIsClockedIn(false));
      }

      loadTask();
    }
  }, [isOpen, taskId, loadTask]);

  const handleSaveTaskDetails = async () => {
    if (!taskId || !editTitle.trim()) return;
    setSavingTask(true);
    try {
      const userStr = sessionStorage.getItem('user');
      const employeeId = userStr ? JSON.parse(userStr).EmployeeID : null;
      await api.put(`/works/${taskId}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        document: editDocument.trim(),
        workType: task.WorkType,
        status: editStatus,
        employeeId
      });
      await loadTask();
      onSuccess();
    } catch (err) {
      console.error('Failed to update task details', err);
    } finally {
      setSavingTask(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!taskId || !newSubtaskTitle.trim()) return;
    try {
      await api.post(`/works/${taskId}/subtasks`, { title: newSubtaskTitle.trim() });
      setNewSubtaskTitle('');
      await loadTask();
      onSuccess();
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
      await loadTask();
      onSuccess();
    } catch (err) {
      console.error('Failed to save subtask title', err);
    }
  };

  const handleToggleSubtask = async (subtaskId: number, currentStatus: string) => {
    if (!isManager && !isClockedIn) return;
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/works/subtasks/${subtaskId}`, { status: newStatus });
      await loadTask();
      onSuccess();
    } catch (err) {
      console.error('Failed to toggle subtask status', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    try {
      await api.delete(`/works/subtasks/${subtaskId}`);
      await loadTask();
      onSuccess();
    } catch (err) {
      console.error('Failed to delete subtask', err);
    }
  };

  if (!isOpen || !taskId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[850px] flex flex-col overflow-hidden max-h-[90vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Task Details & Structure</h2>
            <p className="text-xs text-slate-500 mt-0.5">Task T-{taskId} • View, structure subtasks, and modify resources.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 flex justify-center items-center flex-1">
            <Loader2 className="animate-spin text-sky-600" size={32} />
          </div>
        ) : !task ? (
          <div className="p-12 text-center text-slate-500 flex-1">Failed to load task data.</div>
        ) : (
          /* Main Content: Split Layout */
          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row gap-6 p-6 custom-scrollbar">
            
            {/* Left Pane: Task Details */}
            <div className="flex-1 flex flex-col gap-4 border-r border-slate-100 pr-0 md:pr-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Task Information</h3>
              
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Title</label>
                {isManager ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <div className="text-sm font-bold text-slate-800 p-2.5 bg-slate-50 rounded-lg border border-slate-100">{task.Title}</div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Description</label>
                {isManager ? (
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                ) : (
                  <div className="text-sm text-slate-700 p-2.5 bg-slate-50 rounded-lg border border-slate-100 min-h-[60px] whitespace-pre-wrap">{task.Description || 'No description provided.'}</div>
                )}
              </div>

              {/* Reference Document */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <FileText size={14} className="text-slate-400" /> Reference Document / Guideline URL
                </label>
                {isManager ? (
                  <textarea
                    rows={3}
                    value={editDocument}
                    onChange={(e) => setEditDocument(e.target.value)}
                    placeholder="Enter guidelines, instructions, or URLs..."
                    className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                ) : (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {task.Document || <span className="italic text-slate-400">No document attached.</span>}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Status</label>
                {isManager ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready for Review">Ready for Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <div className="inline-block mt-0.5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                      task.Status === 'Completed' ? 'bg-green-50 border-green-200 text-green-700' :
                      task.Status === 'Ready for Review' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      task.Status === 'In Progress' ? 'bg-sky-50 border-sky-200 text-sky-700' :
                      'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      {task.Status}
                    </span>
                  </div>
                )}
              </div>

              {/* Save details button */}
              {isManager && (
                <button
                  onClick={handleSaveTaskDetails}
                  disabled={savingTask}
                  className="mt-2 w-full py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-75"
                >
                  {savingTask ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Task Details
                </button>
              )}
            </div>

            {/* Right Pane: Subtasks checklist */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks size={16} /> Subtasks Checklist
                </h3>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  {task.SubTasks?.filter((s: any) => s.Status === 'Completed').length || 0}/{task.SubTasks?.length || 0}
                </span>
              </div>

              {/* Clock-in restriction warning */}
              {!isManager && !isClockedIn && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <Lock size={13} className="shrink-0" />
                  Clock in to check off subtasks.
                </div>
              )}

              {/* Add subtask field (both can add, or manager only? Let's allow both since it facilitates quick notes) */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Create a new subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask();
                  }}
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Scrollable checklist */}
              <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar flex flex-col gap-2 pr-1">
                {task.SubTasks && task.SubTasks.length > 0 ? (
                  task.SubTasks.map((sub: any) => {
                    const isEditing = editingSubtaskId === sub.SubTaskID;
                    return (
                      <div
                        key={sub.SubTaskID}
                        className={`flex items-center justify-between p-3 rounded-xl border bg-white shadow-xs transition-all ${
                          sub.Status === 'Completed' ? 'border-green-200 bg-green-50/5' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                          {/* Checkbox */}
                          <div
                            onClick={() => handleToggleSubtask(sub.SubTaskID, sub.Status)}
                            className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                              sub.Status === 'Completed'
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'border-slate-300 bg-white hover:border-slate-400'
                            } ${(!isManager && !isClockedIn) ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {sub.Status === 'Completed' && <Check size={12} strokeWidth={3} />}
                          </div>

                          {/* Text / Input */}
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingSubtaskTitle}
                              onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                              className="flex-1 px-2 py-0.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveSubtaskTitle(sub.SubTaskID);
                                if (e.key === 'Escape') setEditingSubtaskId(null);
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className={`text-xs font-semibold truncate ${
                              sub.Status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'
                            }`}>
                              {sub.Title}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveSubtaskTitle(sub.SubTaskID)}
                                className="p-1 hover:bg-slate-100 rounded text-green-600 hover:text-green-800 transition-colors"
                              >
                                <Check size={14} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => setEditingSubtaskId(null)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingSubtaskId(sub.SubTaskID);
                                  setEditingSubtaskTitle(sub.Title);
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                title="Edit subtask title"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubtask(sub.SubTaskID)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete subtask"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-slate-400 italic py-6">No subtasks created yet.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
