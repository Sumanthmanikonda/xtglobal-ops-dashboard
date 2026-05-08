import React, { useState, useMemo, useEffect } from 'react';
import { Orchestrator } from './lib/OrchestrationEngine';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  ChevronRight, 
  MoreVertical,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Paperclip,
  Send,
  Presentation,
  Shield,
  Activity as ActivityIcon,
  GitBranch,
  Eye,
  UserCheck,
  Bell,
  ClipboardList,
  X,
  ExternalLink,
  UserPlus,
  Zap,
  Info,
  Mail,
  FileSpreadsheet,
  FileDown,
  Edit
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';
import { 
  CLIENTS, 
  ACTIVITIES, 
  SCOPE_COMMITMENTS, 
  COMMUNICATIONS, 
  RULES,
  USERS,
  WORKFLOWS,
  TASKS,
  ATTENDANCE,
  CLIENT_ASSIGNMENTS,
  Activity,
  Client,
  ScopeCommitment,
  Communication,
  Rule,
  User,
  UserRole,
  UserType,
  AttendanceStatus,
  Workflow,
  Task,
  Attendance
} from './data/mockData';

// --- Types ---
type Page = 
  | 'dashboard' 
  | 'activity-log' 
  | 'activity-detail' 
  | 'scope-sla' 
  | 'scope-detail'
  | 'communications' 
  | 'communication-detail'
  | 'rule-library' 
  | 'rule-detail'
  | 'clients' 
  | 'client-detail'
  | 'settings' 
  | 'demo'
  | 'sla-center'
  | 'ops-control'
  | 'user-monitor'
  | 'user-detail'
  | 'workflow-builder'
  | 'escalation'
  | 'tasks'
  | 'task-detail'
  | 'audit-viewer'
  | 'orchestration';

// --- New Models ---

export type ExceptionType = 
  | 'Data Error' 
  | 'Missing Info' 
  | 'Process Deviation' 
  | 'Client Dependency' 
  | 'System Issue';

export interface AuditLog {
  id: string;
  entityType: 'Activity' | 'Task' | 'Rule' | 'Workflow' | 'Communication' | 'User';
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  timestamp: string;
}

export interface DecisionLog {
  id: string;
  objectType: 'Rule' | 'Escalation' | 'Exception' | 'Activity';
  objectId: string;
  decisionType: 'Approved' | 'Rejected' | 'Overridden' | 'Awaiting Confirmation';
  decidedBy: string;
  comments: string;
  timestamp: string;
}

export interface Document {
  id: string;
  activityId?: string;
  communicationId?: string;
  name: string;
  type: string;
  version: number;
  uploadedBy: string;
  timestamp: string;
  url: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string;
}

export interface SLAConfig {
  processType: string;
  activityType: string;
  slaHours: number;
}

export interface Settings {
  general: {
    timezone: string;
    dateFormat: string;
  };
  activity: {
    defaultReportingMode: 'Detailed Processing' | 'Compound Reporting';
    allowedTags: string[];
  };
  sla: {
    warningHours: number;
    escalation1Hours: number;
    escalation2Hours: number;
    breachDays: number;
  };
  communication: {
    subjectFormatTemplate: string;
  };
  workflow: {
    defaultApprovalLevels: number;
  };
  shadowUser: {
    maskingEnabled: boolean;
    enforcePrimaryMapping: boolean;
  };
  simulationMode: boolean;
}

// --- System Orchestrator Context ---
export const SystemContext = React.createContext<{ dispatch: (type: string, payload: any) => void }>({ dispatch: () => {} });
export const useSystem = () => React.useContext(SystemContext);

// --- Components ---

const Sidebar = ({ activePage, setActivePage, currentUser, isPresentationMode, onTogglePresentation }: { 
  activePage: Page, 
  setActivePage: (p: Page) => void, 
  currentUser: User,
  isPresentationMode: boolean,
  onTogglePresentation: () => void
}) => {
  const isAdmin = currentUser.userType === 'Admin';
  const isManager = currentUser.role === 'Internal Manager' || isAdmin;
  const isClient = currentUser.userType === 'Client';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'activity-log', label: 'Activity Log', icon: FileText, show: true },
    { id: 'sla-center', label: 'SLA Center', icon: ActivityIcon, show: isManager },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList, show: true },
    { id: 'scope-sla', label: 'Scope & SLA', icon: Calendar, show: true },
    { id: 'communications', label: 'Communications', icon: MessageSquare, show: true },
    { id: 'rule-library', label: 'Rule Library', icon: BookOpen, show: true },
    { id: 'clients', label: 'Clients', icon: Users, show: !isClient },
    { id: 'ops-control', label: 'Ops Control', icon: Shield, show: isAdmin },
    { id: 'audit-viewer', label: 'Audit Logs', icon: Eye, show: isManager },
    { id: 'user-monitor', label: 'User Monitor', icon: UserCheck, show: isManager },
    { id: 'workflow-builder', label: 'Workflows', icon: GitBranch, show: isManager },
    { id: 'orchestration', label: 'Enterprise Orchestration', icon: ActivityIcon, show: isManager },
  ];

  return (
    <div className="w-64 h-screen bg-zinc-950 text-zinc-400 border-r border-zinc-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="px-3 py-6 flex flex-col items-start">
        {/* Logo Row: XTGLOBAL */}
        <div className="flex items-center w-full">
          <div className="bg-white rounded-lg w-full flex justify-center shadow-sm overflow-hidden">
            <img src="/logo.png" alt="XTGLOBAL Logo" className="w-full h-auto object-contain scale-125 transform origin-center" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto custom-scrollbar pb-8">
        <div>
          <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Core Modules</p>
          <nav className="space-y-1">
            {menuItems.filter(i => i.show && !['sla-center', 'ops-control', 'user-monitor', 'workflow-builder'].includes(i.id)).map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activePage === item.id 
                    ? "bg-zinc-800 text-white" 
                    : "hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {isManager && (
          <div>
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Governance & Control</p>
            <nav className="space-y-1">
              {menuItems.filter(i => i.show && ['sla-center', 'ops-control', 'user-monitor', 'workflow-builder'].includes(i.id)).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id as Page)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    activePage === item.id 
                      ? "bg-zinc-800 text-white" 
                      : "hover:bg-zinc-900 hover:text-zinc-200"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="px-4 py-6 space-y-1 border-t border-zinc-800">
        <button
          onClick={() => setActivePage('demo')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-emerald-400 hover:bg-emerald-500/10",
            activePage === 'demo' && "bg-emerald-500/20 text-emerald-300"
          )}
        >
          <Presentation size={18} />
          Product Demo
        </button>
        <button
          onClick={() => setActivePage('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            activePage === 'settings' 
              ? "bg-zinc-800 text-white" 
              : "hover:bg-zinc-900 hover:text-zinc-200"
          )}
        >
          <Settings size={18} />
          Settings
        </button>
        
        <div className="mt-4 px-3 py-2 flex items-center gap-3 bg-zinc-900/50 rounded-lg border border-zinc-800 relative group">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white font-bold">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium text-white truncate">{currentUser.role === 'Shadow User' ? currentUser.primeDisplayName : currentUser.name}</p>
            <p className="text-[10px] text-zinc-500 truncate uppercase tracking-tighter">{currentUser.role}</p>
          </div>
          <button 
            onClick={onTogglePresentation}
            className={cn(
              "absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100",
              isPresentationMode ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
            )}
            title={isPresentationMode ? "Exit Presentation Mode" : "Enter Presentation Mode"}
          >
            <Presentation size={12} />
          </button>
          {currentUser.role === 'Shadow User' && !isPresentationMode && (
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

const ResourceAvailabilityWidget = ({ currentUser, onStatusChange, users, isPresentationMode, selectedClientContext }: { 
  currentUser: User, 
  onStatusChange: (s: User['status']) => void, 
  users: User[],
  isPresentationMode?: boolean,
  selectedClientContext?: Client | null
}) => {
  const isAdmin = currentUser.userType === 'Admin';
  const isInternalManager = currentUser.role === 'Internal Manager';
  const isClient = currentUser.userType === 'Client';
  
  const [showShadowUsers, setShowShadowUsers] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Internal' | 'Client'>('All');

  const getAttendanceStatus = (userId: string) => {
    return ATTENDANCE.find(a => a.userId === userId);
  };

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500';
      case 'Available': return 'bg-blue-500';
      case 'Partially Available': return 'bg-amber-500';
      case 'On Leave': return 'bg-zinc-300';
      case 'Unplanned Absence': return 'bg-red-500';
      case 'Holiday': return 'bg-indigo-500';
      case 'Coverage Active': return 'bg-emerald-500';
      default: return 'bg-zinc-200';
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.role === 'Shadow User') {
      if (isClient || isPresentationMode) return user.primeDisplayName;
      return showShadowUsers ? `${user.name} (${user.primeDisplayName})` : user.primeDisplayName;
    }
    return user.name;
  };

  const visibleUsers = users.filter(u => {
    // 1. Shadow Users are NEVER visible to clients
    if (isClient && u.role === 'Shadow User') return false;

    // 2. If client context is selected, only show users assigned to that client
    if (selectedClientContext) {
      const isAssignedToClient = u.clientId === selectedClientContext.id || u.assignedClientIds?.includes(selectedClientContext.id);
      if (!isAssignedToClient) return false;
    }

    // 3. If client manager, only show their own client's users
    if (isClient && currentUser.clientId) {
      if (u.clientId !== currentUser.clientId && !u.assignedClientIds?.includes(currentUser.clientId)) return false;
    }

    // 4. Filter by Internal/Client toggle (Internal View only)
    if (!isClient && !isPresentationMode) {
      const matchesFilter = filter === 'All' || 
                           (filter === 'Internal' && u.userType === 'Internal') || 
                           (filter === 'Client' && u.userType === 'Client');
      if (!matchesFilter) return false;
    }

    // 5. Shadow User toggle for Internal Managers/Admins
    if (!isClient && u.role === 'Shadow User' && !showShadowUsers && !isPresentationMode) return false;

    return true;
  });

  return (
    <Card title="Resource Availability" className="h-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              currentUser.status === 'Active' ? "bg-emerald-500" : currentUser.status === 'Break' ? "bg-amber-500" : "bg-zinc-400"
            )} />
            <div>
              <p className="text-xs font-bold text-zinc-900">Your Status: {currentUser.status}</p>
              <p className="text-[10px] text-zinc-500">Last updated: Just now</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onStatusChange(currentUser.status === 'Offline' ? 'Active' : 'Offline')}
              className={cn(
                "px-3 py-1.5 text-white text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider",
                currentUser.status === 'Offline' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-zinc-500 hover:bg-zinc-600"
              )}
            >
              {currentUser.status === 'Offline' ? 'Login' : 'Logout'}
            </button>
            {currentUser.status !== 'Offline' && (
              <button 
                onClick={() => onStatusChange(currentUser.status === 'Active' ? 'Break' : 'Active')}
                className={cn(
                  "px-3 py-1.5 text-white text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider",
                  currentUser.status === 'Active' ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {currentUser.status === 'Active' ? 'Break' : 'Resume'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          {!isPresentationMode && !isClient && (
            <div className="flex gap-2">
              {['All', 'Internal', 'Client'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded-md transition-colors uppercase tracking-tighter",
                    filter === f ? "bg-zinc-800 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {(isAdmin || isInternalManager) && !isPresentationMode && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showShadowUsers} 
                onChange={(e) => setShowShadowUsers(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500/20"
              />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Show Shadow Users</span>
            </label>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                <th className="pb-3">User</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Coverage</th>
                <th className="pb-3">Signals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {visibleUsers.map(u => {
                const attendance = getAttendanceStatus(u.id);
                return (
                  <tr key={u.id} className="text-xs group">
                    <td className="py-3">
                      <div className="font-medium text-zinc-900">{getUserDisplayName(u)}</div>
                      <div className="text-[10px] text-zinc-400">
                        {u.clientId ? CLIENTS.find(c => c.id === u.clientId)?.name : 'Internal'}
                      </div>
                    </td>
                    <td className="py-3 text-zinc-500 uppercase text-[10px] font-bold">{u.role}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          getStatusColor(attendance?.status)
                        )} />
                        <span className="font-medium">{attendance?.status || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      {attendance?.isCovered ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase">
                          <Shield size={10} />
                          Covered
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[10px] uppercase">Direct</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <div title="Login Signal" className={cn("w-2 h-2 rounded-full", attendance?.signals.login ? "bg-emerald-500" : "bg-zinc-200")} />
                        <div title="Task Activity Signal" className={cn("w-2 h-2 rounded-full", attendance?.signals.taskActivity ? "bg-emerald-500" : "bg-zinc-200")} />
                        {attendance?.signals.manualOverride && <div title="Manual Override" className="w-2 h-2 rounded-full bg-amber-500" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

const ActivityCreationModal = ({ isOpen, onClose, onAdd, currentUser }: { isOpen: boolean, onClose: () => void, onAdd: (a: Partial<Activity>) => void, currentUser: User }) => {
  const [reportingMode, setReportingMode] = useState<'Detailed Processing' | 'Compound Reporting'>('Detailed Processing');
  const [formData, setFormData] = useState({
    clientId: currentUser.clientId || '',
    processType: 'AP',
    documentReference: '',
    batchName: '',
    documentCount: '',
    processingNotes: '',
    erpReference: '',
    actionTaken: '',
    tag: 'General',
    exceptionType: undefined as ExceptionType | undefined,
    mappedInternalUserId: ''
  });

  const isShadowUser = currentUser.role === 'Shadow User';
  const clientAssignment = CLIENT_ASSIGNMENTS.find(ca => ca.clientId === formData.clientId);
  const internalUsersForClient = USERS.filter(u => clientAssignment?.internalUserIds.includes(u.id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-zinc-950/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200"
      >
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h3 className="text-lg font-bold text-zinc-900">Log New Activity</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <MoreVertical size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Client</label>
              <select 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
              >
                <option value="">Select Client</option>
                {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Process Type</label>
              <select 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.processType}
                onChange={e => setFormData({...formData, processType: e.target.value})}
              >
                <option value="AP">Accounts Payable</option>
                <option value="AR">Accounts Receivable</option>
                <option value="GL">General Ledger</option>
                <option value="Billing">Billing</option>
                <option value="FP&A">FP&A</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reporting Mode</label>
            <div className="flex gap-2">
              {['Detailed Processing', 'Compound Reporting'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setReportingMode(mode as any)}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-xs font-bold border transition-all",
                    reportingMode === mode 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {reportingMode === 'Detailed Processing' ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Reference</label>
              <input 
                type="text" 
                placeholder="e.g. INV-10231"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.documentReference}
                onChange={e => setFormData({...formData, documentReference: e.target.value})}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Batch Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Weekly Invoices"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.batchName}
                  onChange={e => setFormData({...formData, batchName: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Count</label>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.documentCount}
                  onChange={e => setFormData({...formData, documentCount: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ERP Reference</label>
              <input 
                type="text" 
                placeholder="ERP-XXXX"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.erpReference}
                onChange={e => setFormData({...formData, erpReference: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tag</label>
              <select 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.tag}
                onChange={e => setFormData({...formData, tag: e.target.value})}
              >
                <option value="General">General</option>
                <option value="Exception">Exception</option>
                <option value="Clarification Required">Clarification Required</option>
                <option value="Escalation">Escalation</option>
                <option value="Rule Update">Rule Update</option>
              </select>
            </div>
          </div>

          {formData.tag === 'Exception' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Exception Classification (Mandatory)</label>
              <select 
                className="w-full bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                value={formData.exceptionType}
                onChange={e => setFormData({...formData, exceptionType: e.target.value as ExceptionType})}
                required
              >
                <option value="">Select Exception Type</option>
                <option value="Data Error">Data Error</option>
                <option value="Missing Info">Missing Info</option>
                <option value="Process Deviation">Process Deviation</option>
                <option value="Client Dependency">Client Dependency</option>
                <option value="System Issue">System Issue</option>
              </select>
            </div>
          )}

          {isShadowUser && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Reporting On Behalf Of (Primary User Mapping)</label>
              <select 
                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.mappedInternalUserId}
                onChange={e => setFormData({...formData, mappedInternalUserId: e.target.value})}
                required
              >
                <option value="">Select Primary User</option>
                {internalUsersForClient.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <p className="text-[10px] text-zinc-400 italic">Note: Client will only see the selected primary user's name.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Action Taken</label>
            <textarea 
              rows={3}
              placeholder="Describe the processing steps..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              value={formData.actionTaken}
              onChange={e => setFormData({...formData, actionTaken: e.target.value})}
            />
          </div>

          {reportingMode === 'Compound Reporting' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Processing Notes</label>
              <textarea 
                rows={2}
                placeholder="Additional notes for the batch..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                value={formData.processingNotes}
                onChange={e => setFormData({...formData, processingNotes: e.target.value})}
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (formData.tag === 'Exception' && !formData.exceptionType) {
                alert('Please select an exception type');
                return;
              }
              if (isShadowUser && !formData.mappedInternalUserId) {
                alert('Please select a primary user to map this activity to');
                return;
              }
              onAdd({
                ...formData,
                reportingMode,
                documentCount: formData.documentCount ? parseInt(formData.documentCount) : undefined
              } as any);
              onClose();
            }}
            className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            Log Activity
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Card = ({ children, title, className, icon: Icon, ...props }: { children: React.ReactNode, title?: string, className?: string, icon?: any, [key: string]: any }) => (
  <div className={cn("bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden", className)} {...props}>
    {title && (
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          {Icon && <Icon size={16} className="text-emerald-600" />}
          {title}
        </h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' | 'info', className?: string }) => {
  const variants = {
    default: "bg-zinc-100 text-zinc-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-rose-100 text-rose-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};

const GlobalSearch = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (type: string, id: string) => void }) => {
  const [query, setQuery] = useState('');
  
  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    
    const clientResults = CLIENTS.filter(c => c.name.toLowerCase().includes(q)).map(c => ({ type: 'Client', id: c.id, label: c.name, sub: c.industry }));
    const activityResults = ACTIVITIES.filter(a => a.documentReference.toLowerCase().includes(q) || a.actionTaken.toLowerCase().includes(q)).slice(0, 5).map(a => ({ type: 'Activity', id: a.id, label: a.documentReference, sub: a.actionTaken }));
    const ruleResults = RULES.filter(r => r.description.toLowerCase().includes(q)).map(r => ({ type: 'Rule', id: r.id, label: r.process, sub: r.description }));
    
    return [...clientResults, ...activityResults, ...ruleResults];
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-zinc-950/40 backdrop-blur-sm" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-100 flex items-center gap-3">
              <Search className="text-zinc-400" size={20} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search anything (activities, clients, rules...)" 
                className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-zinc-300"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <div className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ESC</div>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((res, i) => (
                    <button 
                      key={`${res.type}-${res.id}`}
                      onClick={() => {
                        onSelect(res.type, res.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                          {res.type === 'Client' ? <Users size={18} /> : res.type === 'Activity' ? <FileText size={18} /> : <BookOpen size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{res.label}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-[400px]">{res.sub}</p>
                        </div>
                      </div>
                      <Badge variant="info">{res.type}</Badge>
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-zinc-300" size={24} />
                  </div>
                  <p className="text-sm text-zinc-500">No results found for "{query}"</p>
                </div>
              ) : (
                <div className="p-8">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 px-2">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Create Activity', icon: Plus, cmd: 'A', id: 'create-activity' },
                      { label: 'View SLA Center', icon: ActivityIcon, cmd: 'S', id: 'sla-center' },
                      { label: 'Open Rules', icon: BookOpen, cmd: 'R', id: 'rules' },
                      { label: 'Client List', icon: Users, cmd: 'C', id: 'clients' },
                    ].map(action => (
                      <button 
                        key={action.label} 
                        onClick={() => {
                          onSelect('Action', action.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl border border-transparent hover:border-zinc-100 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <action.icon size={16} className="text-zinc-400" />
                          <span className="text-sm font-medium text-zinc-700">{action.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-300">⌘{action.cmd}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const NotificationCenter = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const notifications = [
    { id: 1, title: 'SLA Breach Warning', desc: 'DOC-1245 is approaching SLA limit (2h remaining)', time: '5m ago', type: 'error' },
    { id: 2, title: 'New Clarification', desc: 'TechFlow Solutions responded to INV-992', time: '15m ago', type: 'warning' },
    { id: 3, title: 'Rule Approved', desc: 'AP Processing Rule v2.1 has been approved', time: '1h ago', type: 'success' },
    { id: 4, title: 'System Update', desc: 'Ops Flow will be down for maintenance at 11 PM', time: '3h ago', type: 'info' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-14 right-8 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-200 z-[160] overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-sm font-bold text-zinc-900">Notifications</h3>
              <button className="text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-widest">Mark all read</button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id} className="p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer group">
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      n.type === 'error' ? "bg-rose-500" : n.type === 'warning' ? "bg-amber-500" : n.type === 'success' ? "bg-emerald-500" : "bg-blue-500"
                    )} />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{n.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{n.desc}</p>
                      <p className="text-[10px] text-zinc-400 mt-2 font-medium">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full p-3 text-center text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-colors border-t border-zinc-100">
              View All Notifications
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Pages ---

const OrchestrationTelemetryPage = ({ activities, tasks, auditLogs, workflows }: { activities: any[], tasks: any[], auditLogs: any[], workflows: any[] }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-indigo-950 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><ActivityIcon className="text-indigo-400" /> Distributed Orchestration Engine</h2>
          <p className="text-indigo-300">Global Operational Telemetry & State Goverance</p>
        </div>
        <div className="relative z-10 flex gap-4">
          <div className="bg-indigo-900/50 p-4 rounded-xl border border-indigo-800">
            <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase mb-1">State Version</p>
            <p className="text-2xl font-bold text-white font-mono tracking-wider">v{auditLogs.length + Date.now().toString().slice(-4)}</p>
          </div>
          <div className="bg-indigo-900/50 p-4 rounded-xl border border-indigo-800">
            <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase mb-1">Active DB Locks</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono tracking-wider">0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Orchestrator Vital Signs" className="col-span-1">
          <div className="space-y-4">
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-600">Event Sourcing Store</span>
              <span className="font-mono text-zinc-900 font-bold">{auditLogs.length} events</span>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-600">FSM State Nodes</span>
              <span className="font-mono text-zinc-900 font-bold">{tasks.length + activities.length}</span>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-600">Active Rule Templates</span>
              <span className="font-mono text-zinc-900 font-bold">{workflows.length}</span>
            </div>
          </div>
        </Card>

        <Card title="Temporal Processing Queue" className="col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50">
                <tr>
                  <th className="px-4 py-3">Task Dependency</th>
                  <th className="px-4 py-3">FSM State</th>
                  <th className="px-4 py-3">SLA Temporal Boundary</th>
                  <th className="px-4 py-3">Orchestration Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {tasks.slice(0, 5).map((t, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3 font-medium text-zinc-900 truncate max-w-[200px]">{t.taskName}</td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Blocked' ? 'error' : 'warning'}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{new Date(t.dueDate).toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold text-xs uppercase cursor-pointer hover:underline">Track Lineage</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Immutable Event Stream (Audit Ledger)">
        <div className="space-y-4">
          {auditLogs.slice(0, 15).map((log, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="w-px bg-zinc-200 relative mt-2">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-zinc-300 group-hover:bg-indigo-500 transition-colors" />
              </div>
              <div className="pb-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-zinc-950 font-mono bg-zinc-100 px-1 inline-block rounded">{log.action}</p>
                    <p className="text-xs text-zinc-600 mt-1">Entity: <span className="font-mono text-indigo-600">{log.entityId}</span> ({log.entityType})</p>
                    {log.notes && <p className="text-xs text-zinc-500 italic mt-0.5">{log.notes}</p>}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase border border-zinc-200 rounded px-2 py-0.5 bg-zinc-50">
                    {new Date(log.timestamp).toISOString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const DashboardPage = ({ onActivityClick, currentUser, tasks, onNavigate, activities, communications, onStatusChange, users, isPresentationMode, selectedClientContext, assignedClients }: { 
  onActivityClick: (a: Activity) => void, 
  currentUser: User, 
  tasks: Task[], 
  onNavigate: (page: Page, filter?: any) => void, 
  activities: Activity[], 
  communications: Communication[], 
  onStatusChange: (s: User['status']) => void, 
  users: User[],
  isPresentationMode?: boolean,
  selectedClientContext?: Client | null,
  assignedClients: Client[]
}) => {
  const isClient = currentUser.userType === 'Client';
  
  const relevantActivities = activities.filter(a => {
    if (selectedClientContext) return a.clientId === selectedClientContext.id;
    if (isClient && currentUser.clientId) return a.clientId === currentUser.clientId;
    if (currentUser.userType === 'Admin') return true;
    return assignedClients.some(c => c.id === a.clientId);
  });

  const stats = isClient ? [
    { label: 'Activities Processed', value: relevantActivities.length.toLocaleString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', page: 'activity-log' as Page },
    { label: 'Pending Your Action', value: communications.filter(c => {
      if (c.objectType !== 'Activity' || !c.objectId) return false;
      const act = relevantActivities.find(a => a.id === c.objectId);
      return act && act.status === 'Pending';
    }).length.toString(), icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', page: 'communications' as Page, filter: { status: 'Pending' } },
    { label: 'SLA Compliance', value: '99.2%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', page: 'sla-center' as Page },
    { label: 'Active Escalations', value: relevantActivities.filter(a => a.tag === 'Escalation').length.toString(), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', page: 'activity-log' as Page, filter: { tag: 'Escalation' } },
  ] : [
    { label: 'Activities Today', value: relevantActivities.filter(a => a.timestamp.startsWith(new Date().toISOString().split('T')[0])).length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', page: 'activity-log' as Page, filter: { date: 'today' } },
    { label: 'Open Clarifications', value: relevantActivities.filter(a => a.tag === 'Clarification Required').length.toString(), icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', page: 'activity-log' as Page, filter: { tag: 'Clarification Required' } },
    { label: 'Exceptions', value: relevantActivities.filter(a => a.tag === 'Exception').length.toString(), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', page: 'activity-log' as Page, filter: { tag: 'Exception' } },
    { label: 'Pending Client', value: relevantActivities.filter(a => a.status === 'Pending').length.toString(), icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50', page: 'activity-log' as Page, filter: { status: 'Pending' } },
    { label: 'Scope Completion', value: '78%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', page: 'scope-sla' as Page },
  ];

  const chartData = [
    { name: 'Mon', activities: 45, emails: 20, docs: 15, recs: 10, sla: 98 },
    { name: 'Tue', activities: 52, emails: 25, docs: 17, recs: 10, sla: 99 },
    { name: 'Wed', activities: 38, emails: 15, docs: 13, recs: 10, sla: 97 },
    { name: 'Thu', activities: 65, emails: 30, docs: 20, recs: 15, sla: 100 },
    { name: 'Fri', activities: 48, emails: 22, docs: 16, recs: 10, sla: 99 },
    { name: 'Sat', activities: 12, emails: 5, docs: 4, recs: 3, sla: 100 },
    { name: 'Sun', activities: 8, emails: 3, docs: 3, recs: 2, sla: 100 },
  ];

  const pieData = [
    { name: 'AP', value: 40 },
    { name: 'AR', value: 30 },
    { name: 'GL', value: 20 },
    { name: 'Other', value: 10 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const filteredActivities = relevantActivities.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {isClient ? `Welcome, ${currentUser.name}` : 'Operational Overview'}
          </h1>
          {isClient && <p className="text-sm text-zinc-500">TechFlow Solutions • Client Dashboard</p>}
        </div>
        <div className="text-sm text-zinc-500">Last updated: {format(new Date(), 'MMM dd, HH:mm')}</div>
      </div>

      <div className={cn("grid gap-4", isClient ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-5")}>
        {stats.map((stat) => (
          <div key={stat.label} onClick={() => onNavigate(stat.page, stat.filter)} className="cursor-pointer group transition-transform hover:scale-[1.02]">
            <Card className="p-0 overflow-hidden border-zinc-200 group-hover:border-zinc-300 group-hover:shadow-md transition-all">
              <div className="p-5 flex flex-col gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", stat.bg)}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
                    <ChevronRight size={12} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </div>
                  <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={isClient ? "SLA Performance" : "Activity Trend"}>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {isClient ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSla" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[90, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sla" stroke="#10b981" fillOpacity={1} fill="url(#colorSla)" />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="emails" stackId="a" fill="#10b981" name="Emails" />
                    <Bar dataKey="docs" stackId="a" fill="#3b82f6" name="Docs" />
                    <Bar dataKey="recs" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Recs" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            {!isClient && (
              <div className="mt-4 flex gap-6 px-2">
                {[
                  { label: 'Emails', value: chartData.reduce((acc, curr) => acc + curr.emails, 0), color: 'bg-emerald-500' },
                  { label: 'Docs', value: chartData.reduce((acc, curr) => acc + curr.docs, 0), color: 'bg-blue-500' },
                  { label: 'Recs', value: chartData.reduce((acc, curr) => acc + curr.recs, 0), color: 'bg-amber-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", item.color)} />
                    <span className="text-xs font-medium text-zinc-600">{item.value} {item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Process Breakdown">
            <div className="h-[300px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="220">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs text-zinc-600">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <ResourceAvailabilityWidget 
            currentUser={currentUser} 
            onStatusChange={onStatusChange} 
            users={users} 
            isPresentationMode={isPresentationMode}
            selectedClientContext={selectedClientContext}
          />
          
          <Card title="Recent Activities">
            <div className="space-y-4">
              {filteredActivities.slice(0, 5).map((act) => (
                <div 
                  key={act.id} 
                  onClick={() => onActivityClick(act)}
                  className="flex items-start gap-3 p-2 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    act.tag === 'Exception' ? "bg-rose-50 text-rose-600" : "bg-zinc-50 text-zinc-600"
                  )}>
                    <FileText size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors">
                      {act.reportingMode === 'Compound Reporting' ? act.batchName : act.documentReference}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">{act.actionTaken}</p>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium">{format(new Date(act.timestamp), 'HH:mm')}</div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate('activity-log')}
              className="w-full mt-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
            >
              View Activity Log
            </button>
          </Card>

          <Card title="AI Operations Copilot" className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-white border border-indigo-50 rounded-xl shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Zap size={12} /></div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Bottleneck Detected</p>
                  <p className="text-[10px] text-zinc-600 mt-1 mt-0.5">AP processing for Globex Corp is running 2 hours behind baseline. Suggested action: Route 2 analysts to coverage.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-3 bg-white border border-indigo-50 rounded-xl shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 size={12} /></div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Workflow Optimization</p>
                  <p className="text-[10px] text-zinc-600 mt-1 mt-0.5">3 delayed tasks can be resolved simultaneously by triggering the 'Missing Receipt' automated communication flow.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Task Engine Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Active Engine</span>
                </div>
                <span className="text-[10px] font-bold text-zinc-400">v2.4.1</span>
              </div>
              
              <div className="space-y-3">
                {tasks.filter(t => t.status !== 'Completed').slice(0, 5).map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => onNavigate('task-detail', { taskId: task.id })}
                    className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-emerald-200 transition-colors group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-zinc-900 line-clamp-1">{task.taskName}</span>
                      <Badge variant={task.priority === 'Critical' ? 'error' : task.priority === 'High' ? 'warning' : 'info'}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500">{task.processType} • {USERS.find(u => u.id === task.assignedTo)?.name}</span>
                      <span className="text-[10px] font-medium text-zinc-400">{format(new Date(task.dueDate), 'MMM dd')}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => onNavigate('tasks')}
                className="w-full py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
              >
                View All Tasks
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SLARoutingModal = ({ isOpen, onClose, activity, onRoute }: { isOpen: boolean, onClose: () => void, activity: Activity | null, onRoute: (data: any) => void }) => {
  const [resolverId, setResolverId] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [note, setNote] = useState('');

  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Route to Resolver</h2>
            <p className="text-xs text-zinc-500">Assign urgent resolution for {activity.documentReference}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Select Resolver</label>
            <select 
              value={resolverId}
              onChange={(e) => setResolverId(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="">Select a team member...</option>
              {USERS.filter(u => u.userType === 'Internal').map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['High', 'Medium', 'Low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "py-2 rounded-lg text-xs font-bold border transition-all",
                    priority === p 
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-md" 
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Resolution Instructions</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Provide specific instructions for the resolver..."
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all h-24 resize-none"
            />
          </div>
        </div>

        <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!resolverId}
            onClick={() => onRoute({ resolverId, priority, note })}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            Assign Task
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const WorkflowCreationModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (w: Workflow) => void }) => {
  const [name, setName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('ACTIVITY_CREATED');
  const [notificationTrigger, setNotificationTrigger] = useState('Email + System Notification');
  const [levels, setLevels] = useState([{ level: 1, approverRole: 'Team Lead', actionType: 'Review' }]);

  if (!isOpen) return null;

  const addLevel = () => {
    setLevels([...levels, { level: levels.length + 1, approverRole: 'Manager', actionType: 'Approval' }]);
  };

  const handleCreate = () => {
    onCreate({
      id: `wf-${Date.now()}`,
      name,
      triggerEvent,
      notificationTrigger,
      approvalLevels: levels,
      isActive: true
    });
    setName('');
    setLevels([{ level: 1, approverRole: 'Team Lead', actionType: 'Review' }]);
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Configure New Workflow</h2>
            <p className="text-xs text-zinc-500">Define triggers and multi-level approval chains</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Workflow Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., High Value Transaction Approval"
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Trigger Event</label>
              <select 
                value={triggerEvent}
                onChange={(e) => setTriggerEvent(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="ACTIVITY_CREATED">Activity Created</option>
                <option value="SLA_BREACH">SLA Breach</option>
                <option value="EXCEPTION_TAGGED">Exception Tagged</option>
                <option value="HIGH_VALUE_DETECTED">High Value Detected</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Notification Channel</label>
              <select 
                value={notificationTrigger}
                onChange={(e) => setNotificationTrigger(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="Email + System Notification">Email + System Notification</option>
                <option value="System Notification Only">System Notification Only</option>
                <option value="SMS + Email">SMS + Email</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Approval Chain</label>
              <button onClick={addLevel} className="text-[10px] font-bold text-emerald-600 hover:underline uppercase">Add Level</button>
            </div>
            
            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2">
              {levels.map((level, idx) => (
                <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-3">
                  <div className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                    {level.level}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <select 
                      value={level.approverRole}
                      onChange={(e) => {
                        const newLevels = [...levels];
                        newLevels[idx].approverRole = e.target.value;
                        setLevels(newLevels);
                      }}
                      className="bg-transparent text-xs font-bold focus:outline-none"
                    >
                      <option>Team Lead</option>
                      <option>Manager</option>
                      <option>Director</option>
                      <option>Client Manager</option>
                    </select>
                    <select 
                      value={level.actionType}
                      onChange={(e) => {
                        const newLevels = [...levels];
                        newLevels[idx].actionType = e.target.value;
                        setLevels(newLevels);
                      }}
                      className="bg-transparent text-xs text-zinc-500 focus:outline-none"
                    >
                      <option>Review</option>
                      <option>Approval</option>
                      <option>Verification</option>
                      <option>Execution</option>
                    </select>
                  </div>
                  {levels.length > 1 && (
                    <button 
                      onClick={() => setLevels(levels.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!name}
            onClick={handleCreate}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            Deploy Workflow
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SLACenterPage = ({ onActivityClick, onRoute, initialFilter, assignedClients }: { 
  onActivityClick: (a: Activity) => void, 
  onRoute: (a: Activity) => void,
  initialFilter?: any,
  assignedClients: Client[]
}) => {
  const [statusFilter, setStatusFilter] = useState(initialFilter?.status || 'All');
  const [clientIdFilter, setClientIdFilter] = useState(initialFilter?.clientId || 'All');

  useEffect(() => {
    if (initialFilter?.status) setStatusFilter(initialFilter.status);
    if (initialFilter?.clientId) setClientIdFilter(initialFilter.clientId);
  }, [initialFilter]);

  const escalatedActivities = ACTIVITIES.filter(a => {
    const isEscalated = a.status.includes('Escalated') || a.status === 'SLA Risk';
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesClient = clientIdFilter === 'All' 
      ? assignedClients.some(c => c.id === a.clientId)
      : a.clientId === clientIdFilter;
    return isEscalated && matchesStatus && matchesClient;
  });

  const stats = [
    { label: 'Level 2 Escalations', value: ACTIVITIES.filter(a => a.status === 'Escalated – Level 2' && assignedClients.some(c => c.id === a.clientId)).length, color: 'text-rose-600', border: 'border-l-rose-500', status: 'Escalated – Level 2' },
    { label: 'SLA Risks', value: ACTIVITIES.filter(a => a.status === 'SLA Risk' && assignedClients.some(c => c.id === a.clientId)).length, color: 'text-amber-600', border: 'border-l-amber-500', status: 'SLA Risk' },
    { label: 'Level 1 Escalations', value: ACTIVITIES.filter(a => a.status === 'Escalated – Level 1' && assignedClients.some(c => c.id === a.clientId)).length, color: 'text-blue-600', border: 'border-l-blue-500', status: 'Escalated – Level 1' },
    { label: 'Workforce Risks', value: ATTENDANCE.filter(a => a.status === 'Unplanned Absence' && !a.isCovered && assignedClients.some(c => c.id === a.clientId)).length, color: 'text-rose-600', border: 'border-l-rose-500', status: 'Workforce Risk' },
  ];

  const workforceRisks = ATTENDANCE.filter(a => a.status === 'Unplanned Absence' && !a.isCovered && assignedClients.some(c => c.id === a.clientId)).map(att => {
    const user = USERS.find(u => u.id === att.userId);
    const client = CLIENTS.find(c => c.id === att.clientId);
    return { ...att, userName: user?.name, clientName: client?.name, role: user?.role };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">SLA Monitoring Center</h1>
          <p className="text-zinc-500 text-sm">Real-time tracking of service level commitments and escalations</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={clientIdFilter}
            onChange={(e) => setClientIdFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Clients</option>
            {assignedClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Badge variant="error">
            {escalatedActivities.length + workforceRisks.length} Critical Items
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className={cn("p-4 border-l-4 cursor-pointer hover:bg-zinc-50 transition-colors", stat.border, statusFilter === stat.status && "bg-zinc-50 ring-1 ring-zinc-200")}
            onClick={() => setStatusFilter(stat.status)}
          >
            <p className="text-[10px] font-bold text-zinc-400 uppercase">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-zinc-500 mt-1">Click to filter view</p>
          </Card>
        ))}
      </div>

      {statusFilter === 'Workforce Risk' ? (
        <Card title="Workforce Availability Risks" className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3 border-b border-zinc-100">Client</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Resource</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Role</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Status</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Risk Level</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {workforceRisks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{risk.clientName}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{risk.userName}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{risk.role}</td>
                    <td className="px-6 py-4">
                      <Badge variant="error">{risk.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-rose-600 font-bold text-xs uppercase">
                        <AlertCircle size={14} />
                        High - No Coverage
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors">
                        Activate Shadow
                      </button>
                    </td>
                  </tr>
                ))}
                {workforceRisks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                      No workforce risks detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card title={statusFilter === 'All' ? "All Escalations" : `${statusFilter} Items`} className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-6 py-3 border-b border-zinc-100">Escalation Stage</th>
                <th className="px-6 py-3 border-b border-zinc-100">Client</th>
                <th className="px-6 py-3 border-b border-zinc-100">Reference</th>
                <th className="px-6 py-3 border-b border-zinc-100">SLA Timer</th>
                <th className="px-6 py-3 border-b border-zinc-100">Last Update</th>
                <th className="px-6 py-3 border-b border-zinc-100">Follow-Up</th>
                <th className="px-6 py-3 border-b border-zinc-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {escalatedActivities.map((act) => (
                <tr key={act.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <Badge variant={act.status.includes('Level 2') ? 'error' : 'warning'}>
                      {act.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                    {CLIENTS.find(c => c.id === act.clientId)?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{act.documentReference}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                      <Clock size={14} />
                      {act.slaTimer || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {format(new Date(act.lastUpdate), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    {act.followUpDeadline ? (
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Bell size={12} />
                        {format(new Date(act.followUpDeadline), 'MMM dd')}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onActivityClick(act)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                        title="View Details"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        onClick={() => onRoute(act)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Route to Resolver"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {escalatedActivities.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                    No items found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
};

const OperationsControlPage = () => {
  const activeUsers = USERS.filter(u => u.status === 'Active').length;
  const [selectedMetric, setSelectedMetric] = useState('Throughput');

  const metrics = [
    { label: 'Active Users', value: activeUsers, icon: Users, color: 'text-blue-600', trend: '+4' },
    { label: 'System Health', value: '99.9%', icon: ActivityIcon, color: 'text-emerald-600', trend: 'Stable' },
    { label: 'Active Alerts', value: '12', icon: AlertTriangle, color: 'text-rose-600', trend: '-2' },
    { label: 'Daily Throughput', value: '1,420', icon: Zap, color: 'text-amber-600', trend: '+15%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Operations Control Center</h1>
          <p className="text-zinc-500 text-sm">Global administrative view of platform health and throughput</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">System Live</span>
          </div>
          <button className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">Platform Settings</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div className={cn("p-2 rounded-lg bg-zinc-50", m.color)}>
                <m.icon size={20} />
              </div>
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", 
                m.trend.includes('+') ? "bg-emerald-50 text-emerald-600" : 
                m.trend.includes('-') ? "bg-rose-50 text-rose-600" : "bg-zinc-50 text-zinc-600"
              )}>
                {m.trend}
              </span>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{m.label}</p>
            <p className="text-2xl font-bold text-zinc-900">{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Global Performance (24h)" className="lg:col-span-2">
          <div className="flex gap-4 mb-6">
            {['Throughput', 'Latency', 'Error Rate'].map(m => (
              <button 
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  selectedMetric === m ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { time: '00:00', val: 20 },
                { time: '04:00', val: 15 },
                { time: '08:00', val: 45 },
                { time: '12:00', val: 120 },
                { time: '16:00', val: 140 },
                { time: '20:00', val: 80 },
                { time: '23:59', val: 30 },
              ]}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Client Throughput Breakdown">
          <div className="space-y-6">
            {CLIENTS.slice(0, 5).map(client => {
              const val = Math.floor(Math.random() * 80) + 20;
              return (
                <div key={client.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-700">{client.name}</span>
                    <span className="text-zinc-500">{val} items/hr</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${val}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="System Alerts & Health" className="p-0">
          <div className="divide-y divide-zinc-100">
            {[
              { type: 'Critical', msg: 'ERP Sync failure for Client A', time: '2m ago', icon: AlertCircle, color: 'text-rose-600' },
              { type: 'Warning', msg: 'High latency detected in AP module', time: '15m ago', icon: AlertTriangle, color: 'text-amber-600' },
              { type: 'Info', msg: 'System maintenance scheduled for Sunday', time: '1h ago', icon: Info, color: 'text-blue-600' },
            ].map((alert, i) => (
              <div key={i} className="p-4 flex items-start gap-4 hover:bg-zinc-50 transition-colors">
                <div className={cn("mt-0.5", alert.color)}>
                  <alert.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn("text-[10px] font-bold uppercase", alert.color)}>{alert.type}</span>
                    <span className="text-[10px] text-zinc-400">{alert.time}</span>
                  </div>
                  <p className="text-sm text-zinc-700">{alert.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Administrative Actions" className="p-0">
          <div className="divide-y divide-zinc-100">
            {ACTIVITIES.filter(a => a.tag === 'System' || a.tag === 'Admin').slice(0, 5).map(act => (
              <div key={act.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{act.actionTaken}</p>
                  <p className="text-[10px] text-zinc-500">
                    {USERS.find(u => u.id === act.userId)?.name} • {format(new Date(act.timestamp), 'MMM dd, HH:mm')}
                  </p>
                </div>
                <Badge variant="default">{act.tag}</Badge>
              </div>
            ))}
            {ACTIVITIES.filter(a => a.tag === 'System' || a.tag === 'Admin').length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-sm italic">No administrative actions recorded.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const UserDetailPage = ({ user, activities, tasks, auditLogs, onBack, onActivityClick }: { 
  user: User, 
  activities: Activity[], 
  tasks: Task[], 
  auditLogs: AuditLog[],
  onBack: () => void,
  onActivityClick: (activity: Activity) => void
}) => {
  const userActivities = activities.filter(a => a.userId === user.id);
  const userTasks = tasks.filter(t => t.assignedTo === user.id);
  const userAuditLogs = auditLogs.filter(l => l.changedBy === user.id);

  const stats = [
    { label: 'Total Activities', value: userActivities.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Pending Tasks', value: userTasks.filter(t => t.status !== 'Completed').length, icon: ClipboardList, color: 'text-amber-600' },
    { label: 'Completed Tasks', value: userTasks.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Audit Actions', value: userAuditLogs.length, icon: Shield, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{user.name}</h1>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <span>{user.role}</span>
            <span>•</span>
            <span>{user.status}</span>
            <span>•</span>
            <span className="font-medium text-emerald-600">
              {user.clientId ? (
                CLIENTS.find(c => c.id === user.clientId)?.name
              ) : (
                user.assignedClientIds && user.assignedClientIds.length > 0 ? (
                  user.assignedClientIds.length === CLIENTS.length ? 'Global' : (
                    user.assignedClientIds.map(cid => CLIENTS.find(c => c.id === cid)?.name).join(', ')
                  )
                ) : 'Internal Team'
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-zinc-50", stat.color)}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activities" className="p-0">
          <div className="divide-y divide-zinc-100">
            {userActivities.slice(0, 5).map(act => (
              <div 
                key={act.id} 
                className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer flex items-center justify-between group"
                onClick={() => onActivityClick(act)}
              >
                <div>
                  <p className="text-sm font-bold text-zinc-900">{act.documentReference || act.batchName}</p>
                  <p className="text-xs text-zinc-500">{act.processType} • {format(new Date(act.timestamp), 'MMM dd, HH:mm')}</p>
                </div>
                <ChevronRight size={16} className="text-zinc-300 group-hover:text-emerald-600 transition-colors" />
              </div>
            ))}
            {userActivities.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-sm italic">No activities recorded.</div>
            )}
          </div>
        </Card>

        <Card title="Recent Audit Logs" className="p-0">
          <div className="divide-y divide-zinc-100">
            {userAuditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-bold text-zinc-900">{log.action}</p>
                  <p className="text-[10px] font-mono text-zinc-400">{format(new Date(log.timestamp), 'HH:mm:ss')}</p>
                </div>
                <p className="text-[10px] text-zinc-500">{log.entityType}: {log.entityId}</p>
              </div>
            ))}
            {userAuditLogs.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-sm italic">No audit logs found.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
const UserActivityPage = ({ onUserClick, currentUser, selectedClientContext, assignedClients, users, onUpdateUser }: { onUserClick: (user: User) => void, currentUser: User, selectedClientContext?: Client | null, assignedClients: Client[], users: User[], onUpdateUser: (user: User) => void }) => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const isAdmin = currentUser.userType === 'Admin';

  const getAttendanceStatus = (userId: string) => {
    return ATTENDANCE.find(a => a.userId === userId);
  };

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500';
      case 'Available': return 'bg-blue-500';
      case 'Partially Available': return 'bg-amber-500';
      case 'On Leave': return 'bg-zinc-300';
      case 'Unplanned Absence': return 'bg-red-500';
      case 'Holiday': return 'bg-indigo-500';
      case 'Coverage Active': return 'bg-emerald-500';
      default: return 'bg-zinc-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    
    let matchesClient = true;
    if (selectedClientContext) {
      matchesClient = user.clientId === selectedClientContext.id || user.assignedClientIds?.includes(selectedClientContext.id) || false;
    } else if (!isAdmin) {
      matchesClient = assignedClients.some(c => c.id === user.clientId || user.assignedClientIds?.includes(c.id));
    }

    return matchesSearch && matchesRole && matchesClient;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">User Activity Monitor</h1>
          <p className="text-zinc-500 text-sm">Real-time tracking of internal team productivity and status</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <UserPlus size={16} />
              Add User
            </button>
          )}
          <button className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors">
            Export Productivity Report
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
        >
          <option value="All">All Roles</option>
          <option value="Processor">Processor</option>
          <option value="Analyst">Analyst</option>
          <option value="Internal Manager">Internal Manager</option>
          <option value="Shadow User">Shadow User</option>
          <option value="Client Manager">Client Manager</option>
          <option value="Client Viewer">Client Viewer</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const attendance = getAttendanceStatus(user.id);
          return (
            <div key={user.id}>
              <Card className="relative overflow-hidden hover:border-emerald-500/50 transition-all cursor-pointer group" onClick={() => onUserClick(user)}>
              <div className={cn(
                "absolute top-0 left-0 w-1 h-full",
                getStatusColor(attendance?.status)
              )} />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">
                      {user.role === 'Shadow User' ? user.primeDisplayName : user.name}
                    </h3>
                    {isAdmin ? (
                      <select
                        value={user.role}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newRole = e.target.value as UserRole;
                          let newUserType: UserType = 'Internal';
                          if (newRole === 'Admin') newUserType = 'Admin';
                          if (newRole === 'Client Manager' || newRole === 'Client Viewer') newUserType = 'Client';
                          onUpdateUser({ ...user, role: newRole, userType: newUserType });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-zinc-500 uppercase tracking-tighter font-bold bg-transparent border-none p-0 cursor-pointer hover:text-emerald-600 focus:ring-0"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Internal Manager">Internal Manager</option>
                        <option value="Processor">Processor</option>
                        <option value="Analyst">Analyst</option>
                        <option value="Shadow User">Shadow User</option>
                        <option value="Client Manager">Client Manager</option>
                        <option value="Client Viewer">Client Viewer</option>
                      </select>
                    ) : (
                      <p className="text-[10px] text-zinc-500 uppercase tracking-tighter font-bold">
                        {user.role} {user.role === 'Shadow User' ? `(${user.name})` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={attendance?.status === 'Present' || attendance?.status === 'Available' || attendance?.status === 'Coverage Active' ? 'success' : 'warning'}>
                  {attendance?.status || 'Offline'}
                </Badge>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Coverage</span>
                  <span className="text-xs font-medium text-zinc-700">
                    {attendance?.isCovered ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Shield size={10} />
                        {attendance.shadowUserName}
                      </span>
                    ) : 'Direct'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Last Signal</span>
                  <span className="text-xs font-medium text-zinc-700">
                    {attendance?.timestamp ? format(new Date(attendance.timestamp), 'HH:mm') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Client Assignment</span>
                  <span className="text-xs font-medium text-zinc-700">
                    {user.clientId ? (
                      CLIENTS.find(c => c.id === user.clientId)?.name
                    ) : (
                      user.assignedClientIds && user.assignedClientIds.length > 0 ? (
                        user.assignedClientIds.length === CLIENTS.length ? 'Global' : (
                          user.assignedClientIds.map(cid => CLIENTS.find(c => c.id === cid)?.name).join(', ')
                        )
                      ) : 'Internal Team'
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {user.assignedClientIds?.slice(0, 3).map(clientId => (
                    <div key={clientId} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-200 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                      {CLIENTS.find(c => c.id === clientId)?.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <button 
                  className="text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-widest"
                >
                  View Performance
                </button>
              </div>
            </Card>
          </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-lg font-bold">Add New User</h2>
                <button onClick={() => setIsAddUserModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                    <input type="email" placeholder="john@example.com" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Role</label>
                  <select className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none">
                    <option value="Admin">Admin</option>
                    <option value="Internal Manager">Internal Manager</option>
                    <option value="Client Manager">Client Manager</option>
                    <option value="Client Viewer">Client Viewer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Assign Clients</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-zinc-100 rounded-lg bg-zinc-50">
                    {CLIENTS.map(client => (
                      <label key={client.id} className="flex items-center gap-2 text-xs">
                        <input type="checkbox" className="rounded text-emerald-600" />
                        {client.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkflowBuilderPage = ({ workflows, onCreateClick }: { workflows: Workflow[], onCreateClick: () => void }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Workflow Engine</h1>
          <p className="text-zinc-500 text-sm">Configure multi-level approvals and automated triggers</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
            <History size={16} />
            Execution History
          </button>
          <button 
            onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Create Workflow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {workflows.map((wf) => (
            <Card 
              key={wf.id} 
              title={wf.name}
              className={cn("transition-all cursor-pointer", selectedWorkflow?.id === wf.id ? "ring-2 ring-emerald-500" : "hover:shadow-md")}
              onClick={() => setSelectedWorkflow(wf)}
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Trigger Event</label>
                    <div className="mt-1 p-3 bg-zinc-50 rounded-lg border border-zinc-100 text-sm font-medium text-zinc-700 flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" />
                      {wf.triggerEvent}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Notification</label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-zinc-600">
                      <Bell size={14} className="text-emerald-500" />
                      {wf.notificationTrigger}
                    </div>
                  </div>
                </div>

                <div className="flex-[2] space-y-4">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Approval Chain</label>
                  <div className="flex items-center gap-4">
                    {wf.approvalLevels.map((level, idx) => (
                      <React.Fragment key={level.level}>
                        <div className="flex-1 p-4 bg-white border border-zinc-200 rounded-xl shadow-sm relative group">
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            {level.level}
                          </div>
                          <p className="text-xs font-bold text-zinc-900 mb-1">{level.approverRole}</p>
                          <p className="text-[10px] text-zinc-500">{level.actionType}</p>
                        </div>
                        {idx < wf.approvalLevels.length - 1 && (
                          <ChevronRight className="text-zinc-300" size={20} />
                        )}
                      </React.Fragment>
                    ))}
                    <div className="flex-1 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle2 className="text-emerald-600" size={16} />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Execution</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Last Modified: {format(new Date(), 'MMM dd, yyyy')}</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex gap-3">
                  <button className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Edit Logic</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Deactivate</button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card title="Workflow Insights">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Avg Completion</p>
                  <p className="text-xl font-bold text-zinc-900">1.4h</p>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Success Rate</p>
                  <p className="text-xl font-bold text-zinc-900">98.2%</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Recent Executions</h4>
                {[
                  { name: 'Invoice Approval', status: 'Completed', time: '12m ago' },
                  { name: 'Credit Note Review', status: 'In Progress', time: '45m ago' },
                  { name: 'High Value PO', status: 'Awaiting L2', time: '2h ago' },
                ].map((exec, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg">
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{exec.name}</p>
                      <p className="text-[10px] text-zinc-500">{exec.time}</p>
                    </div>
                    <Badge variant={exec.status === 'Completed' ? 'success' : 'warning'}>{exec.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Automated Triggers">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Email to Activity</span>
                </div>
                <div className="w-8 h-4 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-zinc-600" />
                  <span className="text-xs font-medium text-zinc-900">OCR Validation</span>
                </div>
                <div className="w-8 h-4 bg-zinc-300 rounded-full relative">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ActivityLogPage = ({ activities, onActivityClick, onAddClick, currentUser, initialFilter, onNavigate, isPresentationMode }: { 
  activities: Activity[], 
  onActivityClick: (a: Activity) => void, 
  onAddClick: () => void, 
  currentUser: User, 
  initialFilter?: any, 
  onNavigate: (page: Page, filter?: any) => void,
  isPresentationMode?: boolean
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [processFilter, setProcessFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.tag) setTagFilter(initialFilter.tag);
      if (initialFilter.status) setStatusFilter(initialFilter.status);
      if (initialFilter.date) setDateFilter(initialFilter.date);
    }
  }, [initialFilter]);

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const client = CLIENTS.find(c => c.id === act.clientId);
      const matchesSearch = 
        client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.documentReference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.actionTaken.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProcess = processFilter === 'All' || act.processType === processFilter;
      const matchesTag = tagFilter === 'All' || act.tag === tagFilter;
      const matchesStatus = statusFilter === 'All' || act.status === statusFilter;
      
      let matchesDate = true;
      const actDate = new Date(act.timestamp);
      const now = new Date();
      
      if (dateFilter === 'today') {
        const today = now.toISOString().split('T')[0];
        matchesDate = act.timestamp.startsWith(today);
      } else if (dateFilter === 'last7') {
        const last7 = new Date();
        last7.setDate(now.getDate() - 7);
        matchesDate = actDate >= last7;
      } else if (dateFilter === 'last30') {
        const last30 = new Date();
        last30.setDate(now.getDate() - 30);
        matchesDate = actDate >= last30;
      } else if (dateFilter === 'thisMonth') {
        matchesDate = actDate.getMonth() === now.getMonth() && actDate.getFullYear() === now.getFullYear();
      }
      
      return matchesSearch && matchesProcess && matchesTag && matchesStatus && matchesDate;
    });
  }, [activities, searchTerm, processFilter, tagFilter, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = useMemo(() => {
    return filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredActivities, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, processFilter, tagFilter, statusFilter, dateFilter]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Client,Process,Reference,Action,User,Timestamp,Tag,Status"]
      .concat(filteredActivities.map(a => `${CLIENTS.find(c => c.id === a.clientId)?.name},${a.processType},${a.documentReference},${a.actionTaken},${USERS.find(u => u.id === a.userId)?.name},${a.timestamp},${a.tag},${a.status}`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `activities_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsUploading(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Activity Log</h1>
          <p className="text-zinc-500 text-sm">Document-level execution tracking</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            Upload Excel
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors"
          >
            <FileDown size={16} className="text-blue-600" />
            Export Data
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Activity
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900">Upload Activity Data</h2>
              <button onClick={() => setIsUploading(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 text-center">
              {uploadProgress === 0 ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Select Excel File</p>
                    <p className="text-xs text-zinc-500 mt-1">Supported formats: .xlsx, .xls, .csv</p>
                  </div>
                  <button 
                    onClick={handleUpload}
                    className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-500 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400">Processing activity records and validating references...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <Card className="p-0">
        <div className="p-4 border-b border-zinc-100 flex flex-wrap gap-4 items-center justify-between bg-zinc-50/30">
          <div className="flex gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by client, reference, or action..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={processFilter}
              onChange={(e) => setProcessFilter(e.target.value)}
            >
              <option value="All">All Processes</option>
              <option value="AP">AP</option>
              <option value="AR">AR</option>
              <option value="GL">GL</option>
              <option value="Billing">Billing</option>
              <option value="FP&A">FP&A</option>
            </select>
          </div>
          <button 
            onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 transition-all rounded-lg",
              isMoreFiltersOpen ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            )}
          >
            <Filter size={16} />
            <span className="text-sm font-medium">More Filters</span>
          </button>
        </div>

        <AnimatePresence>
          {isMoreFiltersOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-zinc-100 bg-zinc-50/50"
            >
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tag</label>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                  >
                    <option value="All">All Tags</option>
                    <option value="General">General</option>
                    <option value="Exception">Exception</option>
                    <option value="Clarification Required">Clarification Required</option>
                    <option value="Escalation">Escalation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Time Period</label>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="All">All Time</option>
                    <option value="today">Today</option>
                    <option value="last7">Last 7 Days</option>
                    <option value="last30">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-6 py-3 border-b border-zinc-100">Client</th>
                <th className="px-6 py-3 border-b border-zinc-100">Process</th>
                <th className="px-6 py-3 border-b border-zinc-100">Reference</th>
                <th className="px-6 py-3 border-b border-zinc-100">Action</th>
                <th className="px-6 py-3 border-b border-zinc-100">User</th>
                <th className="px-6 py-3 border-b border-zinc-100">Timestamp</th>
                <th className="px-6 py-3 border-b border-zinc-100">Tag</th>
                <th className="px-6 py-3 border-b border-zinc-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedActivities.map((act) => (
                <tr 
                  key={act.id} 
                  onClick={() => onActivityClick(act)}
                  className="hover:bg-zinc-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                    {CLIENTS.find(c => c.id === act.clientId)?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold",
                      act.processType === 'AP' ? "bg-blue-50 text-blue-700" :
                      act.processType === 'AR' ? "bg-emerald-50 text-emerald-700" :
                      act.processType === 'GL' ? "bg-purple-50 text-purple-700" :
                      "bg-zinc-100 text-zinc-700"
                    )}>
                      {act.processType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{act.documentReference}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900">{act.actionTaken}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {(() => {
                      const user = USERS.find(u => u.id === act.userId);
                      const isClientUser = currentUser.role === 'Client Manager' || currentUser.role === 'Client Viewer';
                      if (user?.role === 'Shadow User') {
                        return (isClientUser || isPresentationMode) ? user.primeDisplayName : `${user.name} (${user.primeDisplayName})`;
                      }
                      return user?.name;
                    })()}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{format(new Date(act.timestamp), 'MMM dd, HH:mm')}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      act.tag === 'Exception' ? 'error' : 
                      act.tag === 'Clarification Required' ? 'warning' : 
                      act.tag === 'Escalation' ? 'error' : 'default'
                    }>
                      {act.tag}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        act.status === 'Completed' ? "bg-emerald-500" :
                        act.status === 'In Progress' ? "bg-blue-500" : "bg-amber-500"
                      )} />
                      <span className="text-xs text-zinc-600">{act.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/30 flex justify-between items-center">
          <span className="text-xs text-zinc-500">
            Showing {filteredActivities.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} records
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-zinc-200 rounded text-xs hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-zinc-200 rounded text-xs hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const NewCommunicationModal = ({ isOpen, onClose, activity, onSubmit }: { isOpen: boolean, onClose: () => void, activity: Activity, onSubmit: (comm: Partial<Communication>) => void }) => {
  const client = CLIENTS.find(c => c.id === activity.clientId);
  const [tag, setTag] = useState('Clarification');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState(activity.reportingMode === 'Compound Reporting' ? activity.batchName || '' : activity.documentReference || '');

  useEffect(() => {
    const date = format(new Date(), 'dd/MM/yyyy');
    const ref = activity.reportingMode === 'Compound Reporting' ? activity.batchName : activity.documentReference;
    setSubject(`${activity.processType} – ${client?.name || 'Unknown'} – ${ref} – ${tag} – ${date}`);
  }, [activity, client, tag]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-900">New Communication</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Tag Type</label>
            <select 
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option>General</option>
              <option>Clarification Required</option>
              <option>Escalation</option>
              <option>Critical</option>
              <option>Email</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Subject Line (Auto-generated)</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Reference Number</label>
            <input 
              type="text" 
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Message</label>
            <textarea 
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>
        </div>
        
        <div className="p-6 bg-zinc-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Cancel</button>
          <button 
            onClick={() => {
              onSubmit({ subject, message, tag: tag as any, referenceNumber: reference });
              onClose();
            }}
            className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            Send Communication
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ActivityDetailPage = ({ activity, onBack, currentUser, auditLogs, decisionLogs, tasks, onAddCommunication, onUpdateCommunication, onUpdateTag, communications, isPresentationMode }: { 
  activity: Activity, 
  onBack: () => void, 
  currentUser: User, 
  auditLogs: AuditLog[], 
  decisionLogs: DecisionLog[], 
  tasks: Task[], 
  onAddCommunication: (c: Communication) => void, 
  onUpdateCommunication: (c: Communication) => void,
  onUpdateTag: (id: string, tag: Activity['tag']) => void,
  communications: Communication[],
  isPresentationMode?: boolean
}) => {
  const client = CLIENTS.find(c => c.id === activity.clientId);
  const [activeTab, setActiveTab] = useState<'details' | 'orchestration' | 'audit' | 'decisions'>('details');
  const [message, setMessage] = useState('');
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);

  const activityAuditLogs = auditLogs.filter(log => log.entityId === activity.id);
  const activityDecisionLogs = decisionLogs.filter(log => log.objectId === activity.id);
  const activityCommunications = communications.filter(c => c.objectId === activity.id);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage: Communication = {
      id: `comm-${Date.now()}`,
      objectType: 'Activity',
      objectId: activity.id,
      sender: currentUser.name,
      message: message,
      timestamp: new Date().toISOString(),
      priority: 'Medium',
      tag: 'General',
      subject: `RE: ${activity.documentReference} - Update`
    };
    onAddCommunication(newMessage);
    setMessage('');
  };

  const handleNewThread = (comm: Partial<Communication>) => {
    const newMessage: Communication = {
      id: `comm-${Date.now()}`,
      objectType: 'Activity',
      objectId: activity.id,
      sender: currentUser.name,
      message: comm.message || '',
      subject: comm.subject,
      referenceNumber: comm.referenceNumber,
      timestamp: new Date().toISOString(),
      priority: 'High',
      tag: comm.tag || 'General'
    };
    onAddCommunication(newMessage);
  };

  const handleEditMessage = (msg: Communication) => {
    setEditingMessageId(msg.id);
    setEditValue(msg.message);
  };

  const saveEdit = (msg: Communication) => {
    if (!editValue.trim()) return;
    onUpdateCommunication({ ...msg, message: editValue });
    setEditingMessageId(null);
  };

  const handleVersionUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsUploadingVersion(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const { dispatch } = useSystem();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{activity.documentReference}</h1>
          <p className="text-zinc-500 text-sm">{client?.name} • {activity.processType}</p>
        </div>
        <div className="ml-auto flex gap-2 items-center">
          {currentUser.role !== 'Client Viewer' && (
            <>
              <div className="flex items-center gap-2 mr-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
                <select 
                  className="text-xs font-bold bg-white border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  value={activity.status}
                  onChange={(e) => dispatch('ACTIVITY_STATUS_CHANGED', { activityId: activity.id, newStatus: e.target.value })}
                >
                  {['Pending', 'In Progress', 'Need Clarification', 'Completed', 'Escalated - Routed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 mr-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tag:</span>
                <select 
                  className="text-xs font-bold bg-white border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  value={activity.tag}
                  onChange={(e) => onUpdateTag(activity.id, e.target.value as Activity['tag'])}
                >
                  {['General', 'Exception', 'Clarification Required', 'Escalation', 'Rule Update', 'Follow Up Required'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <Badge variant={activity.status === 'Completed' ? 'success' : activity.status === 'In Progress' ? 'info' : 'warning'}>
            {activity.status}
          </Badge>
          <Badge variant={activity.tag === 'Exception' ? 'error' : activity.tag === 'Escalation' ? 'error' : activity.tag === 'Rule Update' ? 'info' : 'default'}>
            {activity.tag}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-zinc-200">
            {['details', 'orchestration', 'audit', 'decisions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2",
                  activeTab === tab 
                    ? "border-emerald-600 text-emerald-700" 
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <>
              <Card title="Activity Information">
                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Client</p>
                    <p className="text-sm font-medium text-zinc-900">{client?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Process Type</p>
                    <p className="text-sm font-medium text-zinc-900">{activity.processType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">ERP Reference</p>
                    <p className="text-sm font-medium text-zinc-900 font-mono">{activity.erpReference}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Action Taken</p>
                    <p className="text-sm font-medium text-zinc-900">{activity.actionTaken}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">User</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {(() => {
                        const user = USERS.find(u => u.id === activity.userId);
                        const isClientUser = currentUser.role === 'Client Manager' || currentUser.role === 'Client Viewer';
                        if (user?.role === 'Shadow User') {
                          return (isClientUser || isPresentationMode) ? user.primeDisplayName : `${user.name} (${user.primeDisplayName})`;
                        }
                        return user?.name;
                      })()}
                    </p>
                  </div>
                  {activity.reportingMode === 'Compound Reporting' && (
                    <>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Batch Name</p>
                        <p className="text-sm font-medium text-zinc-900">{activity.batchName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Document Count</p>
                        <p className="text-sm font-medium text-zinc-900">{activity.documentCount}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Processing Notes</p>
                        <p className="text-sm font-medium text-zinc-900">{activity.processingNotes}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">SLA Deadline</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900">
                        {activity.slaDeadline ? format(new Date(activity.slaDeadline), 'PPP p') : 'N/A'}
                      </p>
                      {activity.slaDeadline && new Date(activity.slaDeadline) < new Date() && (
                        <Badge variant="error">Breached</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Timestamp</p>
                    <p className="text-sm font-medium text-zinc-900">{format(new Date(activity.timestamp), 'PPP p')}</p>
                  </div>
                </div>
              </Card>

              <Card title="Attachments & Governance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setIsUploadingVersion(true)}
                    className="p-4 border border-zinc-200 rounded-lg flex flex-col items-center justify-center gap-2 bg-zinc-50/50 hover:bg-zinc-100 transition-colors cursor-pointer border-dashed"
                  >
                    <Upload className="text-zinc-400" size={24} />
                    <span className="text-xs font-medium text-zinc-500">Upload New Version</span>
                  </div>
                  <div 
                    onClick={() => setViewingDocument('invoice_scan.pdf')}
                    className="p-4 border border-zinc-200 rounded-lg flex items-center gap-3 bg-white hover:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-zinc-900 truncate">invoice_scan.pdf</p>
                        <Badge variant="info">v2</Badge>
                      </div>
                      <p className="text-[10px] text-zinc-400">Uploaded by {currentUser.name} • 2h ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'orchestration' && (
            <Card title="Workflow Orchestration Chain">
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2"><GitBranch size={16} /> Upstream Dependency Trigger</h3>
                  <p className="text-xs text-indigo-700">This parent Activity serves as the system boundary. Task workflows branch out from this entity.</p>
                </div>
                
                <div className="pl-6 border-l-2 border-indigo-100 space-y-4 py-4 relative">
                  {tasks.filter(t => t.linkedActivityId === activity.id).map(task => (
                    <div key={task.id} className="relative bg-white border border-zinc-200 p-4 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                      <div className="absolute top-1/2 -left-6 w-6 h-0.5 bg-indigo-100" />
                      <div className="absolute top-1/2 -left-[27px] w-3 h-3 rounded-full bg-indigo-500 border-[3px] border-white -translate-y-1/2" />
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{task.taskName}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                            <Users size={10} /> {USERS.find(u => u.id === task.assignedTo)?.name || 'Unassigned Queue'}
                          </p>
                        </div>
                        <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'Blocked' ? 'error' : 'warning'}>{task.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.linkedActivityId === activity.id).length === 0 && (
                    <p className="text-xs text-zinc-500 italic">No downstream tasks orchestrated yet.</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'audit' && (
            <Card title="System Audit Trail">
              <div className="space-y-6">
                {activityAuditLogs.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic">No audit logs found for this activity.</p>
                ) : (
                  activityAuditLogs.map((log) => (
                    <div key={log.id} className="flex gap-4">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-300" />
                        <div className="w-0.5 h-full bg-zinc-100 mx-auto" />
                      </div>
                      <div className="flex-1 pb-6 border-b border-zinc-50 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-zinc-900">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-zinc-400">{format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 mb-2">Performed by {USERS.find(u => u.id === log.changedBy)?.name || log.changedBy}</p>
                        {log.newValue && (
                          <div className="p-2 bg-zinc-50 rounded border border-zinc-100 text-[10px] font-mono">
                            {typeof log.newValue === 'object' ? JSON.stringify(log.newValue, null, 2) : String(log.newValue)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {activeTab === 'decisions' && (
            <Card title="Decision Log">
              <div className="space-y-4">
                {activityDecisionLogs.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                    <AlertCircle className="mx-auto text-zinc-300 mb-2" size={32} />
                    <p className="text-sm text-zinc-500">No formal decisions recorded yet.</p>
                  </div>
                ) : (
                  activityDecisionLogs.map((dec) => (
                    <div key={dec.id} className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="info">{dec.decisionType}</Badge>
                        <span className="text-[10px] text-zinc-400">{format(new Date(dec.timestamp), 'MMM dd, yyyy')}</span>
                      </div>
                      <p className="text-sm font-medium text-zinc-900 mb-2">{dec.comments}</p>
                      <p className="text-[10px] text-zinc-500">Decided by: <span className="font-bold">{USERS.find(u => u.id === dec.decidedBy)?.name || dec.decidedBy}</span></p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>

        <Card title="Communication Thread" className="flex flex-col h-[600px]">
          {currentUser.role !== 'Client Viewer' && (
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setIsCommModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                <Plus size={14} />
                New Thread
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {activityCommunications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                <MessageSquare size={32} strokeWidth={1} />
                <p className="text-xs">No messages yet</p>
              </div>
            ) : (
              activityCommunications.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex flex-col gap-1 max-w-[90%]",
                  msg.sender === currentUser.name ? "ml-auto items-end" : "items-start"
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-500">{msg.sender}</span>
                    <span className="text-[10px] text-zinc-400">{format(new Date(msg.timestamp), 'HH:mm')}</span>
                    {msg.sender === currentUser.name && (
                      <button 
                        onClick={() => handleEditMessage(msg)}
                        className="p-1 text-zinc-300 hover:text-zinc-500 transition-colors"
                      >
                        <Edit size={10} />
                      </button>
                    )}
                  </div>
                  {editingMessageId === msg.id ? (
                    <div className="w-full space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full p-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingMessageId(null)} className="text-[10px] font-bold text-zinc-400">Cancel</button>
                        <button onClick={() => saveEdit(msg)} className="text-[10px] font-bold text-emerald-600">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      "px-3 py-2 rounded-lg text-sm",
                      msg.sender === currentUser.name 
                        ? "bg-emerald-600 text-white rounded-tr-none" 
                        : "bg-zinc-100 text-zinc-800 rounded-tl-none"
                    )}>
                      {msg.message}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full pl-4 pr-12 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="p-1 text-zinc-400 hover:text-zinc-600"><Paperclip size={14} /></button>
              <button className="p-1 text-zinc-400 hover:text-zinc-600"><AlertCircle size={14} /></button>
            </div>
          </div>
        </Card>
      </div>

      {isUploadingVersion && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900">Upload New Version</h2>
              <button onClick={() => setIsUploadingVersion(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 text-center">
              {uploadProgress === 0 ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Select Document</p>
                    <p className="text-xs text-zinc-500 mt-1">Update {activity.documentReference}</p>
                  </div>
                  <button 
                    onClick={handleVersionUpload}
                    className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-500 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400">Creating new version and updating audit trail...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {viewingDocument && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-zinc-900/90 backdrop-blur-md">
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <FileDown size={20} />
            </button>
            <button onClick={() => setViewingDocument(null)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="w-full h-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{viewingDocument}</p>
                  <p className="text-[10px] text-zinc-500">v2 • PDF Document • 1.2 MB</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-zinc-200 flex items-center justify-center p-12">
              <div className="w-full max-w-2xl aspect-[1/1.4] bg-white shadow-lg rounded p-12 flex flex-col gap-8">
                <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-8">
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Invoice</h1>
                    <p className="text-sm text-zinc-500 mt-2">INV-2026-001</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">Client Name</p>
                    <p className="text-xs text-zinc-500">123 Business Ave</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-[10px] font-bold uppercase text-zinc-400 border-b border-zinc-100 pb-2">
                    <div className="col-span-2">Description</div>
                    <div className="text-right">Quantity</div>
                    <div className="text-right">Amount</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div className="col-span-2 font-medium">Professional Services - March 2026</div>
                    <div className="text-right">1.0</div>
                    <div className="text-right">$12,500.00</div>
                  </div>
                </div>
                <div className="mt-auto pt-8 border-t-2 border-zinc-900 flex justify-between items-end">
                  <div className="text-[10px] text-zinc-400">
                    <p>Payment Terms: Net 30</p>
                    <p>Bank: Global Trust Bank</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-zinc-400">Total Due</p>
                    <p className="text-2xl font-black">$12,500.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <NewCommunicationModal 
        isOpen={isCommModalOpen} 
        onClose={() => setIsCommModalOpen(false)} 
        activity={activity}
        onSubmit={handleNewThread}
      />
    </div>
  );
};

const TasksPage = ({ tasks, onTaskClick, onActivityClick, initialFilter }: { tasks: Task[], onTaskClick: (task: Task) => void, onActivityClick: (id: string) => void, initialFilter?: any }) => {
  const [filter, setFilter] = useState<Task['status'] | 'All'>(initialFilter?.status || 'All');

  useEffect(() => {
    if (initialFilter?.status) setFilter(initialFilter.status);
  }, [initialFilter]);

  const filteredTasks = tasks.filter(t => filter === 'All' || t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Task Engine</h1>
          <p className="text-zinc-500 text-sm">Manage work assignments and operational load</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-lg">
          {['All', 'Open', 'In Progress', 'Completed', 'Blocked'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                filter === s ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <CheckCircle2 className="mx-auto text-zinc-300 mb-2" size={48} strokeWidth={1} />
            <p className="text-zinc-500">No tasks found matching the filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="p-0 hover:border-emerald-500 transition-colors group cursor-pointer" onClick={() => onTaskClick(task)}>
              <div className="flex items-center p-4 gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  task.priority === 'Critical' ? "bg-rose-50 text-rose-600" :
                  task.priority === 'High' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                )}>
                  {task.priority === 'Critical' ? <AlertTriangle size={20} /> : <ClipboardList size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-zinc-900 truncate">{task.taskName}</h3>
                    <Badge variant={
                      task.status === 'Completed' ? 'success' :
                      task.status === 'Blocked' ? 'error' :
                      task.status === 'In Progress' ? 'info' : 'warning'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {CLIENTS.find(c => c.id === task.clientId)?.name} • {task.processType} • Due {format(new Date(task.dueDate), 'MMM dd')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Assigned To</p>
                  <p className="text-xs font-medium text-zinc-900">{USERS.find(u => u.id === task.assignedTo)?.name || 'Unassigned'}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    task.linkedActivityId && onActivityClick(task.linkedActivityId);
                  }}
                  className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const TaskDetailPage = ({ task, auditLogs, activities, onBack, onActivityClick }: { task: Task, auditLogs: AuditLog[], activities: Activity[], onBack: () => void, onActivityClick: (id: string) => void }) => {
  const { dispatch } = useSystem();
  
  const assignedUser = USERS.find(u => u.id === task.assignedTo);
  const client = CLIENTS.find(c => c.id === task.clientId);
  const linkedActivity = task.linkedActivityId ? activities.find(a => a.id === task.linkedActivityId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">{task.taskName}</h1>
            <Badge variant={
              task.status === 'Completed' ? 'success' :
              task.status === 'Blocked' ? 'error' :
              task.status === 'In Progress' ? 'info' : 'warning'
            }>
              {task.status}
            </Badge>
          </div>
          <p className="text-zinc-500 text-sm">{client?.name} • {task.processType} • Task ID: {task.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Task Overview">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Priority</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    task.priority === 'Critical' ? "bg-rose-500" :
                    task.priority === 'High' ? "bg-amber-500" : "bg-blue-500"
                  )} />
                  <span className="text-sm font-medium text-zinc-900">{task.priority}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Due Date</p>
                <p className="text-sm font-medium text-zinc-900">{format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Assigned To</p>
                <p className="text-sm font-medium text-zinc-900">{assignedUser?.name || 'Unassigned'}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                This task involves the processing and verification of {task.processType} items for {client?.name}. 
                Please ensure all rules in the Rule Library are followed and any exceptions are logged immediately.
              </p>
            </div>
          </Card>

          {linkedActivity && (
            <Card title="Linked Activity">
              <div 
                onClick={() => onActivityClick(linkedActivity.id)}
                className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 hover:border-emerald-500 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900">{linkedActivity.documentReference}</span>
                    <Badge variant={linkedActivity.status === 'Completed' ? 'success' : 'warning'}>{linkedActivity.status}</Badge>
                  </div>
                  <ChevronRight size={16} className="text-zinc-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-xs text-zinc-500 line-clamp-2">{linkedActivity.actionTaken}</p>
                <div className="mt-3 flex items-center gap-4 text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                  <span>{linkedActivity.processType}</span>
                  <span>{format(new Date(linkedActivity.timestamp), 'MMM dd, HH:mm')}</span>
                </div>
              </div>
            </Card>
          )}

          <Card title="Orchestration Audit Ledger">
            <div className="space-y-4">
              {auditLogs.length > 0 ? auditLogs.map((log) => (
                <div key={log.id} className="flex gap-4 group">
                  <div className="w-px bg-zinc-200 relative mt-2">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-zinc-300 group-hover:bg-indigo-500 transition-colors" />
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-sm font-bold text-zinc-900">{log.action.replace(/_/g, ' ')}</p>
                    {log.notes && <p className="text-xs text-zinc-600 mt-0.5">{log.notes}</p>}
                    <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">
                      {USERS.find(u => u.id === log.changedBy)?.name || 'System Orchestrator'} • {format(new Date(log.timestamp), 'MMM dd HH:mm')}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-zinc-500 italic">No recent transactions recorded in ledger. Awaiting execution state changes.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Enterprise Orchestration Control">
            <div className="space-y-3">
              <button 
                onClick={() => dispatch('TASK_STATUS_CHANGED', { taskId: task.id, newStatus: 'Completed' })}
                disabled={task.status === 'Blocked'}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
                <CheckCircle2 size={16} /> Execute Completion
              </button>
              <button 
                onClick={() => {
                  const newUserId = prompt('Enter Internal User ID to reassign (e.g., u2):');
                  if (newUserId) dispatch('TASK_REASSIGNED', { taskId: task.id, newUserId });
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-bold rounded-xl hover:bg-zinc-50 transition-colors">
                <Users size={16} /> Reassign Task Workflow
              </button>
              <button 
                onClick={() => dispatch('TASK_STATUS_CHANGED', { taskId: task.id, newStatus: 'Blocked' })}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors">
                <AlertTriangle size={16} /> Force Dependency Block
              </button>
            </div>
            
            {task.status === 'Blocked' && (
              <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-100 text-xs text-rose-700">
                <span className="font-bold flex items-center gap-1 mb-1"><Lock size={12} /> Orchestration Lock Engaged</span>
                This task is suspended due to an upstream requirement or client clarification. Completion actions are disabled.
              </div>
            )}
          </Card>

          <Card title="Contextual Rules">
            <div className="space-y-3">
              {RULES.filter(r => r.clientId === task.clientId && r.process === task.processType).slice(0, 3).map(rule => (
                <div key={rule.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">v{rule.version}</p>
                  <p className="text-xs text-zinc-700 line-clamp-2">{rule.description}</p>
                </div>
              ))}
              {RULES.filter(r => r.clientId === task.clientId && r.process === task.processType).length === 0 && (
                <p className="text-xs text-zinc-400 italic">No specific rules found for this process.</p>
              )}
            </div>
          </Card>

          <Card title="AI Operations Copilot" className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <div className="space-y-4">
              <div className="flex gap-2 items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5"><Zap size={10} /></div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Delay Prediction: {task.priority === 'Critical' ? '98%' : '24%'} Risk</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Based on historical cycle times for {task.processType} workflows at {client?.name}.</p>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><GitBranch size={10} /></div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Dependent Systems</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Completion will trigger downstream SAP Subledger Sync algorithms via the Event Bus.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const AuditViewerPage = ({ auditLogs }: { auditLogs: AuditLog[] }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Global Audit Viewer</h1>
        <p className="text-zinc-500 text-sm">Full transparency of system behavior and user actions</p>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-6 py-3 border-b border-zinc-100">Timestamp</th>
                <th className="px-6 py-3 border-b border-zinc-100">Action</th>
                <th className="px-6 py-3 border-b border-zinc-100">Entity</th>
                <th className="px-6 py-3 border-b border-zinc-100">User</th>
                <th className="px-6 py-3 border-b border-zinc-100">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-[10px] text-zinc-500 font-mono">
                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={log.action.includes('BREACH') || log.action.includes('ERROR') ? 'error' : 'default'}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-600">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-900">
                    {USERS.find(u => u.id === log.changedBy)?.name || log.changedBy}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[300px] truncate text-[10px] text-zinc-500 font-mono">
                      {log.newValue ? JSON.stringify(log.newValue) : '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const SettingsPage = ({ settings, onUpdate, currentUser }: { settings: Settings, onUpdate: (s: Settings) => void, currentUser: User }) => {
  const isAdmin = currentUser.role === 'Admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Platform Settings</h1>
        <p className="text-zinc-500 text-sm">Configure system behavior and operational rules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="System Behavior & Simulation">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-zinc-900">Simulation Mode</p>
                <p className="text-xs text-zinc-500">Auto-generate activities and events for testing</p>
              </div>
              <button 
                onClick={() => onUpdate({ ...settings, simulationMode: !settings.simulationMode })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.simulationMode ? "bg-emerald-500" : "bg-zinc-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.simulationMode ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-zinc-900">Shadow User Masking</p>
                <p className="text-xs text-zinc-500">Hide shadow user identities from client views</p>
              </div>
              <button 
                onClick={() => onUpdate({ ...settings, shadowUser: { ...settings.shadowUser, maskingEnabled: !settings.shadowUser.maskingEnabled } })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.shadowUser.maskingEnabled ? "bg-emerald-500" : "bg-zinc-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.shadowUser.maskingEnabled ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </Card>

        <Card title="SLA Configuration">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Warning Threshold (Hours)</label>
              <input 
                type="number" 
                value={settings.sla.warningHours}
                onChange={e => onUpdate({ ...settings, sla: { ...settings.sla, warningHours: parseInt(e.target.value) } })}
                className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Escalation 1 (Hours)</label>
              <input 
                type="number" 
                value={settings.sla.escalation1Hours}
                onChange={e => onUpdate({ ...settings, sla: { ...settings.sla, escalation1Hours: parseInt(e.target.value) } })}
                className="w-full mt-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </Card>

        {isAdmin && (
          <>
            <Card title="Workflow & Task Engine" icon={GitBranch}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Auto-Task Generation</p>
                    <p className="text-xs text-zinc-500">Create tasks automatically on activity events</p>
                  </div>
                  <button className="w-10 h-5 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Priority Weighting</p>
                    <p className="text-xs text-zinc-500">Adjust priority based on client tier</p>
                  </div>
                  <button className="w-10 h-5 bg-zinc-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Client Isolation & Security" icon={Shield}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Strict Data Segregation</p>
                    <p className="text-xs text-zinc-500">Prevent cross-client data leakage</p>
                  </div>
                  <button className="w-10 h-5 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Audit Trail Enforcement</p>
                    <p className="text-xs text-zinc-500">Log all data access attempts</p>
                  </div>
                  <button className="w-10 h-5 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Communication Templates" icon={MessageSquare}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Default Subject Prefix</label>
                  <input type="text" defaultValue="[XTGlobal-OPS]" className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Auto-Reply on Escalation</p>
                    <p className="text-xs text-zinc-500">Send confirmation to client on escalation</p>
                  </div>
                  <button className="w-10 h-5 bg-zinc-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Rule Engine Config" icon={BookOpen}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Global Rule Enforcement</p>
                    <p className="text-xs text-zinc-500">Apply base rules across all clients</p>
                  </div>
                  <button className="w-10 h-5 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Rule Versioning</p>
                    <p className="text-xs text-zinc-500">Maintain history of rule changes</p>
                  </div>
                  <button className="w-10 h-5 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

const ScopeDetailPage = ({ scope, activities, onBack, onActivityClick }: {
  scope: ScopeCommitment,
  activities: Activity[],
  onBack: () => void,
  onActivityClick: (activity: Activity) => void
}) => {
  const linkedActivities = activities.filter(a => a.clientId === scope.clientId && a.processType === scope.activityName);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Scope Commitment Details</h1>
          <p className="text-zinc-500 text-sm">{CLIENTS.find(c => c.id === scope.clientId)?.name} • {scope.activityName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Commitment Overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Period</p>
                <p className="text-sm font-medium text-zinc-900">{scope.period}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Due Date</p>
                <p className="text-sm font-medium text-zinc-900">{format(new Date(scope.dueDate), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Status</p>
                <Badge variant={scope.status === 'Completed' ? 'success' : scope.status === 'Delayed' ? 'error' : 'warning'}>
                  {scope.status}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Completion</p>
                <p className="text-sm font-bold text-emerald-600">{scope.completionPercentage}%</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${scope.completionPercentage}%` }} 
                />
              </div>
            </div>
          </Card>

          <Card title="Linked Operational Activities" className="p-0">
            <div className="divide-y divide-zinc-100">
              {linkedActivities.map(act => (
                <div 
                  key={act.id} 
                  className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer flex items-center justify-between group"
                  onClick={() => onActivityClick(act)}
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{act.documentReference || act.batchName}</p>
                    <p className="text-xs text-zinc-500">{act.actionTaken}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-zinc-400">{format(new Date(act.timestamp), 'MMM dd')}</span>
                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
              ))}
              {linkedActivities.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm italic">No linked activities found for this scope period.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="SLA Context">
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Standard SLA</p>
                <p className="text-sm font-medium text-blue-900">48 Hours from Receipt</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Current Performance</p>
                <p className="text-sm font-medium text-amber-900">Average 42.5 Hours</p>
              </div>
            </div>
          </Card>
          
          <Card title="Ownership">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-700">
                {scope.owner.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{scope.owner}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Scope Owner</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ScopeSLAPage = ({ scopes, onStatusChange, onScopeClick, initialFilter, currentUser }: { 
  scopes: ScopeCommitment[], 
  onStatusChange: (id: string, s: ScopeCommitment['status']) => void,
  onScopeClick: (scope: ScopeCommitment) => void,
  initialFilter?: any,
  currentUser: User
}) => {
  const [view, setView] = useState<'checklist' | 'calendar'>('checklist');
  const [statusFilter, setStatusFilter] = useState<ScopeCommitment['status'] | 'All'>(initialFilter?.status || 'All');

  useEffect(() => {
    if (initialFilter?.status) setStatusFilter(initialFilter.status);
  }, [initialFilter]);

  const filteredScopes = scopes.filter(s => statusFilter === 'All' || s.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Scope & SLA</h1>
          <p className="text-zinc-500 text-sm">Service commitments and month-end progress</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            <button 
              onClick={() => setView('checklist')}
              className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all", view === 'checklist' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}
            >
              Checklist
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={cn("px-4 py-1.5 text-xs font-medium rounded-md transition-all", view === 'calendar' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={cn("p-4 flex flex-col gap-1 cursor-pointer hover:bg-zinc-50 transition-colors", statusFilter === 'All' && "bg-zinc-50 ring-1 ring-zinc-200")}
          onClick={() => setStatusFilter('All')}
        >
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Overall Progress</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-zinc-900">68%</span>
            <span className="text-xs text-emerald-600 font-medium">+12% vs last month</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
          </div>
        </Card>
        <Card 
          className={cn("p-4 flex flex-col gap-1 cursor-pointer hover:bg-zinc-50 transition-colors", statusFilter === 'Completed' && "bg-zinc-50 ring-1 ring-zinc-200")}
          onClick={() => setStatusFilter('Completed')}
        >
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Completed</span>
          <span className="text-2xl font-bold text-zinc-900">{scopes.filter(s => s.status === 'Completed').length}/{scopes.length}</span>
          <p className="text-xs text-zinc-500 mt-2">Tasks finalized</p>
        </Card>
        <Card 
          className={cn("p-4 flex flex-col gap-1 cursor-pointer hover:bg-zinc-50 transition-colors", statusFilter === 'Delayed' && "bg-zinc-50 ring-1 ring-zinc-200")}
          onClick={() => setStatusFilter('Delayed')}
        >
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Delayed</span>
          <span className="text-2xl font-bold text-rose-600">{scopes.filter(s => s.status === 'Delayed').length}</span>
          <p className="text-xs text-zinc-500 mt-2">Requires attention</p>
        </Card>
        <Card 
          className={cn("p-4 flex flex-col gap-1 cursor-pointer hover:bg-zinc-50 transition-colors", statusFilter === 'Awaiting Client' && "bg-zinc-50 ring-1 ring-zinc-200")}
          onClick={() => setStatusFilter('Awaiting Client')}
        >
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Awaiting Client</span>
          <span className="text-2xl font-bold text-amber-600">{scopes.filter(s => s.status === 'Awaiting Client').length}</span>
          <p className="text-xs text-zinc-500 mt-2">Pending external action</p>
        </Card>
      </div>

      {view === 'checklist' ? (
        <Card title={statusFilter === 'All' ? "All Commitments" : `${statusFilter} Commitments`} className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3 border-b border-zinc-100">Activity Name</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Client</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Due Date</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Owner</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Status</th>
                  <th className="px-6 py-3 border-b border-zinc-100">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredScopes.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                    onClick={() => onScopeClick(item)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 group-hover:text-emerald-600 transition-colors">{item.activityName}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{CLIENTS.find(c => c.id === item.clientId)?.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{format(new Date(item.dueDate), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{item.owner}</td>
                    <td className="px-6 py-4">
                      {currentUser.role !== 'Client Viewer' ? (
                        <select 
                          value={item.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            onStatusChange(item.id, e.target.value as any);
                          }}
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider outline-none border-none cursor-pointer",
                            item.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                            item.status === 'Delayed' ? "bg-rose-100 text-rose-700" :
                            item.status === 'Awaiting Client' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          )}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Awaiting Client">Awaiting Client</option>
                          <option value="Delayed">Delayed</option>
                        </select>
                      ) : (
                        <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Delayed' ? 'error' : item.status === 'Awaiting Client' ? 'warning' : 'default'}>
                          {item.status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden min-w-[60px]">
                          <div className={cn(
                            "h-full rounded-full",
                            item.completionPercentage === 100 ? "bg-emerald-500" : "bg-blue-500"
                          )} style={{ width: `${item.completionPercentage}%` }} />
                        </div>
                        <span className="text-xs font-medium text-zinc-600">{item.completionPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredScopes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                      No commitments found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] text-zinc-400">
          <Calendar size={48} strokeWidth={1} className="mb-4" />
          <p className="text-sm font-medium">Calendar view is under development</p>
          <p className="text-xs">Switch to Checklist view to see all commitments</p>
        </Card>
      )}
    </div>
  );
};

const ClientsPage = ({ onClientClick, assignedClients }: { onClientClick: (c: Client) => void, assignedClients: Client[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Client Directory</h1>
          <p className="text-zinc-500 text-sm">Manage client relationships and assigned teams</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedClients.map((client) => (
          <div key={client.id} onClick={() => onClientClick(client)}>
            <Card className="hover:border-emerald-500 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-900 font-bold text-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  {client.name.charAt(0)}
                </div>
                <Badge variant={client.status === 'Active' ? 'success' : 'warning'}>{client.status}</Badge>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">{client.name}</h3>
              <p className="text-xs text-zinc-500 mb-4">{client.industry}</p>
              
              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Assigned Team</span>
                  <span className="text-xs font-medium text-zinc-700">{client.assignedTeam}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Active Processes</span>
                  <div className="flex gap-1">
                    {client.activeProcesses.map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-zinc-100 rounded text-[9px] font-bold text-zinc-600">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-2">
                <button className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-lg text-xs font-semibold transition-colors">View Details</button>
                <button className="p-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-lg transition-colors"><MoreVertical size={16} /></button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClientDetailPage = ({ client, onBack, currentUser, onNavigate }: { 
  client: Client, 
  onBack: () => void,
  currentUser: User,
  onNavigate: (page: Page, filter?: any) => void
}) => {
  const isAdmin = currentUser.userType === 'Admin' || currentUser.userType === 'Internal';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900">{client.name}</h1>
              <Badge variant={client.status === 'Active' ? 'success' : 'warning'}>{client.status}</Badge>
            </div>
            <p className="text-zinc-500 text-sm">{client.industry} • {client.assignedTeam}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">Edit Client</button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Client Settings</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                label: 'Active Activities', 
                value: ACTIVITIES.filter(a => a.clientId === client.id && a.status !== 'Closed').length, 
                icon: FileText, 
                color: 'text-blue-600', 
                bg: 'bg-blue-50',
                onClick: () => onNavigate('activity-log', { clientId: client.id, status: 'Active' })
              },
              { 
                label: 'SLA Compliance', 
                value: '99.8%', 
                icon: CheckCircle2, 
                color: 'text-emerald-600', 
                bg: 'bg-emerald-50',
                onClick: () => onNavigate('sla-center', { clientId: client.id })
              },
              { 
                label: 'Open Escalations', 
                value: ACTIVITIES.filter(a => a.clientId === client.id && a.status.includes('Escalated')).length, 
                icon: AlertCircle, 
                color: 'text-rose-600', 
                bg: 'bg-rose-50',
                onClick: () => onNavigate('activity-log', { clientId: client.id, status: 'Escalated' })
              },
            ].map((stat) => (
              <div key={stat.label} onClick={stat.onClick} className="cursor-pointer group">
                <Card className="p-5 group-hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                      <stat.icon className={stat.color} size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {isAdmin && (
            <Card title="Process Summary & Overview">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {client.activeProcesses.map(process => (
                  <div key={process} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{process}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-lg font-bold text-zinc-900">{Math.floor(Math.random() * 50) + 10}</p>
                      <span className="text-[10px] text-emerald-600 font-bold">+12%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={client.activeProcesses.map(p => ({ name: p, value: Math.floor(Math.random() * 40) + 10 }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {!isAdmin && (
            <Card title="Process Health">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={client.activeProcesses.map(p => ({ name: p, value: Math.floor(Math.random() * 40) + 10 }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card title="Recent Client Activities">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reference</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {ACTIVITIES.filter(a => a.clientId === client.id).slice(0, 5).map(act => (
                    <tr key={act.id} className="hover:bg-zinc-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900">{act.documentReference}</td>
                      <td className="px-6 py-4"><Badge variant="info">{act.processType}</Badge></td>
                      <td className="px-6 py-4"><Badge variant={act.status.includes('Escalated') ? 'error' : 'default'}>{act.status}</Badge></td>
                      <td className="px-6 py-4 text-xs text-zinc-500">{format(new Date(act.timestamp), 'MMM dd')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => onNavigate('activity-log', { clientId: client.id })}
              className="w-full py-3 text-xs font-bold text-zinc-500 hover:text-emerald-600 transition-colors border-t border-zinc-100"
            >
              View Full Activity Log
            </button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Client Rules">
            <div className="space-y-4">
              {RULES.filter(r => r.clientId === client.id).map(rule => (
                <div key={rule.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="info">{rule.process}</Badge>
                    <span className="text-[10px] font-bold text-zinc-400">v{rule.version}</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{rule.description}</p>
                </div>
              ))}
              <button 
                onClick={() => onNavigate('rule-library', { clientId: client.id })}
                className="w-full py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
              >
                View All Rules
              </button>
            </div>
          </Card>

          <Card title="Assigned Team & Resources">
            <div className="space-y-4">
              {USERS.filter(u => u.assignedClientIds?.includes(client.id) || u.role === 'Internal Manager').slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{user.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{user.role}</p>
                    </div>
                  </div>
                  <Badge variant={user.status === 'Active' ? 'success' : 'default'} className="text-[8px] px-1.5 py-0">
                    {user.status}
                  </Badge>
                </div>
              ))}
              {isAdmin && (
                <button className="w-full py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-200">Manage Resources</button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const RuleDetailPage = ({ rule, auditLogs, decisionLogs, onBack }: {
  rule: Rule,
  auditLogs: AuditLog[],
  decisionLogs: DecisionLog[],
  onBack: () => void
}) => {
  const ruleAuditLogs = auditLogs.filter(l => l.entityId === rule.id);
  const ruleDecisions = decisionLogs.filter(d => d.objectId === rule.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Rule Details</h1>
          <p className="text-zinc-500 text-sm">{CLIENTS.find(c => c.id === rule.clientId)?.name} • {rule.process}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Governance Instruction">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 mb-4">
              <p className="text-sm text-zinc-700 leading-relaxed">{rule.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Version</p>
                <p className="text-sm font-mono text-zinc-900">v{rule.version}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Effective Date</p>
                <p className="text-sm text-zinc-900">{format(new Date(rule.effectiveDate), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </Card>

          <Card title="Decision History" className="p-0">
            <div className="divide-y divide-zinc-100">
              {ruleDecisions.map(dec => (
                <div key={dec.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={dec.decisionType === 'Approved' ? 'success' : dec.decisionType === 'Rejected' ? 'error' : 'warning'}>
                      {dec.decisionType}
                    </Badge>
                    <span className="text-[10px] text-zinc-400">{format(new Date(dec.timestamp), 'MMM dd, HH:mm')}</span>
                  </div>
                  <p className="text-xs text-zinc-600 mb-2">{dec.comments}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Decided By: {dec.decidedBy}</p>
                </div>
              ))}
              {ruleDecisions.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm italic">No decisions recorded for this rule.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Audit Trail" className="p-0">
            <div className="divide-y divide-zinc-100">
              {ruleAuditLogs.map(log => (
                <div key={log.id} className="p-4">
                  <p className="text-xs font-bold text-zinc-900 mb-1">{log.action}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500">{log.changedBy}</span>
                    <span className="text-[10px] text-zinc-400">{format(new Date(log.timestamp), 'MMM dd')}</span>
                  </div>
                </div>
              ))}
              {ruleAuditLogs.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm italic">No audit logs.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const RuleLibraryPage = ({ rules, onRuleClick, initialFilter, currentUser }: { 
  rules: Rule[],
  onRuleClick: (rule: Rule) => void,
  initialFilter?: any,
  currentUser: User
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [processFilter, setProcessFilter] = useState(initialFilter?.process || 'All');

  useEffect(() => {
    if (initialFilter?.process) setProcessFilter(initialFilter.process);
  }, [initialFilter]);

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         CLIENTS.find(c => c.id === rule.clientId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProcess = processFilter === 'All' || rule.process === processFilter;
    return matchesSearch && matchesProcess;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Rule Library</h1>
          <p className="text-zinc-500 text-sm">Governance and client-specific instructions</p>
        </div>
        {currentUser.role !== 'Client Viewer' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Rule
          </button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Search rules or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
        <select 
          value={processFilter}
          onChange={(e) => setProcessFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
        >
          <option value="All">All Processes</option>
          <option value="AP">AP</option>
          <option value="AR">AR</option>
          <option value="GL">GL</option>
          <option value="Billing">Billing</option>
        </select>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-6 py-3 border-b border-zinc-100">Client</th>
                <th className="px-6 py-3 border-b border-zinc-100">Process</th>
                <th className="px-6 py-3 border-b border-zinc-100">Description</th>
                <th className="px-6 py-3 border-b border-zinc-100">Version</th>
                <th className="px-6 py-3 border-b border-zinc-100">Effective Date</th>
                <th className="px-6 py-3 border-b border-zinc-100">Status</th>
                <th className="px-6 py-3 border-b border-zinc-100"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRules.map((rule) => (
                <tr 
                  key={rule.id} 
                  className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                  onClick={() => onRuleClick(rule)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900 group-hover:text-emerald-600 transition-colors">{CLIENTS.find(c => c.id === rule.clientId)?.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold text-zinc-600">{rule.process}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 max-w-md truncate">{rule.description}</td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-500">v{rule.version}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{format(new Date(rule.effectiveDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      rule.status === 'Approved' ? 'success' :
                      rule.status === 'Draft' ? 'default' : 'warning'
                    }>
                      {rule.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 text-zinc-400 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-lg font-bold">Add New Rule</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Client</label>
                  <select className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none">
                    {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Process</label>
                  <select className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none">
                    <option value="AP">AP</option>
                    <option value="AR">AR</option>
                    <option value="GL">GL</option>
                    <option value="Billing">Billing</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe the rule or instruction..."
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Effective Date</label>
                    <input type="date" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Version</label>
                    <input type="text" placeholder="1.0" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Save Rule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DemoPage = () => {
  const slides = [
    {
      title: "XTGlobal OPS FLOW Platform Overview",
      description: "A governance and visibility layer designed for outsourced accounting delivery.",
      points: [
        "Execution transparency between teams and clients",
        "Structured communication tied to work items",
        "Service delivery visibility above ERP systems",
        "Real-time operational control center"
      ],
      icon: Presentation
    },
    {
      title: "Dashboard Transparency",
      description: "Real-time visibility into daily operations and key performance indicators.",
      points: [
        "Summary cards for immediate status awareness",
        "Activity trends and process breakdowns",
        "Recent activity feed for drill-down transparency",
        "Exception and clarification tracking"
      ],
      icon: LayoutDashboard
    },
    {
      title: "Document-Level Activity Tracking",
      description: "Granular audit trail of every action performed on client documents.",
      points: [
        "Detailed activity logs with ERP cross-references",
        "Process-specific tagging (AP, AR, GL, etc.)",
        "User and timestamp accountability",
        "Searchable and filterable history"
      ],
      icon: FileText
    },
    {
      title: "Communication Governance",
      description: "Contextual threads linked directly to activities, reducing email clutter.",
      points: [
        "Messages tied to specific document references",
        "Priority flags and categorization",
        "Chronological timeline of decisions",
        "Internal and client-facing transparency"
      ],
      icon: MessageSquare
    },
    {
      title: "Scope & SLA Visibility",
      description: "Tracking recurring service commitments and month-end progress.",
      points: [
        "Checklist and calendar views of commitments",
        "Real-time completion percentage tracking",
        "Owner accountability and deadline management",
        "Early warning for delayed activities"
      ],
      icon: Calendar
    },
    {
      title: "Rule Library & Instruction Tracking",
      description: "Formal governance of client-specific rules and processing instructions.",
      points: [
        "Version-controlled rule repository",
        "Approval workflows for rule changes",
        "Effective date tracking",
        "Direct link between rules and activities"
      ],
      icon: BookOpen
    },
    {
      title: "Operational Benefits",
      description: "Transforming outsourced accounting from a 'black box' to a transparent service.",
      points: [
        "Reduced manual reporting efforts",
        "Faster clarification and exception resolution",
        "Improved compliance and audit readiness",
        "Enhanced client trust through visibility"
      ],
      icon: ArrowUpRight
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full"
        >
          <Card className="p-12 min-h-[500px] flex flex-col justify-center bg-zinc-950 text-white border-zinc-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                {React.createElement(slides[currentSlide].icon, { size: 28 })}
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{slides[currentSlide].title}</h2>
                <p className="text-zinc-400 mt-1">{slides[currentSlide].description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {slides[currentSlide].points.map((point, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
                  <span className="text-zinc-300 text-sm leading-relaxed">{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                Slide {currentSlide + 1} of {slides.length}
              </span>
              <div className="flex gap-4">
                <button 
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  disabled={currentSlide === 0}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Previous
                </button>
                <button 
                  onClick={() => {
                    if (currentSlide === slides.length - 1) {
                      setCurrentSlide(0);
                    } else {
                      setCurrentSlide(prev => prev + 1);
                    }
                  }}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-900/20 transition-all"
                >
                  {currentSlide === slides.length - 1 ? "Restart Demo" : "Next Slide"}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const CommunicationDetailPage = ({ communication, activities, communications, onBack, onActivityClick, onReply, currentUser }: {
  communication: Communication,
  activities: Activity[],
  communications: Communication[],
  onBack: () => void,
  onActivityClick: (activity: Activity) => void,
  onReply: (message: string, tag?: Communication['tag']) => void,
  currentUser: User
}) => {
  const { dispatch } = useSystem();
  const activity = activities.find(a => a.id === communication.objectId);
  const threadMessages = communications
    .filter(c => c.objectId === communication.objectId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const [replyMessage, setReplyMessage] = useState('');
  const [replyTag, setReplyTag] = useState<Communication['tag']>(communication.tag);

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    onReply(replyMessage, replyTag);
    // Directly push orchestration
    dispatch('COMMUNICATION_REPLY_SENT', { activityId: activity?.id, tag: replyTag, senderId: currentUser.id });
    setReplyMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Communication Thread</h1>
          <p className="text-zinc-500 text-sm">{communication.subject || 'General Inquiry'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {threadMessages.map((msg, idx) => (
              <Card key={msg.id} className={cn("p-6", msg.sender === currentUser.name ? "bg-emerald-50/30 border-emerald-100" : "bg-white")}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      msg.sender === currentUser.name ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                    )}>
                      {msg.sender.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{msg.sender}</p>
                      <p className="text-[10px] text-zinc-500">{format(new Date(msg.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {msg.tag && (
                      <Badge variant={msg.tag === 'Critical' || msg.tag === 'Escalation' ? 'error' : 'default'}>
                        {msg.tag}
                      </Badge>
                    )}
                    {idx === 0 && (
                      <Badge variant={msg.priority === 'High' ? 'error' : 'default'}>
                        {msg.priority} Priority
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none text-zinc-700 leading-relaxed">
                  {msg.message}
                </div>

                {idx === 0 && (
                  <div className="pt-6 mt-6 border-t border-zinc-100">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase mb-3">Initial Attachments</h4>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs text-zinc-600 hover:bg-zinc-100 cursor-pointer transition-colors">
                        <Paperclip size={14} />
                        <span>invoice_scan_001.pdf</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {currentUser.role !== 'Client Viewer' && (
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">Reply to Thread</h3>
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Update Tag</label>
                <select 
                  value={replyTag}
                  onChange={(e) => setReplyTag(e.target.value as any)}
                  className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="General">General</option>
                  <option value="Clarification Required">Clarification Required</option>
                  <option value="Escalation">Escalation</option>
                  <option value="Critical">Critical</option>
                  <option value="Email">Email (Triggers Notification)</option>
                </select>
              </div>
              <textarea 
                className="w-full h-32 p-4 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-4"
                placeholder="Type your response here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleSendReply}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  <Send size={16} />
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {activity && (
            <Card title="Linked Activity">
              <div 
                className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-emerald-500 cursor-pointer transition-all group"
                onClick={() => onActivityClick(activity)}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-zinc-900">{activity.documentReference}</p>
                  <ChevronRight size={16} className="text-zinc-300 group-hover:text-emerald-600" />
                </div>
                <p className="text-xs text-zinc-500 mb-2">{activity.processType} • {activity.actionTaken}</p>
                <Badge variant={activity.status === 'Completed' ? 'success' : 'warning'}>
                  {activity.status}
                </Badge>
              </div>
            </Card>
          )}

          <Card title="Thread Metadata">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Reference Number</p>
                <p className="text-xs font-mono text-zinc-900">{communication.referenceNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Tag Type</p>
                <Badge variant={communication.tag === 'Escalation' ? 'error' : 'default'}>
                  {communication.tag}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CommunicationsPage = ({ communications, onActivityClick, onCommunicationClick, currentUser, initialFilter, isPresentationMode }: { 
  communications: Communication[], 
  onActivityClick: (activity: Activity) => void,
  onCommunicationClick: (comm: Communication) => void,
  currentUser: User,
  initialFilter?: any,
  isPresentationMode?: boolean
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState(initialFilter?.tag || 'All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open for Answers'>('All');

  useEffect(() => {
    if (initialFilter?.tag) setTagFilter(initialFilter.tag);
  }, [initialFilter]);

  const isClient = currentUser.role === 'Client Manager' || currentUser.role === 'Client Viewer';

  const filtered = communications.filter(c => {
    const activity = ACTIVITIES.find(a => a.id === c.objectId);
    if (isClient && activity?.clientId !== currentUser.clientId) return false;
    
    const matchesSearch = c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = tagFilter === 'All' || c.tag === tagFilter;

    const matchesStatus = statusFilter === 'All' || c.tag === 'Clarification Required';
    
    return matchesSearch && matchesTag && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Central Communications</h1>
          <p className="text-zinc-500 text-sm">All activity-linked communication threads and document clarifications</p>
        </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Status</option>
              <option value="Open for Answers">Open for Answers</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Search communications..." 
              className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-6 py-3 border-b border-zinc-100">Subject</th>
                <th className="px-6 py-3 border-b border-zinc-100">Client</th>
                <th className="px-6 py-3 border-b border-zinc-100">Reference</th>
                <th className="px-6 py-3 border-b border-zinc-100">Tag Type</th>
                <th className="px-6 py-3 border-b border-zinc-100">Created By</th>
                <th className="px-6 py-3 border-b border-zinc-100">Timestamp</th>
                <th className="px-6 py-3 border-b border-zinc-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(comm => {
                const activity = ACTIVITIES.find(a => a.id === comm.objectId);
                const client = CLIENTS.find(c => c.id === activity?.clientId);
                return (
                  <tr 
                    key={comm.id} 
                    className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                    onClick={() => onCommunicationClick(comm)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{comm.subject || 'No Subject'}</p>
                      <p className="text-xs text-zinc-500 truncate max-w-[300px]">{comm.message}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{client?.name || 'General'}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{comm.referenceNumber || activity?.documentReference || '-'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={comm.tag === 'Escalation' ? 'error' : comm.tag === 'Clarification Required' ? 'warning' : 'default'}>
                        {comm.tag}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {(() => {
                        const user = USERS.find(u => u.name === comm.sender);
                        const isClientUser = currentUser.role === 'Client Manager' || currentUser.role === 'Client Viewer';
                        if (user?.role === 'Shadow User') {
                          return (isClientUser || isPresentationMode) ? user.primeDisplayName : `${user.name} (${user.primeDisplayName})`;
                        }
                        return comm.sender;
                      })()}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{format(new Date(comm.timestamp), 'MMM dd, HH:mm')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-zinc-600">Active</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- Main App ---

const ClientSwitcher = ({ isOpen, onClose, assignedClients, onSelect }: { isOpen: boolean, onClose: () => void, assignedClients: Client[], onSelect: (c: Client | null) => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-zinc-100 text-center relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">Select Client Workspace</h2>
              <p className="text-zinc-500 mt-1">Choose the client context you want to work in today.</p>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              <button
                onClick={() => {
                  onSelect(null);
                  onClose();
                }}
                className="flex flex-col items-start p-6 bg-zinc-50 hover:bg-emerald-50 border border-zinc-100 hover:border-emerald-200 rounded-2xl transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 shadow-sm mb-4 transition-colors">
                  <LayoutDashboard size={20} />
                </div>
                <p className="text-lg font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">All Clients</p>
                <p className="text-xs text-zinc-500 mt-1">Aggregated view of all assigned clients</p>
              </button>
              {assignedClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => {
                    onSelect(client);
                    onClose();
                  }}
                  className="flex flex-col items-start p-6 bg-zinc-50 hover:bg-emerald-50 border border-zinc-100 hover:border-emerald-200 rounded-2xl transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 shadow-sm mb-4 transition-colors">
                    <Users size={20} />
                  </div>
                  <p className="text-lg font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">{client.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{client.industry} • {client.activeProcesses.join(', ')}</p>
                </button>
              ))}
            </div>
            
            <div className="p-6 bg-zinc-50 text-center">
              <p className="text-xs text-zinc-400">You are assigned to {assignedClients.length} client workspaces.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [pageFilter, setPageFilter] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedScope, setSelectedScope] = useState<ScopeCommitment | null>(null);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isClientSwitcherOpen, setIsClientSwitcherOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isSLARoutingModalOpen, setIsSLARoutingModalOpen] = useState(false);
  const [routingActivity, setRoutingActivity] = useState<Activity | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]); // Default to Admin
  const [selectedClientContext, setSelectedClientContext] = useState<Client | null>(null);

  const [activities, setActivities] = useState(ACTIVITIES);
  const [users, setUsers] = useState(USERS);
  const [scopes, setScopes] = useState(SCOPE_COMMITMENTS);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [workflows, setWorkflows] = useState(WORKFLOWS);
  const [communications, setCommunications] = useState(COMMUNICATIONS);
  const [rules, setRules] = useState(RULES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    general: { timezone: 'UTC', dateFormat: 'MMM dd, yyyy' },
    activity: { defaultReportingMode: 'Detailed Processing', allowedTags: ['General', 'Exception', 'Clarification Required', 'Escalation', 'Rule Update', 'Follow Up Required'] },
    sla: { warningHours: 4, escalation1Hours: 24, escalation2Hours: 48, breachDays: 7 },
    communication: { subjectFormatTemplate: '{ActivityName} – {VendorName} – {DocRef} – {TagType} – {Date}' },
    workflow: { defaultApprovalLevels: 2 },
    shadowUser: { maskingEnabled: true, enforcePrimaryMapping: true },
    simulationMode: false
  });

  useEffect(() => {
    // Seed the distributed orchestrator singleton on mount
    Orchestrator.loadInitialState({
      activities,
      tasks,
      workflows,
      notifications,
      auditLogs,
      decisionLogs
    });
  }, []);

  // --- System Engine ---

  const handleUserStatusChange = (newStatus: User['status']) => {
    const timestamp = new Date().toISOString();
    const oldStatus = currentUser.status;
    
    // Update current user status
    setCurrentUser(prev => ({ ...prev, status: newStatus }));
    
    // Record attendance
    const newRecord: Attendance = {
      id: `att-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      clientId: currentUser.clientId || '',
      status: newStatus === 'Active' ? 'Present' : (newStatus === 'Offline' ? 'Unplanned Absence' : 'Available'),
      timestamp,
      signals: {
        login: newStatus !== 'Offline',
        taskActivity: false,
        manualOverride: true
      }
    };
    
    setAttendance(prev => [newRecord, ...prev]);
    
    // Log audit
    handleSystemEvent('USER_STATUS_CHANGED', {
      entityType: 'User',
      entityId: currentUser.id,
      oldValue: oldStatus,
      newValue: newStatus
    });
  };

  const handleSystemEvent = (eventType: string, payload: any) => {
    // Enterprise Orchestration Layer handles concurrency, event sourcing, locking, and validation
    const newState = Orchestrator.dispatch({
      type: eventType as any,
      tenantId: 'tenant-1',
      actorId: currentUser.id,
      payload
    }, currentUser);

    // Sync distributed orchestration snapshot down to presentation layer
    setActivities(newState.activities);
    setTasks(newState.tasks);
    setWorkflows(newState.workflows);
    setNotifications(newState.notifications);
    setAuditLogs(newState.auditLogs);
    setDecisionLogs(newState.decisionLogs);
  };

  // Simulation Mode Logic
  useEffect(() => {
    if (!settings.simulationMode) return;

    const interval = setInterval(() => {
      const randomClient = CLIENTS[Math.floor(Math.random() * CLIENTS.length)];
      const randomUser = USERS.filter(u => u.role !== 'Client Viewer' && u.role !== 'Client Manager')[Math.floor(Math.random() * 4)];
      
      const newAct: Activity = {
        id: `sim-${Date.now()}`,
        clientId: randomClient.id,
        processType: ['AP', 'AR', 'GL', 'Billing', 'FP&A'][Math.floor(Math.random() * 5)] as any,
        reportingMode: 'Detailed Processing',
        documentReference: `SIM-DOC-${Math.floor(Math.random() * 10000)}`,
        erpReference: `SIM-ERP-${Math.floor(Math.random() * 10000)}`,
        actionTaken: 'Simulated activity for testing flows',
        userId: randomUser.id,
        timestamp: new Date().toISOString(),
        tag: Math.random() > 0.8 ? 'Exception' : 'General',
        status: 'Pending',
        lastUpdate: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
      };

      setActivities(prev => [newAct, ...prev]);
      handleSystemEvent('ACTIVITY_CREATED', { entityId: newAct.id, activity: newAct });
    }, 30000); // Every 30 seconds in simulation mode

    return () => clearInterval(interval);
  }, [settings.simulationMode]);

  // Client Isolation Logic
  const assignedClients = useMemo(() => {
    if (currentUser.userType === 'Admin') {
      return CLIENTS;
    }
    if (currentUser.userType === 'Client') {
      return CLIENTS.filter(c => c.id === currentUser.clientId);
    }
    if (currentUser.assignedClientIds) {
      return CLIENTS.filter(c => currentUser.assignedClientIds?.includes(c.id));
    }
    return [];
  }, [currentUser]);

  // Effect to handle client switching on login/role change
  React.useEffect(() => {
    if (assignedClients.length > 1) {
      setIsClientSwitcherOpen(true);
      setSelectedClientContext(null);
    } else if (assignedClients.length === 1) {
      setSelectedClientContext(assignedClients[0]);
      setIsClientSwitcherOpen(false);
    } else {
      setSelectedClientContext(null);
      setIsClientSwitcherOpen(false);
    }
  }, [currentUser, assignedClients]);

  const filteredActivities = useMemo(() => {
    if (isPresentationMode) {
      if (!selectedClientContext) return [];
      return activities.filter(a => a.clientId === selectedClientContext.id);
    }
    if (!selectedClientContext) {
      if (currentUser.userType === 'Admin') return activities;
      return activities.filter(a => assignedClients.some(c => c.id === a.clientId));
    }
    return activities.filter(a => a.clientId === selectedClientContext.id);
  }, [activities, selectedClientContext, isPresentationMode, assignedClients, currentUser.userType]);

  const filteredScopes = useMemo(() => {
    if (isPresentationMode) {
      if (!selectedClientContext) return [];
      return scopes.filter(s => s.clientId === selectedClientContext.id);
    }
    if (!selectedClientContext) {
      if (currentUser.userType === 'Admin') return scopes;
      return scopes.filter(s => assignedClients.some(c => c.id === s.clientId));
    }
    return scopes.filter(s => s.clientId === selectedClientContext.id);
  }, [scopes, selectedClientContext, isPresentationMode, assignedClients, currentUser.userType]);

  const filteredRules = useMemo(() => {
    if (isPresentationMode) {
      if (!selectedClientContext) return [];
      return rules.filter(r => r.clientId === selectedClientContext.id);
    }
    if (!selectedClientContext) {
      if (currentUser.userType === 'Admin') return rules;
      return rules.filter(r => assignedClients.some(c => c.id === r.clientId));
    }
    return rules.filter(r => r.clientId === selectedClientContext.id);
  }, [rules, selectedClientContext, isPresentationMode, assignedClients, currentUser.userType]);

  const filteredTasks = useMemo(() => {
    if (isPresentationMode) {
      if (!selectedClientContext) return [];
      return tasks.filter(t => t.clientId === selectedClientContext.id);
    }
    if (!selectedClientContext) {
      if (currentUser.userType === 'Admin') return tasks;
      return tasks.filter(t => assignedClients.some(c => c.id === t.clientId));
    }
    return tasks.filter(t => t.clientId === selectedClientContext.id);
  }, [tasks, selectedClientContext, isPresentationMode, assignedClients, currentUser.userType]);

  const filteredWorkflows = useMemo(() => {
    if (isPresentationMode) {
      if (!selectedClientContext) return [];
      return workflows.filter(w => w.clientId === selectedClientContext.id);
    }
    if (!selectedClientContext) {
      if (currentUser.userType === 'Admin') return workflows;
      return workflows.filter(w => assignedClients.some(c => c.id === w.clientId));
    }
    return workflows.filter(w => w.clientId === selectedClientContext.id);
  }, [workflows, selectedClientContext, isPresentationMode, assignedClients, currentUser.userType]);

  const filteredCommunications = useMemo(() => {
    if (isPresentationMode) {
      if (!selectedClientContext) return [];
      return communications.filter(c => {
        const activity = activities.find(a => a.id === c.objectId);
        return activity?.clientId === selectedClientContext.id;
      });
    }
    if (!selectedClientContext) {
      if (currentUser.userType === 'Admin') return communications;
      return communications.filter(c => {
        const activity = activities.find(a => a.id === c.objectId);
        return activity && assignedClients.some(client => client.id === activity.clientId);
      });
    }
    return communications.filter(c => {
      const activity = activities.find(a => a.id === c.objectId);
      return activity?.clientId === selectedClientContext.id;
    });
  }, [selectedClientContext, communications, activities, isPresentationMode, assignedClients, currentUser.userType]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setActivePage('activity-detail');
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setActivePage('client-detail');
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setActivePage('user-detail');
  };

  const handleRuleClick = (rule: Rule) => {
    setSelectedRule(rule);
    setActivePage('rule-detail');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setActivePage('task-detail');
  };

  const handleScopeClick = (scope: ScopeCommitment) => {
    setSelectedScope(scope);
    setActivePage('scope-detail');
  };

  const handleCommunicationClick = (comm: Communication) => {
    setSelectedCommunication(comm);
    setActivePage('communication-detail');
  };

  const handleGlobalSearchSelect = (type: string, id: string) => {
    if (type === 'Client') {
      const client = CLIENTS.find(c => c.id === id);
      if (client) handleClientClick(client);
    } else if (type === 'Activity') {
      const activity = ACTIVITIES.find(a => a.id === id);
      if (activity) handleActivityClick(activity);
    } else if (type === 'Rule') {
      const rule = RULES.find(r => r.id === id);
      if (rule) handleRuleClick(rule);
    } else if (type === 'Action') {
      if (id === 'create-activity') setIsAddModalOpen(true);
      if (id === 'sla-center') setActivePage('sla-center');
      if (id === 'rules') setActivePage('rule-library');
      if (id === 'clients') setActivePage('clients');
    }
  };

  const handleUpdateActivityTag = (activityId: string, newTag: Activity['tag']) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const isClient = currentUser.role === 'Client Manager' || currentUser.role === 'Client Viewer';
    const oldTag = activity.tag;

    setActivities(prev => prev.map(a => {
      if (a.id === activityId) {
        let newStatus = a.status;
        if (newTag === 'Rule Update') {
          newStatus = isClient ? 'Completed' : 'Under Review';
        }
        return { ...a, tag: newTag, status: newStatus, lastUpdate: new Date().toISOString() };
      }
      return a;
    }));

    // Audit Log
    handleSystemEvent('ACTIVITY_TAG_UPDATED', {
      entityId: activityId,
      oldValue: oldTag,
      newValue: newTag
    });

    // Workflow Logic for Rule Update
    if (newTag === 'Rule Update') {
      if (isClient) {
        // Direct update to Rule Library
        const newRule: Rule = {
          id: `r-auto-${Date.now()}`,
          clientId: activity.clientId,
          process: activity.processType,
          description: `Auto-generated from Activity ${activity.documentReference || activity.batchName}: ${activity.actionTaken}`,
          version: '1.0',
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'Approved'
        };
        setRules(prev => [newRule, ...prev]);

        // Notify other client users
        const clientUsers = USERS.filter(u => u.clientId === activity.clientId && u.id !== currentUser.id);
        clientUsers.forEach(u => {
          setNotifications(prev => [{
            id: `notif-${Date.now()}-${u.id}`,
            userId: u.id,
            title: 'Rule Library Updated',
            message: `A new rule has been added for ${activity.processType} by ${currentUser.name}.`,
            timestamp: new Date().toISOString(),
            type: 'System',
            isRead: false
          }, ...prev]);
        });
      } else {
        // Internal user tagging Rule Update -> Needs Client Approval
        const clientManagers = USERS.filter(u => u.clientId === activity.clientId && u.role === 'Client Manager');
        clientManagers.forEach(u => {
          setNotifications(prev => [{
            id: `notif-req-${Date.now()}-${u.id}`,
            userId: u.id,
            title: 'Rule Update Approval Required',
            message: `${currentUser.name} has proposed a rule update based on Activity ${activity.documentReference || activity.batchName}. Please review and approve.`,
            timestamp: new Date().toISOString(),
            type: 'Action Required',
            isRead: false
          }, ...prev]);
        });

        // Add to Decision Log
        const newDecision: DecisionLog = {
          id: `dec-${Date.now()}`,
          objectType: 'Activity',
          objectId: activityId,
          decisionType: 'Awaiting Confirmation',
          decidedBy: currentUser.id,
          timestamp: new Date().toISOString(),
          comments: `Rule update proposed by internal team. Awaiting client confirmation.`
        };
        setDecisionLogs(prev => [newDecision, ...prev]);
      }

      // Ensure a communication thread exists for this activity
      const existingComm = communications.find(c => c.objectId === activityId);
      if (!existingComm) {
        const initialMsg: Communication = {
          id: `comm-auto-${Date.now()}`,
          objectType: 'Activity',
          objectId: activityId,
          sender: 'System',
          message: `Communication thread started for Rule Update workflow.`,
          timestamp: new Date().toISOString(),
          priority: 'High',
          tag: 'Clarification Required',
          subject: `Rule Update Request: ${activity.documentReference || activity.batchName}`
        };
        setCommunications(prev => [initialMsg, ...prev]);
      }
    }
  };

  const handleAddActivity = (newAct: Partial<Activity>) => {
    const activity: Activity = {
      id: `act-${activities.length}`,
      clientId: newAct.clientId || 'c1',
      processType: newAct.processType || 'AP',
      reportingMode: newAct.reportingMode || 'Detailed Processing',
      documentReference: newAct.documentReference || 'DOC-NEW',
      erpReference: newAct.erpReference || 'ERP-NEW',
      actionTaken: newAct.actionTaken || 'New Action',
      userId: currentUser.id,
      mappedInternalUserId: newAct.mappedInternalUserId,
      timestamp: new Date().toISOString(),
      tag: newAct.tag || 'General',
      exceptionType: newAct.exceptionType,
      status: 'Pending',
      lastUpdate: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // Default 8h SLA
      ...newAct
    };
    setActivities([activity, ...activities]);
    handleSystemEvent('ACTIVITY_CREATED', { entityId: activity.id, activity });
    setIsAddModalOpen(false);
  };

  const handleScopeStatusChange = (id: string, newStatus: ScopeCommitment['status']) => {
    setScopes(scopes.map(s => s.id === id ? { ...s, status: newStatus, completionPercentage: newStatus === 'Completed' ? 100 : s.completionPercentage } : s));
  };

  const handleNavigate = (page: Page, filter?: any) => {
    setActivePage(page);
    if (filter) setPageFilter(filter);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return (
        <DashboardPage 
          onActivityClick={handleActivityClick} 
          currentUser={currentUser} 
          tasks={filteredTasks} 
          onNavigate={handleNavigate} 
          activities={activities} 
          communications={communications} 
          onStatusChange={handleUserStatusChange} 
          users={USERS} 
          isPresentationMode={isPresentationMode}
          selectedClientContext={selectedClientContext}
          assignedClients={assignedClients}
        />
      );
      case 'activity-log': return (
        <ActivityLogPage 
          activities={filteredActivities} 
          onActivityClick={handleActivityClick} 
          onAddClick={() => setIsAddModalOpen(true)} 
          currentUser={currentUser}
          initialFilter={pageFilter}
          onNavigate={handleNavigate}
          isPresentationMode={isPresentationMode}
        />
      );
      case 'activity-detail': return selectedActivity ? (
        <ActivityDetailPage 
          activity={selectedActivity} 
          onBack={() => setActivePage('activity-log')} 
          currentUser={currentUser} 
          auditLogs={auditLogs}
          decisionLogs={decisionLogs}
          tasks={tasks}
          onAddCommunication={(comm) => setCommunications(prev => [comm, ...prev])}
          onUpdateCommunication={(comm) => setCommunications(prev => prev.map(c => c.id === comm.id ? comm : c))}
          onUpdateTag={handleUpdateActivityTag}
          communications={communications}
          isPresentationMode={isPresentationMode}
        />
      ) : (
        <ActivityLogPage 
          activities={filteredActivities} 
          onActivityClick={handleActivityClick} 
          onAddClick={() => setIsAddModalOpen(true)} 
          currentUser={currentUser} 
          initialFilter={pageFilter}
          onNavigate={handleNavigate}
          isPresentationMode={isPresentationMode}
        />
      );
      case 'scope-sla': return <ScopeSLAPage scopes={filteredScopes} onStatusChange={handleScopeStatusChange} onScopeClick={handleScopeClick} initialFilter={pageFilter} currentUser={currentUser} />;
      case 'scope-detail': return selectedScope ? (
        <ScopeDetailPage 
          scope={selectedScope} 
          activities={activities.filter(a => a.clientId === selectedScope.clientId)} 
          onBack={() => setActivePage('scope-sla')}
          onActivityClick={handleActivityClick}
        />
      ) : <ScopeSLAPage scopes={filteredScopes} onStatusChange={handleScopeStatusChange} onScopeClick={handleScopeClick} initialFilter={pageFilter} currentUser={currentUser} />;
      case 'rule-library': return <RuleLibraryPage rules={filteredRules} onRuleClick={handleRuleClick} initialFilter={pageFilter} currentUser={currentUser} />;
      case 'rule-detail': return selectedRule ? (
        <RuleDetailPage 
          rule={selectedRule} 
          auditLogs={auditLogs.filter(l => l.entityId === selectedRule.id)}
          decisionLogs={decisionLogs.filter(l => l.objectId === selectedRule.id)}
          onBack={() => setActivePage('rule-library')}
        />
      ) : <RuleLibraryPage onRuleClick={handleRuleClick} initialFilter={pageFilter} />;
      case 'communications': return <CommunicationsPage communications={filteredCommunications} onActivityClick={handleActivityClick} onCommunicationClick={handleCommunicationClick} currentUser={currentUser} initialFilter={pageFilter} isPresentationMode={isPresentationMode} />;
      case 'communication-detail': return selectedCommunication ? (
        <CommunicationDetailPage 
          communication={selectedCommunication}
          activities={activities}
          communications={communications}
          onBack={() => setActivePage('communications')}
          onActivityClick={handleActivityClick}
          currentUser={currentUser}
          onReply={(msg, tag) => {
            const reply: Communication = {
              id: `comm-reply-${Date.now()}`,
              objectType: 'Activity',
              objectId: selectedCommunication.objectId,
              sender: currentUser.name,
              message: msg,
              timestamp: new Date().toISOString(),
              priority: selectedCommunication.priority,
              tag: tag || 'General',
              subject: `RE: ${selectedCommunication.subject}`
            };
            setCommunications(prev => [reply, ...prev]);

            if (tag === 'Email') {
              const activity = activities.find(a => a.id === selectedCommunication.objectId);
              const client = CLIENTS.find(c => c.id === activity?.clientId);
              const clientContact = USERS.find(u => u.clientId === client?.id && u.role === 'Client Manager');
              const internalUser = USERS.find(u => u.id === activity?.userId);
              
              console.log(`Sending email notification for communication ${reply.id}`);
              
              if (clientContact) {
                setNotifications(prev => [{
                  id: `notif-email-${Date.now()}-client`,
                  userId: clientContact.id,
                  title: 'New Email Communication',
                  message: `A new communication tagged as 'Email' has been sent regarding Activity ${activity?.documentReference || activity?.batchName}.`,
                  timestamp: new Date().toISOString(),
                  type: 'info',
                  isRead: false
                }, ...prev]);
              }
              if (internalUser) {
                setNotifications(prev => [{
                  id: `notif-email-${Date.now()}-internal`,
                  userId: internalUser.id,
                  title: 'New Email Communication',
                  message: `A new communication tagged as 'Email' has been sent regarding Activity ${activity?.documentReference || activity?.batchName}.`,
                  timestamp: new Date().toISOString(),
                  type: 'info',
                  isRead: false
                }, ...prev]);
              }
            }
          }}
        />
      ) : <CommunicationsPage communications={filteredCommunications} onActivityClick={handleActivityClick} onCommunicationClick={handleCommunicationClick} currentUser={currentUser} initialFilter={pageFilter} />;
      case 'tasks': return <TasksPage tasks={filteredTasks} onTaskClick={handleTaskClick} onActivityClick={(id) => {
        const act = activities.find(a => a.id === id);
        if (act) handleActivityClick(act);
      }} initialFilter={pageFilter} />;
      case 'task-detail': return selectedTask ? (
        <TaskDetailPage 
          task={selectedTask}
          auditLogs={auditLogs.filter(l => l.entityId === selectedTask.id)}
          activities={activities}
          onBack={() => setActivePage('tasks')}
          onActivityClick={(id) => {
            const act = activities.find(a => a.id === id);
            if (act) handleActivityClick(act);
          }}
        />
      ) : <TasksPage tasks={filteredTasks} onTaskClick={handleTaskClick} onActivityClick={(id) => {
        const act = activities.find(a => a.id === id);
        if (act) handleActivityClick(act);
      }} initialFilter={pageFilter} />;
      case 'audit-viewer': return <AuditViewerPage auditLogs={auditLogs} />;
      case 'settings': return <SettingsPage settings={settings} onUpdate={setSettings} currentUser={currentUser} />;
      case 'clients': return <ClientsPage onClientClick={handleClientClick} assignedClients={assignedClients} />;
      case 'client-detail': return selectedClient ? <ClientDetailPage client={selectedClient} onBack={() => setActivePage('clients')} currentUser={currentUser} onNavigate={handleNavigate} /> : <ClientsPage onClientClick={handleClientClick} assignedClients={assignedClients} />;
      case 'demo': return <DemoPage />;
      case 'sla-center': return <SLACenterPage onActivityClick={handleActivityClick} onRoute={(act) => { setRoutingActivity(act); setIsSLARoutingModalOpen(true); }} initialFilter={pageFilter} assignedClients={assignedClients} />;
      case 'ops-control': return <OperationsControlPage />;
      case 'user-monitor': return <UserActivityPage onUserClick={handleUserClick} currentUser={currentUser} selectedClientContext={selectedClientContext} assignedClients={assignedClients} users={users} onUpdateUser={(u) => setUsers(users.map(user => user.id === u.id ? u : user))} />;
      case 'user-detail': return selectedUser ? (
        <UserDetailPage 
          user={selectedUser}
          activities={filteredActivities.filter(a => a.userId === selectedUser.id)}
          tasks={tasks.filter(t => t.assignedTo === selectedUser.id)}
          auditLogs={auditLogs.filter(l => l.changedBy === selectedUser.id)}
          onBack={() => setActivePage('user-monitor')}
          onActivityClick={handleActivityClick}
        />
      ) : <UserActivityPage onUserClick={handleUserClick} currentUser={currentUser} selectedClientContext={selectedClientContext} assignedClients={assignedClients} users={users} onUpdateUser={(u) => setUsers(users.map(user => user.id === u.id ? u : user))} />;
      case 'workflow-builder': return <WorkflowBuilderPage workflows={filteredWorkflows} onCreateClick={() => setIsWorkflowModalOpen(true)} />;
      case 'orchestration': return <OrchestrationTelemetryPage activities={activities} tasks={tasks} auditLogs={auditLogs} workflows={workflows} />;
      default: return (
        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
          <Settings size={48} strokeWidth={1} className="mb-4" />
          <p className="text-sm font-medium">This page is under construction</p>
        </div>
      );
    }
  };

  return (
    <SystemContext.Provider value={{ dispatch: handleSystemEvent }}>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          currentUser={currentUser}
          isPresentationMode={isPresentationMode}
          onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
        />
      
      <main className="pl-64 min-h-screen">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-zinc-100 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              {currentUser.role} View
            </div>
            {assignedClients.length > 1 && (
              <>
                <div className="h-4 w-px bg-zinc-200" />
                <button 
                  onClick={() => setIsClientSwitcherOpen(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Shield size={14} />
                  {selectedClientContext ? selectedClientContext.name : 'All Clients'}
                </button>
              </>
            )}
            <div className="h-4 w-px bg-zinc-200" />
            <div className="text-sm font-medium text-zinc-600">
              {activePage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Switch Role:</span>
              <select 
                className="text-xs font-bold bg-transparent focus:outline-none cursor-pointer"
                value={currentUser.id}
                onChange={(e) => {
                  const user = USERS.find(u => u.id === e.target.value);
                  if (user) {
                    setCurrentUser(user);
                    setActivePage('dashboard');
                  }
                }}
              >
                {USERS.map(u => (
                  <option key={u.id} value={u.id}>{u.role} ({u.name})</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input 
                type="text" 
                placeholder="Search anything... (⌘K)" 
                className="pl-9 pr-4 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-64 cursor-pointer"
                onClick={() => setIsSearchOpen(true)}
                readOnly
              />
            </div>
            <button 
              className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
          </div>
        </header>

        <GlobalSearch 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onSelect={handleGlobalSearchSelect}
        />

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-lg font-bold">Add New Activity</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form 
                className="p-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddActivity({
                    clientId: formData.get('clientId') as string,
                    processType: formData.get('processType') as any,
                    documentReference: formData.get('docRef') as string,
                    actionTaken: formData.get('action') as string,
                    reportingMode: formData.get('reportingMode') as 'Detailed Processing' | 'Compound Reporting',
                    batchName: formData.get('batchName') as string,
                  });
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Reporting Mode</label>
                    <select name="reportingMode" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                      <option value="Detailed Processing">Detailed Processing</option>
                      <option value="Compound Reporting">Compound Reporting</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Client</label>
                    <select name="clientId" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                      {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Process Type</label>
                    <select name="processType" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                      <option value="AP">AP</option>
                      <option value="AR">AR</option>
                      <option value="GL">GL</option>
                      <option value="Billing">Billing</option>
                      <option value="FP&A">FP&A</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Batch Name (Compound Only)</label>
                    <input name="batchName" type="text" placeholder="e.g. Weekly Invoices Batch" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Document Ref</label>
                    <input name="docRef" required type="text" placeholder="e.g. INV-2024-001" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Action Taken</label>
                    <input name="action" required type="text" placeholder="e.g. Invoice processed" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Create Activity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <SLARoutingModal 
        isOpen={isSLARoutingModalOpen} 
        onClose={() => setIsSLARoutingModalOpen(false)} 
        activity={routingActivity}
        onRoute={(data) => {
          handleSystemEvent('SLA_ROUTED', { ...data, activity: routingActivity });
          setIsSLARoutingModalOpen(false);
        }}
      />

      <WorkflowCreationModal 
        isOpen={isWorkflowModalOpen} 
        onClose={() => setIsWorkflowModalOpen(false)} 
        onCreate={(wf) => {
          handleSystemEvent('WORKFLOW_CREATED', { workflow: wf });
          setIsWorkflowModalOpen(false);
        }}
      />

      <ClientSwitcher 
        isOpen={isClientSwitcherOpen} 
        onClose={() => setIsClientSwitcherOpen(false)} 
        assignedClients={assignedClients}
        onSelect={setSelectedClientContext}
      />
      </div>
    </SystemContext.Provider>
  );
}
