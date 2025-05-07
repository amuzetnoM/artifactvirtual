import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  template: `
    <nav class="sidebar" aria-label="Main Navigation">
      <div class="sidebar-header">
        <span class="sidebar-logo">Artifact Virtual</span>
      </div>
      <ul class="sidebar-menu">
        <li><a routerLink="/" routerLinkActive="active"><span class="icon">🏠</span> Overview</a></li>
        <li><a routerLink="/ai-ecosystems" routerLinkActive="active"><span class="icon">🧠</span> AI Ecosystems</a></li>
        <li><a routerLink="/projects" routerLinkActive="active"><span class="icon">📁</span> Projects</a></li>
        <li><a routerLink="/applications" routerLinkActive="active"><span class="icon">🖥️</span> Applications</a></li>
        <li><a routerLink="/system" routerLinkActive="active"><span class="icon">⚙️</span> System</a></li>
        <li><a routerLink="/servers" routerLinkActive="active"><span class="icon">🗄️</span> Servers</a></li>
        <li><a routerLink="/quantum" routerLinkActive="active"><span class="icon">🧬</span> Quantum</a></li>
      </ul>
      <div class="sidebar-footer">
        <button class="sidebar-theme-toggle" (click)="toggleTheme()" aria-label="Toggle theme">
          <span *ngIf="!isDark">🌙</span><span *ngIf="isDark">☀️</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      min-height: 100vh;
      background: var(--color-sidebar);
      color: var(--color-sidebar-foreground);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 40;
      box-shadow: 2px 0 8px rgba(0,0,0,0.04);
      transition: background var(--transition), color var(--transition);
    }
    .sidebar-header {
      padding: 2rem 1.5rem 1rem 1.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .sidebar-logo {
      color: var(--color-primary);
    }
    .sidebar-menu {
      list-style: none;
      padding: 0 1rem;
      margin: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .sidebar-menu li a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      color: inherit;
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      transition: background var(--transition), color var(--transition);
    }
    .sidebar-menu li a.active, .sidebar-menu li a:hover {
      background: var(--color-accent);
      color: var(--color-accent-foreground);
    }
    .sidebar-footer {
      padding: 1.5rem 1rem;
      display: flex;
      justify-content: flex-end;
    }
    .sidebar-theme-toggle {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--color-sidebar-foreground);
      transition: color var(--transition);
    }
    @media (max-width: 900px) {
      .sidebar { display: none; }
    }
  `]
})
export class SidebarComponent {
  isDark = false;
  toggleTheme() {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark-theme', this.isDark);
  }
}
