import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CybertronNode, ChatNodeConfig } from '../../node-types/node.model';

@Component({
  selector: 'app-chat-node-settings',
  templateUrl: './chat-node-settings.component.html',
  styleUrls: ['./chat-node-settings.component.scss']
})
export class ChatNodeSettingsComponent {
  @Input() node: CybertronNode;
  @Output() nodeChange = new EventEmitter<CybertronNode>();

  get config(): ChatNodeConfig {
    return this.node.config as ChatNodeConfig;
  }

  onNameChange(name: string): void {
    this.node = { ...this.node, name };
    this.nodeChange.emit(this.node);
  }

  onModelChange(model: string): void {
    const config = { ...this.config, model };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }

  onSystemPromptChange(systemPrompt: string): void {
    const config = { ...this.config, systemPrompt };
    this.node = { ...this.node, config };
    this.nodeChange.emit(this.node);
  }
} 