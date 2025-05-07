import { Component, OnInit } from '@angular/core';
import { NewOrchestratorService } from './services/new-orchestrator.service';
import { LangchainService } from './services/langchain.service';
import { SchedulerService } from './services/scheduler.service';
import { CybertronNode, CybertronEdge, NodeType } from './node-types/node.model';
import { 
  faPlus, faPlay, faSave, faFileExport, faFileImport, 
  faZoomIn, faZoomOut, faRedo
} from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cybertron-flow',
  templateUrl: './cybertron-flow.component.html',
  styleUrls: ['./cybertron-flow.component.scss']
})
export class CybertronFlowComponent implements OnInit {
  // Graph data
  nodes: CybertronNode[] = [];
  edges: CybertronEdge[] = [];
  
  // Graph update subjects
  update$ = new Subject<boolean>();
  center$ = new Subject<boolean>();
  zoomToFit$ = new Subject<boolean>();
  
  // UI state
  selectedNode: CybertronNode | null = null;
  zoomLevel = 1;
  layoutSettings = {
    orientation: 'TB'
  };
  pinnedInputValue = '';
  
  // Icons
  faPlus = faPlus;
  faPlay = faPlay;
  faSave = faSave;
  faFileExport = faFileExport;
  faFileImport = faFileImport;
  faZoomIn = faZoomIn;
  faZoomOut = faZoomOut;
  faRedo = faRedo;
  
  // Mock user for demo - in production, this would come from auth service
  currentUser = { id: '1', username: 'admin', role: 'admin' as const };

  constructor(
    private orchestratorService: NewOrchestratorService,
    private langchainService: LangchainService,
    private schedulerService: SchedulerService
  ) {}

  ngOnInit(): void {
    // Initialize with any saved workflow state
    this.loadSavedWorkflow();
  }

  // Node management
  addNode(type: NodeType): void {
    const node = this.orchestratorService.createNode(type);
    this.refreshGraphData();
    this.saveWorkflow();
  }

  onNodeSelect(node: CybertronNode): void {
    this.selectedNode = node;
  }

  onEdgeSelect(edge: CybertronEdge): void {
    // Handle edge selection if needed
    console.log('Edge selected:', edge);
  }

  onNodeDeselect(): void {
    this.selectedNode = null;
  }

  onNodeUpdate(updatedNode: CybertronNode): void {
    this.orchestratorService.updateNode(updatedNode.id, updatedNode);
    this.refreshGraphData();
    this.saveWorkflow();
  }

  deleteNode(nodeId: string): void {
    this.orchestratorService.deleteNode(nodeId, this.currentUser);
    this.selectedNode = null;
    this.refreshGraphData();
    this.saveWorkflow();
  }

  // Edge management
  onEdgeCreate(event: { source: string; target: string }): void {
    try {
      this.orchestratorService.createEdge(event.source, event.target);
      this.refreshGraphData();
      this.saveWorkflow();
    } catch (error) {
      console.error('Failed to create edge:', error);
    }
  }

  // Workflow execution
  runWorkflow(): void {
    this.orchestratorService.executeWorkflow(this.currentUser)
      .subscribe({
        next: results => console.log('Workflow execution results:', results),
        error: error => console.error('Workflow execution error:', error)
      });
  }

  // State management
  private refreshGraphData(): void {
    this.nodes = this.orchestratorService.getAllNodes();
    this.edges = this.orchestratorService.getAllEdges();
    this.update$.next(true);
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
      try {
        const workflowData = JSON.parse(savedWorkflow);
        // Load nodes and edges into the orchestrator service
        for (const node of workflowData.nodes) {
          this.orchestratorService.createNode(node.type, node.config);
        }
        
        // Add edges after all nodes are created
        for (const edge of workflowData.edges) {
          this.orchestratorService.createEdge(edge.source, edge.target);
        }
        
        this.refreshGraphData();
      } catch (error) {
        console.error('Failed to load workflow:', error);
      }
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
      
      // Clear existing nodes and edges
      for (const node of this.nodes) {
        this.orchestratorService.deleteNode(node.id, this.currentUser);
      }
      
      // Import new workflow
      for (const node of workflow.nodes) {
        this.orchestratorService.createNode(node.type, node.config);
      }
      
      for (const edge of workflow.edges) {
        this.orchestratorService.createEdge(edge.source, edge.target);
      }
      
      this.refreshGraphData();
      this.saveWorkflow();
    } catch (error) {
      console.error('Failed to import workflow:', error);
    }
  }

  // Pin user input as a node on the board
  pinInput(): void {
    if (this.pinnedInputValue && this.pinnedInputValue.trim().length > 0) {
      this.orchestratorService.createNode('pinned-input', {
        value: this.pinnedInputValue.trim(),
        timestamp: Date.now()
      });
      this.pinnedInputValue = '';
      this.refreshGraphData();
      this.saveWorkflow();
    }
  }

  // Dialog methods
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text)
      .then(() => console.log('Copied to clipboard'))
      .catch(err => console.error('Failed to copy to clipboard:', err));
  }
  
  // Graph view controls
  fitGraph(): void {
    this.zoomToFit$.next(true);
  }
  
  centerGraph(): void {
    this.center$.next(true);
  }
}