import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/90 backdrop-blur-lg px-6 shadow-sm">
      <div class="flex items-center gap-2 md:hidden">
        <button mat-icon-button aria-label="Open sidebar">
          <mat-icon>menu</mat-icon>
        </button>
      </div>
      <div class="md:hidden">
        <span class="font-bold gradient-text text-xl">Artifact</span>
      </div>
      <div class="flex-1 md:flex md:justify-center">
        <div class="relative w-full max-w-lg">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</mat-icon>
          <input type="search" placeholder="Search across files, projects, and knowledge..." class="w-full bg-background/50 pl-10 pr-4 focus:bg-background rounded-md border-muted/40 h-10" />
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button mat-icon-button aria-label="Notifications">
          <mat-icon>notifications</mat-icon>
        </button>
        <button mat-icon-button aria-label="User menu">
          <mat-icon>account_circle</mat-icon>
        </button>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {}