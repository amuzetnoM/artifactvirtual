import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CybertronNode, IntegrationNodeConfig } from '../../node-types/node.model';

@Component({
  selector: 'app-integration-node-settings',
  template: `
    <div class="node-settings">
      <div class="form-group">
        <label for="integration-name">Name</label>
        <input type="text" id="integration-name" [ngModel]="node.label" (ngModelChange)="onNameChange($event)" aria-label="Integration name">
      </div>
      
      <div class="form-group">
        <label for="integration-type">Integration Type</label>
        <select 
          id="integration-type"
          [ngModel]="config.integrationType" 
          (ngModelChange)="onIntegrationTypeChange($event)"
          aria-label="Integration type">
          <option value="google-calendar">Google Calendar</option>
          <option value="notion">Notion</option>
          <option value="slack">Slack</option>
          <option value="discord">Discord</option>
          <option value="twitter">Twitter</option>
          <option value="webhook">Webhook</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="api-key">API Key</label>
        <input 
          type="password" 
          id="api-key"
          [ngModel]="config.apiKey" 
          (ngModelChange)="onApiKeyChange($event)"
          aria-label="API key">
        <div class="hint">
          Stored securely using environment-specific encryption
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./chat-node-settings.component.scss']
})
export class IntegrationNodeSettingsComponent {
  @Input() node: CybertronNode;
  @Output() nodeChange = new EventEmitter<CybertronNode>();

  get config(): IntegrationNodeConfig {
    return this.node.config as IntegrationNodeConfig;
  }

  onNameChange(name: string): void {
    this.node = { ...this.node, label: name };
    this.nodeChange.emit(this.node);
  }

  onIntegrationTypeChange(integrationType: string): void {
    const config = { ...this.config, integrationType };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  onApiKeyChange(apiKey: string): void {
    const config = { ...this.config, apiKey };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
} 