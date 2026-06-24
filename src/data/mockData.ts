export interface Client {
  id: string;
  name: string;
  industry: string;
  status: 'Active' | 'Onboarding' | 'Inactive';
  assignedTeam: string;
  activeProcesses: string[];
}

export type UserRole = 
  | 'Admin' 
  | 'Internal Manager' 
  | 'Processor' 
  | 'Analyst' 
  | 'Shadow User' 
  | 'Client Manager' 
  | 'Client Viewer';

export type UserType = 'Internal' | 'Client' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  userType: UserType;
  clientId?: string; // Primary client association
  assignedClientIds?: string[]; // For internal users assigned to multiple clients
  primeDisplayName?: string; // For shadow users (masked name)
  isShadowUser?: boolean;
  loginTime?: string;
  logoutTime?: string;
  currentActivity?: string;
  status: 'Active' | 'Idle' | 'Break' | 'Offline';
  lastActivity?: string;
}

export type AttendanceStatus = 
  | 'Present' 
  | 'Available' 
  | 'Partially Available' 
  | 'On Leave' 
  | 'Unplanned Absence' 
  | 'Holiday' 
  | 'Coverage Active';

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  clientId: string;
  status: AttendanceStatus;
  timestamp: string;
  isCovered?: boolean;
  shadowUserId?: string;
  shadowUserName?: string;
  signals: {
    login: boolean;
    taskActivity: boolean;
    manualOverride?: boolean;
  };
}

export interface ClientAssignment {
  id: string;
  clientId: string;
  internalManagerId: string;
  internalUserIds: string[];
  shadowUserIds: string[];
  clientManagerIds: string[];
  clientViewerIds: string[];
}

export interface Task {
  id: string;
  clientId: string;
  processType: string;
  linkedActivityId?: string;
  taskName: string;
  assignedTo: string;
  createdBy: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Blocked';
  source: 'Manual' | 'Workflow' | 'SLA' | 'Follow-Up' | 'SLA Escalation';
  createdAt: string;
  notes?: string;
}

export type ActivityStatus = 
  | 'Awaiting Information' 
  | 'Under Review' 
  | 'Escalated – Level 1' 
  | 'Escalated – Level 2' 
  | 'Escalated – 1 Week Pending' 
  | 'SLA Risk' 
  | 'Resolution In Progress' 
  | 'Closed'
  | 'Completed' 
  | 'Pending' 
  | 'In Progress';

export interface Activity {
  id: string;
  clientId: string;
  processType: 'AP' | 'AR' | 'GL' | 'Billing' | 'FP&A';
  reportingMode: 'Detailed Processing' | 'Compound Reporting';
  documentReference?: string; // For Detailed
  batchName?: string; // For Compound
  documentCount?: number; // For Compound
  processingNotes?: string; // For Compound
  erpReference: string;
  actionTaken: string;
  userId: string; // Reference to Actual User (Shadow or Internal)
  mappedInternalUserId?: string; // Mapped Internal User for Shadow User
  timestamp: string;
  tag: 'Exception' | 'Clarification Required' | 'Escalation' | 'Rule Update' | 'General' | 'Follow Up Required' | 'System' | 'Admin';
  exceptionType?: 'Data Error' | 'Missing Info' | 'Process Deviation' | 'Client Dependency' | 'System Issue';
  status: ActivityStatus;
  linkedScopeId?: string;
  attachments?: string[];
  slaTimer?: string; // e.g., "2 Days"
  slaDeadline?: string;
  lastUpdate: string;
  followUpDeadline?: string;
}

export interface ScopeCommitment {
  id: string;
  clientId: string;
  activityName: string;
  period: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Awaiting Client' | 'Delayed';
  owner: string;
  completionPercentage: number;
}

export interface Communication {
  id: string;
  objectType: 'Activity' | 'Scope' | 'Rule' | 'General' | 'WorkItem' | 'Escalation' | 'Client' | 'Service';
  objectId?: string;
  subject?: string;
  referenceNumber?: string;
  sender: string;
  message: string;
  timestamp: string;
  priority: 'Low' | 'Medium' | 'High';
  tag?: 'General' | 'Critical' | 'Clarification' | 'Escalation' | 'Clarification Required' | 'Email' | 'General Communication' | 'Decision' | 'Approval Request' | 'Exception' | 'Follow Up' | 'Rule Update' | 'Knowledge Note';
}

export interface Rule {
  id: string;
  clientId: string;
  process: string;
  description: string;
  version: string;
  effectiveDate: string;
  status: 'Instruction Raised' | 'Client Review' | 'Client Approval' | 'Rule Published' | 'Draft' | 'Awaiting Confirmation' | 'Approved' | 'Rejected';
  linkedObjects?: { id: string, type: 'WorkItem' | 'Service' | 'Engagement' | 'Template' | 'Communication', name: string }[];
}

export interface Workflow {
  id: string;
  clientId: string;
  name: string;
  triggerEvent: string;
  approvalLevels: {
    level: number;
    approverRole: UserRole;
    actionType: string;
  }[];
  notificationTrigger: string;
  isActive: boolean;
}

export const USERS: User[] = [
  // Global Admin
  { id: 'u1', name: 'Sumanth Reddy', email: 'M.SumanthReddy12@gmail.com', role: 'Admin', userType: 'Admin', status: 'Active', assignedClientIds: ['c1', 'c2'] },
  
  // Internal Managers
  { id: 'u2', name: 'Chakri v', email: 'chakri.v@example.com', role: 'Internal Manager', userType: 'Internal', status: 'Active', assignedClientIds: ['c1'] },
  { id: 'u9', name: 'Venkata raghu', email: 'venkata.raghu@example.com', role: 'Internal Manager', userType: 'Internal', status: 'Active', assignedClientIds: ['c2'] },

  // Internal Users - Client 1 (NMT medicals)
  { id: 'u3', name: 'Uday Kumar B', email: 'uday.kumar@example.com', role: 'Processor', userType: 'Internal', status: 'Active', assignedClientIds: ['c1'], clientId: 'c1' },
  { id: 'u11', name: 'Kiran Kumar', email: 'kiran.kumar@example.com', role: 'Analyst', userType: 'Internal', status: 'Active', assignedClientIds: ['c1'], clientId: 'c1' },
  { id: 'u21', name: 'Suresh Raina', email: 'suresh.raina@example.com', role: 'Processor', userType: 'Internal', status: 'Active', assignedClientIds: ['c1'], clientId: 'c1' },

  // Internal Users - Client 2 (GE Entertainments INC)
  { id: 'u7', name: 'Pavan Chary', email: 'pavan.chary@example.com', role: 'Processor', userType: 'Internal', status: 'Active', assignedClientIds: ['c2'], clientId: 'c2' },
  { id: 'u8', name: 'Raju gosikonda', email: 'raju.gosikonda@example.com', role: 'Analyst', userType: 'Internal', status: 'Active', assignedClientIds: ['c2'], clientId: 'c2' },
  { id: 'u22', name: 'Mahesh Babu', email: 'mahesh.babu@example.com', role: 'Processor', userType: 'Internal', status: 'Active', assignedClientIds: ['c2'], clientId: 'c2' },

  // Shadow Users
  { id: 'u4', name: 'Rohinikanti', email: 'rohinikanti@example.com', role: 'Shadow User', userType: 'Internal', primeDisplayName: 'Finance Ops Backup', status: 'Active', assignedClientIds: ['c1'], isShadowUser: true },
  { id: 'u12', name: 'Anusha P', email: 'anusha.p@example.com', role: 'Shadow User', userType: 'Internal', primeDisplayName: 'Global Hub Backup', status: 'Active', assignedClientIds: ['c2'], isShadowUser: true },

  // Client Managers
  { id: 'u5', name: 'Ioana White', email: 'ioana.white@example.com', role: 'Client Manager', userType: 'Client', clientId: 'c1', status: 'Active' },
  { id: 'u13', name: 'David Miller', email: 'david.miller@example.com', role: 'Client Manager', userType: 'Client', clientId: 'c2', status: 'Active' },

  // Client Viewers
  { id: 'u6', name: 'Lisa L', email: 'lisa.l@example.com', role: 'Client Viewer', userType: 'Client', clientId: 'c1', status: 'Idle' },
  { id: 'u19', name: 'James Wilson', email: 'james.wilson@example.com', role: 'Client Viewer', userType: 'Client', clientId: 'c2', status: 'Active' },
];

export const CLIENTS: Client[] = [
  { id: 'c1', name: 'NMT medicals', industry: 'Healthcare', status: 'Active', assignedTeam: 'Alpha Team', activeProcesses: ['AP', 'GL', 'FP&A'] },
  { id: 'c2', name: 'GE Entertainments INC', industry: 'Entertainment', status: 'Active', assignedTeam: 'Beta Team', activeProcesses: ['AR', 'AP', 'Billing'] },
];

export const CLIENT_ASSIGNMENTS: ClientAssignment[] = [
  {
    id: 'ca1',
    clientId: 'c1',
    internalManagerId: 'u2',
    internalUserIds: ['u3', 'u11', 'u21'],
    shadowUserIds: ['u4'],
    clientManagerIds: ['u5'],
    clientViewerIds: ['u6']
  },
  {
    id: 'ca2',
    clientId: 'c2',
    internalManagerId: 'u9',
    internalUserIds: ['u7', 'u8', 'u22'],
    shadowUserIds: ['u12'],
    clientManagerIds: ['u13'],
    clientViewerIds: ['u19']
  }
];

export const ATTENDANCE: Attendance[] = [
  // Client 1
  { id: 'a1', userId: 'u3', userName: 'Uday Kumar B', role: 'Processor', clientId: 'c1', status: 'Present', timestamp: '2024-03-25T08:00:00Z', signals: { login: true, taskActivity: true } },
  { id: 'a2', userId: 'u11', userName: 'Kiran Kumar', role: 'Analyst', clientId: 'c1', status: 'Available', timestamp: '2024-03-25T08:15:00Z', signals: { login: true, taskActivity: true } },
  { id: 'a3', userId: 'u21', userName: 'Suresh Raina', role: 'Processor', clientId: 'c1', status: 'On Leave', timestamp: '2024-03-25T08:00:00Z', isCovered: true, shadowUserId: 'u4', shadowUserName: 'Finance Ops Backup', signals: { login: false, taskActivity: false } },
  { id: 'a4', userId: 'u4', userName: 'Rohinikanti', role: 'Shadow User', clientId: 'c1', status: 'Coverage Active', timestamp: '2024-03-25T08:30:00Z', signals: { login: true, taskActivity: true } },

  // Client 2
  { id: 'a5', userId: 'u7', userName: 'Pavan Chary', role: 'Processor', clientId: 'c2', status: 'Partially Available', timestamp: '2024-03-25T09:00:00Z', signals: { login: true, taskActivity: false } },
  { id: 'a6', userId: 'u8', userName: 'Raju gosikonda', role: 'Analyst', clientId: 'c2', status: 'Unplanned Absence', timestamp: '2024-03-25T08:00:00Z', signals: { login: false, taskActivity: false } },
  { id: 'a7', userId: 'u22', userName: 'Mahesh Babu', role: 'Processor', clientId: 'c2', status: 'Available', timestamp: '2024-03-25T08:45:00Z', signals: { login: true, taskActivity: true } },
  { id: 'a8', userId: 'u12', userName: 'Anusha P', role: 'Shadow User', clientId: 'c2', status: 'Available', timestamp: '2024-03-25T08:50:00Z', signals: { login: true, taskActivity: true } },
];

const ACTIVITY_STATUSES: ActivityStatus[] = [
  'Awaiting Information', 'Under Review', 'Escalated – Level 1', 'Escalated – Level 2', 
  'Escalated – 1 Week Pending', 'SLA Risk', 'Resolution In Progress', 'Closed'
];

export const ACTIVITIES: Activity[] = CLIENTS.flatMap(client => 
  Array.from({ length: 110 }).map((_, i) => {
    const status = ACTIVITY_STATUSES[Math.floor(Math.random() * ACTIVITY_STATUSES.length)];
    const tag = ['Exception', 'Clarification Required', 'Escalation', 'Rule Update', 'General', 'Follow Up Required'][Math.floor(Math.random() * 6)] as any;
    
    // Only Internal or Shadow users can be assigned to activities
    const internalUsersForClient = USERS.filter(u => 
      (u.userType === 'Internal' || u.userType === 'Admin') && 
      u.assignedClientIds?.includes(client.id)
    );
    const assignedUser = internalUsersForClient[Math.floor(Math.random() * internalUsersForClient.length)] || USERS[0];

    return {
      id: `act-${client.id}-${i}`,
      clientId: client.id,
      processType: client.activeProcesses[Math.floor(Math.random() * client.activeProcesses.length)] as any,
      reportingMode: i % 5 === 0 ? 'Compound Reporting' : 'Detailed Processing',
      documentReference: i % 5 !== 0 ? `DOC-${client.id.toUpperCase()}-${1000 + i}` : undefined,
      batchName: i % 5 === 0 ? `Batch ${Math.floor(i/5) + 1}` : undefined,
      documentCount: i % 5 === 0 ? Math.floor(Math.random() * 100) + 10 : undefined,
      processingNotes: i % 5 === 0 ? 'Monthly batch processing' : undefined,
      erpReference: `ERP-${client.id.toUpperCase()}-${5000 + i}`,
      actionTaken: ['Invoice processed', 'Vendor created', 'Journal entry posted', 'Bank reconciliation updated', 'Payment batch created', 'Credit memo issued'][Math.floor(Math.random() * 6)],
      userId: assignedUser.id,
      timestamp: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      tag: tag,
      status: status,
      slaTimer: status.includes('Escalated') ? `${Math.floor(Math.random() * 5) + 1} Days` : undefined,
      lastUpdate: new Date(Date.now() - Math.random() * 100000000).toISOString(),
      followUpDeadline: tag === 'Follow Up Required' ? new Date(Date.now() + Math.random() * 1000000000).toISOString() : undefined,
    };
  })
);

export const SCOPE_COMMITMENTS: ScopeCommitment[] = CLIENTS.flatMap(client => 
  Array.from({ length: 100 }).map((_, i) => {
    const internalUsersForClient = USERS.filter(u => 
      u.userType === 'Internal' && 
      u.assignedClientIds?.includes(client.id)
    );
    const owner = internalUsersForClient[Math.floor(Math.random() * internalUsersForClient.length)]?.name || 'Sumanth Reddy';

    return {
      id: `s-${client.id}-${i}`,
      clientId: client.id,
      activityName: [
        'Bank Reconciliation',
        'AP Aging Review',
        'AR Aging Review',
        'Accrual Posting',
        'Revenue Recognition',
        'GL Review',
        'Financial Reporting',
        'Variance Analysis',
        'Management Reporting',
        'Tax Filing Support'
      ][i % 10],
      period: 'Feb 2024',
      dueDate: new Date(Date.now() + (i - 50) * 86400000).toISOString().split('T')[0],
      status: ['Completed', 'In Progress', 'Not Started', 'Delayed', 'Awaiting Client'][Math.floor(Math.random() * 5)] as any,
      owner: owner,
      completionPercentage: Math.floor(Math.random() * 101),
    };
  })
);

export const COMMUNICATIONS: Communication[] = CLIENTS.flatMap(client => 
  Array.from({ length: 100 }).map((_, i) => {
    const internalUsers = USERS.filter(u => u.assignedClientIds?.includes(client.id));
    const clientUsers = USERS.filter(u => u.clientId === client.id);
    
    // Alternate between internal and client senders
    const sender = i % 2 === 0 
      ? (internalUsers[Math.floor(Math.random() * internalUsers.length)]?.name || 'Sumanth Reddy')
      : (clientUsers[Math.floor(Math.random() * clientUsers.length)]?.name || 'Client Contact');

    return {
      id: `msg-${client.id}-${i}`,
      objectType: ['Activity', 'Scope', 'Rule', 'General'][Math.floor(Math.random() * 4)] as any,
      objectId: i < 50 ? `act-${client.id}-${i}` : undefined,
      sender: sender,
      message: [
        'Please review the attached invoice.',
        'Clarification needed on the vendor details.',
        'Month-end close is on track.',
        'New rule updated for AP processing.',
        'Urgent: Escalation regarding payment delay.',
        'General update on the project status.',
        'Can we schedule a call to discuss the GL variance?',
        'The accrual posting is pending client approval.'
      ][Math.floor(Math.random() * 8)],
      timestamp: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      priority: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as any,
      tag: ['General', 'Critical', 'Clarification', 'Escalation'][Math.floor(Math.random() * 4)] as any,
    };
  })
);

export const RULES: Rule[] = CLIENTS.flatMap(client => 
  Array.from({ length: 100 }).map((_, i) => ({
    id: `r-${client.id}-${i}`,
    clientId: client.id,
    process: client.activeProcesses[Math.floor(Math.random() * client.activeProcesses.length)],
    description: [
      'All invoices over $5000 require CFO approval.',
      'Accruals must be posted by the 3rd business day.',
      'Late fees applied after 30 days of overdue.',
      'Weekly billing cycle every Friday.',
      'Budget variance report due monthly.',
      'Vendor master data changes require dual authorization.',
      'Intercompany reconciliations must be completed by Day 5.',
      'Fixed asset capitalization threshold set at $2,500.'
    ][i % 8],
    version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
    effectiveDate: '2024-01-01',
    status: ['Approved', 'Draft', 'Awaiting Confirmation', 'Rejected'][Math.floor(Math.random() * 4)] as any,
  }))
);

export const TASKS: Task[] = CLIENTS.flatMap(client => 
  Array.from({ length: 110 }).map((_, i) => {
    const internalUsers = USERS.filter(u => u.assignedClientIds?.includes(client.id));
    const assignedTo = internalUsers[Math.floor(Math.random() * internalUsers.length)]?.id || USERS[0].id;
    
    return {
      id: `task-${client.id}-${i}`,
      clientId: client.id,
      processType: client.activeProcesses[Math.floor(Math.random() * client.activeProcesses.length)],
      linkedActivityId: i < 50 ? `act-${client.id}-${i}` : undefined,
      taskName: [
        'Review high-value invoice',
        'Follow up on missing documentation',
        'Approve new vendor setup',
        'Investigate GL variance',
        'Process month-end accruals',
        'Audit billing batch',
        'Update processing rules',
        'Resolve client clarification'
      ][Math.floor(Math.random() * 8)],
      assignedTo: assignedTo,
      createdBy: USERS[Math.floor(Math.random() * 2)].id,
      priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)] as any,
      dueDate: new Date(Date.now() + Math.random() * 1000000000).toISOString(),
      status: ['Open', 'In Progress', 'Completed', 'Blocked'][Math.floor(Math.random() * 4)] as any,
      source: ['Manual', 'Workflow', 'SLA', 'Follow-Up'][Math.floor(Math.random() * 4)] as any,
      createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    };
  })
);

export const WORKFLOWS: Workflow[] = CLIENTS.flatMap(client => 
  Array.from({ length: 100 }).map((_, i) => ({
    id: `wf-${client.id}-${i}`,
    clientId: client.id,
    name: [
      'Clarification Required',
      'High Value Invoice Approval',
      'New Vendor Onboarding',
      'Month-End Accrual Review',
      'Payroll Exception Approval',
      'Expense Report Audit',
      'Capital Expenditure Request',
      'Contract Renewal Alert'
    ][Math.floor(Math.random() * 8)] + ` - ${i + 1}`,
    triggerEvent: [
      'Activity tagged "Clarification Required"',
      'AP Invoice > $10,000',
      'New Vendor Record Created',
      'Month-End Close Initiated',
      'Payroll Variance > 5%',
      'Expense Report > $5,000',
      'CapEx Request Submitted',
      'Contract Expires in 30 Days'
    ][Math.floor(Math.random() * 8)],
    approvalLevels: [
      { level: 1, approverRole: 'Client Manager', actionType: 'Review Information' },
      { level: 2, approverRole: 'Internal Manager', actionType: 'Final Approval' }
    ],
    notificationTrigger: [
      'Immediate email to Client Manager',
      'Push notification to mobile app',
      'Daily digest email',
      'Slack/Teams notification',
      'In-app alert only'
    ][Math.floor(Math.random() * 5)],
    isActive: Math.random() > 0.2
  }))
);
