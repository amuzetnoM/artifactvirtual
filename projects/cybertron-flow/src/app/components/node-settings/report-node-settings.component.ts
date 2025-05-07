import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CybertronNode, ReportNodeConfig } from '../../node-types/node.model';

@Component({
  selector: 'app-report-node-settings',
  template: `
    <div class="node-settings">
      <div class="form-group">
        <label for="report-name">Name</label>
        <input type="text" id="report-name" [ngModel]="node.label" (ngModelChange)="onNameChange($event)" aria-label="Report name">
      </div>
      
      <div class="form-group">
        <label>Output Destinations</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" [ngModel]="config.destFile" (ngModelChange)="onDestinationChange('destFile', $event)"> File
          </label>
          <label class="checkbox-label">
            <input type="checkbox" [ngModel]="config.destEmail" (ngModelChange)="onDestinationChange('destEmail', $event)"> Email
          </label>
          <label class="checkbox-label">
            <input type="checkbox" [ngModel]="config.destWebhook" (ngModelChange)="onDestinationChange('destWebhook', $event)"> Webhook
          </label>
          <label class="checkbox-label">
            <input type="checkbox" [ngModel]="config.destDashboard" (ngModelChange)="onDestinationChange('destDashboard', $event)"> Dashboard
          </label>
        </div>
      </div>
      
      <div class="form-group" *ngIf="config.destFile">
        <label for="file-path">File Path</label>
        <input 
          type="text" 
          id="file-path"
          [ngModel]="config.filePath" 
          (ngModelChange)="onFilePathChange($event)"
          placeholder="e.g. /reports/output.csv"
          aria-label="File path">
      </div>
      
      <div class="form-group" *ngIf="config.destEmail">
        <label for="email">Email Address</label>
        <input 
          type="email" 
          id="email"
          [ngModel]="config.email" 
          (ngModelChange)="onEmailChange($event)"
          placeholder="e.g. user@example.com"
          aria-label="Email address">
      </div>
      
      <div class="form-group" *ngIf="config.destWebhook">
        <label for="webhook-url">Webhook URL</label>
        <input 
          type="url" 
          id="webhook-url"
          [ngModel]="config.webhookUrl" 
          (ngModelChange)="onWebhookUrlChange($event)"
          placeholder="e.g. https://example.com/webhook"
          aria-label="Webhook URL">
      </div>
      
      <div class="form-group" *ngIf="config.destDashboard">
        <label for="dashboard-section">Dashboard Section</label>
        <input 
          type="text" 
          id="dashboard-section"
          [ngModel]="config.dashboardSection" 
          (ngModelChange)="onDashboardSectionChange($event)"
          placeholder="e.g. Analytics"
          aria-label="Dashboard section">
      </div>
      
      <div class="form-group">
        <label for="format">Format</label>
        <select 
          id="format"
          [ngModel]="config.format" 
          (ngModelChange)="onFormatChange($event)"
          aria-label="Output format">
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
          <option value="txt">Text</option>
        </select>
      </div>
    </div>
  `,
  styleUrls: ['./chat-node-settings.component.scss']
})
export class ReportNodeSettingsComponent {
  @Input() node: CybertronNode;
  @Output() nodeChange = new EventEmitter<CybertronNode>();

  get config(): ReportNodeConfig {
    return this.node.config as ReportNodeConfig;
  }

  onNameChange(name: string): void {
    this.node = { ...this.node, label: name };
    this.nodeChange.emit(this.node);
  }

  onDestinationChange(destField: string, value: boolean): void {
    const config = { ...this.config, [destField]: value };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  onFilePathChange(filePath: string): void {
    const config = { ...this.config, filePath };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  onEmailChange(email: string): void {
    const config = { ...this.config, email };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  onWebhookUrlChange(webhookUrl: string): void {
    const config = { ...this.config, webhookUrl };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  onDashboardSectionChange(dashboardSection: string): void {
    const config = { ...this.config, dashboardSection };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  onFormatChange(format: 'json' | 'csv' | 'txt'): void {
    const config = { ...this.config, format };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
} 