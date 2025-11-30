import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BookingService, LoaiPhong, RoomCapacityLimit } from '../../services/booking.service';
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

  // Step management
  currentStep = signal(1);

  selectedRoomType = signal<LoaiPhong | null>(null);
  form = this.fb.group({
    maLoaiPhong: [null as number | null, [Validators.required]],
    ngayBatDau: ['', [Validators.required]],
    gioBatDau: ['08:00', [Validators.required]],
    lyDo: ['', [Validators.required]],
    ghiChu: [''],
    soLuong: [1, [Validators.required, Validators.min(1)]],
  });

  loading = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);
  roomTypes = signal<LoaiPhong[]>([]);
  capacityLimits = signal<RoomCapacityLimit[]>([]);

  ngOnInit(): void {
    this.loadRoomTypes();
    this.loadCapacityLimits();
    this.setMinDate();
    this.setupFormListeners();
    // Set default time to 8:00
    this.form.patchValue({ gioBatDau: '08:00' });
  }

  // Setup form listeners
  setupFormListeners(): void {
    // Listen for date changes
    this.form.get('ngayBatDau')?.valueChanges.subscribe((newDate) => {
      if (newDate) {
        console.log('Date changed:', newDate);
      }
    });
  }

  // Modern Time Picker Methods
  getDisplayTime(): string {
    const time = this.form.get('gioBatDau')?.value;
    return time || '08:00';
  }

  getMinTimeValue(): number {
    return 8 * 60; // 8:00 = 480 minutes from midnight
  }

  getMaxTimeValue(): number {
    return 21 * 60 + 30; // 21:30 = 1290 minutes from midnight
  }

  getCurrentTimeValue(): number {
    const timeStr = this.form.get('gioBatDau')?.value || '08:00';
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  onTimeSliderChange(event: any): void {
    const minutes = parseInt(event.target.value);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    this.form.patchValue({ gioBatDau: timeString });
  }

  selectQuickTime(time: string): void {
    this.form.patchValue({ gioBatDau: time });
  }

  isQuickTimeSelected(time: string): boolean {
    return this.form.get('gioBatDau')?.value === time;
  }

  // Time picker validation
  private isValidTime(time: string): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 8 * 60; // 8:00 AM
    const endMinutes = 21 * 60 + 30; // 9:30 PM

    return totalMinutes >= startMinutes && totalMinutes <= endMinutes && minutes % 30 === 0;
  }

  // Check if selected date/time is in the past
  isDateTimeInPast(): boolean {
    const selectedDate = this.form.get('ngayBatDau')?.value;
    const selectedTime = this.form.get('gioBatDau')?.value;

    if (!selectedDate || !selectedTime) {
      return false; // Don't show error if fields are empty
    }

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const currentDateTime = new Date();

    return selectedDateTime <= currentDateTime;
  }

  // Get minimum capacity from API capacity limits
  getMinCapacity(): number {
    const selectedRoomType = this.selectedRoomType();
    if (!selectedRoomType) return 1;

    const limit = this.capacityLimits().find((l) => l.maLoaiPhong === selectedRoomType.maLoaiPhong);

    return limit ? limit.soLuongToiThieu : 1;
  }

  // Get maximum capacity from API capacity limits
  getMaxCapacity(): number {
    const selectedRoomType = this.selectedRoomType();
    if (!selectedRoomType) return 50;

    const limit = this.capacityLimits().find((l) => l.maLoaiPhong === selectedRoomType.maLoaiPhong);

    return limit ? limit.soLuongToiDa : Number(selectedRoomType.soLuongChoNgoi);
  }

  // Check if current capacity is valid
  isCapacityValid(): boolean {
    const selectedRoomType = this.selectedRoomType();
    const soLuong = this.form.get('soLuong')?.value;

    if (!selectedRoomType || !soLuong) return true; // Don't validate if incomplete

    const minCapacity = this.getMinCapacity();
    const maxCapacity = this.getMaxCapacity();

    return soLuong >= minCapacity && soLuong <= maxCapacity;
  }

  // Get capacity validation error message
  getCapacityErrorMessage(): string {
    const selectedRoomType = this.selectedRoomType();
    const soLuong = this.form.get('soLuong')?.value;

    if (!selectedRoomType || !soLuong) return '';

    const minCapacity = this.getMinCapacity();
    const maxCapacity = this.getMaxCapacity();

    const limit = this.capacityLimits().find((l) => l.maLoaiPhong === selectedRoomType.maLoaiPhong);

    if (soLuong < minCapacity) {
      return limit?.moTa || `Số lượng người tham gia phải ít nhất ${minCapacity} người.`;
    }

    if (soLuong > maxCapacity) {
      return limit?.moTa || `Số lượng người tham gia không được vượt quá ${maxCapacity} người.`;
    }

    return '';
  } // Step navigation methods
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

  // Navigate to specific step (only backward navigation allowed)
  goToStep(step: number): void {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  // Step validation methods
  canProceedToStep2(): boolean {
    return (
      this.form.get('ngayBatDau')?.valid === true && this.form.get('gioBatDau')?.valid === true
    );
  }

  canProceedToStep3(): boolean {
    return this.form.get('maLoaiPhong')?.valid === true;
  }

  canProceedToStep4(): boolean {
    return (
      this.form.get('soLuong')?.valid === true &&
      this.form.get('lyDo')?.valid === true &&
      this.isCapacityValid()
    );
  }

  // Room selection methods
  selectRoomType(roomType: LoaiPhong): void {
    this.selectedRoomType.set(roomType);
    this.form.patchValue({ maLoaiPhong: roomType.maLoaiPhong });

    // Get capacity limits from API
    const limit = this.capacityLimits().find((l) => l.maLoaiPhong === roomType.maLoaiPhong);

    const minCapacity = limit ? limit.soLuongToiThieu : 1;
    const maxCapacity = limit ? limit.soLuongToiDa : Number(roomType.soLuongChoNgoi);

    // Reset capacity to minimum when room type changes
    this.form.patchValue({ soLuong: minCapacity });

    // Update capacity field validation
    const soLuongControl = this.form.get('soLuong');
    soLuongControl?.setValidators([
      Validators.required,
      Validators.min(minCapacity),
      Validators.max(maxCapacity),
    ]);
    soLuongControl?.updateValueAndValidity();
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

  loadCapacityLimits(): void {
    this.bookingService.getRoomCapacityLimits().subscribe({
      next: (limits) => {
        this.capacityLimits.set(limits);
      },
      error: (err) => {
        console.error('Không thể tải giới hạn số lượng người:', err);
        // Không hiển thị error cho user vì đây không phải là critical error
      },
    });
  }

  private checkForPrefilledData(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['maLoaiPhong']) {
        const roomTypeId = Number(params['maLoaiPhong']);
        const roomType = this.roomTypes().find((rt) => rt.maLoaiPhong === roomTypeId);
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

        // Update time picker from prefilled data
        // No additional action needed as form already updated
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
    const gio = this.form.value.gioBatDau;
    if (!ngay || !gio) return '-';

    try {
      const date = new Date(`${ngay}T${gio}`);
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

    const ngayBatDau = this.form.value.ngayBatDau as string;
    const gioBatDau = this.form.value.gioBatDau as string;

    let thoiGianBatDau: string;
    if (ngayBatDau && gioBatDau) {
      thoiGianBatDau = `${ngayBatDau}T${gioBatDau}:00`;
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
        this.form.reset({ soLuong: 1, gioBatDau: '08:00' });
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
