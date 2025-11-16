import { Component, inject, OnInit, signal, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StatisticsService, StatisticsOverview } from '../../services/statistics.service';
import { NewsService, NewsItem } from '../../services/news.service';
import {
  NotificationService,
  Notification,
  NotificationListResponse,
} from '../../services/notification.service';
import {
  BookingService,
  CurrentBooking,
  CurrentBookingsResponse,
} from '../../services/booking.service';

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
  newsService = inject(NewsService);
  bookingService = inject(BookingService);
  router = inject(Router);

  notifications = signal<Notification[]>([]);
  isLoadingNotifications = signal<boolean>(false);
  statistics = signal<StatisticsOverview | null>(null);
  // Booking signals
  currentBookings = signal<CurrentBooking[]>([]);
  isLoadingCurrentBookings = signal<boolean>(false);

  // News signals
  newsList = signal<NewsItem[]>([]);
  isLoadingNews = signal<boolean>(false);
  currentNewsIndex = signal(0);

  // Computed signal cho current news
  currentNews = computed(() => {
    const list = this.newsList();
    const index = this.currentNewsIndex();
    console.log('Computed currentNews - Index:', index, 'List length:', list.length);
    return list.length > 0 && index < list.length ? list[index] : null;
  });

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

  ngOnInit(): void {
    this.loadLatestNotifications();
    this.loadStatistics();
    this.loadNews();
    this.loadCurrentBookings();
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

  loadCurrentBookings(): void {
    // Only load if user is logged in
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.isLoadingCurrentBookings.set(true);
    this.bookingService.getCurrentBookingsV2().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentBookings.set(response.data);
          console.log('Current bookings loaded:', response.data);
        }
        this.isLoadingCurrentBookings.set(false);
      },
      error: (error) => {
        console.error('Error loading current bookings:', error);
        this.isLoadingCurrentBookings.set(false);
      },
    });
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
    console.log('Loading statistics from API...');
    this.statisticsService.getOverview().subscribe({
      next: (response) => {
        console.log('Statistics response:', response);
        if (response.success) {
          this.statistics.set(response.data);
          console.log('Statistics loaded successfully:', response.data);
        } else {
          console.warn('Statistics API returned unsuccessful response:', response);
        }
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);

        // Fallback data nếu API lỗi
        const fallbackStats = {
          tongLuotTruyCap: 0,
          soLuongOnline: 0,
          thanhVienOnline: 0,
          khachOnline: 0,
          trongNgay: 0,
          homQua: 0,
          trongThang: 0,
        };
        this.statistics.set(fallbackStats);
        console.log('Using fallback statistics data');
      },
    });
  }

  recordVisit(): void {
    console.log('Recording visit...');
    this.statisticsService.recordVisit().subscribe({
      next: (response) => {
        console.log('Visit record response:', response);
        if (response.success) {
          console.log('Visit recorded successfully');
        } else {
          console.warn('Visit record unsuccessful:', response.message);
        }
      },
      error: (error) => {
        console.error('Error recording visit:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
      },
    });
  }

  setOnlineStatus(isOnline: boolean): void {
    // Chỉ gọi API khi đã đăng nhập
    if (this.authService.isLoggedIn()) {
      console.log(`Updating online status: ${isOnline}`);
      this.statisticsService.updateOnlineStatus(isOnline).subscribe({
        next: (response) => {
          console.log('Online status response:', response);
          if (response.success) {
            console.log(`Online status updated successfully: ${isOnline}`);
          } else {
            console.warn('Online status update unsuccessful:', response.message);
          }
        },
        error: (error) => {
          console.error('Error updating online status:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
        },
      });
    } else {
      console.log('User not logged in, skipping online status update');
    }
  }

  loadNews(): void {
    this.isLoadingNews.set(true);
    this.newsService.getNewsList(1, 10).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.success && response.lstNewsPaging) {
          // Sử dụng dữ liệu đã được filter từ server
          const displayNews = response.lstNewsPaging;
          this.newsList.set(displayNews);
          console.log('News loaded:', displayNews.length, 'items');
          console.log(
            'First 3 news titles:',
            displayNews.slice(0, 3).map((n) => n.TITLE)
          );
          console.log('Current news index:', this.currentNewsIndex());
        } else {
          console.log('API response không có dữ liệu:', response);
        }
        this.isLoadingNews.set(false);
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.isLoadingNews.set(false);
        // Fallback to demo data if API fails
        this.loadDemoNews();
      },
    });
  }

  loadDemoNews(): void {
    // Demo news data as fallback
    const demoNews: NewsItem[] = [
      {
        ITEMID: 1,
        TITLE:
          'Thư viện Trường Đại học Công Thương TP. HCM tiếp nhận hơn 1.000 quyển sách ngoại văn từ GS. Trần Hữu Dũng',
        CONTENT:
          'Nhằm góp phần nâng cao chất lượng học tập và nghiên cứu của sinh viên, học viên...',
        ITEMIMG: '',
        PUBLISHDATE: '2025-11-08T00:00:00',
        CREATED: '2025-11-10T15:14:05',
        MODIFIED: '2025-11-12T14:05:58.567',
        VIEWCOUNT: 48,
        AUTHORID: 48,
        STRAUTHOR_NAME: 'Ban thư viện',
        STRCATEGORY_NAME: 'Tin tức',
        STRARTICLETYPE_NAME: 'Sự kiện',
        FRIENDLYNAME: 'thu-vien-truong-dai-hoc-cong-thuong-tp-hcm-tiep-nhan-hon-1-000-quyen-sach',
        ISDISPLAY: true,
        STATUS: 3,
        STRSTATUS: 'Đã ban hành',
        STRUCTUREID: ',284,',
        ARTICLETYPEID: 18,
        TOPITEM: true,
      },
    ];
    this.newsList.set(demoNews);
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
    this.router.navigate(['/booking/create']);
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
    this.router.navigate(['/bookings/history']);
  }

  navigateToChat(): void {
    // Điều hướng tới trang chat
    this.router.navigate(['/chat']);
  }

  navigateToRegulations(): void {
    this.router.navigate(['/regulations']);
  }

  // News navigation methods
  previousNews(): void {
    const current = this.currentNewsIndex();
    const newsList = this.newsList();
    console.log('Previous news - Current:', current, 'Total news:', newsList.length);

    if (newsList.length <= 1) return;

    const previous = current > 0 ? current - 1 : newsList.length - 1;
    this.currentNewsIndex.set(previous);
    console.log('Previous news - New index:', previous, 'New title:', this.currentNews()?.TITLE);
  }

  nextNews(): void {
    const current = this.currentNewsIndex();
    const newsList = this.newsList();
    console.log('Next news - Current:', current, 'Total news:', newsList.length);

    if (newsList.length <= 1) return;

    const next = (current + 1) % newsList.length;
    this.currentNewsIndex.set(next);
    console.log('Next news - New index:', next, 'New title:', this.currentNews()?.TITLE);
  }

  getNewsImage(newsItem: NewsItem): string {
    return this.newsService.getImageUrl(newsItem);
  }

  getNewsCategory(newsItem: NewsItem): string {
    return this.newsService.getCategoryName(newsItem);
  }

  isHotNews(newsItem: NewsItem): boolean {
    return this.newsService.isHotNews(newsItem);
  }

  getNewsExcerpt(newsItem: NewsItem): string {
    return this.newsService.getExcerpt(newsItem.CONTENT, 150);
  }

  formatNewsDate(dateString: string): string {
    return this.newsService.formatDate(dateString);
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
    // You can implement a modal or navigate to detail page
    // this.router.navigate(['/books', book.id]);
  }

  borrowBook(book: any): void {
    if (!book.available) {
      console.log('Book not available');
      return;
    }
    // Implement book borrowing logic
    console.log('Borrowing book:', book.title);
    // this.bookService.borrowBook(book.id).subscribe(...);
  }

  readNewsDetail(news: NewsItem): void {
    console.log('Reading news:', news.TITLE);

    // Tăng view count
    this.newsService.increaseViewCount(news.ITEMID).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('View count increased for news:', news.ITEMID);
          // Cập nhật view count trong danh sách hiện tại
          const currentList = this.newsList();
          const updatedList = currentList.map((item) =>
            item.ITEMID === news.ITEMID ? { ...item, VIEWCOUNT: item.VIEWCOUNT + 1 } : item
          );
          this.newsList.set(updatedList);
        }
      },
      error: (error) => {
        console.error('Error increasing view count:', error);
      },
    });

    // Navigate to news detail page hoặc mở modal
    // this.router.navigate(['/news', news.FRIENDLYNAME]);
    // Hoặc mở trong tab mới
    // window.open(`/news/${news.FRIENDLYNAME}`, '_blank');
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

  setupStatisticsRefresh(): void {
    // Refresh thống kê mỗi 30 giây
    this.statisticsInterval = setInterval(() => {
      this.loadStatistics();
    }, 30000);
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  navigateToBookingDetail(maDangKy: number): void {
    this.router.navigate(['/booking/detail', maDangKy]);
  }

  viewViolations(maDangKy: number): void {
    this.router.navigate(['/violations', maDangKy]);
  }

  navigateToIncidentReport(maDangKy: number): void {
    // Điều hướng đến trang xem biên bản vi phạm
    this.router.navigate(['/bookings/incident-report', maDangKy]);
  }

  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
