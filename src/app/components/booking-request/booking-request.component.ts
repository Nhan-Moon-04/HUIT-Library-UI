import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BookingService, LoaiPhong } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-request.component.html',
  styleUrls: ['./booking-request.component.css'],
})
export class BookingRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private auth = inject(AuthService);

  form = this.fb.group({
    maLoaiPhong: [null, [Validators.required]],
    thoiGianBatDau: ['', [Validators.required]],
    thoiGianKetThuc: ['', [Validators.required]],
    lyDo: [''],
  });

  loading = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  roomTypes = signal<LoaiPhong[]>([]);

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  loadRoomTypes(): void {
    this.bookingService.getRoomTypes().subscribe({
      next: (types) => {
        this.roomTypes.set(types);
      },
      error: (err) => {
        this.error.set('Không thể tải danh sách loại phòng.');
      },
    });
  }

  getSelectedRoomType(): LoaiPhong | undefined {
    const selectedId = Number(this.form.get('maLoaiPhong')?.value);
    return this.roomTypes().find((rt) => rt.maLoaiPhong === selectedId);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser();
    if (!user) {
      this.error.set('Bạn cần đăng nhập để gửi yêu cầu.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const startRaw = this.form.value.thoiGianBatDau as string | null | undefined;
    const endRaw = this.form.value.thoiGianKetThuc as string | null | undefined;

    const payload = {
      maLoaiPhong: Number(this.form.value.maLoaiPhong),
      thoiGianBatDau: startRaw ? new Date(startRaw).toISOString() : new Date().toISOString(),
      thoiGianKetThuc: endRaw ? new Date(endRaw).toISOString() : new Date().toISOString(),
      lyDo: this.form.value.lyDo || undefined,
    } as const;

    this.bookingService.createBooking(payload).subscribe({
      next: (res) => {
        this.success.set(res?.message || 'Yêu cầu mượn phòng đã gửi.');
        this.loading.set(false);
        this.form.reset();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Lỗi khi gửi yêu cầu.');
        this.loading.set(false);
      },
    });
  }
}
