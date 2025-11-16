import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ViolationDetail {
  ghiChu: string;
  nguoiLapBienBan: string;
  maViPham: number;
  tenViPham: string;
  moTa: string;
  ngayLap: string;
  trangThaiXuLy: string;
  maDangKy: number;
  tenPhong: string;
  thoiGianViPham: string;
}

export interface ViolationDetailResponse {
  success: boolean;
  data: ViolationDetail;
  message?: string;
}

export interface ViolationListItem {
  maViPham: number;
  tenViPham: string;
  ngayLap: string;
  trangThaiXuLy: string;
  moTaNgan: string;
}

export interface ViolationListResponse {
  success: boolean;
  data: ViolationListItem[];
  count: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ViolationService {
  private http = inject(HttpClient);

  /** Get violation details by maViPham */
  getViolationDetail(maViPham: number): Observable<ViolationDetailResponse> {
    return this.http.get<ViolationDetailResponse>(
      `${environment.appUrl}/api/v2/Violation/details/${maViPham}`
    );
  }

  /** Get violations by booking ID */
  getViolationsByBooking(maDangKy: number): Observable<ViolationListResponse> {
    return this.http.get<ViolationListResponse>(
      `${environment.appUrl}/api/v2/Violation/booking/${maDangKy}`
    );
  }

  /** Format violation date for display */
  formatViolationDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  }

  /** Get violation status color */
  getViolationStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'chưa xử lý':
        return '#f44336'; // Red
      case 'đang xử lý':
        return '#ff9800'; // Orange
      case 'đã xử lý':
        return '#4caf50'; // Green
      default:
        return '#666666'; // Gray
    }
  }

  /** Get violation status icon */
  getViolationStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'chưa xử lý':
        return 'fa-exclamation-triangle';
      case 'đang xử lý':
        return 'fa-clock';
      case 'đã xử lý':
        return 'fa-check-circle';
      default:
        return 'fa-info-circle';
    }
  }
}
