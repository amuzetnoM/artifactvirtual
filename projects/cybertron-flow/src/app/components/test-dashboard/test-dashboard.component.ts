import { Component } from '@angular/core';

@Component({
  selector: 'app-test-dashboard',
  templateUrl: './test-dashboard.component.html',
  styleUrls: ['./test-dashboard.component.scss']
})
export class TestDashboardComponent {
  // Placeholder for chat and multi-model integration logic
  chatMessages = [
    { sender: 'user', text: 'Hello, AI!' },
    { sender: 'ai', text: 'Hello! How can I assist you today?' }
  ];
  newMessage = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatMessages.push({ sender: 'user', text: this.newMessage });
      // Simulate AI response
      this.chatMessages.push({ sender: 'ai', text: 'AI response placeholder.' });
      this.newMessage = '';
    }
  }
}
