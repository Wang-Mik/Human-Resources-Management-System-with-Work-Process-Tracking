import React, { useState } from 'react';
import { Plus, ChevronDown, MoreVertical } from 'lucide-react';
import { AssignTaskModal } from '../../components/common/AssignTaskModal';

interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

const tasks: Task[] = [
  { id: 'T-882', title: 'Prepare ICU Bed 4', assignee: 'Dr. Sang', dueDate: 'Today, 2:00 PM', status: 'Pending' },
  { id: 'T-883', title: 'Update Patient Records', assignee: 'Dr. Stone', dueDate: 'Today, 4:30 PM', status: 'In Progress' },
  { id: 'T-884', title: 'Inventory Check - Ward A', assignee: 'Dr. Jett', dueDate: 'Tomorrow, 9:00 AM', status: 'Pending' },
  { id: 'T-885', title: 'Patient Discharge - Room 302', assignee: 'Dr. Hai', dueDate: 'Completed', status: 'Completed' },
  { id: 'T-886', title: 'Emergency Room Setup', assignee: 'Dr. Hao', dueDate: 'Today, 11:00 AM', status: 'In Progress' },
];

const getStatusBadge = (status: Task['status']) => {
  switch (status) {
    case 'Pending':
      return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200">Pending</span>;
    case 'In Progress':
      return <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-md border border-sky-200">In Progress</span>;
    case 'Completed':
      return <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-200">Completed</span>;
    default:
      return null;
  }
};

const WorkManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-900 text-3xl font-bold tracking-tight">Work Management</h1>
            <p className="text-gray-600 text-sm">Manage and assign hospital operational tasks.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg shadow-sm transition-colors text-sm font-bold"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create New Work Item
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-wrap lg:flex-nowrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-slate-700 text-xs font-bold">Department</label>
            <div className="relative">
              <select className="w-full appearance-none px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                <option>All Departments</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
            <label className="text-slate-700 text-xs font-bold">Status</label>
            <div className="relative">
              <select className="w-full appearance-none px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                <option>All Statuses</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
            <label className="text-slate-700 text-xs font-bold">Assignee</label>
            <div className="relative">
              <select className="w-full appearance-none px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                <option>Any Assignee</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-slate-700 text-xs font-bold">Due Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Task ID</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Task Title</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Assigned To</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Due Date</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap">Status</th>
                  <th className="px-6 py-3.5 text-slate-600 text-sm font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className={`hover:bg-slate-50 transition-colors ${task.status === 'Completed' ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">{task.id}</td>
                    <td className={`px-6 py-4 text-sm text-slate-800 ${task.status === 'Completed' ? 'line-through text-slate-500' : 'font-medium'}`}>{task.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{task.assignee}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{task.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(task.status)}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button className="inline-flex justify-center items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <AssignTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default WorkManagement;
