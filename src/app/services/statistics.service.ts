import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StatisticsOverview {
  tongLuotTruyCap: number;
  soLuongOnline: number;
  thanhVienOnline: number;
  khachOnline: number;
  trongNgay: number;
  homQua: number;
  trongThang: number;
}

export interface StatisticsResponse {
  success: boolean;
  data: StatisticsOverview;
  message: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.appUrl}/api`;

  /**
   * Lấy thống kê tổng quan
   */
  getOverview(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.baseUrl}/Statistics/overview`);
  }

  /**
   * Ghi nhận lượt truy cập
   */
  recordVisit(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/Statistics/visit`, {});
  }

  /**
   * Cập nhật trạng thái online
   */
  updateOnlineStatus(isOnline: boolean): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/Statistics/online-status?isOnline=${isOnline}`,
      {}
    );
  }
}
