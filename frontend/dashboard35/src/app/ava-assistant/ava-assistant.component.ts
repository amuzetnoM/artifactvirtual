import { Component, type ElementRef, ViewChild, type AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import type { AvaMessage } from './ava-message.model';

@Component({
  selector: 'app-ava-assistant',
  templateUrl: './ava-assistant.component.html',
  styleUrls: ['./ava-assistant.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AvaAssistantComponent implements AfterViewChecked {
  @ViewChild('scrollMe') private scrollContainer?: ElementRef;

  isOpen = false;
  isExpanded = false;
  input = '';
  messages: AvaMessage[] = [
    {
      id: `welcome-${Date.now()}`,
      content: "Hello! I'm AVA, Artifact Virtual's Assistant. How can I help you?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ];

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
        setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
    setTimeout(() => this.scrollToBottom(), 0);
  }

  sendMessage(): void {
    if (this.input.trim()) {
      const userMessage: AvaMessage = {
        id: `user-${Date.now()}`,
        content: this.input,
        sender: "user",
        timestamp: new Date(),
      };
      this.messages.push(userMessage);
      this.input = '';
      this.scrollToBottom();

      setTimeout(() => {
        const assistantMessage: AvaMessage = {
          id: `assistant-${Date.now()}`,
          content: "I'm AVA, your virtual assistant. I can help you navigate the Artifact Virtual platform, manage your projects, and answer questions about AI, blockchain, and quantum computing. This is a simulated response.",
          sender: "assistant",
          timestamp: new Date(),
        };
        this.messages.push(assistantMessage);
        this.scrollToBottom();
      }, 1000);
    }
  }

  private scrollToBottom(): void {
    try {
        this.scrollContainer?.nativeElement?.scrollTo?.({
            top: this.scrollContainer.nativeElement.scrollHeight,
            behavior: 'smooth'
        });
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }
}
