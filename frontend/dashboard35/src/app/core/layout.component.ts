import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `
    <div class="min-h-screen flex bg-background text-foreground font-sans">
      <app-sidebar class="hidden md:block" />
      <div class="flex-1 flex flex-col min-h-screen">
        <app-header></app-header>
        <main class="flex-1 overflow-y-auto p-4 md:p-8 bg-secondary/10">
          <ng-content></ng-content>
        </main>
      </div>
      <app-ava-assistant></app-ava-assistant>
    </div>
  `,
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {}