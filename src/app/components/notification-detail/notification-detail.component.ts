import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.css'],
})
export class NotificationDetailComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  notification = signal<Notification | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadNotification(Number(id));
    } else {
      this.error.set('ID thông báo không hợp lệ.');
    }
  }

  loadNotification(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.notificationService.getNotificationById(id).subscribe({
      next: (notification) => {
        this.notification.set(notification);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải thông tin thông báo.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/notifications']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
