import React from 'react';
import { X, ArrowRightLeft, ChevronDown, Send, MapPin, BedDouble } from 'lucide-react';

interface InitiateHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InitiateHandoverModal: React.FC<InitiateHandoverModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-slide-up">
        
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
              <select className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 hover:border-sky-300 rounded-xl appearance-none outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-zinc-900 text-base font-semibold font-['Inter'] transition-all shadow-sm cursor-pointer">
                <option>Dr. Quang Minh (Available)</option>
                <option>Nurse Sarah (Available)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-zinc-900 text-sm font-bold font-['Inter']">Select Pending Tasks to Transfer:</label>
              <button className="text-sky-700 text-sm font-bold font-['Inter'] hover:underline">Select All</button>
            </div>
            
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2 flex flex-col gap-1 shadow-sm">
              {/* Task 1 */}
              <label className="flex items-start gap-3 p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" className="w-5 h-5 rounded text-sky-700 focus:ring-sky-500 focus:ring-offset-0 border-slate-300 bg-white" defaultChecked />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-900 text-base font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">T-882: Patient Vitals Check</span>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={14} />
                    <span className="text-sm font-medium font-['Inter']">Room 204</span>
                  </div>
                </div>
              </label>

              <div className="h-px bg-slate-200/60 mx-3"></div>

              {/* Task 2 */}
              <label className="flex items-start gap-3 p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                <div className="pt-0.5">
                  <input type="checkbox" className="w-5 h-5 rounded text-sky-700 focus:ring-sky-500 focus:ring-offset-0 border-slate-300 bg-white" defaultChecked />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-900 text-base font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">T-895: Medication Admin</span>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <BedDouble size={14} />
                    <span className="text-sm font-medium font-['Inter']">ICU - Bed 04</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Risk / Clinical Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-zinc-900 text-sm font-bold font-['Inter']">Risk / Clinical Notes</label>
            <textarea 
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
          <button className="px-6 py-2.5 bg-sky-700 text-white font-bold font-['Inter'] rounded-xl hover:bg-sky-800 transition-all flex items-center gap-2 shadow-sm active:scale-[0.98] group">
            <span>Submit Handover</span>
            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default InitiateHandoverModal;
