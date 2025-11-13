import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserName(): string {
    const user = this.authService.currentUser();
    return user?.hoTen || 'Người dùng';
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }

  getHomeLink(): string {
    const user = this.authService.currentUser();
    const role = user?.vaiTro;
    switch (role) {
      case 'SINH_VIEN':
        return '/student-dashboard';
      case 'NHAN_VIEN':
        return '/staff-dashboard';
      case 'QUAN_LY':
        return '/admin-dashboard';
      default:
        return '/student-dashboard'; // default fallback
    }
  }
}
