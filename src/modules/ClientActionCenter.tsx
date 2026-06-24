import React, { useState } from 'react';
import { Clock, MessageSquare, CheckCircle2, FileText, Target, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkItem } from '../types/models';
import { Activity } from '../data/mockData';
import { User } from '../data/mockData';

export const ClientActionCenterPage = ({ workItems, activities, onNavigate }: { workItems: WorkItem[], activities: Activity[], onNavigate: (page: string, payload?: any) => void }) => {
  const [filter, setFilter] = useState<'All' | 'Clarifications' | 'Approvals' | 'Sign-Offs' | 'Documents'>('All');

  const actionItems = [
    ...workItems.filter(w => w.status === 'Awaiting Client').map(w => ({ id: w.id, type: 'Clarifications', title: w.title, age: 2, icon: MessageSquare, color: 'amber' })),
    ...workItems.filter(w => w.status === 'Awaiting Approval').map(w => ({ id: w.id, type: 'Approvals', title: w.title, age: 1, icon: CheckCircle2, color: 'emerald' })),
    ...activities.filter(a => a.tag === 'Clarification Required').map(a => ({ id: a.id, type: 'Clarifications', title: a.documentReference || a.batchName || 'Pending Clarification', age: 3, icon: MessageSquare, color: 'amber' }))
  ];

  const filtered = actionItems.filter(i => filter === 'All' || i.type === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Dashboard</h1>
          <p className="text-zinc-500 text-sm">Unified workspace for work progress, deliverables, and items requiring your attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-amber-500 transition-colors" onClick={() => setFilter('Clarifications')}>
             <div>
                <p className="text-xs font-bold text-zinc-500 uppercase">Pending Clarifications</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{actionItems.filter(a => a.type === 'Clarifications').length}</p>
             </div>
             <MessageSquare className="text-amber-200" size={32} />
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => setFilter('Approvals')}>
             <div>
                <p className="text-xs font-bold text-zinc-500 uppercase">Pending Approvals</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{actionItems.filter(a => a.type === 'Approvals').length}</p>
             </div>
             <CheckCircle2 className="text-emerald-200" size={32} />
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => setFilter('Sign-Offs')}>
             <div>
                <p className="text-xs font-bold text-zinc-500 uppercase">Pending Sign-Offs</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">0</p>
             </div>
             <Target className="text-indigo-200" size={32} />
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setFilter('Documents')}>
             <div>
                <p className="text-xs font-bold text-zinc-500 uppercase">Pending Documents</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">0</p>
             </div>
             <FileText className="text-blue-200" size={32} />
          </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden text-sm">
         <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-bold text-xs uppercase tracking-wider">
               <tr>
                  <th className="p-4">Action Required</th>
                  <th className="p-4">Context</th>
                  <th className="p-4">Time Waiting</th>
                  <th className="p-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-zinc-500 font-medium">You're all caught up! No pending actions in this category.</td>
                  </tr>
                ) : filtered.map((item, idx) => {
                   const Icon = item.icon;
                   const colorClass = item.color === 'amber' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
                   const badgeClass = item.color === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
                   return (
                     <tr key={item.id + idx} className="hover:bg-zinc-50 transition-colors group">
                        <td className="p-4">
                           <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                                 <Icon size={16} />
                              </div>
                              <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md", badgeClass)}>
                                 {item.type.slice(0, -1)}
                              </span>
                           </div>
                        </td>
                        <td className="p-4 font-bold text-zinc-900">{item.title}</td>
                        <td className="p-4 text-zinc-500 font-medium">{item.age} Days</td>
                        <td className="p-4 text-right">
                           <button className="px-3 py-1.5 bg-white border border-zinc-200 shadow-sm hover:border-indigo-500 text-zinc-700 hover:text-indigo-700 font-bold text-xs rounded transition-all" onClick={() => onNavigate('work-items')}>
                              Review & Action
                           </button>
                        </td>
                     </tr>
                   );
                })}
            </tbody>
         </table>
      </div>
    </div>
  );
};
