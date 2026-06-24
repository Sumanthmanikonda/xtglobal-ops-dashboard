import React, { useState } from 'react';
import { Database, Plus, Search, Layers, FileText, CheckCircle2, ChevronRight, Bookmark } from 'lucide-react';
import { cn } from '../lib/utils';
import { Service, Template } from '../types/models';
import { Rule } from '../data/mockData';

const BLUEPRINTS = [
  { id: 'bp-1', name: 'AP Foundation', category: 'Finance Operations', description: 'End-to-end Accounts Payable processing model with SLA governance and generic rules included.', stats: { templates: 12, rules: 4, sla: 2, scopes: 3 }, status: 'Published' },
  { id: 'bp-2', name: 'AR Foundation', category: 'Finance Operations', description: 'Accounts Receivable baseline model with dunning templates and reconciliation instructions.', stats: { templates: 8, rules: 3, sla: 2, scopes: 4 }, status: 'Published' },
  { id: 'bp-3', name: 'Month End Close', category: 'Finance Operations', description: 'Comprehensive MEC calendar blueprints, journal templates, and variance analysis models.', stats: { templates: 24, rules: 10, sla: 1, scopes: 12 }, status: 'Published' },
  { id: 'bp-4', name: 'L1/L2 IT Service Desk', category: 'IT Services', description: 'Ticketing queues, knowledge article structure, and predefined escalation matrices.', stats: { templates: 5, rules: 15, sla: 4, scopes: 2 }, status: 'Published' },
  { id: 'bp-5', name: 'Talent Acquisition (RPO)', category: 'HR Operations', description: 'Candidate screening templates, interview schedules, and requisition tracking blueprints.', stats: { templates: 9, rules: 2, sla: 3, scopes: 5 }, status: 'Draft' }
];

export const ServiceBlueprintLibraryPage = () => {
  const [search, setSearch] = useState('');
  const [selectedBp, setSelectedBp] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Service Blueprint Library</h1>
          <p className="text-zinc-500 text-sm">Master templates for rapid engagement generation and standardized deployment</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Create Blueprint
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="col-span-1 border-r border-zinc-200 pr-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input type="text" placeholder="Search blueprints..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
            </div>

            <div className="space-y-1">
               <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Categories</p>
               {['All Blueprints', 'Finance Operations', 'IT Services', 'HR Operations'].map(cat => (
                  <button key={cat} className="w-full text-left px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors">
                      {cat}
                  </button>
               ))}
            </div>
         </div>

         <div className="col-span-3">
             {selectedBp ? (
                 <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center gap-4">
                        <button onClick={() => setSelectedBp(null)} className="p-2 hover:bg-zinc-200 rounded-lg text-zinc-500 transition-colors">
                           <ChevronRight size={16} className="rotate-180" />
                        </button>
                        <div>
                           <h2 className="text-xl font-bold text-zinc-900">{BLUEPRINTS.find(b => b.id === selectedBp)?.name}</h2>
                           <p className="text-sm text-zinc-500">{BLUEPRINTS.find(b => b.id === selectedBp)?.category} Blueprint</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-zinc-700 mb-6">{BLUEPRINTS.find(b => b.id === selectedBp)?.description}</p>
                        
                        <h3 className="text-sm font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Blueprint Contents</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 border border-zinc-200 rounded-xl flex items-center justify-between">
                               <div className="flex items-center gap-3"><FileText className="text-indigo-500" size={20} /><span className="font-bold text-zinc-700">Templates</span></div>
                               <span className="text-lg font-bold text-zinc-900">{BLUEPRINTS.find(b => b.id === selectedBp)?.stats.templates}</span>
                            </div>
                            <div className="p-4 border border-zinc-200 rounded-xl flex items-center justify-between">
                               <div className="flex items-center gap-3"><Bookmark className="text-amber-500" size={20} /><span className="font-bold text-zinc-700">Rules & Logic</span></div>
                               <span className="text-lg font-bold text-zinc-900">{BLUEPRINTS.find(b => b.id === selectedBp)?.stats.rules}</span>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors">Preview Deployment</button>
                    </div>
                 </div>
             ) : (
                <div className="grid gap-4">
                  {BLUEPRINTS.map(bp => (
                     <div key={bp.id} onClick={() => setSelectedBp(bp.id)} className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-indigo-400 transition-all cursor-pointer group flex items-start justify-between">
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                               <h3 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">{bp.name}</h3>
                               {bp.status === 'Published' ? (
                                   <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider font-bold rounded">Live</span>
                               ) : (
                                   <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 text-[10px] uppercase tracking-wider font-bold rounded">Draft</span>
                               )}
                           </div>
                           <p className="text-sm text-zinc-500 mb-4 max-w-xl">{bp.description}</p>
                           <div className="flex gap-4">
                               <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400"><Layers size={14} /> {bp.stats.templates} Templates</div>
                               <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400"><Database size={14} /> {bp.stats.scopes} Scope Items</div>
                           </div>
                        </div>
                        <button className="text-zinc-300 group-hover:text-indigo-500 transition-colors">
                           <ChevronRight size={20} />
                        </button>
                     </div>
                  ))}
                </div>
             )}
         </div>
      </div>
    </div>
  );
};
