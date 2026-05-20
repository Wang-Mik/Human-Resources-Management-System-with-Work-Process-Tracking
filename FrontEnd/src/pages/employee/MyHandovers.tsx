import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import InitiateHandoverModal from '../../components/common/InitiateHandoverModal';
import api from '../../services/api';

interface HandoverRecord {
  HandOverID: number;
  FromName: string;
  ToName: string;
  Reason: string;
  Status: string;
  CreatedAt: string;
}

const MyHandovers: React.FC = () => {
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handovers, setHandovers] = useState<HandoverRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHandovers = async () => {
    try {
      const data = await api.get('/handovers');
      setHandovers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-900 text-3xl font-bold font-['Inter'] leading-tight">My Handovers</h1>
            <p className="text-slate-600 text-base font-normal font-['Inter'] leading-6">Manage and track shift transitions.</p>
          </div>
          <button 
            onClick={() => setIsHandoverModalOpen(true)}
            className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 transition-colors rounded-sm flex justify-center items-center gap-2 shadow-sm"
          >
            <Plus size={16} className="text-white" />
            <span className="text-white text-sm font-medium font-['Inter'] leading-5 tracking-tight">Initiate Handover</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm outline outline-1 outline-slate-300/20 flex flex-col overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="px-6 py-4 bg-slate-100 border-b border-slate-300/20 flex justify-between items-center">
            <h2 className="text-zinc-900 text-lg font-semibold font-['Inter'] leading-7">Handover History</h2>
            <button className="flex justify-center items-center p-2 hover:bg-slate-200 rounded-md transition-colors" title="Filter">
              <SlidersHorizontal size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-slate-300/20">
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Handover<br/>ID</th>
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Shift</th>
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Target<br/>Employee</th>
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Submitted<br/>Time</th>
                  <th className="px-6 py-4 text-slate-600 text-xs font-medium font-['Inter'] uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300/20">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Loading handovers...</td>
                  </tr>
                ) : handovers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">No handovers found.</td>
                  </tr>
                ) : (
                  handovers.map(ho => (
                    <tr key={ho.HandOverID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sky-700 text-sm font-medium font-['Inter'] cursor-pointer hover:underline">#HO-{ho.HandOverID}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-900 text-sm font-normal font-['Inter'] truncate max-w-[150px]">{ho.Reason}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs shrink-0">{ho.ToName.charAt(0)}</div>
                          <span className="text-zinc-900 text-sm font-normal font-['Inter']">{ho.ToName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 text-sm font-normal font-['Inter']">{new Date(ho.CreatedAt).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium font-['Inter'] rounded-xl outline outline-1 inline-block text-center whitespace-nowrap ${
                          ho.Status === 'Pending' || ho.Status === 'Initiated' ? 'bg-amber-100 text-amber-800 outline-amber-200' :
                          ho.Status === 'Approved' ? 'bg-green-100 text-green-800 outline-green-200' :
                          'bg-slate-100 text-slate-800 outline-slate-200'
                        }`}>
                          {ho.Status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-white border-t border-slate-300/20 flex justify-between items-center">
            <span className="text-slate-600 text-sm font-normal font-['Inter'] hidden sm:block">Showing 1 to 4 of 24 entries</span>
            
            <div className="flex items-center gap-1 ml-auto sm:ml-0">
              <button className="px-3 py-1 bg-white text-slate-400 border border-slate-300/50 rounded-sm hover:bg-slate-50 disabled:opacity-50 text-sm font-normal" disabled>Prev</button>
              <button className="px-3 py-1 bg-sky-700 text-white rounded-sm text-sm font-normal">1</button>
              <button className="px-3 py-1 bg-white text-slate-600 border border-slate-300/50 rounded-sm hover:bg-slate-50 text-sm font-normal">2</button>
              <button className="px-3 py-1 bg-white text-slate-600 border border-slate-300/50 rounded-sm hover:bg-slate-50 text-sm font-normal">Next</button>
            </div>
          </div>

        </div>
      </div>

      <InitiateHandoverModal 
        isOpen={isHandoverModalOpen} 
        onClose={() => setIsHandoverModalOpen(false)} 
        onSuccess={() => fetchHandovers()}
      />
    </div>
  );
};

export default MyHandovers;
