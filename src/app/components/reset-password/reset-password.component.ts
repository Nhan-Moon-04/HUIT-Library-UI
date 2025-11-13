import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);
  form: FormGroup;
  token = signal<string | null>(null);
  message = signal<string>('');
  isSubmitting = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    // Try to read token from several possible locations: query param, fragment, or full URL
    this.route.queryParamMap.subscribe((params) => {
      const t = params.get('token');
      if (t) {
        this.token.set(t);
      } else {
        // try fragment e.g. #token=...
        this.route.fragment.subscribe((frag) => {
          if (frag) {
            const m = frag.match(/token=([^&]+)/);
            if (m) this.token.set(m[1]);
          }
        });

        // as a last resort, try parsing window.location.href for token param
        try {
          const url = window.location.href;
          const q = new URL(url).searchParams.get('token');
          if (q) this.token.set(q);
        } catch (e) {
          // ignore
        }
      }
    });
  }

  submit(): void {
    if (!this.token()) {
      this.message.set('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (this.form.invalid || this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.form.markAllAsTouched();
      if (this.form.value.newPassword !== this.form.value.confirmPassword) {
        this.message.set('Mật khẩu xác nhận không khớp.');
      }
      return;
    }

    this.isSubmitting.set(true);
    this.message.set('');

    const payload = {
      token: this.token()!,
      newPassword: this.form.value.newPassword,
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.message.set(res?.message || 'Đặt lại mật khẩu thành công.');
        // Optional: redirect to login after success
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.message.set(err?.error?.message || 'Đặt lại mật khẩu thất bại.');
      },
    });
  }
}
