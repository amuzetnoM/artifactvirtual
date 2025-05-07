import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CybertronNode, SchedulerNodeConfig } from '../../node-types/node.model';

@Component({
  selector: 'app-scheduler-node-settings',
  template: `
    <div class="node-settings">
      <div class="form-group">
        <label for="scheduler-name">Name</label>
        <input type="text" id="scheduler-name" [ngModel]="node.label" (ngModelChange)="onNameChange($event)" aria-label="Scheduler name">
      </div>
      
      <div class="form-group">
        <label for="schedule-type">Schedule Type</label>
        <select 
          id="schedule-type"
          [ngModel]="config.scheduleType" 
          (ngModelChange)="onScheduleTypeChange($event)"
          aria-label="Schedule type">
          <option value="cron">CRON</option>
          <option value="interval">Interval</option>
          <option value="onetime">One Time</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="expression">
          {{ config.scheduleType === 'cron' ? 'CRON Expression' : 
             config.scheduleType === 'interval' ? 'Interval' : 'Date/Time' }}
        </label>
        <input 
          type="text" 
          id="expression"
          [ngModel]="config.expression" 
          (ngModelChange)="onExpressionChange($event)"
          [placeholder]="getExpressionPlaceholder()"
          aria-label="Schedule expression">
        <div class="hint">
          {{ getExpressionHint() }}
        </div>
      </div>
      
      <div class="form-group" *ngIf="config.nextRun">
        <label>Next Run</label>
        <div class="next-run">{{ config.nextRun | date:'medium' }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./chat-node-settings.component.scss']
})
export class SchedulerNodeSettingsComponent {
  @Input() node: CybertronNode;
  @Output() nodeChange = new EventEmitter<CybertronNode>();

  get config(): SchedulerNodeConfig {
    return this.node.config as SchedulerNodeConfig;
  }

  onNameChange(name: string): void {
    this.node = { ...this.node, label: name };
    this.nodeChange.emit(this.node);
  }

  onScheduleTypeChange(scheduleType: 'cron' | 'interval' | 'onetime'): void {
    const config = { ...this.config, scheduleType };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  onExpressionChange(expression: string): void {
    const config = { ...this.config, expression };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  getExpressionPlaceholder(): string {
    switch (this.config.scheduleType) {
      case 'cron':
        return '* * * * *';
      case 'interval':
        return '1h, 30m, 15s';
      case 'onetime':
        return 'YYYY-MM-DD HH:MM';
      default:
        return '';
    }
  }
  
  getExpressionHint(): string {
    switch (this.config.scheduleType) {
      case 'cron':
        return 'Format: minute hour day-of-month month day-of-week';
      case 'interval':
        return 'Examples: 1h (hourly), 30m (every 30 minutes), 1d (daily)';
      case 'onetime':
        return 'Date and time for a one-time execution';
      default:
        return '';
    }
  }
} 