import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  BookingService,
  BookingDetail as BookingDetailData,
  BookingDetailResponse,
  CancelBookingPayload,
  CancelBookingResponse,
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
        } else {
          alert('Không thể hủy đặt phòng: ' + response.message);
        }
        this.cancelSubmitting.set(false);
      },
      error: (err) => {
        alert('Đã xảy ra lỗi khi hủy đặt phòng: ' + (err.error?.message || err.message));
        this.cancelSubmitting.set(false);
      },
    });
  }
}
