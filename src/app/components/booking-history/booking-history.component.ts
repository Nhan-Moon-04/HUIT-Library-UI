import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService, HistoryBooking } from '../../services/booking.service';
import { DateTimeUtils } from '../../utils/datetime.utils';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.css'],
})
export class BookingHistoryComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  bookings = signal<HistoryBooking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  message = signal<string | null>(null);
  pageNumber = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  searchTerm = signal('');
  isSearchMode = signal(false);

  ngOnInit(): void {
    this.load(this.pageNumber());
  }

  load(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const request = this.isSearchMode()
      ? this.bookingService.searchBookingHistory(this.searchTerm(), page, this.pageSize())
      : this.bookingService.getBookingHistory(page, this.pageSize());

    request.subscribe({
      next: (res) => {
        this.bookings.set(res.data || []);
        this.pageNumber.set(res.pagination?.pageNumber || page);
        this.pageSize.set(res.pagination?.pageSize || this.pageSize());
        this.totalItems.set(res.pagination?.totalItems || 0);
        this.loading.set(false);

        if (this.isSearchMode() && res.data && res.data.length === 0) {
          this.message.set(`Không tìm thấy kết quả cho từ khóa "${this.searchTerm()}"`);
        } else {
          this.message.set(null);
        }
      },
      error: (err) => {
        this.error.set('Không thể tải lịch sử mượn phòng.');
        this.loading.set(false);
      },
    });
  }

  prev(): void {
    const p = Math.max(1, this.pageNumber() - 1);
    if (p !== this.pageNumber()) this.load(p);
  }

  next(): void {
    const maxPage = Math.ceil(this.totalItems() / this.pageSize());
    const p = Math.min(maxPage || 1, this.pageNumber() + 1);
    if (p !== this.pageNumber()) this.load(p);
  }

  formatDateTime = DateTimeUtils.formatDateTime;

  totalPages(): number {
    const size = this.pageSize() || 1;
    const total = this.totalItems() || 0;
    return Math.max(1, Math.ceil(total / size));
  }

  onPageSizeChange(value: string | number): void {
    const v = typeof value === 'string' ? Number(value) : value;
    if (!v || v <= 0) return;
    this.pageSize.set(v);
    this.load(1);
  }

  onSearch(): void {
    const term = this.searchTerm().trim();
    if (term.length === 0) {
      this.resetSearch();
      return;
    }

    this.isSearchMode.set(true);
    this.pageNumber.set(1);
    this.load(1);
  }

  resetSearch(): void {
    this.searchTerm.set('');
    this.isSearchMode.set(false);
    this.message.set(null);
    this.pageNumber.set(1);
    this.load(1);
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  goBack(): void {
    window.history.back();
  }

  getHistoryStatusClass(maTrangThai: number): string {
    switch (maTrangThai) {
      case 1:
        return 'status-pending';
      case 2:
        return 'status-approved';
      case 3:
        return 'status-rejected';
      case 4:
        return 'status-using';
      case 5:
        return 'status-completed';
      default:
        return 'status-default';
    }
  }

  getHistoryStatusIcon(maTrangThai: number): string {
    switch (maTrangThai) {
      case 1:
        return 'fa-clock';
      case 2:
        return 'fa-check-circle';
      case 3:
        return 'fa-times-circle';
      case 4:
        return 'fa-door-open';
      case 5:
        return 'fa-flag-checkered';
      default:
        return 'fa-question-circle';
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToBooking(): void {
    this.router.navigate(['/booking/create']);
  }

  viewBookingDetail(bookingId: number): void {
    // Navigate to booking detail page
    this.router.navigate(['/booking/detail', bookingId]);
  }
}
