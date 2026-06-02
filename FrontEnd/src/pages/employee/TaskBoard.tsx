import React, { useState, useEffect, useCallback } from "react";
import { MapPin, CheckCircle2, Loader2, Lock, FileText, ListChecks } from "lucide-react";
import ConfirmTaskUpdateModal from "../../components/common/ConfirmTaskUpdateModal";
import InitiateHandoverModal from "../../components/common/InitiateHandoverModal";
import { TaskDetailModal } from "../../components/common/TaskDetailModal";
import api from "../../services/api";

interface Task {
  WorkItemID: number;
  Title: string;
  Description: string;
  Document?: string;
  Status: string;
  Priority?: string;
  DueDate?: string;
  AssigneeName?: string;
  SubTasks?: { SubTaskID: number; Title: string; Status: string }[];
}

const TaskBoard: React.FC = () => {
  const [activeTaskForUpdate, setActiveTaskForUpdate] = useState<{
    id: string;
    name: string;
    status: string;
  } | null>(null);
  const [handoverWorkId, setHandoverWorkId] = useState<number | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const userStr = sessionStorage.getItem("user");
      if (!userStr) { setLoading(false); return; }
      const user = JSON.parse(userStr);
      const data = await api.get("/works");
      setTasks(data.filter((t: any) => {
        const matchesName = t.AssigneeName === user.Name;
        const matchesAssigneesList = Array.isArray(t.Assignees) && t.Assignees.some((a: any) => a.EmployeeID === user.EmployeeID);
        return matchesName || matchesAssigneesList;
      }));
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const userStr = sessionStorage.getItem("user");
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
      const userStr = sessionStorage.getItem("user");
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
  const reviewTasks = tasks.filter((t) => t.Status === "Ready for Review");
  const completedTasks = tasks.filter((t) => t.Status === "Completed");

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-600" size={32} />
      </div>
    );
  }

  const lockedBtnClass = "opacity-50 cursor-not-allowed";

  // Reusable subtasks and document renderer for card (Clean, non-checkbox summary list style)
  const renderCardDetails = (task: Task) => {
    const completedCount = task.SubTasks ? task.SubTasks.filter(s => s.Status === 'Completed').length : 0;
    const totalCount = task.SubTasks ? task.SubTasks.length : 0;

    return (
      <div className="flex flex-col gap-1.5 mt-1 border-t border-slate-100 pt-2">
        {task.Document && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
            <FileText size={13} className="shrink-0" />
            <span className="truncate">Resource guideline attached</span>
          </div>
        )}
        {totalCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <ListChecks size={13} className="shrink-0" />
            <span>{completedCount} of {totalCount} subtasks completed</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 h-full overflow-hidden p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
      <div className="w-full flex flex-col gap-6 h-full max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-1 animate-fade-in shrink-0">
          <h1 className="text-zinc-900 text-3xl font-bold font-['Inter'] tracking-tight">
            Task Board
          </h1>
          <p className="text-slate-600 text-base font-normal font-['Inter']">
            Click on any card to view subtasks list, reference documents, or edit task/subtask status.
          </p>
        </div>

        {/* Clock-in required banner */}
        {!isClockedIn && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold font-['Inter'] shrink-0">
            <Lock size={16} className="shrink-0" />
            Clock in first to update subtasks or hand over tasks.
          </div>
        )}

        {/* Kanban Board Area */}
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">

          {/* Column: Pending */}
          <div className="flex flex-col min-w-[300px] max-w-[340px] w-full bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 gap-4 h-max shadow-sm">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-zinc-900 text-base font-bold font-['Inter']">Pending</h2>
              <span className="w-7 h-7 bg-white text-zinc-900 shadow-sm rounded-full flex items-center justify-center text-xs font-bold">
                {pendingTasks.length}
              </span>
            </div>

            {pendingTasks.length === 0 && (
              <div className="p-5 text-center text-sm text-slate-400 font-medium">No pending tasks</div>
            )}

            {pendingTasks.map((task) => (
              <div
                key={task.WorkItemID}
                onClick={() => setDetailTaskId(task.WorkItemID)}
                className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2.5 group hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-bold font-['Inter']">T-{task.WorkItemID}</span>
                  {task.Priority === "High" && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 rounded">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                      <span className="text-red-700 text-[10px] font-bold font-['Inter'] uppercase tracking-wider">Urgent</span>
                    </div>
                  )}
                </div>
                <h3 className="text-zinc-900 text-sm font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">{task.Title}</h3>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={13} />
                  <span className="text-xs font-semibold font-['Inter'] truncate">{task.Description}</span>
                </div>
                {renderCardDetails(task)}
                <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleQuickStart(task)}
                    disabled={!isClockedIn}
                    title={!isClockedIn ? "Clock in to start tasks" : undefined}
                    className={`flex-1 py-2 bg-sky-700 hover:bg-sky-800 transition-colors text-white rounded-lg text-xs font-bold shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 ${!isClockedIn ? lockedBtnClass : ""}`}
                  >
                    {!isClockedIn && <Lock size={12} />}
                    Start Task
                  </button>
                  <button
                    onClick={() => isClockedIn && setActiveTaskForUpdate({ id: `T-${task.WorkItemID}`, name: task.Title, status: task.Status || "Pending" })}
                    disabled={!isClockedIn}
                    title={!isClockedIn ? "Clock in to update tasks" : undefined}
                    className={`flex-1 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors rounded-lg text-xs font-bold active:scale-[0.98] flex items-center justify-center gap-1.5 ${!isClockedIn ? lockedBtnClass : ""}`}
                  >
                    {!isClockedIn && <Lock size={12} />}
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Column: In Progress */}
          <div className="flex flex-col min-w-[300px] max-w-[340px] w-full bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 gap-4 h-max shadow-sm">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-zinc-900 text-base font-bold font-['Inter']">In Progress</h2>
              <span className="w-7 h-7 bg-blue-100 text-sky-700 shadow-sm rounded-full flex items-center justify-center text-xs font-bold">
                {inProgressTasks.length}
              </span>
            </div>

            {inProgressTasks.length === 0 && (
              <div className="p-5 text-center text-sm text-slate-400 font-medium">No tasks in progress</div>
            )}

            {inProgressTasks.map((task) => (
              <div
                key={task.WorkItemID}
                onClick={() => setDetailTaskId(task.WorkItemID)}
                className="p-4 bg-white rounded-xl shadow-[0_4px_20px_rgb(3,105,161,0.06)] border-2 border-sky-600/20 flex flex-col gap-2.5 group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <span className="text-slate-500 text-xs font-bold font-['Inter']">T-{task.WorkItemID}</span>
                <h3 className="text-zinc-900 text-sm font-bold font-['Inter'] group-hover:text-sky-700 transition-colors">{task.Title}</h3>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={13} />
                  <span className="text-xs font-semibold font-['Inter'] truncate">{task.Description}</span>
                </div>
                {task.DueDate && (
                  <div className="text-[10px] text-slate-400 font-bold">
                    Due:{" "}
                    {new Date(task.DueDate).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
                {renderCardDetails(task)}
                <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => isClockedIn && setActiveTaskForUpdate({ id: `T-${task.WorkItemID}`, name: task.Title, status: task.Status })}
                    disabled={!isClockedIn}
                    title={!isClockedIn ? "Clock in to update tasks" : undefined}
                    className={`flex-1 py-2 bg-sky-700 hover:bg-sky-800 transition-colors text-white rounded-lg text-xs font-bold shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 ${!isClockedIn ? lockedBtnClass : ""}`}
                  >
                    {!isClockedIn && <Lock size={12} />}
                    Update
                  </button>
                  <button
                    onClick={() => isClockedIn && setHandoverWorkId(task.WorkItemID)}
                    disabled={!isClockedIn}
                    title={!isClockedIn ? "Clock in to initiate handover" : undefined}
                    className={`flex-1 py-2 bg-white border border-amber-300 text-amber-700 hover:bg-slate-50 transition-colors rounded-lg text-xs font-bold active:scale-[0.98] flex items-center justify-center gap-1.5 ${!isClockedIn ? lockedBtnClass : ""}`}
                  >
                    {!isClockedIn && <Lock size={12} />}
                    Handover
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Column: Ready for Review */}
          <div className="flex flex-col min-w-[300px] max-w-[340px] w-full bg-slate-100/60 rounded-2xl border border-slate-200/50 p-4 gap-4 h-max">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-slate-700 text-base font-bold font-['Inter']">Ready for Review</h2>
              <span className="w-7 h-7 bg-amber-100 text-amber-750 rounded-full flex items-center justify-center text-xs font-bold">
                {reviewTasks.length}
              </span>
            </div>

            {reviewTasks.length === 0 && (
              <div className="p-5 text-center text-sm text-slate-400 font-medium">No tasks ready for review</div>
            )}

            {reviewTasks.map((task) => (
              <div
                key={task.WorkItemID}
                onClick={() => setDetailTaskId(task.WorkItemID)}
                className="p-4 bg-white/80 rounded-xl border border-slate-200/50 flex flex-col gap-2 backdrop-blur-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-350"
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs font-bold font-['Inter']">T-{task.WorkItemID}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-55 text-amber-800 font-bold border border-amber-200">Review Pending</span>
                </div>
                <h3 className="text-slate-700 text-sm font-bold font-['Inter'] mt-1">{task.Title}</h3>
                {renderCardDetails(task)}
              </div>
            ))}
          </div>

          {/* Column: Completed */}
          <div className="flex flex-col min-w-[300px] max-w-[340px] w-full bg-slate-100/40 rounded-2xl border border-slate-200/50 p-4 gap-4 h-max opacity-85 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-center px-2 pb-1">
              <h2 className="text-slate-600 text-base font-bold font-['Inter']">Completed</h2>
              <span className="w-7 h-7 bg-slate-200/50 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold">
                {completedTasks.length}
              </span>
            </div>

            {completedTasks.length === 0 && (
              <div className="p-5 text-center text-sm text-slate-400 font-medium">No completed tasks</div>
            )}

            {completedTasks.map((task) => (
              <div
                key={task.WorkItemID}
                onClick={() => setDetailTaskId(task.WorkItemID)}
                className="p-4 bg-white/70 rounded-xl border border-slate-200/50 flex flex-col gap-2 backdrop-blur-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-350"
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-450 text-xs font-bold font-['Inter'] line-through">T-{task.WorkItemID}</span>
                  <CheckCircle2 size={16} className="text-emerald-600/80" />
                </div>
                <h3 className="text-slate-600 text-sm font-bold font-['Inter'] mt-1">{task.Title}</h3>
                {renderCardDetails(task)}
                <div className="flex items-center gap-2 mt-2 text-slate-500 text-xs font-bold">
                  <CheckCircle2 size={14} className="text-emerald-650" />
                  <span>Approved & Closed</span>
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

      <TaskDetailModal
        isOpen={detailTaskId !== null}
        onClose={() => { setDetailTaskId(null); fetchTasks(); }}
        taskId={detailTaskId}
        onSuccess={() => fetchTasks()}
      />
    </div>
  );
};

export default TaskBoard;
