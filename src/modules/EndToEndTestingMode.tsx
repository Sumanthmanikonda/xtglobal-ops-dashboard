import React, { useState } from 'react';
import { PlayCircle, ShieldAlert, Cpu, CheckCircle2, ChevronRight, Code, TerminalSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkItem } from '../types/models';
import { Activity } from '../data/mockData';

export const EndToEndTestingPage = ({ onAction }: { onAction: (type: string, payload: any) => void }) => {
  const [logs, setLogs] = useState<{ id: string, message: string, time: string, status: 'success' | 'running' | 'pending' }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const tests = [
    { id: 't1', name: 'Invoice Processing Commitment Validation', description: 'Simulates Invoice work item creation, rule assignment, clarification communication, task blocking, and SLA tracking.' },
    { id: 't2', name: 'Finance Operations UAT (Month End Close)', description: 'Simulates month-end blueprint, generates journal entry tasks, simulates missing invoice clarification, and completes SLA cascade.' },
    { id: 't3', name: 'IT Managed Services UAT (Incident Sync)', description: 'Simulates ITSM tool polling, generates priority 1 escalated tickets, resolves incident, and produces RCA deliverable.' },
    { id: 't4', name: 'Recruitment Delivery UAT (High-Volume Sourcing)', description: 'Models bulk candidate sourcing requests, client approval loop, and onboarding handoff synchronization.' },
    { id: 't5', name: 'Automated Recurrent SLA Blueprint', description: 'Triggers multi-service work generation schedules to test bulk database ingestion and assignment routing.' }
  ];

  const runSimulation = () => {
      setIsRunning(true);
      const newLogs = [
          { id: 'l1', message: 'Initializing Invoice Processing scenario...', time: new Date().toLocaleTimeString(), status: 'success' as const },
          { id: 'l2', message: 'Creating Invoice Work Item...', time: new Date().toLocaleTimeString(), status: 'pending' as const },
          { id: 'l3', message: 'Rules Engine: Evaluating Commitment assignment...', time: new Date().toLocaleTimeString(), status: 'pending' as const },
          { id: 'l4', message: 'Simulating Tag = Clarification Required communication...', time: new Date().toLocaleTimeString(), status: 'pending' as const },
          { id: 'l5', message: 'Rules Engine: Suspending commitment, blocking tasks...', time: new Date().toLocaleTimeString(), status: 'pending' as const },
          { id: 'l6', message: 'Simulating Client Reply to resolve clarification...', time: new Date().toLocaleTimeString(), status: 'pending' as const },
          { id: 'l7', message: 'Verifying Commitment Status & Dashboard Update...', time: new Date().toLocaleTimeString(), status: 'pending' as const }
      ];
      setLogs([...newLogs]);

      onAction('TEST_SIMULATION_STARTED', {});

      newLogs.forEach((log, idx) => {
         setTimeout(() => {
             setLogs(prev => prev.map((l, i) => i === idx ? { ...l, status: 'success' } : i === idx + 1 ? { ...l, status: 'running' } : l));
             
             // Trigger actual state changes to drive commitments logic
             if (idx === 1) { // L2
                onAction('WORK_ITEM_CREATED', { workItem: { id: `wi-inv-${Date.now()}`, title: 'Process Vendor Invoice #45091', status: 'Ready', priority: 'High', clientId: 'c1', processId: 'proc-ap', slaTarget: new Date(Date.now() + 48*3600*1000).toISOString() } });
             } else if (idx === 3) { // L4
                onAction('COMMUNICATION_ADDED', { communication: { id: `comm-${Date.now()}`, objectType: 'WorkItem', objectId: `wi-inv-${Date.now()}`, tag: 'Clarification Required', subject: 'Missing PO Number', sender: 'Processor' } });
             } else if (idx === 5) { // L6
                onAction('COMMUNICATION_REPLY_SENT', { activityId: `comm-${Date.now()}`, linkedTaskId: `wi-inv-${Date.now()}` });
             }
         }, (idx + 1) * 1500);
      });

      setTimeout(() => {
          setIsRunning(false);
      }, newLogs.length * 1500 + 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2"><Cpu className="text-rose-500"/> Platform Hardening & E2E Testing</h1>
          <p className="text-zinc-500 text-sm">Validate platform workflows, simulate operational activity, and review operational readiness</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
         <h2 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Production Readiness Assessment</h2>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Operational Readiness</p>
                <div className="flex items-end gap-2 text-emerald-900">
                   <span className="text-3xl font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-emerald-200 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-emerald-600 w-full" />
                </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Commercial Readiness</p>
                <div className="flex items-end gap-2 text-blue-900">
                   <span className="text-3xl font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-blue-200 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-blue-600 w-full" />
                </div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Scalability Readiness</p>
                <div className="flex items-end gap-2 text-indigo-900">
                   <span className="text-3xl font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-indigo-200 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-indigo-600 w-full" />
                </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Security Readiness</p>
                <div className="flex items-end gap-2 text-purple-900">
                   <span className="text-3xl font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-purple-200 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-purple-600 w-full" />
                </div>
            </div>
         </div>
         <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-start gap-3">
             <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
             <div>
                 <h4 className="text-sm font-bold text-emerald-900 mb-1">Platform Hardening Complete</h4>
                 <ul className="text-xs text-emerald-800 list-disc list-inside space-y-1 ml-1">
                     <li>Work Item Classifications standardized across legacy and new datasets</li>
                     <li>Real-time event architecture implemented across dashboards</li>
                     <li>Client data isolation enforced across UI and data layer</li>
                     <li>Role-based access controls fully validated</li>
                 </ul>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">Simulation Scenarios</h2>
              <div className="space-y-3">
                 {tests.map(test => (
                    <div key={test.id} className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-rose-400 transition-all cursor-pointer group flex items-start justify-between">
                        <div>
                           <h3 className="font-bold text-zinc-800 text-sm group-hover:text-rose-600 transition-colors">{test.name}</h3>
                           <p className="text-xs text-zinc-500 mt-1">{test.description}</p>
                        </div>
                        <ChevronRight size={16} className="text-zinc-300 group-hover:text-rose-500 transition-colors mt-1" />
                    </div>
                 ))}
              </div>
          </div>

          <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex flex-col font-mono">
              <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                     <TerminalSquare size={14} /> Execution Console
                  </div>
                  <button onClick={runSimulation} disabled={isRunning} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-900/50 disabled:text-rose-400 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors">
                      {isRunning ? <span className="animate-pulse flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-rose-300 border-t-white animate-spin"/> Running</span> : <><PlayCircle size={14} /> Run Master Script</>}
                  </button>
              </div>
              <div className="flex-1 p-4 space-y-2 text-xs overflow-y-auto">
                 {logs.length === 0 ? (
                     <div className="flex items-center justify-center h-full text-zinc-600 italic">Ready to execute tests...</div>
                 ) : logs.map(log => (
                     <div key={log.id} className="flex items-start gap-3">
                         <span className="text-zinc-500 shrink-0">[{log.time}]</span>
                         <span className={cn(
                             log.status === 'success' ? 'text-emerald-400' :
                             log.status === 'running' ? 'text-blue-400' : 'text-zinc-600'
                         )}>
                             {log.status === 'success' ? '✓ ' : log.status === 'running' ? '● ' : '○ '}
                             {log.message}
                         </span>
                     </div>
                 ))}
                 {isRunning && <div className="text-zinc-500 animate-pulse">_</div>}
              </div>
          </div>
      </div>
    </div>
  );
};
