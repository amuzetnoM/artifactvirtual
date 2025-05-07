import { Component, type OnInit } from '@angular/core';
import type { NavigationGroup, NavigationItem } from './navigation-item.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isDark = false;
  navigationGroups: NavigationGroup[] = [];
  isSidebarOpen = true;
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeNavigation();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateActiveStates(event.urlAfterRedirects);
      }
    });
    this.updateActiveStates(this.router.url);
  }

  initializeNavigation(): void {
    this.navigationGroups = [
      {
        title: "Overview",
        items: [
          {
            title: "Dashboard",
            href: "/",
            icon: "icon-home",
          },
        ],
      },
      {
        title: "Content Management",
        items: [
          {
            title: "Projects",
            href: "/projects",
            icon: "icon-layout-dashboard",
            badge: "New",
            isExpanded: false,
            children: [
              {
                title: "All Projects",
                href: "/projects",
                icon: "icon-folder-kanban",
                isChild: true,
              },
              {
                title: "Create New",
                href: "/projects/create",
                icon: "icon-box",
                isChild: true,
              },
              {
                title: "Templates",
                href: "/projects/templates",
                icon: "icon-code-square",
                isChild: true,
              },
            ],
          },
          {
            title: "Applications",
            href: "/applications",
            icon: "icon-terminal",
            isExpanded: false,
            children: [
              {
                title: "Meteor Editor",
                href: "/applications/meteor",
                icon: "icon-file-text",
                isChild: true,
              },
              {
                title: "Oracle CLI",
                href: "/applications/oracle",
                icon: "icon-terminal",
                isChild: true,
              },
              {
                title: "Temporal Calendar",
                href: "/applications/calendar",
                icon: "icon-calendar",
                isChild: true,
              },
            ],
          },
          {
            title: "Research",
            href: "/research",
            icon: "icon-brain",
            badge: 3,
          },
        ],
      },
      {
        title: "AI & Knowledge",
        items: [
          {
            title: "AI Ecosystems",
            href: "/ai-ecosystems",
            icon: "icon-brain",
            isExpanded: false,
            children: [
              {
                title: "Overview",
                href: "/ai-ecosystems",
                icon: "icon-layout-dashboard",
                isChild: true,
              },
              {
                title: "AI Lab",
                href: "/ai-ecosystems/lab",
                icon: "icon-play-square",
                badge: "New",
                isChild: true,
              },
              {
                title: "Models",
                href: "/ai-ecosystems/models",
                icon: "icon-braces",
                isChild: true,
              },
              {
                title: "Model Quantization",
                href: "/ai-ecosystems/quantization",
                icon: "icon-activity",
                isChild: true,
              },
              {
                title: "Communication Protocols",
                href: "/ai-ecosystems/protocols",
                icon: "icon-network",
                isChild: true,
              },
            ],
          },
          {
            title: "Knowledge",
            href: "/knowledge",
            icon: "icon-book-open",
          },
        ],
      },
      {
        title: "Blockchain & Systems",
        items: [
          {
            title: "Blockchain",
            href: "/blockchain",
            icon: "icon-git-branch",
            isExpanded: false,
            children: [
              {
                title: "Overview",
                href: "/blockchain",
                icon: "icon-layout-dashboard",
                isChild: true,
              },
              {
                title: "Wallets",
                href: "/blockchain/wallets",
                icon: "icon-wallet",
                isChild: true,
              },
              {
                title: "Smart Contracts",
                href: "/blockchain/contracts",
                icon: "icon-file-code",
                isChild: true,
              },
            ],
          },
          {
            title: "System",
            href: "/system",
            icon: "icon-settings",
          },
          {
            title: "Servers",
            href: "/servers",
            icon: "icon-server",
          },
          {
            title: "Quantum Computing",
            href: "/quantum",
            icon: "icon-atom",
            badge: "Beta",
          },
        ],
      },
    ];
  }

  updateActiveStates(currentUrl: string): void {
    for (const group of this.navigationGroups) {
      for (const item of group.items) {
        item.isActive = (item.href === currentUrl || (item.href !== '/' && currentUrl.startsWith(item.href + (item.children && item.children.length > 0 ? '' : ''))));
        if (item.children) {
          let parentActive = false;
          for (const child of item.children) {
            child.isActive = (child.href === currentUrl || (child.href !== '/' && currentUrl.startsWith(child.href)));
            if (child.isActive) parentActive = true;
          }
          if (parentActive) {
            item.isActive = true;
          }
        }
      }
    }
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleExpand(item: NavigationItem): void {
    if (item.children && item.children.length > 0) {
      item.isExpanded = !item.isExpanded;
    }
  }

  currentUser = {
    name: 'Admin User',
    email: 'admin@artifactvirtual.com',
    avatar: '/assets/img/avatar-placeholder.png'
  };
}
