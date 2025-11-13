import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  NotificationService,
  Notification,
  NotificationListResponse,
} from '../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  isDropdownOpen = false;
  isNotificationOpen = false;
  unreadCount = 0;
  notifications: Notification[] = [];

  ngOnInit(): void {
    this.loadUnreadCount();
    this.loadNotifications();

    // Subscribe to unread count changes
    this.notificationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.unreadCount = count;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUnreadCount(): void {
    this.notificationService
      .getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.unreadCount = response.count;
            this.notificationService.updateUnreadCount(response.count);
          }
        },
        error: (error) => {
          console.error('Error loading unread count:', error);
        },
      });
  }

  loadNotifications(): void {
    this.notificationService
      .getRecentNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.notifications = response.data; // API already returns only 5
          }
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        },
      });
  }

  toggleNotification(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  closeNotification(): void {
    this.isNotificationOpen = false;
  }

  markAllAsRead(): void {
    this.notificationService
      .markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.unreadCount = 0;
            this.notificationService.updateUnreadCount(0);
            // Update local notifications to mark as read
            this.notifications = this.notifications.map((n) => ({ ...n, daDoc: true }));
          }
        },
        error: (error) => {
          console.error('Error marking notifications as read:', error);
        },
      });
  }

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
      case 'GIANG_VIEN':
        return '/staff-dashboard';
      case 'QUAN_LY':
        return '/admin-dashboard';
      default:
        return '/student-dashboard'; // default fallback
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.user-dropdown');
    const notificationDropdown = document.querySelector('.notification-dropdown');

    if (dropdown && !dropdown.contains(target)) {
      this.isDropdownOpen = false;
    }

    if (notificationDropdown && !notificationDropdown.contains(target)) {
      this.isNotificationOpen = false;
    }
  }
}
