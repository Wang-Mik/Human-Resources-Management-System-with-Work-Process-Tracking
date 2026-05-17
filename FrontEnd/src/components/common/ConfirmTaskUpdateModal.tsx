import React from 'react';
import { X, ChevronDown, CheckCircle2 } from 'lucide-react';

export interface ConfirmTaskUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: { id: string; name: string; status: string } | null;
}

const ConfirmTaskUpdateModal: React.FC<ConfirmTaskUpdateModalProps> = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-zinc-900 text-xl font-bold font-['Inter']">Confirm Task Update</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Task Info Box */}
          <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 flex flex-col gap-1.5 shadow-sm">
            <h3 className="text-sky-800 text-base font-bold font-['Inter']">
              Task: {task.id} {task.name}
            </h3>
            <p className="text-slate-600 text-sm font-medium font-['Inter']">
              Current Status: <span className="text-zinc-900 font-bold">{task.status}</span>
            </p>
          </div>

          {/* New Status Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-zinc-900 text-sm font-bold font-['Inter']">New Status</label>
            <div className="relative">
              <select className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 hover:border-sky-300 rounded-xl appearance-none outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-zinc-900 text-base font-semibold font-['Inter'] transition-all shadow-sm cursor-pointer">
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-zinc-900 text-sm font-bold font-['Inter']">
              Clinical Notes / Updates <span className="text-slate-500 font-medium">(Optional)</span>
            </label>
            <textarea 
              className="w-full min-h-[120px] p-4 bg-white border border-slate-200 hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl outline-none resize-y text-zinc-900 text-base font-medium font-['Inter'] placeholder-slate-400 transition-all shadow-sm"
              placeholder="Enter any relevant clinical observations..."
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
          <button className="px-6 py-2.5 bg-sky-700 text-white font-bold font-['Inter'] rounded-xl hover:bg-sky-800 transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]">
            <CheckCircle2 size={16} />
            <span>Confirm</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmTaskUpdateModal;
