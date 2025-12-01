import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  router = inject(Router);

  form: FormGroup;
  message = signal<string>('');
  messageType = signal<'success' | 'error'>('success');
  isSubmitting = signal<boolean>(false);
  loading = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatch }
    );
  }

  private passwordsMatch(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return newPass === confirm ? null : { mismatch: true };
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form?.get(fieldName);
    const hasFormError = !!(field && field.invalid && (field.dirty || field.touched));
    const hasMismatchError =
      fieldName === 'confirmPassword' && this.form.errors?.['mismatch'] && field?.touched;
    return hasFormError || hasMismatchError;
  }

  getFieldError(fieldName: string): string {
    const field = this.form?.get(fieldName);

    // Check for password mismatch error first
    if (fieldName === 'confirmPassword' && this.form.errors?.['mismatch'] && field?.touched) {
      return 'Mật khẩu xác nhận không khớp';
    }

    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return this.getRequiredMessage(fieldName);
    }
    if (field.errors['minlength']) {
      return `Tối thiểu ${field.errors['minlength'].requiredLength} ký tự`;
    }
    return '';
  }

  private getRequiredMessage(fieldName: string): string {
    switch (fieldName) {
      case 'currentPassword':
        return 'Mật khẩu hiện tại là bắt buộc';
      case 'newPassword':
        return 'Mật khẩu mới là bắt buộc';
      case 'confirmPassword':
        return 'Xác nhận mật khẩu là bắt buộc';
      default:
        return 'Trường này là bắt buộc';
    }
  }

  getMessageClass(): string {
    return this.messageType() === 'success' ? 'success-message' : 'error-message-box';
  }

  getMessageIcon(): string {
    return this.messageType() === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
  }

  resetForm(): void {
    this.form.reset();
    this.message.set('');
    this.messageType.set('success');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Check if user is logged in
    const user = this.authService.currentUser();
    if (!user) {
      this.messageType.set('error');
      this.message.set('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    this.message.set('');
    this.isSubmitting.set(true);

    const payload = {
      currentPassword: this.form.value.currentPassword.trim(),
      newPassword: this.form.value.newPassword.trim(),
    };

    this.authService.changePassword(payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.messageType.set('success');
        this.message.set(response?.message || 'Đổi mật khẩu thành công.');
        this.form.reset();

        // Optional: Auto redirect after successful password change
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (error) => {
        console.error('Change password error:', error);
        this.isSubmitting.set(false);
        this.messageType.set('error');

        // Handle different types of errors
        let errorMessage = 'Đổi mật khẩu thất bại. Vui lòng thử lại.';

        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Mật khẩu hiện tại không đúng.';
        } else if (error.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (error.status === 0) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng thử lại sau.';
        }

        this.message.set(errorMessage);
      },
    });
  }
}
