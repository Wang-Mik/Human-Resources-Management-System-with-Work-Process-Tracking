import React, { useState } from 'react';
import { X, FileText, Clock, Calendar, ChevronDown } from 'lucide-react';
import api from '../../services/api';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Format a Date to the local datetime-local input value (YYYY-MM-DDTHH:mm)
const toLocalDatetimeValue = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const WORK_TYPES = ['Clinical', 'Administrative', 'Maintenance', 'Emergency', 'Training', 'Other'];

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [document, setDocument]     = useState('');
  const [workType, setWorkType]     = useState('Clinical');
  const [dueMode, setDueMode]       = useState<'pick' | 'remaining'>('pick');
  
  // Choose date states
  const [dueDatetime, setDueDatetime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return toLocalDatetimeValue(d);
  });

  // Remaining time states
  const [remainingHours, setRemainingHours]     = useState('2');
  const [remainingMinutes, setRemainingMinutes] = useState('0');

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSave = async () => {
    setError('');
    if (!title.trim()) { setError('Task title is required.'); return; }
    
    let dueDate: Date;
    if (dueMode === 'remaining') {
      const h = parseInt(remainingHours) || 0;
      const m = parseInt(remainingMinutes) || 0;
      if (h <= 0 && m <= 0) {
        setError('Please enter a valid remaining time.');
        return;
      }
      dueDate = new Date(new Date().getTime() + (h * 60 + m) * 60 * 1000);
    } else {
      if (!dueDatetime) {
        setError('Please choose a due date/time.');
        return;
      }
      dueDate = new Date(dueDatetime);
    }

    setLoading(true);
    try {
      await api.post('/works', {
        title:       title.trim(),
        description: description.trim(),
        document:    document.trim() || null,
        workType,
        status:  'Pending',
        dueDate: dueDate.toISOString(),
      });

      // Reset
      setTitle('');
      setDescription('');
      setDocument('');
      setWorkType('Clinical');
      setDueMode('pick');
      setRemainingHours('2');
      setRemainingMinutes('0');
      const d = new Date(); d.setHours(d.getHours() + 2);
      setDueDatetime(toLocalDatetimeValue(d));

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create work item.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] flex flex-col overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Create New Work Item</h2>
          <button onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[72vh] custom-scrollbar">

          {error && (
            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5 font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Task Title <span className="text-rose-500">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Patient Vitals Check"
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors" />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Task details and context..."
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors resize-none" />
          </div>

          {/* Document */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText size={15} className="text-slate-500" /> Document / Resource Link
            </label>
            <textarea rows={2} value={document} onChange={e => setDocument(e.target.value)}
              placeholder="URLs, clinical guidelines, or reference notes..."
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors resize-none" />
          </div>

          {/* Work Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Work Type</label>
            <div className="relative">
              <select value={workType} onChange={e => setWorkType(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Due Date / Time Selector */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-semibold text-slate-700">Due Date &amp; Time <span className="text-rose-500">*</span></label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDueMode('pick')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  dueMode === 'pick'
                    ? 'bg-sky-700 border-sky-700 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar size={15} /> Choose Date &amp; Time
              </button>
              <button
                type="button"
                onClick={() => setDueMode('remaining')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  dueMode === 'remaining'
                    ? 'bg-sky-700 border-sky-700 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Clock size={15} /> Remaining Time
              </button>
            </div>

            {dueMode === 'pick' ? (
              <input
                type="datetime-local"
                value={dueDatetime}
                onChange={e => setDueDatetime(e.target.value)}
                min={toLocalDatetimeValue(new Date())}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
              />
            ) : (
              <div className="flex gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Hours</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={remainingHours}
                    onChange={e => setRemainingHours(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={remainingMinutes}
                    onChange={e => setRemainingMinutes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className={`px-5 py-2 text-sm font-semibold text-white bg-sky-700 rounded-lg shadow-sm hover:bg-sky-800 transition-colors ${loading ? 'opacity-70' : ''}`}>
            {loading ? 'Creating…' : 'Create Work Item'}
          </button>
        </div>
      </div>
    </div>
  );
};
