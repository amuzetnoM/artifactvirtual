import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { OrchestratorService } from './services/orchestrator.service';
import { LangchainService } from './services/langchain.service';
import { SchedulerService } from './services/scheduler.service';

@Component({
  selector: 'app-cybertron-flow',
  templateUrl: './cybertron-flow.component.html',
  styleUrls: ['./cybertron-flow.component.scss']
})
export class CybertronFlowComponent implements OnInit, AfterViewInit {
  @ViewChild('flowCanvas', { static: false }) flowCanvas: ElementRef;
  
  nodes: any[] = [];
  edges: any[] = [];
  selectedNode: any = null;
  zoomLevel: number = 1;
  panOffset = { x: 0, y: 0 };
  isDragging = false;
  dragStart = { x: 0, y: 0 };
  pinnedInputValue: string = '';

  constructor(
    private orchestratorService: OrchestratorService,
    private langchainService: LangchainService,
    private schedulerService: SchedulerService
  ) {}

  ngOnInit(): void {
    // Initialize with any saved workflow state
    this.loadSavedWorkflow();
  }

  ngAfterViewInit(): void {
    // Initialize canvas and event listeners
    this.initCanvas();
  }

  private initCanvas(): void {
    const canvas = this.flowCanvas.nativeElement;
    
    // Add event listeners for drag, zoom, and pan
    canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    canvas.addEventListener('wheel', this.handleWheel.bind(this));
    
    // Initial render
    this.renderGraph();
  }

  private renderGraph(): void {
    // This will be implemented with ngx-graph or rete.js
    this.orchestratorService.renderGraph(this.flowCanvas.nativeElement, {
      nodes: this.nodes,
      edges: this.edges,
      zoom: this.zoomLevel,
      offset: this.panOffset
    });
  }

  // UI Event Handlers
  handleMouseDown(event: MouseEvent): void {
    // Handle node selection or canvas dragging
    this.isDragging = true;
    this.dragStart = { x: event.clientX, y: event.clientY };
    
    // Check if a node was clicked
    this.selectedNode = this.orchestratorService.getNodeAtPosition(
      event.clientX - this.flowCanvas.nativeElement.getBoundingClientRect().left,
      event.clientY - this.flowCanvas.nativeElement.getBoundingClientRect().top
    );
  }

  handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    if (this.selectedNode) {
      // Move the selected node
      this.orchestratorService.moveNode(this.selectedNode, 
        event.clientX - this.dragStart.x,
        event.clientY - this.dragStart.y
      );
    } else {
      // Pan the canvas
      this.panOffset.x += (event.clientX - this.dragStart.x) / this.zoomLevel;
      this.panOffset.y += (event.clientY - this.dragStart.y) / this.zoomLevel;
    }
    
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.renderGraph();
  }

  handleMouseUp(): void {
    this.isDragging = false;
    if (this.selectedNode) {
      // Save node position
      this.saveWorkflow();
    }
  }

  handleWheel(event: WheelEvent): void {
    event.preventDefault();
    // Zoom in/out based on wheel direction
    const zoomIntensity = 0.1;
    const delta = event.deltaY < 0 ? zoomIntensity : -zoomIntensity;
    
    this.zoomLevel = Math.max(0.1, Math.min(2, this.zoomLevel + delta));
    this.renderGraph();
  }

  // Node Management
  addNode(type: string): void {
    const newNode = this.orchestratorService.createNode(type);
    this.nodes.push(newNode);
    this.renderGraph();
    this.saveWorkflow();
  }

  connectNodes(sourceId: string, targetId: string): void {
    const edge = this.orchestratorService.createEdge(sourceId, targetId);
    this.edges.push(edge);
    this.renderGraph();
    this.saveWorkflow();
  }

  deleteNode(nodeId: string): void {
    // Remove node and related edges
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.edges = this.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    this.renderGraph();
    this.saveWorkflow();
  }

  // Workflow Management
  runWorkflow(): void {
    this.orchestratorService.executeWorkflow(this.nodes, this.edges)
      .subscribe(
        results => console.log('Workflow execution results:', results),
        error => console.error('Workflow execution error:', error)
      );
  }

  saveWorkflow(): void {
    const workflowData = {
      nodes: this.nodes,
      edges: this.edges
    };
    localStorage.setItem('cybertron-workflow', JSON.stringify(workflowData));
  }

  loadSavedWorkflow(): void {
    const savedWorkflow = localStorage.getItem('cybertron-workflow');
    if (savedWorkflow) {
      const workflowData = JSON.parse(savedWorkflow);
      this.nodes = workflowData.nodes;
      this.edges = workflowData.edges;
    }
  }
  
  exportWorkflow(): string {
    return JSON.stringify({
      nodes: this.nodes,
      edges: this.edges
    }, null, 2);
  }
  
  importWorkflow(workflowJson: string): void {
    try {
      const workflow = JSON.parse(workflowJson);
      this.nodes = workflow.nodes;
      this.edges = workflow.edges;
      this.renderGraph();
    } catch (error) {
      console.error('Failed to import workflow:', error);
    }
  }

  // Pin user input as a node on the board
  displayPinnedInput(input: string): void {
    const newNode = this.orchestratorService.createNode('pinned-input', {
      value: input,
      timestamp: Date.now(),
    });
    newNode.name = 'Pinned Input';
    newNode.type = 'pinned-input';
    newNode.config = { value: input };
    newNode.style = { border: '2px dashed #ff9800', background: '#fffbe6' };
    this.nodes.push(newNode);
    this.renderGraph();
    this.saveWorkflow();
  }

  pinInput(): void {
    if (this.pinnedInputValue && this.pinnedInputValue.trim().length > 0) {
      this.displayPinnedInput(this.pinnedInputValue.trim());
      this.pinnedInputValue = '';
    }
  }
}