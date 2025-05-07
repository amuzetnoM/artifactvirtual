import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrchestratorService, FlowNode, FlowEdge, GraphData, WorkflowResult } from '../../services/orchestrator.service';
import { LangchainService } from '../../services/langchain.service';
import { SchedulerService } from '../../services/scheduler.service';

@Component({
  selector: 'app-cybertron-flow',
  templateUrl: './cybertron-flow.component.html',
  styleUrls: ['./cybertron-flow.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CybertronFlowComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Flow graph data
  flowData: GraphData = {
    nodes: [],
    edges: [],
    zoom: 1,
    offset: { x: 0, y: 0 }
  };
  
  // Editor state
  selectedNode: FlowNode | null = null;
  selectedNodeType: string = 'chat';
  isPanning: boolean = false;
  isConnecting: boolean = false;
  connectingSource: { node: FlowNode, port: string } | null = null;
  lastMousePos = { x: 0, y: 0 };
  
  // Result of last workflow execution
  lastResult: WorkflowResult | null = null;
  isExecuting: boolean = false;
  
  // Available node types
  nodeTypes = [
    { id: 'chat', name: 'AI Chat' },
    { id: 'integration', name: 'Integration' },
    { id: 'scheduler', name: 'Scheduler' },
    { id: 'task', name: 'Task' },
    { id: 'report', name: 'Report' }
  ];
  
  // List of available AI models
  availableModels: string[] = [];
  
  // Sidebar visibility
  isSidebarOpen: boolean = true;

  constructor(
    private orchestratorService: OrchestratorService,
    private langchainService: LangchainService,
    private schedulerService: SchedulerService
  ) {}

  ngOnInit(): void {
    // Load available models
    this.langchainService.listAvailableModels().subscribe(
      models => {
        this.availableModels = models;
      },
      error => {
        console.error('Failed to load models:', error);
        this.availableModels = ['gpt-3.5-turbo', 'mistral-7b']; // Fallback
      }
    );
  }

  ngAfterViewInit(): void {
    // Render initial empty canvas
    this.renderCanvas();
    
    // Apply initial zoom level
    this.setZoom(1);
  }

  /**
   * Add a new node to the flow
   */
  addNode(type: string): void {
    const newNode = this.orchestratorService.createNode(type);
    this.flowData.nodes.push(newNode);
    this.selectNode(newNode);
    this.renderCanvas();
  }

  /**
   * Select a node
   */
  selectNode(node: FlowNode | null): void {
    this.selectedNode = node;
    this.isConnecting = false;
    this.connectingSource = null;
    this.renderCanvas();
  }

  /**
   * Delete the currently selected node
   */
  deleteSelectedNode(): void {
    if (!this.selectedNode) return;
    
    // Remove connected edges
    this.flowData.edges = this.flowData.edges.filter(
      edge => edge.source !== this.selectedNode!.id && edge.target !== this.selectedNode!.id
    );
    
    // Remove node
    this.flowData.nodes = this.flowData.nodes.filter(
      node => node.id !== this.selectedNode!.id
    );
    
    this.selectedNode = null;
    this.renderCanvas();
  }

  /**
   * Start a connection from a node output port
   */
  startConnection(node: FlowNode, portId: string): void {
    this.isConnecting = true;
    this.connectingSource = { node, port: portId };
  }

  /**
   * Complete a connection to a node input port
   */
  completeConnection(targetNode: FlowNode, targetPortId: string): void {
    if (!this.isConnecting || !this.connectingSource) return;
    
    // Prevent connecting to self
    if (targetNode.id === this.connectingSource.node.id) {
      this.isConnecting = false;
      this.connectingSource = null;
      return;
    }
    
    // Create edge
    const newEdge: FlowEdge = {
      id: Date.now().toString(),
      source: this.connectingSource.node.id,
      sourcePortId: this.connectingSource.port,
      target: targetNode.id,
      targetPortId: targetPortId,
      points: []
    };
    
    this.flowData.edges.push(newEdge);
    this.isConnecting = false;
    this.connectingSource = null;
    this.renderCanvas();
  }

  /**
   * Handle mouse down event on canvas
   */
  onCanvasMouseDown(event: MouseEvent): void {
    const { x, y } = this.getCanvasCoordinates(event);
    this.lastMousePos = { x, y };
    
    // Check if clicked on a node
    const clickedNode = this.orchestratorService.getNodeAtPosition(
      (x - (this.flowData.offset?.x || 0)) / (this.flowData.zoom || 1),
      (y - (this.flowData.offset?.y || 0)) / (this.flowData.zoom || 1),
      this.flowData.nodes
    );
    
    if (clickedNode) {
      this.selectNode(clickedNode);
    } else {
      // Start panning if not clicked on a node
      this.isPanning = true;
      this.selectNode(null);
    }
  }

  /**
   * Handle mouse move event on canvas
   */
  onCanvasMouseMove(event: MouseEvent): void {
    const { x, y } = this.getCanvasCoordinates(event);
    const deltaX = x - this.lastMousePos.x;
    const deltaY = y - this.lastMousePos.y;
    
    if (this.isPanning) {
      // Pan the canvas
      this.flowData.offset = {
        x: (this.flowData.offset?.x || 0) + deltaX,
        y: (this.flowData.offset?.y || 0) + deltaY
      };
      this.renderCanvas();
    } else if (this.selectedNode) {
      // Move the selected node
      this.orchestratorService.moveNode(
        this.selectedNode,
        deltaX / (this.flowData.zoom || 1),
        deltaY / (this.flowData.zoom || 1)
      );
      this.renderCanvas();
    }
    
    this.lastMousePos = { x, y };
  }

  /**
   * Handle mouse up event on canvas
   */
  onCanvasMouseUp(): void {
    this.isPanning = false;
  }

  /**
   * Get coordinates relative to canvas
   */
  private getCanvasCoordinates(event: MouseEvent): { x: number, y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number): void {
    this.flowData.zoom = zoom;
    this.renderCanvas();
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    this.setZoom(Math.min((this.flowData.zoom || 1) * 1.2, 3));
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    this.setZoom(Math.max((this.flowData.zoom || 1) / 1.2, 0.3));
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom(): void {
    this.setZoom(1);
    this.flowData.offset = { x: 0, y: 0 };
    this.renderCanvas();
  }

  /**
   * Render the flow graph on canvas
   */
  renderCanvas(): void {
    if (!this.canvasRef) return;
    this.orchestratorService.renderGraph(this.canvasRef.nativeElement, this.flowData);
  }

  /**
   * Execute the current workflow
   */
  executeWorkflow(): void {
    if (this.flowData.nodes.length === 0) {
      this.lastResult = {
        success: false,
        message: 'Cannot execute empty workflow',
        nodeResults: {}
      };
      return;
    }
    
    this.isExecuting = true;
    this.orchestratorService.executeWorkflow(this.flowData.nodes, this.flowData.edges)
      .subscribe(
        result => {
          this.lastResult = result;
          this.isExecuting = false;
          this.renderCanvas();
        },
        error => {
          this.lastResult = {
            success: false,
            message: `Execution failed: ${error.message}`,
            nodeResults: {}
          };
          this.isExecuting = false;
          this.renderCanvas();
        }
      );
  }

  /**
   * Save the current workflow
   */
  saveWorkflow(): void {
    const workflow = {
      nodes: this.flowData.nodes,
      edges: this.flowData.edges
    };
    
    // Create a JSON blob and trigger download
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cybertron-workflow.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Load a workflow from file
   */
  loadWorkflow(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      try {
        const workflow = JSON.parse(content);
        this.flowData.nodes = workflow.nodes || [];
        this.flowData.edges = workflow.edges || [];
        this.selectNode(null);
        this.renderCanvas();
      } catch (error) {
        console.error('Failed to parse workflow file:', error);
      }
    };
    
    reader.readAsText(file);
  }

  /**
   * Toggle sidebar visibility
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Create a new workflow
   */
  newWorkflow(): void {
    if (confirm('Create a new workflow? This will clear the current workflow.')) {
      this.flowData.nodes = [];
      this.flowData.edges = [];
      this.selectedNode = null;
      this.lastResult = null;
      this.renderCanvas();
    }
  }

  /**
   * Handle window resize to adjust canvas size
   */
  @HostListener('window:resize')
  onResize(): void {
    this.renderCanvas();
  }

  /**
   * Update selected node properties
   */
  updateSelectedNodeConfig(key: string, value: any): void {
    if (!this.selectedNode) return;
    
    this.selectedNode.config[key] = value;
    this.renderCanvas();
  }

  /**
   * Update selected node name
   */
  updateSelectedNodeName(name: string): void {
    if (!this.selectedNode) return;
    
    this.selectedNode.name = name;
    this.renderCanvas();
  }
}