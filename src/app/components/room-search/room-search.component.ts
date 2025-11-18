import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService, LoaiPhong } from '../../services/booking.service';
import { RoomSearchService } from '../../services/room-search.service';
import { AvailableRoom, RoomDetail } from '../../models/room-search.model';

@Component({
  selector: 'app-room-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './room-search.component.html',
  styleUrls: ['./room-search.component.css'],
})
export class RoomSearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private roomSearchService = inject(RoomSearchService);
  private router = inject(Router);

  searchForm: FormGroup;
  roomTypes = signal<LoaiPhong[]>([]);
  availableRooms = signal<AvailableRoom[]>([]);
  selectedRoomDetail = signal<RoomDetail | null>(null);
  isLoading = signal(false);
  isSearching = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.searchForm = this.fb.group({
      maLoaiPhong: [null, Validators.required],
      thoiGianBatDau: ['', Validators.required],
      thoiGianSuDung: [1, [Validators.required, Validators.min(1), Validators.max(8)]],
      sucChuaToiThieu: [1, [Validators.required, Validators.min(1)]],
    });

    // Set default date and time to current date + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const defaultDateTime = now.toISOString().slice(0, 16);
    this.searchForm.patchValue({ thoiGianBatDau: defaultDateTime });
  }

  ngOnInit() {
    this.loadRoomTypes();
  }

  private loadRoomTypes() {
    this.isLoading.set(true);
    this.bookingService.getRoomTypes().subscribe({
      next: (roomTypes) => {
        this.roomTypes.set(roomTypes);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading room types:', error);
        this.errorMessage.set('Không thể tải danh sách loại phòng');
        this.isLoading.set(false);
      },
    });
  }

  onSearch() {
    if (this.searchForm.valid) {
      this.isSearching.set(true);
      this.errorMessage.set(null);
      this.selectedRoomDetail.set(null);

      const searchRequest = {
        ...this.searchForm.value,
        thoiGianBatDau: new Date(this.searchForm.value.thoiGianBatDau).toISOString(),
      };

      this.roomSearchService.searchAvailableRooms(searchRequest).subscribe({
        next: (response) => {
          this.availableRooms.set(response.data || []);
          this.isSearching.set(false);

          if (response.data && response.data.length === 0) {
            this.errorMessage.set('Không tìm thấy phòng trống phù hợp với yêu cầu');
          }
        },
        error: (error) => {
          console.error('Error searching rooms:', error);
          this.errorMessage.set('Có lỗi xảy ra khi tìm kiếm phòng');
          this.isSearching.set(false);
          this.availableRooms.set([]);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onRoomClick(room: AvailableRoom) {
    this.isLoading.set(true);
    this.roomSearchService.getRoomDetail(room.maPhong).subscribe({
      next: (response) => {
        this.selectedRoomDetail.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading room detail:', error);
        this.errorMessage.set('Không thể tải chi tiết phòng');
        this.isLoading.set(false);
      },
    });
  }

  onBookRoom() {
    if (this.selectedRoomDetail() && this.searchForm.valid) {
      // Navigate to booking request with pre-filled data
      const formData = this.searchForm.value;
      const queryParams = {
        maLoaiPhong: formData.maLoaiPhong,
        thoiGianBatDau: formData.thoiGianBatDau,
        soLuong: formData.sucChuaToiThieu,
        maPhong: this.selectedRoomDetail()!.maPhong,
      };

      this.router.navigate(['/booking/create'], { queryParams });
    }
  }

  closeRoomDetail() {
    this.selectedRoomDetail.set(null);
  }

  private markFormGroupTouched() {
    Object.keys(this.searchForm.controls).forEach((key) => {
      const control = this.searchForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.searchForm.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return 'Trường này là bắt buộc';
      }
      if (field.errors['min']) {
        return `Giá trị tối thiểu là ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Giá trị tối đa là ${field.errors['max'].max}`;
      }
    }
    return null;
  }

  resetSearch() {
    this.searchForm.reset();
    this.availableRooms.set([]);
    this.selectedRoomDetail.set(null);
    this.errorMessage.set(null);
    
    // Reset to default date and time
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const defaultDateTime = now.toISOString().slice(0, 16);
    this.searchForm.patchValue({ 
      thoiGianBatDau: defaultDateTime,
      sucChuaToiThieu: 1,
      thoiGianSuDung: 1
    });
  }

  goBack(): void {
    window.history.back();
  }
}
