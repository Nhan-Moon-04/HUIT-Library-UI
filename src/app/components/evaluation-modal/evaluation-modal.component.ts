import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EvaluationService,
  RatingDetail,
  CreateRatingPayload,
} from '../../services/evaluation.service';
import { HistoryBooking } from '../../services/booking.service';
import { DateTimeUtils } from '../../utils/datetime.utils';

export type EvaluationMode = 'create' | 'view';

@Component({
  selector: 'app-evaluation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation-modal.component.html',
  styleUrls: ['./evaluation-modal.component.css'],
})
export class EvaluationModalComponent {
  private evaluationService = inject(EvaluationService);

  // Inputs
  isVisible = input<boolean>(false);
  mode = input<EvaluationMode>('create');
  booking = input<HistoryBooking | null>(null);

  // Outputs
  closeModal = output<void>();
  evaluationSaved = output<void>();

  // State
  evaluation = signal<RatingDetail | null>(null);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  // Form state
  rating = signal<number>(0);
  comment = signal<string>('');
  hoverRating = signal<number>(0);

  constructor() {
    // Watch for booking changes and mode changes
    effect(() => {
      const currentBooking = this.booking();
      const currentMode = this.mode();

      if (currentBooking && this.isVisible()) {
        this.initializeModal();
      }
    });
  }

  private initializeModal(): void {
    const currentBooking = this.booking();
    const currentMode = this.mode();

    if (!currentBooking) return;

    this.error.set(null);
    this.rating.set(0);
    this.comment.set('');

    if (currentMode === 'view') {
      // Load existing evaluation
      if (currentBooking.daDanhGia) {
        this.loadEvaluation(currentBooking.maDangKy);
      }
    } else {
      // New evaluation
      this.rating.set(0);
      this.comment.set('');
    }
  }

  private loadEvaluation(maDangKy: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.evaluationService.getRatingByBooking(maDangKy).subscribe({
      next: (response) => {
        if (response.success && response.hasRating && response.rating) {
          this.evaluation.set(response.rating);
          this.rating.set(response.rating.diemDanhGia);
          this.comment.set(response.rating.noiDung || '');
        } else {
          this.error.set('Không thể tải thông tin đánh giá');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Lỗi khi tải thông tin đánh giá');
        this.loading.set(false);
      },
    });
  }

  setRating(value: number): void {
    if (this.mode() !== 'view') {
      this.rating.set(value);
    }
  }

  setHoverRating(value: number): void {
    this.hoverRating.set(value);
  }

  getRatingDescription(rating: number): string {
    switch (rating) {
      case 1:
        return 'Rất không hài lòng';
      case 2:
        return 'Không hài lòng';
      case 3:
        return 'Bình thường';
      case 4:
        return 'Hài lòng';
      case 5:
        return 'Rất hài lòng';
      default:
        return 'Chưa đánh giá';
    }
  }

  submitEvaluation(): void {
    const currentBooking = this.booking();

    if (!currentBooking || !this.rating() || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    // Create new rating
    const payload: CreateRatingPayload = {
      maDoiTuong: currentBooking.maPhong, // Use room ID
      maDangKy: currentBooking.maDangKy,
      diemDanhGia: this.rating(),
      noiDung: this.comment().trim() || undefined,
    };

    this.evaluationService.createRating(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.evaluationSaved.emit();
          this.close();
        } else {
          this.error.set(response.message || 'Không thể tạo đánh giá');
        }
        this.submitting.set(false);
      },
      error: (err) => {
        this.error.set('Lỗi khi tạo đánh giá');
        this.submitting.set(false);
      },
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  formatDateTime = DateTimeUtils.formatDateTime;
}
