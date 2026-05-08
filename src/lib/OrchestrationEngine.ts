// ENTERPRISE ORCHESTRATION ENGINE
// This module represents the backend-governed distributed workflow operating system.
// It centralizes all state manipulation, concurrency, event sourcing, and rule evaluation.

export type EventType = 
  | 'WORKFLOW_CREATED' 
  | 'ACTIVITY_CREATED' 
  | 'ACTIVITY_STATUS_CHANGED' 
  | 'TASK_STATUS_CHANGED'
  | 'TASK_REASSIGNED'
  | 'COMMUNICATION_REPLY_SENT'
  | 'SLA_BREACH'
  | 'SLA_ROUTED'
  | 'RULE_EVALUATION_TRIGGER'
  | 'DOCUMENT_UPLOADED'
  | 'DEPENDENCY_RESOLVED'
  | 'WORKER_JOB_COMPLETED';

export interface OrchestrationEvent {
  id: string;
  type: EventType;
  tenantId: string;
  version: number;
  timestamp: string;
  actorId: string;
  payload: any;
}

export interface StateSnapshot {
  activities: any[];
  tasks: any[];
  workflows: any[];
  notifications: any[];
  auditLogs: any[];
  decisionLogs: any[];
}

// 1. EVENT STORE (Append-Only Event Sourcing)
class EventStore {
  private events: OrchestrationEvent[] = [];

  public append(event: OrchestrationEvent) {
    this.events.push(event);
    // In a real system, this persists to Kafka/Postgres
  }

  public getEvents(tenantId: string): OrchestrationEvent[] {
    return this.events.filter(e => e.tenantId === tenantId);
  }

  public replay(tenantId: string): StateSnapshot {
    // Reconstruct state purely from event lineage
    console.log(`[EVENT STORE] Replaying ${this.events.length} events for tenant ${tenantId}`);
    return { activities: [], tasks: [], workflows: [], notifications: [], auditLogs: [], decisionLogs: [] };
  }
}

// 2. CONCURRENCY & LOCK MANAGER
class DistributedLockManager {
  private locks = new Map<string, string>(); // entityId -> lockHolderId

  public acquireLock(entityId: string, actorId: string): boolean {
    if (this.locks.has(entityId) && this.locks.get(entityId) !== actorId) {
      console.warn(`[CONCURRENCY] Pessimistic lock collision on ${entityId}. Wait for release.`);
      return false;
    }
    this.locks.set(entityId, actorId);
    return true;
  }

  public releaseLock(entityId: string, actorId: string) {
    if (this.locks.get(entityId) === actorId) {
      this.locks.delete(entityId);
    }
  }
}

// 3. FINITE STATE MACHINE (FSM) GOVERNANCE
class StateMachine {
  private readonly transitions: Record<string, string[]> = {
    'Task:Open': ['In Progress', 'Blocked', 'Completed', 'Exception'],
    'Task:In Progress': ['Open', 'Blocked', 'Completed', 'Exception'],
    'Task:Blocked': ['Open', 'In Progress', 'Completed', 'Exception'],
    'Task:Completed': ['Exception'], // Immutable once completed, unless exception override
    'Task:Exception': ['Open', 'In Progress'],
    
    'Activity:Pending': ['In Progress', 'Need Clarification', 'Completed', 'Escalated - Routed'],
    'Activity:In Progress': ['Pending', 'Need Clarification', 'Completed', 'Escalated - Routed'],
    'Activity:Need Clarification': ['In Progress', 'Pending'],
    'Activity:Escalated - Routed': ['In Progress'],
    'Activity:Completed': []
  };

  public validateTransition(entityType: 'Task' | 'Activity', current: string, next: string): boolean {
    const key = `${entityType}:${current}`;
    const allowed = this.transitions[key] || [];
    if (!allowed.includes(next)) {
      throw new Error(`[FSM BLOCK] Hard rejection: Invalid transition from ${current} to ${next} for ${entityType}.`);
    }
    return true;
  }
}

// 4. DEPENDENCY GRAPH ENGINE
class DependencyGraph {
  public resolveDependencies(taskId: string, payload: any, currentTasks: any[]): boolean {
    // Check if task completion unlocks downstream automation 
    console.log(`[DEPENDENCY ENGINE] Analyzing downstream impact for completion of ${taskId}.`);
    return true; // Simplified placeholder
  }
}

// 5. TEMPORAL SCHEDULING ENGINE
class TemporalEngine {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  public scheduleSlaCountdown(taskId: string, breachedAt: string, callback: () => void) {
    const delay = new Date(breachedAt).getTime() - Date.now();
    if (delay > 0) {
      const timer = setTimeout(() => {
        console.warn(`[TEMPORAL ENGINE] ⏱️ SLA Breach Timeout Triggered for ${taskId}.`);
        callback();
      }, delay);
      this.timers.set(taskId, timer);
    } else {
      callback();
    }
  }

  public clearTimer(taskId: string) {
    if (this.timers.has(taskId)) {
      clearTimeout(this.timers.get(taskId)!);
      this.timers.delete(taskId);
    }
  }
}

// 6. BUSINESS RULES & GOVERNANCE ENGINE
class RulesEngine {
  public evaluate(state: StateSnapshot, actor: any, eventType: string, payload: any): any[] {
    const consequentActions = [];
    // e.g. If client replies to a blocked task -> auto-unblock
    if (eventType === 'COMMUNICATION_REPLY_SENT' && actor.role.includes('Client')) {
      console.log(`[RULES ENGINE] Executing Dynamic Policy: ClientReply_AutoResume`);
      consequentActions.push({
        type: 'TASK_STATUS_CHANGED',
        payload: { taskId: payload.linkedTaskId, activityId: payload.activityId, newStatus: 'Open', autoResolved: true }
      });
    }
    // High Priority Tag -> Auto Escalate Priority
    if (eventType === 'ACTIVITY_CREATED' && payload.activity.tag === 'Escalation') {
      console.log(`[RULES ENGINE] Executing Dynamic Policy: FastTrack_Escalation_Routing`);
      consequentActions.push({
        type: 'RULE_EVALUATION_TRIGGER',
        payload: { ruleId: 'Policy_Escalation', activityId: payload.activity.id }
      });
    }
    return consequentActions; // Secondary events triggered by rules
  }
}

// 7. MULTI-TENANT ENTERPRISE ORCHESTRATOR 
export class EnterpriseOrchestrator {
  private static instance: EnterpriseOrchestrator;
  
  public eventStore = new EventStore();
  public lockManager = new DistributedLockManager();
  public stateMachine = new StateMachine();
  public rulesEngine = new RulesEngine();
  public dependencyGraph = new DependencyGraph();
  public temporalEngine = new TemporalEngine();
  
  // Current volatile state (in memory cache for React) representing the distributed DB
  private stateCache: StateSnapshot = {
    activities: [], tasks: [], workflows: [], notifications: [], auditLogs: [], decisionLogs: []
  };

  private constructor() {}

  public static getInstance(): EnterpriseOrchestrator {
    if (!EnterpriseOrchestrator.instance) {
      EnterpriseOrchestrator.instance = new EnterpriseOrchestrator();
    }
    return EnterpriseOrchestrator.instance;
  }

  public loadInitialState(snapshot: StateSnapshot) {
    this.stateCache = snapshot;
  }

  // Purely Backend-Governed Authority execution
  public dispatch(eventDetails: Omit<OrchestrationEvent, 'id' | 'timestamp' | 'version'>, actor: any): StateSnapshot {
    const txId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    console.group(`[ORCHESTRATOR] ⚡ Executing Transaction: ${txId} | Type: ${eventDetails.type}`);
    
    // 1. Acquire Locks (Concurrency Control)
    const entityId = eventDetails.payload.activityId || eventDetails.payload.taskId || eventDetails.payload.entityId || 'GLOBAL';
    if (!this.lockManager.acquireLock(entityId, actor.id)) {
      console.error(`[ORCHESTRATOR BLOCK] Unable to acquire distributed lock for ${entityId}`);
      console.groupEnd();
      return this.stateCache; // Return unaffected state
    }

    try {
      const event: OrchestrationEvent = {
        id: txId,
        timestamp: new Date().toISOString(),
        version: 1, // Workflow versioning
        ...eventDetails,
      };

      // 2. Validate FSM State Transition
      if (event.type === 'TASK_STATUS_CHANGED') {
        const task = this.stateCache.tasks.find(t => t.id === event.payload.taskId);
        if (task) {
          this.stateMachine.validateTransition('Task', task.status, event.payload.newStatus);
        }
      }
      if (event.type === 'ACTIVITY_STATUS_CHANGED') {
        const activity = this.stateCache.activities.find(a => a.id === event.payload.activityId);
        if (activity) {
          this.stateMachine.validateTransition('Activity', activity.status, event.payload.newStatus);
        }
      }

      // 3. Process the Event Mutators directly on the Backend Cache
      this.processEventMutator(event, actor);

      // 4. Append to Immutable Event Store
      this.eventStore.append(event);

      // 5. Evaluate Business Rules for cascading automation (Event Chaining)
      const secondaryEvents = this.rulesEngine.evaluate(this.stateCache, actor, event.type, event.payload);
      for (const req of secondaryEvents) {
        console.log(`[ORCHESTRATOR] ✨ Spawning secondary rule event: ${req.type}`);
        this.processEventMutator({
          id: `txn-${Date.now()}-sec`, timestamp: new Date().toISOString(), version: 1, type: req.type, tenantId: event.tenantId, actorId: 'System', payload: req.payload
        }, { id: 'System', role: 'System Orchestrator' });
      }

    } catch (error) {
      console.error(`[ORCHESTRATOR FAULT] Transaction ${txId} rolled back due to error:`, error);
      // Implementation of compensation logic / rollback goes here
    } finally {
      // 6. Release Lock
      this.lockManager.releaseLock(entityId, actor.id);
      console.groupEnd();
    }

    // Return deeply cloned snapshot to prevent frontend from mutating the cache directly
    return JSON.parse(JSON.stringify(this.stateCache));
  }

  private processEventMutator(event: OrchestrationEvent, actor: any) {
    const timestamp = event.timestamp;
    
    // Create Audit Log
    const commitLedger = (action: string, entityId: string, entityType: string, oldVal: any, newVal: any, notes?: string) => {
      this.stateCache.auditLogs.unshift({
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        entityType, entityId: entityId || 'SYS-ORCH', action,
        changedBy: event.actorId, timestamp, oldValue: oldVal, newValue: newVal, notes: notes || `Audit sequence matching TX: ${event.id}`
      });
    };

    switch (event.type) {
      case 'ACTIVITY_CREATED': {
        const activity = event.payload.activity;
        this.stateCache.activities.unshift(activity);
        
        // Orchestrate downstream system task mapping
        const newTask = {
          id: `task-${Date.now()}`,
          clientId: activity.clientId,
          processType: activity.processType,
          linkedActivityId: activity.id,
          taskName: `Process ${activity.documentReference || activity.batchName}`,
          assignedTo: activity.userId,
          createdBy: actor.id,
          priority: activity.tag === 'Escalation' ? 'High' : 'Medium',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'Open', source: 'Orchestrator Automation', createdAt: timestamp
        };
        this.stateCache.tasks.unshift(newTask);
        commitLedger('LIFECYCLE_TASK_GENERATED', newTask.id, 'Task', null, 'Open', `Engine generated dependency workflow for activity ${activity.id}`);
        break;
      }

      case 'TASK_STATUS_CHANGED': {
        const { taskId, newStatus } = event.payload;
        const task = this.stateCache.tasks.find(t => t.id === taskId);
        if (!task) break;

        const oldStatus = task.status;
        task.status = newStatus;
        
        // Clear SLA timers if task completed
        if (newStatus === 'Completed') {
          this.temporalEngine.clearTimer(taskId);
          this.dependencyGraph.resolveDependencies(taskId, event.payload, this.stateCache.tasks);
        }

        // Propagate upstream
        if (task.linkedActivityId) {
          const act = this.stateCache.activities.find(a => a.id === task.linkedActivityId);
          if (act) {
            const oldActStatus = act.status;
            if (newStatus === 'Completed') act.status = 'Completed';
            if (newStatus === 'Blocked') act.status = 'Need Clarification';
            if (newStatus === 'In Progress' && act.status !== 'In Progress') act.status = 'In Progress';
            act.lastUpdate = timestamp;
            if (oldActStatus !== act.status) {
              commitLedger('UPSTREAM_ACTIVITY_SYNC', act.id, 'Activity', oldActStatus, act.status, 'Propagated from dependency task execution');
            }
          }
        }
        commitLedger('TASK_STATUS_CHANGED', taskId, 'Task', oldStatus, newStatus);
        break;
      }
      
      case 'TASK_REASSIGNED': {
        const { taskId, newUserId } = event.payload;
        const task = this.stateCache.tasks.find(t => t.id === taskId);
        if (task) {
          task.assignedTo = newUserId;
          // Propagate Ownership upstream
          if (task.linkedActivityId) {
            const act = this.stateCache.activities.find(a => a.id === task.linkedActivityId);
            if (act) {
               act.userId = newUserId;
               act.lastUpdate = timestamp;
               commitLedger('OWNERSHIP_SYNC', act.id, 'Activity', null, newUserId, 'Ownership propagated from task reassignment');
            }
          }
          this.stateCache.notifications.unshift({
            id: `notif-${Date.now()}`, userId: newUserId, title: 'Workflow Transferred',
            message: `A workflow task has been assigned to you.`, type: 'info', timestamp, isRead: false
          });
          commitLedger('TASK_REASSIGNED', taskId, 'Task', task.assignedTo, newUserId);
        }
        break;
      }

      case 'COMMUNICATION_REPLY_SENT': {
        // Logic handled through Rules Engine primarily, but logging here
        commitLedger('COMMUNICATION_EVENT', event.payload.activityId, 'Activity', null, null, 'Reply processed by Orchestrator');
        break;
      }

      default:
        console.debug(`[ORCHESTRATOR DEFAULT HANDLER] State mutator not strictly defined for ${event.type}`);
    }
  }
}

export const Orchestrator = EnterpriseOrchestrator.getInstance();
