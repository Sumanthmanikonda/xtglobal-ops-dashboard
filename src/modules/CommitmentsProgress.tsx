import React, { useState } from 'react';
import { 
  Target, MessageSquare, Route, FileText, 
  Activity, ArrowUpRight, Search, Filter, 
  ChevronRight, Calendar as CalendarIcon,
  CheckCircle2, AlertTriangle, Clock, ListChecks,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CommitmentStat {
  title: string;
  count: number;
  label: string;
  icon: any;
  color: string;
}

export const CommitmentsProgressPage = ({ commitments = [], workItems = [], tasks = [], onAction }: any) => {
  const [activeTab, setActiveTab] = useState<'transaction' | 'communication' | 'milestone' | 'deliverable' | 'templates'>('milestone');
  const [isBuilderMode, setIsBuilderMode] = useState(false);

  const stats: CommitmentStat[] = [
    { title: 'Transaction Commitments', count: commitments.filter((c: any) => c.type === 'Transaction Commitment').length || 142, label: '94% SLA Compliance', icon: Activity, color: 'emerald' },
    { title: 'Communication SLA', count: 28, label: '2 Breached', icon: MessageSquare, color: 'amber' },
    { title: 'Active Milestones', count: 12, label: '3 At Risk', icon: Route, color: 'blue' },
    { title: 'Deliverables Due', count: 8, label: 'Next 7 Days', icon: FileText, color: 'indigo' },
  ];

  const milestones = [
    { id: 'm1', name: 'Month End Close - Global Finance', period: 'Oct 2026', progress: 78, daysLeft: 2, status: 'On Track' },
    { id: 'm2', name: 'Payroll Cycle - APAC', period: 'W4 Oct', progress: 45, daysLeft: 1, status: 'At Risk' },
    { id: 'm3', name: 'Financial Reporting Q3', period: 'Q3 2026', progress: 92, daysLeft: 4, status: 'On Track' },
    { id: 'm4', name: 'Year End Preparation', period: 'FY 2026', progress: 15, daysLeft: 45, status: 'On Track' }
  ];

  const currentMilestoneStages = [
    { name: 'Open PO Review', weight: 10, status: 'Complete' },
    { name: 'Accruals', weight: 20, status: 'Complete' },
    { name: 'Prepaids', weight: 15, status: 'In Progress' },
    { name: 'Reconciliations', weight: 25, status: 'In Progress' },
    { name: 'Internal Review', weight: 15, status: 'Not Started' },
    { name: 'Client Review', weight: 15, status: 'Not Started' }
  ];

  const deliverableItems = [
    { name: 'Q3 Financial Statements', due: 'Oct 15, 2026', owner: 'Sarah J.', status: 'Under Review' },
    { name: 'APAC Payroll Register', due: 'Oct 10, 2026', owner: 'Mike T.', status: 'Awaiting Client' },
    { name: 'Vendor Aging Report', due: 'Oct 12, 2026', owner: 'Anna K.', status: 'In Progress' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Commitments & Progress</h1>
          <p className="text-zinc-500 text-sm">Unified framework for transaction, communication, milestone, and deliverable commitments.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button>
          <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
            <Plus size={16} />
            New Commitment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-zinc-400" />
            </div>
            <h3 className="text-3xl font-bold text-zinc-900 mb-1">{stat.count}</h3>
            <p className="text-sm font-medium text-zinc-700 mb-1">{stat.title}</p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-zinc-200 px-2 flex gap-4">
          {['milestone', 'deliverable', 'transaction', 'communication', 'templates'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === tab 
                  ? "border-zinc-900 text-zinc-900" 
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'milestone' || tab === 'deliverable' || tab === 'transaction' || tab === 'communication' ? 'Progress' : ''}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'milestone' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search milestones..." 
                    className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                {milestones.map(m => (
                  <div key={m.id} className="p-4 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors cursor-pointer bg-zinc-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-zinc-900">{m.name}</h4>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        m.status === 'On Track' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      )}>{m.status}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">{m.period} • {m.daysLeft} days remaining</p>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", m.status === 'On Track' ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${m.progress}%` }} />
                      </div>
                      <span className="text-zinc-700 w-8">{m.progress}%</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => setIsBuilderMode(true)} className="w-full py-2 border border-dashed border-zinc-300 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-colors flex items-center justify-center gap-2 mt-4">
                  <Plus size={16} />
                  Create Milestone
                </button>
              </div>
              
              <div className="lg:col-span-2">
                {isBuilderMode ? (
                  <div className="border border-zinc-200 rounded-xl p-6 bg-white animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900">Milestone Builder</h3>
                        <p className="text-sm text-zinc-500">Configure stages, weights, and dependencies.</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setIsBuilderMode(false)} className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancel</button>
                        <button onClick={() => setIsBuilderMode(false)} className="px-3 py-1.5 text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors">Save Milestone</button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Milestone Name</label>
                           <input type="text" className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" placeholder="e.g. Month End Close" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Target Period</label>
                           <input type="month" className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Stages (Total Weight: 100%)</label>
                          <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"><Plus size={12}/> Add Stage</button>
                        </div>
                        <div className="border border-zinc-200 rounded-lg overflow-hidden divide-y divide-zinc-100">
                           <div className="bg-zinc-50 p-3 grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                              <div className="col-span-5">Stage Name</div>
                              <div className="col-span-2">Owner</div>
                              <div className="col-span-2">Target Date</div>
                              <div className="col-span-2">Weight %</div>
                              <div className="col-span-1"></div>
                           </div>
                           <div className="p-3 grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-5"><input type="text" className="w-full px-2 py-1 text-sm border border-zinc-200 rounded" defaultValue="Open PO Review" /></div>
                              <div className="col-span-2"><input type="text" className="w-full px-2 py-1 text-sm border border-zinc-200 rounded" defaultValue="AP Team" /></div>
                              <div className="col-span-2"><input type="date" className="w-full px-2 py-1 text-sm border border-zinc-200 rounded" /></div>
                              <div className="col-span-2"><input type="number" className="w-full px-2 py-1 text-sm border border-zinc-200 rounded" defaultValue="10" /></div>
                              <div className="col-span-1 text-right"><button className="text-zinc-400 hover:text-red-500">×</button></div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-zinc-200 rounded-xl p-6 bg-white">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">Month End Close - Global Finance</h3>
                      <p className="text-sm text-zinc-500">Period: Oct 2026 • Owner: Corporate Finance Team</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-light text-zinc-900">78%</div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mt-1">Complete</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Milestone Stages</h4>
                    <div className="border border-zinc-200 rounded-lg overflow-hidden">
                      {currentMilestoneStages.map((stage, idx) => (
                        <div key={idx} className={cn(
                          "px-4 py-3 flex items-center justify-between",
                          idx !== currentMilestoneStages.length - 1 && "border-b border-zinc-100",
                          stage.status === 'Complete' ? "bg-zinc-50/50" : "bg-white"
                        )}>
                          <div className="flex items-center gap-3">
                            {stage.status === 'Complete' ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : stage.status === 'In Progress' ? (
                              <Activity size={18} className="text-blue-500" />
                            ) : (
                              <div className="w-4.5 h-4.5 rounded-full border-2 border-zinc-200" />
                            )}
                            <div>
                              <p className={cn("text-sm font-medium", stage.status === 'Complete' ? "text-zinc-600" : "text-zinc-900")}>
                                {stage.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-zinc-400">Weight: {stage.weight}%</span>
                                {stage.status === 'In Progress' && (
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded font-medium">Active</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button className="text-zinc-400 hover:text-zinc-600">
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-2">
                      View Linked Work Items <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deliverable' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-zinc-900">Deliverable Tracking</h3>
              </div>
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3 font-medium text-zinc-600">Deliverable Name</th>
                      <th className="px-4 py-3 font-medium text-zinc-600">Owner</th>
                      <th className="px-4 py-3 font-medium text-zinc-600">Due Date</th>
                      <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {deliverableItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 font-medium text-zinc-900 flex items-center gap-2">
                          <FileText size={16} className="text-zinc-400" />
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{item.owner}</td>
                        <td className="px-4 py-3 text-zinc-600 flex items-center gap-1.5">
                          <CalendarIcon size={14} className="text-zinc-400" />
                          {item.due}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            item.status === 'Under Review' ? "bg-blue-100 text-blue-800" :
                            item.status === 'Awaiting Client' ? "bg-amber-100 text-amber-800" :
                            "bg-zinc-100 text-zinc-800"
                          )}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-emerald-600 hover:text-emerald-700 text-xs font-medium">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transaction' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-zinc-900">Transaction Commitments</h3>
              </div>
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3 font-medium text-zinc-600">Commitment ID</th>
                      <th className="px-4 py-3 font-medium text-zinc-600">Work Item</th>
                      <th className="px-4 py-3 font-medium text-zinc-600">Type</th>
                      <th className="px-4 py-3 font-medium text-zinc-600">SLA Target</th>
                      <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {commitments.filter((c: any) => c.type === 'Transaction Commitment').map((item: any) => (
                      <tr key={item.id} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 font-medium text-zinc-900">{item.id}</td>
                        <td className="px-4 py-3 text-zinc-600">{workItems.find((w: any) => w.id === item.workItemId)?.title || item.workItemId}</td>
                        <td className="px-4 py-3 text-zinc-600">{item.type}</td>
                        <td className="px-4 py-3 text-zinc-600">
                           {item.slaTarget ? new Date(item.slaTarget).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            item.status === 'Active' ? "bg-emerald-100 text-emerald-800" :
                            item.status === 'Paused' ? "bg-amber-100 text-amber-800" :
                            "bg-zinc-100 text-zinc-800"
                          )}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {commitments.filter((c: any) => c.type === 'Transaction Commitment').length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No transaction commitments assigned yet. Execute a workflow to generate them.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-zinc-900">Commitment Templates (Admin)</h3>
                <button className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded hover:bg-zinc-800 transition-colors">
                  Create Template
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Invoice Processing Commitment', type: 'Transaction', defaultSla: '48 Hours', autoAssign: 'Work Type = Invoice Processing' },
                  { name: 'Clarification Commitment', type: 'Communication', defaultSla: '24 Hours', autoAssign: 'Tag = Clarification Required' },
                  { name: 'Month End Close Milestone', type: 'Milestone', defaultSla: 'End of Month + 5 Days', autoAssign: 'Service = GL' },
                ].map((tpl, idx) => (
                  <div key={idx} className="p-4 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors bg-white shadow-sm">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-zinc-900">{tpl.name}</h4>
                        <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{tpl.type}</span>
                     </div>
                     <div className="space-y-1 text-xs text-zinc-600 mb-3">
                        <p><span className="font-medium text-zinc-800">SLA Baseline:</span> {tpl.defaultSla}</p>
                        <p><span className="font-medium text-zinc-800">Rule Trigger:</span> {tpl.autoAssign}</p>
                     </div>
                     <div className="flex gap-2 border-t border-zinc-100 pt-3">
                        <button className="text-xs text-zinc-500 hover:text-emerald-600 font-medium">Edit Rule</button>
                        <button className="text-xs text-zinc-500 hover:text-amber-600 font-medium ml-auto">Deactivate</button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'communication') && (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-sm">
              <ListChecks size={48} className="mb-4 text-zinc-300" strokeWidth={1} />
              <p>Module section under construction for {activeTab}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
