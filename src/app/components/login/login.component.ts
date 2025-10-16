import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  constructor() {
    this.loginForm = this.fb.group({
      maDangNhap: ['', [Validators.required]],
      matKhau: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Redirect nếu đã đăng nhập
    if (this.authService.isLoggedIn()) {
      const user = this.authService.currentUser();
      if (user) {
        this.navigateByRole(user.vaiTro);
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage.set('');
      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          if (response.success) {
            // AuthService sẽ tự động điều hướng
          }
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        },
      });
    } else {
      this.markFormGroupTouched();
    }
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

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'maDangNhap' ? 'Mã đăng nhập' : 'Mật khẩu'} không được để trống`;
      }
      if (field.errors['minlength']) {
        return 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }
    return '';
  }
}
