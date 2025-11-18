import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RatingDetail {
  maDanhGia: number;
  diemDanhGia: number;
  noiDung: string | null;
  ngayDanhGia: string;
  tenPhong: string;
  tenNguoiDung: string;
}

export interface CreateRatingPayload {
  maDoiTuong: number; // MaPhong
  diemDanhGia: number; // 1-5 stars
  noiDung?: string;
  maDangKy: number; // Booking ID
}

export interface RatingResponse {
  success: boolean;
  hasRating: boolean;
  rating?: RatingDetail;
}

export interface CreateRatingResponse {
  success: boolean;
  message: string;
  maDanhGia: number;
}

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private http = inject(HttpClient);

  /** Get rating detail by booking ID */
  getRatingByBooking(maDangKy: number): Observable<RatingResponse> {
    return this.http.get<RatingResponse>(
      `${environment.appUrl}/api/Rating/booking-rating/${maDangKy}`
    );
  }

  /** Create a new rating */
  createRating(payload: CreateRatingPayload): Observable<CreateRatingResponse> {
    return this.http.post<CreateRatingResponse>(`${environment.appUrl}/api/Rating`, payload);
  }
}
