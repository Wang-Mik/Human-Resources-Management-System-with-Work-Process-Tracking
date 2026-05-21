import React, { useState, useEffect, useCallback } from "react";
import { MapPin, CheckCircle2, CheckCheck, Loader2, Lock } from "lucide-react";
import ConfirmTaskUpdateModal from "../../components/common/ConfirmTaskUpdateModal";
import InitiateHandoverModal from "../../components/common/InitiateHandoverModal";
import api from "../../services/api";

interface Task {
  WorkItemID: number;
  Title: string;
  Description: string;
  Status: string;
  Priority?: string;
  DueDate?: string;
  AssigneeName?: string;
}

const TaskBoard: React.FC = () => {
  const [activeTaskForUpdate, setActiveTaskForUpdate] = useState<{
    id: string;
    name: string;
    status: string;
  } | null>(null);
  const [handoverWorkId, setHandoverWorkId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) { setLoading(false); return; }
      const user = JSON.parse(userStr);
      const data = await api.get("/works");
      setTasks(data.filter((t: Task) => t.AssigneeName === user.Name));
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const data = await api.get(`/availability/attendance/today/${user.EmployeeID}`);
      setIsClockedIn(!!data?.CheckInTime && !data?.CheckOutTime);
    } catch {
      setIsClockedIn(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchAttendance();
  }, [fetchTasks, fetchAttendance]);

  const handleQuickStart = async (task: Task) => {
    if (!isClockedIn) return;
    try {
      const userStr = localStorage.getItem("user");
      const employeeId = userStr ? JSON.parse(userStr).EmployeeID : 1;
      await api.put(`/works/${task.WorkItemID}/progress`, {
        status: "In Progress",
        employeeId,
        contextNote: "Task started from Task Board",
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to start task", err);
    }
  };

  const pendingTasks = tasks.filter(
    (t) => t.Status === "Pending" || t.Status === "Unassigned" || !t.Status,
  );
  const inProgressTasks = tasks.filter((t) => t.Status === "In Progress");
  const completedTasks = tasks.filter((t) => t.Status === "Completed");

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-600" size={32} />
      </div>
    );
  }

  const lockedBtnClass = "opacity-50 cursor-not-allowed";

  return (
    <div className="flex-1 h-full overflow-hidden p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
      <div className="w-full flex flex-col gap-6 h-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-1 animate-fade-in shrink-0">
          <h1 className="text-zinc-900 text-3xl font-bold font-['Inter'] tracking-tight">
            Task Board
          </h1>
          <p className="text-slate-600 text-base font-normal font-['Inter']">
            Manage your daily operations and clinical tasks.
          </p>
        </div>

        {/* Clock-in required banner */}
        {!isClockedIn && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold font-['Inter'] shrink-0">
            <Lock size={16} className="shrink-0" />
            Clock in first to start, update, or hand over tasks.
          </div>
        )}

        {/* Kanban Board Area */}
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">

          {/* Column: Pending */}
          <div className="flex flex-col min-w-[340px] max-w-[360px] w-full bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 gap-4 h-max shadow-sm">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-zinc-900 text-xl font-bold font-['Inter']">Pending</h2>
              <span className="w-7 h-7 bg-white text-zinc-900 shadow-sm rounded-full flex items-center justify-center text-sm font-bold">
                {pendingTasks.length}
              </span>
            </div>

            {pendingTasks.length === 0 && (
              <div className="p-5 text-center text-sm text-slate-400 font-medium">No pending tasks</div>
            )}

            {pendingTasks.map((task) => (
              <div
                key={task.WorkItemID}
                className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-bold font-['Inter']">T-{task.WorkItemID}</span>
                  {task.Priority === "High" && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-md">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      <span className="text-red-700 text-xs font-bold font-['Inter'] uppercase tracking-wider">Urgent</span>
                    </div>
                  )}
                </div>
                <h3 className="text-zinc-900 text-base font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">{task.Title}</h3>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={14} />
                  <span className="text-xs font-semibold font-['Inter'] truncate">{task.Description}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleQuickStart(task)}
                    disabled={!isClockedIn}
                    title={!isClockedIn ? "Clock in to start tasks" : undefined}
                    className={`flex-1 py-2.5 bg-sky-700 hover:bg-sky-800 transition-colors text-white rounded-lg text-sm font-semibold font-['Inter'] shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 ${!isClockedIn ? lockedBtnClass : ""}`}
                  >
                    {!isClockedIn && <Lock size={13} />}
                    Start Task
                  </button>
                  <button
                    onClick={() => isClockedIn && setActiveTaskForUpdate({ id: `T-${task.WorkItemID}`, name: task.Title, status: task.Status || "Pending" })}
                    disabled={!isClockedIn}
                    title={!isClockedIn ? "Clock in to update tasks" : undefined}
                    className={`flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors rounded-lg text-sm font-semibold font-['Inter'] active:scale-[0.98] flex items-center justify-center gap-1.5 ${!isClockedIn ? lockedBtnClass : ""}`}
                  >
                    {!isClockedIn && <Lock size={13} />}
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Column: In Progress */}
          <div className="flex flex-col min-w-[340px] max-w-[360px] w-full bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 gap-4 h-max shadow-sm">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-zinc-900 text-xl font-bold font-['Inter']">In Progress</h2>
              <span className="w-7 h-7 bg-blue-100 text-sky-700 shadow-sm rounded-full flex items-center justify-center text-sm font-bold">
                {inProgressTasks.length}
              </span>
            </div>

            {inProgressTasks.length === 0 && (
              <div className="p-5 text-center text-sm text-slate-400 font-medium">No tasks in progress</div>
            )}

            {inProgressTasks.map((task) => (
              <div
                key={task.WorkItemID}
                className="p-5 bg-white rounded-xl shadow-[0_4px_20px_rgb(3,105,161,0.08)] border-2 border-sky-600/20 flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-slate-500 text-xs font-bold font-['Inter']">T-{task.WorkItemID}</span>
                <h3 className="text-zinc-900 text-base font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">{task.Title}</h3>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={14} />
                  <span className="text-xs font-semibold font-['Inter'] truncate">{task.Description}</span>
                </div>
                {task.DueDate && (
                  <div className="text-xs text-slate-400 font-medium">
                    Due:{" "}
                    {new Date(task.DueDate).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => isClockedIn && setActiveTaskForUpdate({ id: `T-${task.WorkItemID}`, name: task.Title, status: task.Status })}
                    disabled={!isClockedIn}
                    title={!isClockedIn ? "Clock in to update tasks" : undefined}
                    className={`flex-1 py-2.5 bg-sky-700 hover:bg-sky-800 transition-colors text-white rounded-lg text-sm font-semibold font-['Inter'] shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 ${!isClockedIn ? lockedBtnClass : ""}`}
                  >
                    {!isClockedIn && <Lock size={13} />}
                    Update
                  </button>
                  <button
                    onClick={() => isClockedIn && setHandoverWorkId(task.WorkItemID)}
                    disabled={!isClockedIn}
                    title={!isClockedIn ? "Clock in to initiate handover" : undefined}
                    className={`flex-1 py-2.5 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors rounded-lg text-sm font-semibold font-['Inter'] active:scale-[0.98] flex items-center justify-center gap-1.5 ${!isClockedIn ? lockedBtnClass : ""}`}
                  >
                    {!isClockedIn && <Lock size={13} />}
                    Handover
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Column: Completed */}
          <div className="flex flex-col min-w-[340px] max-w-[360px] w-full bg-slate-100/40 rounded-2xl border border-slate-200/50 p-4 gap-4 h-max opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-slate-600 text-xl font-bold font-['Inter']">Completed</h2>
              <span className="w-7 h-7 bg-slate-200/50 text-slate-500 rounded-full flex items-center justify-center text-sm font-bold">
                {completedTasks.length}
              </span>
            </div>

            {completedTasks.length === 0 && (
              <div className="p-5 text-center text-sm text-slate-400 font-medium">No completed tasks</div>
            )}

            {completedTasks.map((task) => (
              <div
                key={task.WorkItemID}
                className="p-5 bg-white/70 rounded-xl border border-slate-200/50 flex flex-col gap-2 backdrop-blur-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold font-['Inter'] line-through">T-{task.WorkItemID}</span>
                  <CheckCircle2 size={18} className="text-emerald-600/80" />
                </div>
                <h3 className="text-slate-600 text-base font-bold font-['Inter'] mt-1">{task.Title}</h3>
                <div className="flex items-center gap-2 text-slate-500 mt-2">
                  <CheckCheck size={14} />
                  <span className="text-xs font-semibold font-['Inter']">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmTaskUpdateModal
        isOpen={!!activeTaskForUpdate}
        onClose={() => { setActiveTaskForUpdate(null); fetchTasks(); }}
        task={activeTaskForUpdate}
      />

      <InitiateHandoverModal
        isOpen={!!handoverWorkId}
        onClose={() => { setHandoverWorkId(null); fetchTasks(); }}
      />
    </div>
  );
};

export default TaskBoard;
