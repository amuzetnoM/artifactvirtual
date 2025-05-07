import { Component } from '@angular/core';

@Component({
  selector: 'app-ava-assistant',
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <button
        class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-lime-400 text-primary-foreground shadow-lg hover:scale-105 transition-transform animate-pulse-glow"
        (click)="toggleOpen()"
        aria-label="Open AVA Assistant"
        *ngIf="!isOpen"
      >
        <mat-icon class="text-2xl">smart_toy</mat-icon>
      </button>
      <div *ngIf="isOpen" [ngClass]="isExpanded ? 'w-[350px] h-[500px] md:w-[600px] md:h-[700px]' : 'w-[350px] h-[500px]'" class="flex flex-col bg-background rounded-lg border shadow-lg card-hover">
        <div class="flex items-center justify-between border-b px-4 py-3">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <mat-icon class="text-primary-foreground">smart_toy</mat-icon>
            </div>
            <div>
              <span class="text-lg font-bold gradient-text">AVA</span>
              <div class="text-xs text-muted-foreground">Artifact Virtual Assistant</div>
            </div>
          </div>
          <div class="flex gap-1">
            <button mat-icon-button (click)="toggleExpand()" [attr.aria-label]="isExpanded ? 'Minimize' : 'Maximize'">
              <mat-icon>{{ isExpanded ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
            </button>
            <button mat-icon-button (click)="toggleOpen()" aria-label="Close">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <div class="flex flex-col gap-4">
            <div *ngFor="let message of messages" [ngClass]="message.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'" class="flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm">
              {{ message.content }}
            </div>
          </div>
        </div>
        <form (ngSubmit)="handleSubmit()" class="flex w-full gap-2 border-t p-3">
          <input
            class="flex-1 rounded border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ask AVA anything about Artifact Virtual..."
            [(ngModel)]="input"
            name="avaInput"
            autocomplete="off"
          />
          <button mat-icon-button type="submit" [disabled]="!input.trim()">
            <mat-icon>send</mat-icon>
          </button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./ava-assistant.component.scss']
})
export class AvaAssistantComponent {
  isOpen = false;
  isExpanded = false;
  input = '';
  messages = [
    {
      id: 'welcome',
      content: "Hello! I'm AVA, Artifact Virtual's Assistant. How can I help you?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ];

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
  handleSubmit() {
    if (this.input.trim()) {
      this.messages.push({
        id: `user-${Date.now()}`,
        content: this.input,
        sender: 'user',
        timestamp: new Date(),
      });
      this.input = '';
      setTimeout(() => {
        this.messages.push({
          id: `assistant-${Date.now()}`,
          content: "I'm AVA, your virtual assistant. I can help you navigate Artifact Virtual, manage projects, and answer questions about AI, blockchain, and quantum computing.",
          sender: 'assistant',
          timestamp: new Date(),
        });
      }, 1000);
    }
  }
}