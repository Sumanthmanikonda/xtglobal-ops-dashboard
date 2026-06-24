import React, { useState } from 'react';
import { WorkItem, AssignmentHistory } from '../types/models';
import { UserCheck, History, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { USERS } from '../data/mockData';

export const AssignmentEngine = ({ workItems, assignmentHistory, onAction }: { workItems: WorkItem[], assignmentHistory: AssignmentHistory[], onAction: (type: string, payload: any) => void }) => {
  const [sourceUser, setSourceUser] = useState<string>('');
  const [targetUser, setTargetUser] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('');

  const activeUsersWithWork = USERS.map(u => ({
     ...u,
     count: workItems.filter(wi => wi.primaryOwner === u.id && wi.status !== 'Completed').length
  })).sort((a, b) => b.count - a.count);

  const handleBulkTransfer = () => {
     if (!sourceUser || !targetUser) return alert('Select source and target users.');
     if (sourceUser === targetUser) return alert('Cannot transfer to the same user.');

     const itemsToTransfer = workItems.filter(wi => wi.primaryOwner === sourceUser && wi.status !== 'Completed');
     
     if (itemsToTransfer.length === 0) return alert('No active items to transfer for the source user.');
     if (!confirm(`Are you sure you want to transfer ${itemsToTransfer.length} active items to ${USERS.find(u => u.id === targetUser)?.name}?`)) return;

     itemsToTransfer.forEach(wi => {
        onAction('WORK_ITEM_UPDATED', {
           workItem: { ...wi, primaryOwner: targetUser, lastUpdatedBy: 'System Engine' }
        });
        onAction('ASSIGNMENT_LOGGED', {
           history: {
              id: `hist-${Date.now()}-${Math.random()}`,
              workItemId: wi.id,
              oldOwner: sourceUser,
              newOwner: targetUser,
              assignedBy: 'System Engine (Bulk)',
              assignedDate: new Date().toISOString(),
              comments: transferReason || 'Bulk Load Balancing Transfer'
           }
        });
     });

     alert('Bulk transfer complete.');
     setSourceUser('');
     setTargetUser('');
     setTransferReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="text-purple-600" />
            Assignment Center
          </h2>
          <p className="text-slate-500">Global ownership tracking and delegation control.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
             <div className="flex items-center gap-2">
               <RefreshCw className="text-purple-600" size={20}/>
               <h3 className="font-bold text-slate-800 text-lg">Bulk Delegation Router</h3>
             </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Source Owner (Transfer From)</label>
                 <select value={sourceUser} onChange={e => setSourceUser(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                    <option value="">Select User</option>
                    {activeUsersWithWork.filter(u => u.count > 0).map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.count} active items)</option>
                    ))}
                 </select>
               </div>
               <div className="flex justify-center text-slate-400">
                  <ArrowRight size={20} className="rotate-90 md:rotate-0" />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Owner (Transfer To)</label>
                 <select value={targetUser} onChange={e => setTargetUser(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                    <option value="">Select User</option>
                    {USERS.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Transfer Logic / Reason</label>
                 <input type="text" placeholder="e.g. OOO Coverage" value={transferReason} onChange={e => setTransferReason(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
               </div>
            </div>

            <button onClick={handleBulkTransfer} disabled={!sourceUser || !targetUser} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
              Execute Portfolio Transfer
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-4">
               <AlertCircle className="text-purple-600" size={16}/>
               <h4 className="font-bold text-slate-700 text-sm">Active Load Distribution</h4>
             </div>
             <div className="space-y-3">
               {activeUsersWithWork.slice(0, 5).map(user => {
                  if (user.count === 0) return null;
                  return (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-slate-700">{user.name}</span>
                          <span className="text-xs font-mono font-bold text-purple-600">{user.count} items</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, (user.count / 20) * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
               })}
             </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
             <History className="text-purple-600" size={20}/>
             <h3 className="font-bold text-slate-800 text-lg">Central Audit History</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px]">
             {assignmentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-8 opacity-50">
                  <UserCheck size={32} className="mb-2 text-slate-400"/>
                  <span className="text-sm font-medium text-slate-500 text-center">No assignments have been <br/>transferred globally.</span>
                </div>
             ) : (
               [...assignmentHistory].sort((a,b) => new Date(b.assignedDate).valueOf() - new Date(a.assignedDate).valueOf()).map(hist => (
                 <div key={hist.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-mono text-xs text-purple-600 font-bold">{hist.workItemId}</span>
                     <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">{new Date(hist.assignedDate).toLocaleString()}</span>
                   </div>
                   <div className="flex items-center gap-3 bg-white p-2 rounded border border-slate-100">
                      <div className="flex-1 text-center truncate">
                        <span className="text-xs text-slate-500 block mb-1">From</span>
                        <span className="text-sm font-semibold text-slate-700">{hist.oldOwner ? USERS.find(u => u.id === hist.oldOwner)?.name : 'Unassigned'}</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 shrink-0" />
                      <div className="flex-1 text-center truncate">
                        <span className="text-xs text-slate-500 block mb-1">To</span>
                        <span className="text-sm font-semibold text-slate-900">{USERS.find(u => u.id === hist.newOwner)?.name || 'Unknown'}</span>
                      </div>
                   </div>
                   {hist.comments && <p className="text-xs text-slate-500 italic mt-2 text-center">"{hist.comments}"</p>}
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
