import { Component } from '@angular/core';

@Component({
  selector: 'app-overview',
  template: `
    <section class="section">
      <h2 class="gradient-text" style="font-size:2.2rem; font-weight:700; margin-bottom:0.5em;">Artifact Dashboard</h2>
      <p class="text-muted-foreground" style="margin-bottom:2em;">Unified overview of your AI, Blockchain, Projects, System, and more.</p>
      <div class="dashboard-cards-grid">
        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="icon">🧠</span>
              <span class="font-bold">AI & Models</span>
            </div>
            <span class="badge" style="background:#22c55e22; color:#22c55e;">Operational</span>
          </div>
          <div class="text-muted-foreground mb-2">Model integration and deployment</div>
          <div class="flex items-center justify-between text-sm mb-1">
            <span>Active Models</span>
            <span class="font-medium">4/6</span>
          </div>
          <div class="progress-bar" style="height:6px; background:#e5e7eb; border-radius:4px; overflow:hidden;">
            <div style="width:66%; height:100%; background:#2563eb;"></div>
          </div>
          <button class="btn-outline mt-3 w-full">View Details</button>
        </div>
        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="icon">📁</span>
              <span class="font-bold">Projects</span>
            </div>
            <span class="badge" style="background:#3b82f622; color:#3b82f6;">Active</span>
          </div>
          <div class="text-muted-foreground mb-2">Development projects and tasks</div>
          <div class="flex items-center justify-between text-sm mb-1">
            <span>Completion</span>
            <span class="font-medium">72%</span>
          </div>
          <div class="progress-bar" style="height:6px; background:#e5e7eb; border-radius:4px; overflow:hidden;">
            <div style="width:72%; height:100%; background:#3b82f6;"></div>
          </div>
          <button class="btn-outline mt-3 w-full">View Details</button>
        </div>
        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="icon">🗄️</span>
              <span class="font-bold">Knowledge</span>
            </div>
            <span class="badge" style="background:#22c55e22; color:#22c55e;">Operational</span>
          </div>
          <div class="text-muted-foreground mb-2">Structured data and information</div>
          <div class="flex items-center justify-between text-sm mb-1">
            <span>Datasets</span>
            <span class="font-medium">12</span>
          </div>
          <button class="btn-outline mt-3 w-full">View Details</button>
        </div>
        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="icon">⚙️</span>
              <span class="font-bold">System</span>
            </div>
            <span class="badge" style="background:#22c55e22; color:#22c55e;">Healthy</span>
          </div>
          <div class="text-muted-foreground mb-2">Resources and performance</div>
          <div class="flex items-center justify-between text-sm mb-1">
            <span>CPU Usage</span>
            <span class="font-medium">42%</span>
          </div>
          <div class="progress-bar" style="height:6px; background:#e5e7eb; border-radius:4px; overflow:hidden;">
            <div style="width:42%; height:100%; background:#22c55e;"></div>
          </div>
          <button class="btn-outline mt-3 w-full">View Details</button>
        </div>
        <div class="card">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="icon">🖥️</span>
              <span class="font-bold">Applications</span>
            </div>
            <span class="badge" style="background:#3b82f622; color:#3b82f6;">Active</span>
          </div>
          <div class="text-muted-foreground mb-2">Tools and utilities</div>
          <div class="flex items-center justify-between text-sm mb-1">
            <span>Running</span>
            <span class="font-medium">3/5</span>
          </div>
          <div class="progress-bar" style="height:6px; background:#e5e7eb; border-radius:4px; overflow:hidden;">
            <div style="width:60%; height:100%; background:#3b82f6;"></div>
          </div>
          <button class="btn-outline mt-3 w-full">View Details</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .dashboard-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .gradient-text {
      background: linear-gradient(90deg, #2563eb 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
    }
    .text-muted-foreground {
      color: var(--color-muted-foreground);
    }
    .btn-outline {
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      border-radius: var(--radius);
      padding: 0.5em 1.25em;
      font-size: 1em;
      font-weight: 500;
      cursor: pointer;
      transition: background var(--transition), color var(--transition);
    }
    .btn-outline:hover {
      background: var(--color-accent);
      color: var(--color-accent-foreground);
    }
    .badge {
      border-radius: 999px;
      padding: 0.25em 0.75em;
      font-size: 0.85em;
      font-weight: 500;
      background: var(--color-accent);
      color: var(--color-accent-foreground);
    }
    .card {
      background: var(--color-card);
      color: var(--color-card-foreground);
      border-radius: var(--radius);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border: 1px solid var(--color-border);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: background var(--transition), color var(--transition), border var(--transition);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .icon {
      font-size: 1.3em;
    }
    .progress-bar {
      margin-top: 0.25em;
      margin-bottom: 0.5em;
    }
  `]
})
export class OverviewComponent {}
