import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);

  getProfile(userId: number): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/ProfileUser/get-profile`, { userId });
  }

  updateProfile(payload: {
    userId: number;
    fullName: string;
    email: string;
    phoneNumber: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/ProfileUser/update-profile`, payload);
  }
}
