import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, ChevronDown, Send } from 'lucide-react';
import api from '../../services/api';

interface InitiateHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InitiateHandoverModal: React.FC<InitiateHandoverModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedToEmployee, setSelectedToEmployee] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/employees').then(data => {
        setEmployees(data);
        if(data.length > 0) setSelectedToEmployee(data[0].EmployeeID.toString());
      });
      api.get('/works').then(data => {
        // filter pending tasks
        setTasks(data.filter((t: any) => t.Status !== 'Completed'));
      });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedToEmployee || selectedTasks.length === 0) return;
    setLoading(true);
    try {
      // Create handover record
      const hoRes = await api.post('/handovers/initiate', {
        fromEmployeeId: 2, // Hardcoded Nurse Minh ID for demo
        toEmployeeId: parseInt(selectedToEmployee),
        reason: reason || 'Shift Transfer'
      });

      // Add items
      for (const taskId of selectedTasks) {
        await api.post(`/handovers/${hoRes.id}/items`, {
          assignmentId: taskId, // Simplified for demo (assumes WorkItemID maps to AssignmentID loosely or backend handles it)
          note: reason
        });
      }
      
      setReason('');
      setSelectedTasks([]);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: number) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded-xl flex items-center justify-center">
              <ArrowRightLeft size={20} />
            </div>
            <h2 className="text-zinc-900 text-xl font-bold font-['Inter']">Initiate Shift Handover</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
          
          {/* Transfer To */}
          <div className="flex flex-col gap-2">
            <label className="text-zinc-900 text-sm font-bold font-['Inter']">Transfer to (Employee):</label>
            <div className="relative">
              <select 
                value={selectedToEmployee}
                onChange={e => setSelectedToEmployee(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 hover:border-sky-300 rounded-xl appearance-none outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-zinc-900 text-base font-semibold font-['Inter'] transition-all shadow-sm cursor-pointer">
                {employees.map(emp => (
                  <option key={emp.EmployeeID} value={emp.EmployeeID}>{emp.Name} ({emp.Role})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-zinc-900 text-sm font-bold font-['Inter']">Select Pending Tasks to Transfer:</label>
              <button 
                onClick={() => setSelectedTasks(tasks.map(t => t.WorkItemID))}
                className="text-sky-700 text-sm font-bold font-['Inter'] hover:underline"
              >Select All</button>
            </div>
            
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2 flex flex-col gap-1 shadow-sm max-h-48 overflow-y-auto">
              {tasks.length === 0 && <span className="p-2 text-sm text-slate-500">No pending tasks to transfer.</span>}
              {tasks.map(task => (
                <label key={task.WorkItemID} className="flex items-start gap-3 p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      checked={selectedTasks.includes(task.WorkItemID)}
                      onChange={() => toggleTask(task.WorkItemID)}
                      className="w-5 h-5 rounded text-sky-700 focus:ring-sky-500 focus:ring-offset-0 border-slate-300 bg-white" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-900 text-base font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">T-{task.WorkItemID}: {task.Title}</span>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="text-sm font-medium font-['Inter'] truncate">{task.Description}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Risk / Clinical Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-zinc-900 text-sm font-bold font-['Inter']">Risk / Clinical Notes</label>
            <textarea 
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full min-h-[120px] p-4 bg-white border border-slate-200 hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl outline-none resize-y text-zinc-900 text-base font-medium font-['Inter'] placeholder-slate-400 transition-all shadow-sm"
              placeholder="Enter any critical dependencies or patient monitoring notes for the next shift..."
            ></textarea>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-200/60 flex justify-end items-center gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold font-['Inter'] rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || selectedTasks.length === 0}
            className={`px-6 py-2.5 bg-sky-700 text-white font-bold font-['Inter'] rounded-xl hover:bg-sky-800 transition-all flex items-center gap-2 shadow-sm active:scale-[0.98] group ${loading || selectedTasks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span>{loading ? 'Submitting...' : 'Submit Handover'}</span>
            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default InitiateHandoverModal;
