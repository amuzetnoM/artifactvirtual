import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from './chat-widget.component';

@NgModule({
  declarations: [
    ChatWidgetComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ChatWidgetComponent
  ]
})
export class ChatWidgetModule { }