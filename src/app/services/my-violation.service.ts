import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MyViolation,
  MyViolationDetail,
  MyViolationListResponse,
  MyViolationDetailResponse,
} from '../models/my-violation.model';
import { environment } from '../../environments/environment';
import { DateTimeUtils } from '../utils/datetime.utils';

@Injectable({
  providedIn: 'root',
})
export class MyViolationService {
  private readonly baseUrl = `${environment.apiUrl}/api/v2/Violation`;

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách vi phạm của sinh viên hiện tại
   */
  getMyViolations(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<MyViolationListResponse> {
    const requestBody = {
      pageNumber: pageNumber,
      pageSize: pageSize,
    };

    return this.http.post<MyViolationListResponse>(`${this.baseUrl}/my-violations`, requestBody);
  }

  /**
   * Lấy chi tiết vi phạm
   */
  getViolationDetail(maViPham: number): Observable<MyViolationDetailResponse> {
    return this.http.get<MyViolationDetailResponse>(`${this.baseUrl}/details/${maViPham}`);
  }

  /**
   * Format ngày tháng cho vi phạm
   */
  formatViolationDate(dateString: string): string {
    return DateTimeUtils.formatDateTime(dateString);
  }

  /**
   * Lấy màu sắc theo trạng thái xử lý
   */
  getStatusColor(trangThaiXuLy: string): string {
    switch (trangThaiXuLy.toLowerCase()) {
      case 'chưa xử lý':
        return '#ff9800'; // Orange
      case 'đang xử lý':
        return '#2196f3'; // Blue
      case 'đã xử lý':
        return '#4caf50'; // Green
      case 'từ chối':
        return '#f44336'; // Red
      default:
        return '#6c757d'; // Gray
    }
  }

  /**
   * Lấy icon theo trạng thái xử lý
   */
  getStatusIcon(trangThaiXuLy: string): string {
    switch (trangThaiXuLy.toLowerCase()) {
      case 'chưa xử lý':
        return 'fa-clock';
      case 'đang xử lý':
        return 'fa-spinner';
      case 'đã xử lý':
        return 'fa-check-circle';
      case 'từ chối':
        return 'fa-times-circle';
      default:
        return 'fa-question-circle';
    }
  }

  /**
   * Lấy class CSS theo trạng thái xử lý
   */
  getStatusClass(trangThaiXuLy: string): string {
    switch (trangThaiXuLy.toLowerCase()) {
      case 'chưa xử lý':
        return 'status-pending';
      case 'đang xử lý':
        return 'status-processing';
      case 'đã xử lý':
        return 'status-completed';
      case 'từ chối':
        return 'status-rejected';
      default:
        return 'status-unknown';
    }
  }
}
