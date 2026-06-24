import React, { useState } from 'react';
import { Mail, FileText, CheckCircle, Zap, Box, Brain, MessageSquare, ClipboardList, Target, X, Plus, AlertTriangle, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkItem } from '../types/models';
import { Rule, Activity } from '../data/mockData';

export const SmartCaptureModal = ({ isOpen, onClose, onAction, rules, activities }: { isOpen: boolean, onClose: () => void, onAction: (type: string, payload: any) => void, rules: Rule[], activities: Activity[] }) => {
  const [method, setMethod] = useState<'quick' | 'email' | 'bulk' | 'comm' | 'rule'>('email');
  const [emailContent, setEmailContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleEmailAnalyze = () => {
    setIsProcessing(true);
    setTimeout(() => {
       setIsProcessing(false);
       // Knowledge Assist Mode: Suggest Rules
       setSuggestions([
         { type: 'Rule', title: 'Invoice Approval Thresholds', match: '98%' },
         { type: 'Activity', title: 'Previous Clarification on INV-203', match: '85%' },
         { type: 'SOP', title: 'Standard Email Capture Protocol', match: '72%' }
       ]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                 <Zap size={20} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-zinc-900">Smart Capture Layer</h2>
               <p className="text-sm text-zinc-500">Rapid operational data entry & ingestion</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-zinc-100 bg-zinc-50 p-4 space-y-2 overflow-y-auto shrink-0">
             <button onClick={() => setMethod('email')} className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm", method === 'email' ? 'bg-white shadow-sm border border-zinc-200 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-100/50')}>
                <Mail size={16} /> Email Capture
             </button>
             <button onClick={() => setMethod('quick')} className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm", method === 'quick' ? 'bg-white shadow-sm border border-zinc-200 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-100/50')}>
                <Zap size={16} /> Quick Work Item
             </button>
             <button onClick={() => setMethod('bulk')} className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm", method === 'bulk' ? 'bg-white shadow-sm border border-zinc-200 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-100/50')}>
                <Box size={16} /> Bulk Entry
             </button>
             <button onClick={() => setMethod('comm')} className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm", method === 'comm' ? 'bg-white shadow-sm border border-zinc-200 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-100/50')}>
                <MessageSquare size={16} /> Communication Capture
             </button>
             <button onClick={() => setMethod('rule')} className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm", method === 'rule' ? 'bg-white shadow-sm border border-zinc-200 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-100/50')}>
                <Brain size={16} /> Rule Capture
             </button>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-white">
             {method === 'email' && (
                <div className="space-y-6">
                   <div>
                     <h3 className="text-sm font-bold text-zinc-900 mb-2">Paste Content or Upload Email File</h3>
                     <textarea 
                       className="w-full h-40 border border-zinc-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                       placeholder="Paste email thread here..."
                       value={emailContent}
                       onChange={e => setEmailContent(e.target.value)}
                     />
                   </div>
                   <div className="flex gap-2">
                     <button onClick={handleEmailAnalyze} disabled={!emailContent || isProcessing} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-2">
                        {isProcessing ? 'Analyzing...' : <><Brain size={16} /> Analyze Content</>}
                     </button>
                     <button className="px-6 py-2 bg-zinc-100 text-zinc-700 font-bold rounded-lg hover:bg-zinc-200 transition">Upload EML/MSG</button>
                   </div>

                   {suggestions.length > 0 && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2"><Target size={16} className="text-indigo-500"/> Knowledge Assist & Context</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                           {suggestions.map((s, i) => (
                             <div key={i} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                               <div className="flex justify-between items-start mb-1">
                                 <span className="text-[10px] font-bold text-zinc-500 uppercase">{s.type}</span>
                                 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">{s.match} Match</span>
                               </div>
                               <p className="text-xs font-bold text-zinc-900">{s.title}</p>
                             </div>
                           ))}
                        </div>

                        <h3 className="text-sm font-bold text-zinc-900 mb-4">Convert to Operation</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <button onClick={() => { onAction('WORK_ITEM_CREATED', { workItem: { id: `wi-${Date.now()}` }}); onClose(); }} className="p-4 border border-zinc-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition text-center group">
                             <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <ClipboardList size={18} />
                             </div>
                             <p className="text-xs font-bold text-zinc-900">Work Item</p>
                           </button>
                           <button onClick={() => { onAction('ACTIVITY_CREATED', { activity: { id: `act-${Date.now()}`, tag: 'Clarification Required', documentReference: 'Email Ref', actionTaken: 'Pending Reply' }}); onClose(); }} className="p-4 border border-zinc-200 rounded-xl hover:border-amber-500 hover:shadow-md transition text-center group">
                             <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <MessageSquare size={18} />
                             </div>
                             <p className="text-xs font-bold text-zinc-900">Clarification</p>
                           </button>
                           <button className="p-4 border border-zinc-200 rounded-xl hover:border-rose-500 hover:shadow-md transition text-center group">
                             <div className="w-10 h-10 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <AlertTriangle size={18} />
                             </div>
                             <p className="text-xs font-bold text-zinc-900">Escalation</p>
                           </button>
                           <button className="p-4 border border-zinc-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition text-center group">
                             <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <BookOpen size={18} />
                             </div>
                             <p className="text-xs font-bold text-zinc-900">Knowledge Item</p>
                           </button>
                        </div>
                     </div>
                   )}
                </div>
             )}
             
             {method !== 'email' && (
               <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                     <Zap size={24} className="text-zinc-400" />
                  </div>
                  <p className="text-sm font-bold text-zinc-600">Select an input method</p>
                  <p className="text-xs mt-2 max-w-xs leading-relaxed">Rapidly convert raw inputs into structured operational primitives.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
