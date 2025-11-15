import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = environment.appUrl;

  // Chat với bot
  sendMessage(maPhienChat: number, noiDung: string): Observable<any> {
    const body = { maPhienChat, noiDung };
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })
      : new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(`${this.base}/api/Chat/bot/message/send`, body, { headers });
  }

  // Chat với nhân viên
  sendMessageToStaff(maPhienChat: number, noiDung: string): Observable<any> {
    const body = { maPhienChat, noiDung };
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })
      : new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(`${this.base}/api/Chat/message/send`, body, { headers });
  }

  // Tạo phiên chat với nhân viên
  createStaffSession(): Observable<any> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })
      : new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(`${this.base}/api/Chat/session/create`, {}, { headers });
  }

  // Lấy danh sách các phiên chat của user
  getUserSessions(): Observable<any> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<any>(`${this.base}/api/Chat/user/sessions`, { headers });
  }

  // Lấy tin nhắn của một phiên chat cụ thể
  getSessionMessages(maPhienChat: number): Observable<any> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<any>(`${this.base}/api/Chat/session/${maPhienChat}/messages`, { headers });
  }

  // Lấy tin nhắn với phân trang
  getSessionMessagesWithPagination(
    maPhienChat: number,
    page: number = 1,
    pageSize: number = 50
  ): Observable<any> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    const params = { page: page.toString(), pageSize: pageSize.toString() };
    return this.http.get<any>(`${this.base}/api/Chat/session/${maPhienChat}/messages`, {
      headers,
      params,
    });
  }

  getLatestSessionWithMessages(): Observable<any> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<any>(`${this.base}/api/Chat/user/latest-with-messages`, { headers });
  }

  // Load phiên chat nhân viên mới nhất cùng với tin nhắn
  getLatestStaffSessionWithMessages(): Observable<any> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<any>(`${this.base}/api/Chat/staff/latest-with-messages-staff`, {
      headers,
    });
  }

  // Lấy toàn bộ phiên chat với nhân viên của user
  getAllStaffSessions(): Observable<any> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<any>(`${this.base}/api/Chat/user/staff-sessions`, {
      headers,
    });
  }
}
