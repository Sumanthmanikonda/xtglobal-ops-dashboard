import React, { useState } from 'react';
import { WorkItem } from '../types/models';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, Plus, Filter, LayoutGrid, List } from 'lucide-react';
import { CLIENTS, USERS } from '../data/mockData';

export const CalendarModule = ({ workItems, onSelectWorkItem, onAction }: { workItems: WorkItem[], onSelectWorkItem: (id: string) => void, onAction: (type: string, payload: any) => void }) => {
  const [view, setView] = useState<'Month' | 'Week' | 'Day' | 'Client' | 'User'>('Month');
  const [filterClient, setFilterClient] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const itemsWithDueDates = workItems.filter(wi => wi.dueDate).map(wi => ({
     ...wi,
     dateObj: new Date(wi.dueDate!)
  }));

  const handleCreateEvent = () => {
    const newItem = {
      id: `wi-cal-${Date.now()}`,
      clientId: filterClient || CLIENTS[0].id,
      workItemType: 'Governance/Meeting',
      title: 'New Calendar Event',
      status: 'Open',
      priority: 'Medium',
      createdDate: new Date().toISOString(),
      dueDate: currentDate.toISOString(),
      createdBy: 'System Engine',
      tags: []
    };
    onAction('WORK_ITEM_CREATED', { workItem: newItem });
    // setTimeout(() => onSelectWorkItem(newItem.id), 100);
  };

  const shiftDate = (dir: 1 | -1) => {
    const newDate = new Date(currentDate);
    if (view === 'Month') newDate.setMonth(newDate.getMonth() + dir);
    if (view === 'Week') newDate.setDate(newDate.getDate() + (dir * 7));
    if (view === 'Day') newDate.setDate(newDate.getDate() + dir);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Build simple calendar grid
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const getColor = (type: string) => {
     switch(type) {
       case 'Finance': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
       case 'IT': return 'bg-blue-100 text-blue-800 border-blue-200';
       case 'Issue':
       case 'Escalation': return 'bg-rose-100 text-rose-800 border-rose-200';
       case 'Meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
       default: return 'bg-slate-100 text-slate-800 border-slate-200';
     }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="text-rose-600" />
            Calendar View
          </h2>
          <p className="text-slate-500">Track deadlines, SLA milestones, and recurring workload.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            {['Month', 'Week', 'Day', 'Client', 'User'].map(v => (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${view === v ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={handleCreateEvent} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition shadow-sm">
             <Plus size={16}/> Create Event
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[600px]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-800 text-lg w-48">
               {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => shiftDate(-1)} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition"><ChevronLeft size={20}/></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded transition">Today</button>
              <button onClick={() => shiftDate(1)} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition"><ChevronRight size={20}/></button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select 
                value={filterClient}
                onChange={e => setFilterClient(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white font-medium"
              >
                <option value="">All Clients</option>
                {CLIENTS.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        
        {view === 'Month' ? (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                 <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100 last:border-r-0">{d}</div>
               ))}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
               {padding.map(p => <div key={`pad-${p}`} className="border-r border-b border-slate-100 bg-slate-50/50" />)}
               {days.map(d => {
                 const currentDayStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString();
                 const dayItems = itemsWithDueDates.filter(wi => 
                    wi.dateObj.toDateString() === currentDayStr && 
                    (filterClient === '' || wi.clientId === filterClient)
                 );
                 return (
                   <div key={d} className="border-r border-b border-slate-100 p-2 relative group hover:bg-slate-50 transition min-h-[120px]">
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${currentDayStr === new Date().toDateString() ? 'bg-rose-600 text-white' : 'text-slate-500'}`}>
                         {d}
                      </span>
                      <div className="space-y-1 mt-1 max-h-[80px] overflow-y-auto no-scrollbar">
                         {dayItems.map(item => (
                           <div 
                             key={item.id} 
                             onClick={() => onSelectWorkItem(item.id)}
                             title={item.title}
                             className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer transition transform hover:scale-[1.02] ${getColor(item.tags?.includes('Escalation') || item.workItemType === 'Incident/Ticket' ? 'Escalation' : item.workItemType === 'Governance/Meeting' ? 'Meeting' : 'Finance')}`}
                           >
                              {item.title}
                           </div>
                         ))}
                      </div>
                   </div>
                 )
               })}
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center h-full text-slate-400">
             <List size={48} strokeWidth={1} className="mb-4" />
             <p className="font-semibold text-lg">{view} view layout</p>
             <p className="text-sm">Functionally implemented in main module, switch to Month view to see true scale orchestration.</p>
          </div>
        )}
      </div>
    </div>
  );
};
