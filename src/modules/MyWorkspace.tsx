import React, { useState } from 'react';
import { Play, Copy, Calendar as CalendarIcon, CheckCircle2, AlertTriangle, FileText, ActivityIcon, Plus, Mail, BookOpen, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkItem } from '../types/models';
import { User, Activity, Task, Communication, Rule } from '../data/mockData';

export const MyWorkspacePage = ({ currentUser, activities, tasks, communications, workItems, onAction, onNavigate }: { currentUser: User, activities: Activity[], tasks: Task[], communications: Communication[], workItems: WorkItem[], onAction: (type: string, payload: any) => void, onNavigate: (page: string, payload?: any) => void }) => {
  
  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id && t.status !== 'Completed');
  const myClarifications = activities.filter(a => a.userId === currentUser.id && a.tag === 'Clarification Required');
  // Mock Approvals
  const myApprovals = [
    { id: '1', title: 'AP Invoice Batch #204', requester: 'John Doe', amount: '$4,200', date: '2026-06-17' },
    { id: '2', title: 'Month End Adjustment Rules', requester: 'Jane Smith', amount: 'N/A', date: '2026-06-16' }
  ];
  const myEscalations = workItems.filter(w => w.status === 'Escalated Level 1' || w.status === 'Escalated Level 2');
  const myRecentActivity = activities.filter(a => a.userId === currentUser.id).slice(0, 5);
  
  const [activeTab, setActiveTab] = useState<'Work' | 'Clarifications' | 'Approvals' | 'Escalations'>('Work');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Workspace</h1>
          <p className="text-zinc-500 text-sm">Your operational focus area and action items</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onAction('OPEN_SMART_CAPTURE', {})} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm">
              <Plus size={16} /> Smart Capture
            </button>
            <button onClick={() => onAction('OPEN_BULK_PROCESSING', {})} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm">
              <Copy size={16} /> Bulk Processing
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">My Capacity</h3>
           <div className="flex items-end gap-2 mb-2">
              <p className="text-3xl font-bold text-zinc-900">85%</p>
              <p className="text-xs font-bold text-emerald-600 mb-1">Optimal</p>
           </div>
           <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Open Work Items</h3>
           <p className="text-3xl font-bold text-zinc-900">{myTasks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Pending Clarifications</h3>
           <p className="text-3xl font-bold text-amber-600">{myClarifications.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">My Approvals</h3>
           <p className="text-3xl font-bold text-blue-600">{myApprovals.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
             <div className="flex border-b border-zinc-100 bg-zinc-50/50">
               {['Work', 'Clarifications', 'Approvals', 'Escalations'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={cn("flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors", activeTab === tab ? "border-emerald-500 text-emerald-700 bg-white" : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100/50")}
                 >
                   {tab}
                 </button>
               ))}
             </div>
             
             <div className="p-0">
                {activeTab === 'Work' && (
                  <div className="divide-y divide-zinc-100">
                    {myTasks.length === 0 ? <p className="p-6 text-center text-zinc-500 text-sm">No open work items.</p> : myTasks.map(task => (
                      <div key={task.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><Play size={14} /></div>
                           <div>
                              <p className="font-bold text-zinc-900 text-sm">{task.taskName}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{task.processType} • Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <button className="px-3 py-1.5 bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-700 font-bold text-xs rounded transition-colors" onClick={() => onNavigate('task-detail', { taskId: task.id })}>Execute</button>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'Clarifications' && (
                  <div className="divide-y divide-zinc-100">
                    {myClarifications.length === 0 ? <p className="p-6 text-center text-zinc-500 text-sm">No pending clarifications.</p> : myClarifications.map(act => (
                      <div key={act.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0"><AlertTriangle size={14} /></div>
                           <div>
                              <p className="font-bold text-zinc-900 text-sm">{act.documentReference}</p>
                              <p className="text-[10px] text-zinc-500 font-bold tracking-wider mt-0.5">{act.actionTaken}</p>
                           </div>
                        </div>
                        <button className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs rounded transition-colors" onClick={() => onNavigate('activity-log')}>Respond</button>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'Approvals' && (
                  <div className="divide-y divide-zinc-100">
                    {myApprovals.map(app => (
                      <div key={app.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><CheckCircle2 size={14} /></div>
                           <div>
                              <p className="font-bold text-zinc-900 text-sm">{app.title}</p>
                              <p className="text-[10px] text-zinc-500 font-bold tracking-wider mt-0.5">Requester: {app.requester} • Amount: {app.amount}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded transition-colors">Approve</button>
                           <button className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded transition-colors">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'Escalations' && (
                  <div className="divide-y divide-zinc-100">
                    {myEscalations.length === 0 ? <p className="p-6 text-center text-zinc-500 text-sm">No active escalations.</p> : myEscalations.map(esc => (
                      <div key={esc.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0"><AlertTriangle size={14} /></div>
                           <div>
                              <p className="font-bold text-zinc-900 text-sm">{esc.title}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Delayed • Overdue</p>
                           </div>
                        </div>
                        <button className="px-3 py-1.5 bg-zinc-100 hover:bg-rose-50 hover:text-rose-700 text-zinc-700 font-bold text-xs rounded transition-colors" onClick={() => onNavigate('escalations')}>View</button>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           </div>
           
           {/* Productivity Engine */}
           <div className="bg-white p-6 border border-zinc-200 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2"><ActivityIcon size={16} className="text-indigo-500"/> Personal Productivity Engine</h3>
              <div className="grid grid-cols-5 gap-4">
                 <div className="text-center p-3 bg-zinc-50 rounded-xl">
                    <p className="text-2xl font-bold text-zinc-900">{myTasks.length}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 mt-0.5">Items</p>
                 </div>
                 <div className="text-center p-3 bg-zinc-50 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">{myApprovals.length}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 mt-0.5">Apprvls</p>
                 </div>
                 <div className="text-center p-3 bg-zinc-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">{14}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 mt-0.5">Emails</p>
                 </div>
                 <div className="text-center p-3 bg-zinc-50 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600">{myClarifications.length}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 mt-0.5">Claris</p>
                 </div>
                 <div className="text-center p-3 bg-zinc-50 rounded-xl">
                    <p className="text-2xl font-bold text-rose-600">{myEscalations.length}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 mt-0.5">Exceps</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2"><CalendarIcon size={16} className="text-blue-500"/> My Calendar</h3>
              <div className="space-y-3">
                 <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 rounded bg-white text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">10a</div>
                    <div>
                       <p className="text-xs font-bold text-blue-900">Client Sync: Globex</p>
                       <p className="text-[10px] text-blue-600 mt-0.5">Monthly performance review</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-8 h-8 rounded bg-white text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">2p</div>
                    <div>
                       <p className="text-xs font-bold text-emerald-900">Month End Close</p>
                       <p className="text-[10px] text-emerald-600 mt-0.5">Process execution block</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2"><Clock size={16} className="text-zinc-500"/> Recent Activity</h3>
                 <button className="text-xs font-bold text-indigo-600 hover:underline" onClick={() => onNavigate('activity-log')}>View All</button>
              </div>
              <div className="space-y-4">
                 {myRecentActivity.map(act => (
                    <div key={act.id} className="flex gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 shrink-0" />
                       <div>
                          <p className="text-xs font-bold text-zinc-800">{act.documentReference}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{act.actionTaken}</p>
                          <p className="text-[10px] text-zinc-400 mt-1 font-bold">{new Date(act.timestamp).toLocaleTimeString()}</p>
                       </div>
                    </div>
                 ))}
                 {myRecentActivity.length === 0 && <p className="text-xs text-zinc-500">No recent activity.</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
