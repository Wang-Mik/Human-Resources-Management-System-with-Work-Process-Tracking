import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, ArrowLeft, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import InitiateHandoverModal from '../../components/common/InitiateHandoverModal';
import api from '../../services/api';

interface HandoverRecord {
  HandOverID: number;
  FromEmployeeID: number;
  ToEmployeeID: number;
  FromName: string;
  ToName: string;
  Reason: string;
  Status: string;
  CreatedAt: string;
}

interface HandoverItem {
  HandOverItemID: number;
  WorkItemID: number;
  Title: string;
  Description: string;
  Note: string;
}

const MyHandovers: React.FC = () => {
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handovers, setHandovers] = useState<HandoverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'sent' | 'received'>('all');
  
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [handoverItems, setHandoverItems] = useState<HandoverItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) return JSON.parse(userStr);
    } catch (e) { /* ignore */ }
    return null;
  };

  const user = getUser();

  const fetchHandovers = async () => {
    try {
      if (!user) return;
      const data = await api.get(`/handovers?employeeId=${user.EmployeeID}`);
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

  const handleAccept = async (handoverId: number) => {
    try {
      await api.post(`/handovers/${handoverId}/accept`, {});
      setHandovers(prev => prev.map(h => h.HandOverID === handoverId ? { ...h, Status: 'Approved' } : h));
    } catch (err) {
      console.error('Failed to accept handover', err);
    }
  };

  const handleReject = async (handoverId: number) => {
    try {
      await api.post(`/handovers/${handoverId}/reject`, {});
      setHandovers(prev => prev.map(h => h.HandOverID === handoverId ? { ...h, Status: 'Rejected' } : h));
    } catch (err) {
      console.error('Failed to reject handover', err);
    }
  };

  const toggleExpand = async (handoverId: number) => {
    if (expandedRow === handoverId) {
      setExpandedRow(null);
      setHandoverItems([]);
    } else {
      setExpandedRow(handoverId);
      setItemsLoading(true);
      try {
        const data = await api.get(`/handovers/${handoverId}/items`);
        setHandoverItems(data);
      } catch (err) {
        console.error('Failed to fetch items', err);
      } finally {
        setItemsLoading(false);
      }
    }
  };

  // Filter by direction
  const filteredHandovers = handovers.filter(ho => {
    if (activeFilter === 'sent') return ho.FromEmployeeID === user?.EmployeeID;
    if (activeFilter === 'received') return ho.ToEmployeeID === user?.EmployeeID;
    return true;
  });

  const sentCount = handovers.filter(h => h.FromEmployeeID === user?.EmployeeID).length;
  const receivedCount = handovers.filter(h => h.ToEmployeeID === user?.EmployeeID).length;
  const pendingReceivedCount = handovers.filter(h => 
    h.ToEmployeeID === user?.EmployeeID && 
    (h.Status === 'Initiated' || h.Status === 'Pending' || h.Status === 'Submitted')
  ).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-900 text-3xl font-bold font-['Inter'] leading-tight">My Handovers</h1>
            <p className="text-slate-600 text-base font-normal font-['Inter'] leading-6">Manage and track your shift transitions.</p>
          </div>
          <button 
            onClick={() => setIsHandoverModalOpen(true)}
            className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 transition-colors rounded-lg flex justify-center items-center gap-2 shadow-sm"
          >
            <Plus size={16} className="text-white" />
            <span className="text-white text-sm font-medium font-['Inter'] leading-5 tracking-tight">Initiate Handover</span>
          </button>
        </div>

        {/* Pending Incoming Alert */}
        {pendingReceivedCount > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-amber-800 text-sm font-semibold">
              You have {pendingReceivedCount} pending handover{pendingReceivedCount > 1 ? 's' : ''} waiting for your acceptance.
            </span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-fit">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeFilter === 'all' ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            All ({handovers.length})
          </button>
          <button 
            onClick={() => setActiveFilter('sent')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeFilter === 'sent' ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ArrowRight size={14} /> Sent ({sentCount})
          </button>
          <button 
            onClick={() => setActiveFilter('received')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${activeFilter === 'received' ? 'bg-sky-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ArrowLeft size={14} /> Received ({receivedCount})
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3.5 text-slate-600 text-xs font-semibold uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3.5 text-slate-600 text-xs font-semibold uppercase tracking-wide">Direction</th>
                  <th className="px-6 py-3.5 text-slate-600 text-xs font-semibold uppercase tracking-wide">With</th>
                  <th className="px-6 py-3.5 text-slate-600 text-xs font-semibold uppercase tracking-wide">Reason</th>
                  <th className="px-6 py-3.5 text-slate-600 text-xs font-semibold uppercase tracking-wide">Time</th>
                  <th className="px-6 py-3.5 text-slate-600 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3.5 text-slate-600 text-xs font-semibold uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <Loader2 className="animate-spin text-sky-600 mx-auto" size={24} />
                    </td>
                  </tr>
                ) : filteredHandovers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">No handovers found.</td>
                  </tr>
                ) : (
                  filteredHandovers.map(ho => {
                    const isSent = ho.FromEmployeeID === user?.EmployeeID;
                    const isReceived = ho.ToEmployeeID === user?.EmployeeID;
                    const isPendingForMe = isReceived && (ho.Status === 'Initiated' || ho.Status === 'Pending' || ho.Status === 'Submitted');

                    return (
                      <React.Fragment key={ho.HandOverID}>
                      <tr className={`hover:bg-slate-50 transition-colors ${isPendingForMe ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleExpand(ho.HandOverID)}
                            className="flex items-center gap-2 text-sky-700 text-sm font-semibold hover:underline focus:outline-none"
                          >
                            {expandedRow === ho.HandOverID ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            #HO-{ho.HandOverID}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {isSent ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
                              <ArrowRight size={12} /> Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-md border border-purple-200">
                              <ArrowLeft size={12} /> Received
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                              {isSent ? ho.ToName.charAt(0) : ho.FromName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-zinc-900 text-sm font-medium">{isSent ? ho.ToName : ho.FromName}</span>
                              <span className="text-xs text-slate-500">{isSent ? 'Receiver' : 'Sender'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-zinc-900 text-sm truncate max-w-[200px] block">{ho.Reason}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 text-sm">{new Date(ho.CreatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-md border inline-block ${
                            ho.Status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            ho.Status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {ho.Status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPendingForMe && (
                            <div className="flex items-center gap-2 justify-end">
                              <button 
                                onClick={() => handleAccept(ho.HandOverID)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                              >
                                <CheckCircle2 size={14} /> Accept
                              </button>
                              <button 
                                onClick={() => handleReject(ho.HandOverID)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-sm transition-colors"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          )}
                          {isSent && (ho.Status === 'Initiated' || ho.Status === 'Pending' || ho.Status === 'Submitted') && (
                            <span className="text-xs text-slate-500 font-medium">Waiting for response</span>
                          )}
                          {ho.Status === 'Approved' && (
                            <span className="text-xs text-green-600 font-medium">✓ Completed</span>
                          )}
                          {ho.Status === 'Rejected' && isSent && (
                            <span className="text-xs text-rose-600 font-medium">Declined</span>
                          )}
                        </td>
                      </tr>
                      {expandedRow === ho.HandOverID && (
                        <tr>
                          <td colSpan={7} className="bg-slate-50/80 p-0 border-b border-slate-200">
                            <div className="px-6 py-4 animate-fade-in">
                              <h4 className="text-sm font-bold text-slate-800 mb-3">Transferred Tasks</h4>
                              {itemsLoading ? (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Loader2 className="animate-spin" size={16} /> Loading tasks...
                                </div>
                              ) : handoverItems.length === 0 ? (
                                <p className="text-sm text-slate-500">No tasks found for this handover.</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {handoverItems.map(item => (
                                    <div key={item.HandOverItemID} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-sky-700">T-{item.WorkItemID}</span>
                                        <span className="text-sm font-semibold text-slate-900">{item.Title}</span>
                                      </div>
                                      <span className="text-xs text-slate-600 line-clamp-2">{item.Description}</span>
                                      {item.Note && (
                                        <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-700">
                                          <span className="font-semibold text-slate-500 block mb-0.5">Clinical Note:</span>
                                          {item.Note}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Showing {filteredHandovers.length} of {handovers.length} handovers</span>
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
