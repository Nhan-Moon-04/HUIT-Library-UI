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
  captchaText = signal<string>('');

  constructor() {
    this.loginForm = this.fb.group({
      maDangNhap: ['', [Validators.required]],
      matKhau: ['', [Validators.required, Validators.minLength(6)]],
      captcha: ['', [Validators.required]],
    });

    // Redirect nếu đã đăng nhập
    if (this.authService.isLoggedIn()) {
      const user = this.authService.currentUser();
      if (user) {
        this.navigateByRole(user.vaiTro);
      }
    }
    // tạo mã captcha lần đầu
    this.generateCaptcha();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      // kiểm tra captcha trước
      const entered = (this.loginForm.get('captcha')?.value || '').toString().trim().toUpperCase();
      if (entered !== this.captchaText()) {
        this.errorMessage.set('Mã captcha không đúng. Vui lòng thử lại.');
        // đánh dấu captcha là touched để hiện lỗi
        this.loginForm.get('captcha')?.setErrors({ incorrect: true });
        this.loginForm.get('captcha')?.markAsTouched();
        // thay đổi captcha sau khi nhập sai
        this.generateCaptcha();
        // xóa mật khẩu để người dùng nhập lại
        this.loginForm.get('matKhau')?.setValue('');
        this.loginForm.get('matKhau')?.markAsUntouched();
        return;
      }
      this.errorMessage.set('');
      const loginData: LoginRequest = this.loginForm.value;

      // Rely on authService.isLoading() (managed with finalize()) to control UI disabled state.
      this.authService.login(loginData).subscribe({
        next: (response) => {
          if (response.success) {
            // AuthService sẽ tự động điều hướng
          }
        },
        error: (error) => {
          // Show server-provided message when available
          this.errorMessage.set(error?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
          // refresh captcha on any server-side login failure (wrong credentials, etc.)
          this.generateCaptcha();
          // clear password so user can retype
          this.loginForm.get('matKhau')?.setValue('');
          this.loginForm.get('matKhau')?.markAsUntouched();
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

  /** Generate a random captcha (5 chars) and set it */
  generateCaptcha(): void {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.captchaText.set(code);
    // reset captcha field when generating a new code
    this.loginForm.get('captcha')?.setValue('');
    this.loginForm.get('captcha')?.markAsUntouched();
    this.loginForm.get('captcha')?.setErrors(null);
  }

  refreshCaptcha(): void {
    this.generateCaptcha();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        if (fieldName === 'maDangNhap') return 'Mã đăng nhập không được để trống';
        if (fieldName === 'matKhau') return 'Mật khẩu không được để trống';
        if (fieldName === 'captcha') return 'Vui lòng nhập mã captcha';
      }
      if (field.errors['incorrect']) {
        return 'Mã captcha không đúng';
      }
      if (field.errors['minlength']) {
        return 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }
    return '';
  }
}
