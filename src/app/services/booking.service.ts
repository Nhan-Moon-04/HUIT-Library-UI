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

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  createBooking(payload: CreateBookingPayload): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/Booking/create`, payload);
  }
}
