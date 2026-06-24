import { CLIENTS, USERS, ACTIVITIES } from './mockData';
import { Engagement, ScopeItem, WorkItem, Service, ClientServiceMapping, Template, AssignmentHistory } from '../types/models';

export const ENGAGEMENTS: Engagement[] = [
  {
    id: 'eng-1',
    name: 'Finance Operations',
    clientId: 'c1',
    businessUnit: 'Finance & Accounting',
    deliveryManagerId: 'u2',
    clientManagerId: 'c1-manager',
    assignedTeamIds: ['u3', 'u11', 'u21'],
    startDate: '2026-06-01T00:00:00Z',
    status: 'Active',
    monthlyRevenue: 50000,
    monthlyCost: 35000,
    marginPercent: 30,
    contractType: 'Managed Services'
  },
  {
    id: 'eng-2',
    name: 'IT Service Desk',
    clientId: 'c2',
    businessUnit: 'IT Services',
    deliveryManagerId: 'u9',
    clientManagerId: 'c2-manager',
    assignedTeamIds: ['u7', 'u8', 'u22'],
    startDate: '2026-01-01T00:00:00Z',
    status: 'Active',
    monthlyRevenue: 100000,
    monthlyCost: 60000,
    marginPercent: 40,
    contractType: 'Staff Augmentation'
  }
];

export const SCOPE_ITEMS: ScopeItem[] = [
  { id: 'scp-1', engagementId: 'eng-1', title: 'AP Reconciliation', status: 'In Progress', completionPercent: 45 },
  { id: 'scp-2', engagementId: 'eng-1', title: 'AR Reconciliation', status: 'Completed', completionPercent: 100 },
  { id: 'scp-3', engagementId: 'eng-1', title: 'Bank Reconciliation', status: 'In Progress', completionPercent: 80 },
  { id: 'scp-4', engagementId: 'eng-1', title: 'Accrual Posting', status: 'Not Started', completionPercent: 0 },
  { id: 'scp-5', engagementId: 'eng-1', title: 'Financial Reporting', status: 'Not Started', completionPercent: 0 },
  { id: 'scp-6', engagementId: 'eng-1', title: 'Management Reporting', status: 'Client Review', completionPercent: 95 },
  
  { id: 'scp-7', engagementId: 'eng-2', title: 'L1 Helpdesk Support', status: 'In Progress', completionPercent: 100 },
  { id: 'scp-8', engagementId: 'eng-2', title: 'L2 Applications Support', status: 'In Progress', completionPercent: 100 },
];

export const SERVICES: Service[] = [
  { id: 'srv-1', serviceName: 'Accounts Payable', businessUnit: 'Finance & Accounting', description: 'End-to-end AP processing', defaultSLA: '48 hours', status: 'Active' },
  { id: 'srv-2', serviceName: 'Accounts Receivable', businessUnit: 'Finance & Accounting', description: 'AR management and collections', defaultSLA: '24 hours', status: 'Active' },
  { id: 'srv-3', serviceName: 'General Ledger', businessUnit: 'Finance & Accounting', description: 'GL maintenance and reconciliation', defaultSLA: '5 days', status: 'Active' },
  { id: 'srv-4', serviceName: 'Month End Close', businessUnit: 'Finance & Accounting', description: 'Financial reporting and month-end close', defaultSLA: '10 days', status: 'Active' },
  { id: 'srv-5', serviceName: 'Service Desk', businessUnit: 'IT Services', description: 'Level 1 and Level 2 IT support', defaultSLA: '4 hours', status: 'Active' },
  { id: 'srv-6', serviceName: 'Software Development', businessUnit: 'IT Services', description: 'Custom software design and delivery', defaultSLA: '30 days', status: 'Active' },
  { id: 'srv-7', serviceName: 'Recruitment Delivery', businessUnit: 'Recruitment', description: 'End-to-end candidate sourcing', defaultSLA: '14 days', status: 'Active' },
  { id: 'srv-8', serviceName: 'Payroll Processing', businessUnit: 'Payroll', description: 'Bi-weekly and monthly payroll execution', defaultSLA: '3 days', status: 'Active' },
];

export const CLIENT_SERVICES: ClientServiceMapping[] = [
  // Client 1 (Healthcare) subscribes to Finance services
  { id: 'csm-1', clientId: 'c1', serviceId: 'srv-1', startDate: '2024-01-01', status: 'Active' },
  { id: 'csm-2', clientId: 'c1', serviceId: 'srv-4', startDate: '2024-01-01', status: 'Active' },
  
  // Client 2 (Entertainment) subscribes to Finance and IT
  { id: 'csm-3', clientId: 'c2', serviceId: 'srv-2', startDate: '2023-06-01', status: 'Active' },
  { id: 'csm-4', clientId: 'c2', serviceId: 'srv-5', startDate: '2023-06-01', status: 'Active' },
  { id: 'csm-5', clientId: 'c2', serviceId: 'srv-6', startDate: '2023-06-01', status: 'Active' }
];

export const TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    templateName: 'Month End Close Checklist',
    serviceId: 'srv-4',
    businessUnit: 'Finance & Accounting',
    frequency: 'Monthly',
    defaultOwnerRole: 'Processor',
    status: 'Active',
    workItems: [
      { workItemType: 'Standard Transaction', title: 'Bank Reconciliation', description: 'Reconcile all bank accounts' },
      { workItemType: 'Audit/Review', title: 'AP Review', description: 'Review AP aging summary' },
      { workItemType: 'Standard Transaction', title: 'Accrual Posting', description: 'Post month-end accruals' },
      { workItemType: 'Deliverable', title: 'Financial Reporting', description: 'Generate preliminary financials' },
    ]
  },
  {
    id: 'tpl-2',
    templateName: 'New Hire Onboarding',
    serviceId: 'srv-7',
    businessUnit: 'Recruitment',
    frequency: 'One Time',
    defaultOwnerRole: 'Internal Manager',
    status: 'Active',
    workItems: [
      { workItemType: 'Standard Transaction', title: 'Background Check', description: 'Initiate vendor background check' },
      { workItemType: 'Governance/Meeting', title: 'Orientation', description: 'Schedule orientation session' },
      { workItemType: 'Deliverable', title: 'Offer Letter', description: 'Generate and send offer' },
    ]
  }
];

// Combine new work items with legacy activities mapped to work items
export const WORK_ITEMS: WorkItem[] = [];

// Create 500 mock work items
for (let i = 0; i < 500; i++) {
  const isFinance = i % 2 === 0;
  const isIssue = i % 10 === 0;
  const clientInfo = CLIENTS[Math.floor(Math.random() * CLIENTS.length)];
  const statusPool: any[] = ['New', 'In Progress', 'Blocked', 'Completed', 'Under Review'];

  WORK_ITEMS.push({
    id: `wi-${1000 + i}`,
    clientId: clientInfo.id,
    serviceId: isFinance ? 'srv-1' : 'srv-5',
    workItemType: isIssue ? 'Incident/Ticket' : (i % 3 === 0 ? 'Audit/Review' : 'Standard Transaction'),
    title: isFinance ? `Process AP Invoice #${5000 + i}` : `IT Ticket: Access Request #${9000 + i}`,
    description: 'Auto-generated work item from enterprise orchestration engine',
    status: statusPool[Math.floor(Math.random() * statusPool.length)],
    priority: i % 15 === 0 ? 'Critical' : (i % 5 === 0 ? 'High' : 'Medium'),
    primaryOwner: USERS[Math.floor(Math.random() * USERS.length)].id,
    createdDate: new Date(Date.now() - Math.random() * 8640000000).toISOString(),
    dueDate: new Date(Date.now() + (Math.random() - 0.5) * 8640000000).toISOString(),
    createdBy: USERS[0].id,
    tags: isIssue ? ['Urgent', 'Escalation'] : ['Standard'],
  });
}

// Convert activities to work items so system is cohesive
ACTIVITIES.forEach(act => {
  WORK_ITEMS.push({
    id: `wi-act-${act.id}`,
    clientId: act.clientId,
    workItemType: act.tag === 'Exception' ? 'Exception Processing' : 'Standard Transaction',
    title: `Activity: ${act.processType} ${act.documentReference || act.batchName}`,
    description: act.processingNotes || 'Legacy Activity Representation',
    status: act.status as any,
    priority: act.tag === 'Escalation' ? 'Critical' : 'Medium',
    primaryOwner: act.userId,
    createdDate: act.timestamp,
    createdBy: 'System',
    legacyActivityId: act.id,
    tags: [act.tag],
  });
});

export const SCENARIO_COMMUNICATIONS: any[] = [];
export const ASSIGNMENT_HISTORY: AssignmentHistory[] = [];

// Inject Mock Operational Scenarios (Accounting)
const acctBaseTime = Date.now() - 3000000;
WORK_ITEMS.push({ 
  id: 'wi-mock-acct-01', clientId: 'c1', serviceId: 'srv-1', workItemType: 'Exception Processing', 
  title: 'Invoice Clarification - Vendor INV-45920', description: 'Vendor amount mismatch compared to PO.',
  status: 'Blocked', priority: 'High', primaryOwner: 'u3', createdDate: new Date(acctBaseTime).toISOString(), createdBy: 'u2'
});
SCENARIO_COMMUNICATIONS.push(
  { id: 'sc-acct-1', objectType: 'WorkItem', objectId: 'wi-mock-acct-01', sender: 'Sumanth Reddy', message: 'The vendor total is $400 over the PO amount.', timestamp: new Date(acctBaseTime + 50000).toISOString(), priority: 'High', tag: 'Clarification Required' },
  { id: 'sc-acct-2', objectType: 'WorkItem', objectId: 'wi-mock-acct-01', sender: 'Ioana White', message: 'This vendor had approved freight charges. Process it.', timestamp: new Date(acctBaseTime + 600000).toISOString(), priority: 'High', tag: 'Decision' }
);
ASSIGNMENT_HISTORY.push({ id: 'ah-1', workItemId: 'wi-mock-acct-01', assignedBy: 'u2', oldOwner: undefined, newOwner: 'u3', assignedDate: new Date(acctBaseTime + 1000).toISOString() });

// Inject Mock Operational Scenarios (IT)
const itBaseTime = Date.now() - 5000000;
WORK_ITEMS.push({ 
  id: 'wi-mock-it-01', clientId: 'c2', serviceId: 'srv-5', workItemType: 'Incident/Ticket', 
  title: 'Access Request: Prod DB Read-Only for Ops', description: 'Request read only DB access to research latency issues.',
  status: 'Under Review', priority: 'Critical', primaryOwner: 'u9', createdDate: new Date(itBaseTime).toISOString(), createdBy: 'u22'
});
SCENARIO_COMMUNICATIONS.push(
  { id: 'sc-it-1', objectType: 'WorkItem', objectId: 'wi-mock-it-01', sender: 'Mahesh Babu', message: 'I need access ASAP to debug the latency seen earlier.', timestamp: new Date(itBaseTime + 10000).toISOString(), priority: 'Critical', tag: 'Knowledge Note' },
  { id: 'sc-it-2', objectType: 'WorkItem', objectId: 'wi-mock-it-01', sender: 'Venkata raghu', message: 'Please see [wi-mock-it-02] as this might be related to the ongoing incident.', timestamp: new Date(itBaseTime + 50000).toISOString(), priority: 'High', tag: 'General Communication' }
);
WORK_ITEMS.push({ 
  id: 'wi-mock-it-02', clientId: 'c2', serviceId: 'srv-5', workItemType: 'Incident/Ticket', 
  title: 'Incident INC-841: Checkout Latency High', description: 'We are experiencing 4s latency on checkout flows.',
  status: 'In Progress', priority: 'Critical', primaryOwner: 'u12', createdDate: new Date(itBaseTime - 500000).toISOString(), createdBy: 'u19'
});

// Inject Mock Operational Scenarios (Recruitment)
const recBaseTime = Date.now() - 1000000;
WORK_ITEMS.push({ 
  id: 'wi-mock-rec-01', clientId: 'c2', serviceId: 'srv-7', workItemType: 'Approval Request', 
  title: 'Offer Approval - Lead Architect (Jane Doe)', description: 'Jane cleared 5 rounds. Offer letter attached.',
  status: 'New', priority: 'High', primaryOwner: 'u13', approver: 'u1', createdDate: new Date(recBaseTime).toISOString(), createdBy: 'u7'
});
SCENARIO_COMMUNICATIONS.push(
  { id: 'sc-rec-1', objectType: 'WorkItem', objectId: 'wi-mock-rec-01', sender: 'Pavan Chary', message: 'Ready for final signature. Let me know if you need any adjustments.', timestamp: new Date(recBaseTime + 5000).toISOString(), priority: 'Medium', tag: 'Approval Request' }
);

