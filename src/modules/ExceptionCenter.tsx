import React, { useState } from 'react';
import { AlertTriangle, Filter, CheckCircle2, Clock, Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkItem } from '../types/models';
import { Activity } from '../data/mockData';

export const ExceptionCenterPage = ({ workItems, activities, onNavigate }: { workItems: WorkItem[], activities: Activity[], onNavigate: (page: string, payload?: any) => void }) => {
  const [filter, setFilter] = useState<'All' | 'Blocked' | 'Clarification' | 'Awaiting Client' | 'Awaiting Approval' | 'Overdue'>('All');
  
  // Exception data mapping
  const exceptions = [
    ...workItems.filter(w => w.status === 'Escalated Level 1').map(w => ({ id: w.id, type: 'Overdue', title: w.title, ref: w.id, date: w.createdDate })),
    ...workItems.filter(w => w.status === 'Blocked').map(w => ({ id: w.id, type: 'Blocked', title: w.title, ref: w.id, date: w.createdDate })),
    ...workItems.filter(w => w.status === 'Awaiting Client').map(w => ({ id: w.id, type: 'Awaiting Client', title: w.title, ref: w.id, date: w.createdDate })),
    ...activities.filter(a => a.tag === 'Clarification Required').map(a => ({ id: a.id, type: 'Clarification', title: 'Clarification on ' + a.documentReference, ref: a.documentReference, date: a.timestamp })),
    { id: 'apprv-1', type: 'Awaiting Approval', title: 'AP Invoice Batch #204', ref: 'BATCH-204', date: new Date().toISOString() } // mock
  ];

  const filtered = exceptions.filter(e => filter === 'All' || e.type === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Exception Management Center</h1>
          <p className="text-zinc-500 text-sm">Dedicated queue for blocked work and operational exceptions</p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition shadow-sm">
              Bulk Reassign (0 Selected)
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm">
              Resolve Checked
            </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
         {['All', 'Blocked', 'Clarification', 'Awaiting Client', 'Awaiting Approval', 'Overdue'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f as any)}
              className={cn("px-4 py-2 text-sm font-bold rounded-full transition-colors", filter === f ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50')}
            >
              {f}
            </button>
         ))}
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-bold text-xs uppercase tracking-wider">
               <tr>
                  <th className="p-4 w-12"><input type="checkbox" className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" /></th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Exception Type</th>
                  <th className="p-4">Title / Context</th>
                  <th className="p-4">Age</th>
                  <th className="p-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
               {filtered.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="p-12 text-center text-zinc-500 font-medium">No exceptions found in this category.</td>
                 </tr>
               ) : filtered.map(e => (
                 <tr key={e.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4"><input type="checkbox" className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" /></td>
                    <td className="p-4 font-bold text-zinc-900">{e.ref}</td>
                    <td className="p-4">
                       <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md", 
                         e.type === 'Clarification' ? 'bg-amber-100 text-amber-800' :
                         e.type === 'Blocked' ? 'bg-rose-100 text-rose-800' :
                         e.type === 'Overdue' ? 'bg-rose-100 text-rose-800' :
                         e.type === 'Awaiting Approval' ? 'bg-blue-100 text-blue-800' :
                         'bg-zinc-100 text-zinc-800'
                       )}>
                         {e.type}
                       </span>
                    </td>
                    <td className="p-4 text-zinc-700 font-medium">{e.title}</td>
                    <td className="p-4 text-zinc-500 text-xs font-bold">{Math.max(1, Math.floor((Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24)))} Days</td>
                    <td className="p-4 text-right">
                       <button className="px-3 py-1.5 bg-white border border-zinc-200 shadow-sm hover:border-emerald-500 text-zinc-700 hover:text-emerald-700 font-bold text-xs rounded transition-all" onClick={() => onNavigate(e.type === 'Clarification' ? 'activity-log' : 'work-items')}>
                          Review
                       </button>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};
