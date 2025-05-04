import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isDarkMode = true;

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    // Initialize theme
    this.isDarkMode = this.themeService.isDarkMode();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}