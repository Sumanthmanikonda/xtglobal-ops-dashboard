import React, { useState } from 'react';
import { Settings, Shield, Bell, List, ArrowUpRight, Building2, Briefcase, Plus, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export const AdminSettingsPage = ({ initialTab = 'roles' }: { initialTab?: string }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'notifications', label: 'Notification Templates', icon: Bell },
    { id: 'status', label: 'Status Libraries', icon: List },
    { id: 'priority', label: 'Priority Libraries', icon: ArrowUpRight },
    { id: 'business-units', label: 'Business Units', icon: Building2 },
    { id: 'client-config', label: 'Client Configuration', icon: Briefcase },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Platform Configuration</h1>
          <p className="text-zinc-500 text-sm">Manage global settings, libraries, and core configurations</p>
        </div>
        <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add New
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-64 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col overflow-hidden shrink-0">
           <div className="p-3 border-b border-zinc-100">
             <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
               <input type="text" placeholder="Search config..." className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-xs outline-none focus:border-zinc-300" />
             </div>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                   activeTab === tab.id ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                 )}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
           </div>
        </div>

        <div className="flex-1 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
           <div className="p-5 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
             <h2 className="font-bold text-zinc-900">{tabs.find(t => t.id === activeTab)?.label}</h2>
             <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">Active</span>
           </div>
           <div className="flex-1 overflow-y-auto p-6">
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-3 font-medium text-zinc-600">Name / Identifier</th>
                      <th className="px-4 py-3 font-medium text-zinc-600">Type</th>
                      <th className="px-4 py-3 font-medium text-zinc-600">Last Modified</th>
                      <th className="px-4 py-3 font-medium text-zinc-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[1,2,3,4,5].map(i => (
                      <tr key={i} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 font-medium text-zinc-900">Config Item {i}</td>
                        <td className="px-4 py-3 text-zinc-600">System Core</td>
                        <td className="px-4 py-3 text-zinc-500">2 hours ago</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-emerald-600 hover:text-emerald-700 text-xs font-medium mr-3">Edit</button>
                          <button className="text-amber-600 hover:text-amber-700 text-xs font-medium">Archive</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
