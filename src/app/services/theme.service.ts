import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme = signal<Theme>('light');

  constructor() {
    // Load saved theme preference or detect system preference
    this.initializeTheme();

    // Create effect to update DOM when theme changes
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  get theme() {
    return this.currentTheme.asReadonly();
  }

  get isDarkMode() {
    return this.currentTheme() === 'dark';
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;

    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    } else {
      // Detect system preference
      const prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    root.classList.remove('light-theme', 'dark-theme');
    body.classList.remove('light-theme', 'dark-theme');

    // Apply new theme
    const themeClass = `${theme}-theme`;
    root.classList.add(themeClass);
    body.classList.add(themeClass);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  private updateMetaThemeColor(theme: Theme): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#1a1a1a' : '#ffffff';

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }

  // Listen to system theme changes
  listenToSystemThemeChanges(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only update if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
          this.currentTheme.set(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
}
