import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import api from '../../services/api';

interface Employee {
  EmployeeID: number;
  Name: string;
  Email: string;
  Role: string;
}

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [hours, setHours] = useState('1.5');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch employees
      api.get('/employees').then(data => {
        setEmployees(data);
        if (data.length > 0) setSelectedEmployeeId(data[0].EmployeeID.toString());
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!title || !selectedEmployeeId) return;
    setLoading(true);
    try {
      // 1. Create Work Item
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + parseFloat(hours));
      
      const workRes = await api.post('/works', {
        title,
        description,
        workType: 'Clinical',
        status: 'Pending',
        dueDate: dueDate.toISOString()
      });

      // 2. Assign to Employee
      const userStr = localStorage.getItem('user');
      const managerId = userStr ? JSON.parse(userStr).EmployeeID : 1;
      await api.post(`/works/${workRes.id}/assign`, {
        employeeId: parseInt(selectedEmployeeId),
        assignedBy: managerId,
        roleInWork: 'Primary'
      });

      // Reset & close
      setTitle('');
      setDescription('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Assign Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Patient Vitals Check"
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Select Employee</label>
            <div className="relative">
              <select 
                value={selectedEmployeeId} 
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full appearance-none px-4 py-2 pl-10 bg-white border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
                {employees.map(emp => (
                  <option key={emp.EmployeeID} value={emp.EmployeeID}>{emp.Name} ({emp.Role})</option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-green-500 pointer-events-none"></div>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Estimated Hours</label>
            <input
              type="number"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-5 py-2 text-sm font-medium text-white bg-sky-700 rounded-md shadow-sm hover:bg-sky-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>

      </div>
    </div>
  );
};
