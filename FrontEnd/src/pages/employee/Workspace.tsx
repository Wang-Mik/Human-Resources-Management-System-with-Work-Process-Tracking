import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle2, AlertCircle, Hourglass, ArrowRightLeft, MapPin, LogIn, LogOut, Loader2, Lock } from 'lucide-react';
import InitiateHandoverModal from '../../components/common/InitiateHandoverModal';
import api from '../../services/api';

interface Employee {
  EmployeeID: number;
  Name: string;
  Email: string;
  Role: string;
}

interface WorkItem {
  WorkItemID: number;
  Title: string;
  Description: string;
  WorkType: string;
  Status: string;
  DueDate: string;
  AssigneeName?: string;
}

interface Attendance {
  AttendanceID: number;
  CheckInTime: string | null;
  CheckOutTime: string | null;
}

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

const calcElapsed = (checkIn: string) => {
  const diff = Math.floor((Date.now() - new Date(checkIn).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return `${h}h ${m}m`;
};

const AVAILABILITY_OPTIONS = [
  { label: 'Available', value: 'Available', dot: 'bg-green-500', glow: 'shadow-[0_0_8px_rgba(34,197,94,0.5)]' },
  { label: 'Busy', value: 'Busy', dot: 'bg-amber-500', glow: '' },
  { label: 'Emergency', value: 'Emergency', dot: 'bg-red-500', glow: '' },
];

const Workspace: React.FC = () => {
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('Available');
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState<number | null>(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [elapsed, setElapsed] = useState('');

  const fetchAttendance = useCallback(async (emp: Employee) => {
    try {
      const data = await api.get(`/availability/attendance/today/${emp.EmployeeID}`);
      setAttendance(data);
    } catch {
      setAttendance(null);
    }
  }, []);

  const fetchTasks = useCallback(async (emp: Employee) => {
    try {
      const data: WorkItem[] = await api.get('/works');
      setTasks(data.filter(t => t.AssigneeName === emp.Name));
    } catch {
      setTasks([]);
    }
  }, []);

  const fetchAvailability = useCallback(async (emp: Employee) => {
    try {
      const data: { EmployeeID: number; CurrentStatus: string }[] = await api.get('/availability');
      const mine = data.find(e => e.EmployeeID === emp.EmployeeID);
      if (mine) setAvailabilityStatus(mine.CurrentStatus);
    } catch { /* keep default */ }
  }, []);

  useEffect(() => {
    const init = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) { setLoading(false); return; }
      const emp: Employee = JSON.parse(userStr);
      setEmployee(emp);
      await Promise.all([fetchAttendance(emp), fetchTasks(emp), fetchAvailability(emp)]);
      setLoading(false);
    };
    init();
  }, [fetchAttendance, fetchTasks, fetchAvailability]);

  // Live elapsed timer while clocked in
  useEffect(() => {
    if (!attendance?.CheckInTime || attendance.CheckOutTime) return;
    setElapsed(calcElapsed(attendance.CheckInTime));
    const id = setInterval(() => setElapsed(calcElapsed(attendance.CheckInTime!)), 60000);
    return () => clearInterval(id);
  }, [attendance]);

  const handleClockIn = async () => {
    if (!employee) return;
    setClockLoading(true);
    try {
      await api.post('/availability/attendance', { employeeId: employee.EmployeeID, type: 'CheckIn' });
    } catch (err: any) {
      if (!err.message?.includes('Already clocked in')) console.error('Clock-in failed:', err);
    } finally {
      await fetchAttendance(employee);
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!employee) return;
    setClockLoading(true);
    try {
      await api.post('/availability/attendance', { employeeId: employee.EmployeeID, type: 'CheckOut' });
    } catch (err) {
      console.error('Clock-out failed:', err);
    } finally {
      await fetchAttendance(employee);
      setClockLoading(false);
    }
  };

  const handleAvailabilityChange = async (status: string) => {
    if (!employee || !isClockedIn || availLoading) return;
    setAvailLoading(true);
    try {
      await api.post('/availability/status', { employeeId: employee.EmployeeID, status });
      setAvailabilityStatus(status);
    } catch (err) {
      console.error('Availability update failed:', err);
    } finally {
      setAvailLoading(false);
    }
  };

  const handleTaskAction = async (task: WorkItem, newStatus: string) => {
    if (!employee || !isClockedIn) return;
    setTaskLoading(task.WorkItemID);
    try {
      await api.put(`/works/${task.WorkItemID}/progress`, {
        status: newStatus,
        employeeId: employee.EmployeeID,
        contextNote: `Status changed to ${newStatus} from Workspace`,
      });
      await fetchTasks(employee);
    } catch (err) {
      console.error('Task update failed:', err);
    } finally {
      setTaskLoading(null);
    }
  };

  const isClockedIn = !!attendance?.CheckInTime && !attendance?.CheckOutTime;
  const todayTasks = tasks.filter(t => t.Status !== 'Completed');

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="w-full h-full flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-1 mb-2 animate-fade-in">
          <h1 className="text-zinc-900 text-3xl font-bold font-['Inter'] tracking-tight">
            Good Morning, {employee ? employee.Name : 'Loading...'}
          </h1>
          <p className="text-slate-600 text-base font-normal font-['Inter']">
            Here's what's happening on your shift today.
          </p>
        </div>

        {/* Clock-in required banner */}
        {!loading && !isClockedIn && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold font-['Inter']">
            <Lock size={16} className="shrink-0" />
            Clock in first to interact with tasks and handovers.
          </div>
        )}

        {/* Shift & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

          {/* Shift Status Card */}
          <div className="p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-between items-start group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="w-full flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="text-sky-700" size={20} />
                </div>
                <h2 className="text-zinc-900 text-xl font-semibold font-['Inter']">Shift Status</h2>
              </div>
              <div className={`px-3 py-1.5 rounded-full shadow-sm ${isClockedIn ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-amber-100'}`}>
                <span className={`text-xs font-bold font-['Inter'] tracking-wide uppercase ${isClockedIn ? 'text-white' : 'text-amber-700'}`}>
                  {isClockedIn ? 'Active' : 'Clocked Out'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-6 w-full">
              {attendance?.CheckInTime ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-zinc-900 text-6xl font-black font-['Inter'] tracking-tight">
                      {formatTime(new Date(attendance.CheckInTime))}
                    </span>
                  </div>
                  {isClockedIn ? (
                    <p className="text-slate-600 text-sm font-medium font-['Inter'] flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      Session started. Elapsed: {elapsed}
                    </p>
                  ) : (
                    attendance.CheckOutTime && (
                      <p className="text-slate-500 text-sm font-medium font-['Inter']">
                        Last clocked out at {formatTime(new Date(attendance.CheckOutTime))} — clock in again to resume.
                      </p>
                    )
                  )}
                </>
              ) : (
                <p className="text-slate-500 text-base font-medium font-['Inter']">You haven't clocked in yet today.</p>
              )}
            </div>

            {isClockedIn ? (
              <button
                onClick={handleClockOut}
                disabled={clockLoading}
                className="px-8 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-700 font-medium font-['Inter'] transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm flex items-center gap-2 disabled:opacity-60"
              >
                {clockLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                Clock Out
              </button>
            ) : (
              <button
                onClick={handleClockIn}
                disabled={clockLoading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-semibold font-['Inter'] transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                {clockLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                Clock In
              </button>
            )}
          </div>

          {/* Availability Card */}
          <div className="p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="flex items-center justify-between mb-auto">
              <h2 className="text-zinc-900 text-xl font-semibold font-['Inter']">Current Availability</h2>
              {!isClockedIn && <span className="text-xs text-slate-400 font-medium font-['Inter']">Clock in to change</span>}
            </div>
            <div className="mt-8 pt-4 w-full">
              <div className="p-1.5 bg-slate-100/80 rounded-xl flex justify-center items-center gap-1.5 w-full">
                {AVAILABILITY_OPTIONS.map(opt => {
                  const isActive = availabilityStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAvailabilityChange(opt.value)}
                      disabled={!isClockedIn || availLoading}
                      className={`flex-1 py-3 rounded-lg flex justify-center items-center gap-2 transition-all disabled:cursor-not-allowed
                        ${isActive ? 'bg-white shadow-sm border border-slate-200/50' : 'hover:bg-white/60'}
                        ${!isClockedIn ? 'opacity-50' : ''}`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${opt.dot} ${isActive ? opt.glow : ''}`}></div>
                      <span className={`text-sm font-['Inter'] ${isActive ? 'text-zinc-900 font-bold' : 'text-slate-600 font-medium'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">

          {/* My Tasks for Today */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="pb-3 border-b border-slate-200 flex justify-between items-end">
              <h2 className="text-zinc-900 text-2xl font-bold font-['Inter']">My Tasks for Today</h2>
              <span className="text-slate-500 text-sm font-semibold font-['Inter']">
                {todayTasks.length} active task{todayTasks.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
              {loading ? (
                <div className="col-span-2 flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-sky-600" size={28} />
                </div>
              ) : todayTasks.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-400 font-medium font-['Inter']">
                  No active tasks assigned for today.
                </div>
              ) : (
                todayTasks.map(task => (
                  <div key={task.WorkItemID} className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex justify-between items-center">
                      <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${task.Status === 'In Progress' ? 'bg-blue-50 text-sky-700' : 'bg-slate-100 text-slate-700'}`}>
                        {task.Status === 'In Progress'
                          ? <CheckCircle2 size={14} className="text-sky-600" />
                          : <Hourglass size={14} className="text-slate-600" />}
                        <span className="text-xs font-bold font-['Inter']">{task.Status}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${task.Status === 'In Progress' ? 'bg-red-50 text-red-700' : 'text-slate-500'}`}>
                        {task.Status === 'In Progress'
                          ? <AlertCircle size={14} className="text-red-600" />
                          : <Clock size={14} />}
                        <span className="text-xs font-bold font-['Inter']">
                          Due: {new Date(task.DueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-zinc-900 text-lg font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">
                        T-{task.WorkItemID}: {task.Title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={16} />
                        <span className="text-sm font-medium font-['Inter']">{task.Description}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-auto relative">
                      {task.Status === 'In Progress' ? (
                        <button
                          onClick={() => handleTaskAction(task, 'Completed')}
                          disabled={!isClockedIn || taskLoading === task.WorkItemID}
                          title={!isClockedIn ? 'Clock in to update tasks' : undefined}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transition-all text-white rounded-xl text-sm font-semibold font-['Inter'] shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {taskLoading === task.WorkItemID
                            ? <Loader2 size={16} className="animate-spin" />
                            : !isClockedIn ? <Lock size={16} /> : <CheckCircle2 size={16} />}
                          Mark as Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTaskAction(task, 'In Progress')}
                          disabled={!isClockedIn || taskLoading === task.WorkItemID}
                          title={!isClockedIn ? 'Clock in to start tasks' : undefined}
                          className="w-full py-2.5 bg-white border-2 border-sky-600 text-sky-700 hover:bg-sky-50 transition-all rounded-xl text-sm font-semibold font-['Inter'] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                        >
                          {taskLoading === task.WorkItemID
                            ? <Loader2 size={16} className="animate-spin" />
                            : !isClockedIn ? <Lock size={16} /> : null}
                          Start Task
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shift Transition Panel */}
          <div className="xl:col-span-4 p-8 bg-gradient-to-b from-white to-sky-50/30 rounded-2xl shadow-sm border border-sky-100 flex flex-col gap-6 w-full">
            <div className="pb-4 border-b border-sky-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex justify-center items-center text-sky-700 shadow-sm">
                <ArrowRightLeft size={24} />
              </div>
              <h2 className="text-zinc-900 text-2xl font-bold font-['Inter']">Shift Transition</h2>
            </div>

            <div className="px-4 py-8 bg-white/60 backdrop-blur-sm rounded-xl border border-sky-100/50 flex flex-col items-center gap-3">
              <Hourglass size={32} className="text-sky-600 animate-pulse" />
              <p className="text-center text-slate-600 text-sm font-medium font-['Inter'] leading-relaxed px-4 mt-2">
                Ensure all critical tasks are updated before handover.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-2 px-2">
              <div className="flex justify-between items-center group">
                <span className="text-slate-600 text-sm font-semibold font-['Inter'] group-hover:text-zinc-900 transition-colors">Pending Tasks</span>
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-zinc-900 text-sm font-bold font-['Inter']">
                  {tasks.filter(t => t.Status === 'Pending' || t.Status === 'Unassigned').length}
                </span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-slate-600 text-sm font-semibold font-['Inter'] group-hover:text-zinc-900 transition-colors">In Progress</span>
                <span className="w-8 h-8 rounded-full bg-blue-50 text-sky-700 flex items-center justify-center text-sm font-bold font-['Inter']">
                  {tasks.filter(t => t.Status === 'In Progress').length}
                </span>
              </div>
            </div>

            <button
              onClick={() => isClockedIn && setIsHandoverModalOpen(true)}
              disabled={!isClockedIn}
              title={!isClockedIn ? 'Clock in to initiate a handover' : undefined}
              className="w-full py-3.5 mt-auto bg-zinc-900 hover:bg-zinc-800 transition-all rounded-xl shadow-lg hover:shadow-xl text-white text-sm font-bold font-['Inter'] flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
            >
              {!isClockedIn ? <Lock size={16} /> : <ArrowRightLeft size={16} className="group-hover:rotate-180 transition-transform duration-500" />}
              Initiate Handover
            </button>
          </div>

        </div>
      </div>

      <InitiateHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
      />
    </div>
  );
};

export default Workspace;
