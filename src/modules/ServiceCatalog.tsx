import React, { useState } from 'react';
import { Service, ClientServiceMapping } from '../types/models';
import { Layers, Briefcase, Plus, CheckCircle, Search, Trash2, Edit2, X } from 'lucide-react';
import { CLIENTS } from '../data/mockData';

export const ServiceCatalogEngine = ({ services, clientServices, onAction }: { services: Service[], clientServices: ClientServiceMapping[], onAction: (type: string, payload: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'mapping'>('catalog');
  const [filter, setFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [formData, setFormData] = useState<Partial<Service>>({
     serviceName: '',
     businessUnit: 'IT Services',
     description: '',
     defaultSLA: '24 hours',
     status: 'Active'
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({ serviceName: '', businessUnit: 'IT Services', description: '', defaultSLA: '24 hours', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.serviceName) return;
    
    if (editingService) {
      onAction('SERVICE_UPDATED', { service: { ...editingService, ...formData } });
    } else {
      onAction('SERVICE_CREATED', { service: { ...formData, id: `srv-${Date.now()}` } });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate and delete this service?')) {
      onAction('SERVICE_DELETED', { id });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-indigo-600" />
            Service Library
          </h2>
          <p className="text-slate-500">Defines standardized delivery structures and boundaries.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('catalog')} 
          className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'catalog' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Master Service Catalog
        </button>
        <button 
          onClick={() => setActiveTab('mapping')} 
          className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'mapping' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Client Subscriptions (Mapping)
        </button>
      </div>

      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm">
              <Plus size={16} /> Add Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.filter(s => s.serviceName.toLowerCase().includes(filter.toLowerCase())).map(service => (
              <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition relative group">
                <div className="absolute top-4 right-4 hidden group-hover:flex gap-2">
                   <button onClick={() => handleOpenEdit(service)} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-indigo-100 hover:text-indigo-700 transition"><Edit2 size={14}/></button>
                   <button onClick={() => handleDelete(service.id)} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-rose-100 hover:text-rose-700 transition"><Trash2 size={14}/></button>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Briefcase className="text-indigo-600" size={24} />
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${service.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {service.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 pr-12">{service.serviceName}</h3>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">{service.businessUnit}</p>
                <p className="text-sm text-slate-600 mb-6 h-10 line-clamp-2">{service.description}</p>
                <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1"><CheckCircle size={14} className="text-slate-400"/> Default SLA: {service.defaultSLA}</span>
                  <span className="font-mono text-slate-400">{service.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mapping' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Client / Entity</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Subscribed Service</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Start Date</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientServices.map(cs => {
                const client = CLIENTS.find(c => c.id === cs.clientId);
                const service = services.find(s => s.id === cs.serviceId);
                return (
                  <tr key={cs.id} className="hover:bg-indigo-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{client?.name || cs.clientId}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{service?.serviceName || 'Unknown Service'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{cs.startDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${cs.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {cs.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingService ? 'Edit Service' : 'Create New Service'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Service Name</label>
                  <input type="text" value={formData.serviceName} onChange={e => setFormData({...formData, serviceName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Business Unit</label>
                  <select value={formData.businessUnit} onChange={e => setFormData({...formData, businessUnit: e.target.value as any})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                     <option>Finance & Accounting</option>
                     <option>IT Services</option>
                     <option>Recruitment</option>
                     <option>Managed Services</option>
                     <option>Payroll</option>
                     <option>Shared Services</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Default SLA</label>
                    <input type="text" value={formData.defaultSLA} onChange={e => setFormData({...formData, defaultSLA: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 24 hours" />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                       <option>Active</option>
                       <option>Draft</option>
                       <option>Inactive</option>
                    </select>
                 </div>
               </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition">Cancel</button>
               <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">Save Service</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
