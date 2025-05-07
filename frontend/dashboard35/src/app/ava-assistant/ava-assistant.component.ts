import { Component } from '@angular/core';

@Component({
  selector: 'app-ava-assistant',
  template: `
    <div class="ava-assistant" role="complementary" aria-label="AVA Assistant">
      <button class="ava-toggle" (click)="toggleOpen()" *ngIf="!isOpen" aria-label="Open AVA Assistant">
        🤖
      </button>
      <div *ngIf="isOpen" class="ava-chat" [class.expanded]="isExpanded">
        <div class="ava-header">
          <span class="ava-title">AVA</span>
          <button class="ava-expand" (click)="toggleExpand()" aria-label="Expand/Minimize">
            {{ isExpanded ? '🗕' : '🗖' }}
          </button>
          <button class="ava-close" (click)="toggleOpen()" aria-label="Close AVA Assistant">✖️</button>
        </div>
        <div class="ava-messages">
          <div *ngFor="let msg of messages" [ngClass]="{'ava-user': msg.sender==='user', 'ava-assistant-msg': msg.sender==='assistant'}" class="ava-message">
            {{ msg.content }}
          </div>
        </div>
        <form class="ava-form" (ngSubmit)="sendMessage()">
          <input [(ngModel)]="input" name="avaInput" class="ava-input" placeholder="Ask AVA anything..." autocomplete="off" required />
          <button type="submit" class="ava-send" [disabled]="!input.trim()">➤</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .ava-assistant {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: var(--ava-z);
      background: var(--color-card);
      color: var(--color-card-foreground);
      border-radius: 1rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      min-width: 300px;
      transition: background var(--transition), color var(--transition);
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .ava-toggle {
      font-size: 2rem;
      background: var(--color-primary);
      color: var(--color-primary-foreground);
      border: none;
      border-radius: 50%;
      width: 3.5rem;
      height: 3.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      cursor: pointer;
      margin-bottom: 0.5rem;
      transition: background var(--transition), color var(--transition);
    }
    .ava-chat {
      width: 350px;
      height: 500px;
      background: var(--color-card);
      color: var(--color-card-foreground);
      border-radius: 1rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.2s, height 0.2s;
    }
    .ava-chat.expanded {
      width: 600px;
      height: 90vh;
      right: 2rem;
      left: 2rem;
      top: 2rem;
      bottom: 2rem;
      position: fixed;
    }
    .ava-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: var(--color-primary);
      color: var(--color-primary-foreground);
      border-bottom: 1px solid var(--color-border);
    }
    .ava-title {
      font-weight: 700;
      font-size: 1.1rem;
    }
    .ava-expand, .ava-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      margin-left: 0.5rem;
      cursor: pointer;
      color: inherit;
    }
    .ava-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      background: var(--color-card);
      color: var(--color-card-foreground);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .ava-message {
      padding: 0.5rem 1rem;
      border-radius: var(--radius);
      max-width: 80%;
      word-break: break-word;
      font-size: 0.98rem;
    }
    .ava-user {
      align-self: flex-end;
      background: var(--color-primary);
      color: var(--color-primary-foreground);
    }
    .ava-assistant-msg {
      align-self: flex-start;
      background: var(--color-muted);
      color: var(--color-muted-foreground);
    }
    .ava-form {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      border-top: 1px solid var(--color-border);
      background: var(--color-card);
    }
    .ava-input {
      flex: 1;
      padding: 0.5rem 1rem;
      border-radius: var(--radius);
      border: 1px solid var(--color-border);
      font-size: 1rem;
      background: var(--color-muted);
      color: var(--color-foreground);
      transition: border var(--transition), background var(--transition);
    }
    .ava-send {
      background: var(--color-primary);
      color: var(--color-primary-foreground);
      border: none;
      border-radius: var(--radius);
      padding: 0 1rem;
      font-size: 1.2rem;
      cursor: pointer;
      transition: background var(--transition), color var(--transition);
    }
  `]
})
export class AvaAssistantComponent {
  isOpen = false;
  isExpanded = false;
  input = '';
  messages = [
    { sender: 'assistant', content: "Hello! I'm AVA, Artifact Virtual's Assistant. How can I help you?" }
  ];
  toggleOpen() { this.isOpen = !this.isOpen; }
  toggleExpand() { this.isExpanded = !this.isExpanded; }
  sendMessage() {
    if (this.input.trim()) {
      this.messages.push({ sender: 'user', content: this.input });
      setTimeout(() => {
        this.messages.push({ sender: 'assistant', content: "I'm AVA, your virtual assistant. I can help you navigate the Artifact Virtual platform, manage your projects, and answer questions about AI, blockchain, and quantum computing." });
      }, 800);
      this.input = '';
    }
  }
}
