import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals để quản lý state
  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  constructor() {
    // Khôi phục trạng thái đăng nhập từ localStorage
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('current_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.http.post<AuthResponse>(`${environment.appUrl}/api/Auth/login`, loginData).pipe(
      tap((response) => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.http
      .post<AuthResponse>(`${environment.appUrl}/api/Auth/register`, registerData)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.handleAuthSuccess(response);
          }
        }),
        finalize(() => this.isLoading.set(false))
      );
  }

  // Gửi yêu cầu lấy lại mật khẩu
  forgotPassword(email: string): Observable<any> {
    this.isLoading.set(true);
    return this.http
      .post<any>(`${environment.appUrl}/api/Auth/forgot-password`, { email })
      .pipe(finalize(() => this.isLoading.set(false)));
  }

  // Thay đổi mật khẩu (placeholder) - payload: { currentPassword, newPassword }
  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<any> {
    this.isLoading.set(true);
    // Bạn sẽ gán endpoint thực tế sau; hiện tại gọi tới placeholder API
    return this.http
      .post<any>(`${environment.appUrl}/api/Auth/change-password`, payload)
      .pipe(finalize(() => this.isLoading.set(false)));
  }

  // Reset password using token from forgot-password email
  resetPassword(payload: { token: string; newPassword: string }): Observable<any> {
    this.isLoading.set(true);
    return this.http
      .post<any>(`${environment.appUrl}/api/Auth/reset-password`, payload)
      .pipe(finalize(() => this.isLoading.set(false)));
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('current_user', JSON.stringify(response.user));

    this.currentUser.set(response.user);
    this.isLoggedIn.set(true);

    // Điều hướng dựa trên vai trò
    this.navigateByRole(response.user.vaiTro);
  }

  private navigateByRole(vaiTro: string): void {
    switch (vaiTro) {
      case 'SINH_VIEN':
        this.router.navigate(['/student-dashboard']);
        break;
      case 'NHAN_VIEN':
        this.router.navigate(['/staff-dashboard']);
        break;
      case 'QUAN_LY':
        this.router.navigate(['/admin-dashboard']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.vaiTro === role;
  }
}
