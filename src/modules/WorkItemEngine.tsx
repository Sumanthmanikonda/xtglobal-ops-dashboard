import React, { useState } from 'react';
import { WorkItem, Service, Template, AssignmentHistory } from '../types/models';
import { Communication, User } from '../data/mockData';
import { Users, FileText, Activity as ActivityIcon, Clock, Link as LinkIcon, Paperclip, MessageSquare, Send } from 'lucide-react';
import { USERS, CLIENTS } from '../data/mockData';

export const WorkItemList = ({ workItems, onSelect, onAction }: { workItems: WorkItem[], onSelect: (id: string) => void, onAction: (type: string, payload: any) => void }) => {
  const [filter, setFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkItem>>({
    clientId: CLIENTS[0].id,
    workItemType: 'Standard Transaction',
    title: '',
    description: '',
    status: 'New',
    priority: 'Medium',
    createdDate: new Date().toISOString(),
  });

  const filtered = workItems.filter(wi => wi.title.toLowerCase().includes(filter.toLowerCase()) || wi.workItemType.toLowerCase().includes(filter.toLowerCase()));

  const handleCreateNew = () => {
     if(!formData.title) return;
     const newItem = {
        ...formData,
        id: `wi-${Date.now()}`,
        createdBy: 'User',
        tags: []
     } as WorkItem;
     onAction('WORK_ITEM_CREATED', { workItem: newItem });
     setIsCreateModalOpen(false);
     setTimeout(() => onSelect(newItem.id), 100);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Work Management
          </h2>
          <p className="text-slate-500">Universal distributed operational record management.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search work items..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-64 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm">
            Create Work Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col relative">
        <div className="overflow-y-auto flex-1 absolute inset-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Work Item ID</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Title</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Client</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Primary Owner</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.slice(0, 100).map(wi => (
              <tr key={wi.id} onClick={() => onSelect(wi.id)} className="hover:bg-blue-50/50 cursor-pointer transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{wi.id}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded">
                    {wi.workItemType}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{wi.title}</td>
                <td className="px-6 py-4 text-slate-600">{CLIENTS.find(c => c.id === wi.clientId)?.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    wi.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    wi.status === 'Blocked' ? 'bg-rose-100 text-rose-700' :
                    wi.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {wi.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold uppercase">
                     {USERS.find(u => u.id === wi.primaryOwner)?.name?.charAt(0) || '?'}
                  </div>
                  {USERS.find(u => u.id === wi.primaryOwner)?.name || 'Unassigned'}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {wi.dueDate ? new Date(wi.dueDate).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Create Work Item</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">✕</button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows={3}></textarea>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Client</label>
                    <select value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                       {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                    <select value={formData.workItemType} onChange={e => setFormData({...formData, workItemType: e.target.value as any})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                       <option>Standard Transaction</option>
                       <option>Exception Processing</option>
                       <option>Audit/Review</option>
                       <option>Approval Request</option>
                       <option>Client Clarification</option>
                       <option>Rule Management</option>
                       <option>Master Data Management</option>
                       <option>Governance/Meeting</option>
                       <option>Incident/Ticket</option>
                       <option>Deliverable</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                       <option>Low</option>
                       <option>Medium</option>
                       <option>High</option>
                       <option>Critical</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
                    <input type="date" value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, dueDate: new Date(e.target.value).toISOString()})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
               </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
               <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition">Cancel</button>
               <button onClick={handleCreateNew} disabled={!formData.title} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50">Create Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WorkItemDetail = ({ item, onBack, onAction, communications = [], assignmentHistory = [], currentUser }: { item: WorkItem, onBack: () => void, onAction: (type: string, payload: any) => void, communications?: Communication[], assignmentHistory?: AssignmentHistory[], currentUser?: User }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkItem>>({ ...item });
  const [newMessage, setNewMessage] = useState('');
  const [messageTag, setMessageTag] = useState<any>('General Communication');

  const getAllowedTransitions = (current: string): string[] => {
    switch (current) {
      case 'Draft': return ['New', 'Cancelled'];
      case 'New': return ['Assigned', 'Cancelled'];
      case 'Assigned': return ['In Progress', 'Blocked', 'On Hold', 'Cancelled'];
      case 'In Progress': return ['Awaiting Information', 'Awaiting Client', 'Awaiting Approval', 'Under Review', 'Blocked', 'Completed', 'Cancelled'];
      case 'Awaiting Information': return ['In Progress', 'Escalated Level 1'];
      case 'Awaiting Client': return ['In Progress', 'Escalated Level 1'];
      case 'Awaiting Approval': return ['In Progress', 'Approved', 'Escalated Level 1'];
      case 'Under Review': return ['In Progress', 'Completed'];
      case 'On Hold': return ['Draft', 'Cancelled'];
      case 'Blocked': return ['Escalated Level 1', 'In Progress'];
      case 'Escalated Level 1': return ['Escalated Level 2', 'Resolved', 'In Progress'];
      case 'Escalated Level 2': return ['Resolved', 'Closed'];
      case 'Resolved': return ['In Progress', 'Completed'];
      case 'Completed': return ['Closed'];
      case 'Cancelled': return ['Closed'];
      case 'Closed': return [];
      default: return ['In Progress', 'Completed', 'Escalated Level 1'];
    }
  };

  const handleSave = () => {
    onAction('WORK_ITEM_UPDATED', { workItem: { ...item, ...formData, lastUpdatedBy: 'System Engine' } });
    setIsEditing(false);
  };

  const handleSendMessage = () => {
     if(!newMessage.trim()) return;
     onAction('COMMUNICATION_ADDED', {
        communication: {
          id: `msg-${Date.now()}`,
          objectType: 'WorkItem',
          objectId: item.id,
          sender: currentUser?.name || 'User',
          message: newMessage,
          timestamp: new Date().toISOString(),
          priority: 'Medium',
          tag: messageTag
        }
     });
     setNewMessage('');
  };

  const handleDelete = () => {
    if (confirm('Are you certain you want to archive this Work Item?')) {
       onAction('WORK_ITEM_DELETED', { id: item.id });
       onBack();
    }
  };

  const timelineItems: { type: string, timestamp: number, desc: string, actor?: string, tag?: string }[] = [
     { type: 'created', timestamp: new Date(item.createdDate).getTime(), desc: 'Item Orchestrated', actor: item.createdBy },
     ...assignmentHistory.filter(h => h.workItemId === item.id).map(h => ({
        type: 'assignment', timestamp: new Date(h.assignedDate).getTime(), desc: `Assigned to ${USERS.find(u => u.id === h.newOwner)?.name || 'Unassigned'}`, actor: h.assignedBy || 'System'
     })),
     ...communications.filter(c => c.objectId === item.id).map(c => ({
        type: 'communication', timestamp: new Date(c.timestamp).getTime(), desc: c.message, tag: c.tag, actor: c.sender
     }))
  ].sort((a,b) => b.timestamp - a.timestamp);

  const getTagStyle = (tag: string) => {
    switch(tag) {
      case 'Escalation': return 'bg-rose-100 text-rose-700';
      case 'Approval Request': return 'bg-purple-100 text-purple-700';
      case 'Exception': return 'bg-orange-100 text-orange-700';
      case 'Decision': return 'bg-emerald-100 text-emerald-700';
      case 'Clarification Required': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const renderMessage = (text: string) => {
    const parts = text.split(/(\[[A-Za-z0-9-]+\])/g);
    return parts.map((part, i) => {
       if (part.startsWith('[') && part.endsWith(']')) {
          const id = part.slice(1, -1);
          let type = 'WorkItem';
          if (id.startsWith('srv-')) type = 'Service';
          else if (id.startsWith('tpl-')) type = 'Template';
          else if (id.startsWith('r-')) type = 'Rule';
          else if (id.startsWith('act-')) type = 'Activity';
          return <span key={i} onClick={() => onAction('GLOBAL_SEARCH_SELECT', { type, id })} className="text-blue-600 hover:underline cursor-pointer font-medium">{part}</span>;
       }
       return part;
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
             ← Back
           </button>
           <div>
             <div className="flex items-center gap-2 mb-1">
               <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded">{item.workItemType}</span>
               <span className="text-xs font-mono text-slate-500">{item.id}</span>
             </div>
             {isEditing ? (
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="px-2 py-1 text-2xl font-bold bg-white border border-slate-300 rounded outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-[400px]"
                />
             ) : (
                <h2 className="text-2xl font-bold text-slate-900">{item.title}</h2>
             )}
           </div>
        </div>
        <div className="flex items-center gap-3">
           {!isEditing ? (
              <>
                 <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition">Edit</button>
                 <button onClick={handleDelete} className="px-4 py-2 bg-rose-50 text-rose-600 font-semibold rounded-lg hover:bg-rose-100 transition">Archive</button>
                 <select 
                   value={item.status} 
                   onChange={(e) => onAction('WORK_ITEM_UPDATED', { workItem: { ...item, status: e.target.value }})}
                   className="pl-3 pr-8 py-2 bg-slate-800 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                 >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Blocked</option>
                    <option>Under Review</option>
                    <option>Completed</option>
                 </select>
              </>
           ) : (
              <>
                 <button onClick={() => { setIsEditing(false); setFormData({...item}); }} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition">Cancel</button>
                 <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm">Save Changes</button>
              </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={18} /> Overview</h3>
            {isEditing ? (
               <textarea 
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                  rows={4}
               />
            ) : (
               <p className="text-slate-600 mb-6">{item.description || 'No detailed description provided.'}</p>
            )}
            
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                {isEditing ? (
                   <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="px-2 py-1 border border-slate-300 rounded text-sm w-full">
                       <option value={item.status}>{item.status}</option>
                       {getAllowedTransitions(item.status).map(status => (
                         <option key={status} value={status}>{status}</option>
                       ))}
                   </select>
                ) : (
                   <p className="font-medium text-slate-900">{item.status}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority</p>
                {isEditing ? (
                   <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="px-2 py-1 border border-slate-300 rounded text-sm w-full">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                   </select>
                ) : (
                   <p className="font-medium text-slate-900">{item.priority}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Due Date</p>
                {isEditing ? (
                   <input type="datetime-local" value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''} onChange={e => setFormData({...formData, dueDate: new Date(e.target.value).toISOString()})} className="px-2 py-1 border border-slate-300 rounded text-sm w-full"/>
                ) : (
                   <p className="font-mono text-sm text-slate-900">{item.dueDate ? new Date(item.dueDate).toLocaleString() : 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={16} /> Assignment Engine</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Payload Owner</p>
                {isEditing ? (
                    <select value={formData.primaryOwner || ''} onChange={e => setFormData({...formData, primaryOwner: e.target.value})} className="w-full px-3 py-2 border border-blue-200 rounded-lg outline-none mb-2 focus:ring-2 focus:ring-blue-500">
                        <option value="">Unassigned</option>
                        {USERS.map(u => <option key={u.id} value={u.id}>{u.name} - {u.role}</option>)}
                    </select>
                ) : (
                   <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                     <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                       {USERS.find(u => u.id === item.primaryOwner)?.name?.charAt(0) || '?'}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-blue-900">{USERS.find(u => u.id === item.primaryOwner)?.name || 'Unassigned'}</p>
                       <p className="text-xs text-blue-600">Active Controller</p>
                     </div>
                   </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><LinkIcon size={18} /> Dependencies & Relationships</h3>
            <p className="text-sm text-slate-500 italic">No upstream or downstream blockages detected.</p>
          </div>
        </div>

        <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 h-full overflow-hidden">
           <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between z-10 shrink-0">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={16} className="text-blue-600"/> Collaboration Hub</h3>
             <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{timelineItems.length} Events</span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
             <div className="absolute top-0 bottom-0 left-8 w-px bg-slate-200 z-0"></div>
             {timelineItems.map((ti, i) => (
                <div key={i} className="relative z-10 flex gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">
                    {ti.actor ? ti.actor.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 min-w-0 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-slate-800 text-sm truncate">{ti.actor || 'System'}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{new Date(ti.timestamp).toLocaleString()}</span>
                    </div>
                    {ti.tag && (
                       <span className={`inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded mb-1.5 ${getTagStyle(ti.tag)}`}>{ti.tag}</span>
                    )}
                    <p className="text-sm text-slate-600 break-words">{renderMessage(ti.desc)}</p>
                  </div>
                </div>
             ))}
           </div>
           
           <div className="p-4 bg-white border-t border-slate-200 shrink-0">
             <div className="flex flex-col gap-2">
                <select value={messageTag} onChange={e => setMessageTag(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 text-slate-600 font-semibold bg-slate-50">
                  <option>General Communication</option>
                  <option>Clarification Required</option>
                  <option>Decision</option>
                  <option>Approval Request</option>
                  <option>Exception</option>
                  <option>Escalation</option>
                  <option>Follow Up</option>
                  <option>Rule Update</option>
                  <option>Knowledge Note</option>
                </select>
                <div className="relative">
                   <textarea 
                     value={newMessage} 
                     onChange={e => setNewMessage(e.target.value)}
                     placeholder="Type a message or an update..."
                     className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                     rows={3}
                     onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                   />
                   <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="absolute right-2 bottom-3 p-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition disabled:opacity-50">
                     <Send size={14} />
                   </button>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
