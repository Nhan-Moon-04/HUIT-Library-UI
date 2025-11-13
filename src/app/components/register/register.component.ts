import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest, VaiTro } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  vaiTroOptions: { value: VaiTro; label: string }[] = [
    { value: 'SINH_VIEN', label: 'Sinh viên' },
    { value: 'NHAN_VIEN', label: 'Nhân viên' },
  ];

  khoaHocOptions: string[] = ['2024', '2023', '2022', '2021', '2020'];

  constructor() {
    this.registerForm = this.fb.group({
      hoTen: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      matKhau: ['', [Validators.required, Validators.minLength(6)]],
      xacNhanMatKhau: ['', [Validators.required]],
      soDienThoai: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      maSinhVien: ['', [Validators.required]],
      lop: ['', [Validators.required]],
      khoaHoc: ['2024', [Validators.required]],
      vaiTro: ['SINH_VIEN', [Validators.required]],
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
    if (this.registerForm.valid) {
      if (this.registerForm.value.matKhau !== this.registerForm.value.xacNhanMatKhau) {
        this.errorMessage.set('Mật khẩu xác nhận không khớp');
        return;
      }

      this.errorMessage.set('');
      const registerData: RegisterRequest = {
        hoTen: this.registerForm.value.hoTen,
        email: this.registerForm.value.email,
        matKhau: this.registerForm.value.matKhau,
        soDienThoai: this.registerForm.value.soDienThoai,
        maSinhVien: this.registerForm.value.maSinhVien,
        lop: this.registerForm.value.lop,
        khoaHoc: this.registerForm.value.khoaHoc,
        vaiTro: this.registerForm.value.vaiTro,
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          if (response.success) {
            // AuthService sẽ tự động điều hướng
          }
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
    Object.keys(this.registerForm.controls).forEach((key) => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return this.getFieldDisplayName(fieldName) + ' không được để trống';
      }
      if (field.errors['email']) {
        return 'Email không hợp lệ';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} phải có ít nhất ${requiredLength} ký tự`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'soDienThoai') {
          return 'Số điện thoại phải có 10-11 chữ số';
        }
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      hoTen: 'Họ tên',
      email: 'Email',
      matKhau: 'Mật khẩu',
      xacNhanMatKhau: 'Xác nhận mật khẩu',
      soDienThoai: 'Số điện thoại',
      maSinhVien: 'Mã sinh viên',
      lop: 'Lớp',
      khoaHoc: 'Khóa học',
      vaiTro: 'Vai trò',
    };
    return fieldNames[fieldName] || fieldName;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
