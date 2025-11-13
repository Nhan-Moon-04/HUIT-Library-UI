import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  maThongBao: number;
  tieuDe: string;
  noiDung: string;
  thoiGian: string;
  daDoc: boolean;
  ghiChu?: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.appUrl}/api/Notification/list`);
  }

  getNotificationById(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${environment.appUrl}/api/Notification/${id}`);
  }
}
