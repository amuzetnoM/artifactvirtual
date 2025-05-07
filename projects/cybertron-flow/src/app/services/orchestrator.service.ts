import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { LangchainService, ChatMessage } from './langchain.service';
import { SchedulerService, ScheduledJob } from './scheduler.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PermissionService, User } from './permission.service';

// Node types and interfaces for the workflow
export interface NodePort {
  id: string;
  type: string;
  x: number;
  y: number;
}

export interface FlowNode {
  id: string;
  type: string;
  name: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: NodePort[];
  outputs: NodePort[];
  config: any;
  state?: {
    status: 'idle' | 'running' | 'success' | 'error';
    result?: any;
    error?: string;
    lastRun?: Date;
    progress?: number;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  sourcePortId: string;
  target: string;
  targetPortId: string;
  points: { x: number; y: number }[];
}

export interface GraphData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  zoom?: number;
  offset?: { x: number; y: number };
}

export interface WorkflowResult {
  success: boolean;
  message: string;
  nodeResults: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class OrchestratorService {
  private DAG: Map<string, string[]> = new Map(); // Directed Acyclic Graph for execution order
  private executionStatus: Map<string, boolean> = new Map(); // Track which nodes are executed
  
  // Store jobs registered with scheduler service
  private scheduledJobs: Map<string, string> = new Map(); // nodeId -> jobId

  // --- Analytics Tracking ---
  private workflowAnalytics: any[] = [];

  constructor(
    private langchainService: LangchainService,
    private schedulerService: SchedulerService
  ) {
    // Listen for scheduled job triggers
    this.schedulerService.jobTriggered$.subscribe(jobId => {
      // Find the node associated with this job
      for (const [nodeId, scheduledJobId] of this.scheduledJobs.entries()) {
        if (scheduledJobId === jobId) {
          console.log(`Scheduler triggered node: ${nodeId}`);
          // Here we would trigger the workflow starting from this node
          // For now just log it
          break;
        }
      }
    });
  }

  /**
   * Create a new node of specified type (with permission check)
   */
  createNode(type: string, user: User): FlowNode | null {
    if (!PermissionService.canCreateWorkflow(user)) {
      throw new Error('Permission denied: cannot create workflow node');
    }
    // Default configurations per node type
    const nodeConfigs = {
      chat: {
        width: 180,
        height: 100,
        inputs: [{ id: 'input', type: 'data' }],
        outputs: [{ id: 'output', type: 'data' }],
        defaultConfig: {
          model: 'gpt-3.5-turbo',
          systemPrompt: 'You are a helpful assistant.',
          temperature: 0.7,
          maxTokens: 500
        }
      },
      integration: {
        width: 180,
        height: 100,
        inputs: [{ id: 'input', type: 'data' }],
        outputs: [{ id: 'output', type: 'data' }],
        defaultConfig: {
          integrationType: 'webhook',
          endpoint: '',
          method: 'POST',
          apiKey: ''
        }
      },
      scheduler: {
        width: 180,
        height: 100,
        inputs: [],
        outputs: [{ id: 'trigger', type: 'trigger' }],
        defaultConfig: {
          scheduleType: 'cron',
          expression: '0 9 * * *', // 9 AM daily
          timezone: 'UTC',
          enabled: true
        }
      },
      task: {
        width: 180,
        height: 100,
        inputs: [{ id: 'input', type: 'data' }],
        outputs: [{ id: 'output', type: 'data' }],
        defaultConfig: {
          taskType: 'script',
          script: '',
          timeout: 30000
        }
      },
      report: {
        width: 180,
        height: 100,
        inputs: [{ id: 'input', type: 'data' }],
        outputs: [],
        defaultConfig: {
          format: 'text',
          destination: 'console'
        }
      }
    };
    
    // Use the specified type or default to task
    const config = nodeConfigs[type] || nodeConfigs.task;
    
    // Center of visible area
    const x = window.innerWidth / 2 - config.width / 2;
    const y = window.innerHeight / 2 - config.height / 2;
    
    // Create the node object
    const node: FlowNode = {
      id: uuidv4(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      x,
      y,
      width: config.width,
      height: config.height,
      inputs: config.inputs.map(input => ({ ...input, x: 0, y: 0 })),
      outputs: config.outputs.map(output => ({ ...output, x: 0, y: 0 })),
      config: { ...config.defaultConfig },
      state: {
        status: 'idle',
        progress: 0
      }
    };
    
    return node;
  }

  /**
   * Update a node (with permission check)
   */
  updateNode(node: FlowNode, updates: Partial<FlowNode>, user: User): FlowNode {
    if (!PermissionService.canUpdateWorkflow(user)) {
      throw new Error('Permission denied: cannot update workflow node');
    }
    return { ...node, ...updates };
  }

  /**
   * Delete a node (with permission check)
   */
  deleteNode(nodeId: string, user: User): boolean {
    if (!PermissionService.canDeleteWorkflow(user)) {
      throw new Error('Permission denied: cannot delete workflow node');
    }
    // Actual deletion logic would go here
    return true;
  }

  /**
   * Create a connection between nodes
   */
  createEdge(sourceId: string, targetId: string): FlowEdge {
    return {
      id: uuidv4(),
      source: sourceId,
      sourcePortId: 'output', // Default to output port
      target: targetId,
      targetPortId: 'input',  // Default to input port
      points: [] // Will be calculated during rendering
    };
  }

  /**
   * Move a node to a new position
   */
  moveNode(node: FlowNode, deltaX: number, deltaY: number): FlowNode {
    node.x += deltaX;
    node.y += deltaY;
    return node;
  }

  /**
   * Find node at a specific position for selection
   */
  getNodeAtPosition(x: number, y: number, nodes: FlowNode[]): FlowNode | null {
    // Search in reverse order to select nodes rendered on top
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (x >= node.x && x <= node.x + node.width && 
          y >= node.y && y <= node.y + node.height) {
        return node;
      }
    }
    return null;
  }

  /**
   * Render the graph onto an HTML canvas
   */
  renderGraph(canvas: HTMLCanvasElement, data: GraphData): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
    canvas.width = canvas.parentElement!.clientWidth;
    canvas.height = canvas.parentElement!.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and panning
    ctx.save();
    ctx.translate(data.offset?.x || 0, data.offset?.y || 0);
    ctx.scale(data.zoom || 1, data.zoom || 1);
    
    // Render edges first (so they appear behind nodes)
    this.renderEdges(ctx, data.edges, data.nodes);
    
    // Render nodes
    data.nodes.forEach(node => this.renderNode(ctx, node));
    
    // Restore canvas context
    ctx.restore();
  }

  /**
   * Render a single node
   */
  private renderNode(ctx: CanvasRenderingContext2D, node: FlowNode): void {
    // Node colors based on type
    const nodeColors = {
      chat: '#8e44ad',      // Purple
      integration: '#16a085', // Green
      scheduler: '#f39c12',   // Orange
      task: '#3498db',      // Blue
      report: '#e74c3c'     // Red
    };
    
    // Status colors
    const statusColors = {
      idle: '#6c757d',    // Gray
      running: '#007bff', // Blue
      success: '#28a745', // Green
      error: '#dc3545'    // Red
    };
    
    // Node color based on type
    const color = nodeColors[node.type as keyof typeof nodeColors] || '#6c757d';
    
    // Draw node body with rounded corners
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    this.roundRect(ctx, node.x, node.y, node.width, node.height, 8, true, true);
    
    // Status indicator
    if (node.state && node.state.status) {
      ctx.fillStyle = statusColors[node.state.status as keyof typeof statusColors];
      ctx.beginPath();
      ctx.arc(node.x + node.width - 10, node.y + 10, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Node title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      node.name.length > 20 ? node.name.substring(0, 17) + '...' : node.name,
      node.x + node.width / 2,
      node.y + 25
    );
    
    // Draw ports
    this.drawNodePorts(ctx, node);
  }

  /**
   * Draw connection ports for a node
   */
  private drawNodePorts(ctx: CanvasRenderingContext2D, node: FlowNode): void {
    // Input ports at top
    node.inputs.forEach((port, index) => {
      const spacing = node.width / (node.inputs.length + 1);
      port.x = node.x + spacing * (index + 1);
      port.y = node.y;
      
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(port.x, port.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Output ports at bottom
    node.outputs.forEach((port, index) => {
      const spacing = node.width / (node.outputs.length + 1);
      port.x = node.x + spacing * (index + 1);
      port.y = node.y + node.height;
      
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(port.x, port.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Render all edges between nodes
   */
  private renderEdges(ctx: CanvasRenderingContext2D, edges: FlowEdge[], nodes: FlowNode[]): void {
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Find the actual ports
      const sourcePort = sourceNode.outputs.find(p => p.id === edge.sourcePortId);
      const targetPort = targetNode.inputs.find(p => p.id === edge.targetPortId);
      
      if (!sourcePort || !targetPort) return;
      
      // Draw edge as a bezier curve
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      
      const cp1x = sourcePort.x;
      const cp1y = sourcePort.y + 50; // Control point below source
      const cp2x = targetPort.x;
      const cp2y = targetPort.y - 50; // Control point above target
      
      ctx.beginPath();
      ctx.moveTo(sourcePort.x, sourcePort.y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, targetPort.x, targetPort.y);
      ctx.stroke();
      
      // Draw arrow at target
      this.drawArrow(ctx, targetPort.x, targetPort.y);
      
      // Store points for hit testing
      edge.points = [
        { x: sourcePort.x, y: sourcePort.y },
        { x: cp1x, y: cp1y },
        { x: cp2x, y: cp2y },
        { x: targetPort.x, y: targetPort.y }
      ];
    });
  }

  /**
   * Draw an arrow at the end of an edge
   */
  private drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const arrowSize = 8;
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - arrowSize, y - arrowSize);
    ctx.lineTo(x + arrowSize, y - arrowSize);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Helper for drawing rounded rectangles
   */
  private roundRect(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number, 
    fill: boolean, 
    stroke: boolean
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  /**
   * Get analytics data for all workflow runs
   */
  getWorkflowAnalytics(): any[] {
    return this.workflowAnalytics;
  }

  /**
   * Execute the workflow (with permission check)
   */
  executeWorkflow(nodes: FlowNode[], edges: FlowEdge[], user: User): Observable<WorkflowResult> {
    if (!PermissionService.canExecuteWorkflow(user)) {
      return throwError(() => new Error('Permission denied: cannot execute workflow'));
    }
    const workflowRun: any = {
      id: uuidv4(),
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'running',
      nodeStats: [],
      error: null
    };
    const nodeStartTimes: Record<string, number> = {};
    const nodeEndTimes: Record<string, number> = {};
    const nodeStatuses: Record<string, string> = {};
    const nodeErrors: Record<string, string> = {};

    // Build directed graph for execution order
    this.buildExecutionGraph(nodes, edges);
    this.executionStatus = new Map();
    nodes.forEach(node => {
      this.executionStatus.set(node.id, false);
      node.state = { status: 'idle', progress: 0 };
    });
    const startNodes = nodes.filter(node => !edges.some(edge => edge.target === node.id));
    if (startNodes.length === 0) {
      workflowRun.status = 'error';
      workflowRun.error = 'No start nodes found in workflow';
      workflowRun.endedAt = new Date().toISOString();
      this.workflowAnalytics.push(workflowRun);
      return throwError(() => new Error('No start nodes found in workflow'));
    }
    const results: Record<string, any> = {};
    // Wrap executeNode to track timing and status
    const trackedExecuteNode = (node: FlowNode, inputs: Record<string, any>, nodes: FlowNode[], edges: FlowEdge[], results: Record<string, any>): Observable<any> => {
      nodeStartTimes[node.id] = Date.now();
      return this.executeNode(node, inputs, nodes, edges, results).pipe(
        map(res => {
          nodeEndTimes[node.id] = Date.now();
          nodeStatuses[node.id] = 'success';
          return res;
        }),
        catchError(err => {
          nodeEndTimes[node.id] = Date.now();
          nodeStatuses[node.id] = 'error';
          nodeErrors[node.id] = err.message;
          return throwError(() => err);
        })
      );
    };
    const startExecutions = startNodes.map(node => trackedExecuteNode(node, {}, nodes, edges, results));
    return forkJoin(startExecutions).pipe(
      map(() => {
        workflowRun.status = 'success';
        workflowRun.endedAt = new Date().toISOString();
        // Collect node stats
        workflowRun.nodeStats = nodes.map(node => ({
          nodeId: node.id,
          nodeName: node.name,
          type: node.type,
          status: nodeStatuses[node.id] || 'skipped',
          error: nodeErrors[node.id] || null,
          durationMs: nodeEndTimes[node.id] && nodeStartTimes[node.id] ? (nodeEndTimes[node.id] - nodeStartTimes[node.id]) : null
        }));
        // Error rate
        workflowRun.errorRate = nodes.filter(n => nodeStatuses[n.id] === 'error').length / nodes.length;
        this.workflowAnalytics.push(workflowRun);
        // Optionally persist to localStorage
        localStorage.setItem('workflowAnalytics', JSON.stringify(this.workflowAnalytics));
        return {
          success: true,
          message: 'Workflow executed successfully',
          nodeResults: results
        };
      }),
      catchError(error => {
        workflowRun.status = 'error';
        workflowRun.endedAt = new Date().toISOString();
        workflowRun.error = error.message;
        workflowRun.nodeStats = nodes.map(node => ({
          nodeId: node.id,
          nodeName: node.name,
          type: node.type,
          status: nodeStatuses[node.id] || 'skipped',
          error: nodeErrors[node.id] || null,
          durationMs: nodeEndTimes[node.id] && nodeStartTimes[node.id] ? (nodeEndTimes[node.id] - nodeStartTimes[node.id]) : null
        }));
        workflowRun.errorRate = nodes.filter(n => nodeStatuses[n.id] === 'error').length / nodes.length;
        this.workflowAnalytics.push(workflowRun);
        localStorage.setItem('workflowAnalytics', JSON.stringify(this.workflowAnalytics));
        return of({
          success: false,
          message: `Workflow execution failed: ${error.message}`,
          nodeResults: results
        });
      })
    );
  }

  /**
   * Execute a single node in the workflow
   */
  private executeNode(
    node: FlowNode,
    inputs: Record<string, any>,
    nodes: FlowNode[],
    edges: FlowEdge[],
    results: Record<string, any>
  ): Observable<any> {
    // If node already executed, return its result
    if (this.executionStatus.get(node.id)) {
      return of(results[node.id]);
    }
    
    // Update node state
    node.state = { status: 'running', progress: 0 };
    
    // Execute based on node type
    let execution: Observable<any>;
    
    switch (node.type) {
      case 'chat':
        execution = this.executeChatNode(node, inputs);
        break;
      case 'integration':
        execution = this.executeIntegrationNode(node, inputs);
        break;
      case 'scheduler':
        execution = this.executeSchedulerNode(node);
        break;
      case 'task':
        execution = this.executeTaskNode(node, inputs);
        break;
      case 'report':
        execution = this.executeReportNode(node, inputs);
        break;
      default:
        // If unknown type, just pass through the inputs
        execution = of(inputs);
    }
    
    return execution.pipe(
      map(result => {
        // Mark as executed
        this.executionStatus.set(node.id, true);
        results[node.id] = result;
        
        // Update node state
        node.state = {
          status: 'success',
          result,
          lastRun: new Date(),
          progress: 100
        };
        
        // Find outgoing edges
        const outEdges = edges.filter(edge => edge.source === node.id);
        
        // If no outgoing edges, return the result
        if (outEdges.length === 0) {
          return result;
        }
        
        // Find target nodes for outgoing edges and execute them
        const targetExecutions = outEdges.map(edge => {
          const targetNode = nodes.find(n => n.id === edge.target);
          if (!targetNode) {
            return of(null);
          }
          
          return this.executeNode(
            targetNode, 
            { ...inputs, [edge.sourcePortId]: result }, 
            nodes, 
            edges, 
            results
          );
        });
        
        // Wait for all downstream nodes to execute
        return forkJoin(targetExecutions).pipe(
          map(() => result)
        );
      }),
      catchError(error => {
        // Update node state with error
        node.state = {
          status: 'error',
          error: error.message,
          lastRun: new Date(),
          progress: 0
        };
        return throwError(() => error);
      })
    );
  }

  /**
   * Execute a chat node using LangChain service
   */
  private executeChatNode(node: FlowNode, inputs: Record<string, any>): Observable<string> {
    const inputMessage = inputs.input || 'Hello';
    
    // Set up messages for the chat
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: typeof inputMessage === 'string' ? inputMessage : JSON.stringify(inputMessage)
      }
    ];
    
    // Use LangChain service to generate text
    return this.langchainService.generateText(messages, {
      model: node.config.model,
      systemPrompt: node.config.systemPrompt,
      temperature: node.config.temperature,
      maxTokens: node.config.maxTokens
    });
  }

  /**
   * Execute an integration node
   */
  private executeIntegrationNode(node: FlowNode, inputs: Record<string, any>): Observable<any> {
    // Real API integration for REST, GraphQL, Webhook, OAuth2
    const cfg = node.config;
    const integrationType = cfg.integrationType || 'webhook';
    const endpoint = cfg.endpoint;
    const method = (cfg.method || 'POST').toUpperCase();
    const apiKey = cfg.apiKey || '';
    const headers: Record<string, string> = { ...cfg.headers };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    
    // REST/GraphQL/Webhook
    if (integrationType === 'rest' || integrationType === 'webhook' || integrationType === 'graphql') {
      const body = integrationType === 'graphql'
        ? JSON.stringify({ query: cfg.query, variables: cfg.variables || {} })
        : JSON.stringify(inputs.input);
      
      return new Observable(subscriber => {
        fetch(endpoint, {
          method,
          headers,
          body: method === 'GET' ? undefined : body
        })
          .then(async res => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data.error || res.statusText);
            }
            subscriber.next({ success: true, data });
            subscriber.complete();
          })
          .catch(err => {
            subscriber.error(new Error(`Integration node API error: ${err.message}`));
          });
      });
    }
    // TODO: OAuth2 and other types can be added here
    return of({ success: false, error: 'Unsupported integration type' });
  }

  /**
   * Execute a scheduler node
   */
  private executeSchedulerNode(node: FlowNode): Observable<any> {
    // For real-time execution, create or update the scheduled job
    const existingJobId = this.scheduledJobs.get(node.id);
    
    if (existingJobId) {
      // Update existing job
      return this.schedulerService.getJob(existingJobId).pipe(
        switchMap(existingJob => {
          if (!existingJob) {
            return this.createNewScheduledJob(node);
          }
          
          // Update job with new config
          existingJob.config = {
            scheduleType: node.config.scheduleType,
            expression: node.config.expression,
            timezone: node.config.timezone,
            enabled: node.config.enabled
          };
          
          return this.schedulerService.scheduleJob(existingJob);
        }),
        map(job => ({
          success: true,
          jobId: job.id,
          nextRun: job.nextRun
        }))
      );
    } else {
      // Create new job
      return this.createNewScheduledJob(node).pipe(
        map(job => ({
          success: true,
          jobId: job.id,
          nextRun: job.nextRun
        }))
      );
    }
  }

  /**
   * Create a new scheduled job for a scheduler node
   */
  private createNewScheduledJob(node: FlowNode): Observable<ScheduledJob> {
    const job: ScheduledJob = {
      id: uuidv4(),
      name: `Job for ${node.name}`,
      config: {
        scheduleType: node.config.scheduleType,
        expression: node.config.expression,
        timezone: node.config.timezone,
        enabled: node.config.enabled
      },
      status: 'scheduled'
    };
    
    return this.schedulerService.scheduleJob(job).pipe(
      map(createdJob => {
        // Store job association
        this.scheduledJobs.set(node.id, createdJob.id);
        return createdJob;
      })
    );
  }

  /**
   * Execute a task node
   */
  private executeTaskNode(node: FlowNode, inputs: Record<string, any>): Observable<any> {
    // Support for custom script execution (user-defined logic)
    const script = node.config.script;
    if (script && typeof script === 'string') {
      return new Observable(subscriber => {
        try {
          // Use Function constructor for sandboxed execution (limited)
          // Pass inputs as argument
          // eslint-disable-next-line no-new-func
          const fn = new Function('inputs', script);
          const result = fn(inputs);
          subscriber.next({ success: true, result });
          subscriber.complete();
        } catch (error: any) {
          subscriber.error(new Error(`Task node script error: ${error.message}`));
        }
      });
    }
    // Fallback: simulate as before
    return new Observable(subscriber => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        node.state!.progress = progress;
        if (progress >= 100) {
          clearInterval(interval);
          let result;
          try {
            if (typeof inputs.input === 'string') {
              result = {
                processed: inputs.input.toUpperCase(),
                length: inputs.input.length,
                processedAt: new Date().toISOString()
              };
            } else {
              result = {
                processed: inputs.input,
                processedAt: new Date().toISOString()
              };
            }
            subscriber.next(result);
            subscriber.complete();
          } catch (error) {
            subscriber.error(new Error(`Task execution failed: ${error}`));
          }
        }
      }, 200);
      return () => clearInterval(interval);
    });
  }

  /**
   * Execute a report node
   */
  private executeReportNode(node: FlowNode, inputs: Record<string, any>): Observable<any> {
    const config = node.config || {};
    const formattedData = this.formatReportData(inputs.input, config.format);
    const results: any = {
      success: true,
      format: config.format,
      destinations: [],
      timestamp: new Date().toISOString(),
      report: formattedData
    };

    // File output (simulate by saving to localStorage)
    if (config.destFile && config.filePath) {
      try {
        localStorage.setItem(config.filePath, formattedData);
        results.destinations.push({ type: 'file', filePath: config.filePath, status: 'ok' });
      } catch (e) {
        results.destinations.push({ type: 'file', filePath: config.filePath, status: 'error', error: e.message });
      }
    }

    // Email output (simulate by logging)
    if (config.destEmail && config.email) {
      // In a real app, call backend/email API
      console.log(`[ReportNode] Simulate sending email to ${config.email}:`, formattedData);
      results.destinations.push({ type: 'email', email: config.email, status: 'simulated' });
    }

    // Webhook output (real POST)
    if (config.destWebhook && config.webhookUrl) {
      fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: formattedData, node: node.name, timestamp: results.timestamp })
      }).then(res => {
        results.destinations.push({ type: 'webhook', webhookUrl: config.webhookUrl, status: res.ok ? 'ok' : 'error' });
      }).catch(e => {
        results.destinations.push({ type: 'webhook', webhookUrl: config.webhookUrl, status: 'error', error: e.message });
      });
    }

    // Dashboard output (simulate by logging)
    if (config.destDashboard && config.dashboardSection) {
      // In a real app, push to dashboard state/store
      console.log(`[ReportNode] Simulate dashboard push to section '${config.dashboardSection}':`, formattedData);
      results.destinations.push({ type: 'dashboard', section: config.dashboardSection, status: 'simulated' });
    }

    // Always log for traceability
    console.log(`[ReportNode] Output destinations:`, results.destinations);
    return of(results);
  }

  /**
   * Format report data based on specified format
   */
  private formatReportData(data: any, format: string): string {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        // Simple CSV formatting for demo
        if (Array.isArray(data)) {
          // Get headers
          const headers = Object.keys(data[0] || {}).join(',');
          // Get rows
          const rows = data.map(item => 
            Object.values(item).join(',')
          ).join('\n');
          return `${headers}\n${rows}`;
        } else {
          return Object.entries(data).map(([key, value]) => 
            `${key},${value}`
          ).join('\n');
        }
      case 'markdown':
        return `# Report\n\n${JSON.stringify(data, null, 2)}`;
      case 'text':
      default:
        return typeof data === 'string' ? data : JSON.stringify(data);
    }
  }

  /**
   * Build a directed graph representation of the workflow
   */
  private buildExecutionGraph(nodes: FlowNode[], edges: FlowEdge[]): void {
    this.DAG.clear();
    
    // Initialize graph with all nodes
    nodes.forEach(node => {
      this.DAG.set(node.id, []);
    });
    
    // Add edges to the graph
    edges.forEach(edge => {
      const targets = this.DAG.get(edge.source) || [];
      if (!targets.includes(edge.target)) {
        targets.push(edge.target);
        this.DAG.set(edge.source, targets);
      }
    });
  }
}