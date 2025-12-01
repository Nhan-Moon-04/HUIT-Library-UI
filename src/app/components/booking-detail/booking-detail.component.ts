import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  BookingService,
  BookingDetail as BookingDetailData,
  BookingDetailResponse,
  CancelBookingPayload,
  CancelBookingResponse,
  ExtendBookingPayload,
  ExtendBookingResponse,
} from '../../services/booking.service';
import {
  ViolationService,
  ViolationListItem,
  ViolationDetailResponse,
} from '../../services/violation.service';
import { DateTimeUtils } from '../../utils/datetime.utils';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.css',
})
export class BookingDetailComponent implements OnInit {
  private bookingService = inject(BookingService);
  private violationService = inject(ViolationService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  bookingDetail = signal<BookingDetailData | null>(null);
  violations = signal<ViolationListItem[]>([]);
  loading = signal(true);
  loadingViolations = signal(false);
  error = signal<string | null>(null);

  // Cancel modal state
  showCancelModal = signal(false);
  cancelReason = signal('');
  cancelNote = signal('');
  cancelSubmitting = signal(false);

  // Extend state
  showExtendConfirmModal = signal(false);
  extendSubmitting = signal(false);
  pendingExtendEndTime = signal<Date | null>(null);

  // Notification state
  showNotification = signal(false);
  notificationType = signal<'success' | 'error' | 'warning'>('success');
  notificationTitle = signal('');
  notificationMessage = signal('');

  ngOnInit(): void {
    // Get booking ID from route parameters
    this.route.params.subscribe((params) => {
      const maDangKy = +params['id'];
      if (maDangKy) {
        this.loadBookingDetail(maDangKy);
      } else {
        this.error.set('ID phiếu đặt phòng không hợp lệ');
        this.loading.set(false);
      }
    });
  }

  loadBookingDetail(maDangKy?: number): void {
    this.loading.set(true);
    this.error.set(null);

    const id = maDangKy || this.bookingDetail()?.maDangKy;
    if (!id) {
      this.error.set('Không tìm thấy ID phiếu đặt phòng');
      this.loading.set(false);
      return;
    }

    this.bookingService.getBookingDetail(id).subscribe({
      next: (response: BookingDetailResponse) => {
        if (response.success) {
          this.bookingDetail.set(response.data);
          // Load violations for this booking
          this.loadViolations(id);
        } else {
          this.error.set('Không thể tải chi tiết phiếu đặt phòng');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Đã xảy ra lỗi khi tải chi tiết phiếu đặt phòng');
        this.loading.set(false);
      },
    });
  }

  loadViolations(maDangKy: number): void {
    this.loadingViolations.set(true);
    this.violationService.getViolationsByBooking(maDangKy).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.violations.set(response.data);
        } else {
          this.violations.set([]);
        }
        this.loadingViolations.set(false);
      },
      error: (err) => {
        console.error('Error loading violations:', err);
        this.violations.set([]);
        this.loadingViolations.set(false);
      },
    });
  }

  viewViolationDetail(maViPham: number): void {
    // Navigate to violation detail page
    this.router.navigate(['/violation/detail', maViPham]);
  }

  getViolationStatusColor = this.violationService.getViolationStatusColor;
  getViolationStatusIcon = this.violationService.getViolationStatusIcon;
  formatViolationDate = this.violationService.formatViolationDate;

  getStatusClass(status: number): string {
    switch (status) {
      case 1:
        return 'status-pending';
      case 2:
        return 'status-approved';
      case 3:
        return 'status-rejected';
      case 4:
        return 'status-using';
      case 5:
      case 6:
        return 'status-completed';
      default:
        return 'status-default';
    }
  }

  getStatusIcon(status: number): string {
    switch (status) {
      case 1:
        return 'fa-clock';
      case 2:
        return 'fa-check-circle';
      case 3:
        return 'fa-times-circle';
      case 4:
        return 'fa-play-circle';
      case 5:
      case 6:
        return 'fa-flag-checkered';
      default:
        return 'fa-question-circle';
    }
  }

  hasViolations(): boolean {
    return this.violations().length > 0;
  }

  getRoomStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'tốt':
      case 'bình thường':
        return 'status-good';
      case 'đang sử dụng':
        return 'status-using';
      case 'đã trả':
        return 'status-returned';
      case 'có vấn đề':
        return 'status-issue';
      default:
        return 'status-neutral';
    }
  }

  getViolationStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'chưa xử lý':
        return 'status-pending';
      case 'đang xử lý':
        return 'status-processing';
      case 'đã xử lý':
        return 'status-resolved';
      default:
        return 'status-unknown';
    }
  }

  canShowActions(): boolean {
    return this.canExtend() || this.canCancel();
  }

  canExtend(): boolean {
    const detail = this.bookingDetail();
    if (!detail) return false;
    // Can extend if status is 'using' (4)
    return detail.maTrangThai === 4;
  }

  canCancel(): boolean {
    const detail = this.bookingDetail();
    if (!detail) return false;
    // Can cancel if pending (1) or approved (2)
    return detail.maTrangThai === 1 || detail.maTrangThai === 2;
  }

  formatDateTime = DateTimeUtils.formatDateTime;
  formatDate = DateTimeUtils.formatDate;

  // Cancel booking functionality
  openCancelModal(): void {
    this.showCancelModal.set(true);
    this.cancelReason.set('');
    this.cancelNote.set('');
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.cancelReason.set('');
    this.cancelNote.set('');
  }

  submitCancelBooking(): void {
    const detail = this.bookingDetail();
    const reason = this.cancelReason().trim();

    if (!detail || !reason) {
      return;
    }

    this.cancelSubmitting.set(true);

    const payload: CancelBookingPayload = {
      lyDoHuy: reason,
      ghiChu: this.cancelNote().trim() || undefined,
    };

    this.bookingService.cancelBooking(detail.maDangKy, payload).subscribe({
      next: (response) => {
        if (response.success) {
          // Reload booking detail to get updated status
          this.loadBookingDetail();
          this.closeCancelModal();
          this.showSuccessNotification(
            'Hủy đặt phòng thành công!',
            'Phòng đã được hủy thành công.'
          );
        } else {
          this.showErrorNotification(
            'Không thể hủy đặt phòng',
            response.message || 'Có lỗi xảy ra khi hủy đặt phòng.'
          );
        }
        this.cancelSubmitting.set(false);
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Đã xảy ra lỗi khi hủy đặt phòng';
        this.showErrorNotification('Lỗi hủy đặt phòng', errorMessage);
        this.cancelSubmitting.set(false);
      },
    });
  }

  // Extend booking functionality - auto extend 2 hours
  confirmExtendBooking(): void {
    const detail = this.bookingDetail();
    if (!detail) return;

    console.log('Current end time string:', detail.thoiGianKetThuc);

    // Parse the date string properly
    const currentEndTime = new Date(detail.thoiGianKetThuc);
    console.log('Parsed current end time:', currentEndTime);
    console.log('Current end time timestamp:', currentEndTime.getTime());

    // Add 2 hours (2 * 60 * 60 * 1000 milliseconds)
    const newEndTime = new Date(currentEndTime.getTime() + 2 * 60 * 60 * 1000);
    console.log('New end time:', newEndTime);
    console.log('New end time timestamp:', newEndTime.getTime());

    this.pendingExtendEndTime.set(newEndTime);
    this.showExtendConfirmModal.set(true);
  }

  closeExtendConfirmModal(): void {
    this.showExtendConfirmModal.set(false);
    this.pendingExtendEndTime.set(null);
  }

  proceedWithExtend(): void {
    const newEndTime = this.pendingExtendEndTime();
    if (newEndTime) {
      this.submitExtendBooking(newEndTime);
      this.closeExtendConfirmModal();
    }
  }

  getFormattedNewEndTime(): string {
    const newEndTime = this.pendingExtendEndTime();
    if (!newEndTime) return '';

    console.log('Formatting new end time:', newEndTime);

    // Format as SQL datetime string that DateTimeUtils expects
    const year = newEndTime.getFullYear();
    const month = String(newEndTime.getMonth() + 1).padStart(2, '0');
    const day = String(newEndTime.getDate()).padStart(2, '0');
    const hours = String(newEndTime.getHours()).padStart(2, '0');
    const minutes = String(newEndTime.getMinutes()).padStart(2, '0');
    const seconds = String(newEndTime.getSeconds()).padStart(2, '0');

    const sqlDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000`;
    console.log('SQL format datetime:', sqlDateTime);

    return DateTimeUtils.formatDateTime(sqlDateTime);
  }

  // Notification methods
  showSuccessNotification(title: string, message: string): void {
    this.notificationType.set('success');
    this.notificationTitle.set(title);
    this.notificationMessage.set(message);
    this.showNotification.set(true);

    // Auto hide after 5 seconds
    setTimeout(() => {
      this.closeNotification();
    }, 5000);
  }

  showErrorNotification(title: string, message: string): void {
    this.notificationType.set('error');
    this.notificationTitle.set(title);
    this.notificationMessage.set(message);
    this.showNotification.set(true);
  }

  showWarningNotification(title: string, message: string): void {
    this.notificationType.set('warning');
    this.notificationTitle.set(title);
    this.notificationMessage.set(message);
    this.showNotification.set(true);
  }

  closeNotification(): void {
    this.showNotification.set(false);
  }

  goBack(): void {
    // Always navigate to booking history to avoid navigation issues
    this.router.navigate(['/bookings/history']);
  }

  private submitExtendBooking(newEndTime: Date): void {
    const detail = this.bookingDetail();
    if (!detail) return;

    this.extendSubmitting.set(true);

    const payload: ExtendBookingPayload = {
      maDangKy: detail.maDangKy,
      newEndTime: newEndTime.toISOString(),
    };

    this.bookingService.extendBooking(payload).subscribe({
      next: (response) => {
        if (response.success) {
          // Reload booking detail to get updated time
          this.loadBookingDetail();
          this.showSuccessNotification(
            'Gia hạn thành công!',
            response.message || 'Phòng đã được gia hạn thêm 2 giờ.'
          );
        } else {
          this.showErrorNotification(
            'Không thể gia hạn',
            response.message || 'Có lỗi xảy ra khi gia hạn phòng.'
          );
        }
        this.extendSubmitting.set(false);
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Đã xảy ra lỗi khi gia hạn';
        this.showErrorNotification('Lỗi gia hạn', errorMessage);
        this.extendSubmitting.set(false);
      },
    });
  }
}
