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

  profile = signal<any>(null);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.fetchProfile(user.maNguoiDung);
    }
  }

  fetchProfile(userId: number): void {
    this.loading.set(true);
    this.profileService.getProfile(userId).subscribe({
      next: (res) => {
        this.profile.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  editProfile(): void {
    const p = this.profile();
    this.form = this.fb.group({
      fullName: [p?.hoTen || '', [Validators.required]],
      email: [p?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [p?.soDienThoai || '', [Validators.required]],
    });
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser();
    if (!user) return;

    const payload = {
      userId: user.maNguoiDung,
      fullName: this.form.value.fullName,
      email: this.form.value.email,
      phoneNumber: this.form.value.phoneNumber,
    };

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        // refresh profile
        this.fetchProfile(user.maNguoiDung);
        this.editMode.set(false);
      },
      error: () => {
        // keep edit mode and show error if needed
      },
    });
  }
}
