import React from 'react';
import { X } from 'lucide-react';

export interface TaskDetails {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string;
  currentAssignee: {
    name: string;
    role: string;
    statusText: string;
  };
  suggestedAssignee: {
    name: string;
    role: string;
    statusText: string;
  };
}

const mockTask: TaskDetails = {
  id: 'T-882',
  title: 'Emergency Room Setup',
  status: 'Delayed by 4h',
  priority: 'High Priority',
  deadline: '14:00 Today',
  currentAssignee: {
    name: 'Dr. Khoa',
    role: 'ER Attending',
    statusText: 'Overloaded (12 active tasks, 150% capacity)'
  },
  suggestedAssignee: {
    name: 'Dr. Hao',
    role: 'Float Pool Attending',
    statusText: 'Available (0 active tasks, shift ends in 6 hours)'
  }
};

interface ReassignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskDetails;
}

const ReassignTaskModal: React.FC<ReassignTaskModalProps> = ({ isOpen, onClose, task = mockTask }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div data-layer="Modal Container" className="ModalContainer w-full max-w-[800px] max-h-[90vh] bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(15,23,42,0.12)] outline outline-1 outline-offset-[-1px] outline-slate-300/20 inline-flex flex-col justify-start items-start overflow-hidden">
        <div data-layer="Header" className="Header self-stretch px-8 py-6 bg-slate-50/50 border-b border-slate-300/10 inline-flex justify-between items-center shrink-0">
          <div data-layer="Container" className="Container flex justify-start items-center gap-4">
            <div data-layer="Overlay" className="Overlay w-10 h-10 bg-rose-200/20 rounded-xl flex justify-center items-center shrink-0">
              <div data-svg-wrapper data-layer="Container" className="Container">
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 16V14H2.75L2.35 13.65C1.48333 12.8833 0.875 12.0083 0.525 11.025C0.175 10.0417 0 9.05 0 8.05C0 6.2 0.554167 4.55417 1.6625 3.1125C2.77083 1.67083 4.21667 0.716667 6 0.25V2.35C4.8 2.78333 3.83333 3.52083 3.1 4.5625C2.36667 5.60417 2 6.76667 2 8.05C2 8.8 2.14167 9.52917 2.425 10.2375C2.70833 10.9458 3.15 11.6 3.75 12.2L4 12.45V10H6V16H0ZM9 13C8.71667 13 8.47917 12.9042 8.2875 12.7125C8.09583 12.5208 8 12.2833 8 12C8 11.7167 8.09583 11.4792 8.2875 11.2875C8.47917 11.0958 8.71667 11 9 11C9.28333 11 9.52083 11.0958 9.7125 11.2875C9.90417 11.4792 10 11.7167 10 12C10 12.2833 9.90417 12.5208 9.7125 12.7125C9.52083 12.9042 9.28333 13 9 13ZM8 9V3H10V9H8ZM12 15.75V13.65C13.2 13.2167 14.1667 12.4792 14.9 11.4375C15.6333 10.3958 16 9.23333 16 7.95C16 7.2 15.8583 6.47083 15.575 5.7625C15.2917 5.05417 14.85 4.4 14.25 3.8L14 3.55V6H12V0H18V2H15.25L15.65 2.35C16.4667 3.16667 17.0625 4.05417 17.4375 5.0125C17.8125 5.97083 18 6.95 18 7.95C18 9.8 17.4458 11.4458 16.3375 12.8875C15.2292 14.3292 13.7833 15.2833 12 15.75Z" fill="#BA1A1A"/>
                </svg>
              </div>
            </div>
            <div data-layer="Container" className="Container inline-flex flex-col justify-start items-start">
              <div data-layer="Heading 2" className="Heading2 self-stretch flex flex-col justify-start items-start">
                <div data-layer="Text" className="Text justify-center text-zinc-900 text-xl font-semibold font-['Inter'] leading-7">Reassignment Details</div>
              </div>
              <div data-layer="Container" className="Container self-stretch flex flex-col justify-start items-start">
                <div data-layer="Text" className="Text justify-center text-gray-700 text-xs font-medium font-['Inter'] leading-4 tracking-tight">{task.id} {task.title}</div>
              </div>
            </div>
          </div>
          <button data-layer="Button" onClick={onClose} className="Button w-8 h-8 flex justify-center items-center hover:bg-slate-200 rounded-full transition-colors shrink-0">
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        <div data-layer="Body" className="Body self-stretch p-8 flex flex-col justify-start items-start gap-8 overflow-y-auto">
          <div data-layer="Section 1: Task Context" className="Section1TaskContext self-stretch p-6 bg-slate-100 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-300/20 flex flex-col justify-start items-start gap-4">
            <div data-layer="Heading 3" className="Heading3 self-stretch flex flex-col justify-start items-start">
              <div data-layer="TASK CONTEXT" className="TaskContext self-stretch justify-center text-gray-700 text-xs font-semibold font-['Inter'] uppercase leading-4 tracking-wide">TASK CONTEXT</div>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status */}
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="text-gray-700 text-xs font-medium font-['Inter'] leading-4 tracking-tight">Status</div>
                <div className="inline-flex justify-start items-center gap-2">
                  <div className="text-red-700 flex items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.975 11.025L11.025 9.975L8.25 7.2V3.75H6.75V7.8L9.975 11.025ZM7.5 15C6.4625 15 5.4875 14.8031 4.575 14.4094C3.6625 14.0156 2.86875 13.4812 2.19375 12.8062C1.51875 12.1312 0.984375 11.3375 0.590625 10.425C0.196875 9.5125 0 8.5375 0 7.5C0 6.4625 0.196875 5.4875 0.590625 4.575C0.984375 3.6625 1.51875 2.86875 2.19375 2.19375C2.86875 1.51875 3.6625 0.984375 4.575 0.590625C5.4875 0.196875 6.4625 0 7.5 0C8.5375 0 9.5125 0.196875 10.425 0.590625C11.3375 0.984375 12.1312 1.51875 12.8062 2.19375C13.4812 2.86875 14.0156 3.6625 14.4094 4.575C14.8031 5.4875 15 6.4625 15 7.5C15 8.5375 14.8031 9.5125 14.4094 10.425C14.0156 11.3375 13.4812 12.1312 12.8062 12.8062C12.1312 13.4812 11.3375 14.0156 10.425 14.4094C9.5125 14.8031 8.5375 15 7.5 15ZM7.5 13.5C9.1625 13.5 10.5781 12.9156 11.7469 11.7469C12.9156 10.5781 13.5 9.1625 13.5 7.5C13.5 5.8375 12.9156 4.42188 11.7469 3.25312C10.5781 2.08437 9.1625 1.5 7.5 1.5C5.8375 1.5 4.42188 2.08437 3.25312 3.25312C2.08437 4.42188 1.5 5.8375 1.5 7.5C1.5 9.1625 2.08437 10.5781 3.25312 11.7469C4.42188 12.9156 5.8375 13.5 7.5 13.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="text-red-700 text-base font-semibold font-['Inter'] leading-6">{task.status}</div>
                </div>
              </div>

              {/* Priority */}
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="text-gray-700 text-xs font-medium font-['Inter'] leading-4 tracking-tight">Priority</div>
                <div className="inline-flex justify-start items-center gap-2">
                  <div className="text-red-700 flex items-center justify-center">
                    <svg width="3" height="14" viewBox="0 0 3 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 13.5C1.0875 13.5 0.734375 13.3531 0.440625 13.0594C0.146875 12.7656 0 12.4125 0 12C0 11.5875 0.146875 11.2344 0.440625 10.9406C0.734375 10.6469 1.0875 10.5 1.5 10.5C1.9125 10.5 2.26562 10.6469 2.55938 10.9406C2.85313 11.2344 3 11.5875 3 12C3 12.4125 2.85313 12.7656 2.55938 13.0594C2.26562 13.3531 1.9125 13.5 1.5 13.5ZM0 9V0H3V9H0Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="text-zinc-900 text-base font-semibold font-['Inter'] leading-6">{task.priority}</div>
                </div>
              </div>

              {/* Original Deadline */}
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="text-gray-700 text-xs font-medium font-['Inter'] leading-4 tracking-tight">Original Deadline</div>
                <div className="inline-flex justify-start items-center gap-2">
                  <div className="text-slate-600 flex items-center justify-center">
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.625 12C8.1 12 7.65625 11.8188 7.29375 11.4563C6.93125 11.0938 6.75 10.65 6.75 10.125C6.75 9.6 6.93125 9.15625 7.29375 8.79375C7.65625 8.43125 8.1 8.25 8.625 8.25C9.15 8.25 9.59375 8.43125 9.95625 8.79375C10.3188 9.15625 10.5 9.6 10.5 10.125C10.5 10.65 10.3188 11.0938 9.95625 11.4563C9.59375 11.8188 9.15 12 8.625 12ZM1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V3C0 2.5875 0.146875 2.23438 0.440625 1.94062C0.734375 1.64687 1.0875 1.5 1.5 1.5H2.25V0H3.75V1.5H9.75V0H11.25V1.5H12C12.4125 1.5 12.7656 1.64687 13.0594 1.94062C13.3531 2.23438 13.5 2.5875 13.5 3V13.5C13.5 13.9125 13.3531 14.2656 13.0594 14.5594C12.7656 14.8531 12.4125 15 12 15H1.5ZM1.5 13.5H12V6H1.5V13.5ZM1.5 4.5H12V3H1.5V4.5ZM1.5 4.5V3V4.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="text-zinc-900 text-base font-semibold font-['Inter'] leading-6">{task.deadline}</div>
                </div>
              </div>
            </div>
          </div>
          <div data-layer="Sections 2 & 3: Comparison Cards" className="Sections23ComparisonCards self-stretch relative flex flex-col md:flex-row justify-start items-stretch gap-6 md:gap-4">
            <div data-layer="Section 2: The Problem (Current)" className="Section2TheProblemCurrent flex-1 flex flex-col justify-start items-start">
              <div data-layer="Heading 3:margin" className="Heading3Margin self-stretch pb-2 flex flex-col justify-start items-start">
                <div data-layer="Heading 3" className="Heading3 self-stretch flex flex-col justify-start items-start">
                  <div data-layer="CURRENT ASSIGNMENT" className="CurrentAssignment self-stretch justify-center text-gray-700 text-xs font-medium font-['Inter'] uppercase leading-4 tracking-wide">CURRENT ASSIGNMENT</div>
                </div>
              </div>
              <div data-layer="Background+Border" className="BackgroundBorder self-stretch h-full p-6 relative bg-slate-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-red-700/30 flex flex-col justify-start items-start gap-4 overflow-hidden shadow-sm">
                <div data-layer="Container" className="Container self-stretch flex justify-start items-start gap-4">
                  <div data-layer="Background+Border" className="BackgroundBorder w-12 h-12 bg-gray-200 rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-300/20 flex justify-center items-center shrink-0">
                    <div data-svg-wrapper data-layer="Container" className="Container">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z" fill="#3F4850"/>
                      </svg>
                    </div>
                  </div>
                  <div data-layer="Container" className="Container flex-1 flex flex-col justify-start items-start">
                    <div data-layer="Heading 4" className="Heading4 self-stretch flex flex-col justify-start items-start">
                      <div data-layer="Dr. Khoa" className="DrKhoa justify-center text-zinc-900 text-base font-semibold font-['Inter'] leading-6">{task.currentAssignee.name}</div>
                    </div>
                    <div data-layer="Container" className="Container self-stretch flex flex-col justify-start items-start">
                      <div data-layer="Text" className="Text justify-center text-gray-700 text-xs font-medium font-['Inter'] leading-4 tracking-tight">{task.currentAssignee.role}</div>
                    </div>
                  </div>
                </div>
                <div data-layer="Background+Border" className="BackgroundBorder px-3 py-2 bg-rose-100 outline outline-1 outline-offset-[-1px] outline-red-700/20 flex justify-start items-start gap-2 rounded-lg mt-2 w-full">
                  <div data-svg-wrapper data-layer="Container" className="Container shrink-0 mt-0.5">
                    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 12.6667L7.33333 0L14.6667 12.6667H0ZM2.3 11.3333H12.3667L7.33333 2.66667L2.3 11.3333ZM7.33333 10.6667C7.52222 10.6667 7.68056 10.6028 7.80833 10.475C7.93611 10.3472 8 10.1889 8 10C8 9.81111 7.93611 9.65278 7.80833 9.525C7.68056 9.39722 7.52222 9.33333 7.33333 9.33333C7.14444 9.33333 6.98611 9.39722 6.85833 9.525C6.73056 9.65278 6.66667 9.81111 6.66667 10C6.66667 10.1889 6.73056 10.3472 6.85833 10.475C6.98611 10.6028 7.14444 10.6667 7.33333 10.6667ZM6.66667 8.66667H8V5.33333H6.66667V8.66667Z" fill="#93000A"/>
                    </svg>
                  </div>
                  <div data-layer="Container" className="Container flex-1 flex flex-col justify-start items-start">
                    <div data-layer="Text" className="Text text-red-800 text-xs font-medium font-['Inter'] leading-4 tracking-tight">{task.currentAssignee.statusText}</div>
                  </div>
                </div>
                <div data-layer="Background" className="Background w-1 h-full left-[0px] top-[0px] absolute bg-red-600" />
              </div>
            </div>
            
            <div data-layer="Section 3: The Solution (Suggested)" className="Section3TheSolutionSuggested flex-1 flex flex-col justify-start items-start">
              <div data-layer="Heading 3:margin" className="Heading3Margin self-stretch pb-2 flex flex-col justify-start items-start">
                <div data-layer="Heading 3" className="Heading3 self-stretch inline-flex justify-start items-center gap-1">
                  <div data-layer="Text" className="Text justify-center text-gray-700 text-xs font-medium font-['Inter'] uppercase leading-4 tracking-wide">SUGGESTED REASSIGNMENT</div>
                </div>
              </div>
              <div data-layer="Overlay+Border+Shadow" className="OverlayBorderShadow self-stretch h-full p-6 relative bg-sky-50 rounded-xl shadow-[inset_0px_0px_20px_1px_rgba(0,97,148,0.02)] outline outline-1 outline-offset-[-1px] outline-sky-700/30 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div data-layer="Container" className="Container self-stretch flex justify-start items-start gap-4">
                  <div data-layer="Background" className="Background w-12 h-12 bg-sky-600 rounded-xl flex justify-center items-center shrink-0">
                    <div data-svg-wrapper data-layer="Container" className="Container">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z" fill="#FDFCFF"/>
                      </svg>
                    </div>
                  </div>
                  <div data-layer="Container" className="Container flex-1 flex flex-col justify-start items-start">
                    <div data-layer="Heading 4" className="Heading4 self-stretch flex flex-col justify-start items-start">
                      <div data-layer="Dr. Hao" className="DrHao justify-center text-zinc-900 text-base font-semibold font-['Inter'] leading-6">{task.suggestedAssignee.name}</div>
                    </div>
                    <div data-layer="Container" className="Container self-stretch flex flex-col justify-start items-start">
                      <div data-layer="Text" className="Text justify-center text-gray-700 text-xs font-medium font-['Inter'] leading-4 tracking-tight">{task.suggestedAssignee.role}</div>
                    </div>
                  </div>
                </div>
                <div data-layer="Note" className="Note px-3 py-2 bg-sky-100/50 outline outline-1 outline-offset-[-1px] outline-sky-600/20 flex justify-start items-start gap-2 rounded-lg mt-2 w-full">
                  <div data-svg-wrapper data-layer="Container" className="Container shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.73333 9.73333L10.4333 5.03333L9.5 4.1L5.73333 7.86667L3.83333 5.96667L2.9 6.9L5.73333 9.73333ZM6.66667 13.3333C5.74444 13.3333 4.87778 13.1583 4.06667 12.8083C3.25556 12.4583 2.55 11.9833 1.95 11.3833C1.35 10.7833 0.875 10.0778 0.525 9.26667C0.175 8.45555 0 7.58889 0 6.66667C0 5.74444 0.175 4.87778 0.525 4.06667C0.875 3.25556 1.35 2.55 1.95 1.95C2.55 1.35 3.25556 0.875 4.06667 0.525C4.87778 0.175 5.74444 0 6.66667 0C7.58889 0 8.45555 0.175 9.26667 0.525C10.0778 0.875 10.7833 1.35 11.3833 1.95C11.9833 2.55 12.4583 3.25556 12.8083 4.06667C13.1583 4.87778 13.3333 5.74444 13.3333 6.66667C13.3333 7.58889 13.1583 8.45555 12.8083 9.26667C12.4583 10.0778 11.9833 10.7833 11.3833 11.3833C10.7833 11.9833 10.0778 12.4583 9.26667 12.8083C8.45555 13.1583 7.58889 13.3333 6.66667 13.3333ZM6.66667 12C8.15556 12 9.41667 11.4833 10.45 10.45C11.4833 9.41667 12 8.15556 12 6.66667C12 5.17778 11.4833 3.91667 10.45 2.88333C9.41667 1.85 8.15556 1.33333 6.66667 1.33333C5.17778 1.33333 3.91667 1.85 2.88333 2.88333C1.85 3.91667 1.33333 5.17778 1.33333 6.66667C1.33333 8.15556 1.85 9.41667 2.88333 10.45C3.91667 11.4833 5.17778 12 6.66667 12Z" fill="#0369A1"/>
                    </svg>
                  </div>
                  <div data-layer="Container" className="Container flex-1 flex flex-col justify-start items-start">
                    <div data-layer="Text" className="Text text-sky-800 text-xs font-medium font-['Inter'] leading-4 tracking-tight">{task.suggestedAssignee.statusText}</div>
                  </div>
                </div>
                <div data-layer="Background" className="Background w-1 h-full left-[0px] top-[0px] absolute bg-sky-600" />
              </div>
            </div>
            
            <div data-layer="Decorative Arrow (Desktop Only)" className="DecorativeArrowDesktopOnly w-8 h-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-300/50 justify-center items-center z-10 hidden md:flex">
              <div data-svg-wrapper data-layer="Container" className="Container">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z" fill="#64748b"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div data-layer="Footer" className="Footer self-stretch px-8 py-6 bg-slate-50 border-t border-slate-200 inline-flex justify-end items-center gap-4 shrink-0">
          <button data-layer="Link" onClick={onClose} className="Link px-4 py-2 flex flex-col justify-start items-start hover:bg-slate-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
            <div data-layer="Text" className="Text justify-center text-slate-600 text-sm font-semibold font-['Inter'] leading-5">Cancel</div>
          </button>
          <button data-layer="Button" onClick={onClose} className="Button px-6 py-2 outline outline-1 outline-offset-[-1px] outline-slate-300 bg-white hover:bg-slate-50 rounded-md shadow-sm transition-colors flex flex-col justify-center items-center focus:outline-none focus:ring-2 focus:ring-slate-200">
            <div data-layer="Text" className="Text text-center justify-center text-slate-700 text-sm font-semibold font-['Inter'] leading-5 tracking-tight">Reject Suggestion</div>
          </button>
          <button data-layer="Button" onClick={onClose} className="Button px-6 py-2 bg-sky-700 hover:bg-sky-800 rounded-md shadow-sm transition-colors flex flex-col justify-center items-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1">
            <div data-layer="Text" className="Text text-center justify-center text-white text-sm font-semibold font-['Inter'] leading-5 tracking-tight">Confirm Reassignment</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignTaskModal;
