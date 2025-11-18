import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
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
    const headers = this.getAuthHeaders();

    return this.http
      .get<ViolationDetailResponse>(`${environment.appUrl}/api/v2/Violation/details/${maViPham}`, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching violation detail:', error);
          let errorMessage = 'Có lỗi xảy ra khi lấy thông tin vi phạm';

          if (error.status === 404) {
            errorMessage = 'Không tìm thấy thông tin vi phạm';
          } else if (error.status === 401) {
            errorMessage = 'Không có quyền truy cập thông tin vi phạm';
          } else if (error.status === 500) {
            errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau';
          }

          return of({
            success: false,
            data: {} as ViolationDetail,
            message: errorMessage,
          });
        })
      );
  }

  /** Get violations by booking ID */
  getViolationsByBooking(maDangKy: number): Observable<ViolationListResponse> {
    const headers = this.getAuthHeaders();

    return this.http
      .get<ViolationListResponse>(`${environment.appUrl}/api/v2/Violation/booking/${maDangKy}`, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching violations:', error);
          return of({
            success: false,
            data: [],
            count: 0,
            message: 'Không thể tải danh sách vi phạm',
          });
        })
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

  /** Get severity based on violation type */
  getViolationSeverity(violationType: string): string {
    const lowerType = violationType.toLowerCase();

    if (
      lowerType.includes('mất') ||
      lowerType.includes('phá hoại') ||
      lowerType.includes('hư hỏng')
    ) {
      return 'Nghiêm trọng';
    } else if (lowerType.includes('mang') && lowerType.includes('ra khỏi')) {
      return 'Trung bình';
    } else {
      return 'Nhẹ';
    }
  }

  /** Get severity color */
  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'nghiêm trọng':
        return '#d32f2f'; // Red
      case 'trung bình':
        return '#f57c00'; // Orange
      case 'nhẹ':
        return '#388e3c'; // Green
      default:
        return '#616161'; // Gray
    }
  }

  /** Get auth headers */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }
}
