import { Component } from '@angular/core';

interface SidebarNavItem {
  title: string;
  icon: string;
  route?: string;
  children?: SidebarNavItem[];
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0">
      <div class="flex h-16 items-center border-b px-6">
        <span class="font-bold gradient-text text-lg">Artifact Virtual</span>
      </div>
      <div class="flex-1 overflow-auto py-2 custom-scrollbar">
        <nav class="grid gap-2 px-2">
          <ng-container *ngFor="let group of navGroups">
            <div class="text-xs font-semibold text-muted-foreground mt-4 mb-2 px-2 uppercase tracking-wider">{{ group.title }}</div>
            <ng-container *ngFor="let item of group.items">
              <div *ngIf="!item.children" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gradient-to-r hover:from-primary hover:to-lime-400 hover:text-primary-foreground transition-colors cursor-pointer" [routerLink]="item.route" routerLinkActive="bg-gradient-to-r from-primary to-lime-400 text-primary-foreground">
                <mat-icon>{{item.icon}}</mat-icon>
                <span>{{item.title}}</span>
                <span *ngIf="item.badge" class="ml-auto text-xs bg-lime-400 text-black rounded px-2 py-0.5">{{item.badge}}</span>
              </div>
              <div *ngIf="item.children" class="flex flex-col">
                <div class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gradient-to-r hover:from-primary hover:to-lime-400 hover:text-primary-foreground transition-colors cursor-pointer">
                  <mat-icon>{{item.icon}}</mat-icon>
                  <span>{{item.title}}</span>
                  <mat-icon class="ml-auto">expand_more</mat-icon>
                </div>
                <div class="ml-6 mt-1 flex flex-col gap-1">
                  <div *ngFor="let child of item.children" class="flex items-center gap-2 rounded px-2 py-1 text-xs font-medium hover:bg-gradient-to-r hover:from-primary hover:to-lime-400 hover:text-primary-foreground transition-colors cursor-pointer" [routerLink]="child.route" routerLinkActive="bg-gradient-to-r from-primary to-lime-400 text-primary-foreground">
                    <mat-icon>{{child.icon}}</mat-icon>
                    <span>{{child.title}}</span>
                    <span *ngIf="child.badge" class="ml-auto text-xs bg-lime-400 text-black rounded px-2 py-0.5">{{child.badge}}</span>
                  </div>
                </div>
              </div>
            </ng-container>
          </ng-container>
        </nav>
      </div>
      <div class="border-t p-4">
        <div class="flex items-center gap-3 rounded-lg bg-secondary p-3 text-sm">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <mat-icon>terminal</mat-icon>
          </div>
          <div>
            <p class="font-medium">System Status</p>
            <p class="text-xs text-muted-foreground">Operational</p>
          </div>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  navGroups = [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', icon: 'home', route: '/' },
      ],
    },
    {
      title: 'AI & Knowledge',
      items: [
        { title: 'AI Ecosystems', icon: 'psychology', route: '/ai-ecosystems', children: [
          { title: 'Overview', icon: 'dashboard', route: '/ai-ecosystems' },
          { title: 'AI Lab', icon: 'science', route: '/ai-ecosystems/lab', badge: 'New' },
          { title: 'Models', icon: 'memory', route: '/ai-ecosystems/models' },
          { title: 'Quantization', icon: 'tune', route: '/ai-ecosystems/quantization' },
          { title: 'Protocols', icon: 'hub', route: '/ai-ecosystems/protocols' },
        ]},
        { title: 'Knowledge', icon: 'menu_book', route: '/knowledge' },
      ],
    },
    {
      title: 'Blockchain & Systems',
      items: [
        { title: 'Blockchain', icon: 'hub', route: '/blockchain', children: [
          { title: 'Overview', icon: 'dashboard', route: '/blockchain' },
          { title: 'Wallets', icon: 'account_balance_wallet', route: '/blockchain/wallets' },
          { title: 'Smart Contracts', icon: 'code', route: '/blockchain/contracts' },
        ]},
        { title: 'System', icon: 'settings', route: '/system' },
        { title: 'Servers', icon: 'dns', route: '/servers' },
        { title: 'Quantum', icon: 'auto_awesome', route: '/quantum', badge: 'Beta' },
      ],
    },
    {
      title: 'Applications',
      items: [
        { title: 'Applications', icon: 'apps', route: '/applications', children: [
          { title: 'Meteor Editor', icon: 'cloud', route: '/applications/meteor' },
          { title: 'Oracle CLI', icon: 'terminal', route: '/applications/oracle' },
          { title: 'Temporal Calendar', icon: 'calendar_today', route: '/applications/calendar' },
        ]},
        { title: 'Research', icon: 'science', route: '/research', badge: '3' },
        { title: 'Projects', icon: 'layers', route: '/projects' },
      ],
    },
  ];
}