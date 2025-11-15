import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  BookingService,
  BookingDetail as BookingDetailData,
  BookingDetailResponse,
} from '../../services/booking.service';
import { DateTimeUtils } from '../../utils/datetime.utils';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.css',
})
export class BookingDetailComponent implements OnInit {
  private bookingService = inject(BookingService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);

  bookingDetail = signal<BookingDetailData | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

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
        return 'status-completed';
      default:
        return 'status-default';
    }
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
}
