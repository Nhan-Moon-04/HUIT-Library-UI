import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BookingService,
  CurrentBooking,
  CancelBookingPayload,
  ExtendBookingPayload,
  BookingDetailResponse,
} from '../../services/booking.service';
import { DateTimeUtils } from '../../utils/datetime.utils';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css'],
})
export class BookingListComponent implements OnInit {
  private bookingService = inject(BookingService);
  router = inject(Router);

  bookings = signal<CurrentBooking[]>([]);
  usingBookings = signal<CurrentBooking[]>([]);
  otherBookings = signal<CurrentBooking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  // Cancel modal states
  showCancelModal = signal(false);
  selectedBooking = signal<CurrentBooking | null>(null);
  cancelReason = signal('');
  cancelNote = signal('');
  cancelLoading = signal(false);

  // Extend modal states
  showExtendModal = signal(false);
  selectedExtendBooking = signal<CurrentBooking | null>(null);
  extendHours = signal(1);
  extendMinutes = signal(0);
  extendLoading = signal(false);

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookingService.getCurrentBookings().subscribe({
      next: (response) => {
        const data = response.data || [];

        // Ensure bookings currently "Đang sử dụng" (maTrangThai === 4) are surfaced first
        this.usingBookings.set(data.filter((b) => b.maTrangThai === 4));
        this.otherBookings.set(data.filter((b) => b.maTrangThai !== 4));
        // keep a combined list for any other uses
        this.bookings.set([...this.usingBookings(), ...this.otherBookings()]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải danh sách đăng ký phòng.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/student-dashboard']);
  }

  getStatusClass(maTrangThai: number): string {
    switch (maTrangThai) {
      case 1:
        return 'status-pending'; // Chờ duyệt
      case 2:
        return 'status-approved'; // Đã duyệt
      case 3:
        return 'status-rejected'; // Từ chối
      case 4:
        return 'status-using'; // Đang sử dụng
      case 5:
        return 'status-completed'; // Hoàn thành
      default:
        return 'status-default';
    }
  }

  canCancelBooking(booking: CurrentBooking): boolean {
    // Có thể hủy khi: Chờ duyệt (1) hoặc Đã duyệt (2) nhưng chưa bắt đầu sử dụng
    return (
      booking.maTrangThai === 1 || (booking.maTrangThai === 2 && booking.minutesUntilStart > 0)
    );
  }

  openCancelModal(booking: CurrentBooking): void {
    this.selectedBooking.set(booking);
    this.cancelReason.set('');
    this.cancelNote.set('');
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.selectedBooking.set(null);
    this.cancelReason.set('');
    this.cancelNote.set('');
  }

  confirmCancel(): void {
    const booking = this.selectedBooking();
    const reason = this.cancelReason().trim();

    if (!booking || !reason) {
      alert('Vui lòng nhập lý do hủy');
      return;
    }

    this.cancelLoading.set(true);

    const payload: CancelBookingPayload = {
      lyDoHuy: reason,
      ghiChu: this.cancelNote().trim() || undefined,
    };

    this.bookingService.cancelBooking(booking.maDangKy, payload).subscribe({
      next: (response) => {
        this.message.set(response.message || 'Hủy đăng ký thành công');
        this.error.set(null); // Clear any previous errors
        this.closeCancelModal();
        this.loadBookings(); // Reload data
        this.cancelLoading.set(false);

        // Auto hide message after 5 seconds
        setTimeout(() => {
          this.message.set(null);
        }, 5000);
      },
      error: (err) => {
        this.error.set('Không thể hủy đăng ký. Vui lòng thử lại.');
        this.message.set(null); // Clear any previous success messages
        this.cancelLoading.set(false);

        // Auto hide error after 5 seconds
        setTimeout(() => {
          this.error.set(null);
        }, 5000);
      },
    });
  }

  formatDateTime = DateTimeUtils.formatDateTime;
  formatDate = DateTimeUtils.formatDate;
  formatMinutes = DateTimeUtils.formatMinutes;

  updateCancelReason(value: string): void {
    this.cancelReason.set(value);
  }

  updateCancelNote(value: string): void {
    this.cancelNote.set(value);
  }

  // Extend booking methods
  openExtendModal(booking: CurrentBooking): void {
    this.selectedExtendBooking.set(booking);
    this.extendHours.set(1);
    this.extendMinutes.set(0);
    this.showExtendModal.set(true);
  }

  closeExtendModal(): void {
    this.showExtendModal.set(false);
    this.selectedExtendBooking.set(null);
    this.extendHours.set(1);
    this.extendMinutes.set(0);
  }

  confirmExtend(): void {
    const booking = this.selectedExtendBooking();
    if (!booking) return;

    const hours = this.extendHours();
    const minutes = this.extendMinutes();

    // Validate extension time
    if (hours <= 0 && minutes <= 0) {
      alert('Vui lòng chọn thời gian gia hạn hợp lệ');
      return;
    }

    if (hours > 2 || (hours === 2 && minutes > 0)) {
      alert('Chỉ được gia hạn tối đa 2 giờ');
      return;
    }

    this.extendLoading.set(true);

    // Calculate new end time
    const currentEndTime = new Date(booking.thoiGianKetThuc);
    const extensionMs = (hours * 60 + minutes) * 60 * 1000;
    const newEndTime = new Date(currentEndTime.getTime() + extensionMs);

    const payload: ExtendBookingPayload = {
      maDangKy: booking.maDangKy,
      newEndTime: newEndTime.toISOString(),
    };

    this.bookingService.extendBooking(payload).subscribe({
      next: (response) => {
        this.message.set(response.message || 'Gia hạn phòng thành công');
        this.error.set(null);
        this.closeExtendModal();
        this.loadBookings(); // Reload data
        this.extendLoading.set(false);

        // Auto hide message after 5 seconds
        setTimeout(() => {
          this.message.set(null);
        }, 5000);
      },
      error: (err) => {
        let errorMessage = 'Không thể gia hạn phòng. Vui lòng thử lại.';

        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        }

        this.error.set(errorMessage);
        this.message.set(null);
        this.extendLoading.set(false);

        // Auto hide error after 5 seconds
        setTimeout(() => {
          this.error.set(null);
        }, 5000);
      },
    });
  }

  updateExtendHours(value: number): void {
    this.extendHours.set(value);
  }

  updateExtendMinutes(value: number): void {
    this.extendMinutes.set(value);
  }

  // Helper methods for new template
  getPendingCount(): number {
    return this.otherBookings().filter((b) => b.maTrangThai === 1).length;
  }

  getStatusIcon(status: number): string {
    switch (status) {
      case 1:
        return 'schedule';
      case 2:
        return 'check_circle';
      case 3:
        return 'cancel';
      case 4:
        return 'play_circle';
      case 5:
        return 'done_all';
      default:
        return 'help';
    }
  }

  getNewEndTime(): string {
    const booking = this.selectedExtendBooking();
    if (!booking) return '';

    const currentEnd = new Date(booking.thoiGianKetThuc);
    const hours = this.extendHours();
    const minutes = this.extendMinutes();
    const extensionMs = (hours * 60 + minutes) * 60 * 1000;
    const newEnd = new Date(currentEnd.getTime() + extensionMs);

    return this.formatDateTime(newEnd.toISOString());
  }

  // View booking detail method
  viewBookingDetail(maDangKy: number): void {
    console.log('Navigating to booking detail:', maDangKy);
    // Navigate to booking detail page
    this.router.navigate(['/booking/detail', maDangKy]);
  }
}
