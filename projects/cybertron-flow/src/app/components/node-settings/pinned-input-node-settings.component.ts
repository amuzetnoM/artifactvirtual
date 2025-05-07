import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CybertronNode, PinnedInputNodeConfig } from '../../node-types/node.model';

@Component({
  selector: 'app-pinned-input-node-settings',
  template: `
    <div class="node-settings">
      <div class="form-group">
        <label for="pinned-name">Name</label>
        <input type="text" id="pinned-name" [ngModel]="node.label" (ngModelChange)="onNameChange($event)" aria-label="Pinned input name">
      </div>
      <div class="form-group">
        <label for="pinned-value">Value</label>
        <textarea 
          id="pinned-value"
          [ngModel]="config.value" 
          (ngModelChange)="onValueChange($event)" 
          rows="4"
          aria-label="Pinned input value"></textarea>
      </div>
      <div class="form-group info">
        <p>Created: {{ formattedTimestamp }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./chat-node-settings.component.scss']
})
export class PinnedInputNodeSettingsComponent {
  @Input() node: CybertronNode;
  @Output() nodeChange = new EventEmitter<CybertronNode>();

  get config(): PinnedInputNodeConfig {
    return this.node.config as PinnedInputNodeConfig;
  }
  
  get formattedTimestamp(): string {
    return new Date(this.config.timestamp).toLocaleString();
  }

  onNameChange(name: string): void {
    this.node = { ...this.node, label: name };
    this.nodeChange.emit(this.node);
  }

  onValueChange(value: string): void {
    const config = { ...this.config, value };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
} 