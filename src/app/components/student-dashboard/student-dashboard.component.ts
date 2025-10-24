import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-placeholder">
              <i class="fas fa-university"></i>
            </div>
            <div class="system-info">
              <h1>Thư viện điện tử HUIT</h1>
              <p>Khu vực sinh viên</p>
            </div>
          </div>
          <div class="user-section">
            <div class="user-info" (click)="router.navigate(['/profile'])" style="cursor:pointer;">
              <i class="fas fa-user-graduate"></i>
              <div>
                <p class="user-name">{{ authService.currentUser()?.hoTen }}</p>
                <p class="user-code">{{ authService.currentUser()?.maCode }}</p>
              </div>
            </div>
            <button class="logout-btn" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="welcome-section">
          <h2>Chào mừng, {{ authService.currentUser()?.hoTen }}!</h2>
          <p>Bạn đang truy cập với quyền sinh viên — Trung tâm Thông tin Thư viện</p>
        </div>

        <div class="features-grid">
          <!-- Row 1 -->
          <div
            class="feature-card feature-search"
            (click)="router.navigate(['/search'])"
            style="cursor:pointer;"
          >
            <div class="icon-circle cold">
              <i class="fas fa-search"></i>
            </div>
            <h3>Tìm kiếm</h3>
            <p>Tìm sách, tài liệu và nguồn học</p>
          </div>

          <div
            class="feature-card feature-room"
            (click)="router.navigate(['/booking/create'])"
            style="cursor:pointer;"
          >
            <div class="icon-circle warm">
              <i class="fas fa-door-open"></i>
            </div>
            <h3>Đặt phòng</h3>
            <p>Yêu cầu phòng học/nhóm</p>
          </div>

          <div
            class="feature-card feature-loans"
            (click)="router.navigate(['/loans'])"
            style="cursor:pointer;"
          >
            <div class="icon-circle cold">
              <i class="fas fa-book-reader"></i>
            </div>
            <h3>Phòng Nhận / Mượn</h3>
            <p>Danh sách sách đang mượn & quản lý</p>
          </div>

          <!-- Row 2 -->
          <div class="feature-card feature-history">
            <div class="icon-circle warm">
              <i class="fas fa-history"></i>
            </div>
            <h3>Lịch sử mượn</h3>
            <p>Xem lịch sử mượn tài liệu</p>
          </div>

          <div class="feature-card feature-fav">
            <div class="icon-circle cold">
              <i class="fas fa-heart"></i>
            </div>
            <h3>Yêu thích</h3>
            <p>Danh sách sách bạn đã đánh dấu</p>
          </div>

          <div
            class="feature-card feature-notify"
            (click)="router.navigate(['/notifications'])"
            style="cursor:pointer;"
          >
            <div class="icon-circle warm">
              <i class="fas fa-bell"></i>
            </div>
            <h3>Thông báo</h3>
            <p>Cập nhật từ thư viện</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        background: #f8f9fa;
      }

      .dashboard-header {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        padding: 20px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .logo-placeholder {
        width: 60px;
        height: 60px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        color: #2a5298;
      }

      .system-info h1 {
        font-size: 24px;
        margin: 0;
        font-weight: 600;
      }

      .system-info p {
        margin: 5px 0 0 0;
        opacity: 0.9;
        font-size: 14px;
      }

      .user-section {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .user-info i {
        font-size: 24px;
        color: #74b9ff;
      }

      .user-name {
        font-weight: 600;
        margin: 0;
        font-size: 16px;
      }

      .user-code {
        margin: 0;
        opacity: 0.8;
        font-size: 14px;
      }

      .logout-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 10px 16px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .logout-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .dashboard-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .welcome-section {
        text-align: center;
        margin-bottom: 40px;
      }

      .welcome-section h2 {
        color: #213547;
        font-size: 34px;
        margin: 0 0 8px 0;
        font-weight: 700;
      }

      .welcome-section p {
        color: #66788a;
        font-size: 15px;
        margin: 0;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
      }

      .feature-card {
        background: linear-gradient(180deg, #ffffff, #fffdf9);
        padding: 22px 20px;
        border-radius: 14px;
        box-shadow: 0 6px 20px rgba(13, 38, 63, 0.06);
        text-align: center;
        transition: transform 0.22s ease, box-shadow 0.22s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        min-height: 160px;
      }

      .feature-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 14px 40px rgba(13, 38, 63, 0.12);
      }

      .icon-circle {
        width: 74px;
        height: 74px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 28px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
      }

      .icon-circle.cold {
        background: linear-gradient(135deg, #2aa4f4, #1e78d7);
      }
      .icon-circle.warm {
        background: linear-gradient(135deg, #ff7a18, #ff4e00);
      }

      .feature-card h3 {
        color: #223443;
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }

      .feature-card p {
        color: #6b7b86;
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
      }

      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 20px;
        }

        .user-section {
          width: 100%;
          justify-content: space-between;
        }

        .features-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class StudentDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}
