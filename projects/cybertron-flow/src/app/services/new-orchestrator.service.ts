import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { NodeVM } from 'vm2';
import { CybertronNode, CybertronEdge, NodeType } from '../node-types/node.model';
import { PermissionService, User } from './permission.service';

@Injectable({
  providedIn: 'root'
})
export class NewOrchestratorService {
  private nodes: Map<string, CybertronNode> = new Map();
  private edges: Map<string, CybertronEdge> = new Map();

  constructor() {}

  // Node management methods
  createNode(type: NodeType, customConfig: Record<string, unknown> = {}): CybertronNode {
    // Check user permission would happen here in production
    const id = uuidv4();
    const node: CybertronNode = {
      id,
      label: this.getDefaultLabel(type),
      type,
      config: this.getDefaultConfig(type, customConfig),
      data: {},
      position: { x: 100, y: 100 },
      dimension: { width: 200, height: type === 'pinned-input' ? 100 : 150 }
    };

    this.nodes.set(id, node);
    return node;
  }

  private getDefaultLabel(type: NodeType): string {
    const typeLabels: Record<NodeType, string> = {
      'chat': 'Chat Agent',
      'integration': 'Integration',
      'scheduler': 'Scheduler',
      'task': 'Task',
      'report': 'Report',
      'pinned-input': 'Pinned Input'
    };
    return typeLabels[type] || 'Node';
  }

  private getDefaultConfig(type: NodeType, customConfig: Record<string, unknown> = {}): Record<string, unknown> {
    const defaultConfigs: Record<NodeType, Record<string, unknown>> = {
      'chat': {
        model: 'gpt-3.5-turbo',
        systemPrompt: 'You are a helpful assistant.'
      },
      'integration': {
        integrationType: 'webhook',
        apiKey: ''
      },
      'scheduler': {
        scheduleType: 'interval',
        expression: '1h'
      },
      'task': {
        script: '// Write your code here\nreturn input;',
        sandboxOptions: {
          timeout: 5000,
          memory: 128,
          allowImports: ['lodash', 'moment']
        }
      },
      'report': {
        destFile: false,
        destEmail: false,
        destWebhook: false,
        destDashboard: true,
        format: 'json'
      },
      'pinned-input': {
        value: customConfig.value || '',
        timestamp: customConfig.timestamp || Date.now()
      }
    };

    return { ...defaultConfigs[type], ...customConfig };
  }

  getNode(id: string): CybertronNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): CybertronNode[] {
    return Array.from(this.nodes.values());
  }

  updateNode(id: string, updates: Partial<CybertronNode>): CybertronNode | undefined {
    const node = this.nodes.get(id);
    if (!node) return undefined;

    const updatedNode = { ...node, ...updates };
    this.nodes.set(id, updatedNode);
    return updatedNode;
  }

  deleteNode(id: string, user: User): boolean {
    if (!PermissionService.canDeleteWorkflow(user)) {
      console.error('Permission denied: User cannot delete nodes');
      return false;
    }

    // Delete connected edges
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.source === id || edge.target === id) {
        this.edges.delete(edgeId);
      }
    }

    return this.nodes.delete(id);
  }

  moveNode(id: string, deltaX: number, deltaY: number): CybertronNode | undefined {
    const node = this.nodes.get(id);
    if (!node || !node.position) return undefined;
    
    const newPosition = {
      x: node.position.x + deltaX,
      y: node.position.y + deltaY
    };
    
    return this.updateNode(id, { position: newPosition });
  }

  // Edge management methods
  createEdge(source: string, target: string): CybertronEdge {
    const sourceNode = this.nodes.get(source);
    const targetNode = this.nodes.get(target);
    
    if (!sourceNode || !targetNode) {
      throw new Error('Source or target node not found');
    }

    const id = `${source}-${target}`;
    const edge: CybertronEdge = {
      id,
      source,
      target,
      label: '',
      data: {}
    };

    this.edges.set(id, edge);
    return edge;
  }

  getEdge(id: string): CybertronEdge | undefined {
    return this.edges.get(id);
  }

  getAllEdges(): CybertronEdge[] {
    return Array.from(this.edges.values());
  }

  updateEdge(id: string, updates: Partial<CybertronEdge>): CybertronEdge | undefined {
    const edge = this.edges.get(id);
    if (!edge) return undefined;

    const updatedEdge = { ...edge, ...updates };
    this.edges.set(id, updatedEdge);
    return updatedEdge;
  }

  deleteEdge(id: string): boolean {
    return this.edges.delete(id);
  }

  // Workflow execution
  executeWorkflow(user: User): Observable<Record<string, unknown>> {
    if (!PermissionService.canExecuteWorkflow(user)) {
      console.error('Permission denied: User cannot execute workflows');
      return of({ error: 'Permission denied' });
    }

    // Perform DAG sorting of nodes for execution order
    const sortedNodes = this.topologicalSort();
    
    // Execute nodes in order
    const results: Record<string, unknown> = {};
    
    // Simulate async execution
    return new Observable(observer => {
      Promise.all(sortedNodes.map(async node => {
        try {
          const nodeResult = await this.executeNode(node, results);
          results[node.id] = nodeResult;
        } catch (error) {
          results[node.id] = { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })).then(() => {
        observer.next(results);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  private topologicalSort(): CybertronNode[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: CybertronNode[] = [];
    const nodes = Array.from(this.nodes.values());
    const edges = Array.from(this.edges.values());
    
    // Helper function for DFS
    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        throw new Error('Workflow has cycles');
      }
      
      if (!visited.has(nodeId)) {
        temp.add(nodeId);
        
        // Find all nodes that this node points to
        const outgoingEdges = edges.filter(e => e.source === nodeId);
        for (const edge of outgoingEdges) {
          visit(edge.target);
        }
        
        visited.add(nodeId);
        temp.delete(nodeId);
        
        const node = this.nodes.get(nodeId);
        if (node) {
          order.unshift(node);
        }
      }
    };
    
    // Visit each node
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }
    
    return order;
  }

  private async executeNode(node: CybertronNode, contextData: Record<string, unknown>): Promise<Record<string, unknown>> {
    switch (node.type) {
      case 'chat':
        return this.executeChatNode(node, contextData);
      case 'integration':
        return this.executeIntegrationNode(node, contextData);
      case 'scheduler':
        return this.executeSchedulerNode(node, contextData);
      case 'task':
        return this.executeTaskNode(node, contextData);
      case 'report':
        return this.executeReportNode(node, contextData);
      case 'pinned-input':
        return this.executePinnedInputNode(node, contextData);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private async executeChatNode(node: CybertronNode, contextData: Record<string, unknown>): Promise<Record<string, unknown>> {
    // In a real implementation, this would call a language model API
    const config = node.config as Record<string, unknown>;
    const prompt = config.systemPrompt as string;
    const model = config.model as string;
    
    // Mock response
    return {
      model,
      input: prompt,
      output: `This is a simulated response from the ${model} model based on the prompt: "${prompt}"`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeIntegrationNode(node: CybertronNode, contextData: Record<string, unknown>): Promise<Record<string, unknown>> {
    // In a real implementation, this would call external APIs
    const config = node.config as Record<string, unknown>;
    const integrationType = config.integrationType as string;
    
    // Mock response
    return {
      integrationType,
      status: 'success',
      response: `Simulated ${integrationType} API response`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeSchedulerNode(node: CybertronNode, contextData: Record<string, unknown>): Promise<Record<string, unknown>> {
    // In a real implementation, this would set up a scheduler
    const config = node.config as Record<string, unknown>;
    const scheduleType = config.scheduleType as string;
    const expression = config.expression as string;
    
    return {
      scheduleType,
      expression,
      nextRun: new Date(Date.now() + 3600000).toISOString(), // + 1 hour
      status: 'scheduled'
    };
  }

  private async executeTaskNode(node: CybertronNode, contextData: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Execute user-defined script in a secure sandbox
    const config = node.config as Record<string, unknown>;
    const script = config.script as string;
    const sandboxOptions = config.sandboxOptions as Record<string, unknown>;
    
    try {
      // Create a secure VM with VM2
      const vm = new NodeVM({
        console: 'inherit',
        sandbox: {},
        timeout: sandboxOptions.timeout as number || 5000,
        memoryLimit: sandboxOptions.memory as number || 128,
        allowAsync: true,
        require: {
          external: (sandboxOptions.allowImports as string[]) || [],
          root: './'
        }
      });
      
      // Get inputs from connected nodes
      const inputs = this.getNodeInputs(node.id, contextData);
      
      // Execute the script
      const scriptFunction = vm.run(`module.exports = async function(input) { ${script} }`);
      const result = await scriptFunction(inputs);
      
      return {
        executed: true,
        inputs,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Script execution error:', error);
      return {
        executed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async executeReportNode(node: CybertronNode, contextData: Record<string, unknown>): Promise<Record<string, unknown>> {
    // In a real implementation, this would generate and send reports
    const config = node.config as Record<string, unknown>;
    const inputs = this.getNodeInputs(node.id, contextData);
    
    // Generate report output
    const reportData = JSON.stringify(inputs, null, 2);
    
    // Mock outputs to different destinations
    const outputs: Record<string, string> = {};
    
    if (config.destFile) {
      outputs['file'] = `Report saved to ${config.filePath || 'default-path.json'}`;
    }
    
    if (config.destEmail) {
      outputs['email'] = `Report sent to ${config.email || 'user@example.com'}`;
    }
    
    if (config.destWebhook) {
      outputs['webhook'] = `Report sent to ${config.webhookUrl || 'https://example.com/webhook'}`;
    }
    
    if (config.destDashboard) {
      outputs['dashboard'] = `Report displayed in ${config.dashboardSection || 'Main'} dashboard`;
    }
    
    return {
      format: config.format,
      data: reportData,
      outputs,
      timestamp: new Date().toISOString()
    };
  }

  private async executePinnedInputNode(node: CybertronNode, contextData: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Simply return the pinned input value
    const config = node.config as Record<string, unknown>;
    
    return {
      value: config.value,
      timestamp: new Date(config.timestamp as number).toISOString()
    };
  }

  private getNodeInputs(nodeId: string, contextData: Record<string, unknown>): Record<string, unknown> {
    // Find all edges that point to this node
    const incomingEdges = Array.from(this.edges.values()).filter(edge => edge.target === nodeId);
    
    // Collect results from source nodes
    const inputs: Record<string, unknown> = {};
    for (const edge of incomingEdges) {
      const sourceId = edge.source;
      if (contextData[sourceId]) {
        inputs[sourceId] = contextData[sourceId];
      }
    }
    
    return inputs;
  }
} 