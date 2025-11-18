import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ViolationService,
  ViolationDetail,
  ViolationDetailResponse,
} from '../../services/violation.service';
import { DateTimeUtils } from '../../utils/datetime.utils';

@Component({
  selector: 'app-violation-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './violation-detail.component.html',
  styleUrl: './violation-detail.component.css',
})
export class ViolationDetailComponent implements OnInit {
  private violationService = inject(ViolationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  violationDetail = signal<ViolationDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  violationId = signal<number>(0);

  ngOnInit(): void {
    // Get violation ID from route parameters
    this.route.params.subscribe((params) => {
      const maViPham = +params['id'];
      if (maViPham) {
        this.violationId.set(maViPham);
        this.loadViolationDetail(maViPham);
      } else {
        this.error.set('ID vi phạm không hợp lệ');
        this.loading.set(false);
      }
    });
  }

  loadViolationDetail(maViPham?: number): void {
    this.loading.set(true);
    this.error.set(null);

    const id = maViPham || this.violationId();
    if (!id) {
      this.error.set('Không tìm thấy ID vi phạm');
      this.loading.set(false);
      return;
    }

    this.violationService.getViolationDetail(id).subscribe({
      next: (response: ViolationDetailResponse) => {
        if (response.success) {
          this.violationDetail.set(response.data);
        } else {
          this.error.set(response.message || 'Không thể tải chi tiết vi phạm');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Đã xảy ra lỗi khi tải chi tiết vi phạm');
        this.loading.set(false);
      },
    });
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

  getSeverity(): string {
    const detail = this.violationDetail();
    if (!detail) return 'Không xác định';

    return this.violationService.getViolationSeverity(detail.tenViPham);
  }

  getSeverityColor(): string {
    return this.violationService.getSeverityColor(this.getSeverity());
  }

  getSeverityClass(): string {
    const severity = this.getSeverity();
    switch (severity.toLowerCase()) {
      case 'nghiêm trọng':
        return 'severity-high';
      case 'trung bình':
        return 'severity-medium';
      case 'nhẹ':
        return 'severity-low';
      default:
        return 'severity-unknown';
    }
  }

  goBack(): void {
    const detail = this.violationDetail();
    if (detail?.maDangKy) {
      this.router.navigate(['/booking/detail', detail.maDangKy]);
    } else {
      this.router.navigate(['/bookings/history']);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/student-dashboard']);
  }

  goToBookingDetail(): void {
    const detail = this.violationDetail();
    if (detail?.maDangKy) {
      this.router.navigate(['/booking/detail', detail.maDangKy]);
    }
  }

  printViolation(): void {
    window.print();
  }

  getViolationStatusColor = this.violationService.getViolationStatusColor;
  getViolationStatusIcon = this.violationService.getViolationStatusIcon;
  formatViolationDate = this.violationService.formatViolationDate;
  formatDateTime = DateTimeUtils.formatDateTime;
  formatDate = DateTimeUtils.formatDate;
}
