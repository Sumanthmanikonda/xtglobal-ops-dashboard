import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, Factory, Database, Users, Settings, PlayCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '../data/mockData';

export const ClientOnboardingWizard = ({ onComplete, onCancel, users }: { onComplete: (data: any) => void, onCancel: () => void, users: User[] }) => {
  const [step, setStep] = useState(1);
  const steps = [
    { id: 1, title: 'Client Profile', icon: Factory },
    { id: 2, title: 'Service Blueprint', icon: Database },
    { id: 3, title: 'Team Assignment', icon: Users },
    { id: 4, title: 'Ops Configuration', icon: Settings },
    { id: 5, title: 'Go-Live Review', icon: PlayCircle }
  ];

  const [formData, setFormData] = useState({
    clientName: '',
    industry: '',
    blueprint: '',
    deliveryManagerId: '',
    clientManagerId: ''
  });

  const handleNext = () => {
    if (step < steps.length) setStep(step + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-indigo-900 border-b border-indigo-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">New Client Onboarding</h2>
            <button onClick={onCancel} className="text-indigo-200 hover:text-white transition">Cancel</button>
        </div>

        <div className="flex bg-zinc-50 border-b border-zinc-200 overflow-x-auto">
            {steps.map(s => (
                <div key={s.id} className={cn("flex-1 min-w-[150px] p-4 flex flex-col items-center justify-center gap-2 border-b-2 transition-colors", step >= s.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-transparent')}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors", step >= s.id ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-500')}>
                        {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                    </div>
                    <span className={cn("text-xs font-bold uppercase tracking-wider", step >= s.id ? 'text-indigo-900' : 'text-zinc-500')}>{s.title}</span>
                </div>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white">
            {step === 1 && (
                <div className="max-w-xl mx-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-1">Client Information</h3>
                        <p className="text-sm text-zinc-500 mb-6">Enter the primary details for the new client.</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase block mb-2">Legal Entity Name</label>
                        <input type="text" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. Acme Corporation" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase block mb-2">Industry Sector</label>
                        <select className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                            <option value="">Select Industry...</option>
                            <option>Financial Services</option>
                            <option>Manufacturing</option>
                            <option>Healthcare</option>
                            <option>Technology</option>
                        </select>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-1">Service Blueprint Selection</h3>
                        <p className="text-sm text-zinc-500 mb-6">Choose a pre-configured template to deploy standard services, workflows, and scope items.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {['Finance Operations (F&A)', 'IT Service Desk', 'Payroll Processing', 'HR Onboarding'].map(bp => (
                             <div key={bp} onClick={() => setFormData({...formData, blueprint: bp})} className={cn("p-4 border-2 rounded-xl cursor-pointer transition-all", formData.blueprint === bp ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 hover:border-indigo-300')}>
                                <div className="flex justify-between items-start mb-2">
                                     <h4 className="font-bold text-zinc-900">{bp}</h4>
                                     {formData.blueprint === bp && <CheckCircle2 className="text-indigo-600" size={20}/>}
                                </div>
                                <p className="text-xs text-zinc-500">Includes core templates, SLA definitions, and reporting dashboards.</p>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="max-w-xl mx-auto space-y-6">
                     <div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-1">Team Assignment</h3>
                        <p className="text-sm text-zinc-500 mb-6">Assign the key stakeholders for this engagement.</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase block mb-2">Delivery Manager (Internal)</label>
                        <select className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-medium outline-none" value={formData.deliveryManagerId} onChange={e => setFormData({...formData, deliveryManagerId: e.target.value})}>
                            <option value="">Search internal managers...</option>
                            {users.filter(u => u.userType !== 'Client').map(u => <option key={u.id} value={u.id}>{u.name} - {u.role}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold tracking-wider text-zinc-500 uppercase block mb-2">Primary Client Contact</label>
                        <select className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-medium outline-none" value={formData.clientManagerId} onChange={e => setFormData({...formData, clientManagerId: e.target.value})}>
                            <option value="">Search client users...</option>
                            {users.filter(u => u.userType === 'Client').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            <option value="new">+ Create New Client User</option>
                        </select>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-1">Operational Configuration Deploy</h3>
                        <p className="text-sm text-zinc-500 mb-6">The system will generate the following artifacts based on your blueprint.</p>
                    </div>
                    <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200 space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-emerald-500"/>
                            <span className="text-sm font-medium text-zinc-700">Deploying 12 Process Templates</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-emerald-500"/>
                            <span className="text-sm font-medium text-zinc-700">Configuring 4 Standard SLA Rules</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-emerald-500"/>
                            <span className="text-sm font-medium text-zinc-700">Generating Scope Items & Milestones</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-emerald-500"/>
                            <span className="text-sm font-medium text-zinc-700">Setting up Knowledge Base skeleton</span>
                        </div>
                    </div>
                </div>
            )}

            {step === 5 && (
                <div className="max-w-xl mx-auto text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <PlayCircle size={40} className="text-indigo-600"/>
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900">Ready for Launch</h3>
                    <p className="text-zinc-500">The platform is ready to transition this client to active operational mode. All governance layers, delivery scopes, and control tower metrics will be initialized.</p>
                </div>
            )}
        </div>

        <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center">
            <button onClick={handleBack} className="px-6 py-2.5 font-bold text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors text-sm">
                {step === 1 ? 'Cancel Onboarding' : 'Back'}
            </button>
            <button onClick={handleNext} disabled={step === 1 && !formData.clientName} className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2">
                {step === steps.length ? 'Finalize & Go-Live' : 'Next Step'} <ChevronRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};
