import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    maLoaiPhong: [null as number | null, [Validators.required]],
    ngayBatDau: ['', [Validators.required]],
    gioBatDau: ['', [Validators.required]],
    lyDo: ['', [Validators.required]],
    ghiChu: [''],
    soLuong: [1, [Validators.required, Validators.min(1)]],
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
        // Check for prefilled data after room types are loaded
        this.checkForPrefilledData();
      },
      error: (err) => {
        this.error.set('Không thể tải danh sách loại phòng.');
      },
    });
  }

  private checkForPrefilledData(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['maLoaiPhong']) {
        this.form.patchValue({ maLoaiPhong: Number(params['maLoaiPhong']) });
      }

      if (params['thoiGianBatDau']) {
        const dateTime = new Date(params['thoiGianBatDau']);
        const date = dateTime.toISOString().split('T')[0];
        const time = dateTime.toTimeString().slice(0, 5);
        this.form.patchValue({
          ngayBatDau: date,
          gioBatDau: time,
        });
      }

      if (params['soLuong']) {
        this.form.patchValue({ soLuong: Number(params['soLuong']) });
      }

      if (params['maPhong']) {
        // If a specific room was selected, add it to the notes
        const roomInfo = `Phòng được chọn từ tra cứu: Mã phòng ${params['maPhong']}`;
        this.form.patchValue({ ghiChu: roomInfo });
      }
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
        hour12: false, // Use 24-hour format to avoid AM/PM confusion
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
    // NOTE: avoid converting to UTC with toISOString() because that shifts the hour
    // based on the client's timezone. The backend expects a local datetime string
    // (without 'Z') like 'YYYY-MM-DDTHH:mm:SS'. Preserve the exact minute selected
    // by the user.
    let thoiGianBatDau: string;
    if (ngayBatDau && gioBatDau) {
      // ensure seconds present
      const time =
        gioBatDau.includes(':') && gioBatDau.split(':').length === 2
          ? `${gioBatDau}:00`
          : gioBatDau;
      thoiGianBatDau = `${ngayBatDau}T${time}`; // e.g. '2025-11-04T15:39:00'
    } else {
      // fallback to current local datetime without timezone
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      thoiGianBatDau = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}:00`;
    }

    const payload: any = {
      maLoaiPhong: Number(this.form.value.maLoaiPhong),
      thoiGianBatDau: thoiGianBatDau,
      lyDo: this.form.value.lyDo || 'Không có mô tả',
      soLuong: Number(this.form.value.soLuong) || 1,
    };

    // Thêm ghiChu nếu có
    if (this.form.value.ghiChu && this.form.value.ghiChu.trim()) {
      payload.ghiChu = this.form.value.ghiChu.trim();
    }

    this.bookingService.createBooking(payload).subscribe({
      next: (res) => {
        this.success.set(res?.message || 'Yêu cầu mượn phòng đã gửi.');
        this.loading.set(false);
        this.form.reset({ soLuong: 1 });
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
