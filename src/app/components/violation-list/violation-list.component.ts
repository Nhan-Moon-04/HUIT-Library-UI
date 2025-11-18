import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ViolationService,
  ViolationListItem,
  ViolationListResponse,
  ViolationDetailResponse,
} from '../../services/violation.service';

@Component({
  selector: 'app-violation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './violation-list.component.html',
  styleUrls: ['./violation-list.component.css'],
})
export class ViolationListComponent implements OnInit {
  private violationService = inject(ViolationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  violations = signal<ViolationListItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  bookingId = signal<number>(0);

  ngOnInit(): void {
    // Get booking ID from route parameters
    this.route.params.subscribe((params) => {
      const maDangKy = +params['bookingId'];
      if (maDangKy) {
        this.bookingId.set(maDangKy);
        this.loadViolations(maDangKy);
      } else {
        this.error.set('ID phiếu đặt phòng không hợp lệ');
        this.loading.set(false);
      }
    });
  }

  loadViolations(maDangKy: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.violationService.getViolationsByBooking(maDangKy).subscribe({
      next: (response: ViolationListResponse) => {
        if (response.success) {
          this.violations.set(response.data);
        } else {
          this.error.set('Không thể tải danh sách vi phạm');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Đã xảy ra lỗi khi tải danh sách vi phạm');
        this.loading.set(false);
      },
    });
  }

  viewViolationDetail(maViPham: number): void {
    // Navigate to violation detail page
    this.router.navigate(['/violation/detail', maViPham]);
  }

  goBack(): void {
    this.router.navigate(['/bookings/detail', this.bookingId()]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getViolationStatusColor = this.violationService.getViolationStatusColor;
  getViolationStatusIcon = this.violationService.getViolationStatusIcon;
  formatViolationDate = this.violationService.formatViolationDate;
}
