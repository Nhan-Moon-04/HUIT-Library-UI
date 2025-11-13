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
  private router = inject(Router);

  form: FormGroup;
  message = signal<string>('');
  isSubmitting = signal<boolean>(false);

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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.message.set('');
    this.isSubmitting.set(true);

    const payload = {
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword,
    };

    // Placeholder API call — you will wire the real endpoint later
    this.authService.changePassword(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.message.set(res?.message || 'Đổi mật khẩu thành công.');
        // Optional: redirect to dashboard or login
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.message.set(err?.error?.message || 'Đổi mật khẩu thất bại.');
      },
    });
  }
}
