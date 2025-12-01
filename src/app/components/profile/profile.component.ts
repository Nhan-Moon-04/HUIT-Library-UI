import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  auth = inject(AuthService);
  router = inject(Router);
  private fb = inject(FormBuilder);

  editMode = signal<boolean>(false);
  form!: FormGroup;
  serverErrors = signal<any>({});
  generalErrorMessage = signal<string>('');

  profile = signal<any>(null);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user && user.maNguoiDung) {
      this.fetchProfile(user.maNguoiDung);
    } else {
      console.error('User not found or missing ID');
      this.profile.set(null);
    }
  }

  fetchProfile(userId: number): void {
    this.loading.set(true);
    this.profileService.getProfile(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profile.set(response.data);
        } else {
          console.error('Failed to fetch profile:', response);
          this.profile.set(null);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
        this.profile.set(null);
        this.loading.set(false);
      },
    });
  }

  editProfile(): void {
    const p = this.profile();
    this.form = this.fb.group({
      fullName: [
        p?.hoTen || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      email: [p?.email || '', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phoneNumber: [
        p?.soDienThoai || '',
        [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)],
      ],
    });
    // Clear previous errors
    this.serverErrors.set({});
    this.generalErrorMessage.set('');
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.serverErrors.set({});
    this.generalErrorMessage.set('');
    this.editMode.set(false);
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    // Clear previous errors
    this.serverErrors.set({});
    this.generalErrorMessage.set('');

    const formValue = this.form.value;
    const payload = {
      userId: user.maNguoiDung,
      fullName: formValue.fullName?.trim(),
      email: formValue.email?.trim(),
      phoneNumber: formValue.phoneNumber?.trim(),
    };

    this.loading.set(true);
    this.profileService.updateProfile(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.fetchProfile(user.maNguoiDung);
          this.editMode.set(false);
        } else {
          // Handle validation errors from server
          this.handleServerErrors(response);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        if (error.error && !error.error.success) {
          this.handleServerErrors(error.error);
        } else {
          this.generalErrorMessage.set('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
        }
        this.loading.set(false);
      },
    });
  }

  private handleServerErrors(errorResponse: any): void {
    if (errorResponse.errors) {
      // Map server field names to our form field names
      const fieldMapping: { [key: string]: string } = {
        FullName: 'fullName',
        Email: 'email',
        PhoneNumber: 'phoneNumber',
      };

      const mappedErrors: { [key: string]: string[] } = {};

      Object.keys(errorResponse.errors).forEach((serverFieldName) => {
        const formFieldName = fieldMapping[serverFieldName] || serverFieldName.toLowerCase();
        mappedErrors[formFieldName] = errorResponse.errors[serverFieldName];
      });

      this.serverErrors.set(mappedErrors);
    }

    // Don't show general error message, only field-specific errors
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form?.get(fieldName);
    const hasFormError = !!(field && field.invalid && (field.dirty || field.touched));
    const hasServerError = !!(
      this.serverErrors()[fieldName] && this.serverErrors()[fieldName].length > 0
    );
    return hasFormError || hasServerError;
  }

  getFieldError(fieldName: string): string {
    // Prioritize server errors over client validation errors
    const serverFieldErrors = this.serverErrors()[fieldName];
    if (serverFieldErrors && serverFieldErrors.length > 0) {
      return serverFieldErrors[0]; // Return first server error
    }

    const field = this.form?.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return this.getRequiredMessage(fieldName);
    }
    if (field.errors['email']) {
      return 'Email không hợp lệ';
    }
    if (field.errors['minlength']) {
      return `Tối thiểu ${field.errors['minlength'].requiredLength} ký tự`;
    }
    if (field.errors['maxlength']) {
      return `Tối đa ${field.errors['maxlength'].requiredLength} ký tự`;
    }
    if (field.errors['pattern']) {
      return 'Số điện thoại không hợp lệ (10-11 số)';
    }
    return '';
  }

  private getRequiredMessage(fieldName: string): string {
    switch (fieldName) {
      case 'fullName':
        return 'Họ và tên là bắt buộc';
      case 'email':
        return 'Email là bắt buộc';
      case 'phoneNumber':
        return 'Số điện thoại là bắt buộc';
      default:
        return 'Trường này là bắt buộc';
    }
  }

  getRoleName(roleCode: number | string): string {
    const roleMap: { [key: number]: string } = {
      1: 'Quản trị viên',
      2: 'Nhân viên',
      3: 'Giảng viên',
      4: 'Sinh viên',
    };

    if (typeof roleCode === 'number') {
      return roleMap[roleCode] || 'Không xác định';
    }

    return roleCode || 'Không xác định';
  }
}
