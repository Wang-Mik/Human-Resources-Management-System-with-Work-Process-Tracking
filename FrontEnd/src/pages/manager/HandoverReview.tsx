import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import api from '../../services/api';

interface HandoverRecord {
  HandOverID: number;
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

const HandoverReview: React.FC = () => {
  const [handovers, setHandovers] = useState<HandoverRecord[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [handoverItems, setHandoverItems] = useState<HandoverItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHandovers = async () => {
      try {
        const data = await api.get('/handovers');
        setHandovers(data);
        if (data.length > 0) {
          setActiveTab(data[0].HandOverID);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHandovers();
  }, []);

  useEffect(() => {
    if (activeTab !== null) {
      api.get(`/handovers/${activeTab}/items`)
        .then(data => setHandoverItems(data))
        .catch(err => console.error(err));
    }
  }, [activeTab]);

  const activeHandover = handovers.find(h => h.HandOverID === activeTab);

  const updateStatus = async (status: string) => {
    if (!activeTab) return;
    try {
      await api.put(`/handovers/${activeTab}/review`, { status });
      setHandovers(handovers.map(h => h.HandOverID === activeTab ? { ...h, Status: status } : h));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-variant overflow-hidden p-4 md:p-8 lg:p-10">
      <div className="max-w-[1280px] mx-auto w-full flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 md:px-8 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-zinc-900 text-2xl font-bold tracking-tight">Handover Review</h1>
          <p className="text-gray-600 text-sm mt-1">Review and approve operational task transfers.</p>
        </div>
        <div className="relative">
          <select className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm font-medium cursor-pointer">
            <option>Status: Pending Review</option>
            <option>Status: Approved</option>
            <option>Status: All</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Left Side: List */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto flex flex-col">
          {loading ? (
             <div className="p-5 text-slate-500 text-sm">Loading handovers...</div>
          ) : handovers.length === 0 ? (
             <div className="p-5 text-slate-500 text-sm">No handovers found.</div>
          ) : (
            handovers.map(ho => (
              <button 
                key={ho.HandOverID}
                className={`w-full text-left p-5 flex flex-col gap-2.5 transition-colors focus:outline-none border-r-4 ${activeTab === ho.HandOverID ? 'bg-sky-50 border-sky-700' : 'bg-white border-transparent border-b border-slate-100 hover:bg-slate-50'}`}
                onClick={() => setActiveTab(ho.HandOverID)}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${ho.Status === 'Pending' || ho.Status === 'Initiated' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{ho.Status}</span>
                  <span className="text-xs font-medium text-slate-500">{new Date(ho.CreatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <h3 className="text-slate-900 text-base font-semibold">{ho.Reason}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium truncate max-w-[100px]">From: {ho.FromName}</span>
                  <ArrowRight size={14} className="text-slate-400 shrink-0" />
                  <span className="font-medium truncate max-w-[100px]">To: {ho.ToName}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Side: Details */}
        <div className="flex-1 bg-slate-50/50 overflow-y-auto p-4 md:p-8 lg:p-10">
          {activeHandover ? (
            <div className="max-w-[800px] mx-auto flex flex-col gap-6">
              
              {/* Action Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-semibold text-slate-800">
                  Handover Details <span className="text-slate-400">#HO-{activeHandover.HandOverID}</span>
                </h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateStatus('Rejected')} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                    Request Revision
                  </button>
                  <button onClick={() => updateStatus('Approved')} className="px-5 py-2.5 text-sm font-medium text-white bg-sky-700 rounded-lg shadow-sm hover:bg-sky-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">
                    Approve Handover
                  </button>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reason</span>
                    <span className="text-slate-900 font-medium">{activeHandover.Reason}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Handover Time</span>
                    <span className="text-slate-900 font-medium">{new Date(activeHandover.CreatedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-5 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Personnel Transfer</span>
                  <div className="flex items-center gap-4 md:gap-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    
                    {/* From */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 font-semibold shrink-0">
                        {activeHandover.FromName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 uppercase">{activeHandover.FromName}</span>
                        <span className="text-xs text-slate-500 font-medium mt-0.5">Outgoing Shift</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center text-slate-400 shrink-0">
                      <ArrowRight size={20} />
                    </div>

                    {/* To */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 font-semibold shrink-0">
                        {activeHandover.ToName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{activeHandover.ToName}</span>
                        <span className="text-xs text-slate-500 font-medium mt-0.5">Incoming Shift</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            {/* Transferred Tasks List */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-lg font-semibold text-slate-900">Transferred Tasks ({handoverItems.length})</h3>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                
                {/* Header Row */}
                <div className="hidden sm:grid sm:grid-cols-3 bg-slate-50 border-b border-slate-200 px-6 py-3">
                  <div className="col-span-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Task ID / Description</div>
                  <div className="col-span-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clinical Notes</div>
                </div>

                {handoverItems.map(item => (
                  <div key={item.HandOverItemID} className="flex flex-col sm:grid sm:grid-cols-3 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-1 p-5 sm:p-6 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-sky-700">T-{item.WorkItemID}</span>
                      <span className="text-sm font-medium text-slate-900">{item.Title}</span>
                      <span className="text-xs text-slate-500">{item.Description}</span>
                    </div>
                    <div className="col-span-2 p-5 sm:p-6 pt-0 sm:pt-6">
                      <div className="w-full h-full bg-slate-100 border border-slate-200/60 rounded-lg p-3.5 text-sm text-slate-800 flex items-center">
                        {item.Note || 'No additional notes provided.'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {handoverItems.length === 0 && (
                   <div className="p-6 text-center text-sm text-slate-500">No tasks included in this handover.</div>
                )}

              </div>
            </div>

          </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
               Select a handover to review details.
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
  );
};

export default HandoverReview;
