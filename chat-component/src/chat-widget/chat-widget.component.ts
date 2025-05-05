import { Component, Input, OnInit, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'av-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent implements OnInit {
  @Input() chatServerUrl: string = 'http://localhost:8000';
  @Input() title: string = 'Artifact Virtual Chat';
  @Input() width: string = '400px';
  @Input() height: string = '600px';
  @Input() position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right';
  @Input() buttonColor: string = '#000000';
  @Input() buttonIconColor: string = '#ffffff';

  @Output() chatOpened = new EventEmitter<void>();
  @Output() chatClosed = new EventEmitter<void>();

  @ViewChild('chatContainer') chatContainer: ElementRef;

  isOpen: boolean = false;
  iframeUrl: SafeResourceUrl;
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  currentX: number = 0;
  currentY: number = 0;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.chatServerUrl);
    
    // Set initial position based on input
    setTimeout(() => {
      this.setInitialPosition();
    }, 0);
  }

  setInitialPosition(): void {
    if (!this.chatContainer) return;

    const container = this.chatContainer.nativeElement;
    const rect = container.getBoundingClientRect();

    switch (this.position) {
      case 'bottom-right':
        this.currentX = window.innerWidth - rect.width - 20;
        this.currentY = window.innerHeight - rect.height - 20;
        break;
      case 'bottom-left':
        this.currentX = 20;
        this.currentY = window.innerHeight - rect.height - 20;
        break;
      case 'top-right':
        this.currentX = window.innerWidth - rect.width - 20;
        this.currentY = 20;
        break;
      case 'top-left':
        this.currentX = 20;
        this.currentY = 20;
        break;
    }

    container.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.chatOpened.emit();
    } else {
      this.chatClosed.emit();
    }
  }

  startDrag(event: MouseEvent): void {
    if (event.target && (event.target as HTMLElement).classList.contains('chat-header')) {
      this.isDragging = true;
      this.startX = event.clientX - this.currentX;
      this.startY = event.clientY - this.currentY;
      event.preventDefault();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onDrag(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    this.currentX = event.clientX - this.startX;
    this.currentY = event.clientY - this.startY;
    
    const container = this.chatContainer.nativeElement;
    container.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
    
    event.preventDefault();
  }

  @HostListener('document:mouseup')
  stopDrag(): void {
    this.isDragging = false;
  }

  onMinimize(): void {
    this.isOpen = false;
    this.chatClosed.emit();
  }
}