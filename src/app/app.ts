import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatComponent, NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('HUIT-Library-UI');
  private router = inject(Router);
  private authService = inject(AuthService);

  showNavbar = signal(true);

  constructor() {
    // Hide navbar on login page
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const hiddenNavbarRoutes = ['/login', '/forgot-password', '/reset-password'];
        this.showNavbar.set(!hiddenNavbarRoutes.includes(event.url));
      });
  }
}
