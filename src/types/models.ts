export type WorkItemStatus = 
  | 'Draft' | 'New' | 'Assigned' | 'In Progress' 
  | 'Awaiting Information' | 'Awaiting Client' | 'Awaiting Approval' 
  | 'Under Review' | 'On Hold' | 'Blocked' 
  | 'Escalated Level 1' | 'Escalated Level 2' 
  | 'Resolved' | 'Completed' | 'Cancelled' | 'Closed';

export interface WorkItem {
  id: string; // WorkItemID
  clientId: string;
  serviceId?: string;
  engagementId?: string;
  workItemType: 'Standard Transaction' | 'Exception Processing' | 'Audit/Review' | 'Approval Request' | 'Client Clarification' | 'Rule Management' | 'Master Data Management' | 'Governance/Meeting' | 'Incident/Ticket' | 'Deliverable';
  title: string;
  description?: string;
  status: WorkItemStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  primaryOwner?: string;
  backupOwner?: string;
  approver?: string;
  collaborators?: string[];
  watchers?: string[];
  createdDate: string;
  dueDate?: string;
  completedDate?: string;
  tags?: string[];
  parentWorkItemId?: string;
  relatedRuleId?: string;
  relatedWorkflowId?: string;
  relatedScopeId?: string;
  relatedCommunicationId?: string;
  createdBy: string;
  lastUpdatedBy?: string;
  // Fallback for previous Activities
  legacyActivityId?: string;
}

export interface Engagement {
  id: string;
  name: string;
  clientId: string;
  businessUnit: string;
  deliveryManagerId: string;
  clientManagerId: string;
  assignedTeamIds: string[];
  startDate: string;
  endDate?: string;
  status: 'Draft' | 'Active' | 'On Hold' | 'Completed' | 'Terminated';
  monthlyRevenue?: number;
  monthlyCost?: number;
  marginPercent?: number;
  contractType: string;
}

export interface ScopeItem {
  id: string;
  engagementId: string;
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Client Review' | 'Completed' | 'Signed Off';
  completionPercent: number;
}

export interface Service {
  id: string;
  serviceName: string;
  businessUnit: 'Finance & Accounting' | 'IT Services' | 'Recruitment' | 'Managed Services' | 'Payroll' | 'Shared Services';
  description?: string;
  defaultSLA?: string; // e.g. "48 hours"
  defaultWorkflowId?: string;
  defaultTemplateId?: string;
  status: 'Active' | 'Inactive' | 'Draft';
}

export interface ClientServiceMapping {
  id: string;
  clientId: string;
  serviceId: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Inactive';
}

export interface Template {
  id: string;
  templateName: string;
  serviceId: string;
  businessUnit: string;
  frequency: 'One Time' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  defaultOwnerRole?: string;
  defaultWorkflowId?: string;
  defaultSLA?: string;
  status: 'Active' | 'Draft' | 'Archived';
  workItems: Partial<WorkItem>[]; // Definition of items to spawn
}

export interface AssignmentHistory {
  id: string;
  workItemId: string;
  oldOwner?: string;
  newOwner: string;
  assignedBy: string;
  assignedDate: string;
  comments?: string;
}
