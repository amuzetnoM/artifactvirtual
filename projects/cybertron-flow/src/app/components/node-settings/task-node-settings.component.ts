import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CybertronNode, TaskNodeConfig } from '../../node-types/node.model';

@Component({
  selector: 'app-task-node-settings',
  templateUrl: './task-node-settings.component.html',
  styleUrls: ['./task-node-settings.component.scss']
})
export class TaskNodeSettingsComponent {
  @Input() node: CybertronNode;
  @Output() nodeChange = new EventEmitter<CybertronNode>();
  
  // Allowed imports for the sandbox
  allowedImports = [
    'lodash',
    'moment',
    'axios',
    'uuid',
    'crypto-js',
    'validator'
  ];
  
  // Security options
  securityLevels = [
    { name: 'Low (Permissive)', value: 'low', timeout: 10000, memory: 256 },
    { name: 'Medium (Standard)', value: 'medium', timeout: 5000, memory: 128 },
    { name: 'High (Restrictive)', value: 'high', timeout: 2000, memory: 64 }
  ];
  
  selectedSecurityLevel = 'medium';

  get config(): TaskNodeConfig {
    return this.node.config as TaskNodeConfig;
  }

  onNameChange(name: string): void {
    this.node = { ...this.node, label: name };
    this.nodeChange.emit(this.node);
  }

  onScriptChange(script: string): void {
    const config = { ...this.config, script };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  onSecurityLevelChange(level: string): void {
    this.selectedSecurityLevel = level;
    const securityLevel = this.securityLevels.find(l => l.value === level);
    
    if (securityLevel) {
      const sandboxOptions = {
        ...this.config.sandboxOptions,
        timeout: securityLevel.timeout,
        memory: securityLevel.memory
      };
      
      const config = { ...this.config, sandboxOptions };
      this.node = { ...this.node, config };
      this.nodeChange.emit(this.node);
    }
  }
  
  toggleImport(importName: string): void {
    const currentImports = [...(this.config.sandboxOptions.allowImports || [])];
    const index = currentImports.indexOf(importName);
    
    if (index === -1) {
      // Add the import
      currentImports.push(importName);
    } else {
      // Remove the import
      currentImports.splice(index, 1);
    }
    
    const sandboxOptions = {
      ...this.config.sandboxOptions,
      allowImports: currentImports
    };
    
    const config = { ...this.config, sandboxOptions };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
  
  isImportAllowed(importName: string): boolean {
    return (this.config.sandboxOptions.allowImports || []).includes(importName);
  }
} 