import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BookingService, LoaiPhong } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

export interface TimeSlot {
  id: string;
  startTime: string;
  duration: string;
  available: boolean;
}

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

  // Step management
  currentStep = signal(1);
  
  // Time slots data
  availableTimeSlots: TimeSlot[] = [
    { id: 'morning-1', startTime: '08:00', duration: '2 giờ', available: true },
    { id: 'morning-2', startTime: '10:00', duration: '2 giờ', available: true },
    { id: 'afternoon-1', startTime: '14:00', duration: '2 giờ', available: false },
    { id: 'afternoon-2', startTime: '16:00', duration: '2 giờ', available: true },
    { id: 'evening-1', startTime: '18:00', duration: '2 giờ', available: true },
    { id: 'evening-2', startTime: '20:00', duration: '2 giờ', available: false },
  ];
  
  selectedTimeSlot = signal<TimeSlot | null>(null);
  selectedRoomType = signal<LoaiPhong | null>(null);

  form = this.fb.group({
    maLoaiPhong: [null as number | null, [Validators.required]],
    ngayBatDau: ['', [Validators.required]],
    gioBatDau: ['', [Validators.required]],
    lyDo: ['', [Validators.required]],
    ghiChu: [''],
    soLuong: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
  });

  loading = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  roomTypes = signal<LoaiPhong[]>([]);

  ngOnInit(): void {
    this.loadRoomTypes();
    this.setMinDate();
  }

  // Step navigation methods
  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  // Step validation methods
  canProceedToStep2(): boolean {
    return this.form.get('ngayBatDau')?.valid === true && this.selectedTimeSlot() !== null;
  }

  canProceedToStep3(): boolean {
    return this.form.get('maLoaiPhong')?.valid === true;
  }

  canProceedToStep4(): boolean {
    return this.form.get('soLuong')?.valid === true && this.form.get('lyDo')?.valid === true;
  }

  // Time slot methods
  selectTimeSlot(slot: TimeSlot): void {
    if (slot.available) {
      this.selectedTimeSlot.set(slot);
      this.form.patchValue({ gioBatDau: slot.startTime });
    }
  }

  isTimeSlotSelected(slot: TimeSlot): boolean {
    return this.selectedTimeSlot()?.id === slot.id;
  }

  getSelectedTimeSlot(): TimeSlot | null {
    return this.selectedTimeSlot();
  }

  // Room selection methods
  selectRoomType(roomType: LoaiPhong): void {
    this.selectedRoomType.set(roomType);
    this.form.patchValue({ maLoaiPhong: roomType.maLoaiPhong });
  }

  isRoomTypeSelected(roomType: LoaiPhong): boolean {
    return this.selectedRoomType()?.maLoaiPhong === roomType.maLoaiPhong;
  }

  // Utility methods
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  setMinDate(): void {
    const today = this.getTodayDate();
    this.form.patchValue({ ngayBatDau: today });
  }

  goBack(): void {
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
        const roomTypeId = Number(params['maLoaiPhong']);
        const roomType = this.roomTypes().find(rt => rt.maLoaiPhong === roomTypeId);
        if (roomType) {
          this.selectRoomType(roomType);
        }
      }

      if (params['thoiGianBatDau']) {
        const dateTime = new Date(params['thoiGianBatDau']);
        const date = dateTime.toISOString().split('T')[0];
        const time = dateTime.toTimeString().slice(0, 5);
        this.form.patchValue({
          ngayBatDau: date,
          gioBatDau: time,
        });
        
        // Find matching time slot
        const matchingSlot = this.availableTimeSlots.find(slot => slot.startTime === time);
        if (matchingSlot) {
          this.selectTimeSlot(matchingSlot);
        }
      }

      if (params['soLuong']) {
        this.form.patchValue({ soLuong: Number(params['soLuong']) });
      }

      if (params['maPhong']) {
        const roomInfo = `Phòng được chọn từ tra cứu: Mã phòng ${params['maPhong']}`;
        this.form.patchValue({ ghiChu: roomInfo });
      }
    });
  }

  getSelectedRoomType(): LoaiPhong | undefined {
    return this.selectedRoomType() || undefined;
  }

  getFormattedDateTime(): string {
    const ngay = this.form.value.ngayBatDau;
    const timeSlot = this.selectedTimeSlot();
    if (!ngay || !timeSlot) return '-';

    try {
      const date = new Date(`${ngay}T${timeSlot.startTime}`);
      return date.toLocaleString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return `${ngay} ${timeSlot.startTime}`;
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

    const ngayBatDau = this.form.value.ngayBatDau as string;
    const timeSlot = this.selectedTimeSlot();

    let thoiGianBatDau: string;
    if (ngayBatDau && timeSlot) {
      thoiGianBatDau = `${ngayBatDau}T${timeSlot.startTime}:00`;
    } else {
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

    if (this.form.value.ghiChu && this.form.value.ghiChu.trim()) {
      payload.ghiChu = this.form.value.ghiChu.trim();
    }

    this.bookingService.createBooking(payload).subscribe({
      next: (res) => {
        this.success.set(res?.message || 'Yêu cầu đặt phòng đã được gửi thành công!');
        this.loading.set(false);
        this.form.reset({ soLuong: 1 });
        this.selectedTimeSlot.set(null);
        this.selectedRoomType.set(null);
        this.currentStep.set(1);
        
        // Auto redirect after success
        setTimeout(() => {
          this.goBack();
        }, 3000);
      },
      error: (err) => {
        let msg = 'Lỗi khi gửi yêu cầu đặt phòng.';
        const body = err?.error;
        if (!body) {
          msg = err?.message || msg;
        } else if (typeof body === 'string') {
          msg = body;
        } else if (body.message) {
          msg = body.message;
        } else if (body.errors && typeof body.errors === 'object') {
          const parts: string[] = [];
          for (const k of Object.keys(body.errors)) {
            const v = body.errors[k];
            if (Array.isArray(v)) parts.push(...v.map((s) => `${k}: ${s}`));
            else parts.push(`${k}: ${v}`);
          }
          msg = parts.join('\n');
        } else {
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
