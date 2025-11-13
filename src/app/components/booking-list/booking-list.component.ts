import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BookingService,
  CurrentBooking,
  CancelBookingPayload,
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
    this.router.navigate(['/dashboard']);
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
}
