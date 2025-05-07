import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header class="header" role="banner">
      <div class="header-left">
        <span class="header-title">Artifact Virtual</span>
      </div>
      <div class="header-center">
        <input class="header-search" type="search" placeholder="Search..." aria-label="Search" />
      </div>
      <div class="header-right">
        <button class="header-theme-toggle" (click)="toggleTheme()" aria-label="Toggle theme">
          <span *ngIf="!isDark">🌙</span><span *ngIf="isDark">☀️</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: var(--color-header);
      color: var(--color-header-foreground);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 30;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: background var(--transition), color var(--transition);
    }
    .header-left {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-primary);
    }
    .header-center {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .header-search {
      width: 100%;
      max-width: 320px;
      padding: 0.5rem 1rem;
      border-radius: var(--radius);
      border: 1px solid var(--color-border);
      background: var(--color-card);
      color: var(--color-foreground);
      font-size: 1rem;
      transition: border var(--transition), background var(--transition);
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-theme-toggle {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--color-header-foreground);
      transition: color var(--transition);
    }
    @media (max-width: 900px) {
      .header { padding: 0 1rem; }
      .header-center { display: none; }
    }
  `]
})
export class HeaderComponent {
  isDark = false;
  toggleTheme() {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark-theme', this.isDark);
  }
}
