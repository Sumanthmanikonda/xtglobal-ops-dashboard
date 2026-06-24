import React, { useState } from 'react';
import { Template, Service } from '../types/models';
import { Copy, Plus, Filter, PlayCircle, Settings2, Trash2, Edit2, X, FilePlus, Calendar as CalendarIcon, Clock, Users, ActivityIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export const TemplateEngine = ({ templates, services, onAction }: { templates: Template[], services: Service[], onAction: (type: string, payload: any) => void }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [activeView, setActiveView] = useState<'Templates' | 'Schedules'>('Templates');

  const [formData, setFormData] = useState<Partial<Template>>({
    templateName: '',
    serviceId: services[0]?.id || '',
    businessUnit: services[0]?.businessUnit || 'Finance & Accounting',
    frequency: 'Monthly',
    defaultOwnerRole: 'Internal Manager',
    status: 'Active',
    workItems: []
  });

  const schedules = [
    { id: 'sch-1', template: 'Month End Close Template', service: 'Accounting', client: 'Globex Corp', frequency: 'Monthly', nextRun: '2026-06-30', lastRun: '2026-05-31', status: 'Active' },
    { id: 'sch-2', template: 'Payroll Run - Bi-weekly', service: 'Payroll Services', client: 'Initech', frequency: 'Weekly', nextRun: '2026-06-19', lastRun: '2026-06-05', status: 'Active' },
    { id: 'sch-3', template: 'Daily Recs', service: 'Accounting', client: 'Stark Ind', frequency: 'Daily', nextRun: '2026-06-18', lastRun: '2026-06-17', status: 'Paused' }
  ];

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      templateName: '',
      serviceId: services[0]?.id || '',
      businessUnit: services[0]?.businessUnit || 'Finance & Accounting',
      frequency: 'Monthly',
      defaultOwnerRole: 'Internal Manager',
      status: 'Active',
      workItems: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData(template);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.templateName) return;
    
    if (editingTemplate) {
      onAction('TEMPLATE_UPDATED', { template: { ...editingTemplate, ...formData } });
    } else {
      onAction('TEMPLATE_CREATED', { template: { ...formData, id: `tpl-${Date.now()}` } });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to deactivate and delete this template?')) {
      onAction('TEMPLATE_DELETED', { id });
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
    }
  };

  const handleClone = (tpl: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    onAction('TEMPLATE_CREATED', { template: { ...tpl, id: `tpl-${Date.now()}`, templateName: `${tpl.templateName} (Copy)` } });
  };

  const handleInstantiate = (tpl: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Instantiate ${tpl.workItems.length} work items from this template?`)) {
       tpl.workItems.forEach((wi, index) => {
         onAction('WORK_ITEM_CREATED', {
           workItem: {
             id: `wi-inst-${Date.now()}-${index}`,
             clientId: 'c1',
             serviceId: tpl.serviceId,
             workItemType: wi.workItemType,
             title: wi.title,
             description: wi.description,
             status: 'Open',
             priority: 'Medium',
             createdDate: new Date().toISOString(),
             createdBy: 'System Engine',
             tags: []
           }
         });
       });
       alert('Template instantiated successfully.');
    }
  };

  const handleAddWorkItem = () => {
     const newWi = { workItemType: 'Standard Transaction', title: 'New Blueprint Task', description: 'Description' };
     const updated = [...(formData.workItems || []), newWi];
     setFormData({...formData, workItems: updated});
  };

  if (selectedTemplate) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setSelectedTemplate(null)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition">
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">{selectedTemplate.templateName}</h2>
            <p className="text-zinc-500 text-sm">Template Blueprint Configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="font-bold text-zinc-800 mb-4 border-b border-zinc-100 pb-2">Properties</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Service Binding</label>
                  <p className="text-sm font-medium text-zinc-800">{services.find(s => s.id === selectedTemplate.serviceId)?.serviceName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Frequency</label>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded">{selectedTemplate.frequency}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Default Owner Role</label>
                  <p className="text-sm font-medium text-zinc-800">{selectedTemplate.defaultOwnerRole || 'Unassigned'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
               <h3 className="font-bold text-zinc-800 mb-4 border-b border-zinc-100 pb-2">Automation Rules</h3>
               <div className="space-y-2">
                 <div className="flex items-start gap-2 text-xs">
                    <ActivityIcon size={14} className="text-amber-500 shrink-0 mt-0.5"/>
                    <span className="text-zinc-600">Dependencies enforced on sequence</span>
                 </div>
                 <div className="flex items-start gap-2 text-xs">
                    <Users size={14} className="text-blue-500 shrink-0 mt-0.5"/>
                    <span className="text-zinc-600">L2 Manager approval required to finalize</span>
                 </div>
                 <div className="flex items-start gap-2 text-xs">
                    <Clock size={14} className="text-emerald-500 shrink-0 mt-0.5"/>
                    <span className="text-zinc-600">SLA: Due 3 days after generation</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-zinc-800 text-lg flex items-center gap-2"><Settings2 size={20} className="text-amber-500" /> Embedded Work Items</h3>
                <button 
                  onClick={() => {
                     setFormData(selectedTemplate);
                     setEditingTemplate(selectedTemplate);
                     setIsModalOpen(true);
                  }} 
                  className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Edit2 size={14} /> Edit Blueprint
                </button>
              </div>

              <div className="space-y-3">
                {selectedTemplate.workItems.map((wi, i) => (
                  <div key={i} className="p-4 border border-zinc-100 rounded-xl flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-xs shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-wider rounded">{wi.workItemType}</span>
                           <p className="font-bold text-zinc-800">{wi.title}</p>
                        </div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Depends on: {i === 0 ? 'Trigger' : `Task ${i}`}</span>
                      </div>
                      <p className="text-sm text-zinc-500">{wi.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Same modal for editing */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-zinc-900/50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 h-[80vh] flex flex-col">
             <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 shrink-0">
               <h3 className="font-bold text-lg text-zinc-800">Edit Template Blueprint</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition"><X size={20}/></button>
             </div>
             <div className="p-6 space-y-4 overflow-y-auto grow">
                <div>
                   <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Template Name</label>
                   <input type="text" value={formData.templateName} onChange={e => setFormData({...formData, templateName: e.target.value})} className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none" />
                </div>
                <div className="mt-4">
                   <div className="flex justify-between items-center mb-2">
                     <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Blueprint Items</label>
                     <button onClick={handleAddWorkItem} className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline"><Plus size={12}/> Add</button>
                   </div>
                   <div className="space-y-2">
                     {formData.workItems?.map((wi, i) => (
                       <div key={i} className="flex gap-2 items-center">
                         <select value={wi.workItemType} onChange={e => {
                            const newItems = [...(formData.workItems || [])];
                            newItems[i].workItemType = e.target.value as any;
                            setFormData({...formData, workItems: newItems});
                         }} className="px-2 py-1 border border-zinc-200 rounded text-sm w-24">
                           <option>Task</option>
                           <option>Document</option>
                           <option>Deliverable</option>
                           <option>Meeting</option>
                         </select>
                         <input type="text" className="px-2 py-1 border border-zinc-200 rounded text-sm flex-1" value={wi.title} onChange={e => {
                            const newItems = [...(formData.workItems || [])];
                            newItems[i].title = e.target.value;
                            setFormData({...formData, workItems: newItems});
                         }} />
                         <button onClick={() => {
                            const newItems = [...(formData.workItems || [])];
                            newItems.splice(i, 1);
                            setFormData({...formData, workItems: newItems});
                         }} className="text-rose-500 p-1"><X size={14}/></button>
                       </div>
                     ))}
                   </div>
                </div>
             </div>
             <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50 shrink-0">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-600 font-bold hover:bg-zinc-200 rounded-lg transition">Cancel</button>
                <button onClick={() => {
                    handleSave();
                    if (editingTemplate) setSelectedTemplate(editingTemplate);
                }} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">Save Template</button>
             </div>
           </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Copy className="text-amber-500" />
            Recurring Work Engine
          </h2>
          <p className="text-zinc-500">Generate process blueprints and automate delivery schedules.</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition shadow-sm">
          <Plus size={16} /> New Template
        </button>
      </div>
      
      <div className="bg-white border border-zinc-200 rounded-xl flex">
         <button onClick={() => setActiveView('Templates')} className={cn("flex-1 py-3 text-sm font-bold border-b-2 text-center", activeView === 'Templates' ? 'border-amber-500 text-amber-600' : 'border-transparent text-zinc-500')}>Process Blueprints</button>
         <button onClick={() => setActiveView('Schedules')} className={cn("flex-1 py-3 text-sm font-bold border-b-2 text-center", activeView === 'Schedules' ? 'border-amber-500 text-amber-600' : 'border-transparent text-zinc-500')}>Recurring Schedules</button>
      </div>

      {activeView === 'Templates' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tpl => (
            <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col hover:shadow-md transition cursor-pointer relative group">
              <div className="absolute top-4 right-4 hidden group-hover:flex gap-2">
                 <button onClick={(e) => handleClone(tpl, e)} className="p-1.5 bg-zinc-100 text-zinc-600 rounded hover:bg-amber-100 hover:text-amber-700 transition" title="Clone"><FilePlus size={14}/></button>
                 <button onClick={(e) => handleDelete(tpl.id, e)} className="p-1.5 bg-zinc-100 text-zinc-600 rounded hover:bg-rose-100 hover:text-rose-700 transition" title="Delete"><Trash2 size={14}/></button>
              </div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-zinc-100 text-zinc-600">
                    {tpl.frequency}
                  </span>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${tpl.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {tpl.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1 pr-12">{tpl.templateName}</h3>
                <p className="text-xs font-bold text-zinc-400 mb-4">{services.find(s => s.id === tpl.serviceId)?.serviceName}</p>
                
                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Items inside:</span>
                    <span className="font-bold text-zinc-700">{tpl.workItems.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Default Role:</span>
                    <span className="font-bold text-zinc-700 truncate max-w-[120px]">{tpl.defaultOwnerRole || 'Dynamic'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-b-2xl">
                <span className="text-sm font-bold text-amber-600">
                  View Setup
                </span>
                <button onClick={(e) => handleInstantiate(tpl, e)} className="text-sm font-bold text-zinc-600 flex items-center gap-1 hover:text-amber-600 transition">
                  <PlayCircle size={16} /> Instantiate
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-zinc-50/50 border-b border-zinc-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Template</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Freq</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Next Run</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                 {schedules.map(sch => (
                    <tr key={sch.id} className="hover:bg-zinc-50 transition-colors">
                       <td className="px-6 py-4">
                          <p className="text-sm font-bold text-zinc-900">{sch.template}</p>
                          <p className="text-[10px] text-zinc-500">ID: {sch.id}</p>
                       </td>
                       <td className="px-6 py-4 text-sm font-medium text-zinc-600">{sch.service}</td>
                       <td className="px-6 py-4 text-sm font-medium text-zinc-600">{sch.client}</td>
                       <td className="px-6 py-4"><span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider rounded">{sch.frequency}</span></td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                             <CalendarIcon size={14} className="text-amber-500"/> {sch.nextRun}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1">Prev: {sch.lastRun}</p>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${sch.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{sch.status}</span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="text-xs font-bold text-blue-600 hover:text-blue-800">Edit</button>
                             {sch.status === 'Active' ? (
                               <button className="text-xs font-bold text-amber-600 hover:text-amber-800">Pause</button>
                             ) : (
                               <button className="text-xs font-bold text-emerald-600 hover:text-emerald-800">Resume</button>
                             )}
                             <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><PlayCircle size={14}/> Run Now</button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
      
      {/* Create Modal */}
      {isModalOpen && !selectedTemplate && (
        <div className="fixed inset-0 bg-zinc-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h3 className="font-bold text-lg text-zinc-800">Create New Template</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Template Name</label>
                  <input type="text" value={formData.templateName} onChange={e => setFormData({...formData, templateName: e.target.value})} className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Linked Service</label>
                  <select value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                     {services.map(s => <option key={s.id} value={s.id}>{s.serviceName}</option>)}
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Frequency</label>
                    <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value as any})} className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                       <option>One Time</option>
                       <option>Daily</option>
                       <option>Weekly</option>
                       <option>Monthly</option>
                       <option>Quarterly</option>
                       <option>Yearly</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Default Role</label>
                    <input type="text" value={formData.defaultOwnerRole} onChange={e => setFormData({...formData, defaultOwnerRole: e.target.value})} className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                 </div>
               </div>
            </div>
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-600 font-bold hover:bg-zinc-200 rounded-lg transition">Cancel</button>
               <button onClick={handleSave} className="px-4 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition">Create Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
