import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'bedrock_ide_theme';
  private renderer: Renderer2;
  private themeSubject = new BehaviorSubject<ThemeMode>(this.getInitialTheme());
  
  currentTheme$ = this.themeSubject.asObservable();

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.applyTheme(this.themeSubject.value);
    
    // Check for system theme changes
    if (this.themeSubject.value === 'system') {
      this.setupSystemThemeListener();
    }
  }

  private getInitialTheme(): ThemeMode {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
    return savedTheme || 'system';
  }

  private setupSystemThemeListener(): void {
    // Listen for changes to the prefers-color-scheme media query
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial check
    this.applySystemTheme(mediaQuery.matches);
    
    // Add listener for theme changes
    mediaQuery.addEventListener('change', (event) => {
      if (this.themeSubject.value === 'system') {
        this.applySystemTheme(event.matches);
      }
    });
  }

  private applySystemTheme(isDark: boolean): void {
    const theme = isDark ? 'dark' : 'light';
    this.setDocumentClass(theme);
  }

  private setDocumentClass(theme: string): void {
    if (theme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme');
      this.renderer.removeClass(document.body, 'light-theme');
    } else {
      this.renderer.addClass(document.body, 'light-theme');
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  private applyTheme(theme: ThemeMode): void {
    if (theme === 'system') {
      // Check system preference
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applySystemTheme(isDarkMode);
    } else {
      // Apply specific theme
      this.setDocumentClass(theme);
    }
  }

  setTheme(theme: ThemeMode): void {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    
    // Setup system theme listener if needed
    if (theme === 'system') {
      this.setupSystemThemeListener();
    }
  }

  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    let newTheme: ThemeMode;
    
    switch (currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'system';
        break;
      case 'system':
      default:
        newTheme = 'light';
        break;
    }
    
    this.setTheme(newTheme);
  }
}