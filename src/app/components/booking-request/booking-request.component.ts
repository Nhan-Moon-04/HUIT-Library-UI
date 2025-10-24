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
    ngayBatDau: ['', [Validators.required]],
    gioBatDau: ['', [Validators.required]],
    lyDo: [''],
  });

  loading = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  roomTypes = signal<LoaiPhong[]>([]);

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  goBack(): void {
    // navigate back to main dashboard
    // using router via window.location fallback to keep this component standalone-friendly
    try {
      window.history.back();
    } catch (e) {
      window.location.href = '/';
    }
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

  getFormattedDateTime(): string {
    const ngay = this.form.value.ngayBatDau;
    const gio = this.form.value.gioBatDau;
    if (!ngay || !gio) return '-';

    try {
      const date = new Date(`${ngay}T${gio}`);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return `${ngay} ${gio}`;
    }
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

    const ngayBatDau = this.form.value.ngayBatDau as string | null | undefined;
    const gioBatDau = this.form.value.gioBatDau as string | null | undefined;

    // Kết hợp ngày và giờ
    let thoiGianBatDau: string;
    if (ngayBatDau && gioBatDau) {
      thoiGianBatDau = new Date(`${ngayBatDau}T${gioBatDau}`).toISOString();
    } else {
      thoiGianBatDau = new Date().toISOString();
    }

    const payload = {
      maLoaiPhong: Number(this.form.value.maLoaiPhong),
      thoiGianBatDau: thoiGianBatDau,
      lyDo: this.form.value.lyDo || 'Không có mô tả',
    } as const;

    this.bookingService.createBooking(payload).subscribe({
      next: (res) => {
        this.success.set(res?.message || 'Yêu cầu mượn phòng đã gửi.');
        this.loading.set(false);
        this.form.reset();
      },
      error: (err) => {
        // Try to extract detailed error information from API
        let msg = 'Lỗi khi gửi yêu cầu.';
        const body = err?.error;
        if (!body) {
          msg = err?.message || msg;
        } else if (typeof body === 'string') {
          msg = body;
        } else if (body.message) {
          msg = body.message;
        } else if (body.errors && typeof body.errors === 'object') {
          // model validation object: collect messages
          const parts: string[] = [];
          for (const k of Object.keys(body.errors)) {
            const v = body.errors[k];
            if (Array.isArray(v)) parts.push(...v.map((s) => `${k}: ${s}`));
            else parts.push(`${k}: ${v}`);
          }
          msg = parts.join(' \n ');
        } else {
          // fallback to JSON stringify for developer-friendly info
          try {
            msg = JSON.stringify(body);
          } catch (e) {
            msg = String(body);
          }
        }
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }
}
