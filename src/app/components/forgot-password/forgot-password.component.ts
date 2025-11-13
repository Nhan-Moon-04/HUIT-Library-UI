import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup;
  message = signal<string>('');
  isSending = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendReset(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.message.set('');
    this.isSending.set(true);

    const email = this.form.value.email;

    // Call AuthService - method added below
    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isSending.set(false);
        this.message.set(res?.message || 'Vui lòng kiểm tra email để lấy lại mật khẩu');
      },
      error: (err) => {
        this.isSending.set(false);
        this.message.set(err.error?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại sau.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
