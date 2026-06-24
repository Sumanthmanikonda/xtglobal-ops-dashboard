import React, { useState } from 'react';
import { Download, CalendarIcon, FileSpreadsheet, FileBarChart, Presentation, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkItem } from '../types/models';
import { Activity, Client } from '../data/mockData';

export const OperationalReviewPacksPage = ({ workItems, activities, clients }: { workItems: WorkItem[], activities: Activity[], clients: Client[] }) => {
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
     setIsGenerating(true);
     setTimeout(() => setIsGenerating(false), 2000);
  };

  const metrics = {
      completed: workItems.filter(w => w.status === 'Completed' || w.status === 'Closed').length,
      open: workItems.filter(w => w.status !== 'Completed' && w.status !== 'Closed').length,
      escalations: workItems.filter(w => w.status === 'Escalated Level 1' || w.status === 'Escalated Level 2').length,
      clarifications: workItems.filter(w => w.status === 'Awaiting Client').length,
      sla: '98.5%',
      scope: '82%',
      productivity: '114%',
      exceptions: activities.filter(a => a.tag === 'Exception').length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Operational Review Packs</h1>
          <p className="text-zinc-500 text-sm">Generate structured review formats with real-time operations data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 border border-zinc-200 rounded-xl p-5 bg-white space-y-6">
             <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Report Context</label>
                <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="all">Consolidated Portfolio</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>

             <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Review Frequency</label>
                <div className="space-y-2">
                    {[
                        { id: 'daily', name: 'Daily Operations Standup', icon: CalendarIcon },
                        { id: 'weekly', name: 'Weekly Delivery Review', icon: FileSpreadsheet },
                        { id: 'monthly', name: 'Monthly Client MBR', icon: Presentation }
                    ].map(type => (
                        <div key={type.id} onClick={() => setReportType(type.id as any)} className={cn("flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all", reportType === type.id ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 hover:border-indigo-200')}>
                           <type.icon size={18} className={reportType === type.id ? 'text-indigo-600' : 'text-zinc-400'} />
                           <span className={cn("text-sm font-bold", reportType === type.id ? 'text-indigo-900' : 'text-zinc-700')}>{type.name}</span>
                        </div>
                    ))}
                </div>
             </div>

             <div className="pt-4 border-t border-zinc-100">
                <button onClick={handleGenerate} disabled={isGenerating} className="w-full px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                    {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Download size={16} />} 
                    {isGenerating ? 'Compiling Data...' : 'Export Pack Format'}
                </button>
             </div>
         </div>

         <div className="lg:col-span-2">
             <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 h-full flex flex-col">
                  {isGenerating ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                          <p className="font-medium animate-pulse">Aggregating SLA and Productivity Metrics...</p>
                      </div>
                  ) : (
                      <>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900">{reportType === 'daily' ? 'Daily Standup' : reportType === 'weekly' ? 'Weekly Review' : 'Monthly Business Review'} Data Preview</h2>
                                <p className="text-sm text-zinc-500">As of today • {selectedClient === 'all' ? 'All Clients' : clients.find(c => c.id === selectedClient)?.name}</p>
                            </div>
                            <FileBarChart size={32} className="text-zinc-300" />
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-zinc-200">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Work Completed</p>
                                <p className="text-2xl font-bold text-zinc-900">{metrics.completed}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-zinc-200">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Pending Client (Clarif.)</p>
                                <p className="text-2xl font-bold text-amber-600">{metrics.clarifications}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-zinc-200">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Active Escalations</p>
                                <p className="text-2xl font-bold text-rose-600">{metrics.escalations}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-zinc-200">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">SLA Compliance</p>
                                <p className="text-2xl font-bold text-emerald-600">{metrics.sla}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-zinc-200">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Scope Completion</p>
                                <p className="text-2xl font-bold text-indigo-600">{metrics.scope}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-zinc-200">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Internal Productivity</p>
                                <p className="text-2xl font-bold text-zinc-900">{metrics.productivity}</p>
                            </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-4 mt-auto">
                            <CheckCircle2 className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-indigo-900 mb-1">Export Ready Components</h4>
                                <p className="text-xs text-indigo-700 leading-relaxed">The download will include an executive summary slide, detailed operational metric breakdown, aged clarification registers, and process exception logs suitable for direct client sharing.</p>
                            </div>
                        </div>
                      </>
                  )}
             </div>
         </div>
      </div>
    </div>
  );
};
