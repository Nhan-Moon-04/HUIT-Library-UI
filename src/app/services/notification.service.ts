import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  maThongBao: number;
  maNguoiDung: number;
  tieuDe: string;
  noiDung: string;
  ngayTao: string;
  daDoc: boolean;
  loaiThongBao?: string | null;
}

export interface NotificationDetail {
  maThongBao: number;
  tieuDe: string;
  noiDung: string;
  thoiGian: string;
  daDoc: boolean;
  ghiChu?: string | null;
}

export interface NotificationDetailResponse {
  success: boolean;
  data: NotificationDetail;
  message: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
}

export interface NotificationCountResponse {
  success: boolean;
  count: number;
  message: string;
}

export interface MarkAllReadResponse {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  getNotifications(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<NotificationListResponse> {
    return this.http.get<NotificationListResponse>(
      `${environment.appUrl}/api/Notification/list?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  getRecentNotifications(): Observable<NotificationListResponse> {
    return this.http.get<NotificationListResponse>(
      `${environment.appUrl}/api/Notification/list?pageNumber=1&pageSize=5`
    );
  }

  getNotificationById(id: number): Observable<NotificationDetailResponse> {
    return this.http.post<NotificationDetailResponse>(
      `${environment.appUrl}/api/Notification/NotificationDetail`,
      id
    );
  }

  getUnreadCount(): Observable<NotificationCountResponse> {
    return this.http.get<NotificationCountResponse>(`${environment.appUrl}/api/Notification/count`);
  }

  markAllAsRead(): Observable<MarkAllReadResponse> {
    return this.http.post<MarkAllReadResponse>(
      `${environment.appUrl}/api/Notification/mark-all-read`,
      {}
    );
  }

  markAsRead(notificationId: number): Observable<MarkAllReadResponse> {
    return this.http.post<MarkAllReadResponse>(
      `${environment.appUrl}/api/Notification/${notificationId}/mark-read`,
      {}
    );
  }

  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }
}
