import React, { useState } from 'react';
import { Copy, Plus, X, Search, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Client } from '../data/mockData';

export const BulkProcessingModal = ({ isOpen, onClose, onAction, clients }: { isOpen: boolean, onClose: () => void, onAction: (type: string, payload: any) => void, clients: Client[] }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [processType, setProcessType] = useState('Invoice Processing');
  
  const [counts, setCounts] = useState({ processed: 125, exception: 5, pending: 10 });
  const [batchId, setBatchId] = useState(`BATCH-${Date.now().toString().slice(-6)}`);

  const handleSubmit = () => {
    onAction('ACTIVITY_CREATED', {
      activity: {
        id: `bulk-${Date.now()}`,
        clientId: selectedClient || clients[0]?.id || 'client-1',
        processType,
        reportingMode: 'Compound Reporting',
        documentReference: batchId,
        actionTaken: `Bulk Processing: ${counts.processed} Processed, ${counts.exception} Exceptions`,
        tag: counts.exception > 0 ? 'Exception' : 'General',
        metadata: {
           processedCount: counts.processed,
           exceptionCount: counts.exception,
           pendingCount: counts.pending
        }
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                 <Copy size={20} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-zinc-900">Bulk Processing Mode</h2>
               <p className="text-sm text-zinc-500">Accounting Operations & Throughput Capture</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Client Context</label>
               <select className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm font-bold text-zinc-900" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
             <div>
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Process Stream</label>
               <select className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm font-bold text-zinc-900" value={processType} onChange={e => setProcessType(e.target.value)}>
                  <option>Invoice Processing</option>
                  <option>Journal Entries</option>
                  <option>Expense Reports</option>
                  <option>Reconciliations</option>
               </select>
             </div>
           </div>

           <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Batch Identifier</label>
              <input type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm font-bold text-zinc-900" value={batchId} onChange={e => setBatchId(e.target.value)} />
           </div>

           <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-4">Throughput Registration</label>
              <div className="grid grid-cols-3 gap-6">
                 
                 <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 mb-2">
                       <CheckCircle2 size={14} className="text-emerald-500" /> Count Processed
                    </label>
                    <input type="number" min="0" value={counts.processed} onChange={e => setCounts({...counts, processed: parseInt(e.target.value)||0})} className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-3 text-xl font-bold text-zinc-900 shadow-sm" />
                 </div>

                 <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 mb-2">
                       <AlertTriangle size={14} className="text-amber-500" /> Count Exception
                    </label>
                    <input type="number" min="0" value={counts.exception} onChange={e => setCounts({...counts, exception: parseInt(e.target.value)||0})} className="w-full bg-white border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg p-3 text-xl font-bold text-zinc-900 shadow-sm" />
                 </div>

                 <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 mb-2">
                       <Clock size={14} className="text-zinc-400" /> Count Pending
                    </label>
                    <input type="number" min="0" value={counts.pending} onChange={e => setCounts({...counts, pending: parseInt(e.target.value)||0})} className="w-full bg-white border border-zinc-200 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 rounded-lg p-3 text-xl font-bold text-zinc-900 shadow-sm" />
                 </div>
              </div>

              {counts.exception > 0 && (
                 <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <p className="text-xs font-medium text-amber-800">You have registered {counts.exception} exceptions. Drill-down exception records will be available in the Exception Management Center.</p>
                 </div>
              )}
           </div>

           <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
             <button onClick={onClose} className="px-6 py-2.5 font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors text-sm">Cancel</button>
             <button onClick={handleSubmit} className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2">
               <Copy size={16} /> Register Bulk Volume
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
