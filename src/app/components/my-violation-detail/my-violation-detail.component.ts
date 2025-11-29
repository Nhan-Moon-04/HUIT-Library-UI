import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MyViolationService } from '../../services/my-violation.service';
import { MyViolationDetail } from '../../models/my-violation.model';
import { DateTimeUtils } from '../../utils/datetime.utils';

@Component({
  selector: 'app-my-violation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-violation-detail.component.html',
  styleUrls: ['./my-violation-detail.component.css'],
})
export class MyViolationDetailComponent implements OnInit {
  private violationService = inject(MyViolationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  violationDetail = signal<MyViolationDetail | null>(null);
  loading = signal<boolean>(false);
  error = signal<string>('');
  maViPham = signal<number>(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.maViPham.set(Number(id));
      this.loadViolationDetail();
    } else {
      this.error.set('Mã vi phạm không hợp lệ');
    }
  }

  loadViolationDetail(): void {
    this.loading.set(true);
    this.error.set('');

    this.violationService.getViolationDetail(this.maViPham()).subscribe({
      next: (response) => {
        if (response.success) {
          this.violationDetail.set(response.data);
        } else {
          this.error.set('Không thể tải chi tiết vi phạm');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading violation detail:', err);
        this.error.set('Có lỗi xảy ra khi tải chi tiết vi phạm');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/my-violations']);
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

  refresh(): void {
    this.loadViolationDetail();
  }
}
