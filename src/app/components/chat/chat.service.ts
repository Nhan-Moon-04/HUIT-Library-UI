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

  sendMessage(maPhienChat: number, noiDung: string): Observable<any> {
    const body = { maPhienChat, noiDung };
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })
      : new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(`${this.base}/api/Chat/bot/message/send`, body, { headers });
  }

  getLatestSessionWithMessages(): Observable<any> {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<any>(`${this.base}/api/Chat/user/latest-with-messages`, { headers });
  }
}
