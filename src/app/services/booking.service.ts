import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateBookingPayload {
  maLoaiPhong: number;
  thoiGianBatDau: string; // ISO string
  thoiGianKetThuc: string; // ISO string
  lyDo?: string;
}

export interface LoaiPhong {
  maLoaiPhong: number;
  tenLoaiPhong: string;
  viTri: string;
  moTa: string;
  trangThietBi: string;
  soLuongChoNgoi: string;
  thoiGianSuDung: string;
  thoiLuongToiDa: number | null;
  phongs: any[];
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  createBooking(payload: CreateBookingPayload): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/Booking/create`, payload);
  }

  getRoomTypes(): Observable<LoaiPhong[]> {
    return this.http.get<LoaiPhong[]>(`${environment.appUrl}/api/LoaiPhong/getall`);
  }
}
