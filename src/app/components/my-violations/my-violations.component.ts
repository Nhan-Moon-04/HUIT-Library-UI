import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MyViolationService } from '../../services/my-violation.service';
import { MyViolation } from '../../models/my-violation.model';
import { DateTimeUtils } from '../../utils/datetime.utils';

@Component({
  selector: 'app-my-violations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-violations.component.html',
  styleUrls: ['./my-violations.component.css'],
})
export class MyViolationsComponent implements OnInit {
  private violationService = inject(MyViolationService);
  private router = inject(Router);

  // Signals
  violations = signal<MyViolation[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');
  totalRecords = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Computed signals for stats
  pendingCount = computed(
    () => this.violations().filter((v) => v.trangThaiXuLy === 'Chưa xử lý').length
  );

  processingCount = computed(
    () => this.violations().filter((v) => v.trangThaiXuLy === 'Đang xử lý').length
  );

  completedCount = computed(
    () => this.violations().filter((v) => v.trangThaiXuLy === 'Đã xử lý').length
  );

  ngOnInit(): void {
    this.loadViolations();
  }

  loadViolations(): void {
    this.loading.set(true);
    this.error.set('');

    this.violationService.getMyViolations(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        if (response.success) {
          this.violations.set(response.data);
          this.totalRecords.set(response.total);
        } else {
          this.error.set('Không thể tải danh sách vi phạm');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading violations:', err);
        this.error.set('Có lỗi xảy ra khi tải danh sách vi phạm');
        this.loading.set(false);
      },
    });
  }

  viewDetail(maViPham: number): void {
    this.router.navigate(['/my-violations/detail', maViPham]);
  }

  goToBookingDetail(maDangKy: number): void {
    this.router.navigate(['/booking/detail', maDangKy]);
  }

  formatDate(dateString: string): string {
    return DateTimeUtils.formatDateTime(dateString);
  }

  getStatusColor(trangThaiXuLy: string): string {
    return this.violationService.getStatusColor(trangThaiXuLy);
  }

  getStatusIcon(trangThaiXuLy: string): string {
    return this.violationService.getStatusIcon(trangThaiXuLy);
  }

  getStatusClass(trangThaiXuLy: string): string {
    return this.violationService.getStatusClass(trangThaiXuLy);
  }

  goBack(): void {
    this.router.navigate(['/student-dashboard']);
  }

  refresh(): void {
    this.currentPage.set(1);
    this.loadViolations();
  }
}
