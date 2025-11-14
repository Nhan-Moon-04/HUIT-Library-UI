import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StatisticsService, StatisticsOverview } from '../../services/statistics.service';
import {
  NotificationService,
  Notification,
  NotificationListResponse,
} from '../../services/notification.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  statisticsService = inject(StatisticsService);
  router = inject(Router);

  notifications = signal<Notification[]>([]);
  isLoadingNotifications = signal<boolean>(false);
  statistics = signal<StatisticsOverview | null>(null);

  // Hero carousel state
  activeSlideIndex = signal(0);
  carouselInterval: any;
  statisticsInterval: any;

  // Sample data for demo
  featuredNews = {
    title: 'Lễ tốt nghiệp Sinh viên Khóa 25 năm học 2023-2024',
    excerpt:
      'Thư viện Trường Đại học Công Thương TP.HCM tổ chức lễ tốt nghiệp cho sinh viên Khóa 25 với hơn 1000 cựu sinh viên tham dự.',
    image: 'assets/images/news1.jpg',
    date: new Date('2024-11-01'),
    category: 'Sự kiện',
  };

  newBooks = [
    {
      title: 'Danh mục sách mới nhất 2025',
      author: 'Tập thể tác giả',
      category: 'Tài liệu học tập',
      publishYear: 2025,
      coverImage: 'assets/images/book1.jpg',
    },
    {
      title: 'Tạp chí Khoa học Công nghệ',
      author: 'Tạp chí Đại học',
      category: 'Ấn phẩm định kỳ',
      publishYear: 2024,
      coverImage: 'assets/images/book2.jpg',
    },
  ];

  ngOnInit(): void {
    this.loadLatestNotifications();
    this.loadStatistics();
    this.recordVisit();
    this.setOnlineStatus(true);
    this.startCarousel();
    this.setupStatisticsRefresh();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    if (this.statisticsInterval) {
      clearInterval(this.statisticsInterval);
    }
    // Set offline khi rời khỏi trang
    this.setOnlineStatus(false);
  }

  loadLatestNotifications(): void {
    this.isLoadingNotifications.set(true);
    this.notificationService.getNotifications(1, 5).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notifications.set(response.data);
        }
        this.isLoadingNotifications.set(false);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoadingNotifications.set(false);
      },
    });
  }

  loadStatistics(): void {
    this.statisticsService.getOverview().subscribe({
      next: (response) => {
        if (response.success) {
          this.statistics.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      },
    });
  }

  recordVisit(): void {
    this.statisticsService.recordVisit().subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Visit recorded successfully');
        }
      },
      error: (error) => {
        console.error('Error recording visit:', error);
      },
    });
  }

  setOnlineStatus(isOnline: boolean): void {
    // Chỉ gọi API khi đã đăng nhập
    if (this.authService.isLoggedIn()) {
      this.statisticsService.updateOnlineStatus(isOnline).subscribe({
        next: (response) => {
          if (response.success) {
            console.log(`Online status updated: ${isOnline}`);
          }
        },
        error: (error) => {
          console.error('Error updating online status:', error);
        },
      });
    }
  }

  setupStatisticsRefresh(): void {
    // Refresh thống kê mỗi 30 giây
    this.statisticsInterval = setInterval(() => {
      this.loadStatistics();
    }, 30000);
  }

  // Hero carousel methods
  startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  setActiveSlide(index: number): void {
    this.activeSlideIndex.set(index);
  }

  nextSlide(): void {
    const current = this.activeSlideIndex();
    const next = (current + 1) % 3; // 3 slides total
    this.setActiveSlide(next);
  }

  // Navigation methods
  navigateToRoomSearch(): void {
    this.router.navigate(['/room-search']);
  }

  navigateToBooking(): void {
    this.router.navigate(['/booking-request']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  navigateToNotificationDetail(id: number): void {
    this.router.navigate(['/notifications', id]);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToHistory(): void {
    this.router.navigate(['/booking-history']);
  }

  navigateToChat(): void {
    // Open chat widget or navigate to chat page
    console.log('Opening chat...');
  }

  navigateToRegulations(): void {
    this.router.navigate(['/regulations']);
  }

  // News navigation methods
  previousNews(): void {
    // Implement news carousel navigation
    console.log('Previous news');
  }

  nextNews(): void {
    // Implement news carousel navigation
    console.log('Next news');
  }

  // Books navigation methods
  previousBook(): void {
    // Implement books carousel navigation
    console.log('Previous book');
  }

  nextBook(): void {
    // Implement books carousel navigation
    console.log('Next book');
  }

  viewBookDetail(book: any): void {
    // Navigate to book detail or open modal
    console.log('Viewing book:', book.title);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  formatNewsDate(date: Date): string {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  logout(): void {
    this.authService.logout();
  }
}
