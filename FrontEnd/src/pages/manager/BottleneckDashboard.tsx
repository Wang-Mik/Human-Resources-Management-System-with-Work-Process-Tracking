import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  AlertCircle, 
  MoreHorizontal, 
  ExternalLink,
  CheckCircle2,
  Search
} from 'lucide-react';

const BottleneckDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden">
      <div className="w-full flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* Header & Filters */}
        <div className="flex flex-col gap-4 p-6 md:p-8 pb-0 shrink-0 bg-white">
          <div>
            <h1 className="text-zinc-900 text-3xl font-semibold tracking-tight">Bottleneck Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Workload analysis and reassignment suggestions.</p>
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white py-2 rounded-lg mt-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select className="appearance-none pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer shadow-sm hover:bg-slate-100 transition-colors">
                    <option>All Departments</option>
                    <option>Emergency</option>
                    <option>ICU</option>
                  </select>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select className="appearance-none pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer shadow-sm hover:bg-slate-100 transition-colors">
                    <option>All Shifts</option>
                    <option>Morning</option>
                    <option>Night</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select className="appearance-none pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer shadow-sm hover:bg-slate-100 transition-colors">
                  <option>Last 7 Days</option>
                  <option>Today</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 md:px-8 border-b border-slate-200 shrink-0 bg-white pt-2">
          <div className="flex items-center gap-8">
            {['Overview', 'Delayed Tasks', 'Staff Workload'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-base font-semibold transition-colors border-b-2 ${activeTab === tab ? 'text-sky-600 border-sky-600' : 'text-slate-600 border-transparent hover:text-slate-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          
          {activeTab === 'Overview' && (
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Top Alerts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50/80 border border-orange-200/60 rounded-lg p-5 flex items-start gap-4 shadow-sm">
              <AlertTriangle className="text-orange-600 mt-0.5 shrink-0" size={24} />
              <div className="flex flex-col">
                <span className="text-orange-800 font-semibold text-base">Warning: Dr. Aris is overloaded</span>
                <span className="text-orange-700 text-sm mt-0.5">(12 active tasks)</span>
              </div>
            </div>
            
            <div className="bg-rose-50/80 border border-rose-200/60 rounded-lg p-5 flex items-start gap-4 shadow-sm">
              <AlertCircle className="text-rose-600 mt-0.5 shrink-0" size={24} />
              <div className="flex flex-col">
                <span className="text-rose-800 font-semibold text-base">Task T-882 is delayed</span>
                <span className="text-rose-700 text-sm mt-0.5">by 4 hours in ICU</span>
              </div>
            </div>
          </div>

          {/* Main Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Workload Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-semibold text-slate-900">Department Workload (Capacity %)</h3>
                <button className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-1">
                  <MoreHorizontal size={16} />
                  View Details
                </button>
              </div>
              
              {/* Chart Placeholder / Implementation */}
              <div className="flex-1 min-h-[350px] flex items-end gap-6 md:gap-12 px-4 pb-8 relative mt-10">
                {/* Y-Axis */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs font-semibold text-slate-400">
                  <span>150%</span>
                  <span>100%</span>
                  <span>50%</span>
                  <span>0%</span>
                </div>

                {/* Bars */}
                <div className="flex-1 flex justify-around items-end ml-10 border-b border-slate-200 pb-1 h-full relative">
                  {/* Grid Lines */}
                  <div className="absolute top-0 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                  <div className="absolute top-[33%] left-0 right-0 border-t border-slate-100 border-dashed"></div>
                  <div className="absolute top-[66%] left-0 right-0 border-t border-slate-100 border-dashed"></div>

                  {[
                    { name: 'ER', value: 75, color: 'bg-slate-400' },
                    { name: 'ICU', value: 95, color: 'bg-slate-600' },
                    { name: 'Surgery', value: 40, color: 'bg-slate-300' },
                    { name: 'Wards', value: 65, color: 'bg-slate-400' },
                    { name: 'Imaging', value: 120, color: 'bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]' },
                  ].map(dept => (
                    <div key={dept.name} className="flex flex-col items-center gap-4 z-10 w-full group relative">
                       {/* Tooltip */}
                       <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded shadow-lg pointer-events-none">
                          {dept.value}%
                       </div>
                       {/* Bar */}
                       <div 
                         className={`w-12 sm:w-16 rounded-t-md transition-all ${dept.color}`} 
                         style={{ height: `${dept.value * 2}px` }}
                       ></div>
                       {/* Label */}
                       <span className={`text-xs font-semibold absolute -bottom-7 ${dept.value > 100 ? 'text-rose-600' : 'text-slate-600'}`}>{dept.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Suggestions */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col gap-6">
              <h3 className="text-xl font-semibold text-slate-900 border-b border-slate-100 pb-4">Reassignment Suggestions</h3>
              
              <div className="flex flex-col gap-5 overflow-y-auto">
                
                {/* Suggestion 1 */}
                <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-5 flex flex-col gap-5 relative shadow-sm">
                   <div className="absolute top-5 right-5 bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded">Delayed</div>
                   
                   <h4 className="font-semibold text-slate-900 text-base pr-20 leading-tight">Emergency Room<br/>Setup</h4>
                   
                   <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col gap-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Current<br/>Assignee</span>
                        <div className="flex items-center gap-2">
                           <AlertTriangle size={16} className="text-rose-600" />
                           <div className="flex flex-col">
                             <span className="text-sm font-semibold text-rose-700 leading-none">Dr. Khoa</span>
                             <span className="text-[11px] text-rose-600 font-medium">(Overloaded)</span>
                           </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-100"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Suggested<br/>Assignee</span>
                        <div className="flex items-center gap-2">
                           <CheckCircle2 size={16} className="text-sky-600" />
                           <div className="flex flex-col">
                             <span className="text-sm font-semibold text-sky-700 leading-none">Dr. Hao</span>
                             <span className="text-[11px] text-sky-600 font-medium">(Available)</span>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-3">
                     <button className="flex-1 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">Reject</button>
                     <button className="flex-[1.5] py-2.5 bg-sky-600 text-white rounded-md font-medium text-sm hover:bg-sky-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">Confirm</button>
                   </div>
                   
                   <button className="w-full flex justify-center items-center gap-2 py-3 mt-1 bg-white border border-slate-300 rounded-md text-sky-600 font-bold text-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm">
                     <ExternalLink size={14} /> View Details
                   </button>
                </div>

                {/* Suggestion 2 */}
                <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-5 flex flex-col gap-5 relative shadow-sm">
                   <div className="absolute top-5 right-5 bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded">Delayed</div>
                   
                   <h4 className="font-semibold text-slate-900 text-base pr-20 leading-tight">ICU Patient<br/>Handover</h4>
                   
                   <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col gap-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Current<br/>Assignee</span>
                        <div className="flex items-center gap-2">
                           <AlertTriangle size={16} className="text-rose-600" />
                           <div className="flex flex-col">
                             <span className="text-sm font-semibold text-rose-700 leading-none">Nurse Trang</span>
                             <span className="text-[11px] text-rose-600 font-medium">(Overloaded)</span>
                           </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-100"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Suggested<br/>Assignee</span>
                        <div className="flex items-center gap-2">
                           <CheckCircle2 size={16} className="text-sky-600" />
                           <div className="flex flex-col">
                             <span className="text-sm font-semibold text-sky-700 leading-none">Nurse Long</span>
                             <span className="text-[11px] text-sky-600 font-medium">(Available)</span>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-3">
                     <button className="flex-1 py-2.5 bg-white border border-slate-300 rounded-md text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">Reject</button>
                     <button className="flex-[1.5] py-2.5 bg-sky-600 text-white rounded-md font-medium text-sm hover:bg-sky-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">Confirm</button>
                   </div>
                   
                   <button className="w-full flex justify-center items-center gap-2 py-3 mt-1 bg-white border border-slate-300 rounded-md text-sky-600 font-bold text-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm">
                     <ExternalLink size={14} /> View Details
                   </button>
                </div>

              </div>
            </div>

          </div>
          </div>
          )}

          {activeTab === 'Delayed Tasks' && (
            <div className="p-6 md:p-8 flex flex-col gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Task ID & Name</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Department</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Current Assignee</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Delay Duration</th>
                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Root Cause / AI Note</th>
                        <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-900 whitespace-nowrap">T-882</span>
                            <span className="text-sm text-slate-600 whitespace-nowrap">Emergency Room Setup</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded">ER</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-900 whitespace-nowrap">Dr. Khoa</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-rose-600 leading-tight block">Overdue by<br/>4h</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">Assignee Overloaded</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">
                            Reassign
                          </button>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-900 whitespace-nowrap">T-885</span>
                            <span className="text-sm text-slate-600 whitespace-nowrap">Ventilator Maintenance Check</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded">ICU</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-900 whitespace-nowrap">Nurse Trang</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-rose-600 leading-tight block">Overdue by<br/>2.5h</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">Equipment Delay</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">
                            Reassign
                          </button>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-900 whitespace-nowrap">T-890</span>
                            <span className="text-sm text-slate-600 whitespace-nowrap">Pre-Op Patient Transfer</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded">Surgery</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-900 whitespace-nowrap">Dr. Hao</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-rose-600 leading-tight block">Overdue by<br/>1.5h</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">Sudden Absence</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">
                            Reassign
                          </button>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-900 whitespace-nowrap">T-892</span>
                            <span className="text-sm text-slate-600 whitespace-nowrap">Lab Results Verification</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded">ER</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-900 whitespace-nowrap">Dr. Chen</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-rose-600 leading-tight block">Overdue by<br/>1h</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">Awaiting External Data</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">
                            Reassign
                          </button>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Staff Workload' && (
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Search Bar */}
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Staff Name" 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                />
              </div>

              {/* Staff Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* Card 1 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-lg shrink-0">
                        DK
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">Dr. Khoa</span>
                        <span className="text-xs text-slate-500 font-medium">Cardiology</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded">Urgent</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600">Capacity</span>
                      <span className="text-rose-600">110% - Overloaded</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full w-full"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-2 pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-900 leading-none">15</span>
                      <span className="text-xs text-slate-500 font-medium mt-1">Active Tasks</span>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-sky-600 text-xs font-bold rounded-lg shadow-sm transition-colors">
                      View Tasks
                    </button>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                        NT
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">Nurse Trang</span>
                        <span className="text-xs text-slate-500 font-medium">ICU</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600">Capacity</span>
                      <span className="text-sky-600">75% - Optimal</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-600 rounded-full w-[75%]"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-2 pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-900 leading-none">8</span>
                      <span className="text-xs text-slate-500 font-medium mt-1">Active Tasks</span>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-sky-600 text-xs font-bold rounded-lg shadow-sm transition-colors">
                      View Tasks
                    </button>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg shrink-0">
                        DC
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">Dr. Ching</span>
                        <span className="text-xs text-slate-500 font-medium">Emergency</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600">Capacity</span>
                      <span className="text-sky-600">20% - Available</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-600 rounded-full w-[20%]"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-2 pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-900 leading-none">2</span>
                      <span className="text-xs text-slate-500 font-medium mt-1">Active Tasks</span>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-sky-600 text-xs font-bold rounded-lg shadow-sm transition-colors">
                      View Tasks
                    </button>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
                        DC
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">Dr. Chong</span>
                        <span className="text-xs text-slate-500 font-medium">Pediatrics</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600">Capacity</span>
                      <span className="text-sky-600">60% - Optimal</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-600 rounded-full w-[60%]"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-2 pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-900 leading-none">6</span>
                      <span className="text-xs text-slate-500 font-medium mt-1">Active Tasks</span>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-sky-600 text-xs font-bold rounded-lg shadow-sm transition-colors">
                      View Tasks
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default BottleneckDashboard;
