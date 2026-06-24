import React from 'react';
import { Shield, ChevronRight, ActivityIcon, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { Engagement, ScopeItem, WorkItem } from '../types/models';
import { Client, User } from '../data/mockData';

export const DeliveryControlTowerPage = ({ 
  engagements, 
  clients, 
  scopeItems, 
  workItems, 
  users, 
  onNavigate 
}: { 
  engagements: Engagement[], 
  clients: Client[], 
  scopeItems: ScopeItem[], 
  workItems: WorkItem[], 
  users: User[],
  onNavigate: (page: string, payload?: any) => void 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Delivery Control Tower</h1>
          <p className="text-zinc-500 text-sm">Central command for engagement performance and service delivery</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-bold text-[10px] uppercase tracking-wider">
            <tr>
              <th className="p-4">Client</th>
              <th className="p-4">Engagement</th>
              <th className="p-4 text-center">Health</th>
              <th className="p-4 text-center">Open Work</th>
              <th className="p-4 text-center">Pending Clarifications</th>
              <th className="p-4 text-center">Escalations</th>
              <th className="p-4 text-center">Scope Completion</th>
              <th className="p-4">Manager</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {engagements.map(eng => {
               const client = clients.find(c => c.id === eng.clientId);
               const engScope = scopeItems.filter(s => s.engagementId === eng.id);
               const totalScope = engScope.length;
               const completedScope = engScope.filter(s => s.status === 'Completed' || s.status === 'Signed Off').length;
               const scopePercent = totalScope === 0 ? 0 : Math.round((completedScope / totalScope) * 100);
               
               const engWorkItems = workItems.filter(w => w.engagementId === eng.id || w.clientId === eng.clientId); // Approximation for mock data
               const openWork = engWorkItems.filter(w => w.status !== 'Completed' && w.status !== 'Closed' && w.status !== 'Cancelled').length;
               const escalations = engWorkItems.filter(w => w.status === 'Escalated Level 1' || w.status === 'Escalated Level 2').length;
               const clarifications = engWorkItems.filter(w => w.status === 'Awaiting Client').length; // Or Awaiting Info

               const manager = users.find(u => u.id === eng.deliveryManagerId)?.name;

               let health = 'Green';
               if (escalations > 0 || (openWork > 50 && clarifications > 10)) health = 'Red';
               else if (clarifications > 5 || openWork > 20) health = 'Amber';

               return (
                 <tr key={eng.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4 font-bold text-zinc-900">{client?.name}</td>
                    <td className="p-4 font-bold text-indigo-700">{eng.name}</td>
                    <td className="p-4 text-center">
                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                            health === 'Green' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            health === 'Amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                        )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full",
                                health === 'Green' ? 'bg-emerald-500' :
                                health === 'Amber' ? 'bg-amber-500' :
                                'bg-rose-500'
                            )} />
                            {health}
                        </span>
                    </td>
                    <td className="p-4 text-center font-bold text-zinc-700">{openWork}</td>
                    <td className="p-4 text-center font-bold text-amber-600">{clarifications}</td>
                    <td className="p-4 text-center font-bold text-rose-600">{escalations}</td>
                    <td className="p-4">
                       <div className="flex items-center gap-2">
                           <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scopePercent}%` }} />
                           </div>
                           <span className="text-[10px] font-bold text-zinc-600">{scopePercent}%</span>
                       </div>
                    </td>
                    <td className="p-4 text-zinc-600 font-medium">{manager}</td>
                    <td className="p-4">
                       <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md", 
                         eng.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                       )}>
                         {eng.status}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                       <button className="px-3 py-1.5 bg-white border border-zinc-200 shadow-sm hover:border-indigo-500 text-zinc-700 hover:text-indigo-700 font-bold text-xs rounded transition-all" onClick={() => onNavigate('scope-detail')}>
                          Manage
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
